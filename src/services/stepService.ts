import { Pedometer } from 'expo-sensors';
import { Platform } from 'react-native';
import {
  initDatabase,
  saveDailySteps,
  getDailySteps,
  saveHourlySteps,
} from './database';
import {
  calculateDistanceKm,
  calculateCaloriesBurned,
  calculateActiveMinutes,
} from '../utils/calculations';
import { getTodayDateString } from '../utils/dateHelpers';
import { liveNotificationService } from './liveNotificationService';
import { useUserStore } from '../store/useUserStore';

export interface StepUpdateEvent {
  date: string;
  steps: number;
  distanceKm: number;
  calories: number;
  activeMinutes: number;
  goalReached: boolean;
  isPaused: boolean;
}

type StepUpdateListener = (event: StepUpdateEvent) => void;

class StepService {
  private listeners: Set<StepUpdateListener> = new Set();
  private subscription: Pedometer.Subscription | null = null;
  private currentDate: string = getTodayDateString();
  private currentSteps: number = 0;
  private isPaused: boolean = false;
  private midnightCheckTimer: ReturnType<typeof setInterval> | null = null;
  private isInitialized = false;

  /**
   * Initializes the StepService, database, and background synchronization.
   */
  async init(): Promise<void> {
    if (this.isInitialized) return;
    await initDatabase();

    this.currentDate = getTodayDateString();
    const todayRecord = await getDailySteps(this.currentDate);
    this.currentSteps = todayRecord ? todayRecord.steps : 0;

    this.startMidnightWatcher();
    this.isInitialized = true;
  }

  /**
   * Subscribes to step updates from the single source of truth.
   */
  subscribe(listener: StepUpdateListener): () => void {
    this.listeners.add(listener);
    // Emit initial state
    listener(this.getCurrentMetrics());
    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * Gets current state snapshot.
   */
  getCurrentMetrics(): StepUpdateEvent {
    const user = useUserStore.getState();
    const distanceKm = calculateDistanceKm(this.currentSteps, user.heightCm, user.gender);
    const calories = calculateCaloriesBurned(this.currentSteps, user.weightKg);
    const activeMinutes = calculateActiveMinutes(this.currentSteps);
    const goalReached = this.currentSteps >= user.dailyGoal && user.dailyGoal > 0;

    return {
      date: this.currentDate,
      steps: this.currentSteps,
      distanceKm,
      calories,
      activeMinutes,
      goalReached,
      isPaused: this.isPaused,
    };
  }

  /**
   * Adds steps to current day, persists to SQLite, and updates live notification.
   */
  async addSteps(amount: number): Promise<void> {
    if (this.isPaused || amount <= 0) return;

    // Check if date changed to handle midnight reset
    this.checkDateChange();

    this.currentSteps += amount;
    const metrics = this.getCurrentMetrics();
    const currentHour = new Date().getHours();

    // 1. Save to SQLite
    await saveDailySteps({
      date: this.currentDate,
      steps: metrics.steps,
      distanceKm: metrics.distanceKm,
      calories: metrics.calories,
      activeMinutes: metrics.activeMinutes,
      goalReached: metrics.goalReached,
    });
    await saveHourlySteps(this.currentDate, currentHour, metrics.steps);

    // 2. Notify all UI store listeners
    this.emit(metrics);

    // 3. Update live persistent notification (if enabled)
    const user = useUserStore.getState();
    if (user.notificationsEnabled) {
      await liveNotificationService.updateLiveStepNotification({
        steps: metrics.steps,
        goal: user.dailyGoal,
        distanceKm: metrics.distanceKm,
        calories: metrics.calories,
        activeMinutes: metrics.activeMinutes,
        units: user.units,
        language: user.language,
        isPaused: this.isPaused,
      });

      // If goal reached, fire one-time celebration alert
      if (metrics.goalReached) {
        await liveNotificationService.triggerGoalCelebrationAlert(user.dailyGoal, user.language);
      }
    }
  }

  /**
   * Manually sets steps for a specific date.
   */
  async setSteps(date: string, steps: number): Promise<void> {
    const safeSteps = Math.max(0, Math.floor(steps));
    if (date === this.currentDate) {
      this.currentSteps = safeSteps;
    }

    const user = useUserStore.getState();
    const distanceKm = calculateDistanceKm(safeSteps, user.heightCm, user.gender);
    const calories = calculateCaloriesBurned(safeSteps, user.weightKg);
    const activeMinutes = calculateActiveMinutes(safeSteps);
    const goalReached = safeSteps >= user.dailyGoal && user.dailyGoal > 0;

    await saveDailySteps({
      date,
      steps: safeSteps,
      distanceKm,
      calories,
      activeMinutes,
      goalReached,
    });

    if (date === this.currentDate) {
      this.emit(this.getCurrentMetrics());
    }
  }

  /**
   * Starts live hardware pedometer sensor tracking.
   */
  async startPedometerTracking(): Promise<boolean> {
    if (Platform.OS === 'web') return false;

    try {
      const isAvailable = await Pedometer.isAvailableAsync();
      if (!isAvailable) return false;

      const perm = await Pedometer.requestPermissionsAsync();
      if (!perm.granted) return false;

      let lastSensorStep = 0;
      this.subscription = Pedometer.watchStepCount((result) => {
        if (this.isPaused) return;
        const delta = result.steps - lastSensorStep;
        if (delta > 0 && lastSensorStep > 0) {
          this.addSteps(delta);
        }
        lastSensorStep = result.steps;
      });

      return true;
    } catch (e) {
      console.warn('Failed to start hardware pedometer tracking:', e);
      return false;
    }
  }

  /**
   * Pauses or resumes tracking.
   */
  setPaused(paused: boolean): void {
    this.isPaused = paused;
    this.emit(this.getCurrentMetrics());
  }

  /**
   * Periodic check for midnight date change.
   */
  private startMidnightWatcher(): void {
    if (this.midnightCheckTimer) clearInterval(this.midnightCheckTimer);
    // Check every 60 seconds
    this.midnightCheckTimer = setInterval(() => {
      this.checkDateChange();
    }, 60000);
  }

  /**
   * Resets counter when midnight crosses over into a new day.
   */
  private checkDateChange(): void {
    const today = getTodayDateString();
    if (today !== this.currentDate) {
      this.currentDate = today;
      this.currentSteps = 0;
      this.emit(this.getCurrentMetrics());

      // Update live notification for fresh day
      const user = useUserStore.getState();
      if (user.notificationsEnabled) {
        liveNotificationService.updateLiveStepNotification({
          steps: 0,
          goal: user.dailyGoal,
          distanceKm: 0,
          calories: 0,
          activeMinutes: 0,
          units: user.units,
          language: user.language,
          isPaused: this.isPaused,
        });
      }
    }
  }

  private emit(event: StepUpdateEvent): void {
    this.listeners.forEach((listener) => {
      try {
        listener(event);
      } catch (e) {
        console.error('Error in stepService listener:', e);
      }
    });
  }
}

export const stepService = new StepService();
