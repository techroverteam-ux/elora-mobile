import { Platform, PermissionsAndroid } from 'react-native';
import ReactNativeBlobUtil from 'react-native-blob-util';
import Toast from 'react-native-toast-message';

interface SimpleDownloadOptions {
  blob?: Blob;
  url?: string;
  filename: string;
  onProgress?: (progress: number) => void;
  onComplete?: (filePath: string) => void;
  onError?: (error: string) => void;
  showModals?: boolean; // Whether to show success/error modals
}

class SimpleDownloadService {
  private modalCallbacks: {
    showSuccess?: (data: any) => void;
    showError?: (data: any) => void;
  } = {};

  // Set modal callbacks from the provider
  setModalCallbacks(callbacks: { showSuccess: (data: any) => void; showError: (data: any) => void }) {
    this.modalCallbacks = callbacks;
  }
  /**
   * Simple, reliable download that works with both blobs and URLs
   */
  async downloadFile(options: SimpleDownloadOptions): Promise<string> {
    const { filename, onProgress, onComplete, onError, showModals = true } = options;
    
    console.log('SimpleDownloadService: Starting download for', filename);
    
    try {
      // Check permissions
      const hasPermission = await this.checkStoragePermission();
      if (!hasPermission) {
        throw new Error('Storage permission denied');
      }

      console.log('SimpleDownloadService: Permissions OK');

      // Show start notification
      Toast.show({
        type: 'info',
        text1: '📥 Starting Download',
        text2: filename,
        visibilityTime: 2000,
      });

      let filePath: string;

      if (options.blob) {
        console.log('SimpleDownloadService: Downloading blob');
        filePath = await this.downloadBlob(options.blob, filename, onProgress);
      } else if (options.url) {
        console.log('SimpleDownloadService: Downloading from URL:', options.url);
        filePath = await this.downloadFromUrl(options.url, filename, onProgress);
      } else {
        throw new Error('Either URL or Blob must be provided');
      }

      console.log('SimpleDownloadService: Download complete:', filePath);

      // Show success toast
      Toast.show({
        type: 'success',
        text1: '✅ Download Complete',
        text2: `${filename} saved to Downloads`,
        visibilityTime: 3000,
      });

      // Show success modal if enabled
      if (showModals && this.modalCallbacks.showSuccess) {
        const fileStats = await this.getFileStats(filePath);
        this.modalCallbacks.showSuccess({
          filename,
          fileSize: fileStats.size,
          downloadPath: filePath,
          onOpenFile: () => this.openFile(filePath),
          onShareFile: () => this.shareFile(filePath),
          onOpenFolder: () => this.openFolder(filePath),
        });
      }

      onComplete?.(filePath);
      return filePath;

    } catch (error: any) {
      console.error('SimpleDownloadService: Download error:', error);
      
      // Show error toast
      Toast.show({
        type: 'error',
        text1: '❌ Download Failed',
        text2: error.message || 'Unknown error',
        visibilityTime: 4000,
      });

      // Show error modal if enabled
      if (showModals && this.modalCallbacks.showError) {
        this.modalCallbacks.showError({
          filename,
          errorMessage: error.message || 'Unknown error occurred',
          onRetry: () => this.downloadFile(options),
          onShare: options.blob ? () => this.shareBlob(options.blob!, filename) : undefined,
        });
      }

      onError?.(error.message);
      throw error;
    }
  }

