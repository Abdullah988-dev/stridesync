import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAppTheme } from '../theme/themeContext';
import { useWaterStore } from '../store/useWaterStore';
import { useAuthStore } from '../store/useAuthStore';
import { waterNotificationService } from '../services/waterNotificationService';
import { triggerHaptic } from '../utils/soundHaptics';

interface WaterTrackerCardProps {
  onUnlockPress?: () => void;
}

export const WaterTrackerCard: React.FC<WaterTrackerCardProps> = ({ onUnlockPress }) => {
  const { colors, typography, borderRadius } = useAppTheme();
  const { isAuthenticated } = useAuthStore();
  const {
    todayWaterMl,
    dailyGoalMl,
    glassSizeMl,
    loadWater,
    addGlass,
    removeGlass,
  } = useWaterStore();

  useEffect(() => {
    loadWater();
  }, []);

  const totalGlasses = Math.max(1, Math.round(dailyGoalMl / glassSizeMl)); // e.g. 8 glasses
  const glassesDrunk = Math.floor(todayWaterMl / glassSizeMl);
  const percent = Math.min(100, Math.round((todayWaterMl / dailyGoalMl) * 100));

  const handleAddGlass = async () => {
    await addGlass();
    const updatedGlasses = glassesDrunk + 1;
    // Trigger notification
    await waterNotificationService.triggerWaterLoggedNotification(updatedGlasses, totalGlasses);
  };

  const handleRemoveGlass = async () => {
    await removeGlass();
  };

  // 1. Guest / Locked State
  if (!isAuthenticated) {
    return (
      <View
        style={[
          styles.container,
          styles.lockedContainer,
          {
            backgroundColor: colors.surface,
            borderColor: colors.cardBorder,
            borderRadius: borderRadius.xxl,
          },
        ]}
      >
        <View style={styles.lockedHeader}>
          <View style={[styles.lockedIconCircle, { backgroundColor: 'rgba(56, 189, 248, 0.15)' }]}>
            <Ionicons name="water" size={24} color="#38BDF8" />
            <View style={styles.smallLock}>
              <Ionicons name="lock-closed" size={12} color="#FFFFFF" />
            </View>
          </View>
          <View style={{ flex: 1, marginLeft: 12 }}>
            <View style={styles.badgeRow}>
              <Text style={styles.lockedBadge}>MEMBER EXCLUSIVE</Text>
            </View>
            <Text style={[typography.bodyBold, { color: colors.text, marginTop: 2 }]}>
              Daily Water & Hydration Goals
            </Text>
            <Text style={[typography.caption, { color: colors.textSecondary, marginTop: 2 }]}>
              Track 8 daily glasses (2,000 ml) and get smart hydration alerts.
            </Text>
          </View>
        </View>

        <TouchableOpacity
          activeOpacity={0.85}
          onPress={onUnlockPress}
          style={{ marginTop: 14 }}
        >
          <LinearGradient
            colors={['#0284C7', '#0EA5E9']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[styles.unlockButton, { borderRadius: borderRadius.lg }]}
          >
            <Ionicons name="sparkles" size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
            <Text style={styles.unlockButtonText}>Register / Sign In to Unlock</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    );
  }

  // 2. Unlocked / Active State for Registered Users
  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.surface,
          borderColor: 'rgba(14, 165, 233, 0.35)',
          borderRadius: borderRadius.xxl,
        },
      ]}
    >
      {/* Top Header */}
      <View style={styles.activeHeader}>
        <View style={styles.headerTitleRow}>
          <View style={[styles.waterIconBox, { backgroundColor: 'rgba(14, 165, 233, 0.18)' }]}>
            <Ionicons name="water" size={22} color="#38BDF8" />
          </View>
          <View style={{ marginLeft: 10 }}>
            <Text style={[typography.bodyBold, { color: colors.text }]}>Daily Water Tracker</Text>
            <Text style={[typography.small, { color: '#38BDF8', fontWeight: '700' }]}>
              {todayWaterMl} / {dailyGoalMl} ml ({glassesDrunk} of {totalGlasses} glasses)
            </Text>
          </View>
        </View>

        <View style={styles.percentPill}>
          <Text style={styles.percentPillText}>{percent}%</Text>
        </View>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressBarTrack}>
        <LinearGradient
          colors={['#0284C7', '#38BDF8']}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={[styles.progressBarFill, { width: `${Math.max(6, percent)}%` }]}
        />
      </View>

      {/* Interactive 8 Glasses Display */}
      <View style={styles.glassesRow}>
        {Array.from({ length: totalGlasses }).map((_, index) => {
          const isDrunk = index < glassesDrunk;
          return (
            <TouchableOpacity
              key={index}
              activeOpacity={0.7}
              onPress={() => {
                if (index < glassesDrunk) {
                  handleRemoveGlass();
                } else {
                  handleAddGlass();
                }
              }}
              style={styles.glassItem}
            >
              <View
                style={[
                  styles.glassCircle,
                  {
                    backgroundColor: isDrunk ? '#0284C7' : 'rgba(255, 255, 255, 0.05)',
                    borderColor: isDrunk ? '#38BDF8' : colors.cardBorder,
                  },
                ]}
              >
                <Ionicons
                  name={isDrunk ? 'water' : 'water-outline'}
                  size={16}
                  color={isDrunk ? '#FFFFFF' : colors.textMuted}
                />
              </View>
              <Text
                style={[
                  styles.glassLabel,
                  { color: isDrunk ? '#38BDF8' : colors.textMuted },
                ]}
              >
                #{index + 1}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Action Buttons */}
      <View style={styles.actionButtonsRow}>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={handleAddGlass}
          style={styles.addGlassBtn}
        >
          <LinearGradient
            colors={['#0284C7', '#0EA5E9']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[styles.gradientBtn, { borderRadius: borderRadius.lg }]}
          >
            <Ionicons name="add-circle" size={18} color="#FFFFFF" style={{ marginRight: 6 }} />
            <Text style={styles.addGlassBtnText}>+ Drink 1 Glass (250 ml)</Text>
          </LinearGradient>
        </TouchableOpacity>

        {glassesDrunk > 0 && (
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={handleRemoveGlass}
            style={[
              styles.undoBtn,
              {
                borderColor: colors.cardBorder,
                backgroundColor: colors.surfaceGlass,
                borderRadius: borderRadius.lg,
              },
            ]}
          >
            <Ionicons name="remove-circle-outline" size={16} color={colors.textSecondary} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderWidth: 1.5,
    marginVertical: 8,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 4,
  },
  lockedContainer: {
    opacity: 0.95,
  },
  lockedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  lockedIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  smallLock: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: '#EF4444',
    borderRadius: 8,
    padding: 2,
  },
  badgeRow: {
    flexDirection: 'row',
  },
  lockedBadge: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#38BDF8',
    backgroundColor: 'rgba(56, 189, 248, 0.12)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    letterSpacing: 0.5,
  },
  unlockButton: {
    height: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  unlockButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13.5,
  },
  activeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  waterIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  percentPill: {
    backgroundColor: 'rgba(56, 189, 248, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  percentPillText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#38BDF8',
  },
  progressBarTrack: {
    height: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 5,
    marginVertical: 12,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 5,
  },
  glassesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 6,
  },
  glassItem: {
    alignItems: 'center',
  },
  glassCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  glassLabel: {
    fontSize: 9.5,
    fontWeight: '600',
    marginTop: 3,
  },
  actionButtonsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
  },
  addGlassBtn: {
    flex: 1,
  },
  gradientBtn: {
    height: 42,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addGlassBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
  undoBtn: {
    width: 42,
    height: 42,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
});
