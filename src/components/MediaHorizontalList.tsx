import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { useTheme } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation();
  const [dimensions, setDimensions] = useState(Dimensions.get('window'));
  
  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setDimensions(window);
    });
    return () => subscription?.remove();
  }, []);
  
  const width = dimensions.width;
  const isTablet = width >= 768;
  const is7InchTablet = width >= 600 && width < 800;
  const is10InchTablet = width >= 800;

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
      <View style={[styles.header, isTablet && { paddingHorizontal: 0, marginBottom: is10InchTablet ? 16 : 12 }]}>
        <View style={styles.titleContainer}>
          <MaterialDesignIcons name={getIcon()} size={is10InchTablet ? 32 : is7InchTablet ? 26 : 24} color={colors.primary} />
          <Text style={[styles.title, { color: colors.onBackground, fontSize: is10InchTablet ? 24 : is7InchTablet ? 20 : 18 }]}>{title}</Text>
        </View>
        {onSeeAll && (
          <TouchableOpacity onPress={onSeeAll} style={styles.seeAllButton}>
            <Text style={[styles.seeAll, { color: colors.primary, fontSize: is10InchTablet ? 15 : 13 }]}>{t('screens.home.seeAll')}</Text>
            <MaterialDesignIcons name="chevron-right" size={is10InchTablet ? 24 : 20} color={colors.onSurfaceVariant} />
          </TouchableOpacity>
        )}
      </View>
      
      <FlatList
        data={data}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item, index) => item._id || item.id || index.toString()}
        renderItem={({ item }) => {
          // Detect actual item type for mixed content
          const actualType = item.type === 'image' ? 'audio' : 
                           item.type === 'video' ? 'video' : 
                           item.type === 'pdf' ? 'pdf' : type;
          
          return (
            <UnifiedMediaCard
              item={item}
              type={actualType}
              onPress={onItemPress}
            />
          );
        }}
        contentContainerStyle={[styles.listContent, isTablet && { paddingHorizontal: 0 }]}
        ItemSeparatorComponent={() => <View style={[styles.separator, is10InchTablet && { width: 20 }, is7InchTablet && { width: 14 }]} />}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
  },
  seeAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  seeAll: {
    fontSize: 13,
    fontWeight: '500',
    marginRight: 4,
  },
  listContent: {
    paddingHorizontal: 16,
  },
  separator: {
    width: 10,
  },
});

export default MediaHorizontalList;