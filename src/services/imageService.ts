import { fileService } from './fileService';

const imageService = {
  downloadImage: async (imageUrl: string, filename: string) => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      return await fileService.downloadFile(blob, filename);
    } catch (error) {
      console.error('Image download error:', error);
      throw error;
    }
  },

  shareImage: async (imageUrl: string, filename: string) => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      return await fileService.shareFile(blob, filename);
    } catch (error) {
      console.error('Image share error:', error);
      throw error;
    }
  },

  getFullImageUrl: (imageUrl: string) => {
    // If it's already a full URL, return as is
    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
      return imageUrl;
    }
    // If it's a relative path, construct full URL (adjust base URL as needed)
    return `https://your-api-domain.com${imageUrl.startsWith('/') ? '' : '/'}${imageUrl}`;
  },
};

export default imageService;