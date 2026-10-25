import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import { formatSteps, kmToMiles, UnitSystem } from '../utils/calculations';
import { SupportedLanguage } from '../i18n/translations';
import { notificationService } from './notifications';

const LAST_GOAL_ALERT_KEY = '@stridesync_last_goal_alert_date';
export const LIVE_NOTIFICATION_ID = 'stridesync_live_steps';
export const STEP_CHANNEL_ID = 'step_tracking_live';
export const GOAL_CHANNEL_ID = 'goal_alerts';
const ANDROID_COLOR_TEAL = '#0D9488';

/**
 * Formats minutes into human-readable duration (e.g. 190 min -> 3h 10m).
 */
function formatActiveDuration(minutes: number): string {
  if (!minutes || minutes < 1) return '0m';
  if (minutes < 60) return `${minutes}m`;
  const hrs = Math.floor(minutes / 60);
  const remainingMins = minutes % 60;
  return remainingMins > 0 ? `${hrs}h ${remainingMins}m` : `${hrs}h`;
}

/**
 * Builds a continuous, smooth visual progress bar matching the reference image.
 * e.g. ━━━━━━━━━━━━━━━━━━━━ 100%
 */
function buildSmoothProgressBar(percent: number, totalLength: number = 18): string {
  const clamped = Math.max(0, Math.min(100, percent));
  const filled = Math.min(totalLength, Math.max(0, Math.round((clamped / 100) * totalLength)));
  const empty = totalLength - filled;
  return '━'.repeat(filled) + '─'.repeat(empty);
}

export interface NotificationUpdateData {
  steps: number;
  goal: number;
  distanceKm: number;
  calories: number;
  activeMinutes: number;
  units: UnitSystem;
  language: SupportedLanguage;
  isPaused?: boolean;
}

class LiveNotificationService {
  private lastUpdateTime = 0;
  private isInitialized = false;

  /**
   * Initializes notification channels for ongoing step tracking and goal alerts.
   * Configures channels in both Expo Notifications (Expo Go) and Notifee (Native Build).
   */
  async initNotificationChannels(): Promise<void> {
    if (Platform.OS === 'android') {
      try {
        // Channel 1: Ongoing live step tracking (Low importance, silent in shade, no heads-up beep)
        await Notifications.setNotificationChannelAsync(STEP_CHANNEL_ID, {
          name: 'Live Step Tracker',
          importance: Notifications.AndroidImportance.LOW,
          sound: null,
          enableVibrate: false,
          vibrationPattern: null,
          showBadge: false,
          lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
        });

        // Channel 2: Goal celebration alerts (High importance, sound, vibration)
        await Notifications.setNotificationChannelAsync(GOAL_CHANNEL_ID, {
          name: 'Goal Achievements & Alerts',
          importance: Notifications.AndroidImportance.HIGH,
          sound: 'default',
          enableVibrate: true,
          vibrationPattern: [0, 250, 250, 250],
          showBadge: true,
          lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
        });
      } catch (e) {
        console.warn('Expo Notifications channel initialization failed:', e);
      }
    }

    this.isInitialized = true;
  }

