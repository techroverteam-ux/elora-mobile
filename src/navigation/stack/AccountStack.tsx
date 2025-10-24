import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Account from '../../screens/account/Account';
import SelectLanguage from '../../screens/account/SelectLanguage';
import { AccountStackParamList } from '../types';
import PdfViewer from '../../components/PdfViewer';
import AudioPlayer from '../../components/AudioPlayer';
import VideoPlayer from '../../components/VideoPlayer';
import EnhancedAudioPlayer from '../../components/EnhancedAudioPlayer';
import EnhancedVideoPlayer from '../../components/EnhancedVideoPlayer';
import Appearence from '../../screens/account/Appearence';
import SettingsScreen from '../../screens/SettingsScreen';
import AboutScreen from '../../screens/AboutScreen';
import HelpSupportScreen from '../../screens/HelpSupportScreen';
import ReportIssueScreen from '../../screens/ReportIssueScreen';
import FeatureRequestScreen from '../../screens/FeatureRequestScreen';
import GalleryListScreen from '../../screens/GalleryListScreen';

const Stack = createNativeStackNavigator<AccountStackParamList>();

const AccountStack = () => (
  <Stack.Navigator>
    <Stack.Screen name="AccountMain" component={Account} options={{ headerShown: false }} />
    <Stack.Screen name="Appearence" component={Appearence} options={{ headerShown: false }} />
    <Stack.Screen name="SelectLanguage" component={SelectLanguage} options={{ headerShown: false }} />
    <Stack.Screen name="PdfViewer" component={PdfViewer} options={{ headerShown: false }} />
    <Stack.Screen name="AudioPlayer" component={AudioPlayer} options={{ headerShown: false }} />
    <Stack.Screen name="VideoPlayer" component={VideoPlayer} options={{ headerShown: false }} />
    <Stack.Screen name="EnhancedAudioPlayer" component={EnhancedAudioPlayer} options={{ headerShown: false }} />
    <Stack.Screen name="EnhancedVideoPlayer" component={EnhancedVideoPlayer} options={{ headerShown: false }} />
    <Stack.Screen name="Settings" component={SettingsScreen} options={{ headerShown: false }} />
    <Stack.Screen name="About" component={AboutScreen} options={{ headerShown: false }} />
    <Stack.Screen name="HelpSupport" component={HelpSupportScreen} options={{ headerShown: false }} />
    <Stack.Screen name="ReportIssue" component={ReportIssueScreen} options={{ headerShown: false }} />
    <Stack.Screen name="FeatureRequest" component={FeatureRequestScreen} options={{ headerShown: false }} />
    <Stack.Screen name="GalleryList" component={GalleryListScreen} options={{ headerShown: false }} />
  </Stack.Navigator>
);

export default AccountStack;
