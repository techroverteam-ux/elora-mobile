import React, { useRef } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useTheme } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { AccountStackParamList } from '../../navigation/types';
import { useAuth } from '../../context/AuthContext';
import MaterialDesignIcons from '@react-native-vector-icons/material-design-icons';
import BottomSheet from '@gorhom/bottom-sheet';
import AudioBottomSheet from '../../components/AudioBottomSheet';
import { BottomSheetMethods } from '@gorhom/bottom-sheet/lib/typescript/types';
import { useThemeContext } from '../../context/ThemeContext';
import { translateContent } from '../../utils/contentTranslator';

const Account = () => {
  type AccountNavigationProp = NativeStackNavigationProp<AccountStackParamList, 'AccountMain'>;
  const sheetRef = useRef<BottomSheetMethods | null>(null);
  const navigation = useNavigation<AccountNavigationProp>();
  const { navigate } = navigation;
  const { colors } = useTheme();
  const { t } = useTranslation();
  const { user, logout } = useAuth();

  const openAudioPlayer = () => {
    console.log('Opening sheet');
    sheetRef.current?.expand();
  };

  return (
    <View style={{ flex: 1 }}>

      <View style={[styles.headerContainer, { backgroundColor: colors.background }]}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
          <MaterialDesignIcons name="arrow-left" size={24} color={colors.primary} />
        </Pressable>
        <Text style={[styles.headerText, { color: colors.onSurface }]}>{t('account.title')}</Text>
      </View>

      <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
        <AccountOption
          label={t('account.settings')}
          icon="cog-outline"
          onPress={() => navigate('Settings')}
        />



        <AccountOption
          label={t('account.about')}
          icon="information-outline"
          onPress={() => navigate('About')}
        />

        <AccountOption
          label={t('account.helpSupport')}
          icon="help-circle-outline"
          onPress={() => navigate('HelpSupport')}
        />

        <AccountOption
          label={t('account.pdfViewer')}
          icon="file-document-outline"
          onPress={() => {
            try {
              const rootNav = navigation.getParent()?.getParent();
              rootNav?.navigate('MainTabs' as never, { screen: 'Home', params: { screen: 'AllPDFs' } } as never);
            } catch (error) {
              console.log('PDF navigation error:', error);
            }
          }}
        />

        <AccountOption
          label={t('account.audioPlayer')}
          icon="home-sound-in-outline"
          onPress={() => {
            try {
              const rootNav = navigation.getParent()?.getParent();
              rootNav?.navigate('MainTabs' as never, { screen: 'Home', params: { screen: 'AllAudios' } } as never);
            } catch (error) {
              console.log('Audio navigation error:', error);
            }
          }}
        />

        <AccountOption
          label={t('account.videoPlayer')}
          icon="video-outline"
          onPress={() => {
            try {
              const rootNav = navigation.getParent()?.getParent();
              rootNav?.navigate('MainTabs' as never, { screen: 'Home', params: { screen: 'AllVideos' } } as never);
            } catch (error) {
              console.log('Video navigation error:', error);
            }
          }}
        />



        {user ? (
          <AccountOption
            label={translateContent('Logout')}
            icon="logout"
            onPress={() => {
              Alert.alert(
                translateContent('Logout'),
                translateContent('Are you sure you want to logout?'),
                [
                  { text: translateContent('Cancel'), style: 'cancel' },
                  {
                    text: translateContent('Logout'),
                    style: 'destructive',
                    onPress: () => {
                      logout();
                    },
                  },
                ],
                { cancelable: true }
              );
            }}
          />
        ) : (
          <AccountOption
            label={translateContent('Login')}
            icon="login"
            onPress={() => {
              try {
                const rootNav = navigation.getParent()?.getParent();
                rootNav?.navigate('AuthModal' as never);
              } catch (error) {
                console.log('Login navigation error:', error);
              }
            }}
          />
        )}
      </ScrollView>

      {/* 👇 Bottom sheet always mounted, just hidden initially */}
      <AudioBottomSheet sheetRef={sheetRef} />
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

const AccountActionButton = ({
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
      style={({ pressed }) => [
        styles.actionButton,
        { 
          backgroundColor: pressed ? colors.primaryContainer : colors.surface,
          borderColor: colors.outline 
        },
      ]}
    >
      <MaterialDesignIcons name={icon} size={20} color={colors.primary} />
      <Text style={[styles.actionText, { color: colors.onSurface }]}>{label}</Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  backButton: {
    marginRight: 12,
    padding: 4,
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
  bottomActions: {
    marginTop: 24,
    marginBottom: 16,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
    borderWidth: 1,
    marginHorizontal: 4,
  },
  actionText: {
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 6,
  },
});
