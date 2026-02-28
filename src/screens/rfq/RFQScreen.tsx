import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, TextInput, ActivityIndicator, RefreshControl, Alert } from 'react-native';
import { Search, FileSpreadsheet, CheckSquare, Square, Eye, Filter, ChevronDown } from 'lucide-react-native';
import { useTheme } from '../../context/ThemeContext';
import { storeAPI } from '../../lib/api';
import Toast from 'react-native-toast-message';

interface Store {
  _id: string;
  storeId?: string;
  clientCode?: string;
  dealerCode: string;
  storeName: string;
  vendorCode?: string;
  location: {
    zone?: string;
    state?: string;
    district?: string;
    city: string;
  };
  currentStatus: string;
  commercials?: {
    poNumber?: string;
    invoiceNumber?: string;
  };
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

export default function RFQScreen() {
  console.log('RFQScreen: Component initialized');
  
  const { theme } = useTheme();
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedStoreIds, setSelectedStoreIds] = useState<Set<string>>(new Set());
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [showStatusFilter, setShowStatusFilter] = useState(false);
  const [filterZone, setFilterZone] = useState('');
  const [filterState, setFilterState] = useState('');
  const [filterCity, setFilterCity] = useState('');
  const [filterVendorCode, setFilterVendorCode] = useState('');
  const [filterDealerCode, setFilterDealerCode] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchStores();
  }, [searchTerm, filterStatus, filterZone, filterState, filterCity, filterVendorCode, filterDealerCode]);

  const fetchStores = async () => {
    console.log('RFQScreen: fetchStores called');
    
    try {
      setLoading(true);
      const { data } = await storeAPI.getStores({
        page: 1,
        limit: 100,
        status: filterStatus !== 'ALL' ? filterStatus : undefined,
        search: searchTerm || undefined,
        city: filterCity || undefined,
      });
      
      let filteredStores = data.stores || [];
      
      // Apply additional filters
      if (filterZone) {
        filteredStores = filteredStores.filter((s: Store) => 
          s.location.zone?.toLowerCase().includes(filterZone.toLowerCase())
        );
      }
      if (filterState) {
        filteredStores = filteredStores.filter((s: Store) => 
          s.location.state?.toLowerCase().includes(filterState.toLowerCase())
        );
      }
      if (filterVendorCode) {
        filteredStores = filteredStores.filter((s: Store) => 
          s.vendorCode?.toLowerCase().includes(filterVendorCode.toLowerCase())
        );
      }
      if (filterDealerCode) {
        filteredStores = filteredStores.filter((s: Store) => 
          s.dealerCode?.toLowerCase().includes(filterDealerCode.toLowerCase())
        );
      }
      
      setStores(filteredStores);
      console.log('RFQScreen: Stores loaded successfully', { count: filteredStores.length });
      
    } catch (error) {
      console.error('RFQScreen: Error fetching stores', error);
      Toast.show({ type: 'error', text1: 'Failed to load stores' });
      setStores([]);
    } finally {
      setLoading(false);
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

    console.log('RFQScreen: Generating RFQ for stores', Array.from(selectedStoreIds));
    setIsGenerating(true);
    
    try {
      // Call RFQ generation API
      const response = await fetch('https://elora-api-smoky.vercel.app/api/v1/rfq/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ storeIds: Array.from(selectedStoreIds) }),
      });

      if (response.ok) {
        Toast.show({ 
          type: 'success', 
          text1: 'RFQ Generated Successfully!',
          text2: `Generated for ${selectedStoreIds.size} stores`
        });
        setSelectedStoreIds(new Set());
      } else {
        throw new Error('Failed to generate RFQ');
      }
    } catch (error) {
      console.error('RFQScreen: Error generating RFQ', error);
      Toast.show({ type: 'error', text1: 'Failed to generate RFQ' });
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
            <Text style={{ color: theme.colors.textSecondary, fontSize: 12 }}>Client Code</Text>
            <Text style={{ color: theme.colors.text, fontSize: 14, fontWeight: '600' }}>
              {item.clientCode || '-'}
            </Text>
          </View>
          <View>
            <Text style={{ color: theme.colors.textSecondary, fontSize: 12 }}>Dealer Code</Text>
            <Text style={{ color: theme.colors.text, fontSize: 14, fontWeight: '600' }}>
              {item.dealerCode}
            </Text>
          </View>
          <View>
            <Text style={{ color: theme.colors.textSecondary, fontSize: 12 }}>Zone</Text>
            <Text style={{ color: theme.colors.text, fontSize: 14, fontWeight: '600' }}>
              {item.location.zone || '-'}
            </Text>
          </View>
        </View>

        <TouchableOpacity 
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
            <TouchableOpacity 
              onPress={handleGenerateRFQ}
              disabled={isGenerating}
              style={{ 
                backgroundColor: isGenerating ? theme.colors.border : theme.colors.primary, 
                paddingHorizontal: 16, 
                paddingVertical: 10, 
                borderRadius: 8, 
                flexDirection: 'row', 
                alignItems: 'center' 
              }}
            >
              {isGenerating ? (
                <ActivityIndicator size="small" color="#FFF" />
              ) : (
                <FileSpreadsheet size={20} color="#FFF" />
              )}
              <Text style={{ color: '#FFF', marginLeft: 6, fontWeight: '600' }}>
                Generate RFQ ({selectedStoreIds.size})
              </Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={{ gap: 12 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: theme.colors.surface, borderRadius: 8, paddingHorizontal: 12, borderWidth: 1, borderColor: theme.colors.border }}>
            <Search size={20} color={theme.colors.textSecondary} />
            <TextInput
              style={{ flex: 1, paddingVertical: 12, paddingHorizontal: 8, color: theme.colors.text, fontSize: 16 }}
              placeholder="Search stores..."
              placeholderTextColor={theme.colors.textSecondary}
              value={searchTerm}
              onChangeText={setSearchTerm}
            />
          </View>
          
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <TouchableOpacity 
              onPress={() => setShowStatusFilter(!showStatusFilter)}
              style={{ flex: 1, backgroundColor: theme.colors.surface, padding: 12, borderRadius: 8, borderWidth: 1, borderColor: theme.colors.border, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}
            >
              <Text style={{ color: theme.colors.text, fontSize: 14 }}>
                {filterStatus === 'ALL' ? 'All Status' : filterStatus.replace(/_/g, ' ')}
              </Text>
              <ChevronDown size={16} color={theme.colors.textSecondary} />
            </TouchableOpacity>
            
            <TouchableOpacity 
              onPress={() => setShowFilters(!showFilters)}
              style={{ backgroundColor: theme.colors.surface, padding: 12, borderRadius: 8, borderWidth: 1, borderColor: theme.colors.border }}
            >
              <Filter size={20} color={theme.colors.textSecondary} />
            </TouchableOpacity>
          </View>
          
          {showStatusFilter && (
            <View style={{ backgroundColor: theme.colors.surface, borderRadius: 8, borderWidth: 1, borderColor: theme.colors.border, overflow: 'hidden' }}>
              {['ALL', ...Object.values(StoreStatus)].map((status) => (
                <TouchableOpacity
                  key={status}
                  onPress={() => {
                    setFilterStatus(status);
                    setShowStatusFilter(false);
                  }}
                  style={{ padding: 12, borderBottomWidth: 1, borderBottomColor: theme.colors.border }}
                >
                  <Text style={{ color: theme.colors.text, fontSize: 14 }}>
                    {status === 'ALL' ? 'All Status' : status.replace(/_/g, ' ')}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
          
          {showFilters && (
            <View style={{ backgroundColor: theme.colors.surface, borderRadius: 8, borderWidth: 1, borderColor: theme.colors.border, padding: 16, gap: 12 }}>
              <Text style={{ color: theme.colors.text, fontWeight: '600', marginBottom: 8 }}>Additional Filters</Text>
              <TextInput
                style={{ backgroundColor: theme.colors.background, padding: 12, borderRadius: 8, color: theme.colors.text, borderWidth: 1, borderColor: theme.colors.border }}
                placeholder="Zone"
                placeholderTextColor={theme.colors.textSecondary}
                value={filterZone}
                onChangeText={setFilterZone}
              />
              <TextInput
                style={{ backgroundColor: theme.colors.background, padding: 12, borderRadius: 8, color: theme.colors.text, borderWidth: 1, borderColor: theme.colors.border }}
                placeholder="State"
                placeholderTextColor={theme.colors.textSecondary}
                value={filterState}
                onChangeText={setFilterState}
              />
              <TextInput
                style={{ backgroundColor: theme.colors.background, padding: 12, borderRadius: 8, color: theme.colors.text, borderWidth: 1, borderColor: theme.colors.border }}
                placeholder="City"
                placeholderTextColor={theme.colors.textSecondary}
                value={filterCity}
                onChangeText={setFilterCity}
              />
              <TextInput
                style={{ backgroundColor: theme.colors.background, padding: 12, borderRadius: 8, color: theme.colors.text, borderWidth: 1, borderColor: theme.colors.border }}
                placeholder="Vendor Code"
                placeholderTextColor={theme.colors.textSecondary}
                value={filterVendorCode}
                onChangeText={setFilterVendorCode}
              />
              <TextInput
                style={{ backgroundColor: theme.colors.background, padding: 12, borderRadius: 8, color: theme.colors.text, borderWidth: 1, borderColor: theme.colors.border }}
                placeholder="Dealer Code"
                placeholderTextColor={theme.colors.textSecondary}
                value={filterDealerCode}
                onChangeText={setFilterDealerCode}
              />
            </View>
          )}
        </View>
      </View>

      {loading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={{ color: theme.colors.textSecondary, marginTop: 16 }}>Loading stores...</Text>
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
                fetchStores();
              }}
              colors={[theme.colors.primary]}
            />
          }
          ListHeaderComponent={
            stores.length > 0 ? (
              <TouchableOpacity 
                onPress={toggleAllSelection}
                style={{ flexDirection: 'row', alignItems: 'center', padding: 12, marginBottom: 8 }}
              >
                {selectedStoreIds.size === stores.length && stores.length > 0 ? 
                  <CheckSquare size={20} color={theme.colors.primary} /> : 
                  <Square size={20} color={theme.colors.textSecondary} />
                }
                <Text style={{ color: theme.colors.text, marginLeft: 8, fontWeight: '600' }}>
                  Select All ({stores.length})
                </Text>
              </TouchableOpacity>
            ) : null
          }
          ListEmptyComponent={
            <View style={{ alignItems: 'center', justifyContent: 'center', paddingVertical: 40 }}>
              <Text style={{ color: theme.colors.textSecondary, fontSize: 16, textAlign: 'center' }}>
                No stores found
              </Text>
              <Text style={{ color: theme.colors.textSecondary, fontSize: 14, textAlign: 'center', marginTop: 8 }}>
                Try adjusting your filters
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
}