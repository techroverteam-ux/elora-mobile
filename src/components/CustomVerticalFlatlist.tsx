import React from 'react';
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import CustomFastImage from './CustomFastImage';
import MaterialDesignIcons from '@react-native-vector-icons/material-design-icons';
import { useTheme } from 'react-native-paper';
import { useAzureAssets } from '../hooks/useAzureAssets';
import { useNavigation } from '@react-navigation/native';

interface CustomVerticalFlatlistProps {
  title?: string;
  data: any[];
  onItemPress?: (item: any) => void;
  scrollEnabled?: boolean;
  imageUrl?: string | ((item: any) => string | undefined); // ✅ can be a URL or a function that returns one
}

// ✅ Subcomponent for each row
const VerticalListItem = ({
  item,
  onItemPress,
  imageUrl,
}: {
  item: any;
  onItemPress?: (item: any) => void;
  imageUrl?: string | ((item: any) => string | undefined);
}) => {
  const { colors } = useTheme();
  const navigation = useNavigation();

  // get azure assets only if no custom image URL is passed
  const { resourceUrls } = useAzureAssets(item);
  const { headerImage: headerImageUrl, thumbnailImage: thumbnailUrl } = resourceUrls;

  // ✅ Prefer custom imageUrl if provided
  const finalImageUrl =
    typeof imageUrl === 'function'
      ? imageUrl(item)
      : imageUrl || headerImageUrl || thumbnailUrl;

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
  imageUrl,
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
          <VerticalListItem item={item} onItemPress={onItemPress} imageUrl={imageUrl} />
        )}
        keyExtractor={(item, index) =>
          item?._id?.toString() || item?.id?.toString() || index.toString()
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
