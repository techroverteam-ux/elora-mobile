import { StyleSheet, Text, View, TouchableOpacity } from 'react-native'
import React from 'react'
import { useNavigation, DrawerActions } from '@react-navigation/native'
import MaterialDesignIcons from '@react-native-vector-icons/material-design-icons'

interface MainAppHeaderProps {
  username: string;
}

const MainAppHeader: React.FC<MainAppHeaderProps> = ({ username }) => {
  const navigation = useNavigation();

  const openDrawer = () => {
    navigation.dispatch(DrawerActions.openDrawer());
  };

  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        <TouchableOpacity onPress={openDrawer} style={styles.iconButton}>
          <MaterialDesignIcons name="menu" size={24} color="#fff" />
        </TouchableOpacity>
        <View style={styles.rightIcons}>
          <TouchableOpacity style={styles.iconButton}>
            <MaterialDesignIcons name="bell-outline" size={24} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.iconButton}
            onPress={() => (navigation as any).navigate('SearchScreen')}
          >
            <MaterialDesignIcons name="magnify" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>
      <Text style={styles.welcomeText}>{username ? `Welcome ${username}` : 'Welcome to Geeta Bal Sanskaar'}</Text>
    </View>
  )
}

export default MainAppHeader

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F8803B',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    marginBottom: 8,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  iconButton: {
    padding: 8,
  },
  rightIcons: {
    flexDirection: 'row',
    gap: 8,
  },
  welcomeText: {
    marginTop: 16,
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
  },
})