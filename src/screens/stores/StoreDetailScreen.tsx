import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, Image, Modal, TextInput, ActivityIndicator } from 'react-native';
import { MapPin, Calendar, User, IndianRupee, Ruler, Phone, Mail, CheckCircle, Clock, AlertCircle, Building2, Package, FileSpreadsheet, UserPlus, CheckSquare, Square, Search, X } from 'lucide-react-native';
import { useTheme } from '../../context/ThemeContext';
import { storeService } from '../../services/storeService';
import { userService } from '../../services/userService';
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
  
  // Assignment modal state
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [assignStage, setAssignStage] = useState<'RECCE' | 'INSTALLATION'>('INSTALLATION');
  const [availableUsers, setAvailableUsers] = useState<any[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<any[]>([]);
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [selectedUserId, setSelectedUserId] = useState('');
  const [isAssigning, setIsAssigning] = useState(false);

  useEffect(() => {
    fetchStoreDetail();
  }, [storeId]);

  // Filter users based on search term
  useEffect(() => {
    if (!userSearchTerm) {
      setFilteredUsers(availableUsers);
    } else {
      const filtered = availableUsers.filter(user => 
        user.name.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(userSearchTerm.toLowerCase())
      );
      setFilteredUsers(filtered);
    }
  }, [userSearchTerm, availableUsers]);

  const fetchStoreDetail = async () => {
    try {
      setLoading(true);
      const response = await storeService.getById(storeId);
      // Handle different response structures
      const storeData = response.store || response.data?.store || response.data || response;
      setStore(storeData);
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

  const openAssignModal = async (stage: 'RECCE' | 'INSTALLATION') => {
    setAssignStage(stage);
    setSelectedUserId('');
    setUserSearchTerm('');
    
    try {
      const roleCode = stage === 'RECCE' ? 'RECCE' : 'INSTALLATION';
      const data = await userService.getByRole(roleCode);
      setAvailableUsers(data.users || []);
      setFilteredUsers(data.users || []);
      setIsAssignModalOpen(true);
    } catch (error) {
      Toast.show({ type: 'error', text1: `Failed to fetch ${stage} users` });
      setAvailableUsers([]);
      setFilteredUsers([]);
    }
  };

  const handleAssign = async () => {
    if (!selectedUserId) {
      Toast.show({ type: 'error', text1: 'Please select a user' });
      return;
    }
    
    setIsAssigning(true);
    try {
      await storeService.assign([storeId], selectedUserId, assignStage);
      Toast.show({ type: 'success', text1: 'Assignment successful!' });
      setIsAssignModalOpen(false);
      fetchStoreDetail(); // Refresh store data
    } catch (error: any) {
      Toast.show({ type: 'error', text1: error.response?.data?.message || 'Assignment failed' });
    } finally {
      setIsAssigning(false);
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
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <ScrollView contentContainerStyle={{ padding: 16 }}>
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
            {store.workflow.installationAssignedTo ? (
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
            ) : (
              // Show assign installation button if recce is approved but no installation assigned
              store.currentStatus === 'RECCE_APPROVED' && (
                <View style={{ alignItems: 'center', padding: 20 }}>
                  <User size={32} color={theme.colors.textSecondary} style={{ opacity: 0.5, marginBottom: 12 }} />
                  <Text style={{ color: theme.colors.textSecondary, fontSize: 14, fontWeight: '600', marginBottom: 8 }}>
                    No Installation Assigned
                  </Text>
                  <Text style={{ color: theme.colors.textSecondary, fontSize: 12, textAlign: 'center', marginBottom: 16 }}>
                    Assign an installation user to proceed with the next phase
                  </Text>
                  <TouchableOpacity
                    onPress={() => openAssignModal('INSTALLATION')}
                    style={{
                      backgroundColor: '#10B981',
                      paddingHorizontal: 16,
                      paddingVertical: 10,
                      borderRadius: 8,
                      flexDirection: 'row',
                      alignItems: 'center'
                    }}
                  >
                    <UserPlus size={16} color="#FFF" />
                    <Text style={{ color: '#FFF', marginLeft: 8, fontWeight: '600' }}>Assign Installation</Text>
                  </TouchableOpacity>
                </View>
              )
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
            {store.recce.initialPhotos && store.recce.initialPhotos.length > 0 && (
              <View style={{ marginBottom: 16 }}>
                <ImageGallery 
                  images={store.recce.initialPhotos}
                  title="Initial Photos"
                  columns={3}
                />
              </View>
            )}
            
            {/* Recce Photos with Approval */}
            {store.recce.reccePhotos && store.recce.reccePhotos.length > 0 && (
              <View>
                <Text style={{ fontSize: 16, fontWeight: '600', color: theme.colors.text, marginBottom: 12 }}>
                  Recce Photos with Measurements
                </Text>
                {store.recce.reccePhotos.map((photo: any, index: number) => (
                  <View key={index} style={{
                    backgroundColor: theme.colors.background,
                    borderRadius: 8,
                    padding: 12,
                    marginBottom: 12,
                    borderWidth: 1,
                    borderColor: theme.colors.border
                  }}>
                    <Text style={{ fontSize: 14, fontWeight: '600', color: theme.colors.text, marginBottom: 8 }}>
                      Photo {index + 1}
                    </Text>
                    
                    <View style={{ flexDirection: 'row', gap: 12, marginBottom: 8 }}>
                      <View style={{ flex: 1 }}>
                        <Image
                          source={{ uri: imageService.getFullImageUrl(photo.photo) }}
                          style={{ width: '100%', height: 120, borderRadius: 6 }}
                          resizeMode="cover"
                        />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={{ color: theme.colors.textSecondary, fontSize: 11 }}>Measurements:</Text>
                        <Text style={{ color: theme.colors.text, fontSize: 13, fontWeight: '600' }}>
                          {photo.measurements?.width} × {photo.measurements?.height} {photo.measurements?.unit}
                        </Text>
                        {photo.elements && photo.elements.length > 0 && (
                          <>
                            <Text style={{ color: theme.colors.textSecondary, fontSize: 11, marginTop: 4 }}>Element:</Text>
                            <Text style={{ color: theme.colors.text, fontSize: 12 }}>
                              {photo.elements[0].elementName}
                            </Text>
                          </>
                        )}
                      </View>
                    </View>
                    
                    <PhotoApproval
                      storeId={storeId}
                      photoIndex={index}
                      photoUrl={imageService.getFullImageUrl(photo.photo)}
                      currentStatus={photo.approvalStatus}
                      rejectionReason={photo.rejectionReason}
                      onStatusChange={fetchStoreDetail}
                    />
                  </View>
                ))}
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
            
            {store.installation.photos && store.installation.photos.length > 0 && (
              <ImageGallery 
                images={store.installation.photos.map((p: any) => p.installationPhoto)}
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
      
      <Modal
        visible={isAssignModalOpen}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsAssignModalOpen(false)}
      >
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}>
          <View style={{ 
            backgroundColor: theme.colors.background, 
            borderTopLeftRadius: 20, 
            borderTopRightRadius: 20, 
            maxHeight: '80%',
            paddingBottom: 20
          }}>
            <View style={{ padding: 20 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <Text style={{ fontSize: 18, fontWeight: 'bold', color: theme.colors.text }}>
                  Assign {assignStage}
                </Text>
                <TouchableOpacity onPress={() => setIsAssignModalOpen(false)}>
                  <X size={24} color={theme.colors.text} />
                </TouchableOpacity>
              </View>
              
              <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: theme.colors.surface, borderRadius: 8, paddingHorizontal: 12, borderWidth: 1, borderColor: theme.colors.border, marginBottom: 16 }}>
                <Search size={16} color={theme.colors.textSecondary} />
                <TextInput
                  style={{ flex: 1, paddingVertical: 10, paddingHorizontal: 8, color: theme.colors.text, fontSize: 14 }}
                  placeholder="Search by name or email..."
                  placeholderTextColor={theme.colors.textSecondary}
                  value={userSearchTerm}
                  onChangeText={setUserSearchTerm}
                />
              </View>
              
              <ScrollView style={{ maxHeight: 300 }}>
                {filteredUsers.map(user => (
                  <TouchableOpacity
                    key={user._id}
                    onPress={() => setSelectedUserId(user._id)}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      padding: 12,
                      borderRadius: 8,
                      marginBottom: 8,
                      backgroundColor: selectedUserId === user._id ? theme.colors.primary + '20' : theme.colors.surface,
                      borderWidth: 1,
                      borderColor: selectedUserId === user._id ? theme.colors.primary : theme.colors.border
                    }}
                  >
                    <View style={{
                      width: 40,
                      height: 40,
                      borderRadius: 20,
                      backgroundColor: selectedUserId === user._id ? theme.colors.primary : theme.colors.border,
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginRight: 12
                    }}>
                      <Text style={{
                        color: selectedUserId === user._id ? '#FFF' : theme.colors.text,
                        fontWeight: 'bold'
                      }}>
                        {user.name?.charAt(0)?.toUpperCase() || 'U'}
                      </Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{ color: theme.colors.text, fontWeight: '600' }}>{user.name}</Text>
                      <Text style={{ color: theme.colors.textSecondary, fontSize: 12 }}>{user.email}</Text>
                    </View>
                    {selectedUserId === user._id && (
                      <CheckSquare size={20} color={theme.colors.primary} />
                    )}
                  </TouchableOpacity>
                ))}
                {filteredUsers.length === 0 && (
                  <View style={{ alignItems: 'center', padding: 20 }}>
                    <User size={32} color={theme.colors.textSecondary} style={{ opacity: 0.5, marginBottom: 8 }} />
                    <Text style={{ color: theme.colors.textSecondary, fontSize: 14 }}>No users found</Text>
                  </View>
                )}
              </ScrollView>
              
              <View style={{ flexDirection: 'row', gap: 12, marginTop: 16 }}>
                <TouchableOpacity
                  onPress={() => setIsAssignModalOpen(false)}
                  style={{ flex: 1, padding: 12, borderRadius: 8, backgroundColor: theme.colors.surface, alignItems: 'center' }}
                >
                  <Text style={{ color: theme.colors.text, fontWeight: '600' }}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleAssign}
                  disabled={!selectedUserId || isAssigning}
                  style={{
                    flex: 1,
                    padding: 12,
                    borderRadius: 8,
                    backgroundColor: (!selectedUserId || isAssigning) ? theme.colors.border : theme.colors.primary,
                    alignItems: 'center',
                    flexDirection: 'row',
                    justifyContent: 'center'
                  }}
                >
                  {isAssigning ? (
                    <ActivityIndicator size="small" color="#FFF" />
                  ) : (
                    <UserPlus size={16} color="#FFF" />
                  )}
                  <Text style={{ color: '#FFF', fontWeight: '600', marginLeft: 8 }}>
                    {isAssigning ? 'Assigning...' : 'Assign'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}