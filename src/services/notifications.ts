import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async (notification) => {
    const isLive = notification?.request?.identifier === 'stridesync_live_steps';
    return {
      shouldShowAlert: true,
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: !isLive,
      shouldSetBadge: false,
      priority: isLive
        ? Notifications.AndroidNotificationPriority.LOW
        : Notifications.AndroidNotificationPriority.HIGH,
    };
  },
});

class NotificationService {
  /**
   * Requests push notification permissions.
   */
  async requestPermissions(): Promise<boolean> {
    if (Platform.OS === 'web') return false;

    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        return false;
      }

      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'StrideSync Reminders',
          importance: Notifications.AndroidImportance.HIGH,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#10B981',
        });
      }

      return true;
    } catch (e) {
      console.warn('Failed to request notification permissions:', e);
      return false;
    }
  }

  /**
   * Schedules standard daily reminders: Morning Motivation & Evening Progress Check.
   */
  async scheduleDailyReminders(enabled: boolean): Promise<void> {
    if (Platform.OS === 'web') return;

    try {
      // Cancel existing scheduled reminders first
      await Notifications.cancelAllScheduledNotificationsAsync();

      if (!enabled) return;

      const hasPermission = await this.requestPermissions();
      if (!hasPermission) return;

      // 1. Morning Motivation (8:00 AM)
      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Good morning! ☀️ Time to stride',
          body: 'A brisk walk today will boost your energy and focus. Start strong!',
          sound: true,
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DAILY,
          hour: 8,
          minute: 0,
        },
      });

      // 2. Evening Goal Check (7:00 PM)
      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Evening Goal Check 🎯',
          body: "You are close to your daily step goal! Take an evening walk to crush it.",
          sound: true,
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DAILY,
          hour: 19,
          minute: 0,
        },
      });
    } catch (error) {
      console.warn('Failed to schedule daily reminders:', error);
    }
  }

  /**
   * Triggers an immediate congratulatory notification when user reaches daily goal.
   */
  async triggerGoalReachedNotification(goalSteps: number): Promise<void> {
    if (Platform.OS === 'web') return;

    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Goal Reached! 🏆🎉',
          body: `Incredible job! You achieved your target of ${goalSteps.toLocaleString()} steps today!`,
          sound: true,
        },
        trigger: null, // trigger immediately
      });
    } catch (error) {
      console.warn('Failed to trigger goal notification:', error);
    }
  }
}

export const notificationService = new NotificationService();
