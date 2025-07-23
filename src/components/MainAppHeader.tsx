import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import MaterialDesignIcons from '@react-native-vector-icons/material-design-icons'

const MainAppHeader = () => {
  return (
    <View style={{ backgroundColor: "#F8803B", width: "100%", marginBottom: 20, padding: 20, borderBottomStartRadius: 20, borderBottomEndRadius: 20 }}>
      <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
        <MaterialDesignIcons
          name={"hamburger"}
          size={24}
          color={"#fff"}
          onPress={() => { }}
        />
        <View style={{ flexDirection: "row", width: "20%", justifyContent: "space-between" }}>
          <MaterialDesignIcons
            name={"bell-outline"}
            size={24}
            color={"#fff"}
            onPress={() => { }}
          />
          <MaterialDesignIcons
            name={"magnify"}
            size={24}
            color={"#fff"}
            onPress={() => { }}
          />
        </View>
      </View>
      <Text style={{ marginTop: 15, color: "#fff", fontSize: 22, fontWeight: "bold", }}>Welcome Neel</Text>
    </View>
  )
}

export default MainAppHeader

const styles = StyleSheet.create({})