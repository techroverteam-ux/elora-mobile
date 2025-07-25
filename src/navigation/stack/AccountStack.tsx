import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Account from '../../screens/account/Account';

const Stack = createNativeStackNavigator();

const AccountStack = () => (
  <Stack.Navigator>
    <Stack.Screen name="AccountMain" component={Account} options={{ headerShown: false }} />
  </Stack.Navigator>
);

export default AccountStack;
