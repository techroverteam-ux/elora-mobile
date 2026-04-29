import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { FileText, FileSpreadsheet, CheckSquare, X } from 'lucide-react-native';
import MediaCard from './MediaCard';
import { AppColors, AppSpacing, AppBorderRadius } from '../theme/colors';
import Toast from 'react-native-toast-message';

interface MediaItem {
  _id: string;
  title: string;
  artist?: string;
  imageUrl?: string;
  audioUrl?: string;
  videoUrl?: string;
  contentType?: string;
  duration?: string;
}

interface EnhancedMediaGridProps {
  data: MediaItem[];
  type: 'audio' | 'video';
  isMultiSelectMode?: boolean;
  onToggleMultiSelect?: () => void;
  onBulkDownloadPDF?: (selectedIds: string[]) => Promise<void>;
  onBulkDownloadPPT?: (selectedIds: string[]) => Promise<void>;
  onDownloadPDF?: (id: string) => Promise<void>;
  onDownloadPPT?: (id: string) => Promise<void>;
  showDownloadButtons?: boolean;
}

const EnhancedMediaGrid: React.FC<EnhancedMediaGridProps> = ({
  data,
  type,
  isMultiSelectMode = false,
  onToggleMultiSelect,
  onBulkDownloadPDF,
  onBulkDownloadPPT,
  onDownloadPDF,
  onDownloadPPT,
  showDownloadButtons = false,
}) => {
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [bulkDownloadStates, setBulkDownloadStates] = useState({
    pdf: false,
    ppt: false,
  });

  const handleItemSelect = (id: string) => {
    const newSet = new Set(selectedItems);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedItems(newSet);
  };

  const handleSelectAll = () => {
    if (selectedItems.size === data.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(data.map(item => item._id)));
    }
  };

  const handleBulkPDFDownload = async () => {
    if (selectedItems.size === 0 || !onBulkDownloadPDF) return;
    
    setBulkDownloadStates(prev => ({ ...prev, pdf: true }));
    try {
      await onBulkDownloadPDF(Array.from(selectedItems));
      setSelectedItems(new Set());
      Toast.show({
        type: 'success',
        text1: 'PDF Download Complete',
        text2: `${selectedItems.size} files downloaded`,
      });
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'PDF Download Failed',
      });
    } finally {
      setBulkDownloadStates(prev => ({ ...prev, pdf: false }));
    }
  };

  const handleBulkPPTDownload = async () => {
    if (selectedItems.size === 0 || !onBulkDownloadPPT) return;
    
    setBulkDownloadStates(prev => ({ ...prev, ppt: true }));
    try {
      await onBulkDownloadPPT(Array.from(selectedItems));
      setSelectedItems(new Set());
      Toast.show({
        type: 'success',
        text1: 'PPT Download Complete',
        text2: `${selectedItems.size} files downloaded`,
      });
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'PPT Download Failed',
      });
    } finally {
      setBulkDownloadStates(prev => ({ ...prev, ppt: false }));
    }
  };

  const renderItem = ({ item }: { item: MediaItem }) => (
    <MediaCard
      item={item}
      type={type}
      isSelectable={isMultiSelectMode}
      isSelected={selectedItems.has(item._id)}
      onSelect={handleItemSelect}
      showDownloadButtons={showDownloadButtons && !isMultiSelectMode}
      onDownloadPDF={onDownloadPDF}
      onDownloadPPT={onDownloadPPT}
    />
  );

  return (
    <View style={styles.container}>
      {/* Multi-select Header */}
      {isMultiSelectMode && (
        <View style={styles.multiSelectHeader}>
          <View style={styles.selectionInfo}>
            <CheckSquare size={16} color={AppColors.primary} />
            <Text style={styles.selectionText}>
              {selectedItems.size} of {data.length} selected
            </Text>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity onPress={handleSelectAll} style={styles.selectAllButton}>
              <Text style={styles.selectAllText}>
                {selectedItems.size === data.length ? 'Deselect All' : 'Select All'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={onToggleMultiSelect} style={styles.closeButton}>
              <X size={16} color={AppColors.textSecondary} />
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Bulk Download Buttons */}
      {isMultiSelectMode && selectedItems.size > 0 && (
        <View style={styles.bulkActionsContainer}>
          <TouchableOpacity
            onPress={handleBulkPDFDownload}
            disabled={bulkDownloadStates.pdf}
            style={[
              styles.bulkButton,
              styles.pdfBulkButton,
              bulkDownloadStates.pdf && styles.downloadingBulkButton,
            ]}
          >
            {bulkDownloadStates.pdf ? (
              <View style={styles.downloadingContent}>
                <ActivityIndicator size="small" color="#FFF" />
                <Text style={styles.downloadingText}>Generating PDF...</Text>
              </View>
            ) : (
              <View style={styles.bulkButtonContent}>
                <FileText size={18} color="#FFF" />
                <Text style={styles.bulkButtonText}>Download PDF</Text>
                <View style={styles.countBadge}>
                  <Text style={styles.countText}>{selectedItems.size}</Text>
                </View>
              </View>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleBulkPPTDownload}
            disabled={bulkDownloadStates.ppt}
            style={[
              styles.bulkButton,
              styles.pptBulkButton,
              bulkDownloadStates.ppt && styles.downloadingBulkButton,
            ]}
          >
            {bulkDownloadStates.ppt ? (
              <View style={styles.downloadingContent}>
                <ActivityIndicator size="small" color="#FFF" />
                <Text style={styles.downloadingText}>Generating PPT...</Text>
              </View>
            ) : (
              <View style={styles.bulkButtonContent}>
                <FileSpreadsheet size={18} color="#FFF" />
                <Text style={styles.bulkButtonText}>Download PPT</Text>
                <View style={styles.countBadge}>
                  <Text style={styles.countText}>{selectedItems.size}</Text>
                </View>
              </View>
            )}
          </TouchableOpacity>
        </View>
      )}

      {/* Media Grid */}
      <FlatList
        data={data}
        renderItem={renderItem}
        keyExtractor={(item) => item._id}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.gridContainer}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  multiSelectHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: AppColors.primary + '10',
    paddingHorizontal: AppSpacing.md,
    paddingVertical: AppSpacing.sm,
    borderRadius: AppBorderRadius.md,
    marginBottom: AppSpacing.sm,
    borderWidth: 1,
    borderColor: AppColors.primary + '20',
  },
  selectionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  selectionText: {
    color: AppColors.primary,
    fontSize: 14,
    fontWeight: '600',
    marginLeft: AppSpacing.xs,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: AppSpacing.sm,
  },
  selectAllButton: {
    paddingHorizontal: AppSpacing.sm,
    paddingVertical: AppSpacing.xs,
  },
  selectAllText: {
    color: AppColors.primary,
    fontSize: 12,
    fontWeight: '600',
  },
  closeButton: {
    padding: AppSpacing.xs,
  },
  bulkActionsContainer: {
    flexDirection: 'row',
    gap: AppSpacing.sm,
    marginBottom: AppSpacing.md,
  },
  bulkButton: {
    flex: 1,
    paddingVertical: AppSpacing.md,
    paddingHorizontal: AppSpacing.sm,
    borderRadius: AppBorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  pdfBulkButton: {
    backgroundColor: '#EF4444',
    shadowColor: '#EF4444',
  },
  pptBulkButton: {
    backgroundColor: '#F59E0B',
    shadowColor: '#F59E0B',
  },
  downloadingBulkButton: {
    opacity: 0.7,
  },
  bulkButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bulkButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: AppSpacing.xs,
  },
  countBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: AppSpacing.xs,
    paddingVertical: 2,
    borderRadius: 10,
    marginLeft: AppSpacing.xs,
  },
  countText: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: '600',
  },
  downloadingContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  downloadingText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: AppSpacing.xs,
  },
  gridContainer: {
    paddingHorizontal: AppSpacing.sm,
  },
  row: {
    justifyContent: 'space-between',
  },
});

export default EnhancedMediaGrid;