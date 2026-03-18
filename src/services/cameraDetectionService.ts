import { Alert, Linking, Platform } from 'react-native';
import { launchCamera, ImagePickerResponse, MediaType } from 'react-native-image-picker';

export interface CameraOption {
  id: string;
  name: string;
  type: 'device' | 'gps_app';
  packageName?: string;
  urlScheme?: string;
  description: string;
  features: string[];
  isAvailable: boolean;
  icon: string;
}

export interface CameraDetectionResult {
  deviceCameras: CameraOption[];
  gpsApps: CameraOption[];
  totalAvailable: number;
}

class CameraDetectionService {
  // Popular GPS Map Camera apps with detailed info
  private readonly GPS_CAMERA_APPS = {
    android: [
      {
        id: 'gps_map_camera',
        name: 'GPS Map Camera',
        packageName: 'com.gpsmapcamera.app',
        description: 'Embeds GPS location and address in photos',
        features: ['GPS Location', 'Address Overlay', 'Timestamp', 'Map View'],
        icon: '📍'
      },
      {
        id: 'gps_map_camera_pro',
        name: 'GPS Map Camera Pro',
        packageName: 'com.gpsmapcamera.pro',
        description: 'Professional GPS camera with advanced features',
        features: ['GPS Location', 'Address Overlay', 'Custom Watermarks', 'High Quality'],
        icon: '📍'
      },
      {
        id: 'gps_timestamp_camera',
        name: 'GPS Timestamp Camera',
        packageName: 'com.gpsmapcamera.timestamp',
        description: 'Adds GPS coordinates and timestamp to photos',
        features: ['GPS Coordinates', 'Timestamp', 'Location Info'],
        icon: '⏰'
      },
      {
        id: 'gps_location_camera',
        name: 'GPS Location Camera',
        packageName: 'com.gpsmapcamera.location',
        description: 'Captures photos with precise location data',
        features: ['Precise GPS', 'Location Details', 'Address Info'],
        icon: '🗺️'
      },
      {
        id: 'gps_coordinates_camera',
        name: 'GPS Coordinates Camera',
        packageName: 'com.gpsmapcamera.coordinates',
        description: 'Shows exact coordinates on photos',
        features: ['Exact Coordinates', 'Latitude/Longitude', 'Altitude'],
        icon: '🧭'
      },
      {
        id: 'gps_address_camera',
        name: 'GPS Address Camera',
        packageName: 'com.gpsmapcamera.address',
        description: 'Embeds full address information in photos',
        features: ['Full Address', 'Street Details', 'City/State Info'],
        icon: '🏠'
      },
      {
        id: 'gps_photo_camera',
        name: 'GPS Photo Camera',
        packageName: 'com.gpsmapcamera.photo',
        description: 'Standard GPS photo camera',
        features: ['GPS Data', 'Photo Metadata', 'Location Tags'],
        icon: '📷'
      },
      {
        id: 'gps_geotag_camera',
        name: 'GPS Geotag Camera',
        packageName: 'com.gpsmapcamera.geotag',
        description: 'Geotags photos with location information',
        features: ['Geotagging', 'Location Metadata', 'GPS Tracking'],
        icon: '🏷️'
      },
      {
        id: 'gps_stamp_camera',
        name: 'GPS Stamp Camera',
        packageName: 'com.gpsmapcamera.stamp',
        description: 'Stamps photos with GPS information',
        features: ['GPS Stamp', 'Custom Stamps', 'Location Watermark'],
        icon: '🔖'
      },
      {
        id: 'gps_watermark_camera',
        name: 'GPS Watermark Camera',
        packageName: 'com.gpsmapcamera.watermark',
        description: 'Adds GPS watermarks to photos',
        features: ['GPS Watermark', 'Custom Text', 'Location Overlay'],
        icon: '💧'
      }
    ],
    ios: [
      {
        id: 'gps_map_camera_ios',
        name: 'GPS Map Camera',
        urlScheme: 'gpsmapcamera://',
        description: 'GPS camera with map integration',
        features: ['GPS Location', 'Map View', 'Address Info'],
        icon: '📍'
      },
      {
        id: 'gps_camera_ios',
        name: 'GPS Camera',
        urlScheme: 'gpscamera://',
        description: 'Simple GPS camera app',
        features: ['GPS Data', 'Location Tags'],
        icon: '📷'
      },
      {
        id: 'location_camera_ios',
        name: 'Location Camera',
        urlScheme: 'locationcamera://',
        description: 'Camera with location services',
        features: ['Location Services', 'GPS Tracking'],
        icon: '🗺️'
      },
      {
        id: 'geo_camera_ios',
        name: 'Geo Camera',
        urlScheme: 'geocamera://',
        description: 'Geographical camera app',
        features: ['Geo Data', 'Coordinates'],
        icon: '🧭'
      },
      {
        id: 'timestamp_camera_ios',
        name: 'Timestamp Camera',
        urlScheme: 'timestampcamera://',
        description: 'Camera with timestamp and GPS',
        features: ['Timestamp', 'GPS Data'],
        icon: '⏰'
      }
    ]
  };

