import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Categories from '../../screens/categories/Categories';
import { CategoriesStackParamList } from '../types';
import CategorieDataList from '../../screens/categories/CategorieDataList';
import BlogPage from '../../screens/categories/BlogPage';
import SubCategorie from '../../screens/categories/SubCategorie';
import EnhancedAudioPlayer from '../../components/EnhancedAudioPlayer';
import EnhancedVideoPlayer from '../../components/EnhancedVideoPlayer';
import GalleryListScreen from '../../screens/GalleryListScreen';

const Stack = createNativeStackNavigator<CategoriesStackParamList>();

const CategoriesStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="CategoriesMain" component={Categories} />
    <Stack.Screen name="CategorieDataList" component={CategorieDataList} />
    <Stack.Screen name="BlogPage" component={BlogPage} />
    <Stack.Screen name="SubCategorie" component={SubCategorie} />
    <Stack.Screen name="EnhancedAudioPlayer" component={EnhancedAudioPlayer} />
    <Stack.Screen name="EnhancedVideoPlayer" component={EnhancedVideoPlayer} />
    <Stack.Screen name="GalleryList" component={GalleryListScreen} />
  </Stack.Navigator>
);

export default CategoriesStack;
