import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { triggerHaptic } from '../utils/soundHaptics';

export interface Badge {
  id: string;
  titleKey: string;
  descKey: string;
  iconName: string;
  requirement: number;
  category: 'steps' | 'streak' | 'distance' | 'milestone';
  unlockedAt: string | null;
}

const INITIAL_BADGES: Badge[] = [
  {
    id: 'badge_first_step',
    titleKey: 'badgeFirstStepTitle',
    descKey: 'badgeFirstStepDesc',
    iconName: 'footsteps',
    requirement: 1,
    category: 'milestone',
    unlockedAt: null,
  },
  {
    id: 'badge_5k',
    titleKey: 'badge5kTitle',
    descKey: 'badge5kDesc',
    iconName: 'walk',
    requirement: 5000,
    category: 'steps',
    unlockedAt: null,
  },
  {
    id: 'badge_10k',
    titleKey: 'badge10kTitle',
    descKey: 'badge10kDesc',
    iconName: 'trophy',
    requirement: 10000,
    category: 'steps',
    unlockedAt: null,
  },
  {
    id: 'badge_15k',
    titleKey: 'badge15kTitle',
    descKey: 'badge15kDesc',
    iconName: 'flash',
    requirement: 15000,
    category: 'steps',
    unlockedAt: null,
  },
  {
    id: 'badge_20k',
    titleKey: 'badge20kTitle',
    descKey: 'badge20kDesc',
    iconName: 'medal',
    requirement: 20000,
    category: 'steps',
  unlockedAt: null,
  },
  {
    id: 'badge_streak_3',
    titleKey: 'badgeStreak3Title',
    descKey: 'badgeStreak3Desc',
    iconName: 'flame-outline',
    requirement: 3,
    category: 'streak',
    unlockedAt: null,
  },
  {
    id: 'badge_streak_7',
    titleKey: 'badgeStreak7Title',
    descKey: 'badgeStreak7Desc',
    iconName: 'flame',
    requirement: 7,
    category: 'streak',
    unlockedAt: null,
  },
  {
    id: 'badge_streak_30',
    titleKey: 'badgeStreak30Title',
    descKey: 'badgeStreak30Desc',
    iconName: 'ribbon',
    requirement: 30,
    category: 'streak',
    unlockedAt: null,
  },
  {
    id: 'badge_half_marathon',
    titleKey: 'badgeHalfMarathonTitle',
    descKey: 'badgeHalfMarathonDesc',
    iconName: 'map-outline',
    requirement: 21,
    category: 'distance',
    unlockedAt: null,
  },
  {
    id: 'badge_marathon',
    titleKey: 'badgeMarathonTitle',
    descKey: 'badgeMarathonDesc',
    iconName: 'earth',
    requirement: 42,
    category: 'distance',
    unlockedAt: null,
  },
  {
    id: 'badge_member',
    titleKey: 'badgeMemberTitle',
    descKey: 'badgeMemberDesc',
    iconName: 'shield-checkmark',
    requirement: 1,
    category: 'milestone',
    unlockedAt: null,
  },
];

const ACHIEVEMENTS_STORAGE_KEY = '@stridesync_achievements';

interface AchievementsState {
  badges: Badge[];
  recentUnlockedBadge: Badge | null;
  loadAchievements: () => Promise<void>;
  checkAchievements: (data: {
    stepsToday: number;
    currentStreak: number;
    totalDistanceKm: number;
  }) => Promise<Badge | null>;
  unlockBadge: (badgeId: string) => Promise<Badge | null>;
  dismissRecentBadge: () => void;
  resetAchievements: () => Promise<void>;
}

export const useAchievementsStore = create<AchievementsState>((set, get) => ({
  badges: INITIAL_BADGES,
  recentUnlockedBadge: null,

  loadAchievements: async () => {
    try {
      const stored = await AsyncStorage.getItem(ACHIEVEMENTS_STORAGE_KEY);
      if (stored) {
        const unlockedMap: Record<string, string> = JSON.parse(stored);
        set((state) => ({
          badges: state.badges.map((b) => ({
            ...b,
            unlockedAt: unlockedMap[b.id] ?? null,
          })),
        }));
      }
    } catch (e) {
      console.warn('Failed to load achievements:', e);
    }
  },

  checkAchievements: async ({ stepsToday, currentStreak, totalDistanceKm }) => {
    const { badges } = get();
    let newlyUnlocked: Badge | null = null;
    const nowStr = new Date().toISOString().slice(0, 10);
    const updatedBadges = [...badges];
    let hasChanges = false;

    for (let i = 0; i < updatedBadges.length; i++) {
      const badge = updatedBadges[i];
      if (badge.unlockedAt) continue; // Already unlocked

      let shouldUnlock = false;
      if (badge.category === 'steps' || badge.category === 'milestone') {
        shouldUnlock = stepsToday >= badge.requirement;
      } else if (badge.category === 'streak') {
        shouldUnlock = currentStreak >= badge.requirement;
      } else if (badge.category === 'distance') {
        shouldUnlock = totalDistanceKm >= badge.requirement;
      }

      if (shouldUnlock) {
        updatedBadges[i] = {
          ...badge,
          unlockedAt: nowStr,
        };
        hasChanges = true;
        if (!newlyUnlocked) {
          newlyUnlocked = updatedBadges[i];
        }
      }
    }

    if (hasChanges) {
      set({ badges: updatedBadges, recentUnlockedBadge: newlyUnlocked });
      await triggerHaptic('success');

      // Persist unlock state
      const unlockMap: Record<string, string> = {};
      updatedBadges.forEach((b) => {
        if (b.unlockedAt) unlockMap[b.id] = b.unlockedAt;
      });
      await AsyncStorage.setItem(ACHIEVEMENTS_STORAGE_KEY, JSON.stringify(unlockMap));
    }

    return newlyUnlocked;
  },

  unlockBadge: async (badgeId: string) => {
    const { badges } = get();
    const idx = badges.findIndex((b) => b.id === badgeId);
    if (idx === -1) return null;
    if (badges[idx].unlockedAt) return null; // Already unlocked

    const nowStr = new Date().toISOString().slice(0, 10);
    const updatedBadges = [...badges];
    updatedBadges[idx] = {
      ...updatedBadges[idx],
      unlockedAt: nowStr,
    };

    set({ badges: updatedBadges, recentUnlockedBadge: updatedBadges[idx] });
    await triggerHaptic('success');

    const unlockMap: Record<string, string> = {};
    updatedBadges.forEach((b) => {
      if (b.unlockedAt) unlockMap[b.id] = b.unlockedAt;
    });
    await AsyncStorage.setItem(ACHIEVEMENTS_STORAGE_KEY, JSON.stringify(unlockMap));

    return updatedBadges[idx];
  },

  dismissRecentBadge: () => {
    set({ recentUnlockedBadge: null });
  },

  resetAchievements: async () => {
    set({
      badges: INITIAL_BADGES.map((b) => ({ ...b, unlockedAt: null })),
      recentUnlockedBadge: null,
    });
    await AsyncStorage.removeItem(ACHIEVEMENTS_STORAGE_KEY);
  },
}));
