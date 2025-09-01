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
import CustomFastImage from './CustomFastImage';
import { useTheme } from 'react-native-paper';
import { MD3Colors } from 'react-native-paper/lib/typescript/types';

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

const getTagStyle = (tag: string, colors: MD3Colors): ViewStyle => {
  switch (tag.toLowerCase()) {
    case 'trending':
      return { backgroundColor: '#fff' };
    case 'best seller':
      return { backgroundColor: '#FBE08E' };
    case 'new':
      return { backgroundColor: '#00BFFF' };
    default:
      return { backgroundColor: '#ccc' };
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

  return (
    <View style={[styles.container]}>
      <View style={styles.header}>
        <Text style={[styles.sectionTitle, { color: colors.onSurface }]}>
          {title}
        </Text>
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
        style={styles.flatList}
        contentContainerStyle={styles.flatListContent}
        keyExtractor={(_, index) => index.toString()}
        renderItem={({ item }) => {
          const imageUri = String(item[imageKey]);
          const cardTitle = String(item[titleKey]);
          const cardSubtitle = subtitleKey ? String(item[subtitleKey]) : '';
          const contentTag = contentTagName ? String(item[contentTagName]) : '';

          return (
            <TouchableOpacity
              style={styles.card}
              onPress={() => onItemPress?.(item)}
            >
              <View style={styles.imageContainer}>
                <CustomFastImage style={styles.image} imageUrl={imageUri} />
                {contentTag ? (
                  <View style={[styles.trendingBadge, getTagStyle(contentTag, colors)]}>
                    <Text style={[styles.trendingText, { color: colors.onSurface }]}>
                      {contentTag}
                    </Text>
                  </View>
                ) : null}
              </View>
              <View style={styles.textContainer}>
                <Text style={[styles.title, { color: colors.onSurface }]} numberOfLines={1}>
                  {cardTitle}
                </Text>
                {cardSubtitle ? (
                  <Text style={[styles.subtitle, { color: colors.onSurfaceVariant }]}>
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

const styles = StyleSheet.create({
  container: {
    width: '100%',
  } as ViewStyle,
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  } as ViewStyle,
  sectionTitle: {
    fontWeight: 'bold',
    fontSize: 16,
  } as TextStyle,
  seeAll: {
    fontWeight: 'bold',
    textDecorationLine: 'underline',
    fontSize: 12,
  } as TextStyle,
  flatList: {
    marginTop: 20,
  },
  flatListContent: {
    gap: 16,
    paddingHorizontal: 16,
  },
  card: {
    width: 170,
  } as ViewStyle,
  image: {
    width: '100%',
    height: 170,
    borderRadius: 10,
  },
  textContainer: {
    padding: 10,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  } as TextStyle,
  subtitle: {
    fontSize: 14,
    color: '#555',
  } as TextStyle,
  imageContainer: {
    position: 'relative',
  },
  trendingBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: "#fff",
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 10,
  },
  trendingText: {
    color: '#000',
    fontSize: 12,
    fontWeight: 'bold',
  },
});