  /**
   * Download blob to Downloads folder
   */
  private async downloadBlob(blob: Blob, filename: string, onProgress?: (progress: number) => void): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = async () => {
        try {
          onProgress?.(25);
          
          const result = reader.result as string;
          if (!result || !result.includes(',')) {
            throw new Error('Invalid blob data');
          }

          const base64Data = result.split(',')[1];
          if (!base64Data) {
            throw new Error('Failed to extract base64 data');
          }
          
          onProgress?.(50);
          
          // Determine download path
          const downloadPath = `${ReactNativeBlobUtil.fs.dirs.DownloadDir}/${filename}`;
          
          onProgress?.(75);
          
          // Write file
          await ReactNativeBlobUtil.fs.writeFile(downloadPath, base64Data, 'base64');
          
          onProgress?.(100);
          
          // Make file visible in file manager (Android)
          if (Platform.OS === 'android') {
            try {
              ReactNativeBlobUtil.android.addCompleteDownload({
                title: filename,
                description: 'Downloaded file',
                mime: this.getMimeType(filename),
                path: downloadPath,
                showNotification: true
              });
            } catch (notificationError) {
              console.warn('Could not show download notification:', notificationError);
            }
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
   * Download from URL
   */
  private async downloadFromUrl(url: string, filename: string, onProgress?: (progress: number) => void): Promise<string> {
    const downloadPath = `${ReactNativeBlobUtil.fs.dirs.DownloadDir}/${filename}`;
    
    const downloadTask = ReactNativeBlobUtil.config({
      path: downloadPath,
      fileCache: true,
    }).fetch('GET', url);

    // Handle progress
    downloadTask.progress((received: number, total: number) => {
      const progress = Math.round((received / total) * 100);
      onProgress?.(progress);
    });

    await downloadTask;
    
    // Make file visible in file manager (Android)
    if (Platform.OS === 'android') {
      try {
        ReactNativeBlobUtil.android.addCompleteDownload({
          title: filename,
          description: 'Downloaded file',
          mime: this.getMimeType(filename),
          path: downloadPath,
          showNotification: true
        });
      } catch (notificationError) {
        console.warn('Could not show download notification:', notificationError);
      }
    }
    
    return downloadPath;
  }

  /**
   * Get MIME type based on file extension
   */
  private getMimeType(filename: string): string {
    const extension = filename.toLowerCase().split('.').pop();
    
    switch (extension) {
      case 'xlsx':
        return 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
      case 'pptx':
        return 'application/vnd.openxmlformats-officedocument.presentationml.presentation';
      case 'pdf':
        return 'application/pdf';
      case 'docx':
        return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
      case 'xls':
        return 'application/vnd.ms-excel';
      case 'ppt':
        return 'application/vnd.ms-powerpoint';
      case 'doc':
        return 'application/msword';
      default:
        return 'application/octet-stream';
    }
  }
  private async checkStoragePermission(): Promise<boolean> {
    if (Platform.OS !== 'android') return true;

    try {
      const androidVersion = Platform.Version;
      
      if (androidVersion >= 33) {
        // Android 13+ - No storage permission needed for Downloads folder
        return true;
      } else {
        // Check WRITE_EXTERNAL_STORAGE for older versions
        const granted = await PermissionsAndroid.check(
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE
        );
        
        if (!granted) {
          const result = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
            {
              title: 'Storage Permission Required',
              message: 'This app needs storage access to download files.',
              buttonPositive: 'OK',
            }
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
   * Get file statistics
   */
  private async getFileStats(filePath: string): Promise<{ size: string }> {
    try {
      const stats = await ReactNativeBlobUtil.fs.stat(filePath);
      const sizeInBytes = parseInt(stats.size);
      const sizeInKB = sizeInBytes / 1024;
      const sizeInMB = sizeInKB / 1024;
      
      let formattedSize: string;
      if (sizeInMB >= 1) {
        formattedSize = `${sizeInMB.toFixed(1)} MB`;
      } else {
        formattedSize = `${sizeInKB.toFixed(0)} KB`;
      }
      
      return { size: formattedSize };
    } catch (error) {
      return { size: 'Unknown size' };
    }
  }

  /**
   * Share blob directly (fallback when download fails)
   */
  private async shareBlob(blob: Blob, filename: string) {
    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const result = reader.result as string;
        const base64Data = result.split(',')[1];
        const tempPath = `${ReactNativeBlobUtil.fs.dirs.CacheDir}/temp_${filename}`;
        await ReactNativeBlobUtil.fs.writeFile(tempPath, base64Data, 'base64');
        await this.shareFile(tempPath);
        // Clean up temp file
        setTimeout(() => {
          ReactNativeBlobUtil.fs.unlink(tempPath).catch(() => {});
        }, 5000);
      };
      reader.readAsDataURL(blob);
    } catch (error) {
      console.error('Share blob error:', error);
    }
  }

  /**
   * Open folder containing the file
   */
  private async openFolder(filePath: string) {
    try {
      const folderPath = filePath.substring(0, filePath.lastIndexOf('/'));
      await ReactNativeBlobUtil.android.actionViewIntent(folderPath, 'resource/folder');
    } catch (error) {
      // Fallback: try to open Downloads folder
      try {
        await ReactNativeBlobUtil.android.actionViewIntent(
          ReactNativeBlobUtil.fs.dirs.DownloadDir, 
          'resource/folder'
        );
      } catch (fallbackError) {
        Toast.show({
          type: 'info',
          text1: 'File Location',
          text2: 'Check your Downloads folder',
          visibilityTime: 3000,
        });
      }
    }
  }

  /**
   * Open file
   */
  private async openFile(filePath: string) {
    try {
      const filename = filePath.split('/').pop() || '';
      await ReactNativeBlobUtil.android.actionViewIntent(
        filePath, 
        this.getMimeType(filename)
      );
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Cannot Open File',
        text2: 'No app found to open this file',
        visibilityTime: 3000,
      });
    }
  }

  /**
   * Share file
   */
  private async shareFile(filePath: string) {
    try {
      const filename = filePath.split('/').pop() || '';
      await ReactNativeBlobUtil.android.shareIntent(
        filePath, 
        this.getMimeType(filename)
      );
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Cannot Share File',
        text2: 'Failed to open share dialog',
        visibilityTime: 3000,
      });
    }
  }
}

export const simpleDownloadService = new SimpleDownloadService();