import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useAppTheme } from '../theme/themeContext';
import { useWaterStore } from '../store/useWaterStore';
import { useAuthStore } from '../store/useAuthStore';
import { waterNotificationService } from '../services/waterNotificationService';
import { triggerHaptic } from '../utils/soundHaptics';

interface WaterTrackerCardProps {
  onUnlockPress?: () => void;
}

export const WaterTrackerCard: React.FC<WaterTrackerCardProps> = ({ onUnlockPress }) => {
  const { colors, typography, borderRadius, spacing } = useAppTheme();
  const { isAuthenticated, isGuest } = useAuthStore();
  const {
    todayWaterMl,
    dailyGoalMl,
    glassSizeMl,
    loadWater,
    addGlass,
    removeGlass,
  } = useWaterStore();

  const isMember = isAuthenticated && !isGuest;

  useEffect(() => {
    loadWater();
  }, []);

  const totalGlasses = Math.max(1, Math.round(dailyGoalMl / glassSizeMl)); // e.g. 8 glasses
  const glassesDrunk = Math.floor(todayWaterMl / glassSizeMl);
  const percent = Math.min(100, Math.round((todayWaterMl / dailyGoalMl) * 100));

  const handleAddGlass = async () => {
    if (!isMember) return;
    await triggerHaptic('medium');
    await addGlass();
    const updatedGlasses = glassesDrunk + 1;
    // Trigger notification alert with sound (only registered members)
    await waterNotificationService.triggerWaterLoggedNotification(updatedGlasses, totalGlasses);
  };

  const handleRemoveGlass = async () => {
    if (!isMember) return;
    await triggerHaptic('light');
    await removeGlass();
  };

  // 1. GUEST MODE: Clean solid matte locked card (NO audio, NO notifications)
  if (!isMember) {
    return (
      <View
        style={[
          styles.container,
          styles.guestContainer,
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
              <Ionicons name="lock-closed" size={11} color="#FFFFFF" />
            </View>
          </View>
          <View style={{ flex: 1, marginLeft: 12 }}>
            <View style={styles.badgeRow}>
              <Text style={styles.lockedBadge}>MEMBER EXCLUSIVE</Text>
            </View>
            <Text style={[typography.bodyBold, { color: colors.text, marginTop: 2 }]}>
              Daily Water & Hydration Tracking
            </Text>
            <Text style={[typography.caption, { color: colors.textSecondary, marginTop: 2 }]}>
              Track 8 daily glasses (2,000 ml) and get timely 'Paani pi lo' audio reminders.
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
            <Text style={styles.unlockButtonText}>Register Free to Unlock Water & Audio Alerts</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    );
  }

  // 2. REGISTERED USER: Frosted Liquid Glass Card with active tracker
  return (
    <View
      style={[
        styles.container,
        styles.glassContainer,
        {
          borderRadius: borderRadius.xxl,
          borderColor: 'rgba(56, 189, 248, 0.35)',
        },
      ]}
    >
      {/* Background Frosted Glass Blur */}
      <BlurView
        intensity={40}
        tint="dark"
        style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(8, 47, 73, 0.55)' }]}
      />

      {/* Top Specular Reflection Highlight */}
      <LinearGradient
        colors={['rgba(255, 255, 255, 0.18)', 'rgba(255, 255, 255, 0.02)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={styles.specularGradient}
        pointerEvents="none"
      />

      {/* Top Header */}
      <View style={styles.activeHeader}>
        <View style={styles.headerTitleRow}>
          <View style={[styles.waterIconBox, { backgroundColor: 'rgba(14, 165, 233, 0.22)' }]}>
            <Ionicons name="water" size={22} color="#38BDF8" />
          </View>
          <View style={{ marginLeft: 10 }}>
            <Text style={[typography.bodyBold, { color: '#FFFFFF' }]}>Daily Water Tracker</Text>
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
                    backgroundColor: isDrunk ? '#0284C7' : 'rgba(255, 255, 255, 0.06)',
                    borderColor: isDrunk ? '#38BDF8' : 'rgba(255, 255, 255, 0.15)',
                  },
                ]}
              >
                <Ionicons
                  name={isDrunk ? 'water' : 'water-outline'}
                  size={16}
                  color={isDrunk ? '#FFFFFF' : 'rgba(255, 255, 255, 0.4)'}
                />
              </View>
              <Text
                style={[
                  styles.glassLabel,
                  { color: isDrunk ? '#38BDF8' : 'rgba(255, 255, 255, 0.4)' },
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
                borderColor: 'rgba(255, 255, 255, 0.15)',
                backgroundColor: 'rgba(255, 255, 255, 0.08)',
                borderRadius: borderRadius.lg,
              },
            ]}
          >
            <Ionicons name="remove-circle-outline" size={16} color="#FFFFFF" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderWidth: 1.2,
    marginVertical: 8,
    overflow: 'hidden',
    position: 'relative',
  },
  guestContainer: {
    borderWidth: 1,
  },
  glassContainer: {
    shadowColor: '#0EA5E9',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
  specularGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 48,
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
    fontSize: 13,
  },
  activeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 1,
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
    backgroundColor: 'rgba(56, 189, 248, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.4)',
  },
  percentPillText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#38BDF8',
  },
  progressBarTrack: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 4,
    marginVertical: 14,
    overflow: 'hidden',
    zIndex: 1,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  glassesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 8,
    zIndex: 1,
  },
  glassItem: {
    alignItems: 'center',
  },
  glassCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  glassLabel: {
    fontSize: 10,
    fontWeight: '600',
    marginTop: 4,
  },
  actionButtonsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    zIndex: 1,
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
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
    borderWidth: 1,
  },
});
