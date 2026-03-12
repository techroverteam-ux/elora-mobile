import { Platform, Linking } from 'react-native';

interface AlertButton {
  text: string;
  onPress?: () => void;
  style?: 'default' | 'cancel' | 'destructive';
  icon?: 'check' | 'x' | 'share' | 'folder' | 'settings' | 'warning';
}

class ThemedAlertService {
  private alertHandler: ((title: string, message: string, buttons: AlertButton[]) => void) | null = null;

  setAlertHandler(handler: (title: string, message: string, buttons: AlertButton[]) => void) {
    this.alertHandler = handler;
  }

  show(title: string, message: string, buttons: AlertButton[] = [{ text: 'OK' }]) {
    if (this.alertHandler) {
      this.alertHandler(title, message, buttons);
    }
  }

  // Permission-specific alerts with consistent theming
  showStoragePermissionAlert() {
    this.show(
      '📁 Storage Access Required',
      'We need storage access to save your downloaded files like:\n\n• PDF reports\n• PPT presentations\n• Project documents\n• Work summaries\n\nThis helps you access your files offline and share them easily.',
      [
        { text: 'Not Now', style: 'cancel' },
        { 
          text: 'Allow Access', 
          onPress: () => {
            // This will be handled by the permission service
          }
        }
      ]
    );
  }

  showStoragePermissionDeniedAlert() {
    this.show(
      '📁 Storage Access Needed',
      'Storage permission is required to save downloaded files.\n\nTo enable storage access:\n1. Go to Settings\n2. Find this app\n3. Enable Storage/Files permission\n\nThis allows you to save reports and documents to your device.',
      [
        { text: 'Later', style: 'cancel', icon: 'x' },
        { 
          text: 'Settings', 
          icon: 'settings',
          onPress: () => {
            if (Platform.OS === 'ios') {
              Linking.openURL('app-settings:');
            } else {
              Linking.openSettings();
            }
          }
        }
      ]
    );
  }

  showCameraPermissionAlert() {
    this.show(
      '📸 Camera Access Required',
      'We need camera access to help you:\n\n• Take photos during inspections\n• Capture measurement references\n• Document work progress\n• Create visual reports\n\nYour photos are stored securely and only used for work documentation.',
      [
        { text: 'Not Now', style: 'cancel' },
        { text: 'Allow Camera' }
      ]
    );
  }

  showCameraPermissionDeniedAlert() {
    this.show(
      '📸 Camera Access Needed',
      'Camera access is required for taking inspection photos and measurements.\n\nTo enable camera access:\n1. Go to Settings\n2. Find this app\n3. Enable Camera permission\n\nThis helps you document your work and create visual reports.',
      [
        { text: 'Later', style: 'cancel', icon: 'x' },
        { 
          text: 'Settings', 
          icon: 'settings',
          onPress: () => {
            if (Platform.OS === 'ios') {
              Linking.openURL('app-settings:');
            } else {
              Linking.openSettings();
            }
          }
        }
      ]
    );
  }

  showLocationPermissionAlert() {
    this.show(
      '📍 Location Access Required',
      'We need location access to:\n\n• Add GPS coordinates to photos\n• Show accurate project locations\n• Create location-based reports\n• Track work progress by location\n\nYour location is only used for work purposes and stored securely.',
      [
        { text: 'Not Now', style: 'cancel' },
        { text: 'Allow Location' }
      ]
    );
  }

  showLocationPermissionDeniedAlert() {
    this.show(
      '📍 Location Access Needed',
      'Location access helps provide accurate documentation for your projects.\n\nTo enable location access:\n1. Go to Settings\n2. Find this app\n3. Enable Location permission\n\nThis adds GPS coordinates to your photos and reports.',
      [
        { text: 'Later', style: 'cancel', icon: 'x' },
        { 
          text: 'Settings', 
          icon: 'settings',
          onPress: () => {
            if (Platform.OS === 'ios') {
              Linking.openURL('app-settings:');
            } else {
              Linking.openSettings();
            }
          }
        }
      ]
    );
  }

  showDownloadSuccessAlert(filename: string, location: string, onShare?: () => void, onOpenFolder?: () => void) {
    const buttons: AlertButton[] = [
      { text: 'Done', style: 'default', icon: 'check' }
    ];

    if (onShare) {
      buttons.push({ text: 'Share', icon: 'share', onPress: onShare });
    }

    if (onOpenFolder) {
      buttons.push({ text: 'Folder', icon: 'folder', onPress: onOpenFolder });
    }

    this.show(
      '✅ File Downloaded',
      `${filename} has been saved successfully!\n\n📍 Location: ${location}\n\nYou can now access your file from the Downloads folder or share it with others.`,
      buttons
    );
  }

  showDownloadFailedAlert(filename: string, onShare?: () => void) {
    const buttons: AlertButton[] = [
      { text: 'Cancel', style: 'cancel', icon: 'x' }
    ];

    if (onShare) {
      buttons.push({ 
        text: 'Share', 
        icon: 'share',
        onPress: onShare 
      });
    }

    this.show(
      '❌ Download Failed',
      `Could not save ${filename} to device storage.\n\nThis might be due to:\n• Insufficient storage space\n• Permission restrictions\n• File system limitations\n\nWould you like to share the file instead?`,
      buttons
    );
  }

  showPermissionRequiredAlert(permissions: string[]) {
    const permissionList = permissions.map(p => `• ${p}`).join('\n');
    
    this.show(
      '🔐 Permissions Required',
      `The following permissions are needed for the app to work properly:\n\n${permissionList}\n\nPlease enable these permissions in your device settings to use all features.`,
      [
        { text: 'Cancel', style: 'cancel', icon: 'x' },
        { 
          text: 'Settings', 
          icon: 'settings',
          onPress: () => {
            if (Platform.OS === 'ios') {
              Linking.openURL('app-settings:');
            } else {
              Linking.openSettings();
            }
          }
        }
      ]
    );
  }
}

export const themedAlertService = new ThemedAlertService();