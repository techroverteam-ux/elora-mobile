import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, Image } from 'react-native';
import { MapPin, Calendar, User, IndianRupee, Ruler, Phone, Mail, CheckCircle, Clock, AlertCircle, Building2, Package, FileSpreadsheet } from 'lucide-react-native';
import { useTheme } from '../../context/ThemeContext';
import { storeService } from '../../services/storeService';
import Toast from 'react-native-toast-message';
import PageSkeleton from '../../components/PageSkeleton';
import StoreDetailsEditor from '../../components/StoreDetailsEditor';
import ImageGallery from '../../components/ImageGallery';
import PhotoApproval from '../../components/PhotoApproval';
import imageService from '../../services/imageService';

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

interface StoreDetail {
  _id: string;
  storeId?: string;
  dealerCode: string;
  storeName: string;
  vendorCode?: string;
  location: {
    city: string;
    state?: string;
    district?: string;
    zone?: string;
    address?: string;
    pincode?: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  contact?: {
    personName?: string;
    mobile?: string;
    email?: string;
  };
  currentStatus: string;
  specs?: {
    type?: string;
    qty?: number;
    width: number;
    height: number;
    area?: number;
    boardSize?: string;
  };
  commercials?: {
    totalCost: number;
    poNumber?: string;
    poMonth?: string;
    invoiceNumber?: string;
    invoiceRemarks?: string;
  };
  costDetails?: {
    boardRate?: number;
    totalBoardCost?: number;
    angleCharges?: number;
    scaffoldingCharges?: number;
    transportation?: number;
  };
  workflow: {
    recceAssignedTo?: { _id: string; name: string; email?: string; phone?: string };
    installationAssignedTo?: { _id: string; name: string; email?: string; phone?: string };
    recceSubmittedAt?: string;
    installationSubmittedAt?: string;
  };
  recce?: {
    sizes?: {
      width: number;
      height: number;
      unit?: string;
    };
    notes?: string;
    submittedDate?: string;
    photos?: {
      front?: string;
      side?: string;
      closeUp?: string;
    };
  };
  installation?: {
    photos?: {
      after1?: string;
      after2?: string;
    };
    submittedDate?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export default function StoreDetailScreen({ route, navigation }: StoreDetailProps) {
  const { theme } = useTheme();
  const { storeId } = route.params;
  const [store, setStore] = useState<StoreDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStoreDetail();
  }, [storeId]);

  const fetchStoreDetail = async () => {
    try {
      setLoading(true);
      const { data } = await storeService.getById(storeId);
      setStore(data.store);
    } catch (error) {
      console.error('Error fetching store detail:', error);
      Toast.show({ type: 'error', text1: 'Failed to load store details' });
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'UPLOADED': return '#6B7280';
      case 'RECCE_ASSIGNED': return '#3B82F6';
      case 'RECCE_SUBMITTED': return '#F59E0B';
      case 'RECCE_APPROVED': return '#8B5CF6';
      case 'INSTALLATION_ASSIGNED': return '#6366F1';
      case 'INSTALLATION_SUBMITTED': return '#14B8A6';
      case 'COMPLETED': return '#10B981';
      default: return '#6B7280';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    }).replace(/ /g, '-');
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED': return <CheckCircle size={20} color="#10B981" />;
      case 'RECCE_SUBMITTED':
      case 'INSTALLATION_SUBMITTED': return <Clock size={20} color="#F59E0B" />;
      default: return <AlertCircle size={20} color="#6B7280" />;
    }
  };

  const openMaps = () => {
    if (!store) return;
    
    const lat = store.location.coordinates?.lat;
    const lng = store.location.coordinates?.lng;
    const address = store.location.address;
    
    let url = '';
    if (lat && lng) {
      url = `https://www.google.com/maps?q=${lat},${lng}`;
    } else if (address) {
      url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
    }
    
    if (url) {
      console.log('Open maps:', url);
    }
  };

  if (loading) {
    return <PageSkeleton type="dashboard" />;
  }

  if (!store) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.colors.background, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ color: theme.colors.textSecondary, fontSize: 16 }}>Store not found</Text>
      </View>
    );
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: theme.colors.background }} contentContainerStyle={{ padding: 16 }}>
        {/* Status Card */}
        <View style={{ 
          backgroundColor: theme.colors.surface, 
          borderRadius: 12, 
          padding: 16, 
          marginBottom: 16,
          borderWidth: 1,
          borderColor: theme.colors.border
        }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              {getStatusIcon(store.currentStatus)}
              <Text style={{ fontSize: 18, fontWeight: 'bold', color: theme.colors.text, marginLeft: 8 }}>
                Current Status
              </Text>
            </View>
            <View style={{ 
              backgroundColor: getStatusColor(store.currentStatus) + '20', 
              paddingHorizontal: 12, 
              paddingVertical: 6, 
              borderRadius: 16 
            }}>
              <Text style={{ 
                color: getStatusColor(store.currentStatus), 
                fontSize: 12, 
                fontWeight: '600' 
              }}>
                {store.currentStatus.replace(/_/g, ' ')}
              </Text>
            </View>
          </View>
        </View>

        {/* Store Information Grid */}
        <View style={{ marginBottom: 16 }}>
          {/* Location Card */}
          <View style={{ 
            backgroundColor: theme.colors.surface, 
            borderRadius: 12, 
            padding: 16, 
            marginBottom: 12,
            borderWidth: 1,
            borderColor: theme.colors.border
          }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <MapPin size={20} color={theme.colors.primary} />
                <Text style={{ fontSize: 16, fontWeight: 'bold', color: theme.colors.text, marginLeft: 8 }}>
                  Location
                </Text>
              </View>
              {((store.location.coordinates?.lat && store.location.coordinates?.lng) || store.location.address) && (
                <TouchableOpacity 
                  onPress={openMaps}
                  style={{ 
                    backgroundColor: theme.colors.primary, 
                    paddingHorizontal: 8, 
                    paddingVertical: 4, 
                    borderRadius: 6 
                  }}
                >
                  <Text style={{ color: '#FFFFFF', fontSize: 10, fontWeight: '600' }}>
                    Open in Map
                  </Text>
                </TouchableOpacity>
              )}
            </View>
            
            <View style={{ gap: 8 }}>
              <View style={{ flexDirection: 'row' }}>
                <Text style={{ color: theme.colors.textSecondary, fontSize: 12, width: 60 }}>Zone:</Text>
                <Text style={{ color: theme.colors.text, fontSize: 12, flex: 1 }}>{store.location.zone || '-'}</Text>
              </View>
              <View style={{ flexDirection: 'row' }}>
                <Text style={{ color: theme.colors.textSecondary, fontSize: 12, width: 60 }}>State:</Text>
                <Text style={{ color: theme.colors.text, fontSize: 12, flex: 1 }}>{store.location.state || '-'}</Text>
              </View>
              <View style={{ flexDirection: 'row' }}>
                <Text style={{ color: theme.colors.textSecondary, fontSize: 12, width: 60 }}>District:</Text>
                <Text style={{ color: theme.colors.text, fontSize: 12, flex: 1 }}>{store.location.district || '-'}</Text>
              </View>
              <View style={{ flexDirection: 'row' }}>
                <Text style={{ color: theme.colors.textSecondary, fontSize: 12, width: 60 }}>City:</Text>
                <Text style={{ color: theme.colors.text, fontSize: 12, flex: 1 }}>{store.location.city || '-'}</Text>
              </View>
              {store.location.address && (
                <View style={{ paddingTop: 8, borderTopWidth: 1, borderTopColor: theme.colors.border }}>
                  <Text style={{ color: theme.colors.textSecondary, fontSize: 12 }}>Address:</Text>
                  <Text style={{ color: theme.colors.text, fontSize: 12, marginTop: 4 }}>{store.location.address}</Text>
                </View>
              )}
            </View>
          </View>

          {/* Dealer Info Card */}
          <View style={{ 
            backgroundColor: theme.colors.surface, 
            borderRadius: 12, 
            padding: 16, 
            marginBottom: 12,
            borderWidth: 1,
            borderColor: theme.colors.border
          }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
              <Building2 size={20} color={theme.colors.primary} />
              <Text style={{ fontSize: 16, fontWeight: 'bold', color: theme.colors.text, marginLeft: 8 }}>
                Dealer Info
              </Text>
              <View style={{ flex: 1 }} />
              <StoreDetailsEditor 
                storeId={storeId}
                initialData={store}
                onUpdate={(updatedData) => {
                  setStore({ ...store, ...updatedData });
                  Toast.show({ type: 'success', text1: 'Store updated successfully' });
                }}
              />
            </View>
            
            <View style={{ gap: 8 }}>
              <View style={{ flexDirection: 'row' }}>
                <Text style={{ color: theme.colors.textSecondary, fontSize: 12, width: 60 }}>Code:</Text>
                <Text style={{ color: theme.colors.text, fontSize: 12, flex: 1 }}>{store.dealerCode}</Text>
              </View>
              <View style={{ flexDirection: 'row' }}>
                <Text style={{ color: theme.colors.textSecondary, fontSize: 12, width: 60 }}>Vendor:</Text>
                <Text style={{ color: theme.colors.text, fontSize: 12, flex: 1 }}>{store.vendorCode || '-'}</Text>
              </View>
              <View style={{ flexDirection: 'row' }}>
                <Text style={{ color: theme.colors.textSecondary, fontSize: 12, width: 60 }}>Contact:</Text>
                <Text style={{ color: theme.colors.text, fontSize: 12, flex: 1 }}>{store.contact?.personName || '-'}</Text>
              </View>
              <View style={{ flexDirection: 'row' }}>
                <Text style={{ color: theme.colors.textSecondary, fontSize: 12, width: 60 }}>Mobile:</Text>
                <Text style={{ color: theme.colors.text, fontSize: 12, flex: 1 }}>{store.contact?.mobile || '-'}</Text>
              </View>
            </View>
          </View>

          {/* Commercial Details Card */}
          <View style={{ 
            backgroundColor: theme.colors.surface, 
            borderRadius: 12, 
            padding: 16, 
            marginBottom: 12,
            borderWidth: 1,
            borderColor: theme.colors.border
          }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
              <FileSpreadsheet size={20} color={theme.colors.primary} />
              <Text style={{ fontSize: 16, fontWeight: 'bold', color: theme.colors.text, marginLeft: 8 }}>
                Commercial
              </Text>
            </View>
            
            <View style={{ gap: 8 }}>
              <View style={{ flexDirection: 'row' }}>
                <Text style={{ color: theme.colors.textSecondary, fontSize: 12, width: 80 }}>PO Number:</Text>
                <Text style={{ color: theme.colors.text, fontSize: 12, flex: 1 }}>{store.commercials?.poNumber || '-'}</Text>
              </View>
              <View style={{ flexDirection: 'row' }}>
                <Text style={{ color: theme.colors.textSecondary, fontSize: 12, width: 80 }}>PO Month:</Text>
                <Text style={{ color: theme.colors.text, fontSize: 12, flex: 1 }}>{store.commercials?.poMonth || '-'}</Text>
              </View>
              <View style={{ flexDirection: 'row' }}>
                <Text style={{ color: theme.colors.textSecondary, fontSize: 12, width: 80 }}>Invoice:</Text>
                <Text style={{ color: theme.colors.text, fontSize: 12, flex: 1 }}>{store.commercials?.invoiceNumber || '-'}</Text>
              </View>
              {store.commercials?.invoiceRemarks && (
                <View style={{ paddingTop: 8, borderTopWidth: 1, borderTopColor: theme.colors.border }}>
                  <Text style={{ color: theme.colors.textSecondary, fontSize: 12 }}>Remarks:</Text>
                  <Text style={{ color: theme.colors.text, fontSize: 10, marginTop: 4 }}>{store.commercials.invoiceRemarks}</Text>
                </View>
              )}
            </View>
          </View>
        </View>

        {/* Board Specifications & Cost Details */}
        <View style={{ marginBottom: 16 }}>
          {/* Board Specifications */}
          {store.specs && (
            <View style={{ 
              backgroundColor: theme.colors.surface, 
              borderRadius: 12, 
              padding: 16, 
              marginBottom: 12,
              borderWidth: 1,
              borderColor: theme.colors.border
            }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                <Package size={20} color={theme.colors.primary} />
                <Text style={{ fontSize: 16, fontWeight: 'bold', color: theme.colors.text, marginLeft: 8 }}>
                  Board Specifications
                </Text>
              </View>
              
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 16 }}>
                <View style={{ minWidth: '45%' }}>
                  <Text style={{ color: theme.colors.textSecondary, fontSize: 12 }}>Type:</Text>
                  <Text style={{ color: theme.colors.text, fontSize: 14, fontWeight: '600' }}>{store.specs.type || '-'}</Text>
                </View>
                <View style={{ minWidth: '45%' }}>
                  <Text style={{ color: theme.colors.textSecondary, fontSize: 12 }}>Qty:</Text>
                  <Text style={{ color: theme.colors.text, fontSize: 14, fontWeight: '600' }}>{store.specs.qty || 1}</Text>
                </View>
                <View style={{ minWidth: '45%' }}>
                  <Text style={{ color: theme.colors.textSecondary, fontSize: 12 }}>Width:</Text>
                  <Text style={{ color: theme.colors.text, fontSize: 14, fontWeight: '600' }}>{store.specs.width}</Text>
                  <Text style={{ color: theme.colors.textSecondary, fontSize: 12 }}> ft</Text>
                </View>
                <View style={{ minWidth: '45%' }}>
                  <Text style={{ color: theme.colors.textSecondary, fontSize: 12 }}>Height:</Text>
                  <Text style={{ color: theme.colors.text, fontSize: 14, fontWeight: '600' }}>{store.specs.height}</Text>
                  <Text style={{ color: theme.colors.textSecondary, fontSize: 12 }}> ft</Text>
                </View>
                <View style={{ width: '100%' }}>
                  <Text style={{ color: theme.colors.textSecondary, fontSize: 12 }}>Board Size:</Text>
                  <View style={{ flexDirection: 'row' }}>
                    <Text style={{ color: theme.colors.text, fontSize: 14, fontWeight: '600' }}>{store.specs.boardSize || '-'}</Text>
                    <Text style={{ color: theme.colors.textSecondary, fontSize: 12 }}> sq.ft</Text>
                  </View>
                </View>
              </View>
            </View>
          )}

          {/* Cost Breakdown */}
          {(store.commercials || store.costDetails) && (
            <View style={{ 
              backgroundColor: theme.colors.surface, 
              borderRadius: 12, 
              padding: 16, 
              marginBottom: 12,
              borderWidth: 1,
              borderColor: theme.colors.border
            }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                <IndianRupee size={20} color="#10B981" />
                <Text style={{ fontSize: 16, fontWeight: 'bold', color: theme.colors.text, marginLeft: 8 }}>
                  Cost Details
                </Text>
              </View>
              
              <View style={{ gap: 8 }}>
                {store.costDetails?.boardRate && (
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <Text style={{ color: theme.colors.textSecondary, fontSize: 12 }}>Board Rate:</Text>
                    <View style={{ flexDirection: 'row' }}>
                      <Text style={{ color: theme.colors.text, fontSize: 12, fontWeight: '600' }}>₹{store.costDetails.boardRate}</Text>
                      <Text style={{ color: theme.colors.textSecondary, fontSize: 12 }}>/sq.ft</Text>
                    </View>
                  </View>
                )}
                {store.costDetails?.totalBoardCost && (
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <Text style={{ color: theme.colors.textSecondary, fontSize: 12 }}>Board Cost:</Text>
                    <Text style={{ color: theme.colors.text, fontSize: 12, fontWeight: '600' }}>₹{store.costDetails.totalBoardCost.toLocaleString()}</Text>
                  </View>
                )}
                {store.costDetails?.angleCharges && (
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <Text style={{ color: theme.colors.textSecondary, fontSize: 12 }}>Angle:</Text>
                    <Text style={{ color: theme.colors.text, fontSize: 12, fontWeight: '600' }}>₹{store.costDetails.angleCharges}</Text>
                  </View>
                )}
                {store.costDetails?.scaffoldingCharges && (
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <Text style={{ color: theme.colors.textSecondary, fontSize: 12 }}>Scaffolding:</Text>
                    <Text style={{ color: theme.colors.text, fontSize: 12, fontWeight: '600' }}>₹{store.costDetails.scaffoldingCharges}</Text>
                  </View>
                )}
                {store.costDetails?.transportation && (
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <Text style={{ color: theme.colors.textSecondary, fontSize: 12 }}>Transport:</Text>
                    <Text style={{ color: theme.colors.text, fontSize: 12, fontWeight: '600' }}>₹{store.costDetails.transportation}</Text>
                  </View>
                )}
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingTop: 8, borderTopWidth: 1, borderTopColor: theme.colors.border }}>
                  <Text style={{ color: '#10B981', fontSize: 14, fontWeight: 'bold' }}>Total Cost:</Text>
                  <Text style={{ color: '#10B981', fontSize: 14, fontWeight: 'bold' }}>₹{store.commercials?.totalCost?.toLocaleString() || '0'}</Text>
                </View>
              </View>
            </View>
          )}
        </View>

        {/* Workflow Information */}
        <View style={{ 
          backgroundColor: theme.colors.surface, 
          borderRadius: 12, 
          padding: 16, 
          marginBottom: 16,
          borderWidth: 1,
          borderColor: theme.colors.border
        }}>
          <Text style={{ fontSize: 18, fontWeight: 'bold', color: theme.colors.text, marginBottom: 16 }}>
            Workflow Status
          </Text>
          
          <View style={{ gap: 16 }}>
            {/* Recce Information */}
            {store.workflow.recceAssignedTo && (
              <View>
                <Text style={{ color: theme.colors.primary, fontSize: 14, fontWeight: '600', marginBottom: 8 }}>
                  Recce Assigned To
                </Text>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <View style={{ 
                    width: 40, 
                    height: 40, 
                    borderRadius: 20, 
                    backgroundColor: theme.colors.primary + '20',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: 12
                  }}>
                    <User size={20} color={theme.colors.primary} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: theme.colors.text, fontSize: 14, fontWeight: '600' }}>
                      {store.workflow.recceAssignedTo.name}
                    </Text>
                    {store.workflow.recceAssignedTo.email && (
                      <Text style={{ color: theme.colors.textSecondary, fontSize: 12 }}>
                        {store.workflow.recceAssignedTo.email}
                      </Text>
                    )}
                  </View>
                </View>
                {store.workflow.recceSubmittedAt && (
                  <Text style={{ color: theme.colors.textSecondary, fontSize: 12, marginTop: 8 }}>
                    Submitted: {formatDate(store.workflow.recceSubmittedAt)}
                  </Text>
                )}
              </View>
            )}

            {/* Installation Information */}
            {store.workflow.installationAssignedTo && (
              <View>
                <Text style={{ color: theme.colors.primary, fontSize: 14, fontWeight: '600', marginBottom: 8 }}>
                  Installation Assigned To
                </Text>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <View style={{ 
                    width: 40, 
                    height: 40, 
                    borderRadius: 20, 
                    backgroundColor: theme.colors.primary + '20',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: 12
                  }}>
                    <User size={20} color={theme.colors.primary} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: theme.colors.text, fontSize: 14, fontWeight: '600' }}>
                      {store.workflow.installationAssignedTo.name}
                    </Text>
                    {store.workflow.installationAssignedTo.email && (
                      <Text style={{ color: theme.colors.textSecondary, fontSize: 12 }}>
                        {store.workflow.installationAssignedTo.email}
                      </Text>
                    )}
                  </View>
                </View>
                {store.workflow.installationSubmittedAt && (
                  <Text style={{ color: theme.colors.textSecondary, fontSize: 12, marginTop: 8 }}>
                    Submitted: {formatDate(store.workflow.installationSubmittedAt)}
                  </Text>
                )}
              </View>
            )}
          </View>
        </View>

        {/* Recce Details with Images */}
        {store.recce && (
          <View style={{
            backgroundColor: theme.colors.surface,
            borderRadius: 12,
            padding: 16,
            marginBottom: 16,
            borderWidth: 1,
            borderColor: theme.colors.border
          }}>
            <Text style={{ fontSize: 18, fontWeight: 'bold', color: theme.colors.text, marginBottom: 16 }}>
              Recce Details
            </Text>
            
            {store.recce.submittedDate && (
              <View style={{ marginBottom: 16 }}>
                <Text style={{ color: theme.colors.textSecondary, fontSize: 12 }}>Submitted:</Text>
                <Text style={{ color: theme.colors.text, fontSize: 14, fontWeight: '600' }}>
                  {formatDate(store.recce.submittedDate)}
                </Text>
              </View>
            )}
            
            {store.recce.notes && (
              <View style={{ marginBottom: 16 }}>
                <Text style={{ color: theme.colors.textSecondary, fontSize: 12 }}>Notes:</Text>
                <Text style={{ color: theme.colors.text, fontSize: 14, marginTop: 4 }}>
                  {store.recce.notes}
                </Text>
              </View>
            )}
            
            {/* Initial Photos */}
            {store.recce.photos && (
              <View style={{ marginBottom: 16 }}>
                <ImageGallery 
                  images={[store.recce.photos.front, store.recce.photos.side, store.recce.photos.closeUp].filter(Boolean)}
                  title="Initial Photos"
                  columns={3}
                />
              </View>
            )}
          </View>
        )}
        
        {/* Installation Details with Images */}
        {store.installation && (
          <View style={{
            backgroundColor: theme.colors.surface,
            borderRadius: 12,
            padding: 16,
            marginBottom: 16,
            borderWidth: 1,
            borderColor: theme.colors.border
          }}>
            <Text style={{ fontSize: 18, fontWeight: 'bold', color: theme.colors.text, marginBottom: 16 }}>
              Installation Details
            </Text>
            
            {store.installation.submittedDate && (
              <View style={{ marginBottom: 16 }}>
                <Text style={{ color: theme.colors.textSecondary, fontSize: 12 }}>Completed:</Text>
                <Text style={{ color: theme.colors.text, fontSize: 14, fontWeight: '600' }}>
                  {formatDate(store.installation.submittedDate)}
                </Text>
              </View>
            )}
            
            {store.installation.photos && (
              <ImageGallery 
                images={[store.installation.photos.after1, store.installation.photos.after2].filter(Boolean)}
                title="Installation Photos"
                columns={2}
              />
            )}
          </View>
        )}
        <View style={{ 
          backgroundColor: theme.colors.surface, 
          borderRadius: 12, 
          padding: 16, 
          marginBottom: 16,
          borderWidth: 1,
          borderColor: theme.colors.border
        }}>
          <Text style={{ fontSize: 18, fontWeight: 'bold', color: theme.colors.text, marginBottom: 16 }}>
            Store Information
          </Text>
          
          <View style={{ gap: 12 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Calendar size={20} color={theme.colors.primary} />
              <View style={{ marginLeft: 12, flex: 1 }}>
                <Text style={{ color: theme.colors.textSecondary, fontSize: 12 }}>Created</Text>
                <Text style={{ color: theme.colors.text, fontSize: 14, fontWeight: '600' }}>
                  {formatDate(store.createdAt)}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    );
}