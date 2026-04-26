import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, FlatList, TouchableOpacity, TextInput, RefreshControl, ActivityIndicator, Modal, Alert } from 'react-native';
import { Search, FileSpreadsheet, Eye, CheckSquare, Square, Filter, ChevronLeft, ChevronRight, X } from 'lucide-react-native';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { storeService } from '../../services/storeService';
import { rfqService } from '../../services/rfqService';
import { fileService } from '../../services/fileService';
import { modernDownloadService } from '../../services/modernDownloadService';
import DownloadButton from '../../components/DownloadButton';
import Toast from 'react-native-toast-message';

interface RFQScreenProps {
  navigation?: {
    navigate: (screenName: string, params?: any) => void;
  };
}

interface Store {
  _id: string;
  storeId?: string;
  dealerCode: string;
  storeName: string;
  clientCode?: string;
  vendorCode?: string;
  location: {
    city: string;
    state?: string;
    zone?: string;
    district?: string;
  };
  commercials?: {
    poNumber?: string;
    invoiceNumber?: string;
  };
  currentStatus: string;
}

enum StoreStatus {
  UPLOADED = 'UPLOADED',
  RECCE_ASSIGNED = 'RECCE_ASSIGNED',
  RECCE_SUBMITTED = 'RECCE_SUBMITTED',
  RECCE_APPROVED = 'RECCE_APPROVED',
  INSTALLATION_ASSIGNED = 'INSTALLATION_ASSIGNED',
  INSTALLATION_SUBMITTED = 'INSTALLATION_SUBMITTED',
  COMPLETED = 'COMPLETED'
}

