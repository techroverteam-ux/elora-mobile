import { FlatList, StyleSheet, Text, View } from 'react-native'
import React from 'react'
import FastImage from 'react-native-fast-image'

const CardSection = () => {
  return (
    <View style={{ width: "100%" }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <Text>Recently Viewed</Text>
        <Text>See All</Text>
      </View>
      <FlatList
        data={[1, 2, 3, 4, 5]}
        horizontal
        renderItem={({ item }) =>
          <View>
            <Text>{item}</Text>
            <FastImage
              style={{ width: 200, height: 200 }}
              source={{
                uri: 'https://unsplash.it/400/400?image=1',
                headers: { Authorization: 'someAuthToken' },
                priority: FastImage.priority.normal,
              }}
              resizeMode={FastImage.resizeMode.contain}
            />
          </View>
        }
        keyExtractor={(item) => item.toString()}
      />
    </View>
  )
}

export default CardSection

const styles = StyleSheet.create({})