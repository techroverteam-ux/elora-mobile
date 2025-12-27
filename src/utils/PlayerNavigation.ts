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
  // Check explicit type first
  if (item.type === 'audio') return 'audio';
  if (item.type === 'video') return 'video';
  if (item.type === 'pdf') return 'pdf';
  
  // Check for specific URL properties
  if (item.audioUrl) return 'audio';
  if (item.videoUrl || item.videoUri) return 'video';
  if (item.pdfUrl) return 'pdf';
  
  // Check file extensions in any URL field
  const url = item.streamingUrl || item.url || item.downloadUrl || '';
  if (url.includes('.mp3') || url.includes('.wav') || url.includes('.m4a') || url.includes('.aac') || url.includes('.flac')) return 'audio';
  if (url.includes('.mp4') || url.includes('.mov') || url.includes('.avi') || url.includes('.mkv') || url.includes('.webm')) return 'video';
  if (url.includes('.pdf')) return 'pdf';
  
  // If no clear indication, check if it's likely an audio item based on context
  if (item.artist || item.album || (item.title && !item.videoUrl && !item.pdfUrl)) {
    return 'audio';
  }
  
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