  /**
   * Detect all available cameras and GPS apps
   */
  async detectAllCameras(): Promise<CameraDetectionResult> {
    const deviceCameras = await this.detectDeviceCameras();
    const gpsApps = await this.detectGPSApps();
    
    return {
      deviceCameras,
      gpsApps,
      totalAvailable: deviceCameras.length + gpsApps.length
    };
  }

  /**
   * Detect device cameras (front, back, etc.)
   */
  private async detectDeviceCameras(): Promise<CameraOption[]> {
    const cameras: CameraOption[] = [];
    
    // Standard device cameras - these are always available on mobile devices
    cameras.push({
      id: 'device_back',
      name: 'Back Camera',
      type: 'device',
      description: 'Device rear camera - high quality photos',
      features: ['High Resolution', 'Auto Focus', 'Flash Support', 'HDR'],
      isAvailable: true,
      icon: '📱'
    });

    cameras.push({
      id: 'device_front',
      name: 'Front Camera',
      type: 'device',
      description: 'Device front camera - for selfies',
      features: ['Front Facing', 'Portrait Mode', 'Beauty Mode'],
      isAvailable: true,
      icon: '🤳'
    });

    // Note: In a real implementation, you might use a native module to detect
    // actual camera capabilities, multiple lenses, etc.
    
    return cameras;
  }

  /**
   * Detect available GPS camera apps
   */
  private async detectGPSApps(): Promise<CameraOption[]> {
    const availableApps: CameraOption[] = [];
    
    if (Platform.OS === 'android') {
      for (const app of this.GPS_CAMERA_APPS.android) {
        const isAvailable = await this.checkAndroidAppAvailability(app.packageName);
        availableApps.push({
          id: app.id,
          name: app.name,
          type: 'gps_app',
          packageName: app.packageName,
          description: app.description,
          features: app.features,
          isAvailable,
          icon: app.icon
        });
      }
    } else {
      for (const app of this.GPS_CAMERA_APPS.ios) {
        const isAvailable = await this.checkiOSAppAvailability(app.urlScheme);
        availableApps.push({
          id: app.id,
          name: app.name,
          type: 'gps_app',
          urlScheme: app.urlScheme,
          description: app.description,
          features: app.features,
          isAvailable,
          icon: app.icon
        });
      }
    }
    
    return availableApps;
  }

  /**
   * Check if Android app is available
   */
  private async checkAndroidAppAvailability(packageName: string): Promise<boolean> {
    try {
      const url = `intent://camera#Intent;package=${packageName};end`;
      return await Linking.canOpenURL(url);
    } catch (error) {
      return false;
    }
  }

  /**
   * Check if iOS app is available
   */
  private async checkiOSAppAvailability(urlScheme: string): Promise<boolean> {
    try {
      return await Linking.canOpenURL(urlScheme);
    } catch (error) {
      return false;
    }
  }

  /**
   * Show camera selection dialog
   */
  async showCameraSelectionDialog(
    onCameraSelected: (camera: CameraOption) => void,
    onCancel?: () => void
  ): Promise<void> {
    const detection = await this.detectAllCameras();
    
    if (detection.totalAvailable === 0) {
      Alert.alert('No Cameras Available', 'No cameras or GPS camera apps found on this device.');
      return;
    }

    // Create options array
    const options: Array<{
      text: string;
      onPress: () => void;
      style?: 'default' | 'cancel' | 'destructive';
    }> = [];

    // Add device cameras
    detection.deviceCameras.forEach(camera => {
      if (camera.isAvailable) {
        options.push({
          text: `${camera.icon} ${camera.name}`,
          onPress: () => onCameraSelected(camera)
        });
      }
    });

    // Add available GPS apps
    const availableGPSApps = detection.gpsApps.filter(app => app.isAvailable);
    if (availableGPSApps.length > 0) {
      availableGPSApps.forEach(app => {
        options.push({
          text: `${app.icon} ${app.name} (GPS)`,
          onPress: () => onCameraSelected(app)
        });
      });
    }

    // Add install GPS apps option if none are available
    const unavailableGPSApps = detection.gpsApps.filter(app => !app.isAvailable);
    if (availableGPSApps.length === 0 && unavailableGPSApps.length > 0) {
      options.push({
        text: '📍 Install GPS Camera App',
        onPress: () => this.showGPSAppInstallOptions()
      });
    }

    // Add cancel option
    options.push({
      text: 'Cancel',
      style: 'cancel',
      onPress: () => onCancel?.()
    });

    Alert.alert(
      'Select Camera',
      `Choose from ${detection.totalAvailable} available camera${detection.totalAvailable > 1 ? 's' : ''}:`,
      options
    );
  }

