import { Alert, Linking, Platform, NativeModules } from 'react-native';
import { launchCamera, ImagePickerResponse, MediaType } from 'react-native-image-picker';

export interface CameraOption {
  id: string;
  name: string;
  type: 'device' | 'gps_app';
  packageName?: string;
  urlScheme?: string;
  description: string;
  isAvailable: boolean;
  icon: string;
}

export interface CameraDetectionResult {
  deviceCameras: CameraOption[];
  gpsApps: CameraOption[];
  totalAvailable: number;
}

// Real package names of popular GPS camera apps on Android
const GPS_APPS_ANDROID = [
  { id: 'gps_map_camera',       name: 'GPS Map Camera',        packageName: 'com.gpsmapcamera.app',           icon: '📍' },
  { id: 'gps_map_camera2',      name: 'GPS Map Camera',        packageName: 'com.gpsmapcamera',               icon: '📍' },
  { id: 'timestamp_camera',     name: 'Timestamp Camera',      packageName: 'com.jeyluta.timestampcamerafree', icon: '⏰' },
  { id: 'timestamp_camera_pro', name: 'Timestamp Camera Pro',  packageName: 'com.jeyluta.timestampcamera',    icon: '⏰' },
  { id: 'gps_camera_map',       name: 'GPS Camera & Map',      packageName: 'com.gps.camera.map',             icon: '🗺️' },
  { id: 'photo_gps',            name: 'Photo GPS',             packageName: 'com.photogps.app',               icon: '📷' },
  { id: 'open_camera',          name: 'Open Camera',           packageName: 'net.sourceforge.opencamera',     icon: '📷' },
  { id: 'gcam',                 name: 'Google Camera',         packageName: 'com.google.android.GoogleCamera', icon: '📷' },
  { id: 'camera_mx',            name: 'Camera MX',             packageName: 'com.magix.camera_mx',            icon: '📷' },
  { id: 'snap_camera',          name: 'Snap Camera',           packageName: 'com.snap.android',               icon: '👻' },
];

const GPS_APPS_IOS = [
  { id: 'gps_map_camera_ios',  name: 'GPS Map Camera',   urlScheme: 'gpsmapcamera://',    icon: '📍' },
  { id: 'timestamp_cam_ios',   name: 'Timestamp Camera', urlScheme: 'timestampcam://',    icon: '⏰' },
  { id: 'geo_camera_ios',      name: 'Geo Camera',       urlScheme: 'geocamera://',       icon: '🗺️' },
];

class CameraDetectionService {

  async detectAllCameras(): Promise<CameraDetectionResult> {
    // Device camera is always available — just one entry that opens the system camera chooser
    const deviceCameras: CameraOption[] = [
      {
        id: 'device_camera',
        name: 'Device Camera',
        type: 'device',
        description: 'Opens your default camera app',
        isAvailable: true,
        icon: '📷',
      },
    ];

    const gpsApps = await this.detectInstalledGPSApps();

    return {
      deviceCameras,
      gpsApps,
      totalAvailable: deviceCameras.length + gpsApps.length,
    };
  }

  private async detectInstalledGPSApps(): Promise<CameraOption[]> {
    const installed: CameraOption[] = [];

    if (Platform.OS === 'android') {
      for (const app of GPS_APPS_ANDROID) {
        const isAvailable = await this.isAndroidPackageInstalled(app.packageName);
        if (isAvailable) {
          installed.push({
            id: app.id,
            name: app.name,
            type: 'gps_app',
            packageName: app.packageName,
            description: `Open ${app.name} to capture with GPS stamp`,
            isAvailable: true,
            icon: app.icon,
          });
        }
      }
    } else {
      for (const app of GPS_APPS_IOS) {
        const isAvailable = await this.isiOSAppInstalled(app.urlScheme);
        if (isAvailable) {
          installed.push({
            id: app.id,
            name: app.name,
            type: 'gps_app',
            urlScheme: app.urlScheme,
            description: `Open ${app.name} to capture with GPS stamp`,
            isAvailable: true,
            icon: app.icon,
          });
        }
      }
    }

    return installed;
  }

  private async isAndroidPackageInstalled(packageName: string): Promise<boolean> {
    try {
      // Use market:// scheme — if the package is installed, Android can resolve it
      const url = `market://details?id=${packageName}`;
      // A more reliable check: try to open the app directly
      const appUrl = `intent://launch#Intent;package=${packageName};end`;
      return await Linking.canOpenURL(appUrl);
    } catch {
      return false;
    }
  }

  private async isiOSAppInstalled(urlScheme: string): Promise<boolean> {
    try {
      return await Linking.canOpenURL(urlScheme);
    } catch {
      return false;
    }
  }

  async launchSelectedCamera(
    camera: CameraOption,
    onCapture: (photoUri: string, metadata?: any) => void,
    onError?: (error: string) => void
  ): Promise<void> {
    if (camera.type === 'device') {
      await this.launchDeviceCamera(onCapture, onError);
    } else {
      await this.launchGPSApp(camera, onError);
    }
  }

  private async launchDeviceCamera(
    onCapture: (photoUri: string, metadata?: any) => void,
    onError?: (error: string) => void
  ): Promise<void> {
    launchCamera(
      {
        mediaType: 'photo' as MediaType,
        includeBase64: false,
        maxHeight: 2000,
        maxWidth: 2000,
        quality: 0.8 as any,
        saveToPhotos: false,
        cameraType: 'back',
      },
      (response: ImagePickerResponse) => {
        if (response.didCancel) return;
        if (response.errorCode || response.errorMessage) {
          onError?.(response.errorMessage || `Camera error: ${response.errorCode}`);
          return;
        }
        if (response.assets?.[0]?.uri) {
          onCapture(response.assets[0].uri, {
            capturedAt: new Date().toISOString(),
            source: 'device_camera',
          });
        } else {
          onError?.('No photo captured');
        }
      }
    );
  }

  private async launchGPSApp(
    camera: CameraOption,
    onError?: (error: string) => void
  ): Promise<void> {
    try {
      if (Platform.OS === 'android' && camera.packageName) {
        // Launch the specific app directly
        const url = `intent://launch#Intent;package=${camera.packageName};end`;
        const canOpen = await Linking.canOpenURL(url);
        if (canOpen) {
          await Linking.openURL(url);
          Alert.alert(
            `${camera.name} Opened`,
            `Take your photo in ${camera.name}, then come back to this app and select the photo.`
          );
        } else {
          onError?.(`${camera.name} could not be opened.`);
        }
      } else if (Platform.OS === 'ios' && camera.urlScheme) {
        await Linking.openURL(camera.urlScheme);
      }
    } catch (e) {
      onError?.(`Failed to open ${camera.name}`);
    }
  }

  getRecommendedCameras(useCase: 'measurement' | 'documentation' | 'proof'): string[] {
    return ['device_camera'];
  }
}

export const cameraDetectionService = new CameraDetectionService();
