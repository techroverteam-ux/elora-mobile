import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, Modal, TextInput } from 'react-native';
import { CheckCircle2, XCircle, Clock, Loader2, AlertCircle, CheckSquare, X, Camera } from 'lucide-react-native';
import { useTheme } from '../../context/ThemeContext';
import { storeService } from '../../services/storeService';
import Toast from 'react-native-toast-message';
import imageService from '../../services/imageService';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { RecceStackParamList } from '../../navigation/types';

type RecceReviewScreenNavigationProp = StackNavigationProp<RecceStackParamList, 'RecceReview'>;
type RecceReviewScreenRouteProp = RouteProp<RecceStackParamList, 'RecceReview'>;

interface RecceReviewProps {
  route: RecceReviewScreenRouteProp;
  navigation: RecceReviewScreenNavigationProp;
}

export default function RecceReviewScreen({ route, navigation }: RecceReviewProps) {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const { storeId } = route.params;
  const [store, setStore] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectPhotoIndex, setRejectPhotoIndex] = useState<number | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  useEffect(() => {
    fetchStore();
  }, []);

  const fetchStore = async () => {
    try {
      setLoading(true);
      const response = await storeService.getById(storeId);
      setStore(response.store);
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to load store details'
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

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'APPROVED': return '#10B981';
      case 'REJECTED': return '#EF4444';
      default: return '#F59E0B';
    }
  };

  const getStatusIcon = (status?: string) => {
    switch (status) {
      case 'APPROVED': return <CheckCircle2 size={16} color="#10B981" />;
      case 'REJECTED': return <XCircle size={16} color="#EF4444" />;
      default: return <Clock size={16} color="#F59E0B" />;
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

  if (!store || !store.recce?.reccePhotos) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.colors.background, justifyContent: 'center', alignItems: 'center' }}>
        <AlertCircle size={48} color={theme.colors.textSecondary} />
        <Text style={{ color: theme.colors.text, marginTop: 16 }}>No recce data found</Text>
      </View>
    );
  }

  const approved = store.recce.approvedPhotosCount || 0;
  const rejected = store.recce.rejectedPhotosCount || 0;
  const pending = store.recce.pendingPhotosCount || store.recce.reccePhotos.length;

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        {/* Summary Card */}
        <View style={{
          backgroundColor: theme.colors.surface,
          borderRadius: 12,
          padding: 16,
          marginBottom: 16,
          borderWidth: 1,
          borderColor: theme.colors.border
        }}>
          <Text style={{ fontSize: 18, fontWeight: 'bold', color: theme.colors.text, marginBottom: 16 }}>
            Review Summary - {store.storeName}
          </Text>
          
          <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginBottom: 16 }}>
            <View style={{ alignItems: 'center' }}>
              <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#10B981' }}>{approved}</Text>
              <Text style={{ fontSize: 12, color: theme.colors.textSecondary }}>Approved</Text>
            </View>
            <View style={{ alignItems: 'center' }}>
              <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#EF4444' }}>{rejected}</Text>
              <Text style={{ fontSize: 12, color: theme.colors.textSecondary }}>Rejected</Text>
            </View>
            <View style={{ alignItems: 'center' }}>
              <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#F59E0B' }}>{pending}</Text>
              <Text style={{ fontSize: 12, color: theme.colors.textSecondary }}>Pending</Text>
            </View>
          </View>
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
        {store.recce.reccePhotos.map((photo: any, index: number) => (
          <View key={index} style={{
            backgroundColor: theme.colors.surface,
            borderRadius: 12,
            padding: 16,
            marginBottom: 16,
            borderWidth: 1,
            borderColor: theme.colors.border
          }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <Text style={{ fontSize: 16, fontWeight: 'bold', color: theme.colors.text }}>
                Photo {index + 1}
              </Text>
              <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: getStatusColor(photo.approvalStatus) + '20',
                paddingHorizontal: 8,
                paddingVertical: 4,
                borderRadius: 12
              }}>
                {getStatusIcon(photo.approvalStatus)}
                <Text style={{
                  color: getStatusColor(photo.approvalStatus),
                  fontSize: 12,
                  fontWeight: 'bold',
                  marginLeft: 4
                }}>
                  {photo.approvalStatus || 'PENDING'}
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

            {(!photo.approvalStatus || photo.approvalStatus === 'PENDING') && (
              <View style={{ flexDirection: 'row', gap: 8 }}>
                <TouchableOpacity
                  onPress={() => handleApprovePhoto(index)}
                  disabled={processing}
                  style={{
                    flex: 1,
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
                    setRejectPhotoIndex(index);
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
            )}
          </View>
        ))}
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

      {/* Reject Modal */}
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