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

interface CustomVerticalFlatlistProps {
  title?: string;
  data: any[];
  onItemPress?: (item: any) => void;
  scrollEnabled?: boolean;
}

const CustomVerticalFlatlist: React.FC<CustomVerticalFlatlistProps> = ({
  title,
  data,
  onItemPress,
  scrollEnabled = true,
}) => {

  const { colors } = useTheme();

  const renderItem = ({ item }: { item: any }) => (
    <View>
      <TouchableOpacity
        style={styles.row}
        onPress={() => onItemPress?.(item)}
        activeOpacity={0.8}
      >
        <CustomFastImage
          style={styles.image}
          imageUrl={item.image}
          resizeMode="cover"
        />

        <View style={styles.textContainer}>
          <Text style={[styles.name, { color: colors.onSurface }]} numberOfLines={1}>
            {item.title}
          </Text>
          <Text
            style={[styles.description, { color: colors.onSurfaceVariant }]}
            numberOfLines={2}
          >
            {item.subtitle}
          </Text>
        </View>

        <MaterialDesignIcons name="chevron-right" size={24} color={colors.outline} />
      </TouchableOpacity>

      <View style={[styles.separator, { backgroundColor: colors.outline }]} />
    </View>
  );

  return (
    <View style={styles.itemContainer}>
      {title && <Text style={[styles.title, { color: colors.onSurface }]}>{title}</Text>}
      <FlatList
        data={data}
        renderItem={renderItem}
        keyExtractor={(item, index) => item?.id?.toString?.() || index.toString()}
        contentContainerStyle={styles.listContent}
        scrollEnabled={scrollEnabled}
      />
    </View>
  );
};

export default CustomVerticalFlatlist;

// Styles
const styles = StyleSheet.create({
  title: {
    fontSize: 16,
    fontWeight: '700',
  },
  listContent: {
    // paddingVertical: 10,
  },
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
