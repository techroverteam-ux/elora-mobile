import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface BookmarkContextType {
  bookmarks: any[];
  addBookmark: (item: any) => void;
  removeBookmark: (itemId: string) => void;
  isBookmarked: (itemId: string) => boolean;
}

const BookmarkContext = createContext<BookmarkContextType | undefined>(undefined);

export const BookmarkProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [bookmarks, setBookmarks] = useState<any[]>([]);

  useEffect(() => {
    loadBookmarks();
  }, []);

  const loadBookmarks = async () => {
    try {
      const stored = await AsyncStorage.getItem('bookmarks');
      if (stored) {
        setBookmarks(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Error loading bookmarks:', error);
    }
  };

  const saveBookmarks = async (newBookmarks: any[]) => {
    try {
      await AsyncStorage.setItem('bookmarks', JSON.stringify(newBookmarks));
      setBookmarks(newBookmarks);
    } catch (error) {
      console.error('Error saving bookmarks:', error);
    }
  };

  const addBookmark = (item: any) => {
    if (isBookmarked(item._id)) {
      console.log('Item already bookmarked:', item._id);
      return;
    }
    
    const bookmarkItem = {
      ...item,
      bookmarkedAt: Date.now(),
      imageUrl: item.imageUrl,
      thumbnailUrl: item.thumbnailUrl,
      mainImage: item.mainImage,
      headerImage: item.headerImage,
      coverImage: item.coverImage,
      streamingUrl: item.streamingUrl,
      downloadUrl: item.downloadUrl,
      audioUrl: item.audioUrl,
      videoUrl: item.videoUrl,
      videoUri: item.videoUri,
      pdfUrl: item.pdfUrl,
      type: item.type,
      contentType: item.contentType,
      artist: item.artist,
      author: item.author,
      description: item.description,
      subtitle: item.subtitle,
      duration: item.duration
    };
    
    console.log('Adding bookmark with image URLs:', {
      streamingUrl: bookmarkItem.streamingUrl,
      imageUrl: bookmarkItem.imageUrl,
      thumbnailUrl: bookmarkItem.thumbnailUrl,
      mainImage: bookmarkItem.mainImage
    });
    
    const newBookmarks = [...bookmarks, bookmarkItem];
    saveBookmarks(newBookmarks);
  };

  const removeBookmark = (itemId: string) => {
    const newBookmarks = bookmarks.filter(item => item._id !== itemId);
    saveBookmarks(newBookmarks);
  };

  const isBookmarked = (itemId: string) => {
    return bookmarks.some(item => item._id === itemId);
  };

  return (
    <BookmarkContext.Provider value={{ bookmarks, addBookmark, removeBookmark, isBookmarked }}>
      {children}
    </BookmarkContext.Provider>
  );
};

export const useBookmarks = () => {
  const context = useContext(BookmarkContext);
  if (!context) {
    throw new Error('useBookmarks must be used within BookmarkProvider');
  }
  return context;
};