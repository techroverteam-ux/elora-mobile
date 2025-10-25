// Extract thumbnails from available content
const BASE_URL = 'https://gbs-api.thankfulflower-dcee2acb.centralindia.azurecontainerapps.io/api';

let cachedImages: any[] = [];
let lastFetch = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export const getContentThumbnail = async (audioItem: any): Promise<string> => {
  // Check if we need to refresh image cache
  if (Date.now() - lastFetch > CACHE_DURATION || cachedImages.length === 0) {
    await refreshImageCache();
  }

  // Try to find matching image based on keywords
  const thumbnail = findMatchingThumbnail(audioItem, cachedImages);
  
  if (thumbnail) {
    return `${BASE_URL}/azure-blob/file?blobUrl=${encodeURIComponent(thumbnail)}`;
  }

  // Fallback to generated thumbnail
  return getGeneratedThumbnail(audioItem.title || 'Audio');
};

const refreshImageCache = async () => {
  try {
    const response = await fetch(`${BASE_URL}/mobile/dashboard`);
    const data = await response.json();
    
    if (data.success && data.data.recentUploads) {
      cachedImages = data.data.recentUploads
        .filter((item: any) => item.type === 'image' && item.streamingUrl)
        .map((item: any) => ({
          title: item.title.toLowerCase(),
          description: item.description?.toLowerCase() || '',
          url: item.streamingUrl
        }));
      
      lastFetch = Date.now();
      console.log('Cached', cachedImages.length, 'images for thumbnails');
    }
  } catch (error) {
    console.log('Failed to cache images:', error);
  }
};

const findMatchingThumbnail = (audioItem: any, images: any[]): string | null => {
  const audioTitle = audioItem.title?.toLowerCase() || '';
  const audioDesc = audioItem.description?.toLowerCase() || '';
  
  // Keywords to match
  const keywords = extractKeywords(audioTitle + ' ' + audioDesc);
  
  // Find best matching image
  let bestMatch = null;
  let bestScore = 0;
  
  for (const image of images) {
    const score = calculateMatchScore(keywords, image.title + ' ' + image.description);
    if (score > bestScore && score > 0.3) { // Minimum threshold
      bestScore = score;
      bestMatch = image.url;
    }
  }
  
  return bestMatch;
};

const extractKeywords = (text: string): string[] => {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 2)
    .slice(0, 5); // Top 5 keywords
};

const calculateMatchScore = (keywords: string[], imageText: string): number => {
  const matches = keywords.filter(keyword => imageText.includes(keyword));
  return matches.length / keywords.length;
};

const getGeneratedThumbnail = (title: string): string => {
  const colors = ['FF6B6B', 'FFE66D', '4ECDC4', '45B7D1', 'A8E6CF', 'FFB3BA'];
  const colorIndex = title.length % colors.length;
  const color = colors[colorIndex];
  const initials = title.substring(0, 2).toUpperCase();
  
  return `https://via.placeholder.com/300x300/${color}/FFFFFF?text=${encodeURIComponent(initials)}`;
};