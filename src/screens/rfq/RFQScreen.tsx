import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, FlatList, TouchableOpacity, TextInput, RefreshControl, ActivityIndicator, Modal, Alert, ScrollView } from 'react-native';
import { Search, FileSpreadsheet, Eye, CheckSquare, Square, Filter, ChevronLeft, ChevronRight, X, MapPin } from 'lucide-react-native';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { storeService } from '../../services/storeService';
import { rfqService } from '../../services/rfqService';
import { fileService } from '../../services/fileService';
import { modernDownloadService } from '../../services/modernDownloadService';
import DownloadButton from '../../components/DownloadButton';
import Toast from 'react-native-toast-message';
import PageSkeleton from '../../components/PageSkeleton';
import { Card, StatusBadge, Button, Chip, Checkbox, MetaGrid, ScreenHeader, SearchBar, ActiveFilters, Pagination, EmptyState, BottomSheet, FormSection, FieldRow, TextField, tone, statusMeta } from '../../components/ui';

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

  // UI helpers -------------------------------------------------------------
  const textFilters = [
    { key: 'zone', label: 'Zone', value: filterZone, setValue: setFilterZone },
    { key: 'state', label: 'State', value: filterState, setValue: setFilterState },
    { key: 'district', label: 'District', value: filterDistrict, setValue: setFilterDistrict },
    { key: 'city', label: 'City', value: filterCity, setValue: setFilterCity },
    { key: 'vendor', label: 'Vendor code', value: filterVendorCode, setValue: setFilterVendorCode },
    { key: 'dealer', label: 'Dealer code', value: filterDealerCode, setValue: setFilterDealerCode },
    { key: 'client', label: 'Client code', value: filterClientCode, setValue: setFilterClientCode },
    { key: 'po', label: 'PO number', value: filterPONumber, setValue: setFilterPONumber },
    { key: 'invoice', label: 'Invoice no', value: filterInvoiceNo, setValue: setFilterInvoiceNo },
  ];
  const activeTextFilters = textFilters.filter(f => f.value);

  const clearAllFilters = () => {
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
  };

  const openStoreDetail = (item: Store) => {
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
      Toast.show({
        type: 'error',
        text1: 'Navigation failed',
        text2: 'Unable to open store details'
      });
    }
  };

  const renderStore = ({ item }: { item: Store }) => {
    const isSelected = selectedStoreIds.has(item._id);
    const locationText = [item.location?.city, item.location?.state].filter(Boolean).join(', ');
    return (
      <Card selected={isSelected} onPress={() => toggleStoreSelection(item._id)} style={{ marginBottom: 10 }}>
        <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 12 }}>
          <View style={{ paddingTop: 2 }}>
            <Checkbox checked={isSelected} onPress={() => toggleStoreSelection(item._id)} />
          </View>
          <View style={{ flex: 1, gap: 3 }}>
            <Text style={{ color: theme.colors.textSecondary, fontSize: 11, fontWeight: '800', letterSpacing: 0.6 }} numberOfLines={1}>{item.storeId || item.dealerCode}</Text>
            <Text style={{ color: theme.colors.text, fontSize: 16, fontWeight: '800' }} numberOfLines={2}>{item.storeName}</Text>
            {!!locationText && (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <MapPin size={12} color={theme.colors.textSecondary} />
                <Text style={{ color: theme.colors.textSecondary, fontSize: 12, flex: 1 }} numberOfLines={1}>{locationText}</Text>
              </View>
            )}
          </View>
          <StatusBadge status={item.currentStatus} />
        </View>
        <View style={{ marginTop: 12 }}>
          <MetaGrid
            items={[
              { label: 'Dealer code', value: item.dealerCode || '—' },
              { label: 'Client code', value: item.clientCode || '—' },
              !!item.commercials?.poNumber && { label: 'PO', value: item.commercials!.poNumber },
            ]}
          />
        </View>
        <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: 10 }}>
          <Button label="View details" variant="soft" color={tone.info} size="sm" icon={(col) => <Eye size={14} color={col} />} onPress={() => openStoreDetail(item)} />
        </View>
      </Card>
    );
  };

  const allSelected = selectedStoreIds.size === stores.length && stores.length > 0;

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <View style={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 6 }}>
        <ScreenHeader title="RFQ" subtitle="Select stores to generate a Request for Quotation" count={totalStores} />

        <SearchBar
          value={searchTerm}
          onChangeText={setSearchTerm}
          placeholder="Search stores, dealers, client codes…"
          onFilterPress={() => setShowFilters(true)}
          activeFilters={activeTextFilters.length}
        />

        <ActiveFilters
          items={activeTextFilters.map(f => ({ key: f.key, label: `${f.label}: ${f.value}`, onRemove: () => f.setValue('') }))}
          onClearAll={clearAllFilters}
        />

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingTop: 12, paddingBottom: 2, alignItems: 'center' }}>
          {['ALL', ...Object.values(StoreStatus)].map((s) => (
            <Chip
              key={s}
              label={s === 'ALL' ? 'All' : statusMeta(s).label}
              color={s === 'ALL' ? undefined : statusMeta(s).color}
              active={filterStatus === s}
              onPress={() => setFilterStatus(s)}
            />
          ))}
        </ScrollView>

        {stores.length > 0 && (
          <TouchableOpacity onPress={toggleAllSelection} style={{ flexDirection: 'row', alignItems: 'center', gap: 8, paddingTop: 12 }}>
            <Checkbox checked={allSelected} onPress={toggleAllSelection} size={20} />
            <Text style={{ color: theme.colors.text, fontSize: 13, fontWeight: '700' }}>Select all on this page ({stores.length})</Text>
          </TouchableOpacity>
        )}
      </View>

      {loading ? (
        <PageSkeleton type="list" />
      ) : (
        <FlatList
          data={stores}
          renderItem={renderStore}
          keyExtractor={(item) => item._id}
          contentContainerStyle={{ padding: 16, paddingTop: 10, paddingBottom: selectedStoreIds.size > 0 ? 110 : 32 }}
          keyboardShouldPersistTaps="handled"
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                setRefreshing(true);
                setPage(1);
                fetchStores();
              }}
              colors={[theme.colors.primary]}
              tintColor={theme.colors.primary}
            />
          }
          ListEmptyComponent={
            <EmptyState
              title={debouncedSearch ? 'No stores found' : 'No stores available'}
              message={debouncedSearch ? `Nothing matches "${debouncedSearch}". Try a different search.` : 'There are no stores available for RFQ generation.'}
              icon={<FileSpreadsheet size={28} color={theme.colors.textTertiary} />}
              action={debouncedSearch || activeTextFilters.length || filterStatus !== 'ALL' ? (
                <Button label="Clear search & filters" variant="outline" onPress={() => { setSearchTerm(''); clearAllFilters(); }} />
              ) : undefined}
            />
          }
          ListFooterComponent={
            stores.length > 0 ? (
              <Pagination
                page={page}
                totalPages={totalPages}
                total={totalStores}
                noun="stores"
                onPrev={() => setPage(p => Math.max(1, p - 1))}
                onNext={() => setPage(p => Math.min(totalPages, p + 1))}
              />
            ) : null
          }
        />
      )}

      {/* Sticky generate bar */}
      {selectedStoreIds.size > 0 && (
        <View style={{ position: 'absolute', left: 16, right: 16, bottom: 16 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: theme.colors.text, borderRadius: 18, padding: 10, paddingLeft: 14, elevation: 6, shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 10, shadowOffset: { width: 0, height: 4 } }}>
            <TouchableOpacity onPress={() => setSelectedStoreIds(new Set())} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <X size={18} color={theme.colors.background} />
            </TouchableOpacity>
            <Text style={{ flex: 1, color: theme.colors.background, fontSize: 14, fontWeight: '800' }}>
              {selectedStoreIds.size} store{selectedStoreIds.size > 1 ? 's' : ''} selected
            </Text>
            <Button
              label="Generate RFQ"
              variant="primary"
              loading={isGenerating}
              disabled={isGenerating}
              icon={(col) => <FileSpreadsheet size={16} color={col} />}
              onPress={handleGenerateRFQ}
            />
          </View>
        </View>
      )}

      {/* Advanced filters */}
      <BottomSheet
        visible={showFilters}
        onClose={() => setShowFilters(false)}
        title="Advanced filters"
        subtitle="Results update as you type"
        icon={<Filter size={18} color={theme.colors.text} />}
        footer={
          <>
            <Button label="Clear all" variant="outline" size="lg" flex onPress={clearAllFilters} />
            <Button label="Done" variant="primary" size="lg" flex onPress={() => setShowFilters(false)} />
          </>
        }
      >
        <FormSection title="Location">
          <FieldRow>
            <TextField label="Zone" value={filterZone} onChangeText={setFilterZone} placeholder="Any" />
            <TextField label="State" value={filterState} onChangeText={setFilterState} placeholder="Any" />
          </FieldRow>
          <FieldRow>
            <TextField label="District" value={filterDistrict} onChangeText={setFilterDistrict} placeholder="Any" />
            <TextField label="City" value={filterCity} onChangeText={setFilterCity} placeholder="Any" />
          </FieldRow>
        </FormSection>
        <FormSection title="Codes">
          <FieldRow>
            <TextField label="Vendor code" value={filterVendorCode} onChangeText={setFilterVendorCode} placeholder="Any" autoCapitalize="characters" />
            <TextField label="Dealer code" value={filterDealerCode} onChangeText={setFilterDealerCode} placeholder="Any" autoCapitalize="characters" />
          </FieldRow>
          <TextField label="Client code" value={filterClientCode} onChangeText={setFilterClientCode} placeholder="Any" autoCapitalize="characters" />
        </FormSection>
        <FormSection title="Commercial">
          <FieldRow>
            <TextField label="PO number" value={filterPONumber} onChangeText={setFilterPONumber} placeholder="Any" />
            <TextField label="Invoice no" value={filterInvoiceNo} onChangeText={setFilterInvoiceNo} placeholder="Any" />
          </FieldRow>
        </FormSection>
      </BottomSheet>
    </View>
  );
}
