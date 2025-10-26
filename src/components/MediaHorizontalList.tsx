import React from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from 'react-native-paper';
import MaterialDesignIcons from '@react-native-vector-icons/material-design-icons';
import UnifiedMediaCard from './UnifiedMediaCard';

interface MediaHorizontalListProps {
  title: string;
  data: any[];
  type?: 'audio' | 'video' | 'pdf';
  onItemPress: (item: any) => void;
  onSeeAll?: () => void;
}

const MediaHorizontalList: React.FC<MediaHorizontalListProps> = ({
  title,
  data,
  type = 'audio',
  onItemPress,
  onSeeAll,
}) => {
  const { colors } = useTheme();

  const getIcon = () => {
    switch (type) {
      case 'video': return 'play-circle';
      case 'pdf': return 'book-open-variant';
      default: return 'headphones';
    }
  };

  if (!data || data.length === 0) return null;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <MaterialDesignIcons name={getIcon()} size={24} color={colors.primary} />
          <Text style={[styles.title, { color: colors.onBackground }]}>{title}</Text>
        </View>
        {onSeeAll && (
          <TouchableOpacity onPress={onSeeAll} style={styles.seeAllButton}>
            <Text style={[styles.seeAll, { color: colors.primary }]}>See All</Text>
            <MaterialDesignIcons name="chevron-right" size={20} color={colors.onSurfaceVariant} />
          </TouchableOpacity>
        )}
      </View>
      
      <FlatList
        data={data}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item, index) => item._id || item.id || index.toString()}
        renderItem={({ item }) => (
          <UnifiedMediaCard
            item={item}
            type={type}
            onPress={onItemPress}
          />
        )}
        contentContainerStyle={styles.listContent}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 15,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    marginLeft: 8,
  },
  seeAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  seeAll: {
    fontSize: 14,
    fontWeight: '600',
    marginRight: 4,
  },
  listContent: {
    paddingHorizontal: 16,
  },
  separator: {
    width: 12,
  },
});

export default MediaHorizontalList;