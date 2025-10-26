// Helper function to process Azure blob URLs for streaming
// Check if URL needs Azure API proxy
export const needsAzureProxy = (url: string): boolean => {
  if (!url) return false;

  // If it's a direct blob URL without SAS token, it needs proxy
  if (url.includes('blob.core.windows.net') && !url.includes('?') && !url.includes('sv=')) {
    return true;
  }

  return false;
};

export const processAzureUrl = (url: string): string => {
  if (!url || typeof url !== 'string') {
    return '';
  }

  const trimmedUrl = url.trim();
  if (!trimmedUrl) {
    return '';
  }

  // If it's already a direct blob URL, convert to API proxy URL
  if (trimmedUrl.includes('blob.core.windows.net')) {
    return createAzureProxyUrl(trimmedUrl);
  }

  // If it's already an API proxy URL, return as is
  if (trimmedUrl.includes('/azure-blob/file?blobUrl=')) {
    return trimmedUrl;
  }

  // For all other URLs (including regular HTTP URLs), return as-is
  return trimmedUrl;
};

// Get streaming URL with fallbacks
export const getStreamingUrl = (item: any, type: 'audio' | 'video' = 'audio'): string => {
  console.log('getStreamingUrl: Getting streaming URL for item:', {
    id: item?._id,
    title: item?.title,
    type,
    availableUrls: {
      streamingUrl: item?.streamingUrl,
      audioUrl: item?.audioUrl,
      videoUrl: item?.videoUrl,
      videoUri: item?.videoUri,
      url: item?.url
    }
  });

  const urls = [
    item?.streamingUrl,
    type === 'audio' ? item?.audioUrl : item?.videoUrl,
    item?.videoUri,
    item?.url
  ].filter(Boolean);

  // console.log('getStreamingUrl: Available URLs to process:', urls);

  // Process each URL to handle Azure blob URLs
  for (const url of urls) {
    // console.log('getStreamingUrl: Processing URL:', url);
    const processedUrl = processAzureUrl(url);
    if (processedUrl) {
      // console.log('getStreamingUrl: Using processed URL:', processedUrl);
      return processedUrl;
    }
  }

  // console.log('getStreamingUrl: No valid URLs found, returning empty string');
  return '';
};

// Get image URL with fallbacks
export const getImageUrl = (item: any): string => {
  const urls = [
    item?.headerImage,
    item?.mainImage,
    item?.imageUrl,
    item?.thumbnailUrl,
    item?.coverImage,
    item?.image
  ].filter(Boolean);

  // console.log('getImageUrl: Available image URLs:', urls);

  // Process each URL to handle Azure blob URLs
  for (const url of urls) {
    const processedUrl = processAzureUrl(url);
    if (processedUrl) {
      // console.log('getImageUrl: Using processed image URL:', processedUrl);
      return processedUrl;
    }
  }

  // console.log('getImageUrl: No valid image URLs found');
  return ''; // No fallback image
};

// Debug function to test Azure URLs
export const testAzureUrl = async (url: string): Promise<boolean> => {
  try {
    // console.log(`testAzureUrl: Testing URL - ${url}`);
    const response = await fetch(url, { method: 'HEAD' });
    // console.log(`testAzureUrl: Response - ${url}: ${response.status}`);
    return response.ok;
  } catch (error) {
    // console.error(`testAzureUrl: Failed - ${url}:`, error);
    return false;
  }
};

// Helper to create proper Azure API proxy URL
export const createAzureProxyUrl = (blobUrl: string): string => {
  if (!blobUrl) return '';

  const baseApiUrl = 'https://gbs-api.thankfulflower-dcee2acb.centralindia.azurecontainerapps.io/api';
  const encodedBlobUrl = encodeURIComponent(blobUrl);
  const proxyUrl = `${baseApiUrl}/azure-blob/file?blobUrl=${encodedBlobUrl}`;

  // console.log('createAzureProxyUrl: Original blob URL:', blobUrl);
  // console.log('createAzureProxyUrl: Created proxy URL:', proxyUrl);
  return proxyUrl;
};