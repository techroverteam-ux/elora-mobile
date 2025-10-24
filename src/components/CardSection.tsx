import React from 'react';
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
  TextStyle,
} from 'react-native';
import MaterialDesignIcons from '@react-native-vector-icons/material-design-icons';
import CustomFastImage from './CustomFastImage';
import { useTheme } from 'react-native-paper';
import { MD3Colors } from 'react-native-paper/lib/typescript/types';
import { useAzureAssets } from '../hooks/useAzureAssets';

interface CardSectionProps<T> {
  title?: string;
  data: T[];
  onSeeAll?: () => void;
  onItemPress?: (item: T) => void;
  imageKey: keyof T;
  titleKey: keyof T;
  subtitleKey?: keyof T;
  contentTagName?: keyof T;
}

//
// 🔹 Theme-aware tag color logic
//
const getTagStyle = (tag: string, colors: MD3Colors): ViewStyle => {
  const base = {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
  };

  switch (tag.toLowerCase()) {
    case 'trending':
      return { ...base, backgroundColor: colors.primaryContainer };
    case 'best seller':
      return { ...base, backgroundColor: colors.tertiaryContainer };
    case 'new':
      return { ...base, backgroundColor: colors.secondaryContainer };
    default:
      return { ...base, backgroundColor: colors.surfaceVariant };
  }
};

function CardSection<T>({
  title = 'Section Title',
  data,
  onSeeAll,
  onItemPress,
  imageKey,
  titleKey,
  subtitleKey,
  contentTagName,
}: CardSectionProps<T>) {
  const { colors } = useTheme();

  const { resourceUrls } = useAzureAssets(data);
  const { thumbnailImage: thumbnailUrl, streamingUrl: streamingUrl, downloadUrl: downloadUrl } = resourceUrls;

  // console.log("resourceUrls: ", resourceUrls);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.sectionTitle, { color: colors.onSurface }]}>
          {title}
        </Text>
        {onSeeAll && (
          <TouchableOpacity onPress={onSeeAll}>
            <Text style={[styles.seeAll, { color: colors.primary }]}>
              See All
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* List */}
      <FlatList
        data={data}
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.flatList}
        contentContainerStyle={styles.flatListContent}
        keyExtractor={(_, index) => index.toString()}
        renderItem={({ item }) => {
          const imageUri = String(item[imageKey] || '');
          const cardTitle = String(item[titleKey] || 'Untitled');
          const cardSubtitle = subtitleKey ? String(item[subtitleKey] || '') : '';
          const contentTag = contentTagName ? String(item[contentTagName] || '') : '';
          
          // Generate placeholder colors based on title
          const colors_list = ['#FADBD8', '#FDEBD0', '#D6EAF8', '#D5F5E3', '#FCF3CF', '#E8DAEF'];
          const colorIndex = cardTitle.length % colors_list.length;
          const placeholderColor = colors_list[colorIndex];

          return (
            <TouchableOpacity
              style={[
                styles.card,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.outlineVariant,
                },
              ]}
              activeOpacity={0.8}
              onPress={() => onItemPress?.(item)}
            >
              {/* Image + Badge */}
              <View style={styles.imageContainer}>
                {imageUri && imageUri !== 'undefined' && imageUri !== 'null' ? (
                  <CustomFastImage style={styles.image} imageUrl={imageUri} />
                ) : (
                  <View style={[styles.image, { backgroundColor: placeholderColor, justifyContent: 'center', alignItems: 'center' }]}>
                    <MaterialDesignIcons 
                      name={title?.toLowerCase().includes('video') ? 'video' : 'music-note'} 
                      size={40} 
                      color="#666" 
                    />
                    <Text style={{ color: '#666', fontSize: 12, marginTop: 4 }}>
                      {title?.toLowerCase().includes('video') ? 'Video' : 'Audio'}
                    </Text>
                  </View>
                )}
                {contentTag ? (
                  <View style={[styles.trendingBadge, getTagStyle(contentTag, colors)]}>
                    <Text
                      style={[styles.trendingText, { color: colors.onPrimaryContainer }]}
                    >
                      {contentTag}
                    </Text>
                  </View>
                ) : null}
              </View>

              {/* Text Content */}
              <View style={styles.textContainer}>
                <Text
                  style={[styles.title, { color: colors.onSurface }]}
                  numberOfLines={1}
                >
                  {cardTitle}
                </Text>
                {cardSubtitle ? (
                  <Text
                    style={[styles.subtitle, { color: colors.onSurfaceVariant }]}
                    numberOfLines={2}
                  >
                    {cardSubtitle}
                  </Text>
                ) : null}
              </View>
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
}

export default CardSection;

//
// 🔹 Styles
//
const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginTop: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontWeight: '700',
    fontSize: 18,
  },
  seeAll: {
    fontWeight: '600',
    textDecorationLine: 'underline',
    fontSize: 13,
  },
  flatList: {
    marginTop: 12,
  },
  flatListContent: {
    gap: 16,
    paddingHorizontal: 16,
  },
  card: {
    width: 170,
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
    elevation: 1,
  },
  imageContainer: {
    position: 'relative',
  },
  image: {
    width: '100%',
    height: 170,
  },
  trendingBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
  },
  trendingText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  textContainer: {
    padding: 10,
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 13,
  }
});
