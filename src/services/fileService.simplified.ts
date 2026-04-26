import { Platform, PermissionsAndroid } from 'react-native';
import RNFS from 'react-native-fs';
import Share from 'react-native-share';
import Toast from 'react-native-toast-message';
import { permissionService } from './permissionService';
import { themedAlertService } from './themedAlertService';

export const fileService = {
  // Enhanced download with better user experience
  downloadFile: async (blob: Blob, filename: string) => {
    try {
      // Show clean download starting toast
      Toast.show({
        type: 'info',
        text1: 'Download Starting',
        text2: filename,
        visibilityTime: 2000,
      });

      // Validate inputs
      if (!blob || !filename) {
        throw new Error('Invalid file data');
      }

      // Check storage permission
      const hasStoragePermission = await permissionService.checkStoragePermission();
      if (!hasStoragePermission) {
        const granted = await permissionService.requestStoragePermission();
        if (!granted) {
          // Show clean permission alert
          themedAlertService.show(
            'Storage Permission Required',
            'Allow storage access to save files, or share directly.',
            [
              { text: 'Cancel', style: 'cancel' },
              { 
                text: 'Share Instead', 
                onPress: () => {
                  fileService.directShare(blob, filename);
                }
              }
            ]
          );
          return;
        }
      }

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
              throw new Error('Failed to process file');
            }
            
            // Determine download path
            let downloadPath: string;
            const androidVersion = Platform.OS === 'android' ? Platform.Version : 0;
            
            if (Platform.OS === 'ios') {
              const eloraFolder = `${RNFS.DocumentDirectoryPath}/Elora`;
              await RNFS.mkdir(eloraFolder);
              downloadPath = `${eloraFolder}/${filename}`;
            } else {
              // Android: Try Downloads folder first
              try {
                if (androidVersion >= 30) {
                  // Try public Downloads first
                  try {
                    const publicDownloads = `${RNFS.DownloadDirectoryPath}/${filename}`;
                    await RNFS.writeFile(publicDownloads, base64Data, 'base64');
                    downloadPath = publicDownloads;
                  } catch (publicError) {
                    // Fallback to app directory
                    const eloraFolder = `${RNFS.ExternalDirectoryPath}/Downloads`;
                    await RNFS.mkdir(eloraFolder);
                    downloadPath = `${eloraFolder}/${filename}`;
                    await RNFS.writeFile(downloadPath, base64Data, 'base64');
                  }
                } else {
                  // Older Android
                  const eloraFolder = `${RNFS.DownloadDirectoryPath}/Elora`;
                  await RNFS.mkdir(eloraFolder);
                  downloadPath = `${eloraFolder}/${filename}`;
                  await RNFS.writeFile(downloadPath, base64Data, 'base64');
                }
              } catch (androidError) {
                // Final fallback
                const eloraFolder = `${RNFS.ExternalDirectoryPath}/Downloads`;
                await RNFS.mkdir(eloraFolder);
                downloadPath = `${eloraFolder}/${filename}`;
                await RNFS.writeFile(downloadPath, base64Data, 'base64');
              }
            }

            // Write file if not already written
            if (!await RNFS.exists(downloadPath)) {
              await RNFS.writeFile(downloadPath, base64Data, 'base64');
            }
            
            // Show clean success toast
            Toast.show({
              type: 'success',
              text1: 'Download Complete',
              text2: filename,
              visibilityTime: 3000,
            });
            
            // Show clean success popup
            let locationMessage = '';
            if (Platform.OS === 'ios') {
              locationMessage = 'Files app';
            } else if (downloadPath.includes(RNFS.DownloadDirectoryPath)) {
              locationMessage = 'Downloads folder';
            } else {
              locationMessage = 'App files';
            }
            
            themedAlertService.show(
              'Download Complete',
              `${filename} saved to ${locationMessage}`,
              [
                { text: 'Done', style: 'cancel' },
                { 
                  text: 'Share', 
                  onPress: () => {
                    Share.open({
                      url: `file://${downloadPath}`,
                      title: `Share ${filename}`,
                    }).catch(() => {});
                  }
                }
              ]
            );
            
            resolve(downloadPath);
          } catch (error) {
            console.error('File processing error:', error);
            
            // Show clean error popup
            themedAlertService.show(
              'Download Failed',
              'Could not save file. Try sharing instead.',
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
            reject(error);
          }
        };
        
        reader.onerror = () => {
          const error = new Error('Failed to read file');
          console.error('FileReader error:', error);
          Toast.show({ 
            type: 'error', 
            text1: 'Download Failed', 
            text2: 'Unable to process file' 
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

  // Direct share without saving
  directShare: async (blob: Blob, filename: string) => {
    try {
      Toast.show({
        type: 'info',
        text1: 'Preparing Share',
        text2: filename,
        visibilityTime: 2000,
      });

      if (!blob || !filename) {
        throw new Error('Invalid file data');
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
              throw new Error('Failed to process file');
            }
            
            // Write to temp cache
            const tempPath = `${RNFS.CachesDirectoryPath}/${filename}`;
            await RNFS.writeFile(tempPath, base64Data, 'base64');
            
            // Share directly
            await Share.open({
              url: `file://${tempPath}`,
              title: `Share ${filename}`,
              message: `Sharing ${filename}`,
            });
            
            // Clean up after delay
            setTimeout(() => {
              RNFS.unlink(tempPath).catch(() => {});
            }, 10000);
            
            Toast.show({ 
              type: 'success', 
              text1: 'File Shared', 
              text2: filename 
            });
            
            resolve(true);
          } catch (shareError) {
            console.error('Direct share error:', shareError);
            Toast.show({ 
              type: 'error', 
              text1: 'Share Failed', 
              text2: 'Unable to share file' 
            });
            reject(shareError);
          }
        };
        
        reader.onerror = () => {
          const error = new Error('Failed to read file');
          reject(error);
        };
        
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.error('Direct share error:', error);
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