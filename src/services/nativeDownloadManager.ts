import { Platform, PermissionsAndroid, Alert } from 'react-native';
import ReactNativeBlobUtil from 'react-native-blob-util';
import Toast from 'react-native-toast-message';

interface DownloadOptions {
  url?: string;
  blob?: Blob;
  filename: string;
  title?: string;
  description?: string;
  onProgress?: (progress: number) => void;
  onComplete?: (filePath: string) => void;
  onError?: (error: string) => void;
}

class NativeDownloadManager {
  private activeDownloads = new Map<string, any>();

  /**
   * Download file using Android's native Download Manager
   * Provides native notification progress and background download
   */
  async downloadFile(options: DownloadOptions): Promise<string> {
    const { filename, title, description, onProgress, onComplete, onError } = options;
    
    try {
      // Check permissions first
      const hasPermission = await this.checkStoragePermission();
      if (!hasPermission) {
        throw new Error('Storage permission denied');
      }

      // Show initial toast
      Toast.show({
        type: 'info',
        text1: '📥 Starting Download',
        text2: filename,
        visibilityTime: 2000,
      });

      let filePath: string;

      if (options.blob) {
        // Handle blob download directly (not using Download Manager)
        filePath = await this.downloadBlob(options.blob, filename, onProgress);
      } else if (options.url) {
        // Handle URL download using Download Manager
        filePath = await this.downloadFromUrl(options.url, filename, title, description, onProgress);
      } else {
        throw new Error('Either URL or Blob must be provided');
      }

      // Remove from active downloads
      this.activeDownloads.delete(filename);

      // Show success notification
      Toast.show({
        type: 'success',
        text1: '✅ Download Complete',
        text2: `${filename} saved to Downloads`,
        visibilityTime: 4000,
      });

      // Show modern success modal
      this.showSuccessModal(filename, filePath);

      onComplete?.(filePath);
      return filePath;

    } catch (error: any) {
      console.error('Download error:', error);
      
      // Remove from active downloads
      this.activeDownloads.delete(filename);

      // Show error toast
      Toast.show({
        type: 'error',
        text1: '❌ Download Failed',
        text2: error.message || 'Unknown error occurred',
        visibilityTime: 4000,
      });

      // Show error modal with retry option
      this.showErrorModal(filename, error.message, () => {
        this.downloadFile(options); // Retry
      });

      onError?.(error.message);
      throw error;
    }
  }

  /**
   * Download blob directly to Downloads folder
   */
  private async downloadBlob(blob: Blob, filename: string, onProgress?: (progress: number) => void): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = async () => {
        try {
          onProgress?.(25); // Reading blob
          
          const result = reader.result as string;
          const base64Data = result.split(',')[1];
          
          if (!base64Data) {
            throw new Error('Invalid blob data');
          }
          
          onProgress?.(50); // Processing data
          
          // Save directly to Downloads folder
          const downloadPath = `${ReactNativeBlobUtil.fs.dirs.DownloadDir}/${filename}`;
          
          onProgress?.(75); // Saving file
          
          await ReactNativeBlobUtil.fs.writeFile(downloadPath, base64Data, 'base64');
          
          onProgress?.(100); // Complete
          
          // Make file visible in Downloads app
          if (Platform.OS === 'android') {
            ReactNativeBlobUtil.android.addCompleteDownload({
              title: filename,
              description: 'Downloaded via app',
              mime: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
              path: downloadPath,
              showNotification: true
            });
          }
          
          resolve(downloadPath);
        } catch (error) {
          reject(error);
        }
      };
      
