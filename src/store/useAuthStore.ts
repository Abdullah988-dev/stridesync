import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { triggerHaptic } from '../utils/soundHaptics';
import { useAchievementsStore } from './useAchievementsStore';
import { waterNotificationService } from '../services/waterNotificationService';

export interface UserAccount {
  name: string;
  email: string;
  createdAt: string;
}

interface AuthState {
  isAuthenticated: boolean;
  isGuest: boolean;
  user: UserAccount | null;
  isLoaded: boolean;
  loadAuth: () => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  continueAsGuest: () => Promise<void>;
}

const AUTH_USER_KEY = '@stridesync_auth_user';
const USERS_DB_KEY = '@stridesync_registered_users_db';
const GUEST_FLAG_KEY = '@stridesync_guest_flag';

export const useAuthStore = create<AuthState>((set, get) => ({
  isAuthenticated: false,
  isGuest: true, // defaults to guest mode until logged in
  user: null,
  isLoaded: false,

  loadAuth: async () => {
    try {
      const activeUserJson = await AsyncStorage.getItem(AUTH_USER_KEY);
      if (activeUserJson) {
        const user = JSON.parse(activeUserJson);
        set({ isAuthenticated: true, isGuest: false, user, isLoaded: true });
        // Ensure member badge is unlocked for registered users
        useAchievementsStore.getState().unlockBadge('badge_member');
        await waterNotificationService.scheduleHydrationReminders();
        return;
      }

      const guestFlag = await AsyncStorage.getItem(GUEST_FLAG_KEY);
      set({
        isAuthenticated: false,
        isGuest: guestFlag !== 'false',
        user: null,
        isLoaded: true,
      });
      await waterNotificationService.cancelHydrationReminders();
    } catch {
      set({ isAuthenticated: false, isGuest: true, user: null, isLoaded: true });
      await waterNotificationService.cancelHydrationReminders();
    }
  },

  register: async (name: string, email: string, password: string) => {
    const trimmedEmail = email.trim().toLowerCase();
    const trimmedName = name.trim();

    if (!trimmedName || trimmedName.length < 2) {
      return { success: false, error: 'Please enter a valid name (at least 2 characters).' };
    }
    if (!trimmedEmail || !trimmedEmail.includes('@') || !trimmedEmail.includes('.')) {
      return { success: false, error: 'Please enter a valid email address.' };
    }
    if (!password || password.length < 6) {
      return { success: false, error: 'Password must be at least 6 characters.' };
    }

    try {
      // Check existing registered users
      const usersDbJson = await AsyncStorage.getItem(USERS_DB_KEY);
      const usersDb: Record<string, { name: string; email: string; passwordHash: string; createdAt: string }> =
        usersDbJson ? JSON.parse(usersDbJson) : {};

      if (usersDb[trimmedEmail]) {
        return { success: false, error: 'An account with this email already exists. Please sign in.' };
      }

      const newUser = {
        name: trimmedName,
        email: trimmedEmail,
        passwordHash: password, // Simple secure local storage hash
        createdAt: new Date().toISOString(),
      };

      usersDb[trimmedEmail] = newUser;
      await AsyncStorage.setItem(USERS_DB_KEY, JSON.stringify(usersDb));

      const sessionUser: UserAccount = {
        name: trimmedName,
        email: trimmedEmail,
        createdAt: newUser.createdAt,
      };

      await AsyncStorage.setItem(AUTH_USER_KEY, JSON.stringify(sessionUser));
      await AsyncStorage.setItem(GUEST_FLAG_KEY, 'false');

      set({ isAuthenticated: true, isGuest: false, user: sessionUser });
      await triggerHaptic('success');
      await useAchievementsStore.getState().unlockBadge('badge_member');
      await waterNotificationService.scheduleHydrationReminders();
      return { success: true };
    } catch {
      return { success: false, error: 'Failed to create account. Please try again.' };
    }
  },

  login: async (email: string, password: string) => {
    const trimmedEmail = email.trim().toLowerCase();
    if (!trimmedEmail || !password) {
      return { success: false, error: 'Please enter your email and password.' };
    }

    try {
      const usersDbJson = await AsyncStorage.getItem(USERS_DB_KEY);
      const usersDb: Record<string, { name: string; email: string; passwordHash: string; createdAt: string }> =
        usersDbJson ? JSON.parse(usersDbJson) : {};

      const existing = usersDb[trimmedEmail];
      if (!existing || existing.passwordHash !== password) {
        return { success: false, error: 'Invalid email or password. Please check your credentials.' };
      }

      const sessionUser: UserAccount = {
        name: existing.name,
        email: existing.email,
        createdAt: existing.createdAt,
      };

      await AsyncStorage.setItem(AUTH_USER_KEY, JSON.stringify(sessionUser));
      await AsyncStorage.setItem(GUEST_FLAG_KEY, 'false');

      set({ isAuthenticated: true, isGuest: false, user: sessionUser });
      await triggerHaptic('success');
      await useAchievementsStore.getState().unlockBadge('badge_member');
      await waterNotificationService.scheduleHydrationReminders();
      return { success: true };
    } catch {
      return { success: false, error: 'Sign in failed. Please try again.' };
    }
  },

  logout: async () => {
    try {
      await AsyncStorage.removeItem(AUTH_USER_KEY);
      await AsyncStorage.setItem(GUEST_FLAG_KEY, 'true');
      set({ isAuthenticated: false, isGuest: true, user: null });
      await waterNotificationService.cancelHydrationReminders();
      await triggerHaptic('light');
    } catch {}
  },

  continueAsGuest: async () => {
    try {
      await AsyncStorage.removeItem(AUTH_USER_KEY);
      await AsyncStorage.setItem(GUEST_FLAG_KEY, 'true');
      set({ isAuthenticated: false, isGuest: true, user: null });
      await waterNotificationService.cancelHydrationReminders();
      await triggerHaptic('light');
    } catch {}
  },
}));
