import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Categories from '../../screens/categories/Categories';
import { CategoriesStackParamList } from '../types';
import CategorieDataList from '../../screens/categories/CategorieDataList';
import BlogPage from '../../screens/categories/BlogPage';
import SubCategorie from '../../screens/categories/SubCategorie';
import ContentListView from '../../screens/categories/ContentListView';
import AttractiveButtonsScreen from '../../screens/categories/AttractiveButtonsScreen';
import EnhancedAudioPlayer from '../../components/EnhancedAudioPlayer';
import EnhancedVideoPlayer from '../../components/EnhancedVideoPlayer';
import PdfViewer from '../../components/PdfViewer';
import SimplePdfViewer from '../../components/SimplePdfViewer';
import ImageGalleryViewer from '../../components/ImageGalleryViewer';
import GalleryListScreen from '../../screens/GalleryListScreen';
import AudioCategoryScreen from '../../screens/home/AudioCategoryScreen';
import EnhancedAllVideos from '../../screens/home/EnhancedAllVideos';
import EnhancedAllAudios from '../../screens/home/EnhancedAllAudios';

const Stack = createNativeStackNavigator<CategoriesStackParamList>();

const CategoriesStack = () => (
  <Stack.Navigator 
    screenOptions={{ headerShown: false }}
    initialRouteName="CategoriesMain"
  >
    <Stack.Screen name="CategoriesMain" component={Categories} />
    <Stack.Screen name="CategorieDataList" component={CategorieDataList} />
    <Stack.Screen name="BlogPage" component={BlogPage} />
    <Stack.Screen name="SubCategorie" component={SubCategorie} />
    <Stack.Screen name="ContentListView" component={ContentListView} />
    <Stack.Screen name="AttractiveButtonsScreen" component={AttractiveButtonsScreen} />
    <Stack.Screen name="EnhancedAllVideos" component={EnhancedAllVideos} />
    <Stack.Screen name="AllAudios" component={EnhancedAllAudios} />
    <Stack.Screen name="EnhancedAudioPlayer" component={EnhancedAudioPlayer} />
    <Stack.Screen name="EnhancedVideoPlayer" component={EnhancedVideoPlayer} />
    <Stack.Screen name="PdfViewer" component={PdfViewer} />
    <Stack.Screen name="SimplePdfViewer" component={SimplePdfViewer} />
    <Stack.Screen name="ImageViewer" component={require('../../screens/modals/ImageViewer').default} />
    <Stack.Screen name="GalleryList" component={GalleryListScreen} />
    <Stack.Screen name="AudioCategoryScreen" component={AudioCategoryScreen} />
  </Stack.Navigator>
);

export default CategoriesStack;