  /**
   * Show GPS app installation options
   */
  private showGPSAppInstallOptions(): void {
    const installOptions = Platform.OS === 'android' 
      ? this.GPS_CAMERA_APPS.android.slice(0, 3) // Show top 3 options
      : this.GPS_CAMERA_APPS.ios.slice(0, 3);

    const options = installOptions.map(app => ({
      text: `${app.icon} Install ${app.name}`,
      onPress: () => this.installGPSApp(app)
    }));

    options.push({
      text: 'Cancel',
      style: 'cancel' as const
    });

    Alert.alert(
      'Install GPS Camera App',
      'Choose a GPS camera app to install for location-embedded photos:',
      options
    );
  }

  /**
   * Install specific GPS app
   */
  private async installGPSApp(app: any): Promise<void> {
    try {
      if (Platform.OS === 'android' && app.packageName) {
        const url = `market://details?id=${app.packageName}`;
        const canOpen = await Linking.canOpenURL(url);
        if (canOpen) {
          await Linking.openURL(url);
        } else {
          await Linking.openURL(`https://play.google.com/store/apps/details?id=${app.packageName}`);
        }
      } else {
        // For iOS, open App Store search
        await Linking.openURL('https://apps.apple.com/search?term=gps+camera');
      }
    } catch (error) {
      Alert.alert('Error', 'Could not open app store. Please search manually.');
    }
  }

  /**
   * Launch selected camera
   */
  async launchSelectedCamera(
    camera: CameraOption,
    onCapture: (photoUri: string, metadata?: any) => void,
    onError?: (error: string) => void
  ): Promise<void> {
    if (camera.type === 'device') {
      await this.launchDeviceCamera(camera, onCapture, onError);
    } else if (camera.type === 'gps_app') {
      await this.launchGPSApp(camera, onCapture, onError);
    }
  }

  /**
   * Launch device camera
   */
  private async launchDeviceCamera(
    camera: CameraOption,
    onCapture: (photoUri: string, metadata?: any) => void,
    onError?: (error: string) => void
  ): Promise<void> {
    const options = {
      mediaType: 'photo' as MediaType,
      includeBase64: false,
      maxHeight: 2000,
      maxWidth: 2000,
      quality: 0.8,
      saveToPhotos: false,
      cameraType: camera.id === 'device_front' ? 'front' as const : 'back' as const,
      storageOptions: {
        skipBackup: true,
        path: 'images',
      },
    };

    launchCamera(options, (response: ImagePickerResponse) => {
      if (response.didCancel) {
        return;
      }

      if (response.errorCode || response.errorMessage) {
        const errorMessage = response.errorMessage || `Camera error: ${response.errorCode}`;
        onError?.(errorMessage);
        return;
      }

      if (response.assets && response.assets[0] && response.assets[0].uri) {
        onCapture(response.assets[0].uri, {
          capturedAt: new Date().toISOString(),
          hasGPSData: false,
          source: 'device_camera',
          cameraType: camera.id,
          cameraName: camera.name
        });
      } else {
        onError?.('No photo was captured');
      }
    });
  }

  /**
   * Launch GPS camera app
   */
  private async launchGPSApp(
    camera: CameraOption,
    onCapture: (photoUri: string, metadata?: any) => void,
    onError?: (error: string) => void
  ): Promise<void> {
    try {
      let opened = false;

      if (Platform.OS === 'android' && camera.packageName) {
        const url = `intent://camera#Intent;package=${camera.packageName};end`;
        const canOpen = await Linking.canOpenURL(url);
        if (canOpen) {
          await Linking.openURL(url);
          opened = true;
        }
      } else if (Platform.OS === 'ios' && camera.urlScheme) {
        const canOpen = await Linking.canOpenURL(camera.urlScheme);
        if (canOpen) {
          await Linking.openURL(camera.urlScheme);
          opened = true;
        }
      }

      if (opened) {
        Alert.alert(
          `${camera.name} Opened`,
          `Take your photo with ${camera.name}. When done, return to this app.`,
          [
            {
              text: 'OK',
              onPress: () => {
                // In a real implementation, you might listen for app state changes
                // to detect when the user returns from the GPS camera app
                console.log(`User opened ${camera.name}`);
              }
            }
          ]
        );
      } else {
        onError?.(`Could not open ${camera.name}. Please ensure it's properly installed.`);
      }
    } catch (error) {
      onError?.(`Error opening ${camera.name}: ${error}`);
    }
  }

  /**
   * Get camera recommendations based on use case
   */
  getRecommendedCameras(useCase: 'measurement' | 'documentation' | 'proof'): string[] {
    switch (useCase) {
      case 'measurement':
        return ['device_back', 'gps_map_camera']; // High quality + GPS for measurements
      case 'documentation':
        return ['gps_map_camera', 'gps_address_camera', 'device_back']; // GPS apps preferred
      case 'proof':
        return ['gps_address_camera', 'gps_map_camera', 'gps_timestamp_camera']; // GPS with address proof
      default:
        return ['device_back'];
    }
  }
}

export const cameraDetectionService = new CameraDetectionService();