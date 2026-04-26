import { Platform, PermissionsAndroid } from 'react-native';
import RNFS from 'react-native-fs';
import Share from 'react-native-share';
import Toast from 'react-native-toast-message';
import { permissionService } from './permissionService';
import { themedAlertService } from './themedAlertService';
import { pushNotificationService } from './pushNotificationService';

// Simple notification helper
const showDownloadNotification = (message: string) => {
  console.log('FileService v2.1 - Notification:', message);
  Toast.show({
    type: 'info',
    text1: 'Download Progress',
    text2: message,
    visibilityTime: 4000,
  });
};

export const fileService = {
  // Enhanced download with proper system storage
  downloadFile: async (blob: Blob, filename: string) => {
    console.log('FileService v2.1 - Starting download:', filename);
    try {
      // Show download starting notification (both in-app and system)
      showDownloadNotification(`Starting download: ${filename}`);
      pushNotificationService.showDownloadStartNotification(filename);
      
      // Validate inputs
      if (!blob || !filename) {
        throw new Error('Invalid blob or filename provided');
      }

      // Request storage permission first
      const hasStoragePermission = await permissionService.checkStoragePermission();
      if (!hasStoragePermission) {
        const granted = await permissionService.requestStoragePermission();
        if (!granted) {
          // Show permission denied alert and fallback to share
          themedAlertService.show(
            'Permission Required',
            'Storage permission is needed to save files. Would you like to share the file instead?',
            [
              { text: 'Cancel', style: 'cancel' },
              { 
                text: 'Share File', 
                onPress: () => {
                  fileService.directShare(blob, filename);
                }
              }
            ]
          );
          return;
        }
      }

      // Show processing notification
      showDownloadNotification(`Processing: ${filename}`);
      pushNotificationService.showDownloadProgressNotification(filename, 'Processing file...');

      // Convert blob to base64
      const reader = new FileReader();
      return new Promise((resolve, reject) => {
        reader.onload = async () => {
          try {
            const result = reader.result as string;
            if (!result || !result.includes(',')) {
              throw new Error('Invalid file data');
            }

            const base64Data = result.split(',')[1];
            if (!base64Data) {
              throw new Error('Failed to extract base64 data');
            }
            
            // Show saving notification
            showDownloadNotification(`Saving: ${filename}`);
            pushNotificationService.showDownloadProgressNotification(filename, 'Saving to device...');
            
            // Determine download path based on Android version and permissions
            let downloadPath: string;
            const androidVersion = Platform.OS === 'android' ? Platform.Version : 0;
            
            if (Platform.OS === 'ios') {
              // iOS: Use Documents directory
              const eloraFolder = `${RNFS.DocumentDirectoryPath}/Elora`;
              await RNFS.mkdir(eloraFolder);
              downloadPath = `${eloraFolder}/${filename}`;
            } else {
              // Android: Try different paths based on version and permissions
              try {
                if (androidVersion >= 30) {
                  // Android 11+: Try Downloads folder first, fallback to app directory
                  try {
                    const publicDownloads = `${RNFS.DownloadDirectoryPath}/${filename}`;
                    await RNFS.writeFile(publicDownloads, base64Data, 'base64');
                    downloadPath = publicDownloads;
                  } catch (publicError) {
                    // Fallback to app-specific external directory
                    const eloraFolder = `${RNFS.ExternalDirectoryPath}/Downloads`;
                    await RNFS.mkdir(eloraFolder);
                    downloadPath = `${eloraFolder}/${filename}`;
                    await RNFS.writeFile(downloadPath, base64Data, 'base64');
                  }
                } else {
                  // Older Android: Use Downloads/Elora folder
                  const eloraFolder = `${RNFS.DownloadDirectoryPath}/Elora`;
                  await RNFS.mkdir(eloraFolder);
                  downloadPath = `${eloraFolder}/${filename}`;
                  await RNFS.writeFile(downloadPath, base64Data, 'base64');
                }
              } catch (androidError) {
                // Final fallback: app-specific directory
                const eloraFolder = `${RNFS.ExternalDirectoryPath}/Downloads`;
                await RNFS.mkdir(eloraFolder);
                downloadPath = `${eloraFolder}/${filename}`;
                await RNFS.writeFile(downloadPath, base64Data, 'base64');
              }
            }

            // If we haven't written the file yet, write it now
            if (!await RNFS.exists(downloadPath)) {
              await RNFS.writeFile(downloadPath, base64Data, 'base64');
            }
            
            // Show completion notification (both in-app and system)
            Toast.show({
              type: 'success',
              text1: 'Download Complete!',
              text2: `${filename} saved successfully`,
              visibilityTime: 6000,
            });
            
            pushNotificationService.showDownloadCompleteNotification(filename, locationMessage);
            
            // Show success with options
            let locationMessage = '';
            if (Platform.OS === 'ios') {
              locationMessage = 'Files app → Elora folder';
            } else if (androidVersion >= 30) {
              locationMessage = downloadPath.includes('Download') ? 'Downloads folder' : 'App files';
            } else {
              locationMessage = 'Downloads → Elora folder';
            }
            
            themedAlertService.showDownloadSuccessAlert(
              filename,
              locationMessage,
              () => {
                Share.open({
                  url: `file://${downloadPath}`,
                  title: `Share ${filename}`,
                }).catch(() => {});
              },
              () => {
                Share.open({
                  url: `file://${downloadPath.substring(0, downloadPath.lastIndexOf('/'))}`,
                  title: 'Open Folder',
                }).catch(() => {
                  Toast.show({
                    type: 'info',
                    text1: 'File Location',
                    text2: downloadPath
                  });
                });
              }
            );
            
            resolve(downloadPath);
          } catch (error) {
            console.error('File processing error:', error);
            
            // Show error notifications (both in-app and system)
            pushNotificationService.showDownloadFailedNotification(filename, 'Processing failed');
            
            // Fallback to share method
            themedAlertService.showDownloadFailedAlert(
              filename,
              () => {
                fileService.directShare(blob, filename);
              }
            );
            reject(error);
          }
        };
        
        reader.onerror = () => {
          const error = new Error('Failed to read file');
          console.error('FileReader error:', error);
          Toast.show({ 
            type: 'error', 
            text1: 'Download Failed', 
            text2: 'Unable to process file data' 
          });
          reject(error);
        };
        
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.error('File download error:', error);
      throw error;
    }
  },

  // Direct share without saving to storage first
  directShare: async (blob: Blob, filename: string) => {
    try {
      // Validate inputs
      if (!blob || !filename) {
        throw new Error('Invalid blob or filename provided');
      }

      const reader = new FileReader();
      return new Promise((resolve, reject) => {
        reader.onload = async () => {
          try {
            const result = reader.result as string;
            if (!result || !result.includes(',')) {
              throw new Error('Invalid file data');
            }

            const base64Data = result.split(',')[1];
            if (!base64Data) {
              throw new Error('Failed to extract base64 data');
            }
            
            // Write to temporary cache directory (no permission needed)
            const tempPath = `${RNFS.CachesDirectoryPath}/${filename}`;
            await RNFS.writeFile(tempPath, base64Data, 'base64');
            
            // Share the file directly
            await Share.open({
              url: `file://${tempPath}`,
              title: `Share ${filename}`,
              message: `Sharing ${filename}`,
            });
            
            // Clean up temp file after sharing
            setTimeout(() => {
              RNFS.unlink(tempPath).catch(() => {});
            }, 10000); // Increased cleanup time
            
            Toast.show({ 
              type: 'success', 
              text1: 'File Shared', 
              text2: 'File shared successfully' 
            });
            
            resolve(true);
          } catch (shareError) {
            console.error('Direct share error:', shareError);
            Toast.show({ 
              type: 'error', 
              text1: 'Share Failed', 
              text2: 'Unable to share the file' 
            });
            reject(shareError);
          }
        };
        
        reader.onerror = () => {
          const error = new Error('Failed to read file for sharing');
          console.error('FileReader error:', error);
          reject(error);
        };
        
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.error('Direct share error:', error);
      throw error;
    }
  },
  // Enhanced share functionality
  shareFile: async (blob: Blob, filename: string) => {
    try {
      // Validate inputs
      if (!blob || !filename) {
        throw new Error('Invalid blob or filename provided');
      }

      const reader = new FileReader();
      return new Promise((resolve, reject) => {
        reader.onload = async () => {
          try {
            const result = reader.result as string;
            if (!result || !result.includes(',')) {
              throw new Error('Invalid file data');
            }

            const base64Data = result.split(',')[1];
            if (!base64Data) {
              throw new Error('Failed to extract base64 data');
            }
            
            // Write to temporary file first
            const tempPath = `${RNFS.CachesDirectoryPath}/${filename}`;
            await RNFS.writeFile(tempPath, base64Data, 'base64');
            
            // Share the file path instead of data URI
            await Share.open({
              url: `file://${tempPath}`,
              title: `Share ${filename}`,
            });
            
            // Clean up temp file after sharing
            setTimeout(() => {
              RNFS.unlink(tempPath).catch(() => {});
            }, 5000);
            
            resolve(true);
          } catch (shareError) {
            console.error('Share error:', shareError);
            Toast.show({ 
              type: 'error', 
              text1: 'Share Failed', 
              text2: 'Unable to share the file' 
            });
            reject(shareError);
          }
        };
        
        reader.onerror = () => {
          const error = new Error('Failed to read file for sharing');
          console.error('FileReader error:', error);
          reject(error);
        };
        
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.error('File share error:', error);
      throw error;
    }
  },

  // Check if file exists
  fileExists: async (path: string): Promise<boolean> => {
    try {
      return await RNFS.exists(path);
    } catch (error) {
      return false;
    }
  },

  // Get file info
  getFileInfo: async (path: string) => {
    try {
      return await RNFS.stat(path);
    } catch (error) {
      return null;
    }
  },

  // Delete file
  deleteFile: async (path: string): Promise<boolean> => {
    try {
      await RNFS.unlink(path);
      return true;
    } catch (error) {
      console.error('Delete file error:', error);
      return false;
    }
  },
};