import { Share, Alert } from 'react-native';

// Deep link configuration
const DEEP_LINK_CONFIG = {
  scheme: 'geetabalsanskar',
  domain: 'gbs.app', // Your app's domain
  playStoreUrl: 'https://play.google.com/store/apps/details?id=com.geetabalsanskar',
  appStoreUrl: 'https://apps.apple.com/app/geeta-bal-sanskar/id123456789', // Replace with actual ID
};

export interface ShareableContent {
  _id: string;
  title: string;
  type: 'audio' | 'video' | 'pdf' | 'image' | 'blog';
  streamingUrl?: string;
  audioUrl?: string;
  videoUrl?: string;
  pdfUrl?: string;
  imageUrl?: string;
  thumbnailUrl?: string;
  artist?: string;
  author?: string;
  description?: string;
  categoryId?: string;
  sectionId?: string;
}

/**
 * Generate deep link for content
 */
export const generateDeepLink = (content: ShareableContent): string => {
  const baseUrl = `${DEEP_LINK_CONFIG.scheme}://content`;
  const params = new URLSearchParams({
    id: content._id,
    type: content.type,
    title: encodeURIComponent(content.title),
  });

  // Add optional parameters
  if (content.categoryId) params.append('categoryId', content.categoryId);
  if (content.sectionId) params.append('sectionId', content.sectionId);

  return `${baseUrl}?${params.toString()}`;
};

/**
 * Generate universal link (web fallback)
 */
export const generateUniversalLink = (content: ShareableContent): string => {
  const baseUrl = `https://${DEEP_LINK_CONFIG.domain}/content`;
  const params = new URLSearchParams({
    id: content._id,
    type: content.type,
    title: encodeURIComponent(content.title),
  });

  if (content.categoryId) params.append('categoryId', content.categoryId);
  if (content.sectionId) params.append('sectionId', content.sectionId);

  return `${baseUrl}?${params.toString()}`;
};

/**
 * Generate smart app link with fallback to store
 */
export const generateSmartLink = (content: ShareableContent): string => {
  const universalLink = generateUniversalLink(content);
  return universalLink;
};

/**
 * Share content with deep link
 */
export const shareContent = async (content: ShareableContent): Promise<void> => {
  try {
    const deepLink = generateSmartLink(content);
    const shareMessage = getShareMessage(content, deepLink);

    const result = await Share.share({
      message: shareMessage,
      url: deepLink,
      title: content.title,
    });

    console.log('Content shared successfully:', result);
  } catch (error) {
    console.error('Error sharing content:', error);
    Alert.alert('Error', 'Failed to share content. Please try again.');
  }
};

/**
 * Generate share message based on content type
 */
const getShareMessage = (content: ShareableContent, link: string): string => {
  const appName = 'Geeta Bal Sanskar';
  
  switch (content.type) {
    case 'audio':
      return `🎵 Listen to "${content.title}"${content.artist ? ` by ${content.artist}` : ''} on ${appName}\n\n${link}\n\nDownload the app: ${DEEP_LINK_CONFIG.playStoreUrl}`;
    
    case 'video':
      return `🎬 Watch "${content.title}" on ${appName}\n\n${link}\n\nDownload the app: ${DEEP_LINK_CONFIG.playStoreUrl}`;
    
    case 'pdf':
      return `📖 Read "${content.title}"${content.author ? ` by ${content.author}` : ''} on ${appName}\n\n${link}\n\nDownload the app: ${DEEP_LINK_CONFIG.playStoreUrl}`;
    
    case 'image':
      return `🖼️ View "${content.title}" on ${appName}\n\n${link}\n\nDownload the app: ${DEEP_LINK_CONFIG.playStoreUrl}`;
    
    case 'blog':
      return `📝 Read "${content.title}" on ${appName}\n\n${link}\n\nDownload the app: ${DEEP_LINK_CONFIG.playStoreUrl}`;
    
    default:
      return `Check out "${content.title}" on ${appName}\n\n${link}\n\nDownload the app: ${DEEP_LINK_CONFIG.playStoreUrl}`;
  }
};

/**
 * Parse deep link to extract content information
 */
export const parseDeepLink = (url: string): ShareableContent | null => {
  try {
    const urlObj = new URL(url);
    const params = new URLSearchParams(urlObj.search);
    
    const id = params.get('id');
    const type = params.get('type') as ShareableContent['type'];
    const title = params.get('title');
    
    if (!id || !type || !title) {
      return null;
    }
    
    return {
      _id: id,
      type,
      title: decodeURIComponent(title),
      categoryId: params.get('categoryId') || undefined,
      sectionId: params.get('sectionId') || undefined,
    };
  } catch (error) {
    console.error('Error parsing deep link:', error);
    return null;
  }
};

/**
 * Handle incoming deep link
 */
export const handleDeepLink = (url: string, navigation: any): void => {
  const content = parseDeepLink(url);
  
  if (!content) {
    console.error('Invalid deep link:', url);
    return;
  }
  
  console.log('Handling deep link for content:', content);
  
  // Navigate based on content type
  switch (content.type) {
    case 'audio':
      navigation.navigate('EnhancedAudioPlayer', { item: content });
      break;
    
    case 'video':
      navigation.navigate('EnhancedVideoPlayer', { item: content });
      break;
    
    case 'pdf':
      navigation.navigate('PdfViewer', { item: content });
      break;
    
    case 'image':
      navigation.navigate('ImageViewer', { 
        images: [content.imageUrl || content.streamingUrl || ''],
        initialIndex: 0,
        title: content.title 
      });
      break;
    
    case 'blog':
      navigation.navigate('BlogPost', { categoryId: content._id, title: content.title });
      break;
    
    default:
      console.warn('Unknown content type for deep link:', content.type);
  }
};