      reader.onerror = () => reject(new Error('Failed to read blob'));
      reader.readAsDataURL(blob);
    });
  }

  /**
   * Download from URL using Download Manager
   */
  private async downloadFromUrl(url: string, filename: string, title?: string, description?: string, onProgress?: (progress: number) => void): Promise<string> {
    // Configure download using Android Download Manager
    const downloadConfig = {
      fileCache: false,
      addAndroidDownloads: {
        useDownloadManager: true, // Use Android's native Download Manager
        notification: true, // Show notification
        title: title || `Downloading ${filename}`,
        description: description || 'File download in progress...',
        mime: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        mediaScannable: true, // Make file visible in file managers
        path: `${ReactNativeBlobUtil.fs.dirs.DownloadDir}/${filename}`,
      }
    };

    // Start download
    const downloadTask = ReactNativeBlobUtil.config(downloadConfig).fetch('GET', url);
    
    // Store active download
    this.activeDownloads.set(filename, downloadTask);

    // Handle progress
    downloadTask.progress((received: number, total: number) => {
      const progress = Math.round((received / total) * 100);
      onProgress?.(progress);
    });

    // Wait for completion
    const response = await downloadTask;
    return response.path();
  }

  /**
   * Check and request storage permissions
   */
  private async checkStoragePermission(): Promise<boolean> {
    if (Platform.OS !== 'android') return true;

    try {
      const androidVersion = Platform.Version;
      
      if (androidVersion >= 33) {
        // Android 13+ - No storage permission needed for Downloads folder
        return true;
      } else if (androidVersion >= 30) {
        // Android 11-12 - Check MANAGE_EXTERNAL_STORAGE
        const granted = await PermissionsAndroid.check(
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE
        );
        
        if (!granted) {
          const result = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
            {
              title: 'Storage Permission Required',
              message: 'This app needs storage access to download files to your Downloads folder.',
              buttonNeutral: 'Ask Me Later',
              buttonNegative: 'Cancel',
              buttonPositive: 'OK',
            }
          );
          return result === PermissionsAndroid.RESULTS.GRANTED;
        }
        return true;
      } else {
        // Android 10 and below
        const granted = await PermissionsAndroid.check(
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE
        );
        
        if (!granted) {
          const result = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE
          );
          return result === PermissionsAndroid.RESULTS.GRANTED;
        }
        return true;
      }
    } catch (error) {
      console.error('Permission check error:', error);
      return false;
    }
  }

  /**
   * Show modern success modal
   */
  private showSuccessModal(filename: string, filePath: string) {
    Alert.alert(
      '✅ Download Complete',
      `${filename} has been saved to your Downloads folder.`,
      [
        {
          text: 'Done',
          style: 'default'
        },
        {
          text: 'Open File',
          onPress: () => this.openFile(filePath)
        },
        {
          text: 'Share',
          onPress: () => this.shareFile(filePath)
        }
      ],
      { cancelable: true }
    );
  }

  /**
   * Show error modal with retry option
   */
  private showErrorModal(filename: string, error: string, onRetry: () => void) {
    Alert.alert(
      '❌ Download Failed',
      `Failed to download ${filename}.\n\nError: ${error}`,
      [
        {
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'Retry',
          onPress: onRetry
        }
      ],
      { cancelable: true }
    );
  }

  /**
   * Open downloaded file
   */
  private async openFile(filePath: string) {
    try {
      await ReactNativeBlobUtil.android.actionViewIntent(filePath, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Cannot Open File',
        text2: 'No app found to open this file type',
        visibilityTime: 3000,
      });
    }
  }

  /**
   * Share downloaded file
   */
  private async shareFile(filePath: string) {
    try {
      await ReactNativeBlobUtil.android.shareIntent(filePath, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Cannot Share File',
        text2: 'Failed to open share dialog',
        visibilityTime: 3000,
      });
    }
  }

  /**
   * Cancel active download
   */
  cancelDownload(filename: string): boolean {
    const downloadTask = this.activeDownloads.get(filename);
    if (downloadTask) {
      downloadTask.cancel();
      this.activeDownloads.delete(filename);
      
      Toast.show({
        type: 'info',
        text1: 'Download Cancelled',
        text2: filename,
        visibilityTime: 2000,
      });
      
      return true;
    }
    return false;
  }

  /**
   * Check if file is currently downloading
   */
  isDownloading(filename: string): boolean {
    return this.activeDownloads.has(filename);
  }

  /**
   * Get active downloads count
   */
  getActiveDownloadsCount(): number {
    return this.activeDownloads.size;
  }
}

export const nativeDownloadManager = new NativeDownloadManager();