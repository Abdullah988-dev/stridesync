import { create } from 'zustand';
import {
  initDatabase,
  saveDailySteps,
  getDailySteps,
  getAllDailySteps,
  saveHourlySteps,
  getHourlySteps,
  DailyStepRecord,
  HourlyStepRecord,
  resetDatabase,
} from '../services/database';
import { pedometerService } from '../services/pedometer';
import { stepService, StepUpdateEvent } from '../services/stepService';
import { notificationService } from '../services/notifications';
import {
  calculateDistanceKm,
  calculateCaloriesBurned,
  calculateActiveMinutes,
} from '../utils/calculations';
import {
  getTodayDateString,
  calculateStreaks,
  getPastDaysDateStrings,
} from '../utils/dateHelpers';
import { useUserStore } from './useUserStore';
import { useAchievementsStore } from './useAchievementsStore';
import { triggerHaptic } from '../utils/soundHaptics';

export interface WeeklySummary {
  totalSteps: number;
  averageSteps: number;
  bestDay: { date: string; steps: number } | null;
}

export interface MonthlySummary {
  totalSteps: number;
  averageSteps: number;
}

interface StepsState {
  todayDate: string;
  todaySteps: number;
  todayDistanceKm: number;
  todayCalories: number;
  todayActiveMinutes: number;
  isGoalReached: boolean;
  hourlySteps: HourlyStepRecord[];
  history: DailyStepRecord[];
  currentStreak: number;
  longestStreak: number;
  weeklySummary: WeeklySummary;
  monthlySummary: MonthlySummary;
  isPedometerAvailable: boolean;
  isSimulated: boolean;
  isLoading: boolean;
  showGoalCelebration: boolean;
  showManualEntryModal: boolean;

  // Actions
  initStepsStore: () => Promise<void>;
  syncSensorSteps: () => Promise<void>;
  addSteps: (stepsToAdd: number, targetDate?: string) => Promise<void>;
  setStepsManually: (date: string, steps: number) => Promise<void>;
  refreshHistoryAndSummaries: () => Promise<void>;
  setShowGoalCelebration: (show: boolean) => void;
  setShowManualEntryModal: (show: boolean) => void;
  resetAllStepData: () => Promise<void>;
}

