import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Gender, UnitSystem } from '../utils/calculations';
import { ThemeMode } from '../theme/themeContext';
import { SupportedLanguage } from '../i18n/translations';
import { notificationService } from '../services/notifications';
import { liveNotificationService } from '../services/liveNotificationService';

export interface UserProfile {
  name: string;
  age: number;
  gender: Gender;
  heightCm: number;
  weightKg: number;
  dailyGoal: number;
  units: UnitSystem;
  theme: ThemeMode;
  language: SupportedLanguage;
  notificationsEnabled: boolean;
  isOnboarded: boolean;
}

interface UserState extends UserProfile {
  isLoaded: boolean;
  loadUserProfile: () => Promise<void>;
  updateUserProfile: (updates: Partial<UserProfile>) => Promise<void>;
  completeOnboarding: (profile: Partial<UserProfile>) => Promise<void>;
  setDailyGoal: (goal: number) => Promise<void>;
  setTheme: (theme: ThemeMode) => Promise<void>;
  setLanguage: (language: SupportedLanguage) => Promise<void>;
  setUnits: (units: UnitSystem) => Promise<void>;
  setNotificationsEnabled: (enabled: boolean) => Promise<void>;
  resetUserData: () => Promise<void>;
}

const STORAGE_KEY = '@stridesync_user_profile';

const defaultProfile: UserProfile = {
  name: 'Alex',
  age: 28,
  gender: 'male',
  heightCm: 175,
  weightKg: 70,
  dailyGoal: 10000,
  units: 'metric',
  theme: 'dark',
  language: 'en',
  notificationsEnabled: true,
  isOnboarded: false,
};

export const useUserStore = create<UserState>((set, get) => ({
  ...defaultProfile,
  isLoaded: false,

  loadUserProfile: async () => {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEY);
      if (data) {
        const parsed = JSON.parse(data);
        set({ ...defaultProfile, ...parsed, isLoaded: true });
      } else {
        set({ isLoaded: true });
      }
    } catch (e) {
      console.warn('Failed to load user profile:', e);
      set({ isLoaded: true });
    }
  },

  updateUserProfile: async (updates) => {
    const current = get();
    const updated: UserProfile = {
      name: updates.name ?? current.name,
      age: updates.age ?? current.age,
      gender: updates.gender ?? current.gender,
      heightCm: updates.heightCm ?? current.heightCm,
      weightKg: updates.weightKg ?? current.weightKg,
      dailyGoal: updates.dailyGoal ?? current.dailyGoal,
      units: updates.units ?? current.units,
      theme: updates.theme ?? current.theme,
      language: updates.language ?? current.language,
      notificationsEnabled: updates.notificationsEnabled ?? current.notificationsEnabled,
      isOnboarded: updates.isOnboarded ?? current.isOnboarded,
    };

    set(updated);
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.warn('Failed to persist user profile:', e);
    }
  },

  completeOnboarding: async (profile) => {
    await get().updateUserProfile({ ...profile, isOnboarded: true });
  },

  setDailyGoal: async (dailyGoal) => {
    await get().updateUserProfile({ dailyGoal });
  },

  setTheme: async (theme) => {
    await get().updateUserProfile({ theme });
  },

  setLanguage: async (language) => {
    await get().updateUserProfile({ language });
  },

  setUnits: async (units) => {
    await get().updateUserProfile({ units });
  },

  setNotificationsEnabled: async (notificationsEnabled) => {
    await get().updateUserProfile({ notificationsEnabled });
    await notificationService.scheduleDailyReminders(notificationsEnabled);
    if (!notificationsEnabled) {
      await liveNotificationService.cancelLiveNotification();
    }
  },

  resetUserData: async () => {
    set({ ...defaultProfile, isLoaded: true });
    try {
      await AsyncStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      console.warn('Failed to clear user profile storage:', e);
    }
  },
}));
