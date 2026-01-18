import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Alert,
  BackHandler,
  StatusBar,
} from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import EnhancedBlogRenderer from '../components/EnhancedBlogRenderer';
import EnhancedBlogSkeleton from '../components/EnhancedBlogSkeleton';
import { useTheme } from 'react-native-paper';

// Mock API service - replace with your actual API
const mockApiService = {
  getCategoryById: async (id: string) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Return mock data based on your provided structure
    return {
      success: true,
      data: {
        _id: id,
        title: "Lord Parshuram: The Warrior Sage of Sanatan Dharma",
        subtitle: "Understanding the Sixth Avatar of Lord Vishnu",
        description1: "Lord Parshuram is one of the most powerful and unique incarnations of Lord Vishnu in Sanatan Dharma. He is known as the sixth avatar of Vishnu and is worshipped as the symbol of justice, discipline, courage, and divine anger against injustice.",
        description2: "Lord Parshuram stands as the eternal protector of Sanatan Dharma, proving that when injustice crosses its limits, divine power rises to restore balance. He is not only a warrior with an axe, but also a saint with deep wisdom and self-control.",
        layoutType: "enhanced-blog",
        contentFields: [
          {
            "id": "header-1",
            "type": "header",
            "content": "Introduction",
            "order": 0,
            "azureFiles": [],
            "_id": "693703a7930ad6c8274f90d5"
          },
          {
            "id": "desc-1",
            "type": "description",
            "content": "Lord Parshuram is one of the most powerful and unique incarnations of Lord Vishnu in Sanatan Dharma. He is known as the sixth avatar of Vishnu and is worshipped as the symbol of justice, discipline, courage, and divine anger against injustice. Unlike other avatars, Parshuram is considered Chiranjivi (immortal) and is believed to still be present on Earth in a subtle form.",
            "order": 1,
            "azureFiles": [],
            "_id": "693703a7930ad6c8274f90d6"
          },
          {
            "id": "image-1765122946829",
            "type": "image",
            "content": "Lord Parshuram - The Divine Warrior",
            "order": 2,
            "azureFiles": [
              "https://gbsprod.blob.core.windows.net/gbsdata/sections/mahapurusho-ka-parichay/categories/lord-parshuram/image_image-1765122946829_1765213080161_GIEO_GIta_1765213080161_hv2aa2.jpg"
            ],
            "_id": "693703a7930ad6c8274f90d7"
          },
          {
            "id": "header-1765122965882",
            "type": "header",
            "content": "Birth and Divine Origin",
            "order": 3,
            "azureFiles": [],
            "_id": "693703a7930ad6c8274f90d8"
          },
          {
            "id": "description-1765122973463",
            "type": "description",
            "content": "Lord Parshuram was born to Sage Jamadagni and Mata Renuka. From birth itself, he showed signs of divine power and discipline. He received his sacred axe (Parshu) from Lord Shiva after intense penance. From that moment onward, he became known as Parshuram — the warrior sage who protects dharma through strength and righteousness.",
            "order": 4,
            "azureFiles": [],
            "_id": "693703a7930ad6c8274f90d9"
          },
          {
            "id": "image-1765122984763",
            "type": "image",
            "content": "Sacred Images of Lord Parshuram",
            "order": 5,
            "azureFiles": [
              "https://gbsprod.blob.core.windows.net/gbsdata/sections/mahapurusho-ka-parichay/categories/lord-parshuram/image_image-1765122984763_1765212832828_parshuram1_1765212832828_bg4isf.jpeg",
              "https://gbsprod.blob.core.windows.net/gbsdata/sections/mahapurusho-ka-parichay/categories/lord-parshuram/image_image-1765122984763_1765212832847_parshuram2_1765212832847_mn75ow.jpg"
            ],
            "_id": "693703a7930ad6c8274f90da"
          },
          {
            "id": "header-1765122991814",
            "type": "header",
            "content": "Parshuram and His Mission",
            "order": 6,
            "azureFiles": [],
            "_id": "693703a7930ad6c8274f90db"
          },
          {
            "id": "description-1765122999997",
            "type": "description",
            "content": "During Parshuram's time, many kings had become arrogant, cruel, and unjust. They misused their power and oppressed innocent people, sages, and society. Lord Parshuram took an oath to eliminate corruption, cruelty, and oppression from the Earth. His mission was not destruction, but the restoration of dharma.",
            "order": 7,
            "azureFiles": [],
            "_id": "693703a7930ad6c8274f90dc"
          },
          {
            "id": "image-1765123007331",
            "type": "image",
            "content": "Parshuram's Divine Forms and Manifestations",
            "order": 8,
            "azureFiles": [
              "https://gbsprod.blob.core.windows.net/gbsdata/sections/mahapurusho-ka-parichay/categories/lord-parshuram/image_image-1765123007331_1765212832864_parshuram1_1765212832864_99c0s6.jpeg",
              "https://gbsprod.blob.core.windows.net/gbsdata/sections/mahapurusho-ka-parichay/categories/lord-parshuram/image_image-1765123007331_1765212832875_parshuram2_1765212832875_cro01x.jpg",
              "https://gbsprod.blob.core.windows.net/gbsdata/sections/mahapurusho-ka-parichay/categories/lord-parshuram/image_image-1765123007331_1765212832889_parshuram3_1765212832889_3v6guc.jpg",
              "https://gbsprod.blob.core.windows.net/gbsdata/sections/mahapurusho-ka-parichay/categories/lord-parshuram/image_image-1765123007331_1765212832906_parshuram4_1765212832906_2nstwe.avif"
            ],
            "_id": "693703a7930ad6c8274f90dd"
          },
          {
            "id": "header-1765123015580",
            "type": "header",
            "content": "Conflict with Kshatriya Kings",
            "order": 9,
            "azureFiles": [],
            "_id": "693703a7930ad6c8274f90de"
          },
          {
            "id": "description-1765123031248",
            "type": "description",
            "content": "Lord Parshuram fought against many unjust Kshatriya rulers, including the powerful king Kartavirya Arjuna. After his father Sage Jamadagni was killed by arrogant rulers, Parshuram took a vow to free the Earth from tyrant kings. According to scriptures, he traveled across the land, restoring balance and justice wherever adharma prevailed.",
            "order": 10,
            "azureFiles": [],
            "_id": "693703a7930ad6c8274f90df"
          },
          {
            "id": "header-1765123037981",
            "type": "header",
            "content": "Parshuram and Lord Ram",
            "order": 11,
            "azureFiles": [],
            "_id": "693703a7930ad6c8274f90e0"
          },
          {
            "id": "description-1765123045782",
            "type": "description",
            "content": "One of the most famous moments in the Ramayana is when Lord Parshuram meets Lord Shri Ram during Sita's swayamvar. Parshuram, filled with divine energy and pride in his powers, challenges Ram. When Lord Ram effortlessly lifts and strings Parshuram's bow, Parshuram realizes that Ram is the Supreme Vishnu Himself and bows down in respect. This moment represents the union of strength and humility.",
            "order": 12,
            "azureFiles": [],
            "_id": "693703a7930ad6c8274f90e1"
          },
          {
            "id": "header-1765123059449",
            "type": "header",
            "content": "Guru of Great Warriors",
            "order": 13,
            "azureFiles": [],
            "_id": "693703a7930ad6c8274f90e2"
          },
          {
            "id": "description-1765123066749",
            "type": "description",
            "content": "Lord Parshuram is known as the guru of some of the greatest warriors in Indian history, including:\n\nBhishma Pitamah\n\nDronacharya\n\nKarna\n\nThrough them, Parshuram's influence reached the era of the Mahabharata, proving that his teachings shaped generations of warriors.",
            "order": 14,
            "azureFiles": [],
            "_id": "693703a7930ad6c8274f90e3"
          },
          {
            "id": "header-1765123072882",
            "type": "header",
            "content": "Teachings of Lord Parshuram",
            "order": 15,
            "azureFiles": [],
            "_id": "693703a7930ad6c8274f90e4"
          },
          {
            "id": "description-1765123075717",
            "type": "description",
            "content": "From the life of Parshuram, Sanatan Dharma teaches us:\n\nInjustice must be strongly opposed\n\nPower should always serve dharma\n\nDiscipline builds true strength\n\nEgo leads to destruction\n\nKnowledge and weapons must go together with wisdom",
            "order": 16,
            "azureFiles": [],
            "_id": "693703a7930ad6c8274f90e5"
          },
          {
            "id": "header-1765123082899",
            "type": "header",
            "content": "Spiritual and Cultural Significance",
            "order": 17,
            "azureFiles": [],
            "_id": "693703a7930ad6c8274f90e6"
          },
          {
            "id": "description-1765123089033",
            "type": "description",
            "content": "Lord Parshuram is worshipped across many parts of India, especially in Kerala, Maharashtra, Karnataka, and North India. Parshuram Jayanti is celebrated to honor his birth. Temples dedicated to him symbolize the balance between spirituality and warrior duty.",
            "order": 18,
            "azureFiles": [],
            "_id": "693703a7930ad6c8274f90e7"
          },
          {
            "id": "header-1765123094667",
            "type": "header",
            "content": "Conclusion",
            "order": 19,
            "azureFiles": [],
            "_id": "693703a7930ad6c8274f90e8"
          },
          {
            "id": "description-1765123101184",
            "type": "description",
            "content": "Lord Parshuram stands as the eternal protector of Sanatan Dharma, proving that when injustice crosses its limits, divine power rises to restore balance. He is not only a warrior with an axe, but also a saint with deep wisdom and self-control. His life teaches that strength without dharma leads to destruction, and dharma without strength remains incomplete.",
            "order": 20,
            "azureFiles": [],
            "_id": "693703a7930ad6c8274f90e9"
          }
        ]
      }
    };
  }
};

