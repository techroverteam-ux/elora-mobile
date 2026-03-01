import { Platform, PermissionsAndroid } from 'react-native';
import RNFS from 'react-native-fs';
import Share from 'react-native-share';

export const fileService = {
  downloadFile: async (blob: Blob, filename: string) => {
    try {
      // Use share instead of direct download to avoid permission issues
      const reader = new FileReader();
      reader.onload = async () => {
        const base64Data = (reader.result as string).split(',')[1];
        
        await Share.open({
          url: `data:application/octet-stream;base64,${base64Data}`,
          filename,
          title: `Share ${filename}`,
        });
      };
      reader.readAsDataURL(blob);
    } catch (error) {
      console.error('File download error:', error);
      throw error;
    }
  },

  shareFile: async (blob: Blob, filename: string) => {
    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64Data = (reader.result as string).split(',')[1];
        
        await Share.open({
          url: `data:application/octet-stream;base64,${base64Data}`,
          filename,
        });
      };
      reader.readAsDataURL(blob);
    } catch (error) {
      console.error('File share error:', error);
      throw error;
    }
  },
};