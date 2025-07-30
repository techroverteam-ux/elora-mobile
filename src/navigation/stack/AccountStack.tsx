import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Account from '../../screens/account/Account';
import SelectLanguage from '../../screens/account/SelectLanguage';
import { AccountStackParamList } from '../types';

const Stack = createNativeStackNavigator<AccountStackParamList>();

const AccountStack = () => (
  <Stack.Navigator>
    <Stack.Screen name="AccountMain" component={Account} options={{ headerShown: false }} />
    <Stack.Screen name="SelectLanguage" component={SelectLanguage} options={{ headerShown: false }} />
  </Stack.Navigator>
);

export default AccountStack;
