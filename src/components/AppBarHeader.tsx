import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import MaterialDesignIcons from '@react-native-vector-icons/material-design-icons';

// Props interface
interface AppBarHeaderProps {
  title: string;
}

// Use correct type if you have a typed stack param list
type RootStackParamList = any; // Replace 'any' with your actual param list if using TypeScript navigation

const AppBarHeader: React.FC<AppBarHeaderProps> = ({ title }) => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconButton}>
        <MaterialDesignIcons name="arrow-left" size={24} color="#000" />
      </TouchableOpacity>

      <Text style={styles.title} numberOfLines={1}>
        {title}
      </Text>

      <View style={styles.actions}>
        <TouchableOpacity onPress={() => { }} style={styles.iconButton}>
          <MaterialDesignIcons name="tray-arrow-down" size={24} color="#000" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => { }} style={styles.iconButton}>
          <MaterialDesignIcons name="share-variant-outline" size={24} color="#000" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default AppBarHeader;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
    height: 60,
    width: '100%',
  },
  iconButton: {
    marginHorizontal: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
  },
  actions: {
    flexDirection: 'row',
  },
});
