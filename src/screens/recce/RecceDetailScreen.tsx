import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, Modal, TextInput } from 'react-native';
import { ArrowLeft, MapPin, Building2, Package, IndianRupee, Camera, Ruler, FileText, CheckCircle, XCircle, Clock, Edit3, Save, X } from 'lucide-react-native';
import { useTheme } from '../../context/ThemeContext';
import { storeService } from '../../services/storeService';
import Toast from 'react-native-toast-message';
import imageService from '../../services/imageService';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface RecceDetailProps {
  route: {
    params: {
      storeId: string;
    };
  };
  navigation: {
    goBack: () => void;
    navigate: (screen: string, params?: any) => void;
  };
}

export default function RecceDetailScreen({ route, navigation }: RecceDetailProps) {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const { storeId } = route.params;
  const [store, setStore] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number | null>(null);
  const [newStatus, setNewStatus] = useState<'APPROVED' | 'REJECTED'>('APPROVED');
  const [rejectionReason, setRejectionReason] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState(false);

  useEffect(() => {
    fetchStoreDetails();
  }, []);

  const fetchStoreDetails = async () => {
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

  const handleStatusChange = async () => {
    if (selectedPhotoIndex === null) return;
    if (newStatus === 'REJECTED' && !rejectionReason.trim()) {
      Toast.show({ type: 'error', text1: 'Please provide a rejection reason' });
      return;
    }

    setUpdatingStatus(true);
    try {
      await storeService.updateReccePhotoStatus(storeId, selectedPhotoIndex, {
        status: newStatus,
        rejectionReason: newStatus === 'REJECTED' ? rejectionReason : undefined,
      });
      Toast.show({ type: 'success', text1: `Photo ${selectedPhotoIndex + 1} ${newStatus.toLowerCase()}` });
      setShowStatusModal(false);
      setSelectedPhotoIndex(null);
      setRejectionReason('');
      fetchStoreDetails(); // Refresh data
    } catch (error: any) {
      Toast.show({ type: 'error', text1: error.response?.data?.message || 'Failed to update status' });
    } finally {
      setUpdatingStatus(false);
    }
  };

  const getStatusBadge = (status?: string) => {
    if (status === 'APPROVED') {
      return (
        <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#10B98120', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 }}>
          <CheckCircle size={12} color="#10B981" />
          <Text style={{ color: '#10B981', fontSize: 10, fontWeight: 'bold', marginLeft: 4 }}>APPROVED</Text>
        </View>
      );
    }
    if (status === 'REJECTED') {
      return (
        <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#EF444420', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 }}>
          <XCircle size={12} color="#EF4444" />
          <Text style={{ color: '#EF4444', fontSize: 10, fontWeight: 'bold', marginLeft: 4 }}>REJECTED</Text>
        </View>
      );
    }
    return (
      <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#F59E0B20', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 }}>
        <Clock size={12} color="#F59E0B" />
        <Text style={{ color: '#F59E0B', fontSize: 10, fontWeight: 'bold', marginLeft: 4 }}>PENDING</Text>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.colors.background, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ color: theme.colors.textSecondary }}>Loading...</Text>
      </View>
    );
  }

  if (!store) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.colors.background, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ color: theme.colors.text }}>Store not found</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      {/* Header */}
      <View style={{ 
        backgroundColor: theme.colors.primary, 
        paddingTop: insets.top, 
        paddingBottom: 16, 
        paddingHorizontal: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 5
      }}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={{ padding: 8, marginRight: 12 }}>
            <ArrowLeft size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#FFFFFF' }}>
              {store.storeName}
            </Text>
            <Text style={{ fontSize: 14, color: 'rgba(255,255,255,0.8)' }}>
              {store.storeId || store.dealerCode} • {store.currentStatus?.replace(/_/g, ' ')}
            </Text>
          </View>
        </View>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16 }}>
        {/* Store Details Grid */}
        <View style={{ marginBottom: 16 }}>
          <View style={{ flexDirection: 'row', gap: 8, marginBottom: 8 }}>
            {/* Location Card */}
            <View style={{ 
              flex: 1, 
              backgroundColor: theme.colors.surface, 
              borderRadius: 12, 
              padding: 12,
              borderWidth: 1,
              borderColor: theme.colors.border
            }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                <MapPin size={16} color="#F59E0B" />
                <Text style={{ fontSize: 14, fontWeight: 'bold', color: theme.colors.text, marginLeft: 6 }}>Location</Text>
              </View>
              <Text style={{ fontSize: 12, color: theme.colors.textSecondary, marginBottom: 2 }}>
                Zone: {store.location?.zone || '-'}
              </Text>
              <Text style={{ fontSize: 12, color: theme.colors.textSecondary, marginBottom: 2 }}>
                State: {store.location?.state || '-'}
              </Text>
              <Text style={{ fontSize: 12, color: theme.colors.textSecondary, marginBottom: 2 }}>
                City: {store.location?.city || '-'}
              </Text>
              <Text style={{ fontSize: 11, color: theme.colors.textSecondary, marginTop: 4 }}>
                {store.location?.address || '-'}
              </Text>
            </View>

            {/* Dealer Info Card */}
            <View style={{ 
              flex: 1, 
              backgroundColor: theme.colors.surface, 
              borderRadius: 12, 
              padding: 12,
              borderWidth: 1,
              borderColor: theme.colors.border
            }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                <Building2 size={16} color="#F59E0B" />
                <Text style={{ fontSize: 14, fontWeight: 'bold', color: theme.colors.text, marginLeft: 6 }}>Dealer</Text>
              </View>
              <Text style={{ fontSize: 12, color: theme.colors.textSecondary, marginBottom: 2 }}>
                Code: {store.dealerCode}
              </Text>
              <Text style={{ fontSize: 12, color: theme.colors.textSecondary, marginBottom: 2 }}>
                Vendor: {store.vendorCode || '-'}
              </Text>
              <Text style={{ fontSize: 12, color: theme.colors.textSecondary, marginBottom: 2 }}>
                Contact: {store.contact?.personName || '-'}
              </Text>
              <Text style={{ fontSize: 12, color: theme.colors.textSecondary }}>
                Mobile: {store.contact?.mobile || '-'}
              </Text>
            </View>
          </View>

          <View style={{ flexDirection: 'row', gap: 8 }}>
            {/* Board Specs Card */}
            <View style={{ 
              flex: 1, 
              backgroundColor: theme.colors.surface, 
              borderRadius: 12, 
              padding: 12,
              borderWidth: 1,
              borderColor: theme.colors.border
            }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                <Package size={16} color="#F59E0B" />
                <Text style={{ fontSize: 14, fontWeight: 'bold', color: theme.colors.text, marginLeft: 6 }}>Board Specs</Text>
              </View>
              <Text style={{ fontSize: 12, color: theme.colors.textSecondary, marginBottom: 2 }}>
                Type: {store.specs?.type || '-'}
              </Text>
              <Text style={{ fontSize: 12, color: theme.colors.textSecondary, marginBottom: 2 }}>
                Qty: {store.specs?.qty || 1}
              </Text>
              <Text style={{ fontSize: 12, color: theme.colors.textSecondary, marginBottom: 2 }}>
                Size: {store.specs?.width} × {store.specs?.height} ft
              </Text>
              <Text style={{ fontSize: 12, color: theme.colors.textSecondary }}>
                Area: {store.specs?.boardSize || '-'} sq.ft
              </Text>
            </View>

            {/* Commercial Card */}
            <View style={{ 
              flex: 1, 
              backgroundColor: theme.colors.surface, 
              borderRadius: 12, 
              padding: 12,
              borderWidth: 1,
              borderColor: theme.colors.border
            }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                <IndianRupee size={16} color="#F59E0B" />
                <Text style={{ fontSize: 14, fontWeight: 'bold', color: theme.colors.text, marginLeft: 6 }}>Commercial</Text>
              </View>
              <Text style={{ fontSize: 12, color: theme.colors.textSecondary, marginBottom: 2 }}>
                PO: {store.commercials?.poNumber || '-'}
              </Text>
              <Text style={{ fontSize: 12, color: theme.colors.textSecondary, marginBottom: 2 }}>
                Month: {store.commercials?.poMonth || '-'}
              </Text>
              <Text style={{ fontSize: 12, color: theme.colors.textSecondary, marginBottom: 2 }}>
                Invoice: {store.commercials?.invoiceNumber || '-'}
              </Text>
              <Text style={{ fontSize: 12, color: '#10B981', fontWeight: 'bold' }}>
                Total: ₹{store.commercials?.totalCost?.toLocaleString() || 0}
              </Text>
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
                Initial Store Photos ({store.recce.initialPhotos.length})
              </Text>
            </View>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {store.recce.initialPhotos.map((photo: string, index: number) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => setSelectedImage(imageService.getFullImageUrl(photo))}
                  style={{ width: 80, height: 80, borderRadius: 8, overflow: 'hidden' }}
                >
                  <Image
                    source={{ uri: imageService.getFullImageUrl(photo) }}
                    style={{ width: '100%', height: '100%' }}
                    resizeMode="cover"
                  />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Recce Photos */}
        {store.recce?.reccePhotos && store.recce.reccePhotos.length > 0 && (
          <View style={{ 
            backgroundColor: theme.colors.surface, 
            borderRadius: 12, 
            padding: 16, 
            marginBottom: 16,
            borderWidth: 1,
            borderColor: theme.colors.border
          }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
              <Ruler size={20} color="#10B981" />
              <Text style={{ fontSize: 16, fontWeight: 'bold', color: theme.colors.text, marginLeft: 8 }}>
                Recce Photos ({store.recce.reccePhotos.length})
              </Text>
            </View>
            
            {store.recce.reccePhotos.map((reccePhoto: any, index: number) => (
              <View key={index} style={{ 
                backgroundColor: theme.colors.background, 
                borderRadius: 12, 
                padding: 16, 
                marginBottom: 12,
                borderWidth: 1,
                borderColor: theme.colors.border
              }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <Text style={{ fontSize: 16, fontWeight: 'bold', color: theme.colors.text }}>
                    Board {index + 1}
                  </Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    {getStatusBadge(reccePhoto.approvalStatus)}
                    <TouchableOpacity
                      onPress={() => {
                        setSelectedPhotoIndex(index);
                        setNewStatus('APPROVED');
                        setShowStatusModal(true);
                      }}
                      style={{ padding: 4 }}
                    >
                      <Edit3 size={16} color={theme.colors.primary} />
                    </TouchableOpacity>
                  </View>
                </View>

                {reccePhoto.rejectionReason && (
                  <View style={{ 
                    backgroundColor: '#EF444420', 
                    borderRadius: 8, 
                    padding: 12, 
                    marginBottom: 12,
                    borderWidth: 1,
                    borderColor: '#EF4444'
                  }}>
                    <Text style={{ fontSize: 12, fontWeight: 'bold', color: '#EF4444', marginBottom: 4 }}>
                      Rejection Reason:
                    </Text>
                    <Text style={{ fontSize: 14, color: '#EF4444' }}>
                      {reccePhoto.rejectionReason}
                    </Text>
                  </View>
                )}

                <TouchableOpacity
                  onPress={() => setSelectedImage(imageService.getFullImageUrl(reccePhoto.photo))}
                  style={{ marginBottom: 12 }}
                >
                  <Image
                    source={{ uri: imageService.getFullImageUrl(reccePhoto.photo) }}
                    style={{ width: '100%', height: 200, borderRadius: 8 }}
                    resizeMode="cover"
                  />
                </TouchableOpacity>

                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                  <Text style={{ fontSize: 14, color: theme.colors.textSecondary }}>
                    Dimensions: {reccePhoto.measurements.width} × {reccePhoto.measurements.height} {reccePhoto.measurements.unit}
                  </Text>
                  <Text style={{ fontSize: 12, color: theme.colors.textSecondary }}>
                    ({reccePhoto.measurements.unit === 'in' 
                      ? `${(reccePhoto.measurements.width / 12).toFixed(2)} × ${(reccePhoto.measurements.height / 12).toFixed(2)} ft`
                      : `${reccePhoto.measurements.width} × ${reccePhoto.measurements.height} ft`
                    })
                  </Text>
                </View>

                {reccePhoto.elements && reccePhoto.elements.length > 0 && (
                  <View style={{ 
                    backgroundColor: theme.colors.primary + '10', 
                    borderRadius: 8, 
                    padding: 8 
                  }}>
                    <Text style={{ fontSize: 12, color: theme.colors.primary, fontWeight: 'bold' }}>
                      Element: {reccePhoto.elements[0].elementName}
                    </Text>
                  </View>
                )}
              </View>
            ))}
          </View>
        )}

        {/* Remarks */}
        {store.recce?.notes && (
          <View style={{ 
            backgroundColor: theme.colors.surface, 
            borderRadius: 12, 
            padding: 16, 
            marginBottom: 16,
            borderWidth: 1,
            borderColor: theme.colors.border
          }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
              <FileText size={20} color="#F59E0B" />
              <Text style={{ fontSize: 16, fontWeight: 'bold', color: theme.colors.text, marginLeft: 8 }}>
                Remarks
              </Text>
            </View>
            <Text style={{ fontSize: 14, color: theme.colors.text, lineHeight: 20 }}>
              {store.recce.notes}
            </Text>
          </View>
        )}

        {/* Action Buttons */}
        {store.currentStatus === 'RECCE_ASSIGNED' && (
          <TouchableOpacity
            onPress={() => navigation.navigate('RecceForm', { storeId: store._id })}
            style={{
              backgroundColor: theme.colors.primary,
              padding: 16,
              borderRadius: 12,
              alignItems: 'center',
              flexDirection: 'row',
              justifyContent: 'center'
            }}
          >
            <Camera size={20} color="#FFFFFF" />
            <Text style={{ color: '#FFFFFF', fontSize: 16, fontWeight: 'bold', marginLeft: 8 }}>
              Start Recce
            </Text>
          </TouchableOpacity>
        )}
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

      {/* Status Change Modal */}
      <Modal visible={showStatusModal} transparent={true} onRequestClose={() => setShowStatusModal(false)}>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 20 }}>
          <View style={{ 
            backgroundColor: theme.colors.surface, 
            borderRadius: 16, 
            padding: 20, 
            width: '100%', 
            maxWidth: 400 
          }}>
            <Text style={{ fontSize: 18, fontWeight: 'bold', color: theme.colors.text, marginBottom: 16 }}>
              Change Status - Photo {selectedPhotoIndex !== null ? selectedPhotoIndex + 1 : ''}
            </Text>
            
            <View style={{ marginBottom: 16 }}>
              <Text style={{ fontSize: 14, fontWeight: '600', color: theme.colors.text, marginBottom: 8 }}>
                New Status
              </Text>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                <TouchableOpacity
                  onPress={() => setNewStatus('APPROVED')}
                  style={{
                    flex: 1,
                    padding: 12,
                    borderRadius: 8,
                    backgroundColor: newStatus === 'APPROVED' ? '#10B981' : theme.colors.border,
                    alignItems: 'center'
                  }}
                >
                  <Text style={{ 
                    color: newStatus === 'APPROVED' ? '#FFFFFF' : theme.colors.textSecondary, 
                    fontWeight: '600' 
                  }}>
                    Approved
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setNewStatus('REJECTED')}
                  style={{
                    flex: 1,
                    padding: 12,
                    borderRadius: 8,
                    backgroundColor: newStatus === 'REJECTED' ? '#EF4444' : theme.colors.border,
                    alignItems: 'center'
                  }}
                >
                  <Text style={{ 
                    color: newStatus === 'REJECTED' ? '#FFFFFF' : theme.colors.textSecondary, 
                    fontWeight: '600' 
                  }}>
                    Rejected
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {newStatus === 'REJECTED' && (
              <View style={{ marginBottom: 16 }}>
                <Text style={{ fontSize: 14, fontWeight: '600', color: theme.colors.text, marginBottom: 8 }}>
                  Rejection Reason *
                </Text>
                <TextInput
                  value={rejectionReason}
                  onChangeText={setRejectionReason}
                  placeholder="Enter rejection reason..."
                  placeholderTextColor={theme.colors.textSecondary}
                  multiline
                  numberOfLines={3}
                  style={{
                    backgroundColor: theme.colors.background,
                    borderWidth: 1,
                    borderColor: theme.colors.border,
                    borderRadius: 8,
                    padding: 12,
                    color: theme.colors.text,
                    textAlignVertical: 'top'
                  }}
                />
              </View>
            )}

            <View style={{ flexDirection: 'row', gap: 12 }}>
              <TouchableOpacity
                onPress={() => {
                  setShowStatusModal(false);
                  setSelectedPhotoIndex(null);
                  setRejectionReason('');
                }}
                style={{
                  flex: 1,
                  padding: 12,
                  borderRadius: 8,
                  backgroundColor: theme.colors.border,
                  alignItems: 'center'
                }}
              >
                <Text style={{ color: theme.colors.textSecondary, fontWeight: '600' }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleStatusChange}
                disabled={updatingStatus || (newStatus === 'REJECTED' && !rejectionReason.trim())}
                style={{
                  flex: 1,
                  padding: 12,
                  borderRadius: 8,
                  backgroundColor: newStatus === 'APPROVED' ? '#10B981' : '#EF4444',
                  alignItems: 'center',
                  opacity: (updatingStatus || (newStatus === 'REJECTED' && !rejectionReason.trim())) ? 0.5 : 1
                }}
              >
                <Text style={{ color: '#FFFFFF', fontWeight: '600' }}>
                  {updatingStatus ? 'Updating...' : 'Update'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}