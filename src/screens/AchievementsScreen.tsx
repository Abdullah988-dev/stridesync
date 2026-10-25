import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAppTheme } from '../theme/themeContext';
import { useTranslation } from '../i18n/i18nContext';
import { useAchievementsStore } from '../store/useAchievementsStore';
import { useStepsStore } from '../store/useStepsStore';
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

  const { badges } = useAchievementsStore();
  const { currentStreak, longestStreak } = useStepsStore();
  const [selectedCategory, setSelectedCategory] = useState<FilterCategory>('all');

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
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <Header title={t('achievementsTitle')} />

      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingHorizontal: spacing.lg }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Streak Hero Banner with Flame Glow */}
        <StaggerItem index={0}>
          <Card
            style={[
              styles.streakCard,
              {
                backgroundColor: colors.surfaceGlass,
                borderColor: colors.cardGlassBorder,
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
                    backgroundColor: colors.primaryLight,
                    borderRadius: borderRadius.full,
                  },
                ]}
              >
                <Ionicons name="trophy" size={14} color={colors.primaryDark} style={{ marginRight: 4 }} />
                <Text style={[typography.small, { color: colors.primaryDark, fontWeight: '700' }]}>
                  {unlockedCount} / {badges.length}
                </Text>
              </View>
            </View>
          </Card>
        </StaggerItem>

        {/* Category Filter Chips */}
        <StaggerItem index={1}>
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
                      backgroundColor: isSelected ? colors.primary : colors.surfaceGlass,
                      borderColor: isSelected ? colors.primary : colors.cardGlassBorder,
                      borderRadius: borderRadius.full,
                      marginRight: isRTL ? 0 : 8,
                      marginLeft: isRTL ? 8 : 0,
                    },
                  ]}
                >
                  <Text
                    style={[
                      typography.caption,
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

        {/* Badges 2-column Grid with Stagger & 3D Flip */}
        <View style={styles.grid}>
          {filteredBadges.map((badge, idx) => (
            <View key={badge.id} style={styles.gridColumn}>
              <StaggerItem index={Math.min(idx + 2, 8)}>
                <BadgeCard badge={badge} />
              </StaggerItem>
            </View>
          ))}
        </View>

        <View style={{ height: 60 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 160,
  },
  streakCard: {
    borderWidth: 1,
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
