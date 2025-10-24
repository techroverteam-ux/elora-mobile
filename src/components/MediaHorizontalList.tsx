import React from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from 'react-native-paper';
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

  if (!data || data.length === 0) return null;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.onBackground }]}>{title}</Text>
        {onSeeAll && (
          <TouchableOpacity onPress={onSeeAll}>
            <Text style={[styles.seeAll, { color: colors.primary }]}>See All</Text>
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
    marginBottom: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
  },
  seeAll: {
    fontSize: 14,
    fontWeight: '600',
  },
  listContent: {
    paddingHorizontal: 16,
  },
  separator: {
    width: 12,
  },
});

export default MediaHorizontalList;