export default function RFQScreen({ navigation }: RFQScreenProps = {}) {
  const { theme } = useTheme();
  const { user } = useAuth();
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedStoreIds, setSelectedStoreIds] = useState<Set<string>>(new Set());
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Enhanced Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [filterZone, setFilterZone] = useState('');
  const [filterState, setFilterState] = useState('');
  const [filterDistrict, setFilterDistrict] = useState('');
  const [filterVendorCode, setFilterVendorCode] = useState('');
  const [filterDealerCode, setFilterDealerCode] = useState('');
  const [filterPONumber, setFilterPONumber] = useState('');
  const [filterInvoiceNo, setFilterInvoiceNo] = useState('');
  const [filterClientCode, setFilterClientCode] = useState('');
  const [filterCity, setFilterCity] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  
  // Pagination
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalStores, setTotalStores] = useState(0);
  
  // Role-based access
  const isAdmin = useMemo(() => {
    if (!user || !user.roles || !Array.isArray(user.roles)) return false;
    return user.roles.some((role) => 
      role?.code === "SUPER_ADMIN" || role?.code === "ADMIN"
    );
  }, [user]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    fetchStores();
  }, [page, limit, debouncedSearch, filterStatus, filterZone, filterState, filterDistrict, filterVendorCode, filterDealerCode, filterPONumber, filterInvoiceNo, filterClientCode, filterCity]);

  const fetchStores = async () => {
    const startTime = Date.now();
    try {
      setLoading(true);
      const params = {
        page,
        limit,
        status: filterStatus !== 'ALL' ? filterStatus : undefined,
        search: debouncedSearch || undefined,
        city: filterCity || undefined,
      };
      
      const data = await storeService.getAll(params);
      let filteredStores = data.stores || [];
      
      // Apply client-side filters
      if (filterZone) filteredStores = filteredStores.filter((s: Store) => s.location.zone?.toLowerCase().includes(filterZone.toLowerCase()));
      if (filterState) filteredStores = filteredStores.filter((s: Store) => s.location.state?.toLowerCase().includes(filterState.toLowerCase()));
      if (filterDistrict) filteredStores = filteredStores.filter((s: Store) => s.location.district?.toLowerCase().includes(filterDistrict.toLowerCase()));
      if (filterVendorCode) filteredStores = filteredStores.filter((s: Store) => s.vendorCode?.toLowerCase().includes(filterVendorCode.toLowerCase()));
      if (filterDealerCode) filteredStores = filteredStores.filter((s: Store) => s.dealerCode?.toLowerCase().includes(filterDealerCode.toLowerCase()));
      if (filterPONumber) filteredStores = filteredStores.filter((s: Store) => s.commercials?.poNumber?.toLowerCase().includes(filterPONumber.toLowerCase()));
      if (filterInvoiceNo) filteredStores = filteredStores.filter((s: Store) => s.commercials?.invoiceNumber?.toLowerCase().includes(filterInvoiceNo.toLowerCase()));
      if (filterClientCode) filteredStores = filteredStores.filter((s: Store) => s.clientCode?.toLowerCase().includes(filterClientCode.toLowerCase()));
      
      setStores(filteredStores);
      
      // Set pagination info
      if (data.pagination) {
        setTotalPages(data.pagination.pages);
        setTotalStores(data.pagination.total);
      }
    } catch (error) {
      Toast.show({ type: 'error', text1: 'Failed to load stores' });
      setStores([]);
    } finally {
      const elapsed = Date.now() - startTime;
      if (elapsed < 800) {
        setTimeout(() => setLoading(false), 800 - elapsed);
      } else {
        setLoading(false);
      }
      setRefreshing(false);
    }
  };

  const toggleStoreSelection = (id: string) => {
    const newSet = new Set(selectedStoreIds);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedStoreIds(newSet);
  };

  const toggleAllSelection = () => {
    if (selectedStoreIds.size === stores.length) {
      setSelectedStoreIds(new Set());
    } else {
      setSelectedStoreIds(new Set(stores.map(s => s._id)));
    }
  };

  const handleGenerateRFQ = async () => {
    if (selectedStoreIds.size === 0) {
      Toast.show({ type: 'error', text1: 'Please select at least one store' });
      return;
    }

    setIsGenerating(true);
    try {
      const blob = await rfqService.generate(Array.from(selectedStoreIds));
      const filename = `RFQ_${Date.now()}.xlsx`;
      
      // Try direct share first (no permission needed)
      Alert.alert(
        'RFQ Generated',
        'Your RFQ has been generated successfully. How would you like to proceed?',
        [
          {
            text: 'Share Now',
            onPress: async () => {
              try {
                await fileService.directShare(blob, filename);
              } catch (shareError) {
                // Removed console.error to prevent memory issues
                Toast.show({ type: 'error', text1: 'Failed to share RFQ' });
              }
            }
          },
          {
            text: 'Download',
            onPress: async () => {
              try {
                await fileService.downloadFile(blob, filename);
                Toast.show({ type: 'success', text1: 'RFQ downloaded successfully!' });
              } catch (downloadError) {
                // Removed console.error to prevent memory issues
                // Fallback to share if download fails
                Alert.alert(
                  'Download Failed',
                  'Unable to save file to device. Sharing instead...',
                  [
                    { text: 'OK', onPress: async () => {
                      try {
                        await fileService.directShare(blob, filename);
                      } catch (shareError) {
                        Toast.show({ type: 'error', text1: 'Failed to share RFQ' });
                      }
                    }}
                  ]
                );
              }
            }
          }
        ]
      );
      
      setSelectedStoreIds(new Set());
    } catch (error: any) {
      // Enhanced error handling
      if (error.response?.status === 400 && error.response?.data) {
        const errorData = error.response.data;
        if (errorData.skippedStores && errorData.skippedStores.length > 0) {
          const reasons = errorData.skippedStores.map((s: any) => `${s.storeId}: ${s.reason}`).join('; ');
          Toast.show({ 
            type: 'error', 
            text1: 'RFQ Generation Failed', 
            text2: reasons,
            visibilityTime: 6000
          });
        } else {
          Toast.show({ type: 'error', text1: errorData.error || 'Failed to generate RFQ' });
        }
      } else {
        Toast.show({ type: 'error', text1: error.response?.data?.message || 'Failed to generate RFQ' });
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case StoreStatus.UPLOADED: return '#6B7280';
      case StoreStatus.RECCE_ASSIGNED: return '#3B82F6';
      case StoreStatus.RECCE_SUBMITTED: return '#F59E0B';
      case StoreStatus.RECCE_APPROVED: return '#8B5CF6';
      case StoreStatus.INSTALLATION_ASSIGNED: return '#6366F1';
      case StoreStatus.INSTALLATION_SUBMITTED: return '#14B8A6';
      case StoreStatus.COMPLETED: return '#10B981';
      default: return '#6B7280';
    }
  };

  const renderStore = ({ item }: { item: Store }) => {
    const isSelected = selectedStoreIds.has(item._id);
    
    return (
      <View style={{ 
        backgroundColor: isSelected ? theme.colors.primary + '10' : theme.colors.surface, 
        padding: 16, 
        marginBottom: 12, 
        borderRadius: 12, 
        borderWidth: 1, 
        borderColor: isSelected ? theme.colors.primary : theme.colors.border 
      }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
          <TouchableOpacity onPress={() => toggleStoreSelection(item._id)} style={{ marginRight: 12 }}>
            {isSelected ? 
              <CheckSquare size={20} color={theme.colors.primary} /> : 
              <Square size={20} color={theme.colors.textSecondary} />
            }
          </TouchableOpacity>
          
          <View style={{ flex: 1 }}>
            <Text style={{ color: theme.colors.primary, fontSize: 12, fontWeight: '600', marginBottom: 4 }}>
              {item.storeId || item.dealerCode}
            </Text>
            <Text style={{ color: theme.colors.text, fontSize: 16, fontWeight: '600', marginBottom: 4 }}>
              {item.storeName}
            </Text>
            <Text style={{ color: theme.colors.textSecondary, fontSize: 12 }}>
              {item.location.city}, {item.location.state}
            </Text>
          </View>
          
          <View style={{ backgroundColor: getStatusColor(item.currentStatus) + '20', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 }}>
            <Text style={{ color: getStatusColor(item.currentStatus), fontSize: 10, fontWeight: '600' }}>
              {item.currentStatus.replace(/_/g, ' ')}
            </Text>
          </View>
        </View>

        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 }}>
          <View>
            <Text style={{ color: theme.colors.textSecondary, fontSize: 12 }}>Dealer Code</Text>
            <Text style={{ color: theme.colors.text, fontSize: 14, fontWeight: '600' }}>{item.dealerCode}</Text>
          </View>
          <View>
            <Text style={{ color: theme.colors.textSecondary, fontSize: 12 }}>Client Code</Text>
            <Text style={{ color: theme.colors.text, fontSize: 14, fontWeight: '600' }}>{item.clientCode || '-'}</Text>
          </View>
        </View>

        <TouchableOpacity 
          onPress={() => {
            try {
              if (navigation && navigation.navigate) {
                navigation.navigate('StoreDetail', { storeId: item._id, fromScreen: 'RFQ' });
              } else {
                Toast.show({ 
                  type: 'info', 
                  text1: 'Navigation not available', 
                  text2: 'Please use the main stores section to view details' 
                });
              }
            } catch (error) {
              // Removed console.error to prevent memory issues
              Toast.show({ 
                type: 'error', 
                text1: 'Navigation failed', 
                text2: 'Unable to open store details' 
              });
            }
          }} 
          style={{ backgroundColor: '#3B82F620', padding: 10, borderRadius: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}
        >
          <Eye size={16} color="#3B82F6" />
          <Text style={{ color: '#3B82F6', marginLeft: 6, fontWeight: '600', fontSize: 12 }}>View Details</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <View style={{ padding: 16 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <View>
            <Text style={{ fontSize: 24, fontWeight: 'bold', color: theme.colors.text }}>RFQ Generation</Text>
            <Text style={{ fontSize: 14, color: theme.colors.textSecondary }}>Create Request for Quotation</Text>
          </View>
          {selectedStoreIds.size > 0 && (
            <DownloadButton
              onDownload={async () => {
                const blob = await rfqService.generate(Array.from(selectedStoreIds));
                return {
                  blob,
                  filename: `RFQ_${new Date().toISOString().split('T')[0]}.xlsx`
                };
              }}
              title={`Generate RFQ (${selectedStoreIds.size} stores)`}
              description="Generating Request for Quotation..."
              size="medium"
              variant="primary"
              disabled={isGenerating}
            />
          )}
        </View>

        <View style={{ gap: 12 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: theme.colors.surface, borderRadius: 8, paddingHorizontal: 12, borderWidth: 1, borderColor: theme.colors.border }}>
            <Search size={20} color={theme.colors.textSecondary} />
            <TextInput
              style={{ flex: 1, paddingVertical: 12, paddingHorizontal: 8, color: theme.colors.text, fontSize: 16 }}
              placeholder="Search stores, dealers, client codes..."
              placeholderTextColor={theme.colors.textSecondary}
              value={searchTerm}
              onChangeText={setSearchTerm}
            />
          </View>
          
          <TouchableOpacity 
            onPress={() => setShowFilters(!showFilters)}
            style={{ backgroundColor: theme.colors.surface, padding: 12, borderRadius: 8, borderWidth: 1, borderColor: theme.colors.border, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Filter size={16} color={theme.colors.textSecondary} />
              <Text style={{ color: theme.colors.text, fontSize: 14, marginLeft: 8 }}>
                Advanced Filters
              </Text>
            </View>
          </TouchableOpacity>
          
          {stores.length > 0 && (
            <TouchableOpacity 
              onPress={toggleAllSelection}
              style={{ backgroundColor: theme.colors.surface, padding: 12, borderRadius: 8, borderWidth: 1, borderColor: theme.colors.border, flexDirection: 'row', alignItems: 'center' }}
            >
              {selectedStoreIds.size === stores.length && stores.length > 0 ? 
                <CheckSquare size={20} color={theme.colors.primary} /> : 
                <Square size={20} color={theme.colors.textSecondary} />
              }
              <Text style={{ color: theme.colors.text, marginLeft: 8, fontWeight: '600' }}>
                Select All ({stores.length})
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {loading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      ) : (
        <FlatList
          data={stores}
          renderItem={renderStore}
          keyExtractor={(item) => item._id}
          contentContainerStyle={{ padding: 16, paddingTop: 0 }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                setRefreshing(true);
                setPage(1);
                fetchStores();
              }}
              colors={[theme.colors.primary]}
            />
          }
          ListEmptyComponent={
            <View style={{ alignItems: 'center', justifyContent: 'center', paddingVertical: 40 }}>
              <FileSpreadsheet size={48} color={theme.colors.textSecondary} />
              <Text style={{ color: theme.colors.text, fontSize: 18, fontWeight: '600', marginTop: 16, textAlign: 'center' }}>
                {debouncedSearch ? 'No stores found' : 'No stores available'}
              </Text>
              <Text style={{ color: theme.colors.textSecondary, fontSize: 14, marginTop: 8, textAlign: 'center' }}>
                {debouncedSearch 
                  ? `No stores match "${debouncedSearch}". Try a different search term.`
                  : 'There are no stores available for RFQ generation.'}
              </Text>
              {debouncedSearch && (
                <TouchableOpacity 
                  onPress={() => setSearchTerm('')}
                  style={{ 
                    backgroundColor: theme.colors.primary, 
                    paddingHorizontal: 16, 
                    paddingVertical: 8, 
                    borderRadius: 8, 
                    marginTop: 16 
                  }}
                >
                  <Text style={{ color: '#FFFFFF', fontWeight: '600' }}>Clear Search</Text>
                </TouchableOpacity>
              )}
            </View>
          }
          ListFooterComponent={
            totalPages > 1 ? (
              <View style={{ 
                flexDirection: 'row', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                paddingVertical: 16, 
                paddingHorizontal: 16,
                backgroundColor: theme.colors.surface,
                borderRadius: 8,
                marginTop: 16,
                borderWidth: 1,
                borderColor: theme.colors.border
              }}>
                <Text style={{ color: theme.colors.textSecondary, fontSize: 12 }}>
                  Showing {(page - 1) * limit + 1} to {Math.min(page * limit, totalStores)} of {totalStores} entries
                </Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <TouchableOpacity 
                    onPress={() => setPage(p => Math.max(1, p - 1))} 
                    disabled={page === 1}
                    style={{ 
                      padding: 8, 
                      borderRadius: 6, 
                      backgroundColor: page === 1 ? theme.colors.border : theme.colors.primary,
                      opacity: page === 1 ? 0.5 : 1
                    }}
                  >
                    <ChevronLeft size={16} color={page === 1 ? theme.colors.textSecondary : '#FFFFFF'} />
                  </TouchableOpacity>
                  <Text style={{ color: theme.colors.text, fontSize: 14, fontWeight: '600', paddingHorizontal: 8 }}>
                    {page}
                  </Text>
                  <TouchableOpacity 
                    onPress={() => setPage(p => Math.min(totalPages, p + 1))} 
                    disabled={page === totalPages}
                    style={{ 
                      padding: 8, 
                      borderRadius: 6, 
                      backgroundColor: page === totalPages ? theme.colors.border : theme.colors.primary,
                      opacity: page === totalPages ? 0.5 : 1
                    }}
                  >
                    <ChevronRight size={16} color={page === totalPages ? theme.colors.textSecondary : '#FFFFFF'} />
                  </TouchableOpacity>
                </View>
              </View>
            ) : null
          }
        />
      )}
      
      {/* Advanced Filters Modal */}
      <Modal
        visible={showFilters}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowFilters(false)}
      >
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}>
          <View style={{ 
            backgroundColor: theme.colors.background, 
            borderTopLeftRadius: 20, 
            borderTopRightRadius: 20, 
            paddingTop: 20,
            maxHeight: '80%'
          }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, marginBottom: 20 }}>
              <Text style={{ fontSize: 18, fontWeight: 'bold', color: theme.colors.text }}>Advanced Filters</Text>
              <TouchableOpacity onPress={() => setShowFilters(false)}>
                <X size={24} color={theme.colors.textSecondary} />
              </TouchableOpacity>
            </View>
            
            <FlatList
              data={[
                { label: 'Status', value: filterStatus, setValue: setFilterStatus, options: ['ALL', ...Object.values(StoreStatus)] },
                { label: 'Zone', value: filterZone, setValue: setFilterZone, isInput: true },
                { label: 'State', value: filterState, setValue: setFilterState, isInput: true },
                { label: 'District', value: filterDistrict, setValue: setFilterDistrict, isInput: true },
                { label: 'City', value: filterCity, setValue: setFilterCity, isInput: true },
                { label: 'Vendor Code', value: filterVendorCode, setValue: setFilterVendorCode, isInput: true },
                { label: 'Dealer Code', value: filterDealerCode, setValue: setFilterDealerCode, isInput: true },
                { label: 'Client Code', value: filterClientCode, setValue: setFilterClientCode, isInput: true },
                { label: 'PO Number', value: filterPONumber, setValue: setFilterPONumber, isInput: true },
                { label: 'Invoice No', value: filterInvoiceNo, setValue: setFilterInvoiceNo, isInput: true },
              ]}
              keyExtractor={(item) => item.label}
              renderItem={({ item }) => (
                <View style={{ paddingHorizontal: 20, marginBottom: 16 }}>
                  <Text style={{ color: theme.colors.text, fontSize: 14, fontWeight: '600', marginBottom: 8 }}>
                    {item.label}
                  </Text>
                  {item.isInput ? (
                    <TextInput
                      style={{ 
                        backgroundColor: theme.colors.surface, 
                        borderRadius: 8, 
                        paddingHorizontal: 12, 
                        paddingVertical: 10, 
                        color: theme.colors.text, 
                        borderWidth: 1, 
                        borderColor: theme.colors.border 
                      }}
                      placeholder={`Enter ${item.label.toLowerCase()}`}
                      placeholderTextColor={theme.colors.textSecondary}
                      value={item.value}
                      onChangeText={item.setValue}
                    />
                  ) : (
                    <View style={{ backgroundColor: theme.colors.surface, borderRadius: 8, borderWidth: 1, borderColor: theme.colors.border }}>
                      {item.options?.map((option) => (
                        <TouchableOpacity
                          key={option}
                          onPress={() => item.setValue(option)}
                          style={{ 
                            padding: 12, 
                            borderBottomWidth: 1, 
                            borderBottomColor: theme.colors.border,
                            backgroundColor: item.value === option ? theme.colors.primary + '20' : 'transparent'
                          }}
                        >
                          <Text style={{ 
                            color: item.value === option ? theme.colors.primary : theme.colors.text, 
                            fontSize: 14,
                            fontWeight: item.value === option ? '600' : '400'
                          }}>
                            {option === 'ALL' ? 'All Status' : option.replace(/_/g, ' ')}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                </View>
              )}
            />
            
            <View style={{ padding: 20, borderTopWidth: 1, borderTopColor: theme.colors.border }}>
              <TouchableOpacity 
                onPress={() => {
                  setFilterStatus('ALL');
                  setFilterZone('');
                  setFilterState('');
                  setFilterDistrict('');
                  setFilterCity('');
                  setFilterVendorCode('');
                  setFilterDealerCode('');
                  setFilterClientCode('');
                  setFilterPONumber('');
                  setFilterInvoiceNo('');
                  setPage(1);
                }}
                style={{ 
                  backgroundColor: theme.colors.surface, 
                  padding: 12, 
                  borderRadius: 8, 
                  alignItems: 'center',
                  borderWidth: 1,
                  borderColor: theme.colors.border
                }}
              >
                <Text style={{ color: theme.colors.text, fontWeight: '600' }}>Clear All Filters</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}