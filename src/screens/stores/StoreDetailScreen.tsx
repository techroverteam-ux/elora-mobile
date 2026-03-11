import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, Modal } from 'react-native';
import { MapPin, Building2, Package, IndianRupee, Camera, Ruler, FileText, CheckCircle, XCircle, Clock, X, User, Calendar, Wrench } from 'lucide-react-native';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { storeService } from '../../services/storeService';
import Toast from 'react-native-toast-message';
import imageService from '../../services/imageService';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface StoreDetailProps {
  route: {
    params: {
      storeId: string;
    };
  };
  navigation: {
    goBack: () => void;
  };
}

export default function StoreDetailScreen({ route, navigation }: StoreDetailProps) {
  const { theme } = useTheme();
  const { canViewCommercialInfo } = useAuth();
  const insets = useSafeAreaInsets();
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
      setStore(response.store || response);
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

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    }).replace(/ /g, '-');
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
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 12 }}>
        {/* Store Info */}
        <View style={{ marginBottom: 12 }}>
          <Text style={{ fontSize: 20, fontWeight: 'bold', color: theme.colors.text }}>
            {store.storeName}
          </Text>
          <Text style={{ fontSize: 14, color: theme.colors.textSecondary }}>
            {store.storeId || store.dealerCode} • {store.currentStatus?.replace(/_/g, ' ')}
          </Text>
        </View>

        {/* Store Details Grid */}
        <View style={{ marginBottom: 12 }}>
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
                District: {store.location?.district || '-'}
              </Text>
              <Text style={{ fontSize: 12, color: theme.colors.textSecondary, marginBottom: 2 }}>
                City: {store.location?.city || '-'}
              </Text>
              {store.location?.address && (
                <Text style={{ fontSize: 11, color: theme.colors.textSecondary, marginTop: 4 }}>
                  {store.location.address}
                </Text>
              )}
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
              flex: canViewCommercialInfo() ? 1 : 2, 
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
                Size: {store.specs?.width || 0} × {store.specs?.height || 0} ft
              </Text>
              <Text style={{ fontSize: 12, color: theme.colors.textSecondary }}>
                Area: {store.specs?.boardSize || '-'} sq.ft
              </Text>
            </View>

            {/* Commercial Card - Only show to admins */}
            {canViewCommercialInfo() && (
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
            )}
          </View>
        </View>

        {/* Initial Photos */}
        {store.recce?.initialPhotos && store.recce.initialPhotos.length > 0 && (
          <View style={{ 
            backgroundColor: theme.colors.surface, 
            borderRadius: 12, 
            padding: 16, 
            marginBottom: 12,
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
              {store.recce.initialPhotos
                .filter((photo: string) => photo && typeof photo === 'string')
                .map((photo: string, index: number) => {
                  const imageUrl = imageService.getFullImageUrl(photo);
                  if (!imageUrl) return null;
                  
                  return (
                    <TouchableOpacity
                      key={index}
                      onPress={() => setSelectedImage(imageUrl)}
                      style={{ width: 80, height: 80, borderRadius: 8, overflow: 'hidden' }}
                    >
                      <Image
                        source={{ uri: imageUrl }}
                        style={{ width: '100%', height: '100%' }}
                        resizeMode="cover"
                        onError={() => console.log('Image load error:', imageUrl)}
                      />
                    </TouchableOpacity>
                  );
                })
                .filter(Boolean)
              }
            </View>
          </View>
        )}

        {/* Recce Photos */}
        {store.recce?.reccePhotos && store.recce.reccePhotos.length > 0 && (
          <View style={{ 
            backgroundColor: theme.colors.surface, 
            borderRadius: 12, 
            padding: 16, 
            marginBottom: 12,
            borderWidth: 1,
            borderColor: theme.colors.border
          }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
              <Ruler size={20} color="#10B981" />
              <Text style={{ fontSize: 16, fontWeight: 'bold', color: theme.colors.text, marginLeft: 8 }}>
                Recce Photos ({store.recce.reccePhotos.length})
              </Text>
            </View>
            
            {store.recce.reccePhotos
              .filter((reccePhoto: any) => reccePhoto?.photo && typeof reccePhoto.photo === 'string')
              .map((reccePhoto: any, index: number) => {
                const imageUrl = imageService.getFullImageUrl(reccePhoto.photo);
                if (!imageUrl) return null;
                
                return (
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
                      {getStatusBadge(reccePhoto.approvalStatus)}
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
                      onPress={() => setSelectedImage(imageUrl)}
                      style={{ marginBottom: 12 }}
                    >
                      <Image
                        source={{ uri: imageUrl }}
                        style={{ width: '100%', height: 200, borderRadius: 8 }}
                        resizeMode="cover"
                        onError={() => console.log('Recce image load error:', imageUrl)}
                      />
                    </TouchableOpacity>

                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                      <Text style={{ fontSize: 14, color: theme.colors.textSecondary }}>
                        Dimensions: {reccePhoto.measurements?.width || 0} × {reccePhoto.measurements?.height || 0} {reccePhoto.measurements?.unit || 'ft'}
                      </Text>
                      {reccePhoto.measurements?.unit === 'in' && (
                        <Text style={{ fontSize: 12, color: theme.colors.textSecondary }}>
                          ({(reccePhoto.measurements.width / 12).toFixed(2)} × {(reccePhoto.measurements.height / 12).toFixed(2)} ft)
                        </Text>
                      )}
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
                );
              })
              .filter(Boolean)
            }
          </View>
        )}

        {/* Installation Photos */}
        {store.installation?.photos && store.installation.photos.length > 0 && (
          <View style={{ 
            backgroundColor: theme.colors.surface, 
            borderRadius: 12, 
            padding: 16, 
            marginBottom: 12,
            borderWidth: 1,
            borderColor: theme.colors.border
          }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
              <Camera size={20} color="#10B981" />
              <Text style={{ fontSize: 16, fontWeight: 'bold', color: theme.colors.text, marginLeft: 8 }}>
                Installation Photos ({store.installation.photos.length})
              </Text>
            </View>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {store.installation.photos
                .filter((photoObj: any) => {
                  // Handle both string and object formats
                  const photoUrl = typeof photoObj === 'string' ? photoObj : photoObj?.installationPhoto;
                  return photoUrl && typeof photoUrl === 'string';
                })
                .map((photoObj: any, index: number) => {
                  // Handle both string and object formats
                  const photoUrl = typeof photoObj === 'string' ? photoObj : photoObj.installationPhoto;
                  const imageUrl = imageService.getFullImageUrl(photoUrl);
                  if (!imageUrl) return null;
                  
                  return (
                    <TouchableOpacity
                      key={photoObj._id || index}
                      onPress={() => setSelectedImage(imageUrl)}
                      style={{ width: 80, height: 80, borderRadius: 8, overflow: 'hidden' }}
                    >
                      <Image
                        source={{ uri: imageUrl }}
                        style={{ width: '100%', height: '100%' }}
                        resizeMode="cover"
                        onError={() => console.log('Installation image load error:', imageUrl)}
                      />
                    </TouchableOpacity>
                  );
                })
                .filter(Boolean)
              }
            </View>
            
            {/* Installation Details */}
            {store.installation.submittedBy && (
              <View style={{ marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: theme.colors.border }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                  <User size={14} color={theme.colors.textSecondary} />
                  <Text style={{ fontSize: 12, color: theme.colors.textSecondary, marginLeft: 6 }}>Submitted By:</Text>
                  <Text style={{ fontSize: 12, color: theme.colors.text, fontWeight: '600', marginLeft: 4 }}>
                    {store.installation.submittedBy}
                  </Text>
                </View>
                {store.installation.submittedDate && (
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Calendar size={14} color={theme.colors.textSecondary} />
                    <Text style={{ fontSize: 12, color: theme.colors.textSecondary, marginLeft: 6 }}>Submitted:</Text>
                    <Text style={{ fontSize: 12, color: theme.colors.text, marginLeft: 4 }}>
                      {formatDate(store.installation.submittedDate)}
                    </Text>
                  </View>
                )}
              </View>
            )}
          </View>
        )}

        {/* Workflow Assignment Details */}
        {(store.workflow?.recceAssignedTo || store.workflow?.installationAssignedTo) && (
          <View style={{ 
            backgroundColor: theme.colors.surface, 
            borderRadius: 12, 
            padding: 16, 
            marginBottom: 12,
            borderWidth: 1,
            borderColor: theme.colors.border
          }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
              <User size={20} color="#8B5CF6" />
              <Text style={{ fontSize: 16, fontWeight: 'bold', color: theme.colors.text, marginLeft: 8 }}>
                Workflow Assignments
              </Text>
            </View>

            {/* Recce Assignment */}
            {store.workflow.recceAssignedTo && (
              <View style={{ 
                backgroundColor: theme.colors.background, 
                borderRadius: 8, 
                padding: 12, 
                marginBottom: 12,
                borderWidth: 1,
                borderColor: theme.colors.border
              }}>
                <Text style={{ fontSize: 14, fontWeight: 'bold', color: '#3B82F6', marginBottom: 8 }}>
                  Recce Assignment
                </Text>
                <View style={{ gap: 6 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <User size={14} color={theme.colors.textSecondary} />
                    <Text style={{ fontSize: 12, color: theme.colors.textSecondary, marginLeft: 6 }}>Assigned To:</Text>
                    <Text style={{ fontSize: 12, color: theme.colors.text, fontWeight: '600', marginLeft: 4 }}>
                      {store.workflow.recceAssignedTo.name}
                    </Text>
                  </View>
                  {store.recce?.assignedDate && (
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <Calendar size={14} color={theme.colors.textSecondary} />
                      <Text style={{ fontSize: 12, color: theme.colors.textSecondary, marginLeft: 6 }}>Assigned:</Text>
                      <Text style={{ fontSize: 12, color: theme.colors.text, marginLeft: 4 }}>
                        {formatDate(store.recce.assignedDate)}
                      </Text>
                    </View>
                  )}
                  {store.recce?.submittedDate && (
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <CheckCircle size={14} color="#10B981" />
                      <Text style={{ fontSize: 12, color: theme.colors.textSecondary, marginLeft: 6 }}>Submitted:</Text>
                      <Text style={{ fontSize: 12, color: theme.colors.text, marginLeft: 4 }}>
                        {formatDate(store.recce.submittedDate)}
                      </Text>
                    </View>
                  )}
                  {store.recce?.submittedBy && (
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <User size={14} color={theme.colors.textSecondary} />
                      <Text style={{ fontSize: 12, color: theme.colors.textSecondary, marginLeft: 6 }}>Submitted By:</Text>
                      <Text style={{ fontSize: 12, color: theme.colors.text, marginLeft: 4 }}>
                        {store.recce.submittedBy}
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            )}

            {/* Installation Assignment */}
            {store.workflow.installationAssignedTo && (
              <View style={{ 
                backgroundColor: theme.colors.background, 
                borderRadius: 8, 
                padding: 12,
                borderWidth: 1,
                borderColor: theme.colors.border
              }}>
                <Text style={{ fontSize: 14, fontWeight: 'bold', color: '#10B981', marginBottom: 8 }}>
                  Installation Assignment
                </Text>
                <View style={{ gap: 6 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <User size={14} color={theme.colors.textSecondary} />
                    <Text style={{ fontSize: 12, color: theme.colors.textSecondary, marginLeft: 6 }}>Assigned To:</Text>
                    <Text style={{ fontSize: 12, color: theme.colors.text, fontWeight: '600', marginLeft: 4 }}>
                      {store.workflow.installationAssignedTo.name}
                    </Text>
                  </View>
                  {store.installation?.assignedDate && (
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <Calendar size={14} color={theme.colors.textSecondary} />
                      <Text style={{ fontSize: 12, color: theme.colors.textSecondary, marginLeft: 6 }}>Assigned:</Text>
                      <Text style={{ fontSize: 12, color: theme.colors.text, marginLeft: 4 }}>
                        {formatDate(store.installation.assignedDate)}
                      </Text>
                    </View>
                  )}
                  {store.installation?.submittedDate && (
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <CheckCircle size={14} color="#10B981" />
                      <Text style={{ fontSize: 12, color: theme.colors.textSecondary, marginLeft: 6 }}>Submitted:</Text>
                      <Text style={{ fontSize: 12, color: theme.colors.text, marginLeft: 4 }}>
                        {formatDate(store.installation.submittedDate)}
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            )}

            {/* Priority */}
            {store.workflow.priority && (
              <View style={{ 
                backgroundColor: store.workflow.priority === 'HIGH' ? '#EF444420' : store.workflow.priority === 'MEDIUM' ? '#F59E0B20' : '#10B98120',
                borderRadius: 8,
                padding: 8,
                marginTop: 8,
                alignItems: 'center'
              }}>
                <Text style={{ 
                  fontSize: 12, 
                  fontWeight: 'bold',
                  color: store.workflow.priority === 'HIGH' ? '#EF4444' : store.workflow.priority === 'MEDIUM' ? '#F59E0B' : '#10B981'
                }}>
                  Priority: {store.workflow.priority}
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Cost Details Breakdown */}
        {canViewCommercialInfo() && (store.costDetails || store.recce?.costDetails) && (
          <View style={{ 
            backgroundColor: theme.colors.surface, 
            borderRadius: 12, 
            padding: 16, 
            marginBottom: 12,
            borderWidth: 1,
            borderColor: theme.colors.border
          }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
              <IndianRupee size={20} color="#10B981" />
              <Text style={{ fontSize: 16, fontWeight: 'bold', color: theme.colors.text, marginLeft: 8 }}>
                Cost Breakdown
              </Text>
            </View>

            <View style={{ gap: 8 }}>
              {(store.costDetails?.boardRate || store.recce?.costDetails?.boardRate) && (
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Text style={{ fontSize: 12, color: theme.colors.textSecondary }}>Board Rate:</Text>
                  <Text style={{ fontSize: 12, color: theme.colors.text, fontWeight: '600' }}>
                    ₹{(store.costDetails?.boardRate || store.recce?.costDetails?.boardRate)}/sq.ft
                  </Text>
                </View>
              )}
              {(store.costDetails?.totalBoardCost || store.recce?.costDetails?.totalBoardCost) && (
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Text style={{ fontSize: 12, color: theme.colors.textSecondary }}>Total Board Cost:</Text>
                  <Text style={{ fontSize: 12, color: theme.colors.text, fontWeight: '600' }}>
                    ₹{(store.costDetails?.totalBoardCost || store.recce?.costDetails?.totalBoardCost)?.toLocaleString()}
                  </Text>
                </View>
              )}
              {store.costDetails?.angleCharges > 0 && (
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Text style={{ fontSize: 12, color: theme.colors.textSecondary }}>Angle Charges:</Text>
                  <Text style={{ fontSize: 12, color: theme.colors.text, fontWeight: '600' }}>
                    ₹{store.costDetails.angleCharges.toLocaleString()}
                  </Text>
                </View>
              )}
              {store.costDetails?.scaffoldingCharges > 0 && (
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Text style={{ fontSize: 12, color: theme.colors.textSecondary }}>Scaffolding:</Text>
                  <Text style={{ fontSize: 12, color: theme.colors.text, fontWeight: '600' }}>
                    ₹{store.costDetails.scaffoldingCharges.toLocaleString()}
                  </Text>
                </View>
              )}
              {store.costDetails?.transportation > 0 && (
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Text style={{ fontSize: 12, color: theme.colors.textSecondary }}>Transportation:</Text>
                  <Text style={{ fontSize: 12, color: theme.colors.text, fontWeight: '600' }}>
                    ₹{store.costDetails.transportation.toLocaleString()}
                  </Text>
                </View>
              )}
              {store.costDetails?.flanges > 0 && (
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Text style={{ fontSize: 12, color: theme.colors.textSecondary }}>Flanges:</Text>
                  <Text style={{ fontSize: 12, color: theme.colors.text, fontWeight: '600' }}>
                    ₹{store.costDetails.flanges.toLocaleString()}
                  </Text>
                </View>
              )}
              {store.costDetails?.lollipop > 0 && (
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Text style={{ fontSize: 12, color: theme.colors.textSecondary }}>Lollipop:</Text>
                  <Text style={{ fontSize: 12, color: theme.colors.text, fontWeight: '600' }}>
                    ₹{store.costDetails.lollipop.toLocaleString()}
                  </Text>
                </View>
              )}
              {store.costDetails?.oneWayVision > 0 && (
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Text style={{ fontSize: 12, color: theme.colors.textSecondary }}>One Way Vision:</Text>
                  <Text style={{ fontSize: 12, color: theme.colors.text, fontWeight: '600' }}>
                    ₹{store.costDetails.oneWayVision.toLocaleString()}
                  </Text>
                </View>
              )}
              {store.costDetails?.sunboard > 0 && (
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Text style={{ fontSize: 12, color: theme.colors.textSecondary }}>Sunboard:</Text>
                  <Text style={{ fontSize: 12, color: theme.colors.text, fontWeight: '600' }}>
                    ₹{store.costDetails.sunboard.toLocaleString()}
                  </Text>
                </View>
              )}
              <View style={{ 
                flexDirection: 'row', 
                justifyContent: 'space-between', 
                paddingTop: 12, 
                marginTop: 8,
                borderTopWidth: 1, 
                borderTopColor: theme.colors.border 
              }}>
                <Text style={{ fontSize: 14, color: '#10B981', fontWeight: 'bold' }}>Grand Total:</Text>
                <Text style={{ fontSize: 14, color: '#10B981', fontWeight: 'bold' }}>
                  ₹{(store.recce?.commercials?.totalCost || store.commercials?.totalCost || 0).toLocaleString()}
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Photo Approval Summary */}
        {store.recce && (store.recce.approvedPhotosCount > 0 || store.recce.rejectedPhotosCount > 0 || store.recce.pendingPhotosCount > 0) && (
          <View style={{ 
            backgroundColor: theme.colors.surface, 
            borderRadius: 12, 
            padding: 16, 
            marginBottom: 12,
            borderWidth: 1,
            borderColor: theme.colors.border
          }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
              <Camera size={20} color="#8B5CF6" />
              <Text style={{ fontSize: 16, fontWeight: 'bold', color: theme.colors.text, marginLeft: 8 }}>
                Photo Approval Summary
              </Text>
            </View>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <View style={{ flex: 1, backgroundColor: '#10B98120', borderRadius: 8, padding: 12, alignItems: 'center' }}>
                <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#10B981' }}>
                  {store.recce.approvedPhotosCount || 0}
                </Text>
                <Text style={{ fontSize: 12, color: '#10B981' }}>Approved</Text>
              </View>
              <View style={{ flex: 1, backgroundColor: '#EF444420', borderRadius: 8, padding: 12, alignItems: 'center' }}>
                <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#EF4444' }}>
                  {store.recce.rejectedPhotosCount || 0}
                </Text>
                <Text style={{ fontSize: 12, color: '#EF4444' }}>Rejected</Text>
              </View>
              <View style={{ flex: 1, backgroundColor: '#F59E0B20', borderRadius: 8, padding: 12, alignItems: 'center' }}>
                <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#F59E0B' }}>
                  {store.recce.pendingPhotosCount || 0}
                </Text>
                <Text style={{ fontSize: 12, color: '#F59E0B' }}>Pending</Text>
              </View>
            </View>
          </View>
        )}

        {/* Remarks */}
        {store.recce?.notes && (
          <View style={{ 
            backgroundColor: theme.colors.surface, 
            borderRadius: 12, 
            padding: 16, 
            marginBottom: 12,
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

        {/* Store Metadata */}
        <View style={{ 
          backgroundColor: theme.colors.surface, 
          borderRadius: 12, 
          padding: 16, 
          marginBottom: 12,
          borderWidth: 1,
          borderColor: theme.colors.border
        }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
            <FileText size={20} color="#6B7280" />
            <Text style={{ fontSize: 16, fontWeight: 'bold', color: theme.colors.text, marginLeft: 8 }}>
              Store Information
            </Text>
          </View>
          <View style={{ gap: 6 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ fontSize: 12, color: theme.colors.textSecondary }}>Project ID:</Text>
              <Text style={{ fontSize: 12, color: theme.colors.text, fontWeight: '600' }}>{store.projectID || '-'}</Text>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ fontSize: 12, color: theme.colors.textSecondary }}>Client Code:</Text>
              <Text style={{ fontSize: 12, color: theme.colors.text, fontWeight: '600' }}>{store.clientCode || '-'}</Text>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ fontSize: 12, color: theme.colors.textSecondary }}>Store Code:</Text>
              <Text style={{ fontSize: 12, color: theme.colors.text, fontWeight: '600' }}>{store.storeCode || '-'}</Text>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ fontSize: 12, color: theme.colors.textSecondary }}>Created:</Text>
              <Text style={{ fontSize: 12, color: theme.colors.text, fontWeight: '600' }}>{formatDate(store.createdAt)}</Text>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ fontSize: 12, color: theme.colors.textSecondary }}>Last Updated:</Text>
              <Text style={{ fontSize: 12, color: theme.colors.text, fontWeight: '600' }}>{formatDate(store.updatedAt)}</Text>
            </View>
          </View>
        </View>
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
    </View>
  );
}