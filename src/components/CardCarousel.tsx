import React from 'react'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import PagerView from 'react-native-pager-view'
import MaterialDesignIcons from '@react-native-vector-icons/material-design-icons'
import CustomFastImage from './CustomFastImage'

type Card = {
  id: string
  text: string
  subtitle: string
  imageUrl: string | number  // allow both local (require) and remote URLs
}

const cards: Card[] = [
  { id: '1', text: 'Lorem Ipsum', subtitle: "Lorem Ipsum dolor sit amet consectetur.", imageUrl: require('../assets/images/swamiVivekanand.png') },
  { id: '2', text: 'Card 2', subtitle: "Lorem Ipsum", imageUrl: require('../assets/images/swamiVivekanand.png') },
]

type CardItemProps = {
  text: string
  subtitle: string
  imageUrl: string | number
}

const CardItem: React.FC<CardItemProps> = ({ text, subtitle, imageUrl }) => {
  return (
    <View style={styles.cardContainer}>

      <CustomFastImage style={styles.image} imageUrl={imageUrl} />

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
            alignSelf: 'flex-start',
          }}
        >
          <Text>Read Now</Text>
          <MaterialDesignIcons name={"chevron-right"} size={24} color={"#000"} />
        </TouchableOpacity>
      </View>
    </View>
  )
}

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
    // backgroundColor: 'rgba(255, 0, 0, 0.5)', // semi-transparent red overlay
    margin: 20,
    justifyContent: 'space-between',
    width: '60%',
  },
  text: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subtitle: {
    color: '#fff',
    fontSize: 14,
  },
})
