import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Alarm } from '../types';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export const notificationService = {
  async requestPermissions(): Promise<boolean> {
    if (!Device.isDevice) {
      alert('Notifications only work on physical devices');
      return false;
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    
    return finalStatus === 'granted';
  },

  async scheduleAlarm(alarm: Alarm): Promise<string> {
    const trigger = {
      hour: alarm.time.getHours(),
      minute: alarm.time.getMinutes(),
      repeats: true,
    };

    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Alarm!',
        body: alarm.label || 'Time to wake up!',
        sound: 'alarm.mp3',
        priority: Notifications.AndroidNotificationPriority.MAX,
        data: { alarmId: alarm.id },
      },
      trigger,
    });

    return id;
  },

  async cancelAlarm(notificationId: string): Promise<void> {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
  },

  async cancelAllAlarms(): Promise<void> {
    await Notifications.cancelAllScheduledNotificationsAsync();
  },
};