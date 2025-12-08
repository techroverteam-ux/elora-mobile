import { useState, useEffect, useRef, useCallback } from 'react';
import { Animated, Dimensions } from 'react-native';
import { BlogCategory, BlogContentStats, TableOfContentsItem, UseBlogProgressReturn } from '../types/blog';
import BlogContentManager from '../utils/blogContentManager';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export interface UseBlogRendererReturn {
  // State
  readingProgress: number;
  currentSection: number;
  isHeaderVisible: boolean;
  contentStats: BlogContentStats | null;
  tableOfContents: TableOfContentsItem[];
  
  // Animations
  headerOpacity: Animated.Value;
  progressWidth: Animated.Value;
  
  // Handlers
  handleScroll: (event: any) => void;
  scrollToSection: (sectionId: string) => void;
  scrollToTop: () => void;
  resetProgress: () => void;
  
  // Refs
  scrollViewRef: React.RefObject<any>;
  sectionRefs: React.MutableRefObject<Record<string, any>>;
}

export const useBlogRenderer = (category: BlogCategory | null): UseBlogRendererReturn => {
  const [readingProgress, setReadingProgress] = useState(0);
  const [currentSection, setCurrentSection] = useState(0);
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);
  const [contentStats, setContentStats] = useState<BlogContentStats | null>(null);
  const [tableOfContents, setTableOfContents] = useState<TableOfContentsItem[]>([]);
  
  const scrollViewRef = useRef<any>(null);
  const sectionRefs = useRef<Record<string, any>>({});
  const headerOpacity = useRef(new Animated.Value(1)).current;
  const progressWidth = useRef(new Animated.Value(0)).current;
  
  // Calculate content stats when category changes
  useEffect(() => {
    if (category) {
      const stats = BlogContentManager.getContentStats(category);
      setContentStats(stats);
      
      const toc = BlogContentManager.generateTableOfContents(category.contentFields);
      setTableOfContents(toc);
    } else {
      setContentStats(null);
      setTableOfContents([]);
    }
  }, [category]);

  // Handle scroll events for progress tracking
  const handleScroll = useCallback((event: any) => {
    const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;
    const scrollY = contentOffset.y;
    const contentHeight = contentSize.height;
    const screenHeight = layoutMeasurement.height;
    
    // Calculate reading progress
    const maxScroll = contentHeight - screenHeight;
    const scrollPercent = maxScroll > 0 ? scrollY / maxScroll : 0;
    const clampedPercent = Math.max(0, Math.min(1, scrollPercent));
    
    setReadingProgress(clampedPercent);
    
    // Animate progress bar
    Animated.timing(progressWidth, {
      toValue: clampedPercent * SCREEN_WIDTH,
      duration: 100,
      useNativeDriver: false,
    }).start();

    // Header visibility based on scroll
    const shouldShowHeader = scrollY < 100;
    if (shouldShowHeader !== isHeaderVisible) {
      setIsHeaderVisible(shouldShowHeader);
      Animated.timing(headerOpacity, {
        toValue: shouldShowHeader ? 1 : 0.9,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }

    // Update current section based on scroll position
    updateCurrentSection(scrollY);
  }, [isHeaderVisible, headerOpacity, progressWidth]);

  // Update current section based on scroll position
  const updateCurrentSection = useCallback((scrollY: number) => {
    if (!category || !category.contentFields) return;

    const sectionPositions = Object.entries(sectionRefs.current)
      .map(([id, ref]) => {
        if (ref && ref.measureLayout) {
          return new Promise<{ id: string; y: number }>((resolve) => {
            ref.measureLayout(
              scrollViewRef.current,
              (x: number, y: number) => resolve({ id, y }),
              () => resolve({ id, y: 0 })
            );
          });
        }
        return Promise.resolve({ id, y: 0 });
      });

    Promise.all(sectionPositions).then((positions) => {
      const currentPos = positions
        .filter(pos => pos.y <= scrollY + 100)
        .sort((a, b) => b.y - a.y)[0];

      if (currentPos) {
        const sectionIndex = category.contentFields.findIndex(
          field => field.id === currentPos.id
        );
        if (sectionIndex !== -1 && sectionIndex !== currentSection) {
          setCurrentSection(sectionIndex);
        }
      }
    });
  }, [category, currentSection]);

  // Scroll to specific section
  const scrollToSection = useCallback((sectionId: string) => {
    const sectionRef = sectionRefs.current[sectionId];
    if (sectionRef && scrollViewRef.current) {
      sectionRef.measureLayout(
        scrollViewRef.current,
        (x: number, y: number) => {
          scrollViewRef.current?.scrollTo({
            y: y - 100, // Offset for header
            animated: true,
          });
        },
        () => console.warn('Failed to measure section layout')
      );
    }
  }, []);

  // Scroll to top
  const scrollToTop = useCallback(() => {
    scrollViewRef.current?.scrollTo({
      y: 0,
      animated: true,
    });
  }, []);

  // Reset progress
  const resetProgress = useCallback(() => {
    setReadingProgress(0);
    setCurrentSection(0);
    setIsHeaderVisible(true);
    
    Animated.timing(progressWidth, {
      toValue: 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
    
    Animated.timing(headerOpacity, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [headerOpacity, progressWidth]);

  return {
    // State
    readingProgress,
    currentSection,
    isHeaderVisible,
    contentStats,
    tableOfContents,
    
    // Animations
    headerOpacity,
    progressWidth,
    
    // Handlers
    handleScroll,
    scrollToSection,
    scrollToTop,
    resetProgress,
    
    // Refs
    scrollViewRef,
    sectionRefs,
  };
};

export interface UseBlogInteractionsReturn {
  isLiked: boolean;
  isBookmarked: boolean;
  likeCount: number;
  bookmarkCount: number;
  shareCount: number;
  
  handleLike: () => void;
  handleBookmark: () => void;
  handleShare: () => void;
  handleComment: () => void;
}

export const useBlogInteractions = (categoryId: string): UseBlogInteractionsReturn => {
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [bookmarkCount, setBookmarkCount] = useState(0);
  const [shareCount, setShareCount] = useState(0);

  // Load interaction state
  useEffect(() => {
    loadInteractionState();
  }, [categoryId]);

  const loadInteractionState = async () => {
    try {
      // Load from AsyncStorage or API
      // This is a placeholder - implement actual storage logic
      const liked = false; // await AsyncStorage.getItem(`liked_${categoryId}`);
      const bookmarked = false; // await AsyncStorage.getItem(`bookmarked_${categoryId}`);
      
      setIsLiked(liked);
      setIsBookmarked(bookmarked);
      
      // Load counts from API
      // const counts = await apiService.getInteractionCounts(categoryId);
      // setLikeCount(counts.likes);
      // setBookmarkCount(counts.bookmarks);
      // setShareCount(counts.shares);
    } catch (error) {
      console.error('Failed to load interaction state:', error);
    }
  };

  const handleLike = useCallback(async () => {
    try {
      const newLikedState = !isLiked;
      setIsLiked(newLikedState);
      setLikeCount(prev => newLikedState ? prev + 1 : prev - 1);
      
      // Save to storage and API
      // await AsyncStorage.setItem(`liked_${categoryId}`, newLikedState.toString());
      // await apiService.toggleLike(categoryId, newLikedState);
    } catch (error) {
      console.error('Failed to toggle like:', error);
      // Revert on error
      setIsLiked(!isLiked);
      setLikeCount(prev => isLiked ? prev + 1 : prev - 1);
    }
  }, [isLiked, categoryId]);

  const handleBookmark = useCallback(async () => {
    try {
      const newBookmarkedState = !isBookmarked;
      setIsBookmarked(newBookmarkedState);
      setBookmarkCount(prev => newBookmarkedState ? prev + 1 : prev - 1);
      
      // Save to storage and API
      // await AsyncStorage.setItem(`bookmarked_${categoryId}`, newBookmarkedState.toString());
      // await apiService.toggleBookmark(categoryId, newBookmarkedState);
    } catch (error) {
      console.error('Failed to toggle bookmark:', error);
      // Revert on error
      setIsBookmarked(!isBookmarked);
      setBookmarkCount(prev => isBookmarked ? prev + 1 : prev - 1);
    }
  }, [isBookmarked, categoryId]);

  const handleShare = useCallback(async () => {
    try {
      // Implement share functionality
      // const shareUrl = `https://yourapp.com/blog/${categoryId}`;
      // await Share.share({
      //   message: shareUrl,
      //   url: shareUrl,
      // });
      
      setShareCount(prev => prev + 1);
      
      // Track share event
      // await apiService.trackShare(categoryId);
    } catch (error) {
      console.error('Failed to share:', error);
    }
  }, [categoryId]);

  const handleComment = useCallback(() => {
    // Navigate to comments or open comment modal
    console.log('Open comments for:', categoryId);
  }, [categoryId]);

  return {
    isLiked,
    isBookmarked,
    likeCount,
    bookmarkCount,
    shareCount,
    
    handleLike,
    handleBookmark,
    handleShare,
    handleComment,
  };
};

export interface UseBlogAnalyticsReturn {
  trackView: () => void;
  trackSectionView: (sectionId: string) => void;
  trackInteraction: (type: string, data?: any) => void;
  trackReadingTime: (timeSpent: number) => void;
  trackScrollProgress: (progress: number) => void;
}

export const useBlogAnalytics = (categoryId: string): UseBlogAnalyticsReturn => {
  const startTime = useRef<number>(Date.now());
  const lastProgressUpdate = useRef<number>(0);

  useEffect(() => {
    // Track initial view
    trackView();
    
    return () => {
      // Track reading time on unmount
      const timeSpent = Date.now() - startTime.current;
      trackReadingTime(timeSpent);
    };
  }, [categoryId]);

  const trackView = useCallback(() => {
    try {
      // Track page view
      // await apiService.trackView(categoryId);
      console.log('Tracked view for:', categoryId);
    } catch (error) {
      console.error('Failed to track view:', error);
    }
  }, [categoryId]);

  const trackSectionView = useCallback((sectionId: string) => {
    try {
      // Track section view
      // await apiService.trackSectionView(categoryId, sectionId);
      console.log('Tracked section view:', sectionId);
    } catch (error) {
      console.error('Failed to track section view:', error);
    }
  }, [categoryId]);

  const trackInteraction = useCallback((type: string, data?: any) => {
    try {
      // Track interaction
      // await apiService.trackInteraction(categoryId, type, data);
      console.log('Tracked interaction:', type, data);
    } catch (error) {
      console.error('Failed to track interaction:', error);
    }
  }, [categoryId]);

  const trackReadingTime = useCallback((timeSpent: number) => {
    try {
      // Track reading time
      // await apiService.trackReadingTime(categoryId, timeSpent);
      console.log('Tracked reading time:', timeSpent);
    } catch (error) {
      console.error('Failed to track reading time:', error);
    }
  }, [categoryId]);

  const trackScrollProgress = useCallback((progress: number) => {
    // Only track significant progress changes (every 10%)
    const progressPercent = Math.floor(progress * 10) * 10;
    if (progressPercent > lastProgressUpdate.current) {
      lastProgressUpdate.current = progressPercent;
      try {
        // Track scroll progress
        // await apiService.trackScrollProgress(categoryId, progressPercent);
        console.log('Tracked scroll progress:', progressPercent);
      } catch (error) {
        console.error('Failed to track scroll progress:', error);
      }
    }
  }, [categoryId]);

  return {
    trackView,
    trackSectionView,
    trackInteraction,
    trackReadingTime,
    trackScrollProgress,
  };
};

export default {
  useBlogRenderer,
  useBlogInteractions,
  useBlogAnalytics,
};