type BlogPostScreenRouteProp = RouteProp<{
  BlogPost: {
    categoryId: string;
    title?: string;
  };
}, 'BlogPost'>;

interface BlogPostScreenProps {}

const BlogPostScreen: React.FC<BlogPostScreenProps> = () => {
  const route = useRoute<BlogPostScreenRouteProp>();
  const navigation = useNavigation();
  const { colors } = useTheme();
  
  const [category, setCategory] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { categoryId, title } = route.params;

  useEffect(() => {
    loadBlogPost();
  }, [categoryId]);

  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', handleBackPress);
    return () => backHandler.remove();
  }, []);

  const loadBlogPost = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await mockApiService.getCategoryById(categoryId);
      
      if (response.success) {
        setCategory(response.data);
      } else {
        setError('Failed to load blog post');
      }
    } catch (err) {
      console.error('Error loading blog post:', err);
      setError('Network error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleBackPress = (): boolean => {
    navigation.goBack();
    return true;
  };

  const handleBack = () => {
    navigation.goBack();
  };

  const handleRetry = () => {
    loadBlogPost();
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <StatusBar
          barStyle={colors.background === '#121212' ? 'light-content' : 'dark-content'}
          backgroundColor={colors.background}
        />
        <EnhancedBlogSkeleton sectionsCount={8} />
      </SafeAreaView>
    );
  }

  if (error || !category) {
    return (
      <SafeAreaView style={[styles.container, styles.errorContainer, { backgroundColor: colors.background }]}>
        <StatusBar
          barStyle={colors.background === '#121212' ? 'light-content' : 'dark-content'}
          backgroundColor={colors.background}
        />
        <View style={styles.errorContent}>
          <Text style={[styles.errorTitle, { color: colors.onBackground }]}>
            Oops! Something went wrong
          </Text>
          <Text style={[styles.errorMessage, { color: colors.onSurfaceVariant }]}>
            {error || 'Failed to load blog post'}
          </Text>
          <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <Text style={[styles.backButtonText, { color: colors.onSurfaceVariant }]}>
              Go Back
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar
        barStyle={colors.background === '#121212' ? 'light-content' : 'dark-content'}
        backgroundColor={colors.background}
      />
      <EnhancedBlogRenderer
        category={category}
        onBack={handleBack}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  errorContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorContent: {
    alignItems: 'center',
    maxWidth: 300,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  errorMessage: {
    fontSize: 16,
    marginBottom: 24,
    textAlign: 'center',
    lineHeight: 24,
  },
  retryButton: {
    backgroundColor: '#F8803B',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  backButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
});

export default BlogPostScreen;