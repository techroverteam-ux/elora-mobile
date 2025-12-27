import React from 'react';
import {
  StyleSheet,
  View,
} from 'react-native';
import { useRoute, RouteProp, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import AppBarHeader from '../../components/AppBarHeader';
import ContentListVertical from '../../components/ContentListVertical';
import { CategoriesStackParamList } from '../../navigation/types';

interface ContentItem {
  _id?: string;
  title: string;
  subtitle?: string;
  url?: string;
  mediaUrl?: string;
  mediaType?: 'image' | 'video' | 'audio' | 'file';
  order: number;
  duration?: string;
}

type ContentListViewNavigationProp = NativeStackNavigationProp<
  CategoriesStackParamList,
  'ContentListView'
>;

const ContentListView = () => {
  const route = useRoute<RouteProp<CategoriesStackParamList, 'ContentListView'>>();
  const navigation = useNavigation<ContentListViewNavigationProp>();
  const { contentList, title } = route.params;
  
  console.log('📋 ContentListView - Route params:', {
    title,
    contentListLength: contentList?.length || 0,
    contentList: JSON.stringify(contentList, null, 2)
  });

  // Transform contentList to match the expected format
  const transformedContentList: ContentItem[] = contentList.map((item, index) => ({
    _id: item._id || `content-${index}`,
    title: item.title,
    subtitle: item.subtitle,
    url: item.url,
    mediaUrl: item.mediaUrl || '', // Default empty if not provided
    mediaType: (item.mediaType as 'image' | 'video' | 'audio' | 'file') || 'file', // Default to 'file'
    order: item.order || index,
    duration: item.duration || '',
  }));
  
  // Determine dominant media type for header icon
  const getHeaderIcon = () => {
    if (!transformedContentList.length) return 'file-document';
    
    const mediaTypes = transformedContentList.map(item => item.mediaType).filter(Boolean);
    const typeCounts = mediaTypes.reduce((acc: any, type) => {
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {});
    
    const dominantType = Object.keys(typeCounts).reduce((a, b) => 
      typeCounts[a] > typeCounts[b] ? a : b, 'file'
    );
    
    switch (dominantType) {
      case 'video': return 'play-circle';
      case 'audio': return 'music-note';
      case 'image': return 'image';
      case 'file': return mediaTypes.some(type => type === 'file') ? 'file-pdf-box' : 'file-document';
      default: return 'file-document';
    }
  };
  
  console.log('🔄 Transformed contentList:', JSON.stringify(transformedContentList, null, 2));

  return (
    <View style={styles.container}>
      <AppBarHeader 
        title={title} 
        onBack={() => navigation.goBack()}
        icon={getHeaderIcon()}
      />
      
      <ContentListVertical
        contentList={transformedContentList}
        headerTitle={title}
        showHeader={false} // We already have AppBarHeader
        style={styles.contentListContainer}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  contentListContainer: {
    flex: 1,
  },
});

export default ContentListView;