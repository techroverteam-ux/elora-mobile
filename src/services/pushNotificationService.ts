import PushNotification from 'react-native-push-notification';
import { Platform } from 'react-native';

class PushNotificationService {
  constructor() {
    this.configure();
  }

  configure() {
    PushNotification.configure({
      onRegister: function (token) {
        console.log('TOKEN:', token);
      },
      onNotification: function (notification) {
        console.log('NOTIFICATION:', notification);
      },
      permissions: {
        alert: true,
        badge: true,
        sound: true,
      },
      popInitialNotification: true,
      requestPermissions: Platform.OS === 'ios',
    });

    // Create notification channel for Android
    if (Platform.OS === 'android') {
      PushNotification.createChannel(
        {
          channelId: 'download-channel',
          channelName: 'File Downloads',
          channelDescription: 'Notifications for file download progress and completion',
          playSound: true,
          soundName: 'default',
          importance: 4,
          vibrate: true,
        },
        (created) => console.log(`Download channel created: ${created}`)
      );
    }
  }

  showDownloadStartNotification(filename: string) {
    PushNotification.localNotification({
      channelId: 'download-channel',
      title: '📥 Download Started',
      message: `Downloading ${filename}...`,
      playSound: false,
      vibrate: false,
      ongoing: true,
      id: 1001,
    });
  }

  showDownloadProgressNotification(filename: string, progress: string) {
    PushNotification.localNotification({
      channelId: 'download-channel',
      title: '📥 Downloading...',
      message: `${filename} - ${progress}`,
      playSound: false,
      vibrate: false,
      ongoing: true,
      id: 1001, // Same ID to update the notification
    });
  }

  showDownloadCompleteNotification(filename: string, location: string) {
    // Cancel the ongoing notification first
    PushNotification.cancelLocalNotifications({ id: '1001' });
    
    // Show completion notification
    PushNotification.localNotification({
      channelId: 'download-channel',
      title: '✅ Download Complete',
      message: `${filename} saved to ${location}`,
      playSound: true,
      vibrate: true,
      ongoing: false,
      id: 1002,
      actions: ['Open', 'Share'],
    });
  }

  showDownloadFailedNotification(filename: string, error: string) {
    // Cancel the ongoing notification first
    PushNotification.cancelLocalNotifications({ id: '1001' });
    
    // Show error notification
    PushNotification.localNotification({
      channelId: 'download-channel',
      title: '❌ Download Failed',
      message: `Failed to download ${filename}: ${error}`,
      playSound: true,
      vibrate: true,
      ongoing: false,
      id: 1003,
    });
  }

  cancelDownloadNotifications() {
    PushNotification.cancelLocalNotifications({ id: '1001' });
    PushNotification.cancelLocalNotifications({ id: '1002' });
    PushNotification.cancelLocalNotifications({ id: '1003' });
  }
}

export const pushNotificationService = new PushNotificationService();