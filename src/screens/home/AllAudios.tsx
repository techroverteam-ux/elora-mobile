import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React from 'react'
import AppBarHeader from '../../components/AppBarHeader'
import CustomVerticalFlatlist from '../../components/CustomVerticalFlatlist';
import { categoryListData } from '../../data/categoryData';
import { HEIGHT } from '../../utils/HelperFunctions';
import CustomHorizontalFlatlist from '../../components/CustomHorizontalFlatlist';
import CustomTodaysPick from '../../components/CustomTodaysPick';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { HomeStackParamList } from '../../navigation/types';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from 'react-native-paper';

const buttons = [
  { label: 'Bhajans', color: '#f97316' },    // Orange
  { label: 'Nitya Stuti', color: '#8b5cf6' }, // Purple
  { label: 'Satsang', color: '#ef4444' },     // Red
  { label: 'Sandhya', color: '#3b82f6' },     // Blue
];

const AllAudios = () => {
  type HomeNavigationProp = NativeStackNavigationProp<HomeStackParamList, 'HomeMain'>;
  const { navigate } = useNavigation<HomeNavigationProp>();
  const { colors } = useTheme();

  // Split buttons into rows of 2
  const rows = [];
  for (let i = 0; i < buttons.length; i += 2) {
    rows.push(buttons.slice(i, i + 2));
  }

  return (
    <View>
      <AppBarHeader title="Audios" />

      <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
        {rows.map((row, rowIndex) => (
          <View key={rowIndex} style={styles.row}>
            {row.map((btn, index) => (
              <TouchableOpacity
                key={index}
                style={[styles.button, { backgroundColor: btn.color }]}
                onPress={() => {
                  navigate("AudioCategoryScreen", { title: btn.label })
                  console.log('Pressed:', btn.label)
                }}
              >
                <Text style={styles.text}>{btn.label}</Text>
                <Text style={styles.arrow}>›</Text>
              </TouchableOpacity>
            ))}
          </View>
        ))}

        <CustomVerticalFlatlist
          title='Weekly Picks'
          scrollEnabled={false}
          data={categoryListData}
          onItemPress={(item) => console.log('Pressed:', item)}
        />

        {/* Have to modify CustomHorizontalFlatlist for further use */}
        <CustomHorizontalFlatlist />

        <CustomTodaysPick
          imageSource={require('../../assets/images/shreeKrishna.png')} // Replace with your actual image path
          title="Shree Krishna Govind"
          subtitle="Lata Mangeshkar, Ravindra Jain"
          description="A devotional song praising Lord Krishna, composed beautifully with divine vocals."
          onPress={() => {
            console.log('Play button pressed');
            // you could also navigate or trigger a modal here
          }}
        />
      </ScrollView>
    </View>
  )
}

export default AllAudios

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    marginBottom: 15,
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginHorizontal: 10,
  },
  text: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  arrow: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
})