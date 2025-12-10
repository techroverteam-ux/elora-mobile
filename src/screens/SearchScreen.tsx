import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TextInput } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import MaterialDesignIcons from '@react-native-vector-icons/material-design-icons';
import { debounce } from '../utils/debounce';
import AppBarHeader from '../components/AppBarHeader';
import SpotifyMediaCard from '../components/SpotifyMediaCard';
import { GridViewSkeleton } from '../components/SkeletonLoader';
import { useSearchContentQuery } from '../data/redux/services/mediaApi';

const SearchScreen = () => {
  const navigation = useNavigation();
  const { colors } = useTheme();
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');

  const { data: searchData, isLoading, isFetching } = useSearchContentQuery(
    { q: debouncedQuery, limit: 50 },
    { skip: !debouncedQuery || debouncedQuery.length < 2 }
  );

  const debouncedSearch = useCallback(
    debounce((query: string) => {
      setDebouncedQuery(query);
    }, 500),
    []
  );

  const handleSearchChange = (text: string) => {
    setSearchQuery(text);
    debouncedSearch(text);
  };

  const handleItemPress = (item: any, type: string) => {
    switch (type) {
      case 'audio':
        (navigation as any).navigate('EnhancedAudioPlayer', {
          item: {
            _id: item._id,
            title: item.title,
            artist: item.artist || item.description,
            imageUrl: item.thumbnailUrl || item.imageUrl,
            audioUrl: item.streamingUrl || item.audioUrl,
          }
        });
        break;
      case 'video':
        (navigation as any).navigate('EnhancedVideoPlayer', {
          item: {
            ...item,
            videoUri: item.streamingUrl || item.videoUrl,
          }
        });
        break;
      case 'pdf':
        (navigation as any).navigate('PdfViewer', {
          item: {
            ...item,
            pdfUrl: item.streamingUrl || item.pdfUrl,
          }
        });
        break;
    }
  };

  const renderSearchResults = () => {
    if (isLoading || isFetching) {
      return <GridViewSkeleton />;
    }

    if (!searchData?.data) return null;

    const { media = [] } = searchData.data;
    
    if (media.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <MaterialDesignIcons name="magnify" size={64} color={colors.onSurfaceVariant} />
          <Text style={[styles.emptyText, { color: colors.onSurfaceVariant }]}>
            {debouncedQuery ? t('screens.search.noResults') : t('screens.search.searchPrompt')}
          </Text>
        </View>
      );
    }

    return (
      <FlatList
        data={media}
        numColumns={2}
        keyExtractor={(item, index) => item._id || index.toString()}
        renderItem={({ item }) => (
          <SpotifyMediaCard
            item={item}
            type={item.type || 'audio'}
            onPress={(pressedItem) => handleItemPress(pressedItem, item.type || 'audio')}
          />
        )}
        contentContainerStyle={styles.gridContent}
        columnWrapperStyle={styles.row}
        showsVerticalScrollIndicator={false}
      />
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <AppBarHeader title={t('common.search')} />
      
      <View style={[styles.searchContainer, { backgroundColor: colors.surface }]}>
        <MaterialDesignIcons name="magnify" size={24} color={colors.onSurfaceVariant} />
        <TextInput
          style={[styles.searchInput, { color: colors.onSurface }]}
          placeholder={t('screens.search.placeholder')}
          placeholderTextColor={colors.onSurfaceVariant}
          value={searchQuery}
          onChangeText={handleSearchChange}
          autoFocus
        />
        {(isLoading || isFetching) && (
          <ActivityIndicator size="small" color={colors.primary} />
        )}
      </View>

      {renderSearchResults()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
  },
  gridContent: {
    paddingHorizontal: 10,
    paddingVertical: 16,
  },
  row: {
    justifyContent: 'space-around',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 16,
  },
});

export default SearchScreen;