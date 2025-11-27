import React from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View, Dimensions } from 'react-native';
import CustomFastImage from './CustomFastImage';
import { useTheme } from 'react-native-paper';
import { useAzureAssets } from '../hooks/useAzureAssets';
import { wp, hp } from '../utils/responsive';

const { width } = Dimensions.get('window');
const getNumColumns = () => width > 768 ? 3 : 2;
const getItemWidth = () => (width - wp(8) - (getNumColumns() - 1) * wp(4)) / getNumColumns();

interface CustomGridViewProps {
  data: any[];
  onItemPress?: (item: any) => void;
}

const GridItem = ({ item, onItemPress }: { item: any; onItemPress?: (item: any) => void }) => {
  const { colors } = useTheme();
  const { resourceUrls } = useAzureAssets(item);
  const { headerImage: headerImageUrl, thumbnailImage: thumbnailUrl } = resourceUrls;
  const finalImageUrl = headerImageUrl || thumbnailUrl;

  return (
    <TouchableOpacity
      style={[styles.gridItem, { backgroundColor: colors.surface }]}
      onPress={() => onItemPress?.(item)}
      activeOpacity={0.8}
    >
      {finalImageUrl && (
        <CustomFastImage
          style={styles.gridImage}
          imageUrl={finalImageUrl}
          resizeMode="cover"
        />
      )}
      <View style={styles.gridTextContainer}>
        <Text style={[styles.gridTitle, { color: colors.onSurface }]} numberOfLines={2}>
          {item.title}
        </Text>
        <Text style={[styles.gridSubtitle, { color: colors.onSurfaceVariant }]} numberOfLines={1}>
          {item.subtitle}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const CustomGridView: React.FC<CustomGridViewProps> = ({ data, onItemPress }) => {
  const numColumns = getNumColumns();
  
  return (
    <FlatList
      data={data}
      renderItem={({ item }) => <GridItem item={item} onItemPress={onItemPress} />}
      keyExtractor={(item, index) => item?._id?.toString() || index.toString()}
      numColumns={numColumns}
      contentContainerStyle={styles.gridContainer}
      columnWrapperStyle={numColumns > 1 ? styles.row : undefined}
      key={numColumns}
    />
  );
};

const styles = StyleSheet.create({
  gridContainer: {
    padding: wp(4),
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: wp(4),
  },
  gridItem: {
    width: getItemWidth(),
    borderRadius: wp(3),
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    marginBottom: wp(4),
  },
  gridImage: {
    width: '100%',
    height: wp(30),
    borderTopLeftRadius: wp(3),
    borderTopRightRadius: wp(3),
  },
  gridTextContainer: {
    padding: wp(3),
  },
  gridTitle: {
    fontSize: wp(3.5),
    fontWeight: '600',
    marginBottom: wp(1),
  },
  gridSubtitle: {
    fontSize: wp(3),
  },
});

export default CustomGridView;