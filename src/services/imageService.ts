import { fileService } from './fileService';

const imageService = {
  baseUrl: 'https://storage.enamorimpex.com/eloraftp',

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

  getFullImageUrl: (imageUrl: string | undefined | null) => {
    // Handle null/undefined or empty imageUrl
    if (!imageUrl || typeof imageUrl !== 'string' || imageUrl.trim() === '') {
      return '';
    }

    const trimmed = imageUrl.trim();

    // If it's already a full URL, return as is
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
      return trimmed;
    }

    // If it's a relative path, construct full URL with correct base URL
    const fullUrl = `${imageService.baseUrl}${trimmed.startsWith('/') ? '' : '/'}${trimmed}`;
    return fullUrl;
  },
};

export default imageService;