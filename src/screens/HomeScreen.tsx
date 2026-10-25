import React, { useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  BackHandler,
  ToastAndroid,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import Animated, { FadeInDown, useReducedMotion } from 'react-native-reanimated';
import { useAppTheme } from '../theme/themeContext';
import { useTranslation } from '../i18n/i18nContext';
import { useStepsStore } from '../store/useStepsStore';
import { useUserStore } from '../store/useUserStore';
import { useAuthStore } from '../store/useAuthStore';
import { AnimatedRing } from '../components/animated/AnimatedRing';
import { StatCard } from '../components/StatCard';
import { ChartCard } from '../components/ChartCard';
import { DailyQuoteCard } from '../components/DailyQuoteCard';
import { WaterTrackerCard } from '../components/WaterTrackerCard';
import { ManualStepModal } from '../components/ManualStepModal';
import { GoalCelebrationModal } from '../components/GoalCelebrationModal';
import { Button } from '../components/common/Button';
import { StaggerItem } from '../components/animated/StaggerItem';
import { PressableScale } from '../components/animated/PressableScale';
import { formatDisplayDate } from '../utils/dateHelpers';
import { formatSteps, kmToMiles } from '../utils/calculations';
import { triggerHaptic } from '../utils/soundHaptics';

export const HomeScreen: React.FC = () => {
  const { colors, typography, spacing, borderRadius } = useAppTheme();
  const { t, isRTL } = useTranslation();
  const reducedMotion = useReducedMotion();

  const {
    todaySteps,
    todayDistanceKm,
    todayCalories,
    todayActiveMinutes,
    isGoalReached,
    hourlySteps,
    todayDate,
    isPedometerAvailable,
    isSimulated,
    showManualEntryModal,
    showGoalCelebration,
    addSteps,
    syncSensorSteps,
    setShowManualEntryModal,
    setShowGoalCelebration,
    refreshHistoryAndSummaries,
  } = useStepsStore();

  const { name, dailyGoal, units } = useUserStore();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [refreshing, setRefreshing] = useState(false);
  const lastBackPressTime = useRef<number>(0);

  // Android Double-Back to Exit & Modal Interception
  useFocusEffect(
    useCallback(() => {
      if (Platform.OS !== 'android') return;

      const onBackPress = () => {
        // 1. If manual step modal is open, back closes it
        if (showManualEntryModal) {
          setShowManualEntryModal(false);
          return true;
        }

        // 2. If celebration modal is open, back closes it
        if (showGoalCelebration) {
          setShowGoalCelebration(false);
          return true;
        }

        // 3. Double back press to exit
        const now = Date.now();
        if (now - lastBackPressTime.current < 2000) {
          BackHandler.exitApp();
          return true;
        }

        lastBackPressTime.current = now;
        ToastAndroid.show('Press back again to exit', ToastAndroid.SHORT);
        return true;
      };

      const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
      return () => subscription.remove();
    }, [showManualEntryModal, showGoalCelebration, setShowManualEntryModal, setShowGoalCelebration])
  );

  const displayDistance =
    units === 'imperial'
      ? kmToMiles(todayDistanceKm).toFixed(2)
      : todayDistanceKm.toFixed(2);
  const distanceUnit = units === 'imperial' ? t('milesUnit') : t('kmUnit');

  const onRefresh = async () => {
    triggerHaptic('light');
    setRefreshing(true);
    await syncSensorSteps();
    await refreshHistoryAndSummaries();
    setRefreshing(false);
  };

  const remaining = Math.max(0, dailyGoal - todaySteps);

  let statusMessage = t('keepGoing');
  if (isGoalReached) {
    statusMessage = t('goalCompleted');
  } else if (remaining <= 2000) {
    statusMessage = t('goalAlmostThere', { remaining: formatSteps(remaining) });
  }

  const hourlyChartData = hourlySteps.map((h) => ({
    label: `${h.hour}h`,
    value: h.steps,
    secondaryLabel: `${h.hour}:00 - ${h.hour + 1}:00`,
  }));

  const getTimeGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ManualStepModal />
      <GoalCelebrationModal />

      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingHorizontal: spacing.lg }]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
      >
        {/* Top Header */}
        <Animated.View
          entering={reducedMotion ? undefined : FadeInDown.duration(400)}
          style={[
            styles.headerRow,
            {
              paddingVertical: spacing.md,
              flexDirection: isRTL ? 'row-reverse' : 'row',
            },
          ]}
        >
          <View style={{ flex: 1 }}>
            <Text style={[typography.caption, { color: colors.textSecondary }]}>
              {formatDisplayDate(todayDate)}
            </Text>
            <Text
              style={[
                typography.h2,
                { color: colors.text, marginTop: 2, textAlign: isRTL ? 'right' : 'left' },
              ]}
              numberOfLines={1}
            >
              {getTimeGreeting()}, {name}!
            </Text>
          </View>

          <PressableScale
            onPress={() => setShowManualEntryModal(true)}
            scaleTo={0.9}
            style={[
              styles.addStepsIconBtn,
              {
                backgroundColor: colors.surface,
                borderColor: colors.cardBorder,
                borderRadius: borderRadius.full,
              },
            ]}
          >
            <Ionicons name="add" size={24} color={colors.primary} />
          </PressableScale>
        </Animated.View>

        {/* Fallback Banner */}
        {(!isPedometerAvailable || isSimulated) && (
          <StaggerItem index={0}>
            <View
              style={[
                styles.noticeBanner,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.accent,
                  borderRadius: borderRadius.md,
                  flexDirection: isRTL ? 'row-reverse' : 'row',
                },
              ]}
            >
              <Ionicons name="information-circle-outline" size={20} color={colors.accent} />
              <Text
                style={[
                  typography.caption,
                  {
                    color: colors.textSecondary,
                    flex: 1,
                    marginHorizontal: 8,
                    textAlign: isRTL ? 'right' : 'left',
                  },
                ]}
              >
                {t('simulationModeActive')}
              </Text>
            </View>
          </StaggerItem>
        )}

        {/* Circular Progress Ring */}
        <View style={{ marginVertical: spacing.lg, alignItems: 'center' }}>
          <AnimatedRing
            steps={todaySteps}
            goal={dailyGoal}
            size={260}
            strokeWidth={20}
            isWalking={true}
          />

          <Text
            style={[
              typography.bodyBold,
              {
                color: isGoalReached ? colors.primaryDark : colors.textSecondary,
                marginTop: spacing.md,
                textAlign: 'center',
              },
            ]}
          >
            {statusMessage}
          </Text>
        </View>

        {/* Staggered Key Metrics Row */}
        <StaggerItem index={1} direction="up">
          <View style={[styles.statsRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
            <StatCard
              title={t('distance')}
              value={displayDistance}
              unit={distanceUnit}
              iconName="navigate-outline"
              color={colors.statDistance}
              bgColor={colors.secondaryLight}
            />
            <View style={{ width: spacing.sm }} />
            <StatCard
              title={t('calories')}
              value={todayCalories}
              unit={t('kcalUnit')}
              iconName="flame-outline"
              color={colors.statCalories}
              bgColor={colors.accentLight}
            />
            <View style={{ width: spacing.sm }} />
            <StatCard
              title={t('activeTime')}
              value={todayActiveMinutes}
              unit={t('minsUnit')}
              iconName="time-outline"
              color={colors.statActiveTime}
              bgColor="rgba(139, 92, 246, 0.12)"
            />
          </View>
        </StaggerItem>

        {/* Water Tracker Section (Active for registered, locked teaser for guest) */}
        <StaggerItem index={2} direction="up">
          <WaterTrackerCard onUnlockPress={() => navigation.navigate('Auth', { mode: 'register' })} />
        </StaggerItem>

        {/* Mini 24h Hourly Breakdown Chart */}
        <StaggerItem index={3} direction="up">
          <View style={{ marginTop: spacing.xl }}>
            <ChartCard
              title={t('hourlyBreakdown')}
              data={hourlyChartData}
              height={170}
              unit={t('stepsCount').toLowerCase()}
            />
          </View>
        </StaggerItem>

        {/* Daily Motivation Quote */}
        <StaggerItem index={4} direction="up">
          <View style={{ marginTop: spacing.lg }}>
            <DailyQuoteCard />
          </View>
        </StaggerItem>

        <View style={{ height: 130 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 8,
    paddingBottom: 32,
  },
  headerRow: {
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  addStepsIconBtn: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  noticeBanner: {
    padding: 10,
    borderWidth: 1,
    alignItems: 'center',
    marginVertical: 4,
  },
  quickAddPill: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  statsRow: {
    justifyContent: 'space-between',
  },
  actionsRow: {
    alignItems: 'center',
  },
});
