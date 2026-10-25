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
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import Animated, { FadeInDown, useReducedMotion } from 'react-native-reanimated';
import { useAppTheme } from '../theme/themeContext';
import { useTranslation } from '../i18n/i18nContext';
import { useStepsStore } from '../store/useStepsStore';
import { useUserStore } from '../store/useUserStore';
import { useAuthStore } from '../store/useAuthStore';
import { getGlassTheme, GlassThemeId } from '../theme/glassTheme';
import { MeshBackground } from '../components/common/MeshBackground';
import { GlassCard } from '../components/common/GlassCard';
import { ThemePickerModal } from '../components/ThemePickerModal';
import { AnimatedRing } from '../components/animated/AnimatedRing';
import { StatCard } from '../components/StatCard';
import { ChartCard } from '../components/ChartCard';
import { DailyQuoteCard } from '../components/DailyQuoteCard';
import { WaterTrackerCard } from '../components/WaterTrackerCard';
import { ManualStepModal } from '../components/ManualStepModal';
import { GoalCelebrationModal } from '../components/GoalCelebrationModal';
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
    syncSensorSteps,
    setShowManualEntryModal,
    setShowGoalCelebration,
    refreshHistoryAndSummaries,
  } = useStepsStore();

  const { name, dailyGoal, units, glassTheme } = useUserStore();
  const { isAuthenticated, isGuest } = useAuthStore();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const [refreshing, setRefreshing] = useState(false);
  const [showThemePicker, setShowThemePicker] = useState(false);
  const lastBackPressTime = useRef<number>(0);

  const isLiquidGlass = isAuthenticated && !isGuest;
  const currentTheme = getGlassTheme(glassTheme as GlassThemeId);

  // Android Double-Back to Exit & Modal Interception
  useFocusEffect(
    useCallback(() => {
      if (Platform.OS !== 'android') return;

      const onBackPress = () => {
        if (showThemePicker) {
          setShowThemePicker(false);
          return true;
        }

        if (showManualEntryModal) {
          setShowManualEntryModal(false);
          return true;
        }

        if (showGoalCelebration) {
          setShowGoalCelebration(false);
          return true;
        }

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
    }, [showThemePicker, showManualEntryModal, showGoalCelebration, setShowManualEntryModal, setShowGoalCelebration])
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
    <MeshBackground>
      <SafeAreaView style={styles.container}>
        <ManualStepModal />
        <GoalCelebrationModal />
        <ThemePickerModal
          visible={showThemePicker}
          onClose={() => setShowThemePicker(false)}
          onNavigateToAuth={() => navigation.navigate('Auth', { mode: 'register' })}
        />

        <ScrollView
          contentContainerStyle={[styles.scrollContent, { paddingHorizontal: spacing.lg }]}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={isLiquidGlass ? currentTheme.primary : colors.primary}
              colors={[isLiquidGlass ? currentTheme.primary : colors.primary]}
            />
          }
        >
          {/* Top Header Row with Liquid Glass Status */}
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
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 2 }}>
                <Text style={[typography.caption, { color: colors.textSecondary }]}>
                  {formatDisplayDate(todayDate)}
                </Text>

                {/* Status Chip: Liquid Glass [PRO] vs Guest Mode */}
                {isLiquidGlass ? (
                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => setShowThemePicker(true)}
                    style={{ marginLeft: 8 }}
                  >
                    <LinearGradient
                      colors={currentTheme.gradient}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={styles.proPill}
                    >
                      <Ionicons name="sparkles" size={10} color="#FFFFFF" style={{ marginRight: 4 }} />
                      <Text style={styles.proPillText}>{currentTheme.name.toUpperCase()} GLASS</Text>
                      <Ionicons name="chevron-down" size={10} color="#FFFFFF" style={{ marginLeft: 3 }} />
                    </LinearGradient>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => navigation.navigate('Auth', { mode: 'register' })}
                    style={[styles.guestPill, { borderColor: colors.cardBorder }]}
                  >
                    <View style={styles.guestDot} />
                    <Text style={styles.guestPillText}>GUEST MODE • UNLOCK PRO</Text>
                  </TouchableOpacity>
                )}
              </View>

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
                  backgroundColor: isLiquidGlass ? 'rgba(255, 255, 255, 0.08)' : colors.surface,
                  borderColor: isLiquidGlass ? currentTheme.glassBorder : colors.cardBorder,
                  borderRadius: borderRadius.full,
                },
              ]}
            >
              <Ionicons
                name="add"
                size={24}
                color={isLiquidGlass ? currentTheme.primary : colors.primary}
              />
            </PressableScale>
          </Animated.View>

          {/* Guest Unlock Prompt Banner */}
          {!isLiquidGlass && (
            <StaggerItem index={0}>
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={() => navigation.navigate('Auth', { mode: 'register' })}
                style={[
                  styles.guestBanner,
                  {
                    backgroundColor: colors.surface,
                    borderColor: 'rgba(56, 189, 248, 0.3)',
                    borderRadius: borderRadius.xl,
                  },
                ]}
              >
                <View style={[styles.guestBannerIcon, { backgroundColor: 'rgba(56, 189, 248, 0.15)' }]}>
                  <Ionicons name="sparkles" size={18} color="#38BDF8" />
                </View>
                <View style={{ flex: 1, marginLeft: 10 }}>
                  <Text style={[typography.caption, { color: '#38BDF8', fontWeight: '700' }]}>
                    EXPERIENCE LIQUID GLASS UI
                  </Text>
                  <Text style={[typography.small, { color: colors.textSecondary, marginTop: 1 }]}>
                    Register a free account to unlock frosted glass, color auras & voice hydration alerts.
                  </Text>
                </View>
                <Ionicons name="arrow-forward" size={16} color="#38BDF8" />
              </TouchableOpacity>
            </StaggerItem>
          )}

          {/* Fallback Banner for Pedometer */}
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
              gradientColors={isLiquidGlass ? currentTheme.gradient : undefined}
              glowColor={isLiquidGlass ? currentTheme.ringGlow : undefined}
            />

            <Text
              style={[
                typography.bodyBold,
                {
                  color: isGoalReached
                    ? colors.primaryDark
                    : isLiquidGlass
                    ? currentTheme.accent
                    : colors.textSecondary,
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
                color={isLiquidGlass ? currentTheme.secondary : colors.statDistance}
                bgColor={colors.secondaryLight}
              />
              <View style={{ width: spacing.sm }} />
              <StatCard
                title={t('calories')}
                value={todayCalories}
                unit={t('kcalUnit')}
                iconName="flame-outline"
                color={isLiquidGlass ? currentTheme.accent : colors.statCalories}
                bgColor={colors.accentLight}
              />
              <View style={{ width: spacing.sm }} />
              <StatCard
                title={t('activeTime')}
                value={todayActiveMinutes}
                unit={t('minsUnit')}
                iconName="time-outline"
                color={isLiquidGlass ? currentTheme.primary : colors.statActiveTime}
                bgColor="rgba(139, 92, 246, 0.12)"
              />
            </View>
          </StaggerItem>

          {/* Water Tracker Section (Liquid Glass active for registered, locked teaser for guest) */}
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
    </MeshBackground>
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
  proPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
  },
  proPillText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  guestPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderWidth: 1,
  },
  guestDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#EAB308',
    marginRight: 4,
  },
  guestPillText: {
    color: '#EAB308',
    fontSize: 9,
    fontWeight: '700',
  },
  guestBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderWidth: 1,
    marginVertical: 8,
  },
  guestBannerIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noticeBanner: {
    padding: 10,
    borderWidth: 1,
    alignItems: 'center',
    marginVertical: 4,
  },
  statsRow: {
    justifyContent: 'space-between',
  },
});
