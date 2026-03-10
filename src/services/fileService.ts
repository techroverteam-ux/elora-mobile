import { Platform, PermissionsAndroid, Alert } from 'react-native';
import RNFS from 'react-native-fs';
import Share from 'react-native-share';
import Toast from 'react-native-toast-message';

export const fileService = {
  // Enhanced download with actual file saving
  downloadFile: async (blob: Blob, filename: string) => {
    try {
      // Validate inputs
      if (!blob || !filename) {
        throw new Error('Invalid blob or filename provided');
      }

      // Request storage permission on Android
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
          {
            title: 'Storage Permission',
            message: 'App needs access to storage to save files',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          },
        );
        
        if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
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
            
            // Create Elora folder in Downloads
            const eloraFolder = Platform.OS === 'ios' 
              ? `${RNFS.DocumentDirectoryPath}/Elora`
              : `${RNFS.DownloadDirectoryPath}/Elora`;
            
            // Ensure folder exists
            await RNFS.mkdir(eloraFolder);
            
            // Determine download path
            const downloadPath = `${eloraFolder}/${filename}`;

            // Write file to device storage
            await RNFS.writeFile(downloadPath, base64Data, 'base64');
            
            Toast.show({ 
              type: 'success', 
              text1: 'File Downloaded', 
              text2: `Saved to ${Platform.OS === 'ios' ? 'Files/Elora' : 'Downloads/Elora'}` 
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