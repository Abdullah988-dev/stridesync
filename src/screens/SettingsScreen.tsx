import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  Alert,
  Modal,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme, ThemeMode } from '../theme/themeContext';
import { useTranslation } from '../i18n/i18nContext';
import { SupportedLanguage } from '../i18n/translations';
import { useUserStore } from '../store/useUserStore';
import { useStepsStore } from '../store/useStepsStore';
import { useAuthStore } from '../store/useAuthStore';
import { useWaterStore } from '../store/useWaterStore';
import { Header } from '../components/common/Header';
import { Button } from '../components/common/Button';
import { PressableScale } from '../components/animated/PressableScale';
import { StaggerItem } from '../components/animated/StaggerItem';
import { exportStepsToCsv } from '../services/exportService';
import { formatSteps, UnitSystem } from '../utils/calculations';
import { triggerHaptic } from '../utils/soundHaptics';
import { notificationService } from '../services/notifications';
import { liveNotificationService } from '../services/liveNotificationService';
import { waterNotificationService } from '../services/waterNotificationService';
import { stepService } from '../services/stepService';
import { HiddenDebugModal } from '../components/HiddenDebugModal';

interface SettingsScreenProps {
  onNavigateToProfile?: () => void;
  onNavigateToBatteryGuide?: () => void;
  onNavigateToAuth?: (mode?: 'login' | 'register') => void;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({
  onNavigateToProfile,
  onNavigateToBatteryGuide,
  onNavigateToAuth,
}) => {
  const { colors, typography, spacing, borderRadius } = useAppTheme();
  const { t, isRTL } = useTranslation();

  const {
    dailyGoal,
    units,
    theme,
    language,
    notificationsEnabled,
    setDailyGoal,
    setUnits,
    setTheme,
    setLanguage,
    setNotificationsEnabled,
    resetUserData,
  } = useUserStore();

  const { history, resetAllStepData } = useStepsStore();
  const { isAuthenticated, user, logout } = useAuthStore();
  const { dailyGoalMl, setDailyGoal: setWaterGoal } = useWaterStore();

  const [isExporting, setIsExporting] = useState(false);
  const [goalModalVisible, setGoalModalVisible] = useState(false);
  const [tempGoal, setTempGoal] = useState(String(dailyGoal));
  const [resetModalVisible, setResetModalVisible] = useState(false);
  const [debugModalVisible, setDebugModalVisible] = useState(false);
  const [versionTapCount, setVersionTapCount] = useState(0);

  const handleVersionTap = () => {
    const nextCount = versionTapCount + 1;
    if (nextCount >= 5) {
      triggerHaptic('success');
      setDebugModalVisible(true);
      setVersionTapCount(0);
    } else {
      triggerHaptic('light');
      setVersionTapCount(nextCount);
    }
  };

  const handleExportCsv = async () => {
    triggerHaptic('medium');
    setIsExporting(true);
    try {
      if (history.length === 0) {
        Alert.alert(t('exportCsv'), t('noDataYet'));
        setIsExporting(false);
        return;
      }
      await exportStepsToCsv(history);
      Alert.alert(t('exportCsv'), t('exportCsvSuccess'));
    } catch {
      Alert.alert(t('exportCsv'), t('exportCsvError'));
    } finally {
      setIsExporting(false);
    }
  };

  const handleSaveGoal = async () => {
    const parsed = parseInt(tempGoal, 10);
    if (!isNaN(parsed) && parsed >= 1000 && parsed <= 100000) {
      await setDailyGoal(parsed);
      triggerHaptic('success');
      setGoalModalVisible(false);

      if (notificationsEnabled) {
        const metrics = stepService.getCurrentMetrics();
        await liveNotificationService.updateLiveStepNotification(
          {
            steps: metrics.steps,
            goal: parsed,
            distanceKm: metrics.distanceKm,
            calories: metrics.calories,
            activeMinutes: metrics.activeMinutes,
            units,
            language,
            isPaused: metrics.isPaused,
          },
          true
        );
      }
    } else {
      Alert.alert(t('editGoal'), 'Please enter a goal between 1,000 and 100,000 steps.');
    }
  };

  const handleToggleNotifications = async (val: boolean) => {
    triggerHaptic('light');
    if (val) {
      const granted = await notificationService.requestPermissions();
      if (!granted) {
        Alert.alert(
          'Notification Permission',
          'Please enable notifications for StrideSync in your phone settings to see live step progress in the notification tray.'
        );
      }
      await setNotificationsEnabled(true);
      await liveNotificationService.initNotificationChannels();
      const metrics = stepService.getCurrentMetrics();
      await liveNotificationService.updateLiveStepNotification(
        {
          steps: metrics.steps,
          goal: dailyGoal,
          distanceKm: metrics.distanceKm,
          calories: metrics.calories,
          activeMinutes: metrics.activeMinutes,
          units,
          language,
          isPaused: metrics.isPaused,
        },
        true
      );
    } else {
      await setNotificationsEnabled(false);
      await liveNotificationService.cancelLiveNotification();
    }
  };

  const handleConfirmReset = async () => {
    triggerHaptic('heavy');
    await resetAllStepData();
    await resetUserData();
    setResetModalVisible(false);
    Alert.alert('Reset Complete', 'All data has been reset to defaults.');
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <Header title={t('settingsTitle')} />

      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingHorizontal: spacing.lg }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Account / Membership Section */}
        <StaggerItem index={0}>
          <View
            style={[
              styles.accountCard,
              {
                backgroundColor: colors.surface,
                borderColor: isAuthenticated ? 'rgba(16, 185, 129, 0.4)' : colors.cardBorder,
                borderRadius: borderRadius.xl,
              },
            ]}
          >
            <View style={{ flexDirection: isRTL ? 'row-reverse' : 'row', alignItems: 'center' }}>
              <View
                style={[
                  styles.accountAvatar,
                  { backgroundColor: isAuthenticated ? colors.primaryLight : colors.divider },
                ]}
              >
                <Ionicons
                  name={isAuthenticated ? 'person' : 'person-outline'}
                  size={20}
                  color={isAuthenticated ? colors.primaryDark : colors.textMuted}
                />
              </View>
              <View style={{ flex: 1, marginHorizontal: 12 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Text style={[typography.bodyBold, { color: colors.text }]}>
                    {isAuthenticated && user ? user.name : 'Guest User'}
                  </Text>
                  <View
                    style={[
                      styles.accountBadgePill,
                      {
                        backgroundColor: isAuthenticated
                          ? 'rgba(16, 185, 129, 0.15)'
                          : 'rgba(234, 179, 8, 0.15)',
                      },
                    ]}
                  >
                    <Text
                      style={{
                        fontSize: 10,
                        fontWeight: '700',
                        color: isAuthenticated ? colors.primary : '#EAB308',
                      }}
                    >
                      {isAuthenticated ? 'MEMBER' : 'GUEST'}
                    </Text>
                  </View>
                </View>
                <Text
                  style={[typography.small, { color: colors.textSecondary, marginTop: 2 }]}
                  numberOfLines={1}
                >
                  {isAuthenticated && user
                    ? user.email
                    : 'Sign in to unlock water tracker & alerts'}
                </Text>
              </View>

              {isAuthenticated ? (
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => {
                    Alert.alert(
                      'Sign Out',
                      'Are you sure you want to sign out of your account?',
                      [
                        { text: 'Cancel', style: 'cancel' },
                        {
                          text: 'Sign Out',
                          style: 'destructive',
                          onPress: async () => {
                            await logout();
                            await waterNotificationService.cancelHydrationReminders();
                          },
                        },
                      ]
                    );
                  }}
                  style={[styles.signOutBtn, { borderColor: colors.cardBorder }]}
                >
                  <Ionicons name="log-out-outline" size={16} color="#EF4444" />
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => onNavigateToAuth?.('register')}
                  style={[styles.authActionBtn, { backgroundColor: colors.primary }]}
                >
                  <Text style={{ color: '#FFFFFF', fontWeight: '700', fontSize: 12 }}>Sign In</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </StaggerItem>

        {/* Section 1: General */}
        <StaggerItem index={1}>
          <View style={styles.section}>
            <Text style={[typography.caption, { color: colors.textSecondary, marginBottom: 8 }]}>
              {t('generalSection')}
            </Text>

            {/* Edit Daily Goal */}
            <PressableScale
              onPress={() => {
                setTempGoal(String(dailyGoal));
                setGoalModalVisible(true);
              }}
              scaleTo={0.97}
              style={[
                styles.settingItem,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.cardBorder,
                  borderRadius: borderRadius.xl,
                  padding: spacing.md,
                  flexDirection: isRTL ? 'row-reverse' : 'row',
                },
              ]}
            >
              <View style={[styles.itemLeft, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                <View style={[styles.iconCircle, { backgroundColor: colors.primaryLight }]}>
                  <Ionicons name="flag" size={18} color={colors.primaryDark} />
                </View>
                <View style={{ marginHorizontal: 12 }}>
                  <Text style={[typography.bodyBold, { color: colors.text }]}>{t('editGoal')}</Text>
                  <Text style={[typography.caption, { color: colors.textSecondary }]}>
                    {formatSteps(dailyGoal)} {t('stepsCount').toLowerCase()}
                  </Text>
                </View>
              </View>
              <Ionicons name={isRTL ? 'chevron-back' : 'chevron-forward'} size={20} color={colors.textMuted} />
            </PressableScale>

            {/* Profile Shortcut */}
            {onNavigateToProfile && (
              <PressableScale
                onPress={onNavigateToProfile}
                scaleTo={0.97}
                style={[
                  styles.settingItem,
                  {
                    backgroundColor: colors.surface,
                    borderColor: colors.cardBorder,
                    borderRadius: borderRadius.xl,
                    padding: spacing.md,
                    marginTop: 8,
                    flexDirection: isRTL ? 'row-reverse' : 'row',
                  },
                ]}
              >
                <View style={[styles.itemLeft, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                  <View style={[styles.iconCircle, { backgroundColor: colors.secondaryLight }]}>
                    <Ionicons name="person" size={18} color={colors.secondary} />
                  </View>
                  <View style={{ marginHorizontal: 12 }}>
                    <Text style={[typography.bodyBold, { color: colors.text }]}>{t('editProfileTitle')}</Text>
                    <Text style={[typography.caption, { color: colors.textSecondary }]}>
                      Height, weight, stride length
                    </Text>
                  </View>
                </View>
                <Ionicons name={isRTL ? 'chevron-back' : 'chevron-forward'} size={20} color={colors.textMuted} />
              </PressableScale>
            )}

            {/* Battery Guide Shortcut */}
            {onNavigateToBatteryGuide && (
              <PressableScale
                onPress={onNavigateToBatteryGuide}
                scaleTo={0.97}
                style={[
                  styles.settingItem,
                  {
                    backgroundColor: colors.surface,
                    borderColor: colors.cardBorder,
                    borderRadius: borderRadius.xl,
                    padding: spacing.md,
                    marginTop: 8,
                    flexDirection: isRTL ? 'row-reverse' : 'row',
                  },
                ]}
              >
                <View style={[styles.itemLeft, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                  <View style={[styles.iconCircle, { backgroundColor: colors.accentLight }]}>
                    <Ionicons name="shield-checkmark-outline" size={18} color={colors.accent} />
                  </View>
                  <View style={{ marginHorizontal: 12 }}>
                    <Text style={[typography.bodyBold, { color: colors.text }]}>Keep Tracking Active</Text>
                    <Text style={[typography.caption, { color: colors.textSecondary }]}>
                      Prevent Realme, Xiaomi & Samsung from killing app
                    </Text>
                  </View>
                </View>
                <Ionicons name={isRTL ? 'chevron-back' : 'chevron-forward'} size={20} color={colors.textMuted} />
              </PressableScale>
            )}
          </View>
        </StaggerItem>

        {/* Section 2: Preferences */}
        <StaggerItem index={1}>
          <View style={styles.section}>
            <Text style={[typography.caption, { color: colors.textSecondary, marginBottom: 8 }]}>
              {t('preferencesSection')}
            </Text>

            {/* Units Selector */}
            <View
              style={[
                styles.settingItem,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.cardBorder,
                  borderRadius: borderRadius.xl,
                  paddingHorizontal: 14,
                  paddingVertical: 12,
                  flexDirection: isRTL ? 'row-reverse' : 'row',
                },
              ]}
            >
              <View style={[styles.itemLeft, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                <View style={[styles.iconCircle, { backgroundColor: colors.accentLight }]}>
                  <Ionicons name="speedometer-outline" size={18} color={colors.accent} />
                </View>
                <Text
                  style={[typography.bodyBold, { color: colors.text, marginHorizontal: 8, flexShrink: 1 }]}
                  numberOfLines={1}
                >
                  {t('unitsTitle')}
                </Text>
              </View>

              <View style={[styles.segmented, { borderColor: colors.border }]}>
                <PressableScale
                  onPress={() => setUnits('metric')}
                  scaleTo={0.92}
                  style={[
                    styles.segmentBtn,
                    { backgroundColor: units === 'metric' ? colors.primary : 'transparent' },
                  ]}
                >
                  <Text
                    style={[
                      typography.small,
                      { color: units === 'metric' ? '#FFFFFF' : colors.textSecondary, fontWeight: '700' },
                    ]}
                  >
                    km / kg
                  </Text>
                </PressableScale>
                <PressableScale
                  onPress={() => setUnits('imperial')}
                  scaleTo={0.92}
                  style={[
                    styles.segmentBtn,
                    { backgroundColor: units === 'imperial' ? colors.primary : 'transparent' },
                  ]}
                >
                  <Text
                    style={[
                      typography.small,
                      { color: units === 'imperial' ? '#FFFFFF' : colors.textSecondary, fontWeight: '700' },
                    ]}
                  >
                    mi / lb
                  </Text>
                </PressableScale>
              </View>
            </View>

            {/* Theme Selector */}
            <View
              style={[
                styles.settingItem,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.cardBorder,
                  borderRadius: borderRadius.xl,
                  paddingHorizontal: 14,
                  paddingVertical: 12,
                  marginTop: 8,
                  flexDirection: isRTL ? 'row-reverse' : 'row',
                },
              ]}
            >
              <View style={[styles.itemLeft, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                <View style={[styles.iconCircle, { backgroundColor: 'rgba(139, 92, 246, 0.15)' }]}>
                  <Ionicons name="moon-outline" size={18} color={colors.statActiveTime} />
                </View>
                <Text
                  style={[typography.bodyBold, { color: colors.text, marginHorizontal: 8, flexShrink: 1 }]}
                  numberOfLines={1}
                >
                  {t('themeTitle')}
                </Text>
              </View>

              <View style={[styles.segmented, { borderColor: colors.border }]}>
                {(['light', 'dark', 'system'] as ThemeMode[]).map((m) => (
                  <PressableScale
                    key={m}
                    onPress={() => setTheme(m)}
                    scaleTo={0.92}
                    style={[
                      styles.segmentBtn,
                      { backgroundColor: theme === m ? colors.primary : 'transparent' },
                    ]}
                  >
                    <Text
                      style={[
                        typography.small,
                        { color: theme === m ? '#FFFFFF' : colors.textSecondary, textTransform: 'capitalize', fontWeight: '700' },
                      ]}
                    >
                      {m}
                    </Text>
                  </PressableScale>
                ))}
              </View>
            </View>

            {/* Language Selector */}
            <View
              style={[
                styles.settingItem,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.cardBorder,
                  borderRadius: borderRadius.xl,
                  paddingHorizontal: 14,
                  paddingVertical: 12,
                  marginTop: 8,
                  flexDirection: isRTL ? 'row-reverse' : 'row',
                },
              ]}
            >
              <View style={[styles.itemLeft, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                <View style={[styles.iconCircle, { backgroundColor: colors.secondaryLight }]}>
                  <Ionicons name="language-outline" size={18} color={colors.secondary} />
                </View>
                <Text
                  style={[typography.bodyBold, { color: colors.text, marginHorizontal: 8, flexShrink: 1 }]}
                  numberOfLines={1}
                >
                  {t('languageTitle')}
                </Text>
              </View>

              <View style={[styles.segmented, { borderColor: colors.border }]}>
                <PressableScale
                  onPress={() => setLanguage('en')}
                  scaleTo={0.92}
                  style={[
                    styles.segmentBtn,
                    { backgroundColor: language === 'en' ? colors.primary : 'transparent' },
                  ]}
                >
                  <Text
                    style={[
                      typography.small,
                      { color: language === 'en' ? '#FFFFFF' : colors.textSecondary, fontWeight: '700' },
                    ]}
                  >
                    English
                  </Text>
                </PressableScale>
                <PressableScale
                  onPress={() => setLanguage('ur')}
                  scaleTo={0.92}
                  style={[
                    styles.segmentBtn,
                    { backgroundColor: language === 'ur' ? colors.primary : 'transparent' },
                  ]}
                >
                  <Text
                    style={[
                      typography.small,
                      { color: language === 'ur' ? '#FFFFFF' : colors.textSecondary, fontWeight: '700' },
                    ]}
                  >
                    اردو
                  </Text>
                </PressableScale>
              </View>
            </View>
          </View>
        </StaggerItem>

        {/* Section 3: Live Notifications */}
        <StaggerItem index={2}>
          <View style={styles.section}>
            <Text style={[typography.caption, { color: colors.textSecondary, marginBottom: 8 }]}>
              {t('notificationsTitle')}
            </Text>

            <View
              style={[
                styles.settingItem,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.cardBorder,
                  borderRadius: borderRadius.xl,
                  padding: spacing.md,
                  flexDirection: isRTL ? 'row-reverse' : 'row',
                },
              ]}
            >
              <View style={[styles.itemLeft, { flexDirection: isRTL ? 'row-reverse' : 'row', flex: 1 }]}>
                <View style={[styles.iconCircle, { backgroundColor: colors.primaryLight }]}>
                  <Ionicons name="notifications-outline" size={18} color={colors.primaryDark} />
                </View>
                <View style={{ marginHorizontal: 12, flex: 1 }}>
                  <Text style={[typography.bodyBold, { color: colors.text }]}>Live Step Notification</Text>
                  <Text style={[typography.caption, { color: colors.textSecondary }]}>
                    Persistent ongoing lockscreen progress bar
                  </Text>
                </View>
              </View>

              <Switch
                value={notificationsEnabled}
                onValueChange={handleToggleNotifications}
                trackColor={{ false: colors.divider, true: colors.primary }}
                thumbColor="#FFFFFF"
              />
            </View>
          </View>
        </StaggerItem>

        {/* Section 4: Hydration Settings */}
        <StaggerItem index={3}>
          <View style={styles.section}>
            <Text style={[typography.caption, { color: colors.textSecondary, marginBottom: 8 }]}>
              {t('hydrationSection')}
            </Text>

            {isAuthenticated ? (
              <View
                style={[
                  styles.settingItem,
                  {
                    backgroundColor: colors.surface,
                    borderColor: colors.cardBorder,
                    borderRadius: borderRadius.xl,
                    padding: spacing.md,
                    flexDirection: 'column',
                    alignItems: 'stretch',
                  },
                ]}
              >
                <View
                  style={{
                    flexDirection: isRTL ? 'row-reverse' : 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: 12,
                  }}
                >
                  <View style={[styles.itemLeft, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                    <View style={[styles.iconCircle, { backgroundColor: 'rgba(2, 132, 199, 0.15)' }]}>
                      <Ionicons name="water" size={18} color="#0284C7" />
                    </View>
                    <View style={{ marginHorizontal: 12 }}>
                      <Text style={[typography.bodyBold, { color: colors.text }]}>
                        {t('waterGoalLabel')}
                      </Text>
                      <Text style={[typography.caption, { color: colors.textSecondary }]}>
                        {dailyGoalMl / 250} {t('glassesUnit')} ({dailyGoalMl} ml / day)
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Target glasses selector */}
                <View style={[styles.segmented, { borderColor: colors.border, marginBottom: 12 }]}>
                  {[1500, 2000, 2500, 3000].map((amount) => {
                    const glasses = amount / 250;
                    const isSelected = dailyGoalMl === amount;
                    return (
                      <PressableScale
                        key={amount}
                        onPress={async () => {
                          triggerHaptic('light');
                          await setWaterGoal(amount);
                        }}
                        scaleTo={0.92}
                        style={[
                          styles.segmentBtn,
                          { backgroundColor: isSelected ? '#0284C7' : 'transparent' },
                        ]}
                      >
                        <Text
                          style={[
                            typography.small,
                            {
                              color: isSelected ? '#FFFFFF' : colors.textSecondary,
                              fontWeight: '700',
                            },
                          ]}
                        >
                          {glasses} 🥛
                        </Text>
                      </PressableScale>
                    );
                  })}
                </View>

                {/* Test notification button */}
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={async () => {
                    triggerHaptic('medium');
                    await waterNotificationService.sendTestHydrationReminder();
                    Alert.alert('Hydration Alert Sent', 'Check your notification panel to see the water reminder!');
                  }}
                  style={{
                    flexDirection: isRTL ? 'row-reverse' : 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                    paddingVertical: 10,
                    borderRadius: borderRadius.lg,
                    backgroundColor: 'rgba(2, 132, 199, 0.12)',
                    borderWidth: 1,
                    borderColor: 'rgba(2, 132, 199, 0.3)',
                  }}
                >
                  <Ionicons name="notifications-outline" size={16} color="#0284C7" style={{ marginHorizontal: 6 }} />
                  <Text style={{ color: '#0284C7', fontWeight: '700', fontSize: 13 }}>
                    {t('testWaterReminder')}
                  </Text>
                </TouchableOpacity>
              </View>
            ) : (
              <PressableScale
                onPress={() => onNavigateToAuth?.('register')}
                scaleTo={0.98}
                style={[
                  styles.settingItem,
                  {
                    backgroundColor: colors.surface,
                    borderColor: colors.cardBorder,
                    borderRadius: borderRadius.xl,
                    padding: spacing.md,
                    flexDirection: isRTL ? 'row-reverse' : 'row',
                  },
                ]}
              >
                <View style={[styles.itemLeft, { flexDirection: isRTL ? 'row-reverse' : 'row', flex: 1 }]}>
                  <View style={[styles.iconCircle, { backgroundColor: 'rgba(234, 179, 8, 0.15)' }]}>
                    <Ionicons name="lock-closed" size={18} color="#EAB308" />
                  </View>
                  <View style={{ marginHorizontal: 12, flex: 1 }}>
                    <Text style={[typography.bodyBold, { color: colors.text }]}>
                      Unlock Hydration Alerts
                    </Text>
                    <Text style={[typography.caption, { color: colors.textSecondary }]}>
                      Create an account to track daily water glasses & receive timely drink reminders
                    </Text>
                  </View>
                </View>
                <Ionicons name={isRTL ? 'chevron-back' : 'chevron-forward'} size={20} color={colors.textMuted} />
              </PressableScale>
            )}
          </View>
        </StaggerItem>

        {/* Section 5: Data & Backup */}
        <StaggerItem index={4}>
          <View style={styles.section}>
            <Text style={[typography.caption, { color: colors.textSecondary, marginBottom: 8 }]}>
              {t('dataSection')}
            </Text>

            <Button
              title={t('exportCsv')}
              variant="outline"
              icon={<Ionicons name="download-outline" size={18} color={colors.primary} />}
              loading={isExporting}
              onPress={handleExportCsv}
              style={{ marginBottom: 8 }}
            />

            <Button
              title={t('resetData')}
              variant="danger"
              icon={<Ionicons name="trash-outline" size={18} color="#FFFFFF" />}
              onPress={() => {
                triggerHaptic('warning');
                setResetModalVisible(true);
              }}
            />
          </View>
        </StaggerItem>

        {/* Section 5: About */}
        <View style={[styles.section, { alignItems: 'center', marginTop: spacing.xl }]}>
          <TouchableOpacity activeOpacity={0.7} onPress={handleVersionTap}>
            <Text style={[typography.caption, { color: colors.textSecondary }]}>
              StrideSync Mobile App • {t('version')} 2.0.0
            </Text>
          </TouchableOpacity>
          <Text style={[typography.small, { color: colors.textMuted, marginTop: 4 }]}>
            Built with React Native & Expo • High Performance Animations
          </Text>
        </View>

        <View style={{ height: 140 }} />
      </ScrollView>

      {/* Hidden Hardware Debug Modal (Triggered by 5 taps on version) */}
      <HiddenDebugModal visible={debugModalVisible} onClose={() => setDebugModalVisible(false)} />

      {/* Edit Goal Modal */}
      <Modal visible={goalModalVisible} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <View
            style={[
              styles.modalCard,
              {
                backgroundColor: colors.card,
                borderRadius: borderRadius.xxl,
                padding: spacing.xl,
              },
            ]}
          >
            <Text style={[typography.h3, { color: colors.text }]}>{t('editGoal')}</Text>
            <TextInput
              value={tempGoal}
              onChangeText={setTempGoal}
              keyboardType="numeric"
              maxLength={6}
              style={[
                styles.modalInput,
                {
                  backgroundColor: colors.inputBackground,
                  borderColor: colors.border,
                  borderRadius: borderRadius.md,
                  color: colors.text,
                  marginVertical: spacing.lg,
                },
              ]}
            />
            <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
              <Button
                title={t('cancel')}
                variant="ghost"
                onPress={() => setGoalModalVisible(false)}
                style={{ marginRight: 8 }}
              />
              <Button title={t('saveChanges')} variant="gradient" onPress={handleSaveGoal} />
            </View>
          </View>
        </View>
      </Modal>

      {/* Reset Confirmation Modal */}
      <Modal visible={resetModalVisible} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <View
            style={[
              styles.modalCard,
              {
                backgroundColor: colors.card,
                borderRadius: borderRadius.xxl,
                padding: spacing.xl,
              },
            ]}
          >
            <Ionicons name="warning" size={40} color={colors.error} style={{ alignSelf: 'center' }} />
            <Text
              style={[
                typography.h3,
                { color: colors.text, textAlign: 'center', marginTop: spacing.sm },
              ]}
            >
              {t('resetDataConfirmTitle')}
            </Text>
            <Text
              style={[
                typography.body,
                { color: colors.textSecondary, textAlign: 'center', marginVertical: spacing.md },
              ]}
            >
              {t('resetDataConfirmDesc')}
            </Text>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 }}>
              <Button
                title={t('cancel')}
                variant="ghost"
                onPress={() => setResetModalVisible(false)}
                style={{ flex: 1, marginRight: 8 }}
              />
              <Button
                title={t('confirm')}
                variant="danger"
                onPress={handleConfirmReset}
                style={{ flex: 1.2 }}
              />
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  section: {
    marginTop: 20,
  },
  settingItem: {
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  itemLeft: {
    alignItems: 'center',
    flexShrink: 1,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  segmented: {
    flexDirection: 'row',
    borderWidth: 1,
    borderRadius: 10,
    padding: 2,
    flexShrink: 0,
  },
  segmentBtn: {
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 8,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    maxWidth: 380,
  },
  modalInput: {
    borderWidth: 1.5,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 22,
    fontWeight: '700',
  },
  accountCard: {
    borderWidth: 1.5,
    padding: 14,
    marginBottom: 16,
  },
  accountAvatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
  },
  accountBadgePill: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    marginLeft: 6,
  },
  signOutBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  authActionBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
});
