import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { MoreVertical } from 'lucide-react-native';
import EnhancedMediaGrid from '../components/EnhancedMediaGrid';
import { AppColors, AppSpacing } from '../theme/colors';
import Toast from 'react-native-toast-message';

// Example usage of the enhanced media grid
const MediaScreenExample = () => {
  const [isMultiSelectMode, setIsMultiSelectMode] = useState(false);
  
  // Sample data
  const mediaData = [
    {
      _id: '1',
      title: 'Sample Audio Track 1',
      artist: 'Artist Name',
      imageUrl: 'https://example.com/image1.jpg',
      audioUrl: 'https://example.com/audio1.mp3',
      duration: '3:45',
    },
    {
      _id: '2',
      title: 'Sample Video Content',
      artist: 'Content Creator',
      imageUrl: 'https://example.com/image2.jpg',
      videoUrl: 'https://example.com/video1.mp4',
      duration: '5:20',
    },
    // Add more items as needed
  ];

  const handleBulkDownloadPDF = async (selectedIds: string[]) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Your actual PDF generation logic here
    console.log('Downloading PDF for items:', selectedIds);
    
    // Example: Call your service
    // const blob = await mediaService.bulkPdf(selectedIds);
    // await fileService.downloadFile(blob, `Media_Report_${selectedIds.length}_Items.pdf`);
  };

  const handleBulkDownloadPPT = async (selectedIds: string[]) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Your actual PPT generation logic here
    console.log('Downloading PPT for items:', selectedIds);
    
    // Example: Call your service
    // const blob = await mediaService.bulkPpt(selectedIds);
    // await fileService.downloadFile(blob, `Media_Report_${selectedIds.length}_Items.pptx`);
  };

  const handleDownloadPDF = async (id: string) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    console.log('Downloading PDF for item:', id);
    
    // Example: Call your service
    // const blob = await mediaService.getPdf(id);
    // await fileService.downloadFile(blob, `media_${id}.pdf`);
  };

  const handleDownloadPPT = async (id: string) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    console.log('Downloading PPT for item:', id);
    
    // Example: Call your service
    // const blob = await mediaService.getPpt(id);
    // await fileService.downloadFile(blob, `media_${id}.pptx`);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Media Library</Text>
          <Text style={styles.subtitle}>Audio & Video Content</Text>
        </View>
        <TouchableOpacity
          onPress={() => setIsMultiSelectMode(!isMultiSelectMode)}
          style={styles.menuButton}
        >
          <MoreVertical size={24} color={AppColors.textPrimary} />
        </TouchableOpacity>
      </View>

      {/* Enhanced Media Grid */}
      <EnhancedMediaGrid
        data={mediaData}
        type="audio" // or "video"
        isMultiSelectMode={isMultiSelectMode}
        onToggleMultiSelect={() => setIsMultiSelectMode(false)}
        onBulkDownloadPDF={handleBulkDownloadPDF}
        onBulkDownloadPPT={handleBulkDownloadPPT}
        onDownloadPDF={handleDownloadPDF}
        onDownloadPPT={handleDownloadPPT}
        showDownloadButtons={true}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AppColors.background,
    padding: AppSpacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: AppSpacing.lg,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: AppColors.textPrimary,
  },
  subtitle: {
    fontSize: 14,
    color: AppColors.textSecondary,
  },
  menuButton: {
    padding: AppSpacing.xs,
  },
});

export default MediaScreenExample;

/*
Usage Instructions:

1. Import the EnhancedMediaGrid component in your screen
2. Set up state for multiselect mode
3. Implement your download functions (PDF/PPT generation)
4. Pass the required props to EnhancedMediaGrid

Key Features:
- Multiselect mode with count display
- Bulk download buttons with skeleton loading
- Individual card download buttons with loading states
- Select all/deselect all functionality
- Responsive grid layout
- Toast notifications for success/error states

Customization:
- Modify colors in AppColors theme
- Adjust spacing in AppSpacing theme
- Customize button styles in the StyleSheet
- Add more download formats (Excel, etc.)
*/