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

const Account = () => {
  type AccountNavigationProp = NativeStackNavigationProp<AccountStackParamList, 'AccountMain'>;
  const sheetRef = useRef<BottomSheetMethods | null>(null);
  const { navigate } = useNavigation<AccountNavigationProp>();
  const { colors } = useTheme();
  const { t } = useTranslation();
  const { logout } = useAuth();

  const openAudioPlayer = () => {
    console.log('Opening sheet');
    sheetRef.current?.expand();
  };

  return (
    <View style={{ flex: 1 }}>

      <View style={[styles.headerContainer, { backgroundColor: colors.background }]}>
        <Text style={[styles.headerText, { color: colors.onSurface }]}>{t('account.title')}</Text>
      </View>

      <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
        <AccountOption
          label={t('account.settings')}
          icon="cog-outline"
          onPress={() => navigate('Settings')}
        />

        <AccountOption
          label={t('account.appearance')}
          icon="theme-light-dark"
          onPress={() => navigate('Appearence')}
        />

        <AccountOption
          label={t('account.selectLanguage')}
          icon="translate"
          onPress={() => navigate('SelectLanguage')}
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
          onPress={() => navigate('PdfViewer')}
        />

        <AccountOption
          label={t('account.audioPlayer')}
          icon="home-sound-in-outline"
          onPress={() => {
            // openAudioPlayer()

            navigate('AudioPlayer', {
              item: {
                title: 'Shree Krishna Govind',
                artist: 'Singer, Composer Names',
                imageUrl: require('../../assets/images/shreeKrishna.png'),
                // audioUrl: 'https://software-mansion.github.io/react-native-audio-api/audio/music/example-music-01.mp3'
                audioUrl: 'https://gbs-api.thankfulflower-dcee2acb.centralindia.azurecontainerapps.io/api/azure-blob/file?blobUrl=https%3A%2F%2Fgbsprod.blob.core.windows.net%https://gbs-api.thankfulflower-dcee2acb.centralindia.azurecontainerapps.io/api/azure-blob/file?blobUrl=https%3A%2F%2Fgbsprod.blob.core.windows.net%2Fgbsdata%2Fmedia%2FEducational%2Ffile_01.-Preface_1761104410521_p2ikti.mp3'
              }
            })
          }}
        />

        <AccountOption
          label={t('account.videoPlayer')}
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

        {/* Bottom Action Buttons */}
        <View style={styles.bottomActions}>
          <View style={styles.actionRow}>

            <AccountActionButton
              label={t('account.favorites')}
              icon="heart"
              onPress={() => Alert.alert(t('account.favorites'), 'View your favorite content')}
            />
          </View>
          
          <View style={styles.actionRow}>
            <AccountActionButton
              label={t('account.history')}
              icon="history"
              onPress={() => Alert.alert(t('account.history'), 'View your listening/viewing history')}
            />
            <AccountActionButton
              label={t('account.playlists')}
              icon="playlist-music"
              onPress={() => Alert.alert(t('account.playlists'), 'Manage your playlists')}
            />
          </View>
          
          <View style={styles.actionRow}>
            <AccountActionButton
              label={t('account.notifications')}
              icon="bell"
              onPress={() => Alert.alert(t('account.notifications'), 'Manage notification settings')}
            />
            <AccountActionButton
              label={t('account.privacy')}
              icon="shield-account"
              onPress={() => Alert.alert(t('account.privacy'), 'Privacy and security settings')}
            />
          </View>
          
          <View style={styles.actionRow}>
            <AccountActionButton
              label={t('account.feedback')}
              icon="message-text"
              onPress={() => navigate('ReportIssue')}
            />
            <AccountActionButton
              label={t('account.shareApp')}
              icon="share-variant"
              onPress={() => Alert.alert('Share', 'Share Geeta Bal Sanskar app with friends')}
            />
          </View>
        </View>

        <AccountOption
          label={t('account.logout')}
          icon="logout"
          onPress={() => {
            Alert.alert(
              t('account.logout'),
              t('account.logoutConfirm'),
              [
                { text: t('account.cancel'), style: 'cancel' },
                {
                  text: t('account.logout'),
                  style: 'destructive',
                  onPress: logout,
                },
              ],
              { cancelable: true }
            );
          }}
        />
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
