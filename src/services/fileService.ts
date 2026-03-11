import { Platform, PermissionsAndroid, Alert } from 'react-native';
import RNFS from 'react-native-fs';
import Share from 'react-native-share';
import Toast from 'react-native-toast-message';
import { permissionService } from './permissionService';

export const fileService = {
  // Enhanced download with actual file saving
  downloadFile: async (blob: Blob, filename: string) => {
    try {
      // Validate inputs
      if (!blob || !filename) {
        throw new Error('Invalid blob or filename provided');
      }

      // Check and request storage permission
      const hasStoragePermission = await permissionService.checkStoragePermission();
      if (!hasStoragePermission) {
        const granted = await permissionService.requestStoragePermission();
        if (!granted) {
          Toast.show({ 
            type: 'error', 
            text1: 'Permission Required', 
            text2: 'Storage permission is needed to download files' 
          });
          throw new Error('Storage permission denied');
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
              throw new Error('Failed to extract base64 data');
            }
            
            // Determine download path based on Android version
            let downloadPath: string;
            const androidVersion = Platform.OS === 'android' ? Platform.Version : 0;
            
            if (Platform.OS === 'ios') {
              // iOS: Use Documents directory
              const eloraFolder = `${RNFS.DocumentDirectoryPath}/Elora`;
              await RNFS.mkdir(eloraFolder);
              downloadPath = `${eloraFolder}/${filename}`;
            } else if (androidVersion >= 30) {
              // Android 11+: Use app-specific external files directory
              const eloraFolder = `${RNFS.ExternalDirectoryPath}/Downloads`;
              await RNFS.mkdir(eloraFolder);
              downloadPath = `${eloraFolder}/${filename}`;
            } else {
              // Older Android: Use Downloads folder
              const eloraFolder = `${RNFS.DownloadDirectoryPath}/Elora`;
              await RNFS.mkdir(eloraFolder);
              downloadPath = `${eloraFolder}/${filename}`;
            }

            // Write file to device storage
            await RNFS.writeFile(downloadPath, base64Data, 'base64');
            
            // Show success message with appropriate path
            let successMessage = 'File downloaded successfully';
            if (Platform.OS === 'ios') {
              successMessage = 'Saved to Files/Elora';
            } else if (androidVersion >= 30) {
              successMessage = 'Saved to app files';
            } else {
              successMessage = 'Saved to Downloads/Elora';
            }
            
            Toast.show({ 
              type: 'success', 
              text1: 'File Downloaded', 
              text2: successMessage
            });
            
            resolve(downloadPath);
          } catch (error) {
            console.error('File write error:', error);
            Toast.show({ 
              type: 'error', 
              text1: 'Download Failed', 
              text2: 'Unable to save file to device' 
            });
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