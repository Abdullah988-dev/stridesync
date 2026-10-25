import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

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
   */
  async scheduleHydrationReminders(): Promise<void> {
    if (Platform.OS === 'web') return;
    if (!this.isConfigured) {
      await this.setupChannel();
    }

    // Cancel previous water reminders before rescheduling
    await this.cancelHydrationReminders();

    const reminderHours = [10, 13, 16, 19, 21]; // 10 AM, 1 PM, 4 PM, 7 PM, 9 PM
    const messages = [
      '💧 Time for your morning glass of water! Boost your energy and focus.',
      '🥤 Halfway through the day! Drink a fresh glass of water to stay active.',
      '⚡ Afternoon hydration boost! Keep your step momentum going with water.',
      '💧 Evening reminder: Reach your daily water goal before dinner.',
      '🌙 Final hydration check: Drink a glass of water to end your day refreshed!',
    ];

    for (let i = 0; i < reminderHours.length; i++) {
      try {
        await Notifications.scheduleNotificationAsync({
          identifier: `${WATER_NOTIFICATION_PREFIX}${reminderHours[i]}`,
          content: {
            title: '💧 Hydration Reminder • StrideSync',
            body: messages[i],
            subtitle: 'Water Tracker',
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
   * Fires an instant celebration notification when user logs a water glass
   */
  async triggerWaterLoggedNotification(glassesToday: number, totalGlasses: number): Promise<void> {
    if (Platform.OS === 'web') return;
    try {
      const isGoalMet = glassesToday >= totalGlasses;
      const title = isGoalMet ? '🎉 Daily Hydration Goal Reached!' : '💧 Glass Logged!';
      const body = isGoalMet
        ? `Incredible! You completed all ${totalGlasses} glasses (${totalGlasses * 250} ml) of water today!`
        : `Great job staying hydrated! You have logged ${glassesToday} of ${totalGlasses} glasses.`;

      await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          subtitle: 'StrideSync Hydration',
          sound: 'default',
          color: '#0284C7',
          priority: Notifications.AndroidNotificationPriority.HIGH,
        },
        trigger: null,
      });
    } catch {}
  }

  async sendTestHydrationReminder(): Promise<void> {
    if (Platform.OS === 'web') return;
    if (!this.isConfigured) {
      await this.setupChannel();
    }
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: '💧 StrideSync Hydration Test',
          body: 'Stay refreshed! This is how your water reminders alert you throughout the day.',
          subtitle: 'Water Alert',
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
