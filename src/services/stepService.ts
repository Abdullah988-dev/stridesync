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
import { nativeStepService } from './nativeStepService';
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
  private currentDate: string = getTodayDateString();
  private currentSteps: number = 0;
  private isPaused: boolean = false;
  private midnightCheckTimer: ReturnType<typeof setInterval> | null = null;
  private isInitialized = false;
  private nativeUnsubscribe: (() => void) | null = null;

  /**
   * Initializes the StepService, database, and background synchronization.
   */
  async init(): Promise<void> {
    if (this.isInitialized) return;
    await initDatabase();

    this.currentDate = getTodayDateString();
    const todayRecord = await getDailySteps(this.currentDate);
    this.currentSteps = todayRecord ? todayRecord.steps : 0;

    const user = useUserStore.getState();
    await nativeStepService.initService(user.dailyGoal || 10000);

    // Single source of truth subscription
    if (!this.nativeUnsubscribe) {
      this.nativeUnsubscribe = nativeStepService.subscribe(async (data) => {
        if (this.isPaused) return;
        if (data.todaySteps > this.currentSteps) {
          await this.setSteps(this.currentDate, data.todaySteps);
        }
      });
    }

    // Catch-up immediately on app launch
    await this.catchUpFromSensor();

    this.startMidnightWatcher();
    this.isInitialized = true;
  }

  /**
   * Catches up steps immediately from native hardware sensor baseline.
   */
  async catchUpFromSensor(): Promise<void> {
    try {
      const nativeData = await nativeStepService.getTodaySteps();
      if (nativeData.todaySteps > this.currentSteps) {
        await this.setSteps(this.currentDate, nativeData.todaySteps);
      }
    } catch (e) {
      console.warn('Sensor catch-up failed:', e);
    }
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

    this.checkDateChange();
    const newSteps = this.currentSteps + amount;
    await this.setSteps(this.currentDate, newSteps);
  }

  /**
   * Sets steps for a specific date (idempotent, single writer to SQLite).
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

    const metrics: StepUpdateEvent = {
      date,
      steps: safeSteps,
      distanceKm,
      calories,
      activeMinutes,
      goalReached,
      isPaused: this.isPaused,
    };

    // 1. Save to SQLite
    await saveDailySteps({
      date,
      steps: safeSteps,
      distanceKm,
      calories,
      activeMinutes,
      goalReached,
    });

    const currentHour = new Date().getHours();
    await saveHourlySteps(date, currentHour, safeSteps);

    // 2. Notify all UI listeners
    this.emit(metrics);

    // 3. Update live notification if date is today
    if (date === this.currentDate && user.notificationsEnabled) {
      await liveNotificationService.updateLiveStepNotification({
        steps: safeSteps,
        goal: user.dailyGoal,
        distanceKm,
        calories,
        activeMinutes,
        units: user.units,
        language: user.language,
        isPaused: this.isPaused,
      });

      if (goalReached) {
        await liveNotificationService.triggerGoalCelebrationAlert(user.dailyGoal, user.language);
      }
    }
  }

  /**
   * Starts hardware sensor tracking via native service.
   */
  async startPedometerTracking(): Promise<boolean> {
    const user = useUserStore.getState();
    return nativeStepService.initService(user.dailyGoal);
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
    this.midnightCheckTimer = setInterval(() => {
      this.checkDateChange();
    }, 60000);
  }

  private async checkDateChange(): Promise<void> {
    const today = getTodayDateString();
    if (today !== this.currentDate) {
      this.currentDate = today;
      this.currentSteps = 0;
      await this.catchUpFromSensor();
      this.emit(this.getCurrentMetrics());
    }
  }

  private emit(metrics: StepUpdateEvent): void {
    this.listeners.forEach((l) => {
      try {
        l(metrics);
      } catch (err) {
        console.error('Step update listener error:', err);
      }
    });
  }

  destroy(): void {
    if (this.midnightCheckTimer) {
      clearInterval(this.midnightCheckTimer);
      this.midnightCheckTimer = null;
    }
    if (this.nativeUnsubscribe) {
      this.nativeUnsubscribe();
      this.nativeUnsubscribe = null;
    }
    this.listeners.clear();
    this.isInitialized = false;
  }
}

export const stepService = new StepService();
