import React from 'react'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import PagerView from 'react-native-pager-view'
import FastImage, { FastImageProps, ResizeMode } from 'react-native-fast-image'
import MaterialDesignIcons from '@react-native-vector-icons/material-design-icons'

type Card = {
  id: string
  text: string
  subtitle: string
  imageUrl: string
}

const cards: Card[] = [
  { id: '1', text: 'Lorem Ipsum', subtitle: "Lorem Ipsum dolor sit amet consectetur.", imageUrl: 'https://unsplash.it/400/400?image=1' },
  { id: '2', text: 'Card 2', subtitle: "Lorem Ipsum", imageUrl: 'https://unsplash.it/400/400?image=2' },
]

type CardItemProps = {
  text: string
  subtitle: string
  imageUrl: string
}

const CardItem: React.FC<CardItemProps> = ({ text, subtitle, imageUrl }) => (
  <View style={styles.cardContainer}>
    <FastImage
      style={styles.image}
      source={{
        uri: imageUrl,
        headers: { Authorization: 'someAuthToken' },
        priority: FastImage.priority.normal,
      }}
      resizeMode={FastImage.resizeMode.stretch as ResizeMode}
    />
    <View style={styles.overlay}>
      <View>
        <Text style={styles.text}>{text}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
      </View>
      <TouchableOpacity
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: '#fff',
          borderRadius: 10,
          paddingHorizontal: 6,
          // paddingVertical: 8,
          alignSelf: 'flex-start',  // key to prevent full width
        }}
      >
        <Text>Read Now</Text>
        <MaterialDesignIcons name={"chevron-right"} size={24} color={"#000"} />
      </TouchableOpacity>
    </View>
  </View>
)

const CardCarousel: React.FC = () => {
  return (
    <PagerView style={styles.pagerView} initialPage={0}>
      {cards.map(({ id, text, subtitle, imageUrl }) => (
        <CardItem key={id} text={text} subtitle={subtitle} imageUrl={imageUrl} />
      ))}
    </PagerView>
  )
}

export default CardCarousel

const styles = StyleSheet.create({
  pagerView: {
    height: 200,
    marginBottom: 20,
  },
  cardContainer: {
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: 200,
    borderRadius: 20,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 0, 0, 0.5)', // semi-transparent red overlay
    margin: 20,
    justifyContent: 'space-between',
    // alignItems: 'center',
    width: '60%',
  },
  text: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10
  },
  subtitle: {
    color: '#fff',
    fontSize: 14
  }
})
