import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Image, TextInput, Alert } from 'react-native';
import { MapPin, Building2, Package, FileSpreadsheet, IndianRupee, Camera, Ruler, FileText, CheckCircle2, Loader2 } from 'lucide-react-native';
import { useTheme } from '../../context/ThemeContext';
import { storeAPI } from '../../lib/api';
import Toast from 'react-native-toast-message';

interface RecceDetailProps {
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
}

export default function RecceDetailScreen({ route, navigation }: RecceDetailProps) {
  const { theme } = useTheme();
  const { storeId } = route.params;
  const [store, setStore] = useState<Store | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [width, setWidth] = useState('');
  const [height, setHeight] = useState('');
  const [unit, setUnit] = useState('ft');
  const [notes, setNotes] = useState('');

  const API_BASE_URL = 'https://elora-api-smoky.vercel.app';

  useEffect(() => {
    fetchStoreDetail();
  }, [storeId]);

  const fetchStoreDetail = async () => {
    try {
      setLoading(true);
      const { data } = await storeAPI.getStoreById(storeId);
      const s = data.store;
      setStore(s);

      // Pre-fill form if recce already submitted
      if (s.recce && s.recce.submittedDate) {
        if (s.recce.sizes) {
          setWidth(String(s.recce.sizes.width));
          setHeight(String(s.recce.sizes.height));
          setUnit(s.recce.sizes.unit || 'ft');
        }
        if (s.recce.notes) {
          setNotes(s.recce.notes);
        }
      } else {
        // Pre-fill with existing specs if available
        if (s.specs?.boardSize) {
          const parts = s.specs.boardSize.toLowerCase().split('x');
          if (parts.length === 2) {
            setWidth(parts[0].trim());
            setHeight(parts[1].trim());
          }
        }
      }
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

  const handleSubmit = async () => {
    if (!width || !height) {
      Toast.show({ type: 'error', text1: 'Please enter board dimensions' });
      return;
    }

    Alert.alert(
      'Submit Recce',
      'Are you sure you want to submit this recce report?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Submit',
          onPress: async () => {
            setSubmitting(true);
            try {
              const formData = new FormData();
              formData.append('width', width);
              formData.append('height', height);
              formData.append('unit', unit);
              formData.append('notes', notes);

              await storeAPI.submitRecce(storeId, {
                width: parseFloat(width),
                height: parseFloat(height),
                unit,
                notes
              });

              Toast.show({ type: 'success', text1: 'Recce submitted successfully!' });
              navigation.goBack();
            } catch (error: any) {
              Toast.show({ 
                type: 'error', 
                text1: error.response?.data?.message || 'Submission failed' 
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
        <Text style={{ color: theme.colors.textSecondary, marginTop: 16 }}>Loading recce details...</Text>
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

  const isSubmitted = store.recce && store.recce.submittedDate;

  return (
    <ScrollView style={{ flex: 1, backgroundColor: theme.colors.background }} contentContainerStyle={{ padding: 16 }}>
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
                <MapPin size={20} color="#F59E0B" />
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
                <Building2 size={20} color="#F59E0B" />
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
                <FileSpreadsheet size={20} color="#F59E0B" />
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
                  <Package size={20} color="#F59E0B" />
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
                  <IndianRupee size={20} color="#F59E0B" />
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

        {/* Recce Form */}
        <View style={{ gap: 16 }}>
          {/* Measurements Section */}
          <View style={{ 
            backgroundColor: theme.colors.surface, 
            borderRadius: 12, 
            padding: 16, 
            borderWidth: 1,
            borderColor: theme.colors.border
          }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
              <Ruler size={20} color="#F59E0B" />
              <Text style={{ fontSize: 16, fontWeight: 'bold', color: theme.colors.text, marginLeft: 8 }}>
                Measurements
              </Text>
            </View>
            
            <View style={{ flexDirection: 'row', gap: 12, marginBottom: 16 }}>
              <View style={{ flex: 1 }}>
                <Text style={{ color: theme.colors.textSecondary, fontSize: 12, marginBottom: 4, fontWeight: '600' }}>
                  Width
                </Text>
                <TextInput
                  style={{ 
                    backgroundColor: theme.colors.background, 
                    borderWidth: 1, 
                    borderColor: theme.colors.border, 
                    borderRadius: 8, 
                    padding: 12, 
                    color: theme.colors.text, 
                    fontSize: 16, 
                    fontWeight: 'bold' 
                  }}
                  value={width}
                  onChangeText={setWidth}
                  placeholder="0.0"
                  placeholderTextColor={theme.colors.textSecondary}
                  keyboardType="numeric"
                  editable={!isSubmitted}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ color: theme.colors.textSecondary, fontSize: 12, marginBottom: 4, fontWeight: '600' }}>
                  Height
                </Text>
                <TextInput
                  style={{ 
                    backgroundColor: theme.colors.background, 
                    borderWidth: 1, 
                    borderColor: theme.colors.border, 
                    borderRadius: 8, 
                    padding: 12, 
                    color: theme.colors.text, 
                    fontSize: 16, 
                    fontWeight: 'bold' 
                  }}
                  value={height}
                  onChangeText={setHeight}
                  placeholder="0.0"
                  placeholderTextColor={theme.colors.textSecondary}
                  keyboardType="numeric"
                  editable={!isSubmitted}
                />
              </View>
            </View>
            
            <View>
              <Text style={{ color: theme.colors.textSecondary, fontSize: 12, marginBottom: 4, fontWeight: '600' }}>
                Unit
              </Text>
              <View style={{ 
                backgroundColor: theme.colors.background, 
                borderWidth: 1, 
                borderColor: theme.colors.border, 
                borderRadius: 8, 
                padding: 12 
              }}>
                <Text style={{ color: theme.colors.text, fontSize: 14, fontWeight: '600' }}>
                  {unit === 'ft' ? 'Feet (ft)' : 'Meters (m)'}
                </Text>
              </View>
            </View>
          </View>

          {/* Notes Section */}
          <View style={{ 
            backgroundColor: theme.colors.surface, 
            borderRadius: 12, 
            padding: 16, 
            borderWidth: 1,
            borderColor: theme.colors.border
          }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
              <FileText size={20} color="#F59E0B" />
              <Text style={{ fontSize: 16, fontWeight: 'bold', color: theme.colors.text, marginLeft: 8 }}>
                Remarks
              </Text>
            </View>
            
            <TextInput
              style={{ 
                backgroundColor: theme.colors.background, 
                borderWidth: 1, 
                borderColor: theme.colors.border, 
                borderRadius: 8, 
                padding: 12, 
                color: theme.colors.text, 
                fontSize: 14, 
                minHeight: 80, 
                textAlignVertical: 'top' 
              }}
              value={notes}
              onChangeText={setNotes}
              placeholder="Any obstruction? Electrical issues?"
              placeholderTextColor={theme.colors.textSecondary}
              multiline
              editable={!isSubmitted}
            />
          </View>

          {/* Site Photos Section */}
          {store.recce?.photos && (
            <View style={{ 
              backgroundColor: theme.colors.surface, 
              borderRadius: 12, 
              padding: 16, 
              borderWidth: 1,
              borderColor: theme.colors.border
            }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
                <Camera size={20} color="#F59E0B" />
                <Text style={{ fontSize: 16, fontWeight: 'bold', color: theme.colors.text, marginLeft: 8 }}>
                  Site Photos
                </Text>
              </View>
              
              <View style={{ flexDirection: 'row', gap: 8 }}>
                {['front', 'side', 'closeUp'].map((type) => (
                  <View key={type} style={{ flex: 1, aspectRatio: 1, borderRadius: 8, overflow: 'hidden', backgroundColor: theme.colors.background }}>
                    {store.recce?.photos?.[type as keyof typeof store.recce.photos] ? (
                      <Image
                        source={{ uri: `${API_BASE_URL}/${store.recce.photos[type as keyof typeof store.recce.photos]}` }}
                        style={{ width: '100%', height: '100%' }}
                        resizeMode="cover"
                      />
                    ) : (
                      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                        <Camera size={24} color={theme.colors.textSecondary} />
                        <Text style={{ color: theme.colors.textSecondary, fontSize: 10, marginTop: 4, textTransform: 'capitalize' }}>
                          {type}
                        </Text>
                      </View>
                    )}
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Submit Button */}
          {!isSubmitted && (
            <TouchableOpacity
              onPress={handleSubmit}
              disabled={submitting}
              style={{
                backgroundColor: submitting ? theme.colors.border : '#F59E0B',
                padding: 16,
                borderRadius: 12,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                shadowColor: '#F59E0B',
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
                Submit Recce Report
              </Text>
            </TouchableOpacity>
          )}

          {/* Submitted Status */}
          {isSubmitted && (
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
                Recce Submitted on {store.recce?.submittedDate ? new Date(store.recce.submittedDate).toLocaleDateString() : ''}
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    );
}