import { Platform, PermissionsAndroid, Alert } from 'react-native';
import RNFS from 'react-native-fs';
import Share from 'react-native-share';
import Toast from 'react-native-toast-message';

export const fileService = {
  // Enhanced download with actual file saving
  downloadFile: async (blob: Blob, filename: string) => {
    try {
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
          // Fallback to share if permission denied
          return await fileService.shareFile(blob, filename);
        }
      }

      // Convert blob to base64
      const reader = new FileReader();
      return new Promise((resolve, reject) => {
        reader.onload = async () => {
          try {
            const base64Data = (reader.result as string).split(',')[1];
            
            // Determine download path
            const downloadPath = Platform.OS === 'ios' 
              ? `${RNFS.DocumentDirectoryPath}/${filename}`
              : `${RNFS.DownloadDirectoryPath}/${filename}`;

            // Write file to device storage
            await RNFS.writeFile(downloadPath, base64Data, 'base64');
            
            Toast.show({ 
              type: 'success', 
              text1: 'File Downloaded', 
              text2: `Saved to ${Platform.OS === 'ios' ? 'Files app' : 'Downloads folder'}` 
            });
            
            // Also offer to share the file
            Alert.alert(
              'File Downloaded',
              `${filename} has been saved to your device. Would you like to share it?`,
              [
                { text: 'No', style: 'cancel' },
                { 
                  text: 'Share', 
                  onPress: () => fileService.shareFile(blob, filename)
                }
              ]
            );
            
            resolve(downloadPath);
          } catch (error) {
            console.error('File write error:', error);
            // Fallback to share if write fails
            await fileService.shareFile(blob, filename);
            resolve(null);
          }
        };
        
        reader.onerror = () => {
          reject(new Error('Failed to read file'));
        };
        
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.error('File download error:', error);
      // Fallback to share
      return await fileService.shareFile(blob, filename);
    }
  },

  // Enhanced share functionality
  shareFile: async (blob: Blob, filename: string) => {
    try {
      const reader = new FileReader();
      return new Promise((resolve, reject) => {
        reader.onload = async () => {
          try {
            const base64Data = (reader.result as string).split(',')[1];
            
            // Determine MIME type based on file extension
            const extension = filename.split('.').pop()?.toLowerCase();
            let mimeType = 'application/octet-stream';
            
            switch (extension) {
              case 'xlsx':
              case 'xls':
                mimeType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
                break;
              case 'pdf':
                mimeType = 'application/pdf';
                break;
              case 'ppt':
              case 'pptx':
                mimeType = 'application/vnd.openxmlformats-officedocument.presentationml.presentation';
                break;
              case 'doc':
              case 'docx':
                mimeType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
                break;
            }
            
            await Share.open({
              url: `data:${mimeType};base64,${base64Data}`,
              filename,
              title: `Share ${filename}`,
              type: mimeType,
            });
            
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
          reject(new Error('Failed to read file for sharing'));
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