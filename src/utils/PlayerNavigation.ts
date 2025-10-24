import { NavigationProp } from '@react-navigation/native';

// Enhanced player navigation utilities
export const navigateToAudioPlayer = (navigation: NavigationProp<any>, item: any, playlist?: any[]) => {
  console.log('Navigating to audio player:', item?.title);
  
  // Navigate to enhanced audio player
  (navigation as any).navigate('EnhancedAudioPlayer', {
    item: {
      _id: item._id,
      title: item.title,
      artist: item.artist || item.description || 'Unknown Artist',
      imageUrl: item.thumbnailUrl || item.imageUrl,
      audioUrl: item.streamingUrl || item.audioUrl,
      duration: item.duration,
      ...item // Include all other properties
    },
    playlist: playlist || []
  });
};

export const navigateToVideoPlayer = (navigation: NavigationProp<any>, item: any, playlist?: any[]) => {
  console.log('Navigating to video player:', item?.title);
  
  // Navigate to enhanced video player
  (navigation as any).navigate('EnhancedVideoPlayer', {
    item: {
      _id: item._id,
      title: item.title,
      description: item.description || item.artist,
      thumbnailUrl: item.thumbnailUrl || item.imageUrl,
      videoUrl: item.streamingUrl || item.videoUrl || item.videoUri,
      duration: item.duration,
      ...item // Include all other properties
    },
    playlist: playlist || []
  });
};

export const navigateToPdfViewer = (navigation: NavigationProp<any>, item: any) => {
  console.log('Navigating to PDF viewer:', item?.title);
  
  // Navigate to PDF viewer
  (navigation as any).navigate('PdfViewer', {
    item: {
      _id: item._id,
      title: item.title,
      pdfUrl: item.streamingUrl || item.pdfUrl || item.url,
      ...item // Include all other properties
    }
  });
};

// Helper to determine media type from item
export const getMediaType = (item: any): 'audio' | 'video' | 'pdf' | 'unknown' => {
  if (item.audioUrl || item.type === 'audio') return 'audio';
  if (item.videoUrl || item.videoUri || item.type === 'video') return 'video';
  if (item.pdfUrl || item.type === 'pdf') return 'pdf';
  
  // Check file extensions
  const url = item.streamingUrl || item.url || '';
  if (url.includes('.mp3') || url.includes('.wav') || url.includes('.m4a')) return 'audio';
  if (url.includes('.mp4') || url.includes('.mov') || url.includes('.avi')) return 'video';
  if (url.includes('.pdf')) return 'pdf';
  
  return 'unknown';
};

// Smart navigation based on media type
export const navigateToMediaPlayer = (navigation: NavigationProp<any>, item: any, playlist?: any[]) => {
  const mediaType = getMediaType(item);
  
  switch (mediaType) {
    case 'audio':
      navigateToAudioPlayer(navigation, item, playlist);
      break;
    case 'video':
      navigateToVideoPlayer(navigation, item, playlist);
      break;
    case 'pdf':
      navigateToPdfViewer(navigation, item);
      break;
    default:
      console.warn('Unknown media type for item:', item);
      // Default to audio player
      navigateToAudioPlayer(navigation, item, playlist);
  }
};