import { StyleSheet, Text, View, TouchableOpacity, Image } from 'react-native'
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
      <View style={styles.welcomeSection}>
        <View style={styles.logoContainer}>
          <Image
            source={require('../assets/images/logo1234.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>
        <View style={styles.welcomeTextContainer}>
          <Text style={styles.greetingText}>
            {username ? `Namaste, ${username}!` : 'Namaste!'}
          </Text>
          <Text style={styles.taglineText}>Welcome to Spiritual Wisdom</Text>
          <View style={styles.decorativeLine} />
        </View>
      </View>
    </View>
  )
}

export default MainAppHeader

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F8803B',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 24,
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
  welcomeSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
  },
  logoContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  logo: {
    width: 40,
    height: 40,
  },
  welcomeTextContainer: {
    flex: 1,
  },
  greetingText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: 0.5,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  taglineText: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 14,
    fontWeight: '500',
    marginTop: 4,
    fontStyle: 'italic',
  },
  decorativeLine: {
    width: 60,
    height: 3,
    backgroundColor: 'rgba(255,255,255,0.6)',
    borderRadius: 2,
    marginTop: 8,
  },
})