export const useStepsStore = create<StepsState>((set, get) => ({
  todayDate: getTodayDateString(),
  todaySteps: 0,
  todayDistanceKm: 0,
  todayCalories: 0,
  todayActiveMinutes: 0,
  isGoalReached: false,
  hourlySteps: Array.from({ length: 24 }, (_, i) => ({ hour: i, steps: 0 })),
  history: [],
  currentStreak: 0,
  longestStreak: 0,
  weeklySummary: { totalSteps: 0, averageSteps: 0, bestDay: null },
  monthlySummary: { totalSteps: 0, averageSteps: 0 },
  isPedometerAvailable: false,
  isSimulated: true,
  isLoading: true,
  showGoalCelebration: false,
  showManualEntryModal: false,

  initStepsStore: async () => {
    set({ isLoading: true });
    await initDatabase();
    await stepService.init();
    const today = getTodayDateString();
    set({ todayDate: today });

    // Connect to stepService single-source-of-truth listener
    stepService.subscribe(async (metrics: StepUpdateEvent) => {
      const previouslyReached = get().isGoalReached;
      set({
        todayDate: metrics.date,
        todaySteps: metrics.steps,
        todayDistanceKm: metrics.distanceKm,
        todayCalories: metrics.calories,
        todayActiveMinutes: metrics.activeMinutes,
        isGoalReached: metrics.goalReached,
      });

      if (!previouslyReached && metrics.goalReached) {
        set({ showGoalCelebration: true });
        await triggerHaptic('success');
      }
    });

    // Check Pedometer sensor
    const pedometerStatus = await pedometerService.checkPermissionsAndAvailability();
    set({
      isPedometerAvailable: pedometerStatus.isAvailable,
      isSimulated: pedometerStatus.isSimulated,
    });

    // Start hardware tracking if available
    if (pedometerStatus.isAvailable && pedometerStatus.hasPermission) {
      await stepService.startPedometerTracking();
    }

    const initialMetrics = stepService.getCurrentMetrics();
    const hourly = await getHourlySteps(today);

    set({
      todaySteps: initialMetrics.steps,
      todayDistanceKm: initialMetrics.distanceKm,
      todayCalories: initialMetrics.calories,
      todayActiveMinutes: initialMetrics.activeMinutes,
      isGoalReached: initialMetrics.goalReached,
      hourlySteps: hourly,
      isLoading: false,
    });

    await get().refreshHistoryAndSummaries();
  },

  syncSensorSteps: async () => {
    try {
      await stepService.catchUpFromSensor();
      const current = stepService.getCurrentMetrics();
      set({
        todaySteps: current.steps,
        todayDistanceKm: current.distanceKm,
        todayCalories: current.calories,
        todayActiveMinutes: current.activeMinutes,
        isGoalReached: current.goalReached,
      });
      await get().refreshHistoryAndSummaries();
    } catch (e) {
      console.warn('Failed to sync sensor steps:', e);
    }
  },

  addSteps: async (stepsToAdd: number, targetDate?: string) => {
    const today = getTodayDateString();
    const date = targetDate || today;
    const isToday = date === get().todayDate || date === today;

    if (isToday) {
      await stepService.addSteps(stepsToAdd);

      const currentHour = new Date().getHours();
      const currentHourly = [...get().hourlySteps];
      const hourIndex = currentHourly.findIndex((h) => h.hour === currentHour);
      if (hourIndex >= 0) {
        currentHourly[hourIndex] = {
          hour: currentHour,
          steps: currentHourly[hourIndex].steps + stepsToAdd,
        };
      }
      set({ hourlySteps: currentHourly });
    } else {
      const existing = await getDailySteps(date);
      const newSteps = (existing ? existing.steps : 0) + stepsToAdd;
      await stepService.setSteps(date, newSteps);
    }

    await get().refreshHistoryAndSummaries();
  },

  setStepsManually: async (date: string, steps: number) => {
    const safeSteps = Math.max(0, Math.floor(steps));
    await stepService.setSteps(date, safeSteps);

    if (date === get().todayDate) {
      const currentHour = new Date().getHours();
      const currentHourly = [...get().hourlySteps];
      const hourIndex = currentHourly.findIndex((h) => h.hour === currentHour);
      if (hourIndex >= 0) {
        currentHourly[hourIndex] = {
          hour: currentHour,
          steps: safeSteps,
        };
        set({ hourlySteps: currentHourly });
      }
    }

    await get().refreshHistoryAndSummaries();
  },

  refreshHistoryAndSummaries: async () => {
    const allHistory = await getAllDailySteps();
    set({ history: allHistory });

    // Streaks calculation
    const streakRecords = allHistory.map((r) => ({
      date: r.date,
      goalReached: r.goalReached,
      steps: r.steps,
    }));
    const { currentStreak, longestStreak } = calculateStreaks(streakRecords);
    set({ currentStreak, longestStreak });

    // Weekly Summary (past 7 days)
    const past7DateStrs = getPastDaysDateStrings(7);
    const past7Records = past7DateStrs.map((d) => {
      const match = allHistory.find((h) => h.date === d);
      return {
        date: d,
        steps: match ? match.steps : 0,
      };
    });

    const weeklyTotal = past7Records.reduce((acc, curr) => acc + curr.steps, 0);
    const weeklyAvg = Math.round(weeklyTotal / 7);
    const bestDay = past7Records.reduce(
      (best, curr) => (curr.steps > (best?.steps || 0) ? curr : best),
      past7Records[0]
    );

    set({
      weeklySummary: {
        totalSteps: weeklyTotal,
        averageSteps: weeklyAvg,
        bestDay: bestDay && bestDay.steps > 0 ? bestDay : null,
      },
    });

    // Monthly Summary (past 30 days)
    const past30DateStrs = getPastDaysDateStrings(30);
    const past30Records = past30DateStrs.map((d) => {
      const match = allHistory.find((h) => h.date === d);
      return match ? match.steps : 0;
    });
    const monthlyTotal = past30Records.reduce((acc, curr) => acc + curr, 0);
    const monthlyAvg = Math.round(monthlyTotal / 30);

    set({
      monthlySummary: {
        totalSteps: monthlyTotal,
        averageSteps: monthlyAvg,
      },
    });

    // Check Achievements
    const totalDistance = allHistory.reduce((acc, curr) => acc + curr.distanceKm, 0);
    const todaySteps = get().todaySteps;

    await useAchievementsStore.getState().checkAchievements({
      stepsToday: todaySteps,
      currentStreak,
      totalDistanceKm: totalDistance,
    });
  },

  setShowGoalCelebration: (show: boolean) => {
    set({ showGoalCelebration: show });
  },

  setShowManualEntryModal: (show: boolean) => {
    set({ showManualEntryModal: show });
  },

  resetAllStepData: async () => {
    pedometerService.stopLiveStepTracking();
    await resetDatabase();
    const today = getTodayDateString();
    await stepService.setSteps(today, 0);

    set({
      todayDate: today,
      todaySteps: 0,
      todayDistanceKm: 0,
      todayCalories: 0,
      todayActiveMinutes: 0,
      isGoalReached: false,
      hourlySteps: Array.from({ length: 24 }, (_, i) => ({ hour: i, steps: 0 })),
      history: [],
      currentStreak: 0,
      longestStreak: 0,
      weeklySummary: { totalSteps: 0, averageSteps: 0, bestDay: null },
      monthlySummary: { totalSteps: 0, averageSteps: 0 },
    });

    await useAchievementsStore.getState().resetAchievements();
  },
}));