  /**
   * Updates or posts the persistent, ongoing live step notification.
   * Formatted to match the reference design:
   * - App branding: StrideSync Live
   * - Daily Goal Reached! 🎉 / Daily Step Tracker 🏃
   * - [steps] Steps Achieved!
   * - Progress Bar & [percent]% of [goal] steps
   * - Metric pills: 📍 [distance] • 🔥 [calories] • ⏱ [duration]
   * - Actions: [ ↗ Open App ] [ ⑂ Share Streak ] [ 👣 Log Steps ]
   */
  async updateLiveStepNotification(data: NotificationUpdateData, force: boolean = false): Promise<void> {
    if (Platform.OS === 'web') return;

    // Throttle updates to at most once every 3 seconds to preserve battery, unless forced
    const now = Date.now();
    if (!force && now - this.lastUpdateTime < 3000 && data.steps % 50 !== 0) {
      return;
    }
    this.lastUpdateTime = now;

    if (!this.isInitialized) {
      await this.initNotificationChannels();
    }

    const isUrdu = data.language === 'ur';
    const isGoalReached = data.steps >= data.goal && data.goal > 0;
    const progressPercent =
      data.goal > 0 ? Math.min(100, Math.round((data.steps / data.goal) * 100)) : 0;

    // Distance formatting
    const distance =
      data.units === 'imperial'
        ? `${kmToMiles(data.distanceKm).toFixed(2)} mi`
        : `${data.distanceKm.toFixed(2)} km`;

    // Title matching reference: "Daily Goal Reached! 🎉" or "Daily Step Tracker 🏃"
    const title = isGoalReached
      ? isUrdu
        ? 'ہدف مکمل ہو گیا! 🎉'
        : 'Daily Goal Reached! 🎉'
      : isUrdu
      ? 'روزانہ لائیو اسٹیپ ٹریکر 🏃'
      : 'Daily Step Tracker 🏃';

    // Subtitle / Heading: "19,000 Steps Achieved!"
    const stepsHeading = isGoalReached
      ? isUrdu
        ? `${formatSteps(data.steps)} قدم مکمل کر لیے!`
        : `${formatSteps(data.steps)} Steps Achieved!`
      : isUrdu
      ? `${formatSteps(data.steps)} قدم مکمل`
      : `${formatSteps(data.steps)} Steps Walked`;

    // Progress Bar line
    const smoothBar = buildSmoothProgressBar(progressPercent, 18);
    const goalComparison = isUrdu
      ? `${progressPercent}% از ${formatSteps(data.goal)} قدم`
      : `${progressPercent}% of ${formatSteps(data.goal)} steps`;

    // Metric row with icons matching reference
    const activeTimeStr = formatActiveDuration(data.activeMinutes);
    const metricsRow = `📍 ${distance}   •   🔥 ${data.calories} kcal   •   ⏱ ${activeTimeStr}`;

    // Action buttons representation
    const actionButtonsText = '[ ↗ Open App ]   [ ⑂ Share Streak ]   [ 👣 Log Steps ]';

    // Full multi-line layout for BigText
    const summaryText = `${stepsHeading}\n[ ${smoothBar} ] ${progressPercent}%\n${goalComparison}\n\n${metricsRow}\n\n${actionButtonsText}`;

    // Schedule or update live notification using expo-notifications
    try {
      await Notifications.scheduleNotificationAsync({
        identifier: LIVE_NOTIFICATION_ID,
        content: {
          title,
          body: summaryText,
          subtitle: 'StrideSync Live',
          sticky: true,
          autoDismiss: false,
          color: ANDROID_COLOR_TEAL,
          priority: Notifications.AndroidNotificationPriority.LOW,
        },
        trigger: {
          channelId: STEP_CHANNEL_ID,
        },
      });
    } catch {
      // Fallback if trigger object with channelId is not supported by device
      try {
        await Notifications.scheduleNotificationAsync({
          identifier: LIVE_NOTIFICATION_ID,
          content: {
            title,
            body: summaryText,
            subtitle: 'StrideSync Live',
            sticky: true,
            autoDismiss: false,
            color: ANDROID_COLOR_TEAL,
            priority: Notifications.AndroidNotificationPriority.LOW,
          },
          trigger: null,
        });
      } catch (innerErr) {
        console.warn('Failed to display live step notification via expo-notifications:', innerErr);
      }
    }
  }

  /**
   * Fires a one-time goal celebration alert with sound and vibration (only once per day).
   */
  async triggerGoalCelebrationAlert(goal: number, _language: SupportedLanguage = 'en'): Promise<void> {
    try {
      const todayStr = new Date().toISOString().slice(0, 10);
      const lastAlertDate = await AsyncStorage.getItem(LAST_GOAL_ALERT_KEY);

      // Only alert once per day!
      if (lastAlertDate === todayStr) {
        return;
      }

      await AsyncStorage.setItem(LAST_GOAL_ALERT_KEY, todayStr);
      await notificationService.triggerGoalReachedNotification(goal);
    } catch (e) {
      console.warn('Failed to trigger goal celebration alert:', e);
    }
  }

  /**
   * Cancels the persistent live step notification immediately.
   */
  async cancelLiveNotification(): Promise<void> {
    try {
      await Notifications.dismissNotificationAsync(LIVE_NOTIFICATION_ID);
    } catch {}

    try {
      await Notifications.cancelScheduledNotificationAsync(LIVE_NOTIFICATION_ID);
    } catch {}
  }
}

export const liveNotificationService = new LiveNotificationService();
