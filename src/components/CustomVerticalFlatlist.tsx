import React from 'react';
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Dimensions,
} from 'react-native';
import CustomFastImage from './CustomFastImage';
import MaterialDesignIcons from '@react-native-vector-icons/material-design-icons';
import { useTheme } from 'react-native-paper';
import { processAzureUrl } from '../utils/azureUrlHelper';
import { useNavigation } from '@react-navigation/native';
import { useThemeContext } from '../context/ThemeContext';

interface CustomVerticalFlatlistProps {
  title?: string;
  data: any[];
  onItemPress?: (item: any) => void;
  scrollEnabled?: boolean;
  imageUrl?: string | ((item: any) => string | undefined);
  isGridView?: boolean;
  nestedScrollEnabled?: boolean;
}

// ✅ Subcomponent for each row
const VerticalListItem = ({
  item,
  onItemPress,
  imageUrl,
  isGridView = false,
}: {
  item: any;
  onItemPress?: (item: any) => void;
  imageUrl?: string | ((item: any) => string | undefined);
  isGridView?: boolean;
}) => {
  const { colors } = useTheme();
  const { theme } = useThemeContext();
  const navigation = useNavigation();
  const isDark = theme === 'dark';

  // Get the raw image URL - check contentFields for images if no direct image
  let rawImageUrl =
    typeof imageUrl === 'function'
      ? imageUrl(item)
      : imageUrl || item.headerImage || item.mainImage || item.imageUrl || item.thumbnailUrl;
  
  // If no direct image found, check first image in contentFields
  if (!rawImageUrl && item.contentFields && Array.isArray(item.contentFields)) {
    const firstImageField = item.contentFields
      .filter(field => field.type === 'image' && field.azureFiles && field.azureFiles.length > 0)
      .sort((a, b) => (a.order || 0) - (b.order || 0))[0];
    
    if (firstImageField && firstImageField.azureFiles && firstImageField.azureFiles[0]) {
      rawImageUrl = firstImageField.azureFiles[0];
    }
  }
      
  // Process Azure URL using the same method as Daily Gyan Gallery
  const finalImageUrl = processAzureUrl(rawImageUrl);

  if (isGridView) {
    return (
      <TouchableOpacity
        style={[styles.gridItem, { 
          backgroundColor: isDark ? '#2D2D2D' : '#FFFFFF',
          shadowColor: isDark ? '#FFFFFF' : '#000000',
        }]}
        onPress={() => onItemPress?.(item)}
        activeOpacity={0.8}
      >
        <View style={styles.gridImageContainer}>
          {finalImageUrl ? (
            <CustomFastImage
              style={styles.gridImage}
              imageUrl={finalImageUrl}
              resizeMode="cover"
            />
          ) : (
            <View style={[styles.gridPlaceholder, { 
              backgroundColor: isDark ? '#404040' : colors.surfaceVariant 
            }]}>
              <MaterialDesignIcons 
                name="folder-outline" 
                size={32} 
                color={colors.primary} 
              />
            </View>
          )}
        </View>
        
        <View style={styles.gridContent}>
          <Text style={[styles.gridTitle, { 
            color: isDark ? '#FFFFFF' : colors.onSurface 
          }]} numberOfLines={2}>
            {item.title}
          </Text>
          <Text style={[styles.gridSubtitle, { 
            color: isDark ? '#CCCCCC' : colors.onSurfaceVariant 
          }]} numberOfLines={1}>
            {item.subtitle || 'Category'}
          </Text>
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <View>
      <TouchableOpacity
        style={styles.row}
        onPress={() => onItemPress?.(item)}
        activeOpacity={0.8}
      >
        {finalImageUrl ? (
          <TouchableOpacity
            onPress={() => {
              if (item.type === 'image') {
                (navigation as any).navigate('ImageViewer', {
                  images: [finalImageUrl],
                  initialIndex: 0,
                  title: item.title || 'Image'
                });
              }
            }}
            disabled={item.type !== 'image'}
          >
            <CustomFastImage
              style={styles.image}
              imageUrl={finalImageUrl}
              resizeMode="cover"
            />
          </TouchableOpacity>
        ) : null}

        <View style={styles.textContainer}>
          <Text
            style={[styles.name, { color: colors.onSurface }]}
            numberOfLines={1}
          >
            {item.title}
          </Text>
          <Text
            style={[styles.description, { color: colors.onSurfaceVariant }]}
            numberOfLines={2}
          >
            {item.subtitle}
          </Text>
        </View>

        <MaterialDesignIcons
          name="chevron-right"
          size={24}
          color={colors.primary}
        />
      </TouchableOpacity>

      <View style={[styles.separator, { backgroundColor: colors.outline }]} />
    </View>
  );
};

const CustomVerticalFlatlist: React.FC<CustomVerticalFlatlistProps> = ({
  title,
  data,
  onItemPress,
  scrollEnabled = true,
  imageUrl,
  isGridView = false,
  nestedScrollEnabled = false,
}) => {
  const { colors } = useTheme();
  const screenWidth = Dimensions.get('window').width;
  const numColumns = isGridView ? 3 : 1;
  
  // Calculate item width for 3 columns with proper spacing for all devices
  const containerPadding = 16;
  const itemSpacing = 6;
  const totalSpacing = containerPadding * 2 + itemSpacing * (numColumns - 1);
  const itemWidth = isGridView 
    ? Math.floor((screenWidth - totalSpacing) / numColumns)
    : screenWidth;

  const renderItem = ({ item, index }: { item: any; index: number }) => {
    if (isGridView) {
      const isLastInRow = (index + 1) % numColumns === 0;
      return (
        <View style={{ 
          width: itemWidth, 
          marginRight: isLastInRow ? 0 : itemSpacing,
          marginBottom: 8
        }}>
          <VerticalListItem 
            item={item} 
            onItemPress={onItemPress} 
            imageUrl={imageUrl} 
            isGridView={isGridView} 
          />
        </View>
      );
    }
    return (
      <VerticalListItem 
        item={item} 
        onItemPress={onItemPress} 
        imageUrl={imageUrl} 
        isGridView={isGridView} 
      />
    );
  };

  return (
    <View style={styles.itemContainer}>
      {title && (
        <Text style={[styles.title, { color: colors.onSurface }]}>{title}</Text>
      )}

      <FlatList
        data={data}
        renderItem={renderItem}
        keyExtractor={(item, index) =>
          item?._id?.toString() || item?.id?.toString() || index.toString()
        }
        numColumns={numColumns}
        key={isGridView ? 'grid-3' : 'list'}
        contentContainerStyle={[
          isGridView ? styles.gridContainer : styles.listContent,
          { paddingTop: isGridView ? 12 : 0 }
        ]}
        scrollEnabled={scrollEnabled}
        nestedScrollEnabled={nestedScrollEnabled}
      />
    </View>
  );
};

export default CustomVerticalFlatlist;

// ✅ Styles
const styles = StyleSheet.create({
  title: {
    fontSize: 16,
    fontWeight: '700',
  },
  listContent: {},
  gridContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  itemContainer: {
    flex: 1,
    width: '100%',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  image: {
    width: 70,
    height: 70,
    borderRadius: 10,
    overflow: 'hidden',
  },
  textContainer: {
    flex: 1,
    marginLeft: 15,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    color: '#6e6e6e',
    width: '75%',
  },
  separator: {
    height: 1,
    backgroundColor: '#E5E5E5',
    marginHorizontal: 16,
  },
  gridItem: {
    backgroundColor: '#fff',
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    overflow: 'hidden',
    flex: 1,
  },
  gridImageContainer: {
    width: '100%',
    aspectRatio: 1,
    overflow: 'hidden',
  },
  gridImage: {
    width: '100%',
    height: '100%',
  },
  gridPlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  gridContent: {
    padding: 8,
    minHeight: 50,
  },
  gridTitle: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 2,
    lineHeight: 16,
  },
  gridSubtitle: {
    fontSize: 11,
    opacity: 0.7,
    lineHeight: 14,
  },
});
