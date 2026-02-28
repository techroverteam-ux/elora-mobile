import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Image, Alert } from 'react-native';
import { ArrowLeft, MapPin, Building2, Package, FileSpreadsheet, IndianRupee, Camera, Ruler, FileText, CheckCircle2, Loader2, ImageIcon } from 'lucide-react-native';
import { useTheme } from '../../context/ThemeContext';
import { storeAPI } from '../../lib/api';
import Toast from 'react-native-toast-message';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface InstallationDetailProps {
  route: {
    params: {
      storeId: string;
    };
  };
  navigation: {
    goBack: () => void;
  };
}

interface Store {
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
    coordinates?: { lat: number; lng: number };
  };
  contact?: {
    personName?: string;
    mobile?: string;
  };
  currentStatus: string;
  specs?: {
    type?: string;
    qty?: number;
    width: number;
    height: number;
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
}

export default function InstallationDetailScreen({ route, navigation }: InstallationDetailProps) {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const { storeId } = route.params;
  const [store, setStore] = useState<Store | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const API_BASE_URL = 'https://elora-api-smoky.vercel.app';

  useEffect(() => {
    fetchStoreDetail();
  }, [storeId]);

  const fetchStoreDetail = async () => {
    try {
      setLoading(true);
      const { data } = await storeAPI.getStoreById(storeId);
      setStore(data.store);
    } catch (error) {
      console.error('Error fetching store detail:', error);
      Toast.show({ type: 'error', text1: 'Failed to load store details' });
      navigation.goBack();
    } finally {
      setLoading(false);
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

  const getPhotoUrl = (path: string | undefined) => {
    if (!path) return null;
    const cleanPath = path.startsWith('/') || path.startsWith('\\') ? path.slice(1) : path;
    return `${API_BASE_URL}/${cleanPath.replace(/\\/g, '/')}`;
  };

  const handleCompleteInstallation = async () => {
    Alert.alert(
      'Complete Installation',
      'Are you sure you want to mark this installation as complete?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Complete',
          onPress: async () => {
            setSubmitting(true);
            try {
              await storeAPI.completeInstallation(storeId);
              Toast.show({ type: 'success', text1: 'Installation marked as complete!' });
              navigation.goBack();
            } catch (error: any) {
              Toast.show({ 
                type: 'error', 
                text1: error.response?.data?.message || 'Failed to complete installation' 
              });
            } finally {
              setSubmitting(false);
            }
          }
        }
      ]
    );
  };

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.colors.background, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={{ color: theme.colors.textSecondary, marginTop: 16 }}>Loading installation details...</Text>
      </View>
    );
  }

  if (!store) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.colors.background, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ color: theme.colors.textSecondary, fontSize: 16 }}>Store not found</Text>
      </View>
    );
  }

  const isCompleted = store.installation && store.installation.submittedDate;

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
            <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#FFFFFF' }}>{store.storeName}</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
              <Text style={{ fontSize: 12, color: 'rgba(255,255,255,0.8)', marginRight: 8 }}>
                {store.storeId || store.dealerCode}
              </Text>
              <View style={{ 
                backgroundColor: 'rgba(255,255,255,0.2)', 
                paddingHorizontal: 8, 
                paddingVertical: 2, 
                borderRadius: 12 
              }}>
                <Text style={{ fontSize: 10, color: '#FFFFFF', fontWeight: '600' }}>
                  {store.currentStatus.replace(/_/g, ' ')}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16 }}>
        {/* Store Details Grid */}
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
                <MapPin size={20} color="#10B981" />
                <Text style={{ fontSize: 14, fontWeight: 'bold', color: theme.colors.text, marginLeft: 8 }}>
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
            
            <View style={{ gap: 4 }}>
              <Text style={{ color: theme.colors.textSecondary, fontSize: 12 }}>
                <Text style={{ fontWeight: '600' }}>Zone:</Text> {store.location.zone || '-'}
              </Text>
              <Text style={{ color: theme.colors.textSecondary, fontSize: 12 }}>
                <Text style={{ fontWeight: '600' }}>State:</Text> {store.location.state || '-'}
              </Text>
              <Text style={{ color: theme.colors.textSecondary, fontSize: 12 }}>
                <Text style={{ fontWeight: '600' }}>District:</Text> {store.location.district || '-'}
              </Text>
              <Text style={{ color: theme.colors.textSecondary, fontSize: 12 }}>
                <Text style={{ fontWeight: '600' }}>City:</Text> {store.location.city || '-'}
              </Text>
              {store.location.address && (
                <View style={{ paddingTop: 8, borderTopWidth: 1, borderTopColor: theme.colors.border }}>
                  <Text style={{ color: theme.colors.textSecondary, fontSize: 12, fontWeight: '600' }}>Address:</Text>
                  <Text style={{ color: theme.colors.text, fontSize: 12, marginTop: 2 }}>{store.location.address}</Text>
                </View>
              )}
            </View>
          </View>

          {/* Dealer Info & Commercial in Row */}
          <View style={{ flexDirection: 'row', gap: 12, marginBottom: 12 }}>
            {/* Dealer Info Card */}
            <View style={{ 
              flex: 1,
              backgroundColor: theme.colors.surface, 
              borderRadius: 12, 
              padding: 16, 
              borderWidth: 1,
              borderColor: theme.colors.border
            }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                <Building2 size={20} color="#10B981" />
                <Text style={{ fontSize: 14, fontWeight: 'bold', color: theme.colors.text, marginLeft: 8 }}>
                  Dealer Info
                </Text>
              </View>
              
              <View style={{ gap: 4 }}>
                <Text style={{ color: theme.colors.textSecondary, fontSize: 12 }}>
                  <Text style={{ fontWeight: '600' }}>Code:</Text> {store.dealerCode}
                </Text>
                <Text style={{ color: theme.colors.textSecondary, fontSize: 12 }}>
                  <Text style={{ fontWeight: '600' }}>Vendor:</Text> {store.vendorCode || '-'}
                </Text>
                <Text style={{ color: theme.colors.textSecondary, fontSize: 12 }}>
                  <Text style={{ fontWeight: '600' }}>Contact:</Text> {store.contact?.personName || '-'}
                </Text>
                <Text style={{ color: theme.colors.textSecondary, fontSize: 12 }}>
                  <Text style={{ fontWeight: '600' }}>Mobile:</Text> {store.contact?.mobile || '-'}
                </Text>
              </View>
            </View>

            {/* Commercial Details Card */}
            <View style={{ 
              flex: 1,
              backgroundColor: theme.colors.surface, 
              borderRadius: 12, 
              padding: 16, 
              borderWidth: 1,
              borderColor: theme.colors.border
            }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                <FileSpreadsheet size={20} color="#10B981" />
                <Text style={{ fontSize: 14, fontWeight: 'bold', color: theme.colors.text, marginLeft: 8 }}>
                  Commercial
                </Text>
              </View>
              
              <View style={{ gap: 4 }}>
                <Text style={{ color: theme.colors.textSecondary, fontSize: 12 }}>
                  <Text style={{ fontWeight: '600' }}>PO Number:</Text> {store.commercials?.poNumber || '-'}
                </Text>
                <Text style={{ color: theme.colors.textSecondary, fontSize: 12 }}>
                  <Text style={{ fontWeight: '600' }}>PO Month:</Text> {store.commercials?.poMonth || '-'}
                </Text>
                <Text style={{ color: theme.colors.textSecondary, fontSize: 12 }}>
                  <Text style={{ fontWeight: '600' }}>Invoice:</Text> {store.commercials?.invoiceNumber || '-'}
                </Text>
              </View>
            </View>
          </View>

          {/* Board Specs & Cost Details in Row */}
          <View style={{ flexDirection: 'row', gap: 12, marginBottom: 16 }}>
            {/* Board Specifications */}
            {store.specs && (
              <View style={{ 
                flex: 1,
                backgroundColor: theme.colors.surface, 
                borderRadius: 12, 
                padding: 16, 
                borderWidth: 1,
                borderColor: theme.colors.border
              }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                  <Package size={20} color="#10B981" />
                  <Text style={{ fontSize: 14, fontWeight: 'bold', color: theme.colors.text, marginLeft: 8 }}>
                    Board Specs
                  </Text>
                </View>
                
                <View style={{ gap: 4 }}>
                  <Text style={{ color: theme.colors.textSecondary, fontSize: 12 }}>
                    <Text style={{ fontWeight: '600' }}>Type:</Text> {store.specs.type || '-'}
                  </Text>
                  <Text style={{ color: theme.colors.textSecondary, fontSize: 12 }}>
                    <Text style={{ fontWeight: '600' }}>Qty:</Text> {store.specs.qty || 1}
                  </Text>
                  <Text style={{ color: theme.colors.textSecondary, fontSize: 12 }}>
                    <Text style={{ fontWeight: '600' }}>Width:</Text> {store.specs.width} ft
                  </Text>
                  <Text style={{ color: theme.colors.textSecondary, fontSize: 12 }}>
                    <Text style={{ fontWeight: '600' }}>Height:</Text> {store.specs.height} ft
                  </Text>
                  <Text style={{ color: theme.colors.textSecondary, fontSize: 12 }}>
                    <Text style={{ fontWeight: '600' }}>Board Size:</Text> {store.specs.boardSize || '-'} sq.ft
                  </Text>
                </View>
              </View>
            )}

            {/* Cost Breakdown */}
            {(store.commercials || store.costDetails) && (
              <View style={{ 
                flex: 1,
                backgroundColor: theme.colors.surface, 
                borderRadius: 12, 
                padding: 16, 
                borderWidth: 1,
                borderColor: theme.colors.border
              }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                  <IndianRupee size={20} color="#10B981" />
                  <Text style={{ fontSize: 14, fontWeight: 'bold', color: theme.colors.text, marginLeft: 8 }}>
                    Cost Details
                  </Text>
                </View>
                
                <View style={{ gap: 4 }}>
                  {store.costDetails?.boardRate && (
                    <Text style={{ color: theme.colors.textSecondary, fontSize: 12 }}>
                      <Text style={{ fontWeight: '600' }}>Board Rate:</Text> ₹{store.costDetails.boardRate}/sq.ft
                    </Text>
                  )}
                  {store.costDetails?.totalBoardCost && (
                    <Text style={{ color: theme.colors.textSecondary, fontSize: 12 }}>
                      <Text style={{ fontWeight: '600' }}>Board Cost:</Text> ₹{store.costDetails.totalBoardCost.toLocaleString()}
                    </Text>
                  )}
                  <Text style={{ color: '#10B981', fontSize: 12, fontWeight: 'bold', marginTop: 4 }}>
                    Total Cost: ₹{store.commercials?.totalCost?.toLocaleString() || '0'}
                  </Text>
                </View>
              </View>
            )}
          </View>
        </View>

        {/* Recce Information Section */}
        {store.recce && (
          <View style={{ marginBottom: 16 }}>
            <View style={{ flexDirection: 'row', gap: 12, marginBottom: 12 }}>
              {/* Recce Measurements */}
              <View style={{ 
                flex: 1,
                backgroundColor: '#3B82F620', 
                borderRadius: 12, 
                padding: 16, 
                borderWidth: 1,
                borderColor: '#3B82F650'
              }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                  <Ruler size={20} color="#3B82F6" />
                  <Text style={{ fontSize: 14, fontWeight: 'bold', color: '#3B82F6', marginLeft: 8 }}>
                    Recce Measurements
                  </Text>
                </View>
                
                <View style={{ gap: 4 }}>
                  <Text style={{ color: '#3B82F6', fontSize: 12 }}>
                    <Text style={{ fontWeight: '600' }}>Width:</Text> {store.recce.sizes?.width || 0} ft
                  </Text>
                  <Text style={{ color: '#3B82F6', fontSize: 12 }}>
                    <Text style={{ fontWeight: '600' }}>Height:</Text> {store.recce.sizes?.height || 0} ft
                  </Text>
                  <Text style={{ color: '#3B82F6', fontSize: 12 }}>
                    <Text style={{ fontWeight: '600' }}>Submitted:</Text> {store.recce.submittedDate ? new Date(store.recce.submittedDate).toLocaleDateString() : '-'}
                  </Text>
                </View>
              </View>

              {/* Recce Notes */}
              <View style={{ 
                flex: 1,
                backgroundColor: '#3B82F620', 
                borderRadius: 12, 
                padding: 16, 
                borderWidth: 1,
                borderColor: '#3B82F650'
              }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                  <FileText size={20} color="#3B82F6" />
                  <Text style={{ fontSize: 14, fontWeight: 'bold', color: '#3B82F6', marginLeft: 8 }}>
                    Recce Notes
                  </Text>
                </View>
                
                <Text style={{ color: '#3B82F6', fontSize: 12 }}>
                  {store.recce.notes || 'No notes provided'}
                </Text>
              </View>
            </View>

            {/* Recce Photos */}
            <View style={{ 
              backgroundColor: '#3B82F620', 
              borderRadius: 12, 
              padding: 16, 
              borderWidth: 1,
              borderColor: '#3B82F650'
            }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                <ImageIcon size={20} color="#3B82F6" />
                <Text style={{ fontSize: 14, fontWeight: 'bold', color: '#3B82F6', marginLeft: 8 }}>
                  Recce Photos (Reference)
                </Text>
              </View>
              
              <View style={{ flexDirection: 'row', gap: 8 }}>
                {['front', 'side', 'closeUp'].map((type) => (
                  <View key={type} style={{ flex: 1, aspectRatio: 1, borderRadius: 8, overflow: 'hidden', backgroundColor: '#3B82F610', borderWidth: 2, borderColor: '#3B82F6' }}>
                    {store.recce?.photos?.[type as keyof typeof store.recce.photos] ? (
                      <Image
                        source={{ uri: getPhotoUrl(store.recce.photos[type as keyof typeof store.recce.photos]) || '' }}
                        style={{ width: '100%', height: '100%' }}
                        resizeMode="cover"
                      />
                    ) : (
                      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                        <ImageIcon size={24} color="#3B82F6" />
                        <Text style={{ color: '#3B82F6', fontSize: 10, marginTop: 4, textTransform: 'capitalize' }}>
                          {type}
                        </Text>
                      </View>
                    )}
                  </View>
                ))}
              </View>
            </View>
          </View>
        )}

        {/* Installation Photos Section */}
        <View style={{ 
          backgroundColor: theme.colors.surface, 
          borderRadius: 12, 
          padding: 16, 
          marginBottom: 16,
          borderWidth: 1,
          borderColor: theme.colors.border
        }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
            <Camera size={20} color="#10B981" />
            <Text style={{ fontSize: 16, fontWeight: 'bold', color: theme.colors.text, marginLeft: 8 }}>
              Installation Photos
            </Text>
          </View>
          
          <View style={{ flexDirection: 'row', gap: 12 }}>
            {['after1', 'after2'].map((type, idx) => (
              <View key={type} style={{ flex: 1, aspectRatio: 1, borderRadius: 8, overflow: 'hidden', backgroundColor: theme.colors.background, borderWidth: 2, borderColor: '#10B981' }}>
                {store.installation?.photos?.[type as keyof typeof store.installation.photos] ? (
                  <Image
                    source={{ uri: getPhotoUrl(store.installation.photos[type as keyof typeof store.installation.photos]) || '' }}
                    style={{ width: '100%', height: '100%' }}
                    resizeMode="cover"
                  />
                ) : (
                  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <Camera size={32} color={theme.colors.textSecondary} />
                    <Text style={{ color: theme.colors.textSecondary, fontSize: 12, marginTop: 8, fontWeight: '600' }}>
                      After View {idx + 1}
                    </Text>
                  </View>
                )}
              </View>
            ))}
          </View>
        </View>

        {/* Action Button */}
        {!isCompleted && (
          <TouchableOpacity
            onPress={handleCompleteInstallation}
            disabled={submitting}
            style={{
              backgroundColor: submitting ? theme.colors.border : '#10B981',
              padding: 16,
              borderRadius: 12,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              shadowColor: '#10B981',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 8
            }}
          >
            {submitting ? (
              <Loader2 size={20} color="#FFFFFF" />
            ) : (
              <CheckCircle2 size={20} color="#FFFFFF" />
            )}
            <Text style={{ color: '#FFFFFF', fontSize: 16, fontWeight: 'bold', marginLeft: 8 }}>
              Complete Installation
            </Text>
          </TouchableOpacity>
        )}

        {/* Completed Status */}
        {isCompleted && (
          <View style={{
            backgroundColor: '#10B98120',
            padding: 16,
            borderRadius: 12,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            borderWidth: 1,
            borderColor: '#10B981'
          }}>
            <CheckCircle2 size={20} color="#10B981" />
            <Text style={{ color: '#10B981', fontSize: 16, fontWeight: 'bold', marginLeft: 8 }}>
              Installation Completed on {store.installation?.submittedDate ? new Date(store.installation.submittedDate).toLocaleDateString() : ''}
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}