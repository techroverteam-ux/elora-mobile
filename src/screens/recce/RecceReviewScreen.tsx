import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, Modal, TextInput, Alert } from 'react-native';
import { CheckCircle2, XCircle, Clock, Loader2, AlertCircle, CheckSquare, X, Camera, PauseCircle } from 'lucide-react-native';
import { useTheme } from '../../context/ThemeContext';
import { storeService } from '../../services/storeService';
import Toast from 'react-native-toast-message';
import imageService from '../../services/imageService';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { RecceStackParamList } from '../../navigation/types';
import AsyncStorage from '@react-native-async-storage/async-storage';

type RecceReviewScreenNavigationProp = StackNavigationProp<RecceStackParamList, 'RecceReview'>;
type RecceReviewScreenRouteProp = RouteProp<RecceStackParamList, 'RecceReview'>;

interface RecceReviewProps {
  route: RecceReviewScreenRouteProp;
  navigation: RecceReviewScreenNavigationProp;
}

type FilterType = 'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED' | 'HOLD';

export default function RecceReviewScreen({ route, navigation }: RecceReviewProps) {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const { storeId } = route.params;
  const [store, setStore] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showHoldModal, setShowHoldModal] = useState(false);
  const [rejectPhotoIndex, setRejectPhotoIndex] = useState<number | null>(null);
  const [holdPhotoIndex, setHoldPhotoIndex] = useState<number | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [holdReason, setHoldReason] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [heldPhotos, setHeldPhotos] = useState<Record<number, string>>({});
  const [activeFilter, setActiveFilter] = useState<FilterType>('ALL');

  // Load held photos from AsyncStorage on mount
  useEffect(() => {
    if (!storeId) return;
    loadHeldPhotos();
  }, [storeId]);

  const loadHeldPhotos = async () => {
    try {
      const stored = await AsyncStorage.getItem(`held_photos_${storeId}`);
      if (stored) {
        setHeldPhotos(JSON.parse(stored));
      }
    } catch (error) {
      console.log('Error loading held photos:', error);
    }
  };

  const saveHeldPhotos = async (updated: Record<number, string>) => {
    setHeldPhotos(updated);
    try {
      await AsyncStorage.setItem(`held_photos_${storeId}`, JSON.stringify(updated));
    } catch (error) {
      console.log('Error saving held photos:', error);
    }
  };

  useEffect(() => {
    fetchStore();
  }, []);

  const fetchStore = async () => {
    try {
      setLoading(true);
      const response = await storeService.getById(storeId);
      
      if (!response || !response.store) {
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: 'Store data not found'
        });
        navigation.goBack();
        return;
      }
      
      const store = response.store;
      
      if (!store.recce || !store.recce.reccePhotos || store.recce.reccePhotos.length === 0) {
        Toast.show({
          type: 'warning',
          text1: 'No Recce Data',
          text2: 'This store has no recce photos to review'
        });
      }
      
      setStore(store);
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error.response?.data?.message || 'Failed to load store details'
      });
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const handleApprovePhoto = async (photoIndex: number) => {
    setProcessing(true);
    try {
      await storeService.updateReccePhotoStatus(storeId, photoIndex, {
        status: 'APPROVED'
      });
      
      // Remove from held if it was held
      if (heldPhotos[photoIndex] !== undefined) {
        const updated = { ...heldPhotos };
        delete updated[photoIndex];
        await saveHeldPhotos(updated);
      }
      
      Toast.show({
        type: 'success',
        text1: 'Photo Approved',
        text2: `Photo ${photoIndex + 1} has been approved`
      });
      fetchStore();
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Approval Failed',
        text2: error.response?.data?.message || 'Failed to approve photo'
      });
    } finally {
      setProcessing(false);
    }
  };

  const handleRejectPhoto = async () => {
    if (rejectPhotoIndex === null) return;
    if (!rejectionReason.trim()) {
      Toast.show({
        type: 'error',
        text1: 'Rejection Reason Required',
        text2: 'Please provide a reason for rejection'
      });
      return;
    }

    setProcessing(true);
    try {
      await storeService.updateReccePhotoStatus(storeId, rejectPhotoIndex, {
        status: 'REJECTED',
        rejectionReason
      });
      
      // Remove from held if it was held
      if (heldPhotos[rejectPhotoIndex] !== undefined) {
        const updated = { ...heldPhotos };
        delete updated[rejectPhotoIndex];
        await saveHeldPhotos(updated);
      }
      
      Toast.show({
        type: 'success',
        text1: 'Photo Rejected',
        text2: `Photo ${rejectPhotoIndex + 1} has been rejected`
      });
      setShowRejectModal(false);
      setRejectPhotoIndex(null);
      setRejectionReason('');
      fetchStore();
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Rejection Failed',
        text2: error.response?.data?.message || 'Failed to reject photo'
      });
    } finally {
      setProcessing(false);
    }
  };

  const handleHoldPhoto = async () => {
    if (holdPhotoIndex === null) return;
    
    const updated = { ...heldPhotos, [holdPhotoIndex]: holdReason.trim() || 'On hold' };
    await saveHeldPhotos(updated);
    
    Toast.show({
      type: 'success',
      text1: 'Photo Put on Hold',
      text2: `Photo ${holdPhotoIndex + 1} has been put on hold`
    });
    
    setShowHoldModal(false);
    setHoldPhotoIndex(null);
    setHoldReason('');
  };

  const handleApproveAll = async () => {
    Alert.alert(
      'Approve All Photos',
      'This will approve all pending photos. This action cannot be undone. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Approve All',
          style: 'destructive',
          onPress: async () => {
            setProcessing(true);
            try {
              // Call the approve all API endpoint
              const response = await storeService.approveAllReccePhotos?.(storeId);
              Toast.show({
                type: 'success',
                text1: 'All Photos Approved',
                text2: 'All pending photos have been approved'
              });
              fetchStore();
            } catch (error: any) {
              Toast.show({
                type: 'error',
                text1: 'Approval Failed',
                text2: error.response?.data?.message || 'Failed to approve all photos'
              });
            } finally {
              setProcessing(false);
            }
          }
        }
      ]
    );
  };

  const getEffectiveStatus = (photo: any, index: number) => {
    if (heldPhotos[index]) return 'HOLD';
    return photo.approvalStatus;
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'APPROVED': return '#10B981';
      case 'REJECTED': return '#EF4444';
      case 'HOLD': return '#F59E0B';
      default: return '#6B7280';
    }
  };

  const getStatusIcon = (status?: string) => {
    switch (status) {
      case 'APPROVED': return <CheckCircle2 size={16} color="#10B981" />;
      case 'REJECTED': return <XCircle size={16} color="#EF4444" />;
      case 'HOLD': return <PauseCircle size={16} color="#F59E0B" />;
      default: return <Clock size={16} color="#6B7280" />;
    }
  };

  const getStatusText = (status?: string) => {
    switch (status) {
      case 'APPROVED': return 'Approved';
      case 'REJECTED': return 'Rejected';
      case 'HOLD': return 'On Hold';
      default: return 'Pending';
    }
  };

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.colors.background, justifyContent: 'center', alignItems: 'center' }}>
        <Loader2 size={32} color={theme.colors.primary} />
        <Text style={{ color: theme.colors.text, marginTop: 16 }}>Loading...</Text>
      </View>
    );
  }

  if (!store || !store.recce) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.colors.background, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
        <AlertCircle size={48} color={theme.colors.textSecondary} />
        <Text style={{ color: theme.colors.text, marginTop: 16, fontSize: 18, fontWeight: 'bold', textAlign: 'center' }}>
          No Recce Data Found
        </Text>
        <Text style={{ color: theme.colors.textSecondary, marginTop: 8, textAlign: 'center', lineHeight: 20 }}>
          This store doesn't have any recce data to review. The recce might not have been submitted yet.
        </Text>
        <TouchableOpacity 
          onPress={() => navigation.goBack()}
          style={{ 
            backgroundColor: theme.colors.primary, 
            paddingHorizontal: 20, 
            paddingVertical: 12, 
            borderRadius: 8, 
            marginTop: 20 
          }}
        >
          <Text style={{ color: '#FFFFFF', fontWeight: 'bold' }}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const approved = store.recce.approvedPhotosCount || 0;
  const rejected = store.recce.rejectedPhotosCount || 0;
  const onHold = Object.keys(heldPhotos).length;
  const pending = store.recce.reccePhotos.filter(
    (photo: any, idx: number) => !heldPhotos[idx] && (!photo.approvalStatus || photo.approvalStatus === 'PENDING')
  ).length;

  // Filter photos based on active filter
  const filteredPhotos = store.recce.reccePhotos.filter((photo: any, index: number) => {
    const status = getEffectiveStatus(photo, index);
    if (activeFilter === 'ALL') return true;
    if (activeFilter === 'PENDING') return !status || status === 'PENDING';
    return status === activeFilter;
  });

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        {/* Header */}
        <View style={{
          backgroundColor: theme.colors.surface,
          borderRadius: 12,
          padding: 16,
          marginBottom: 16,
          borderWidth: 1,
          borderColor: theme.colors.border
        }}>
          <Text style={{ fontSize: 18, fontWeight: 'bold', color: theme.colors.text, marginBottom: 8 }}>
            Review Recce Photos
          </Text>
          <Text style={{ fontSize: 14, color: theme.colors.textSecondary, marginBottom: 16 }}>
            {store.storeName}
          </Text>
          
          {/* Filter Buttons */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              {[
                { key: 'ALL', label: 'All', count: store.recce.reccePhotos.length, color: '#6B7280' },
                { key: 'PENDING', label: 'Pending', count: pending, color: '#6B7280' },
                { key: 'APPROVED', label: 'Approved', count: approved, color: '#10B981' },
                { key: 'REJECTED', label: 'Rejected', count: rejected, color: '#EF4444' },
                { key: 'HOLD', label: 'On Hold', count: onHold, color: '#F59E0B' },
              ].map(({ key, label, count, color }) => {
                const isActive = activeFilter === key;
                return (
                  <TouchableOpacity
                    key={key}
                    onPress={() => setActiveFilter(key as FilterType)}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      paddingHorizontal: 12,
                      paddingVertical: 8,
                      borderRadius: 20,
                      backgroundColor: isActive ? color : theme.colors.background,
                      borderWidth: 1,
                      borderColor: color,
                      minWidth: 70
                    }}
                  >
                    <Text style={{
                      color: isActive ? '#FFFFFF' : color,
                      fontSize: 12,
                      fontWeight: 'bold',
                      marginRight: 4
                    }}>
                      {count}
                    </Text>
                    <Text style={{
                      color: isActive ? '#FFFFFF' : color,
                      fontSize: 12,
                      fontWeight: '600'
                    }}>
                      {label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </ScrollView>
          
          {/* Approve All Button */}
          {pending > 0 && (
            <TouchableOpacity
              onPress={handleApproveAll}
              disabled={processing}
              style={{
                backgroundColor: '#10B981',
                padding: 12,
                borderRadius: 8,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                opacity: processing ? 0.6 : 1
              }}
            >
              <CheckSquare size={16} color="#FFFFFF" />
              <Text style={{ color: '#FFFFFF', fontWeight: 'bold', marginLeft: 8 }}>
                Approve All Remaining ({pending})
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Initial Photos */}
        {store.recce?.initialPhotos && store.recce.initialPhotos.length > 0 && (
          <View style={{
            backgroundColor: theme.colors.surface,
            borderRadius: 12,
            padding: 16,
            marginBottom: 16,
            borderWidth: 1,
            borderColor: theme.colors.border
          }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
              <Camera size={20} color="#3B82F6" />
              <Text style={{ fontSize: 16, fontWeight: 'bold', color: theme.colors.text, marginLeft: 8 }}>
                Initial Photos ({store.recce.initialPhotos.length})
              </Text>
            </View>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {store.recce.initialPhotos.map((photo: string, index: number) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => {
                    const fullImageUrl = imageService.getFullImageUrl(photo);
                    setSelectedImage(fullImageUrl);
                  }}
                  style={{ width: 80, height: 80, borderRadius: 8, overflow: 'hidden' }}
                >
                  <Image
                    source={{ uri: imageService.getFullImageUrl(photo) }}
                    style={{ width: '100%', height: '100%' }}
                    resizeMode="cover"
                    onError={() => {}}
                    onLoad={() => {}}
                  />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Recce Photos */}
        {filteredPhotos && filteredPhotos.length > 0 ? (
          filteredPhotos.map((photo: any, index: number) => {
            const actualIndex = store.recce.reccePhotos.findIndex((p: any) => p === photo);
            const effectiveStatus = getEffectiveStatus(photo, actualIndex);
            
            return (
              <View key={actualIndex} style={{
                backgroundColor: theme.colors.surface,
                borderRadius: 12,
                padding: 16,
                marginBottom: 16,
                borderWidth: 1,
                borderColor: theme.colors.border
              }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <Text style={{ fontSize: 16, fontWeight: 'bold', color: theme.colors.text }}>
                    Photo {actualIndex + 1}
                  </Text>
                  <View style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    backgroundColor: getStatusColor(effectiveStatus) + '20',
                    paddingHorizontal: 8,
                    paddingVertical: 4,
                    borderRadius: 12
                  }}>
                    {getStatusIcon(effectiveStatus)}
                    <Text style={{
                      color: getStatusColor(effectiveStatus),
                      fontSize: 12,
                      fontWeight: 'bold',
                      marginLeft: 4
                    }}>
                      {getStatusText(effectiveStatus)}
                    </Text>
                  </View>
                </View>

                <TouchableOpacity onPress={() => {
                  const fullImageUrl = imageService.getFullImageUrl(photo.photo);
                  setSelectedImage(fullImageUrl);
                }}>
                  <Image
                    source={{ uri: imageService.getFullImageUrl(photo.photo) }}
                    style={{ width: '100%', height: 200, borderRadius: 8, marginBottom: 12 }}
                    resizeMode="cover"
                    onError={() => {}}
                    onLoad={() => {}}
                  />
                </TouchableOpacity>

                <View style={{ marginBottom: 12 }}>
                  <Text style={{ fontSize: 12, color: theme.colors.textSecondary, marginBottom: 4 }}>
                    Measurements: {photo.measurements.width} × {photo.measurements.height} {photo.measurements.unit}
                  </Text>
                  {photo.elements?.[0] && (
                    <Text style={{ fontSize: 12, color: theme.colors.textSecondary }}>
                      Element: {photo.elements[0].elementName}
                    </Text>
                  )}
                </View>

                {photo.rejectionReason && (
                  <View style={{
                    backgroundColor: '#EF444420',
                    borderWidth: 1,
                    borderColor: '#EF4444',
                    borderRadius: 8,
                    padding: 12,
                    marginBottom: 12
                  }}>
                    <Text style={{ fontSize: 12, fontWeight: 'bold', color: '#EF4444', marginBottom: 4 }}>
                      Rejection Reason:
                    </Text>
                    <Text style={{ fontSize: 12, color: '#EF4444' }}>
                      {photo.rejectionReason}
                    </Text>
                  </View>
                )}

                {heldPhotos[actualIndex] && (
                  <View style={{
                    backgroundColor: '#F59E0B20',
                    borderWidth: 1,
                    borderColor: '#F59E0B',
                    borderRadius: 8,
                    padding: 12,
                    marginBottom: 12
                  }}>
                    <Text style={{ fontSize: 12, fontWeight: 'bold', color: '#F59E0B', marginBottom: 4 }}>
                      Hold Reason:
                    </Text>
                    <Text style={{ fontSize: 12, color: '#F59E0B' }}>
                      {heldPhotos[actualIndex]}
                    </Text>
                  </View>
                )}

                {(!effectiveStatus || effectiveStatus === 'PENDING') && (
                  <View style={{ gap: 8 }}>
                    <TouchableOpacity
                      onPress={() => handleApprovePhoto(actualIndex)}
                      disabled={processing}
                      style={{
                        backgroundColor: '#10B981',
                        padding: 12,
                        borderRadius: 8,
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'center',
                        opacity: processing ? 0.6 : 1
                      }}
                    >
                      <CheckCircle2 size={16} color="#FFFFFF" />
                      <Text style={{ color: '#FFFFFF', fontWeight: 'bold', marginLeft: 4 }}>
                        Approve
                      </Text>
                    </TouchableOpacity>
                    
                    <View style={{ flexDirection: 'row', gap: 8 }}>
                      <TouchableOpacity
                        onPress={() => {
                          setHoldPhotoIndex(actualIndex);
                          setShowHoldModal(true);
                        }}
                        disabled={processing}
                        style={{
                          flex: 1,
                          backgroundColor: '#F59E0B',
                          padding: 12,
                          borderRadius: 8,
                          flexDirection: 'row',
                          alignItems: 'center',
                          justifyContent: 'center',
                          opacity: processing ? 0.6 : 1
                        }}
                      >
                        <PauseCircle size={16} color="#FFFFFF" />
                        <Text style={{ color: '#FFFFFF', fontWeight: 'bold', marginLeft: 4 }}>
                          Hold
                        </Text>
                      </TouchableOpacity>
                      
                      <TouchableOpacity
                        onPress={() => {
                          setRejectPhotoIndex(actualIndex);
                          setShowRejectModal(true);
                        }}
                        disabled={processing}
                        style={{
                          flex: 1,
                          backgroundColor: '#EF4444',
                          padding: 12,
                          borderRadius: 8,
                          flexDirection: 'row',
                          alignItems: 'center',
                          justifyContent: 'center',
                          opacity: processing ? 0.6 : 1
                        }}
                      >
                        <XCircle size={16} color="#FFFFFF" />
                        <Text style={{ color: '#FFFFFF', fontWeight: 'bold', marginLeft: 4 }}>
                          Reject
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}

                {effectiveStatus === 'HOLD' && (
                  <View style={{ gap: 8 }}>
                    <TouchableOpacity
                      onPress={() => handleApprovePhoto(actualIndex)}
                      disabled={processing}
                      style={{
                        backgroundColor: '#10B981',
                        padding: 12,
                        borderRadius: 8,
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'center',
                        opacity: processing ? 0.6 : 1
                      }}
                    >
                      <CheckCircle2 size={16} color="#FFFFFF" />
                      <Text style={{ color: '#FFFFFF', fontWeight: 'bold', marginLeft: 4 }}>
                        Approve
                      </Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity
                      onPress={() => {
                        setRejectPhotoIndex(actualIndex);
                        setShowRejectModal(true);
                      }}
                      disabled={processing}
                      style={{
                        backgroundColor: '#EF4444',
                        padding: 12,
                        borderRadius: 8,
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'center',
                        opacity: processing ? 0.6 : 1
                      }}
                    >
                      <XCircle size={16} color="#FFFFFF" />
                      <Text style={{ color: '#FFFFFF', fontWeight: 'bold', marginLeft: 4 }}>
                        Reject
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            );
          })
        ) : activeFilter !== 'ALL' ? (
          <View style={{
            backgroundColor: theme.colors.surface,
            borderRadius: 12,
            padding: 20,
            marginBottom: 16,
            borderWidth: 1,
            borderColor: theme.colors.border,
            alignItems: 'center'
          }}>
            <AlertCircle size={48} color={theme.colors.textSecondary} style={{ opacity: 0.5 }} />
            <Text style={{ color: theme.colors.text, fontSize: 16, fontWeight: 'bold', marginTop: 12, textAlign: 'center' }}>
              No Photos in This Category
            </Text>
            <Text style={{ color: theme.colors.textSecondary, fontSize: 14, marginTop: 8, textAlign: 'center', lineHeight: 20 }}>
              There are no photos with {activeFilter.toLowerCase()} status.
            </Text>
          </View>
        ) : (
          <View style={{
            backgroundColor: theme.colors.surface,
            borderRadius: 12,
            padding: 20,
            marginBottom: 16,
            borderWidth: 1,
            borderColor: theme.colors.border,
            alignItems: 'center'
          }}>
            <AlertCircle size={48} color={theme.colors.textSecondary} style={{ opacity: 0.5 }} />
            <Text style={{ color: theme.colors.text, fontSize: 16, fontWeight: 'bold', marginTop: 12, textAlign: 'center' }}>
              No Recce Photos to Review
            </Text>
            <Text style={{ color: theme.colors.textSecondary, fontSize: 14, marginTop: 8, textAlign: 'center', lineHeight: 20 }}>
              This store doesn't have any recce photos submitted for review yet.
            </Text>
          </View>
        )}}
      </ScrollView>

      {/* Image Viewer Modal */}
      <Modal visible={!!selectedImage} transparent={true} onRequestClose={() => setSelectedImage(null)}>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.9)', justifyContent: 'center', alignItems: 'center' }}>
          <TouchableOpacity
            onPress={() => setSelectedImage(null)}
            style={{ position: 'absolute', top: insets.top + 20, right: 20, zIndex: 1 }}
          >
            <X size={30} color="#FFFFFF" />
          </TouchableOpacity>
          {selectedImage && (
            <Image
              source={{ uri: selectedImage }}
              style={{ width: '90%', height: '80%' }}
              resizeMode="contain"
            />
          )}
        </View>
      </Modal>

      {/* Hold Modal */}
      <Modal visible={showHoldModal} transparent={true} onRequestClose={() => setShowHoldModal(false)}>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 16 }}>
          <View style={{
            backgroundColor: theme.colors.surface,
            borderRadius: 12,
            padding: 20,
            width: '100%',
            maxWidth: 400
          }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View style={{
                  backgroundColor: '#F59E0B20',
                  padding: 8,
                  borderRadius: 20,
                  marginRight: 12
                }}>
                  <PauseCircle size={20} color="#F59E0B" />
                </View>
                <View>
                  <Text style={{ fontSize: 18, fontWeight: 'bold', color: theme.colors.text }}>
                    Hold Photo {holdPhotoIndex !== null ? holdPhotoIndex + 1 : ''}
                  </Text>
                  <Text style={{ fontSize: 12, color: theme.colors.textSecondary, marginTop: 2 }}>
                    This photo will be put on hold for later review
                  </Text>
                </View>
              </View>
              <TouchableOpacity onPress={() => setShowHoldModal(false)}>
                <X size={24} color={theme.colors.textSecondary} />
              </TouchableOpacity>
            </View>
            
            <TextInput
              value={holdReason}
              onChangeText={setHoldReason}
              placeholder="Reason for holding (optional)..."
              placeholderTextColor={theme.colors.textSecondary}
              multiline
              style={{
                backgroundColor: theme.colors.background,
                borderWidth: 1,
                borderColor: theme.colors.border,
                borderRadius: 8,
                padding: 12,
                color: theme.colors.text,
                fontSize: 16,
                minHeight: 80,
                textAlignVertical: 'top',
                marginBottom: 16
              }}
            />
            
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <TouchableOpacity
                onPress={() => {
                  setShowHoldModal(false);
                  setHoldPhotoIndex(null);
                  setHoldReason('');
                }}
                style={{
                  flex: 1,
                  backgroundColor: theme.colors.background,
                  borderWidth: 1,
                  borderColor: theme.colors.border,
                  padding: 12,
                  borderRadius: 8,
                  alignItems: 'center'
                }}
              >
                <Text style={{ color: theme.colors.text, fontWeight: 'bold' }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleHoldPhoto}
                style={{
                  flex: 1,
                  backgroundColor: '#F59E0B',
                  padding: 12,
                  borderRadius: 8,
                  alignItems: 'center',
                  flexDirection: 'row',
                  justifyContent: 'center'
                }}
              >
                <PauseCircle size={16} color="#FFFFFF" />
                <Text style={{ color: '#FFFFFF', fontWeight: 'bold', marginLeft: 4 }}>Put on Hold</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      <Modal visible={showRejectModal} transparent={true} onRequestClose={() => setShowRejectModal(false)}>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 16 }}>
          <View style={{
            backgroundColor: theme.colors.surface,
            borderRadius: 12,
            padding: 20,
            width: '100%',
            maxWidth: 400
          }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <Text style={{ fontSize: 18, fontWeight: 'bold', color: theme.colors.text }}>
                Reject Photo {rejectPhotoIndex !== null ? rejectPhotoIndex + 1 : ''}
              </Text>
              <TouchableOpacity onPress={() => setShowRejectModal(false)}>
                <X size={24} color={theme.colors.textSecondary} />
              </TouchableOpacity>
            </View>
            
            <TextInput
              value={rejectionReason}
              onChangeText={setRejectionReason}
              placeholder="Enter rejection reason..."
              placeholderTextColor={theme.colors.textSecondary}
              multiline
              style={{
                backgroundColor: theme.colors.background,
                borderWidth: 1,
                borderColor: theme.colors.border,
                borderRadius: 8,
                padding: 12,
                color: theme.colors.text,
                fontSize: 16,
                minHeight: 100,
                textAlignVertical: 'top',
                marginBottom: 16
              }}
            />
            
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <TouchableOpacity
                onPress={() => {
                  setShowRejectModal(false);
                  setRejectPhotoIndex(null);
                  setRejectionReason('');
                }}
                style={{
                  flex: 1,
                  backgroundColor: theme.colors.background,
                  borderWidth: 1,
                  borderColor: theme.colors.border,
                  padding: 12,
                  borderRadius: 8,
                  alignItems: 'center'
                }}
              >
                <Text style={{ color: theme.colors.text, fontWeight: 'bold' }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleRejectPhoto}
                disabled={processing || !rejectionReason.trim()}
                style={{
                  flex: 1,
                  backgroundColor: '#EF4444',
                  padding: 12,
                  borderRadius: 8,
                  alignItems: 'center',
                  opacity: (processing || !rejectionReason.trim()) ? 0.6 : 1
                }}
              >
                {processing ? (
                  <Loader2 size={16} color="#FFFFFF" />
                ) : (
                  <Text style={{ color: '#FFFFFF', fontWeight: 'bold' }}>Reject</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}