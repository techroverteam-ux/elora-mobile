import { FlatList, StyleSheet, Text, View, TouchableOpacity } from 'react-native'
import React from 'react'
import { useNavigation } from '@react-navigation/native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import CustomFastImage from './CustomFastImage'
import MaterialDesignIcons from '@react-native-vector-icons/material-design-icons'
import { useTheme } from 'react-native-paper'
import { HomeStackParamList } from '../navigation/types'

type NavigationProp = NativeStackNavigationProp<HomeStackParamList>;

const data = [
  {
    id: '1',
    title: 'Shri Krishna Bh...',
    duration: '4:32 min',
    image: require('../assets/images/shreeKrishna.png'),
  },
  {
    id: '2',
    title: 'Daily Stuti',
    duration: '12:45 min',
    image: require('../assets/images/shreeKrishna.png'),
  },
  {
    id: '3',
    title: 'Bal Gopal Krishna',
    duration: '3:15 min',
    image: require('../assets/images/shreeKrishna.png'),
  },
  {
    id: '4',
    title: 'Daily Stuti',
    duration: '12:45 min',
    image: require('../assets/images/shreeKrishna.png'),
  },
]


const CustomHorizontalFlatlist = () => {
  const { colors } = useTheme();
  const navigation = useNavigation<NavigationProp>();
  
  const handleItemPress = (item: any) => {
    navigation.navigate('EnhancedAudioPlayer', {
      item: {
        _id: item.id,
        title: item.title,
        artist: 'Various Artists',
        duration: item.duration,
        imageUrl: item.image,
        audioUrl: 'https://example.com/audio.mp3',
      }
    });
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.heading, { color: colors.onSurface }]}>Newly Added</Text>
      <FlatList
        data={data}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.card} onPress={() => handleItemPress(item)} activeOpacity={0.8}>
            <View style={styles.imageContainer}>
              <CustomFastImage style={styles.image} imageUrl={item.image} />
              <MaterialDesignIcons
                name="play-circle"
                size={36}
                color={colors.onPrimary}
                style={styles.playIcon}
              />
            </View>
            <Text style={[styles.title, { color: colors.onSurface }]} numberOfLines={1}>
              {item.title}
            </Text>
            <Text style={[styles.duration, { color: colors.onSurfaceVariant }]}>
              {item.duration}
            </Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

export default CustomHorizontalFlatlist

const styles = StyleSheet.create({
  container: {
    marginVertical: 10,
  },
  heading: {
    fontSize: 18,
    fontWeight: 'bold',
    marginHorizontal: 15,
    marginBottom: 10,
  },
  listContainer: {
    paddingHorizontal: 15,
  },
  card: {
    marginRight: 15,
    width: 120,
  },
  imageContainer: {
    position: 'relative',
    borderRadius: 10,
    overflow: 'hidden',
    height: 120,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  playIcon: {
    position: 'absolute',
    top: '40%',
    left: '40%',
    opacity: 0.8,
  },
  title: {
    marginTop: 5,
    fontSize: 14,
    fontWeight: '500',
    color: '#000',
  },
  duration: {
    fontSize: 12,
    color: '#666',
  },
})