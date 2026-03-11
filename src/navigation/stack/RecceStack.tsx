import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { RecceStackParamList } from '../types';

// Import Recce screens
import RecceScreen from '../../screens/recce/RecceScreen';
import RecceDetailScreen from '../../screens/recce/RecceDetailScreen';
import RecceFormScreen from '../../screens/recce/RecceFormScreen';
import RecceReviewScreen from '../../screens/recce/RecceReviewScreen';

const Stack = createStackNavigator<RecceStackParamList>();

const RecceStack = () => {
  console.log('RecceStack: Initializing stack navigator');
  
  return (
    <Stack.Navigator
      initialRouteName="RecceList"
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: 'transparent' },
        cardStyleInterpolator: ({ current, layouts }) => {
          return {
            cardStyle: {
              transform: [
                {
                  translateX: current.progress.interpolate({
                    inputRange: [0, 1],
                    outputRange: [layouts.screen.width, 0],
                  }),
                },
              ],
            },
          };
        },
      }}
    >
      <Stack.Screen 
        name="RecceList" 
        component={RecceScreen}
        options={{
          title: 'Recce Inspection'
        }}
      />
      <Stack.Screen 
        name="RecceDetail" 
        component={RecceDetailScreen}
        options={{
          title: 'Store Details'
        }}
      />
      <Stack.Screen 
        name="RecceForm" 
        component={RecceFormScreen}
        options={{
          title: 'Recce Form'
        }}
      />
      <Stack.Screen 
        name="RecceReview" 
        component={RecceReviewScreen}
        options={{
          title: 'Review Recce'
        }}
      />
    </Stack.Navigator>
  );
};

export default RecceStack;