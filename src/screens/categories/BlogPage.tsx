import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import AppBarHeader from '../../components/AppBarHeader'
import { RouteProp, useRoute } from '@react-navigation/native';

// Define type for route params
type BlogPage = {
  BlogPage: { item: any };
};

const BlogPage = () => {
  const route = useRoute<RouteProp<BlogPage, 'BlogPage'>>();
  const { item } = route.params;


  return (
    <View>
      <AppBarHeader title={item.name} />

      <View>
        <Text>{JSON.stringify(item)}</Text>
      </View>
    </View>
  )
}

export default BlogPage

const styles = StyleSheet.create({})