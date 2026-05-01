import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, Modal } from 'react-native';
import { MapPin, Building2, Package, IndianRupee, Camera, Wrench, CheckCircle, Clock, X } from 'lucide-react-native';
import { useTheme } from '../../context/ThemeContext';
import { storeService } from '../../services/storeService';
import Toast from 'react-native-toast-message';
import imageService from '../../services/imageService';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface InstallationDetailProps {
  route: {
    params: {
      storeId: string;
    };
  };
  navigation: {
    goBack: () => void;
    navigate?: (screen: string, params?: any) => void;
  };
}

export default function InstallationDetailScreen({ route, navigation }: InstallationDetailProps) {
  const { theme } = useTheme();
  const { storeId } = route.params;
  const [store, setStore] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  useEffect(() => {
    fetchStoreDetails();
  }, []);

  const fetchStoreDetails = async () => {
    try {
      setLoading(true);
      const response = await storeService.getById(storeId);
      console.log('Installation Screen - Store data:', JSON.stringify(response.store?.contact, null, 2));
      console.log('Installation Screen - Full store:', JSON.stringify(response.store, null, 2));
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'INSTALLATION_ASSIGNED': return '#F59E0B';
      case 'INSTALLATION_SUBMITTED': return '#3B82F6';
      case 'COMPLETED': return '#10B981';
      default: return '#6B7280';
    }
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
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16 }}>
        {/* Status Card */}
        <View style={{ 
          backgroundColor: theme.colors.surface, 
          borderRadius: 12, 
          padding: 16, 
          marginBottom: 16,
          borderWidth: 1,
          borderColor: theme.colors.border
        }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={{ fontSize: 18, fontWeight: 'bold', color: theme.colors.text }}>
              Installation Status
            </Text>
            <View style={{ 
              backgroundColor: getStatusColor(store.currentStatus) + '20', 
              paddingHorizontal: 12, 
              paddingVertical: 6, 
              borderRadius: 16 
            }}>
              <Text style={{ 
                color: getStatusColor(store.currentStatus), 
                fontSize: 12, 
                fontWeight: 'bold' 
              }}>
                {store.currentStatus?.replace(/_/g, ' ')}
              </Text>
            </View>
          </View>
          
          {store.workflow?.installationAssignedAt && (
            <Text style={{ fontSize: 12, color: theme.colors.textSecondary, marginTop: 8 }}>
              Assigned: {new Date(store.workflow.installationAssignedAt).toLocaleDateString()}
            </Text>
          )}
          
          {store.workflow?.installationSubmittedAt && (
            <Text style={{ fontSize: 12, color: theme.colors.textSecondary, marginTop: 4 }}>
              Submitted: {new Date(store.workflow.installationSubmittedAt).toLocaleDateString()}
            </Text>
          )}
        </View>

        {/* Assignment Info */}
        <View style={{ 
          backgroundColor: theme.colors.surface, 
          borderRadius: 12, 
          padding: 16, 
          marginBottom: 16,
          borderWidth: 1,
          borderColor: theme.colors.border
        }}>
          <Text style={{ fontSize: 18, fontWeight: 'bold', color: theme.colors.text, marginBottom: 16 }}>
            Assignment Details
          </Text>
          
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <View style={{ flex: 1, backgroundColor: theme.colors.background, borderRadius: 8, padding: 12 }}>
              <Text style={{ fontSize: 12, color: theme.colors.textSecondary, marginBottom: 4 }}>Recce Completed By</Text>
              <Text style={{ fontSize: 14, color: theme.colors.text, fontWeight: '600', marginBottom: 2 }}>
                {store.workflow?.recceAssignedTo?.name || '-'}
              </Text>
              <Text style={{ fontSize: 12, color: theme.colors.textSecondary }}>
                {store.workflow?.recceSubmittedAt ? new Date(store.workflow.recceSubmittedAt).toLocaleDateString() : '-'}
              </Text>
            </View>
            <View style={{ flex: 1, backgroundColor: theme.colors.background, borderRadius: 8, padding: 12 }}>
              <Text style={{ fontSize: 12, color: theme.colors.textSecondary, marginBottom: 4 }}>Installation Assigned To</Text>
              <Text style={{ fontSize: 14, color: theme.colors.text, fontWeight: '600', marginBottom: 2 }}>
                {store.workflow?.installationAssignedTo?.name || '-'}
              </Text>
              <Text style={{ fontSize: 12, color: theme.colors.textSecondary }}>
                {store.workflow?.installationAssignedAt ? new Date(store.workflow.installationAssignedAt).toLocaleDateString() : '-'}
              </Text>
            </View>
          </View>
        </View>
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
                Store ID: {store.storeId || '-'}
              </Text>
              <Text style={{ fontSize: 12, color: theme.colors.textSecondary, marginBottom: 2 }}>
                Client Code: {store.clientCode || '-'}
              </Text>
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
                Mobile: {store.contact?.mobile || store.contact?.phone || store.mobile || store.phone || store.contactMobile || store.dealerMobile || '-'}
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

        {/* Initial Photos Reference */}
        {store.recce?.initialPhotos && store.recce.initialPhotos.length > 0 && (
          <View style={{ 
            backgroundColor: '#3B82F620', 
            borderRadius: 12, 
            padding: 16, 
            marginBottom: 16,
            borderWidth: 1,
            borderColor: '#3B82F650'
          }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
              <Camera size={20} color="#3B82F6" />
              <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#3B82F6', marginLeft: 8 }}>
                Initial Photos ({store.recce.initialPhotos.length})
              </Text>
            </View>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {store.recce.initialPhotos.slice(0, 6).map((photo: string, index: number) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => setSelectedImage(imageService.getFullImageUrl(photo))}
                  style={{ width: 80, height: 80, borderRadius: 8, overflow: 'hidden', borderWidth: 2, borderColor: '#3B82F6' }}
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

        {/* Recce Photos Reference - Show all for context */}
        {store.recce?.reccePhotos && store.recce.reccePhotos.length > 0 && (
          <View style={{ 
            backgroundColor: '#3B82F620', 
            borderRadius: 12, 
            padding: 16, 
            marginBottom: 16,
            borderWidth: 1,
            borderColor: '#3B82F650'
          }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
              <Camera size={20} color="#3B82F6" />
              <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#3B82F6', marginLeft: 8 }}>
                Recce Photos (Reference) - {store.recce.reccePhotos.filter(p => p.approvalStatus === 'APPROVED').length} Approved, {store.recce.reccePhotos.filter(p => p.approvalStatus === 'REJECTED').length} Rejected
              </Text>
            </View>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {store.recce.reccePhotos.map((reccePhoto: any, index: number) => {
                const isApproved = reccePhoto.approvalStatus === 'APPROVED';
                const isRejected = reccePhoto.approvalStatus === 'REJECTED';
                
                return (
                  <View key={index} style={{ position: 'relative' }}>
                    <TouchableOpacity
                      onPress={() => setSelectedImage(imageService.getFullImageUrl(reccePhoto.photo))}
                      style={{ 
                        width: 80, 
                        height: 80, 
                        borderRadius: 8, 
                        overflow: 'hidden', 
                        borderWidth: 2, 
                        borderColor: isApproved ? '#10B981' : isRejected ? '#EF4444' : '#F59E0B'
                      }}
                    >
                      <Image
                        source={{ uri: imageService.getFullImageUrl(reccePhoto.photo) }}
                        style={{ width: '100%', height: '100%' }}
                        resizeMode="cover"
                      />
                      <View style={{ 
                        position: 'absolute', 
                        bottom: 0, 
                        left: 0, 
                        right: 0, 
                        backgroundColor: isApproved ? 'rgba(16,185,129,0.9)' : isRejected ? 'rgba(239,68,68,0.9)' : 'rgba(245,158,11,0.9)', 
                        padding: 2 
                      }}>
                        <Text style={{ color: '#FFFFFF', fontSize: 8, fontWeight: 'bold', textAlign: 'center' }}>
                          {reccePhoto.measurements.width}×{reccePhoto.measurements.height}
                        </Text>
                      </View>
                      {/* Status indicator */}
                      <View style={{
                        position: 'absolute',
                        top: 2,
                        right: 2,
                        width: 12,
                        height: 12,
                        borderRadius: 6,
                        backgroundColor: isApproved ? '#10B981' : isRejected ? '#EF4444' : '#F59E0B'
                      }} />
                    </TouchableOpacity>
                  </View>
                );
              })}
            </View>
            <View style={{ marginTop: 8, padding: 8, backgroundColor: '#3B82F610', borderRadius: 6 }}>
              <Text style={{ fontSize: 10, color: '#3B82F6', textAlign: 'center' }}>
                🟢 Approved  🔴 Rejected  🟡 Pending/On-Hold
              </Text>
            </View>
          </View>
        )}

        {/* Installation Photos - Only show for approved recce photos */}
        {store.installation?.photos && store.installation.photos.length > 0 ? (
          <View style={{ 
            backgroundColor: theme.colors.surface, 
            borderRadius: 12, 
            padding: 16, 
            marginBottom: 16,
            borderWidth: 1,
            borderColor: theme.colors.border
          }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
              <Wrench size={20} color="#10B981" />
              <Text style={{ fontSize: 16, fontWeight: 'bold', color: theme.colors.text, marginLeft: 8 }}>
                Installation Photos ({store.installation.photos.length})
              </Text>
            </View>
            
            {store.installation.photos.map((installationPhoto: any, index: number) => {
              // Find the corresponding recce photo
              const reccePhoto = store.recce?.reccePhotos?.[installationPhoto.reccePhotoIndex];
              
              // Only show if the recce photo is approved
              if (!reccePhoto || reccePhoto.approvalStatus !== 'APPROVED') {
                return null;
              }
              
              return (
                <View key={index} style={{ 
                  backgroundColor: theme.colors.background, 
                  borderRadius: 12, 
                  padding: 16, 
                  marginBottom: 12,
                  borderWidth: 1,
                  borderColor: theme.colors.border
                }}>
                  <Text style={{ fontSize: 16, fontWeight: 'bold', color: theme.colors.text, marginBottom: 12 }}>
                    Installation Photo {index + 1} (Board {installationPhoto.reccePhotoIndex + 1})
                  </Text>

                  <View style={{ flexDirection: 'row', gap: 12, marginBottom: 12 }}>
                    {/* Recce Photo Reference */}
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 12, fontWeight: '600', color: '#3B82F6', marginBottom: 8 }}>
                        Recce Photo (Reference)
                      </Text>
                      <TouchableOpacity
                        onPress={() => setSelectedImage(imageService.getFullImageUrl(reccePhoto.photo))}
                        style={{ aspectRatio: 1, borderRadius: 8, overflow: 'hidden', borderWidth: 2, borderColor: '#10B981' }}
                      >
                        <Image
                          source={{ uri: imageService.getFullImageUrl(reccePhoto.photo) }}
                          style={{ width: '100%', height: '100%' }}
                          resizeMode="cover"
                        />
                      </TouchableOpacity>
                      <View style={{ marginTop: 8, padding: 8, backgroundColor: '#10B98110', borderRadius: 6 }}>
                        <Text style={{ fontSize: 11, color: '#10B981', fontWeight: '600' }}>
                          {reccePhoto.measurements.width} × {reccePhoto.measurements.height} {reccePhoto.measurements.unit} (APPROVED)
                        </Text>
                        {reccePhoto.elements && reccePhoto.elements.length > 0 && (
                          <Text style={{ fontSize: 10, color: '#10B981', marginTop: 2 }}>
                            Element: {reccePhoto.elements[0].elementName}
                          </Text>
                        )}
                      </View>
                    </View>
                    
                    {/* Installation Photo */}
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 12, fontWeight: '600', color: '#10B981', marginBottom: 8 }}>
                        Installation Photo
                      </Text>
                        <TouchableOpacity
                          onPress={() => setSelectedImage(imageService.getFullImageUrl(installationPhoto.photo))}
                          style={{ aspectRatio: 1, borderRadius: 8, overflow: 'hidden', borderWidth: 2, borderColor: '#10B981' }}
                        >
                          <Image
                            source={{ uri: imageService.getFullImageUrl(installationPhoto.photo) }}
                            style={{ width: '100%', height: '100%' }}
                            resizeMode="cover"
                          />
                        </TouchableOpacity>
                      <View style={{ marginTop: 8, padding: 8, backgroundColor: '#10B98110', borderRadius: 6 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                          <CheckCircle size={12} color="#10B981" />
                          <Text style={{ fontSize: 11, color: '#10B981', fontWeight: '600', marginLeft: 4 }}>
                            Installation Complete
                          </Text>
                        </View>
                      </View>
                    </View>
                  </View>
                </View>
              );
            }).filter(Boolean)}
          </View>
        ) : (
          <View style={{ 
            backgroundColor: theme.colors.surface, 
            borderRadius: 12, 
            padding: 16, 
            marginBottom: 16,
            borderWidth: 1,
            borderColor: theme.colors.border,
            alignItems: 'center'
          }}>
            <Wrench size={48} color={theme.colors.textSecondary} />
            <Text style={{ fontSize: 16, fontWeight: 'bold', color: theme.colors.text, marginTop: 12, marginBottom: 4 }}>
              No Installation Photos
            </Text>
            <Text style={{ fontSize: 14, color: theme.colors.textSecondary, textAlign: 'center' }}>
              Installation photos will appear here once the installation is completed.
            </Text>
          </View>
        )}

        {/* Action Buttons */}
        {store.currentStatus === 'INSTALLATION_ASSIGNED' && navigation.navigate && (
          <TouchableOpacity
            onPress={() => navigation.navigate!('InstallationForm', { storeId: store._id })}
            style={{
              backgroundColor: '#10B981',
              padding: 16,
              borderRadius: 12,
              alignItems: 'center',
              flexDirection: 'row',
              justifyContent: 'center'
            }}
          >
            <Wrench size={20} color="#FFFFFF" />
            <Text style={{ color: '#FFFFFF', fontSize: 16, fontWeight: 'bold', marginLeft: 8 }}>
              Start Installation
            </Text>
          </TouchableOpacity>
        )}
      </ScrollView>

      {/* Image Viewer Modal */}
      <Modal visible={!!selectedImage} transparent={true} onRequestClose={() => setSelectedImage(null)}>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.9)', justifyContent: 'center', alignItems: 'center' }}>
          <TouchableOpacity
            onPress={() => setSelectedImage(null)}
            style={{ position: 'absolute', top: 40, right: 20, zIndex: 1 }}
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
    </View>
  );
}