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
import { useStepsStore } from '../store/useStepsStore';
import { useUserStore } from '../store/useUserStore';
import { useAuthStore } from '../store/useAuthStore';
import { MeshBackground } from '../components/common/MeshBackground';
import { GlassCard } from '../components/common/GlassCard';
import { ChartCard } from '../components/ChartCard';
import { Header } from '../components/common/Header';
import { Card } from '../components/common/Card';
import { PressableScale } from '../components/animated/PressableScale';
import { StaggerItem } from '../components/animated/StaggerItem';
import { AnimatedCounter } from '../components/animated/AnimatedCounter';
import {
  formatSteps,
  formatDistance,
} from '../utils/calculations';
import {
  getShortWeekday,
  formatDisplayDate,
  getPastDaysDateStrings,
} from '../utils/dateHelpers';
import { triggerHaptic } from '../utils/soundHaptics';

type TabType = 'day' | 'week' | 'month';

export const StatisticsScreen: React.FC = () => {
  const { colors, typography, spacing, borderRadius } = useAppTheme();
  const { t, isRTL } = useTranslation();

  const {
    hourlySteps,
    history,
    weeklySummary,
    monthlySummary,
  } = useStepsStore();

  const { dailyGoal, units } = useUserStore();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { isAuthenticated, isGuest } = useAuthStore();
  const [activeTab, setActiveTab] = useState<TabType>('day');

  const isMember = isAuthenticated && !isGuest;

  const handleTabChange = (tab: TabType) => {
    triggerHaptic('light');
    setActiveTab(tab);
  };

  // Day Chart Data (24h)
  const dayChartData = hourlySteps.map((h) => ({
    label: `${h.hour}h`,
    value: h.steps,
    secondaryLabel: `${h.hour}:00 - ${h.hour + 1}:00`,
  }));

  // Week Chart Data (past 7 days)
  const past7Days = getPastDaysDateStrings(7);
  const weekChartData = past7Days.map((d) => {
    const match = history.find((h) => h.date === d);
    return {
      label: getShortWeekday(d),
      value: match ? match.steps : 0,
      secondaryLabel: formatDisplayDate(d),
    };
  });

  // Month Chart Data (past 30 days)
  const past30Days = getPastDaysDateStrings(30);
  const monthChartData = past30Days.map((d, index) => {
    const match = history.find((h) => h.date === d);
    const dayNum = d.split('-')[2];
    return {
      label: index % 5 === 0 ? dayNum : '',
      value: match ? match.steps : 0,
      secondaryLabel: formatDisplayDate(d),
    };
  });

  // Peak hour calculation for Day tab
  const peakHour = hourlySteps.reduce(
    (max, cur) => (cur.steps > max.steps ? cur : max),
    hourlySteps[0] || { hour: 0, steps: 0 }
  );

  return (
    <MeshBackground>
      <SafeAreaView style={styles.container}>
        <Header title={t('statsTitle')} />

        <ScrollView
          contentContainerStyle={[styles.scrollContent, { paddingHorizontal: spacing.lg }]}
          showsVerticalScrollIndicator={false}
        >
          {/* Segmented Control Tabs */}
          <StaggerItem index={0}>
            <View
              style={[
                styles.tabBar,
                {
                  backgroundColor: isMember ? 'rgba(255, 255, 255, 0.06)' : colors.surface,
                  borderColor: isMember ? 'rgba(255, 255, 255, 0.12)' : colors.cardBorder,
                  borderRadius: borderRadius.xl,
                  flexDirection: isRTL ? 'row-reverse' : 'row',
                },
              ]}
            >
              {(['day', 'week', 'month'] as TabType[]).map((tab) => {
                const isSelected = activeTab === tab;
                const isLocked = !isMember && (tab === 'week' || tab === 'month');
                const label =
                  tab === 'day' ? t('tabDay') : tab === 'week' ? t('tabWeek') : t('tabMonth');

                return (
                  <PressableScale
                    key={tab}
                    onPress={() => handleTabChange(tab)}
                    style={[
                      styles.tabButton,
                      {
                        backgroundColor: isSelected ? colors.primary : 'transparent',
                        borderRadius: borderRadius.lg,
                      },
                    ]}
                  >
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      {isLocked && (
                        <Ionicons
                          name="lock-closed"
                          size={12}
                          color={isSelected ? '#FFFFFF' : colors.textMuted}
                          style={{ marginRight: 4 }}
                        />
                      )}
                      <Text
                        style={[
                          typography.bodyBold,
                          { color: isSelected ? '#FFFFFF' : colors.textSecondary },
                        ]}
                      >
                        {label}
                      </Text>
                    </View>
                  </PressableScale>
                );
              })}
            </View>
          </StaggerItem>

          {/* Tab 1: Day View (Open to both guest & registered) */}
          {activeTab === 'day' && (
            <View style={{ marginTop: spacing.lg }}>
              <StaggerItem index={1}>
                <ChartCard
                  title={t('hourlyBreakdown')}
                  data={dayChartData}
                  height={200}
                  unit={t('stepsCount').toLowerCase()}
                />
              </StaggerItem>

              <StaggerItem index={2}>
                <View style={[styles.summaryCardsRow, { marginTop: spacing.md }]}>
                  <Card style={{ flex: 1, marginRight: 8, backgroundColor: colors.card }}>
                    <Text style={[typography.caption, { color: colors.textSecondary }]}>Peak Activity</Text>
                    <Text style={[typography.h3, { color: colors.primary, marginTop: 4 }]}>
                      {peakHour.hour}:00
                    </Text>
                    <Text style={[typography.small, { color: colors.textMuted, marginTop: 2 }]}>
                      {formatSteps(peakHour.steps)} steps
                    </Text>
                  </Card>

                  <Card style={{ flex: 1, marginLeft: 8, backgroundColor: colors.card }}>
                    <Text style={[typography.caption, { color: colors.textSecondary }]}>Active Hours</Text>
                    <Text style={[typography.h3, { color: colors.secondary, marginTop: 4 }]}>
                      {hourlySteps.filter((h) => h.steps > 50).length} hrs
                    </Text>
                    <Text style={[typography.small, { color: colors.textMuted, marginTop: 2 }]}>
                      &gt; 50 steps/hr
                    </Text>
                  </Card>
                </View>
              </StaggerItem>
            </View>
          )}

          {/* Tab 2: Week View */}
          {activeTab === 'week' && (
            isMember ? (
              <View style={{ marginTop: spacing.lg }}>
                <StaggerItem index={1}>
                  <ChartCard
                    title={t('weeklySummary')}
                    data={weekChartData}
                    goal={dailyGoal}
                    height={210}
                    unit={t('stepsCount').toLowerCase()}
                  />
                </StaggerItem>

                <StaggerItem index={2}>
                  <View style={[styles.summaryCardsRow, { marginTop: spacing.md }]}>
                    <Card style={{ flex: 1, marginRight: 6, backgroundColor: colors.card }}>
                      <Text style={[typography.caption, { color: colors.textSecondary }]}>{t('totalSteps')}</Text>
                      <AnimatedCounter
                        value={weeklySummary.totalSteps}
                        style={[typography.h3, { color: colors.primary, marginTop: 4 }]}
                      />
                    </Card>

                    <Card style={{ flex: 1, marginHorizontal: 3, backgroundColor: colors.card }}>
                      <Text style={[typography.caption, { color: colors.textSecondary }]}>{t('dailyAverage')}</Text>
                      <AnimatedCounter
                        value={weeklySummary.averageSteps}
                        style={[typography.h3, { color: colors.secondary, marginTop: 4 }]}
                      />
                    </Card>

                    <Card style={{ flex: 1, marginLeft: 6, backgroundColor: colors.card }}>
                      <Text style={[typography.caption, { color: colors.textSecondary }]}>{t('bestDay')}</Text>
                      <Text style={[typography.h3, { color: colors.accent, marginTop: 4 }]}>
                        {weeklySummary.bestDay ? formatSteps(weeklySummary.bestDay.steps) : '0'}
                      </Text>
                    </Card>
                  </View>
                </StaggerItem>
              </View>
            ) : (
              <View style={{ marginTop: spacing.lg }}>
                <View
                  style={[
                    styles.lockedTeaserCard,
                    {
                      backgroundColor: colors.surface,
                      borderColor: colors.cardBorder,
                      borderRadius: borderRadius.xxl,
                    },
                  ]}
                >
                  <View style={[styles.lockIconBox, { backgroundColor: 'rgba(234, 179, 8, 0.15)' }]}>
                    <Ionicons name="lock-closed" size={32} color="#EAB308" />
                  </View>
                  <Text style={styles.lockedBadge}>MEMBER EXCLUSIVE</Text>
                  <Text style={[typography.h3, { color: colors.text, marginTop: 6 }]}>
                    7-Day Trends & Insights
                  </Text>
                  <Text style={[typography.caption, { color: colors.textSecondary, textAlign: 'center', marginTop: 4, paddingHorizontal: 20 }]}>
                    Register a free account to unlock weekly charts, average step velocity, and streak progress.
                  </Text>
                  <TouchableOpacity
                    activeOpacity={0.85}
                    onPress={() => navigation.navigate('Auth', { mode: 'register' })}
                    style={{ marginTop: 16, width: '100%' }}
                  >
                    <LinearGradient
                      colors={['#7C3AED', '#06B6D4']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={[styles.unlockBtn, { borderRadius: borderRadius.lg }]}
                    >
                      <Ionicons name="sparkles" size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
                      <Text style={styles.unlockBtnText}>Register Free to Unlock</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              </View>
            )
          )}

          {/* Tab 3: Month View */}
          {activeTab === 'month' && (
            isMember ? (
              <View style={{ marginTop: spacing.lg }}>
                <StaggerItem index={1}>
                  <ChartCard
                    title={t('monthlySummary')}
                    data={monthChartData}
                    goal={dailyGoal}
                    height={210}
                    unit={t('stepsCount').toLowerCase()}
                  />
                </StaggerItem>

                <StaggerItem index={2}>
                  <View style={[styles.summaryCardsRow, { marginTop: spacing.md }]}>
                    <Card style={{ flex: 1, marginRight: 8, backgroundColor: colors.card }}>
                      <Text style={[typography.caption, { color: colors.textSecondary }]}>{t('totalSteps')}</Text>
                      <AnimatedCounter
                        value={monthlySummary.totalSteps}
                        style={[typography.h3, { color: colors.primary, marginTop: 4 }]}
                      />
                    </Card>

                    <Card style={{ flex: 1, marginLeft: 8, backgroundColor: colors.card }}>
                      <Text style={[typography.caption, { color: colors.textSecondary }]}>{t('dailyAverage')}</Text>
                      <AnimatedCounter
                        value={monthlySummary.averageSteps}
                        style={[typography.h3, { color: colors.secondary, marginTop: 4 }]}
                      />
                    </Card>
                  </View>
                </StaggerItem>
              </View>
            ) : (
              <View style={{ marginTop: spacing.lg }}>
                <View
                  style={[
                    styles.lockedTeaserCard,
                    {
                      backgroundColor: colors.surface,
                      borderColor: colors.cardBorder,
                      borderRadius: borderRadius.xxl,
                    },
                  ]}
                >
                  <View style={[styles.lockIconBox, { backgroundColor: 'rgba(234, 179, 8, 0.15)' }]}>
                    <Ionicons name="lock-closed" size={32} color="#EAB308" />
                  </View>
                  <Text style={styles.lockedBadge}>MEMBER EXCLUSIVE</Text>
                  <Text style={[typography.h3, { color: colors.text, marginTop: 6 }]}>
                    30-Day Historical Analysis
                  </Text>
                  <Text style={[typography.caption, { color: colors.textSecondary, textAlign: 'center', marginTop: 4, paddingHorizontal: 20 }]}>
                    Access full monthly trends, cloud synchronization, and distance records with a free account.
                  </Text>
                  <TouchableOpacity
                    activeOpacity={0.85}
                    onPress={() => navigation.navigate('Auth', { mode: 'register' })}
                    style={{ marginTop: 16, width: '100%' }}
                  >
                    <LinearGradient
                      colors={['#7C3AED', '#06B6D4']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={[styles.unlockBtn, { borderRadius: borderRadius.lg }]}
                    >
                      <Ionicons name="sparkles" size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
                      <Text style={styles.unlockBtnText}>Register Free to Unlock</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              </View>
            )
          )}

          {/* Historical Logs List */}
          <StaggerItem index={3}>
            <View style={{ marginTop: spacing.xxl }}>
              <Text style={[typography.h3, { color: colors.text, marginBottom: spacing.md }]}>
                {t('history')}
              </Text>

              {history.length === 0 ? (
                <Card style={styles.emptyStateCard}>
                  <Ionicons name="calendar-outline" size={38} color={colors.textMuted} />
                  <Text style={[typography.bodyBold, { color: colors.text, marginTop: 8 }]}>
                    {t('noDataYet')}
                  </Text>
                  <Text style={[typography.caption, { color: colors.textSecondary, marginTop: 2 }]}>
                    {t('startWalkingToday')}
                  </Text>
                </Card>
              ) : (
                history.map((record, idx) => (
                  <StaggerItem key={record.date} index={Math.min(idx + 4, 10)}>
                    <PressableScale
                      style={[
                        styles.historyItem,
                        {
                          backgroundColor: isMember ? 'rgba(255, 255, 255, 0.05)' : colors.card,
                          borderColor: isMember ? 'rgba(255, 255, 255, 0.12)' : colors.cardBorder,
                          borderRadius: borderRadius.lg,
                          padding: spacing.md,
                          flexDirection: isRTL ? 'row-reverse' : 'row',
                        },
                      ]}
                    >
                      <View style={styles.historyLeft}>
                        <Text style={[typography.bodyBold, { color: colors.text }]}>
                          {formatDisplayDate(record.date)}
                        </Text>
                        <Text style={[typography.caption, { color: colors.textSecondary }]}>
                          {formatDistance(record.distanceKm, units)} • {record.calories} kcal
                        </Text>
                      </View>

                      <View style={[styles.historyRight, { alignItems: isRTL ? 'flex-start' : 'flex-end' }]}>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                          <Text style={[typography.bodyBold, { color: colors.text, marginRight: 6 }]}>
                            {formatSteps(record.steps)}
                          </Text>
                          {record.goalReached && (
                            <Ionicons name="checkmark-circle" size={18} color={colors.primary} />
                          )}
                        </View>
                        <Text style={[typography.small, { color: colors.textMuted }]}>
                          {record.activeMinutes} mins active
                        </Text>
                      </View>
                    </PressableScale>
                  </StaggerItem>
                ))
              )}
            </View>
          </StaggerItem>

          {!isMember && (
            <StaggerItem index={4}>
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={() => navigation.navigate('Auth', { mode: 'register' })}
                style={[
                  styles.vipBanner,
                  {
                    backgroundColor: colors.surface,
                    borderColor: 'rgba(56, 189, 248, 0.35)',
                    borderRadius: borderRadius.xl,
                  },
                ]}
              >
                <View style={[styles.vipIconCircle, { backgroundColor: 'rgba(56, 189, 248, 0.15)' }]}>
                  <Ionicons name="sparkles" size={20} color="#38BDF8" />
                </View>
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={[typography.bodyBold, { color: colors.text }]}>
                    Unlock Liquid Glass & Cloud History
                  </Text>
                  <Text style={[typography.caption, { color: colors.textSecondary, marginTop: 2 }]}>
                    Sign up free to access full historical trends, frosted glass & voice water alerts.
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
              </TouchableOpacity>
            </StaggerItem>
          )}

          <View style={{ height: 130 }} />
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
    paddingBottom: 32,
  },
  tabBar: {
    padding: 4,
    borderWidth: 1,
    marginTop: 8,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryCardsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  emptyStateCard: {
    alignItems: 'center',
    paddingVertical: 28,
  },
  historyItem: {
    borderWidth: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  historyLeft: {
    flex: 1,
  },
  historyRight: {},
  lockedTeaserCard: {
    alignItems: 'center',
    padding: 24,
    borderWidth: 1,
  },
  lockIconBox: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  lockedBadge: {
    fontSize: 10,
    fontWeight: '800',
    color: '#EAB308',
    letterSpacing: 0.5,
  },
  unlockBtn: {
    height: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  unlockBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13.5,
  },
  vipBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderWidth: 1.5,
    marginTop: 18,
  },
  vipIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
