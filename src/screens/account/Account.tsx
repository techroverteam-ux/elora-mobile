import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useTheme } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AccountStackParamList } from '../../navigation/types';
import { useAuth } from '../../context/AuthContext';
import MaterialDesignIcons from '@react-native-vector-icons/material-design-icons';

const Account = () => {
  type AccountNavigationProp = NativeStackNavigationProp<AccountStackParamList, 'AccountMain'>;
  const { navigate } = useNavigation<AccountNavigationProp>();
  const { colors } = useTheme();
  const { logout } = useAuth();

  return (
    <View style={{ flex: 1 }}>

      <View style={[styles.headerContainer, { backgroundColor: colors.background }]}>
        <Text style={[styles.headerText, { color: colors.onSurface }]}>Account Settings</Text>
      </View>

      <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
        <AccountOption
          label="Select Language"
          icon="translate"
          onPress={() => navigate('SelectLanguage')}
        />

        <AccountOption
          label="PDF Viewer"
          icon="file-document-outline"
          onPress={() => navigate('PdfViewer')}
        />

        <AccountOption
          label="Audio Player"
          icon="home-sound-in-outline"
          onPress={() => navigate('AudioPlayer', { item: {} })}
        />

        <AccountOption
          label="Video Player"
          icon="video-outline"
          onPress={() => navigate('VideoPlayer', {
            item: {
              videoUri: 'https://www.w3schools.com/html/mov_bbb.mp4',
              title: 'Big Buck Bunny',
              // showDebugInfo: true,
              // params: { item: {} },
              showHeaderFromRoutes: ['AccountMain'],
            }
          })}
        />

        <AccountOption
          label="Logout"
          icon="logout"
          onPress={logout}
        />
      </ScrollView>
    </View>
  );
};

export default Account;

const AccountOption = ({
  label,
  icon,
  onPress,
}: {
  label: string;
  icon: any;
  onPress: () => void;
}) => {
  const { colors } = useTheme();

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={({ pressed }) => [
        styles.menuItem,
        { backgroundColor: pressed ? colors.surfaceVariant || '#f0f0f0' : 'transparent' },
      ]}
    >
      <MaterialDesignIcons name={icon} size={24} color={colors.primary} style={styles.icon} />
      <Text style={[styles.menuText, { color: colors.onBackground }]}>{label}</Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  headerContainer: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    // alignItems: 'center',
    // justifyContent: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5', // You can use colors.outlineVariant if using Paper v5+
  },

  headerText: {
    fontSize: 22,
    fontWeight: '700',
    // textAlign: 'center',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  menuText: {
    fontSize: 16,
    fontWeight: '500',
  },
  icon: {
    marginRight: 12,
  },
});
