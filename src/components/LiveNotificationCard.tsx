import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAppTheme } from '../theme/themeContext';
import { useTranslation } from '../i18n/i18nContext';
import { useStepsStore } from '../store/useStepsStore';
import { useUserStore } from '../store/useUserStore';
import { formatSteps, kmToMiles } from '../utils/calculations';
import { triggerHaptic } from '../utils/soundHaptics';

export interface LiveNotificationCardProps {
  onOpenApp?: () => void;
  onShareStreak?: () => void;
  onLogSteps?: () => void;
}

export const LiveNotificationCard: React.FC<LiveNotificationCardProps> = ({
  onOpenApp,
  onShareStreak,
  onLogSteps,
}) => {
  const { colors, typography, borderRadius } = useAppTheme();
  const { t, isRTL } = useTranslation();

  const {
    todaySteps,
    todayDistanceKm,
    todayCalories,
    todayActiveMinutes,
    isGoalReached,
    syncSensorSteps,
    setShowManualEntryModal,
    setShowGoalCelebration,
  } = useStepsStore();

  const { dailyGoal, units } = useUserStore();

  const progressPercent =
    dailyGoal > 0 ? Math.min(100, Math.round((todaySteps / dailyGoal) * 100)) : 0;

  const displayDistance =
    units === 'imperial'
      ? `${kmToMiles(todayDistanceKm).toFixed(2)} mi`
      : `${todayDistanceKm.toFixed(2)} km`;

  const formatDuration = (mins: number) => {
    if (!mins || mins < 1) return '0m';
    if (mins < 60) return `${mins}m`;
    const hrs = Math.floor(mins / 60);
    const m = mins % 60;
    return m > 0 ? `${hrs}h ${m}m` : `${hrs}h`;
  };

  const handleOpenApp = () => {
    triggerHaptic('light');
    syncSensorSteps();
    if (onOpenApp) onOpenApp();
  };

  const handleShareStreak = () => {
    triggerHaptic('success');
    setShowGoalCelebration(true);
    if (onShareStreak) onShareStreak();
  };

  const handleLogSteps = () => {
    triggerHaptic('medium');
    setShowManualEntryModal(true);
    if (onLogSteps) onLogSteps();
  };

  return (
    <View style={styles.cardContainer}>
      {/* 1. Top Header Row: Icon + App Name + Just now */}
      <View style={[styles.headerRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
        <View style={styles.appIdentity}>
          <Image
            source={require('../../assets/icon.png')}
            style={styles.appIcon}
            resizeMode="cover"
          />
          <Text style={styles.appName}>StrideSync Live</Text>
        </View>
        <Text style={styles.timestamp}>Just now</Text>
      </View>

      {/* 2. Main Headings */}
      <View style={styles.headingsWrapper}>
        <Text style={styles.goalStatusTitle}>
          {isGoalReached ? 'Daily Goal Reached! 🎉' : 'Daily Step Tracker 🏃'}
        </Text>
        <Text style={styles.stepsAchievedHeading}>
          {isGoalReached
            ? `${formatSteps(todaySteps)} Steps Achieved!`
            : `${formatSteps(todaySteps)} Steps Walked!`}
        </Text>
      </View>

      {/* 3. Progress Bar */}
      <View style={styles.progressSection}>
        <View style={styles.progressBarTrack}>
          <LinearGradient
            colors={['#0D9488', '#14B8A6']}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}
            style={[
              styles.progressBarFill,
              { width: `${Math.max(8, progressPercent)}%` },
            ]}
          >
            <View style={styles.progressPercentPill}>
              <Text style={styles.progressPercentText}>{progressPercent}%</Text>
            </View>
          </LinearGradient>
        </View>

        <Text style={styles.progressSubtext}>
          {progressPercent}% of {formatSteps(dailyGoal)} steps
        </Text>
      </View>

      {/* 4. Three Metrics Pills */}
      <View style={[styles.metricsContainer, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
        {/* Distance Pill */}
        <View style={[styles.metricPill, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
          <View style={[styles.metricIconCircle, { backgroundColor: 'rgba(45, 212, 191, 0.2)' }]}>
            <Ionicons name="navigate" size={13} color="#2DD4BF" />
          </View>
          <Text style={[styles.metricText, { color: '#2DD4BF' }]}>{displayDistance}</Text>
        </View>

        {/* Calories Pill */}
        <View style={[styles.metricPill, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
          <View style={[styles.metricIconCircle, { backgroundColor: 'rgba(245, 158, 11, 0.2)' }]}>
            <Ionicons name="flame" size={14} color="#F59E0B" />
          </View>
          <Text style={[styles.metricText, { color: '#FBBF24' }]}>{todayCalories} kcal</Text>
        </View>

        {/* Active Time Pill */}
        <View style={[styles.metricPill, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
          <View style={[styles.metricIconCircle, { backgroundColor: 'rgba(129, 140, 248, 0.2)' }]}>
            <Ionicons name="time" size={14} color="#818CF8" />
          </View>
          <Text style={[styles.metricText, { color: '#93C5FD' }]}>
            {formatDuration(todayActiveMinutes)}
          </Text>
        </View>
      </View>

      {/* 5. Action Buttons Row */}
      <View style={[styles.actionsRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={handleOpenApp}
          style={styles.actionButton}
        >
          <Ionicons name="open-outline" size={15} color="#CBD5E1" style={{ marginRight: 6 }} />
          <Text style={styles.actionButtonText}>Open App</Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.7}
          onPress={handleShareStreak}
          style={styles.actionButton}
        >
          <Ionicons name="share-social-outline" size={15} color="#CBD5E1" style={{ marginRight: 6 }} />
          <Text style={styles.actionButtonText}>Share Streak</Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.7}
          onPress={handleLogSteps}
          style={styles.actionButton}
        >
          <Ionicons name="footsteps-outline" size={15} color="#CBD5E1" style={{ marginRight: 6 }} />
          <Text style={styles.actionButtonText}>Log Steps</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: '#0A1122',
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#1E293B',
    padding: 16,
    marginVertical: 12,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.45,
    shadowRadius: 14,
    elevation: 8,
  },
  headerRow: {
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  appIdentity: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  appIcon: {
    width: 28,
    height: 28,
    borderRadius: 8,
    marginRight: 8,
  },
  appName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  timestamp: {
    fontSize: 13,
    color: '#94A3B8',
    fontWeight: '500',
  },
  headingsWrapper: {
    marginBottom: 14,
  },
  goalStatusTitle: {
    fontSize: 19,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.3,
  },
  stepsAchievedHeading: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
    marginTop: 2,
    letterSpacing: -0.4,
  },
  progressSection: {
    marginBottom: 14,
  },
  progressBarTrack: {
    height: 24,
    borderRadius: 12,
    backgroundColor: '#0F2C2A',
    overflow: 'hidden',
    justifyContent: 'center',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingRight: 4,
  },
  progressPercentPill: {
    backgroundColor: 'rgba(10, 20, 30, 0.75)',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  progressPercentText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  progressSubtext: {
    fontSize: 13,
    fontWeight: '600',
    color: '#2DD4BF',
    textAlign: 'right',
    marginTop: 6,
  },
  metricsContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    paddingVertical: 10,
    paddingHorizontal: 8,
    justifyContent: 'space-around',
    alignItems: 'center',
    marginBottom: 14,
  },
  metricPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  metricIconCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 6,
  },
  metricText: {
    fontSize: 13.5,
    fontWeight: '700',
  },
  actionsRow: {
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1E293B',
    borderRadius: 16,
    paddingVertical: 9,
    marginHorizontal: 3,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#F1F5F9',
  },
});
