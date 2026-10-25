import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { useAppTheme } from '../theme/themeContext';
import { useTranslation } from '../i18n/i18nContext';
import { useAchievementsStore } from '../store/useAchievementsStore';
import { useStepsStore } from '../store/useStepsStore';
import { useAuthStore } from '../store/useAuthStore';
import { MeshBackground } from '../components/common/MeshBackground';
import { GlassCard } from '../components/common/GlassCard';
import { Header } from '../components/common/Header';
import { BadgeCard } from '../components/BadgeCard';
import { Card } from '../components/common/Card';
import { PressableScale } from '../components/animated/PressableScale';
import { StaggerItem } from '../components/animated/StaggerItem';
import { triggerHaptic } from '../utils/soundHaptics';

type FilterCategory = 'all' | 'steps' | 'streak' | 'distance' | 'milestone';

export const AchievementsScreen: React.FC = () => {
  const { colors, typography, spacing, borderRadius } = useAppTheme();
  const { t, isRTL } = useTranslation();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const { badges } = useAchievementsStore();
  const { currentStreak, longestStreak } = useStepsStore();
  const { isAuthenticated, isGuest } = useAuthStore();
  const [selectedCategory, setSelectedCategory] = useState<FilterCategory>('all');

  const isMember = isAuthenticated && !isGuest;
  const unlockedCount = badges.filter((b) => b.unlockedAt).length;

  const filteredBadges =
    selectedCategory === 'all'
      ? badges
      : badges.filter((b) => b.category === selectedCategory);

  const categories: { key: FilterCategory; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'steps', label: 'Steps' },
    { key: 'streak', label: 'Streaks' },
    { key: 'distance', label: 'Distance' },
    { key: 'milestone', label: 'Milestones' },
  ];

  return (
    <MeshBackground>
      <SafeAreaView style={styles.container}>
        <Header title={t('achievementsTitle')} />

        <ScrollView
          contentContainerStyle={[styles.scrollContent, { paddingHorizontal: spacing.lg }]}
          showsVerticalScrollIndicator={false}
        >
          {/* Guest Mode Banner */}
          {!isMember && (
            <StaggerItem index={0}>
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={() => navigation.navigate('Auth', { mode: 'register' })}
                style={[
                  styles.guestBanner,
                  {
                    backgroundColor: colors.surface,
                    borderColor: 'rgba(234, 179, 8, 0.35)',
                    borderRadius: borderRadius.xl,
                  },
                ]}
              >
                <View style={[styles.guestBannerIcon, { backgroundColor: 'rgba(234, 179, 8, 0.15)' }]}>
                  <Ionicons name="trophy" size={20} color="#EAB308" />
                </View>
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={[typography.bodyBold, { color: colors.text }]}>
                    Claim Your Milestone Badges
                  </Text>
                  <Text style={[typography.caption, { color: colors.textSecondary, marginTop: 2 }]}>
                    Register your free account to record permanent streak badges & unlock Liquid Glass.
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
              </TouchableOpacity>
            </StaggerItem>
          )}

          {/* Streak Hero Banner */}
          <StaggerItem index={1}>
            <GlassCard
              variant="glow"
              style={[
                styles.streakCard,
                {
                  marginTop: spacing.sm,
                },
              ]}
            >
              <View style={[styles.streakRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                {currentStreak > 0 ? (
                  <LinearGradient
                    colors={colors.flameGradient || [colors.accent, '#FF9500']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={[styles.flameCircle, { borderRadius: borderRadius.full }]}
                  >
                    <Ionicons name="flame" size={36} color="#FFFFFF" />
                  </LinearGradient>
                ) : (
                  <View
                    style={[
                      styles.flameCircle,
                      {
                        backgroundColor: colors.divider,
                        borderRadius: borderRadius.full,
                      },
                    ]}
                  >
                    <Ionicons name="flame" size={36} color={colors.textMuted} />
                  </View>
                )}

                <View style={{ flex: 1, marginHorizontal: spacing.md }}>
                  <Text style={[typography.caption, { color: colors.textSecondary }]}>
                    {t('currentStreak')}
                  </Text>
                  <Text style={[typography.h1, { color: colors.text, marginTop: 2 }]}>
                    {currentStreak} {t('daysStreak')}
                  </Text>
                  <Text style={[typography.small, { color: colors.textMuted, marginTop: 2 }]}>
                    {t('bestStreak')}: {longestStreak} days
                  </Text>
                </View>

                <View
                  style={[
                    styles.unlockedCounterPill,
                    {
                      backgroundColor: isMember ? 'rgba(56, 189, 248, 0.2)' : colors.primaryLight,
                      borderRadius: borderRadius.full,
                    },
                  ]}
                >
                  <Ionicons
                    name="trophy"
                    size={14}
                    color={isMember ? '#38BDF8' : colors.primaryDark}
                    style={{ marginRight: 4 }}
                  />
                  <Text
                    style={[
                      typography.small,
                      {
                        color: isMember ? '#38BDF8' : colors.primaryDark,
                        fontWeight: '700',
                      },
                    ]}
                  >
                    {unlockedCount} / {badges.length}
                  </Text>
                </View>
              </View>
            </GlassCard>
          </StaggerItem>

          {/* Category Filter Chips */}
          <StaggerItem index={2}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={[
                styles.categoryChipsScroll,
                {
                  flexDirection: isRTL ? 'row-reverse' : 'row',
                  marginVertical: spacing.lg,
                  paddingRight: isRTL ? 0 : 32,
                  paddingLeft: isRTL ? 32 : 0,
                },
              ]}
            >
              {categories.map((cat) => {
                const isSelected = selectedCategory === cat.key;
                return (
                  <PressableScale
                    key={cat.key}
                    onPress={() => {
                      triggerHaptic('light');
                      setSelectedCategory(cat.key);
                    }}
                    style={[
                      styles.chip,
                      {
                        backgroundColor: isSelected
                          ? colors.primary
                          : isMember
                          ? 'rgba(255, 255, 255, 0.06)'
                          : colors.surface,
                        borderColor: isSelected
                          ? colors.primary
                          : isMember
                          ? 'rgba(255, 255, 255, 0.12)'
                          : colors.cardBorder,
                        borderRadius: borderRadius.full,
                        marginRight: isRTL ? 0 : 8,
                        marginLeft: isRTL ? 8 : 0,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        typography.small,
                        {
                          color: isSelected ? '#FFFFFF' : colors.textSecondary,
                          fontWeight: isSelected ? '700' : '500',
                        },
                      ]}
                    >
                      {cat.label}
                    </Text>
                  </PressableScale>
                );
              })}
            </ScrollView>
          </StaggerItem>

          {/* 2-Column Badges Grid */}
          <View style={styles.grid}>
            {filteredBadges.map((badge, index) => (
              <View key={badge.id} style={styles.gridColumn}>
                <StaggerItem index={Math.min(index + 3, 12)} direction="up">
                  <BadgeCard badge={badge} />
                </StaggerItem>
              </View>
            ))}
          </View>

          <View style={{ height: 60 }} />
        </ScrollView>
      </SafeAreaView>
    </MeshBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 160,
  },
  guestBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderWidth: 1.5,
    marginVertical: 10,
  },
  guestBannerIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  streakCard: {
    marginVertical: 4,
  },
  streakRow: {
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  flameCircle: {
    width: 62,
    height: 62,
    alignItems: 'center',
    justifyContent: 'center',
  },
  unlockedCounterPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  categoryChipsScroll: {
    alignItems: 'center',
  },
  chip: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderWidth: 1,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -6,
  },
  gridColumn: {
    width: '50%',
    paddingHorizontal: 6,
    marginBottom: 12,
  },
});
