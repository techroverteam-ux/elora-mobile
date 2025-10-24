import { StyleSheet, Text, View, FlatList, ActivityIndicator } from 'react-native'
import React from 'react'
import { useNavigation } from '@react-navigation/native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import AppBarHeader from '../../components/AppBarHeader';
import SpotifyMediaCard from '../../components/SpotifyMediaCard';
import { HomeStackParamList } from '../../navigation/types';
import { useTheme } from 'react-native-paper';
import { useSearchContentQuery } from '../../data/redux/services/mediaApi';

type AudioCategoryNavigationProp = NativeStackNavigationProp<HomeStackParamList>;

const AudioCategoryScreen = ({ route }: { route: any }) => {
  const { title } = route.params;
  const navigation = useNavigation<AudioCategoryNavigationProp>();
  const { colors } = useTheme();

  const { data: searchData, isLoading } = useSearchContentQuery({ 
    q: title.toLowerCase(), 
    type: 'audio',
    limit: 20 
  });
  
  const categoryAudios = searchData?.data?.media || [];

  const handleAudioPress = (item: any) => {
    navigation.navigate('EnhancedAudioPlayer', {
      item: {
        _id: item._id,
        title: item.title,
        artist: item.artist || item.description,
        imageUrl: item.thumbnailUrl || item.imageUrl,
        audioUrl: item.streamingUrl || item.audioUrl,
        category: title,
      }
    });
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <AppBarHeader title={title} />
      
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.onBackground }]}>Loading {title}...</Text>
        </View>
      ) : categoryAudios.length > 0 ? (
        <FlatList
          data={categoryAudios}
          numColumns={2}
          keyExtractor={(item, index) => item._id || index.toString()}
          renderItem={({ item }) => (
            <SpotifyMediaCard
              item={item}
              type="audio"
              onPress={handleAudioPress}
            />
          )}
          contentContainerStyle={styles.gridContent}
          columnWrapperStyle={styles.row}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={[styles.emptyText, { color: colors.onBackground }]}>No {title} found</Text>
        </View>
      )}
    </View>
  )
}

export default AudioCategoryScreen

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
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
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
  },
})