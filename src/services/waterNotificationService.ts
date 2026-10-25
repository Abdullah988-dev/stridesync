import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { useAuthStore } from '../store/useAuthStore';
import { useUserStore } from '../store/useUserStore';

const WATER_CHANNEL_ID = 'hydration_reminders';
const WATER_NOTIFICATION_PREFIX = 'water_reminder_';

class WaterNotificationService {
  private isConfigured = false;

  async setupChannel(): Promise<void> {
    if (Platform.OS !== 'android') return;
    try {
      await Notifications.setNotificationChannelAsync(WATER_CHANNEL_ID, {
        name: 'Hydration & Water Alerts',
        importance: Notifications.AndroidImportance.HIGH,
        sound: 'default',
        enableVibrate: true,
        vibrationPattern: [0, 200, 150, 200],
        showBadge: true,
        lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
      });
      this.isConfigured = true;
    } catch {}
  }

  /**
   * Schedules recurring reminders for registered users during the day.
   * GUEST GATE: Guests NEVER receive water reminder notifications or audio alerts.
   */
  async scheduleHydrationReminders(): Promise<void> {
    if (Platform.OS === 'web') return;

    const { isAuthenticated, isGuest } = useAuthStore.getState();
    // Strictly disable for guest users
    if (!isAuthenticated || isGuest) {
      await this.cancelHydrationReminders();
      return;
    }

    if (!this.isConfigured) {
      await this.setupChannel();
    }

    // Cancel previous water reminders before rescheduling
    await this.cancelHydrationReminders();

    const isUrdu = useUserStore.getState().language === 'ur';
    const reminderHours = [10, 13, 16, 19, 21]; // 10 AM, 1 PM, 4 PM, 7 PM, 9 PM

    const englishMessages = [
      '💧 Time for your morning glass of water! Boost your energy and focus.',
      '🥤 Halfway through the day! Drink a fresh glass of water to stay active.',
      '⚡ Afternoon hydration boost! Keep your step momentum going with water.',
      '💧 Evening reminder: Reach your daily water goal before dinner.',
      '🌙 Final hydration check: Drink a glass of water to end your day refreshed!',
    ];

    const urduMessages = [
      '💧 پانی پی لو! صبح کا تازہ پانی پیجیے تاکہ توانائی اور چستی برقرار رہے۔',
      '🥤 آدھا دن مکمل! ایک گلاس تازہ پانی پی کر خود کو متحرک رکھیں۔',
      '⚡ دوپہر کی ہائیڈریشن! قدموں کے ساتھ پانی پینا مت بھولیے۔',
      '💧 شام کا وقت! رات کے کھانے سے پہلے اپنے پانی کا ہدف پورا کریں۔',
      '🌙 دن کا آخری گلاس! پرسکون نیند اور صحت کے لیے پانی پیجیے۔',
    ];

    const messages = isUrdu ? urduMessages : englishMessages;
    const title = isUrdu ? '💧 پانی پی لو! • اسٹرائیڈ سنک' : '💧 Hydration Reminder • StrideSync';
    const subtitle = isUrdu ? 'روزانہ پانی کا ریکارڈ' : 'Water Tracker';

    for (let i = 0; i < reminderHours.length; i++) {
      try {
        await Notifications.scheduleNotificationAsync({
          identifier: `${WATER_NOTIFICATION_PREFIX}${reminderHours[i]}`,
          content: {
            title,
            body: messages[i],
            subtitle,
            sound: 'default',
            color: '#0284C7', // Sky Blue
            priority: Notifications.AndroidNotificationPriority.HIGH,
          },
          trigger: {
            type: Notifications.SchedulableTriggerInputTypes.DAILY,
            hour: reminderHours[i],
            minute: 0,
            channelId: WATER_CHANNEL_ID,
          },
        });
      } catch {}
    }
  }

  /**
   * Fires an instant celebration notification when user logs a water glass.
   * GUEST GATE: Silenced and completely skipped for guests.
   */
  async triggerWaterLoggedNotification(glassesToday: number, totalGlasses: number): Promise<void> {
    if (Platform.OS === 'web') return;

    const { isAuthenticated, isGuest } = useAuthStore.getState();
    if (!isAuthenticated || isGuest) return;

    try {
      const isUrdu = useUserStore.getState().language === 'ur';
      const isGoalMet = glassesToday >= totalGlasses;

      let title: string;
      let body: string;

      if (isUrdu) {
        title = isGoalMet ? '🎉 روزانہ پانی کا ہدف مکمل!' : '💧 گلاس شامل کر دیا گیا!';
        body = isGoalMet
          ? `لاجواب! آپ نے آج کے تمام ${totalGlasses} گلاس (${totalGlasses * 250} ملی لیٹر) پانی پی لیے!`
          : `شاباش! آپ اب تک ${totalGlasses} میں سے ${glassesToday} گلاس پانی پی چکے ہیں۔`;
      } else {
        title = isGoalMet ? '🎉 Daily Hydration Goal Reached!' : '💧 Glass Logged!';
        body = isGoalMet
          ? `Incredible! You completed all ${totalGlasses} glasses (${totalGlasses * 250} ml) of water today!`
          : `Great job staying hydrated! You have logged ${glassesToday} of ${totalGlasses} glasses.`;
      }

      await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          subtitle: isUrdu ? 'اسٹرائیڈ سنک ہائیڈریشن' : 'StrideSync Hydration',
          sound: 'default',
          color: '#0284C7',
          priority: Notifications.AndroidNotificationPriority.HIGH,
        },
        trigger: null,
      });
    } catch {}
  }

  /**
   * Fires a test reminder.
   * GUEST GATE: Skipped for guests.
   */
  async sendTestHydrationReminder(): Promise<void> {
    if (Platform.OS === 'web') return;

    const { isAuthenticated, isGuest } = useAuthStore.getState();
    if (!isAuthenticated || isGuest) return;

    if (!this.isConfigured) {
      await this.setupChannel();
    }

    try {
      const isUrdu = useUserStore.getState().language === 'ur';
      const title = isUrdu ? '💧 پانی پی لو! (ٹیسٹ نوٹیفکیشن)' : '💧 StrideSync Hydration Test';
      const body = isUrdu
        ? 'پانی پی لو! دن بھر آپ کو اسی طرح بروقت پانی پینے کے نوٹیفکیشن اور آواز موصول ہوں گی۔'
        : 'Stay refreshed! This is how your water reminders alert you throughout the day.';

      await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          subtitle: isUrdu ? 'پانی کا الرٹ' : 'Water Alert',
          sound: 'default',
          color: '#0284C7',
          priority: Notifications.AndroidNotificationPriority.HIGH,
        },
        trigger: null,
      });
    } catch {}
  }

  async cancelHydrationReminders(): Promise<void> {
    const reminderHours = [10, 13, 16, 19, 21];
    for (const h of reminderHours) {
      try {
        await Notifications.cancelScheduledNotificationAsync(`${WATER_NOTIFICATION_PREFIX}${h}`);
      } catch {}
    }
  }
}

export const waterNotificationService = new WaterNotificationService();
