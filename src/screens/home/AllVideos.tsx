import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import AppBarHeader from '../../components/AppBarHeader'
import { RouteProp, useRoute } from '@react-navigation/native'
import CustomVerticalFlatlist from '../../components/CustomVerticalFlatlist'

// 1️⃣ Define your navigation param list
type RootStackParamList = {
  AllVideos: { item: any }  // 👈 define params expected for this route
  // other routes...
}

// 2️⃣ Tell useRoute() which route type you’re using
type AllVideosRouteProp = RouteProp<RootStackParamList, 'AllVideos'>

const AllVideos = () => {
  const route = useRoute<AllVideosRouteProp>()
  const { item } = route.params

  return (
    <View>
      <AppBarHeader title="Videos" />

      {/* <Text>{JSON.stringify(item, null, 2)}</Text> */}

      <CustomVerticalFlatlist
        data={item}
        onItemPress={() => { }}
        imageUrl={(item) => item.thumbnailUrl}
      />

    </View>
  )
}

export default AllVideos

const styles = StyleSheet.create({})