import React from 'react';
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator, // ✅ added
} from 'react-native';
import CustomFastImage from './CustomFastImage';
import MaterialDesignIcons from '@react-native-vector-icons/material-design-icons';
import { useTheme } from 'react-native-paper';
import { useAzureBlobImages } from '../hooks/useAzureBlobImage';

interface CustomVerticalFlatlistProps {
  title?: string;
  data: any[];
  onItemPress?: (item: any) => void;
  scrollEnabled?: boolean;
}

// ✅ Subcomponent for each row — this CAN use hooks safely
const VerticalListItem = ({
  item,
  onItemPress,
}: {
  item: any;
  onItemPress?: (item: any) => void;
}) => {
  const { colors } = useTheme();

  // Get the image URL using the custom hook
  const blobUrls = {
    headerImage: item?.headerImage,
  };

  const azureData = useAzureBlobImages(blobUrls);

  // Destructure to get imageUrl from the response
  const { imageUrl, isLoading } = azureData?.headerImage || {};

  return (
    <View>
      <TouchableOpacity
        style={styles.row}
        onPress={() => onItemPress?.(item)}
        activeOpacity={0.8}
      >
        {/* If imageUrl is available, render the image */}
        {isLoading ? (
          <View style={[styles.image, styles.imageLoader]}>
            <ActivityIndicator size="small" color={colors.primary} />
          </View>
        ) : imageUrl ? (
          <CustomFastImage
            style={styles.image}
            imageUrl={imageUrl}
            resizeMode="cover"
          />
        ) : (
          <View style={[styles.image, styles.noImageContainer]}>
            <Text style={styles.noImageText}>No Image</Text>
          </View>
        )}

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
          color={colors.outline}
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
}) => {
  const { colors } = useTheme();

  return (
    <View style={styles.itemContainer}>
      {title && (
        <Text style={[styles.title, { color: colors.onSurface }]}>{title}</Text>
      )}

      <FlatList
        data={data}
        renderItem={({ item }) => (
          <VerticalListItem item={item} onItemPress={onItemPress} />
        )}
        keyExtractor={(item, index) =>
          item?.id?.toString?.() || index.toString()
        }
        contentContainerStyle={styles.listContent}
        scrollEnabled={scrollEnabled}
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
  itemContainer: {
    width: '90%',
    alignSelf: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  image: {
    width: 70,
    height: 70,
    borderRadius: 10,
    overflow: 'hidden',
  },
  imageLoader: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f0f0f0',
  },
  noImageContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#e0e0e0',
  },
  noImageText: {
    fontSize: 10,
    color: '#666',
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
  },
});
