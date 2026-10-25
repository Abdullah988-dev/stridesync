import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { triggerHaptic } from '../utils/soundHaptics';

interface WaterState {
  todayWaterMl: number;
  dailyGoalMl: number;
  glassSizeMl: number;
  todayDate: string;
  loadWater: () => Promise<void>;
  addGlass: () => Promise<void>;
  removeGlass: () => Promise<void>;
  setDailyGoal: (goalMl: number) => Promise<void>;
  resetTodayWater: () => Promise<void>;
}

const WATER_STORAGE_KEY = '@stridesync_water_tracker';

export const useWaterStore = create<WaterState>((set, get) => ({
  todayWaterMl: 0,
  dailyGoalMl: 2000, // 8 glasses of 250ml
  glassSizeMl: 250,
  todayDate: new Date().toISOString().slice(0, 10),

  loadWater: async () => {
    try {
      const todayStr = new Date().toISOString().slice(0, 10);
      const json = await AsyncStorage.getItem(WATER_STORAGE_KEY);
      if (json) {
        const parsed = JSON.parse(json);
        if (parsed.date === todayStr) {
          set({
            todayWaterMl: parsed.todayWaterMl ?? 0,
            dailyGoalMl: parsed.dailyGoalMl ?? 2000,
            todayDate: todayStr,
          });
          return;
        }
      }
      // New day: reset water to 0
      set({ todayWaterMl: 0, todayDate: todayStr });
    } catch {}
  },

  addGlass: async () => {
    const { todayWaterMl, dailyGoalMl, glassSizeMl } = get();
    const newAmount = todayWaterMl + glassSizeMl;
    const todayStr = new Date().toISOString().slice(0, 10);

    set({ todayWaterMl: newAmount, todayDate: todayStr });
    await triggerHaptic('medium');

    try {
      await AsyncStorage.setItem(
        WATER_STORAGE_KEY,
        JSON.stringify({ todayWaterMl: newAmount, dailyGoalMl, date: todayStr })
      );
    } catch {}
  },

  removeGlass: async () => {
    const { todayWaterMl, dailyGoalMl, glassSizeMl } = get();
    const newAmount = Math.max(0, todayWaterMl - glassSizeMl);
    const todayStr = new Date().toISOString().slice(0, 10);

    set({ todayWaterMl: newAmount, todayDate: todayStr });
    await triggerHaptic('light');

    try {
      await AsyncStorage.setItem(
        WATER_STORAGE_KEY,
        JSON.stringify({ todayWaterMl: newAmount, dailyGoalMl, date: todayStr })
      );
    } catch {}
  },

  setDailyGoal: async (goalMl: number) => {
    const { todayWaterMl } = get();
    const todayStr = new Date().toISOString().slice(0, 10);
    set({ dailyGoalMl: goalMl });

    try {
      await AsyncStorage.setItem(
        WATER_STORAGE_KEY,
        JSON.stringify({ todayWaterMl, dailyGoalMl: goalMl, date: todayStr })
      );
    } catch {}
  },

  resetTodayWater: async () => {
    const { dailyGoalMl } = get();
    const todayStr = new Date().toISOString().slice(0, 10);
    set({ todayWaterMl: 0, todayDate: todayStr });

    try {
      await AsyncStorage.setItem(
        WATER_STORAGE_KEY,
        JSON.stringify({ todayWaterMl: 0, dailyGoalMl, date: todayStr })
      );
    } catch {}
  },
}));
