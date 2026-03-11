import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
  RefreshControl,
  Modal,
  AccessibilityInfo,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { storeService } from '../../services/storeService';
import { imageService } from '../../services/imageService';
import ImageGallery from '../../components/ImageGallery';
import PhotoApproval from '../../components/PhotoApproval';
import styles from './StoreDetailScreen.styles';

interface Store {
  id: string;
  name: string;
  address: string;
  status: string;
  assignedUser?: {
    id: string;
    name: string;
  };
  photos?: Array<{
    id: string;
    url: string;
    type: string;
    status: string;
  }>;
  installationPhotos?: Array<{
    id: string;
    url: string;
    status: string;
  }>;
}

const StoreDetailScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { storeId } = route.params as { storeId: string };

  // State management
  const [store, setStore] = useState<Store | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [assignModalVisible, setAssignModalVisible] = useState(false);
  const [galleryVisible, setGalleryVisible] = useState(false);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);

  // Memoized computed values
  const approvedPhotos = useMemo(() => {
    return store?.photos?.filter(photo => photo.status === 'APPROVED') || [];
  }, [store?.photos]);

  const approvedInstallationPhotos = useMemo(() => {
    return store?.installationPhotos?.filter(photo => photo.status === 'APPROVED') || [];
  }, [store?.installationPhotos]);

  const allPhotos = useMemo(() => {
    return [...approvedPhotos, ...approvedInstallationPhotos];
  }, [approvedPhotos, approvedInstallationPhotos]);

  const canAssignInstallation = useMemo(() => {
    return store?.status === 'RECCE_APPROVED';
  }, [store?.status]);

  // Load store data
  const loadStoreData = useCallback(async () => {
    try {
      const storeData = await storeService.getStoreById(storeId);
      setStore(storeData);
    } catch (error) {
      Alert.alert('Error', 'Failed to load store details');
    } finally {
      setLoading(false);
    }
  }, [storeId]);

  // Refresh handler
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadStoreData();
    setRefreshing(false);
  }, [loadStoreData]);

  // Photo gallery handlers
  const openGallery = useCallback((index: number) => {
    setSelectedPhotoIndex(index);
    setGalleryVisible(true);
  }, []);

  const closeGallery = useCallback(() => {
    setGalleryVisible(false);
  }, []);

  // Assignment modal handlers
  const openAssignModal = useCallback(() => {
    if (!canAssignInstallation) {
      Alert.alert('Info', 'Installation can only be assigned to approved recce stores');
      return;
    }
    setAssignModalVisible(true);
  }, [canAssignInstallation]);

  const closeAssignModal = useCallback(() => {
    setAssignModalVisible(false);
  }, []);

  // Handle assignment
  const handleAssignment = useCallback(async (userId: string) => {
    try {
      await storeService.assignStore(storeId, userId, 'INSTALLATION');
      Alert.alert('Success', 'Installation assigned successfully');
      closeAssignModal();
      await loadStoreData();
    } catch (error) {
      Alert.alert('Error', 'Failed to assign installation');
    }
  }, [storeId, closeAssignModal, loadStoreData]);

  // Load data on mount
  useEffect(() => {
    loadStoreData();
  }, [loadStoreData]);

  // Render photo item
  const renderPhotoItem = useCallback(({ item, index }: { item: any; index: number }) => {
    const imageUrl = imageService.getImageUrl(item.url);
    
    return (
      <TouchableOpacity
        key={item.id}
        style={styles.photoItem}
        onPress={() => openGallery(index)}
        accessible={true}
        accessibilityLabel={`Photo ${index + 1}`}
        accessibilityRole="button"
      >
        <Image
          source={{ uri: imageUrl }}
          style={styles.photoThumbnail}
          resizeMode="cover"
        />
      </TouchableOpacity>
    );
  }, [openGallery]);

  // Render installation photos section
  const renderInstallationPhotos = useCallback(() => {
    if (approvedInstallationPhotos.length === 0) {
      return (
        <View style={styles.emptySection}>
          <Text style={styles.emptyText}>No installation photos available</Text>
        </View>
      );
    }

    return (
      <View style={styles.photosGrid}>
        {approvedInstallationPhotos.map((photo, index) => 
          renderPhotoItem({ item: photo, index: approvedPhotos.length + index })
        )}
      </View>
    );
  }, [approvedInstallationPhotos, approvedPhotos.length, renderPhotoItem]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading store details...</Text>
      </View>
    );
  }

  if (!store) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Store not found</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadStoreData}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Store Info */}
        <View style={styles.storeInfo}>
          <Text style={styles.storeName}>{store.name}</Text>
          <Text style={styles.storeAddress}>{store.address}</Text>
          <Text style={styles.storeStatus}>Status: {store.status}</Text>
          {store.assignedUser && (
            <Text style={styles.assignedUser}>
              Assigned to: {store.assignedUser.name}
            </Text>
          )}
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          {canAssignInstallation && (
            <TouchableOpacity
              style={styles.assignButton}
              onPress={openAssignModal}
              accessible={true}
              accessibilityLabel="Assign installation"
              accessibilityRole="button"
            >
              <Text style={styles.assignButtonText}>Assign Installation</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Recce Photos */}
        {approvedPhotos.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Recce Photos</Text>
            <View style={styles.photosGrid}>
              {approvedPhotos.map((photo, index) => 
                renderPhotoItem({ item: photo, index })
              )}
            </View>
          </View>
        )}

        {/* Installation Photos */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Installation Photos</Text>
          {renderInstallationPhotos()}
        </View>
      </ScrollView>

      {/* Image Gallery Modal */}
      {galleryVisible && (
        <ImageGallery
          images={allPhotos}
          initialIndex={selectedPhotoIndex}
          visible={galleryVisible}
          onClose={closeGallery}
        />
      )}

      {/* Assignment Modal */}
      <Modal
        visible={assignModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={closeAssignModal}
        accessible={true}
        accessibilityViewIsModal={true}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Assign Installation</Text>
            <TouchableOpacity
              onPress={closeAssignModal}
              style={styles.closeButton}
              accessible={true}
              accessibilityLabel="Close modal"
              accessibilityRole="button"
            >
              <Text style={styles.closeButtonText}>×</Text>
            </TouchableOpacity>
          </View>
          <PhotoApproval
            storeId={storeId}
            onAssign={handleAssignment}
            onCancel={closeAssignModal}
          />
        </View>
      </Modal>
    </View>
  );
};

export default StoreDetailScreen;