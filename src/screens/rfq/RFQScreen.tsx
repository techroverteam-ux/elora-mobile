import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, TextInput, RefreshControl, ActivityIndicator } from 'react-native';
import { Search, FileSpreadsheet, Eye, CheckSquare, Square, Filter } from 'lucide-react-native';
import { useTheme } from '../../context/ThemeContext';
import { storeService } from '../../services/storeService';
import { rfqService } from '../../services/rfqService';
import { fileService } from '../../services/fileService';
import Toast from 'react-native-toast-message';
import { useNavigation } from '@react-navigation/native';

interface Store {
  _id: string;
  storeId?: string;
  dealerCode: string;
  storeName: string;
  clientCode?: string;
  location: {
    city: string;
    state?: string;
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

export default function RFQScreen() {
  const { theme } = useTheme();
  const navigation = useNavigation();
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedStoreIds, setSelectedStoreIds] = useState<Set<string>>(new Set());
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchStores();
  }, [searchTerm, filterStatus]);

  const fetchStores = async () => {
    try {
      setLoading(true);
      const params = {
        page: 1,
        limit: 100,
        status: filterStatus !== 'ALL' ? filterStatus : undefined,
        search: searchTerm || undefined,
      };
      
      const data = await storeService.getAll(params);
      setStores(data.stores || []);
    } catch (error) {
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

    setIsGenerating(true);
    try {
      const blob = await rfqService.generate(Array.from(selectedStoreIds));
      await fileService.downloadFile(blob, `RFQ_${Date.now()}.xlsx`);
      Toast.show({ type: 'success', text1: 'RFQ generated successfully!' });
      setSelectedStoreIds(new Set());
    } catch (error: any) {
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
            <Text style={{ color: theme.colors.textSecondary, fontSize: 12 }}>Dealer Code</Text>
            <Text style={{ color: theme.colors.text, fontSize: 14, fontWeight: '600' }}>{item.dealerCode}</Text>
          </View>
          <View>
            <Text style={{ color: theme.colors.textSecondary, fontSize: 12 }}>Client Code</Text>
            <Text style={{ color: theme.colors.text, fontSize: 14, fontWeight: '600' }}>{item.clientCode || '-'}</Text>
          </View>
        </View>

        <TouchableOpacity 
          onPress={() => (navigation as any)?.navigate('StoreDetail', { storeId: item._id })} 
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
                backgroundColor: theme.colors.primary, 
                paddingHorizontal: 16, 
                paddingVertical: 10, 
                borderRadius: 8,
                opacity: isGenerating ? 0.6 : 1,
                flexDirection: 'row',
                alignItems: 'center'
              }}
            >
              {isGenerating ? (
                <ActivityIndicator size="small" color="#FFF" />
              ) : (
                <FileSpreadsheet size={16} color="#FFF" />
              )}
              <Text style={{ color: '#FFF', marginLeft: 8, fontWeight: '600', fontSize: 12 }}>
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
              placeholder="Search stores, dealers..."
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
                {filterStatus === 'ALL' ? 'All Status' : filterStatus.replace(/_/g, ' ')}
              </Text>
            </View>
          </TouchableOpacity>
          
          {showFilters && (
            <View style={{ backgroundColor: theme.colors.surface, borderRadius: 8, borderWidth: 1, borderColor: theme.colors.border, overflow: 'hidden' }}>
              {['ALL', ...Object.values(StoreStatus)].map((status) => (
                <TouchableOpacity
                  key={status}
                  onPress={() => {
                    setFilterStatus(status);
                    setShowFilters(false);
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
                fetchStores();
              }}
              colors={[theme.colors.primary]}
            />
          }
          ListEmptyComponent={
            <View style={{ alignItems: 'center', justifyContent: 'center', paddingVertical: 40 }}>
              <Text style={{ color: theme.colors.textSecondary, fontSize: 16, textAlign: 'center' }}>
                No stores found matching filters
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
}