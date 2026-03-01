import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, TextInput, RefreshControl, Alert, Modal, ScrollView, ActivityIndicator } from 'react-native';
import { Search, Plus, Eye, Trash2, Check, XCircle, ChevronDown, Upload, UserPlus, CheckSquare, Square, Download, FileText, FileSpreadsheet, MoreVertical, X } from 'lucide-react-native';
import { useTheme } from '../../context/ThemeContext';
import { storeService } from '../../services/storeService';
import { userService } from '../../services/userService';
import { fileService } from '../../services/fileService';
import Toast from 'react-native-toast-message';
import { useNavigation } from '@react-navigation/native';
import PageSkeleton from '../../components/PageSkeleton';

interface Store {
  _id: string;
  storeId?: string;
  dealerCode: string;
  storeName: string;
  location: {
    city: string;
    state?: string;
  };
  currentStatus: string;
  specs?: {
    width: number;
    height: number;
  };
  commercials?: {
    totalCost: number;
  };
  workflow: {
    recceAssignedTo?: { _id: string; name: string };
    installationAssignedTo?: { _id: string; name: string };
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

export default function StoresScreen({ navigation: navigationProp }: { navigation?: any }) {
  console.log('StoresScreen: Component initialized - REAL STORES SCREEN LOADED', Date.now());
  
  const navigation = useNavigation();
  const nav = navigationProp || navigation;
  const { theme } = useTheme();
  
  console.log('StoresScreen: State initialization');
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [showStatusFilter, setShowStatusFilter] = useState(false);
  const [selectedStoreIds, setSelectedStoreIds] = useState<Set<string>>(new Set());
  
  // Assignment
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [assignStage, setAssignStage] = useState<'RECCE' | 'INSTALLATION'>('RECCE');
  const [availableUsers, setAvailableUsers] = useState<any[]>([]);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [singleAssignTarget, setSingleAssignTarget] = useState<Store | null>(null);

  // Add Store Modal - using ref to prevent re-render issues
  const [isAddStoreModalOpen, setIsAddStoreModalOpen] = useState(() => {
    console.log('Modal state initialized to false');
    return false;
  });
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [storeToDelete, setStoreToDelete] = useState<Store | null>(null);
  const [newStore, setNewStore] = useState({
    storeName: '',
    dealerCode: '',
    city: '',
    state: '',
    address: ''
  });

  // Bulk Upload
  const [uploadModalVisible, setUploadModalVisible] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadStats, setUploadStats] = useState<any>(null);

  // Export and Bulk Operations
  const [isExporting, setIsExporting] = useState(false);
  const [showBulkActions, setShowBulkActions] = useState(false);

  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalStores, setTotalStores] = useState(0);

  useEffect(() => {
    console.log('Modal state changed to:', isAddStoreModalOpen);
  }, [isAddStoreModalOpen]);

  useEffect(() => {
    console.log('useEffect triggered, searchTerm:', searchTerm, 'filterStatus:', filterStatus);
    fetchStores();
  }, [searchTerm, filterStatus]);

  const fetchStores = async () => {
    console.log('StoresScreen: fetchStores called');
    
    try {
      setLoading(true);
      const params = {
        page,
        limit: 20,
        status: filterStatus !== 'ALL' ? filterStatus : undefined,
        search: searchTerm || undefined,
      };
      
      const data = await storeService.getAll(params);
      setStores(data.stores || []);
      if (data.pagination) {
        setTotalPages(data.pagination.pages);
        setTotalStores(data.pagination.total);
      }
      console.log('StoresScreen: Stores loaded successfully', { count: data.stores?.length || 0 });
      
    } catch (error) {
      console.error('StoresScreen: Error fetching stores', error);
      Toast.show({ type: 'error', text1: 'Failed to load stores' });
      setStores([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleDelete = (store: Store) => {
    setStoreToDelete(store);
    setDeleteModalVisible(true);
  };

  const confirmDelete = async () => {
    if (!storeToDelete) return;
    
    try {
      await storeService.delete(storeToDelete._id);
      Toast.show({ type: 'success', text1: 'Store deleted successfully' });
      setDeleteModalVisible(false);
      setStoreToDelete(null);
      fetchStores();
    } catch (error) {
      Toast.show({ type: 'error', text1: 'Failed to delete store' });
    }
  };

  const handleApproveRecce = async (id: string) => {
    try {
      await storeService.approveRecce(id);
      Toast.show({ type: 'success', text1: 'Recce approved successfully' });
      fetchStores();
    } catch (error) {
      Toast.show({ type: 'error', text1: 'Failed to approve recce' });
    }
  };

  const handleRejectRecce = async (id: string) => {
    try {
      await storeService.rejectRecce(id);
      Toast.show({ type: 'success', text1: 'Recce rejected' });
      fetchStores();
    } catch (error) {
      Toast.show({ type: 'error', text1: 'Failed to reject recce' });
    }
  };

  // Export Functions
  const handleExportStores = async () => {
    setIsExporting(true);
    try {
      const params = {
        status: filterStatus !== 'ALL' ? filterStatus : undefined,
        search: searchTerm || undefined,
      };
      const blob = await storeService.export(params);
      await fileService.downloadFile(blob, `Stores_Export_${Date.now()}.xlsx`);
      Toast.show({ type: 'success', text1: 'Stores exported successfully!' });
    } catch (error) {
      Toast.show({ type: 'error', text1: 'Failed to export stores' });
    } finally {
      setIsExporting(false);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedStoreIds.size === 0) {
      Toast.show({ type: 'error', text1: 'Please select stores to delete' });
      return;
    }

    Alert.alert(
      'Delete Stores',
      `Are you sure you want to delete ${selectedStoreIds.size} stores?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await Promise.all(Array.from(selectedStoreIds).map(id => storeService.delete(id)));
              Toast.show({ type: 'success', text1: `${selectedStoreIds.size} stores deleted successfully` });
              setSelectedStoreIds(new Set());
              fetchStores();
            } catch (error) {
              Toast.show({ type: 'error', text1: 'Failed to delete some stores' });
            }
          },
        },
      ]
    );
  };

  const handleBulkAssign = (stage: 'RECCE' | 'INSTALLATION') => {
    if (selectedStoreIds.size === 0) {
      Toast.show({ type: 'error', text1: 'Please select stores to assign' });
      return;
    }
    openAssignModal(stage);
  };

  const downloadTemplate = async () => {
    try {
      const blob = await storeService.getTemplate();
      await fileService.downloadFile(blob, 'Store_Upload_Template.xlsx');
      Toast.show({ type: 'success', text1: 'Template downloaded!' });
    } catch (error) {
      Toast.show({ type: 'error', text1: 'Failed to download template' });
    }
  };

  // File Upload Functions
  const handleFileSelect = async () => {
    try {
      Alert.alert(
        'Select Files',
        'Choose file source:',
        [
          { 
            text: 'Files', 
            onPress: () => {
              Toast.show({ 
                type: 'info', 
                text1: 'File Selection', 
                text2: 'Use web portal for Excel file upload' 
              });
            }
          },
          { text: 'Cancel', style: 'cancel' }
        ]
      );
    } catch (err) {
      Toast.show({ type: 'error', text1: 'Failed to select files' });
    }
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return;
    
    setUploading(true);
    const formData = new FormData();
    selectedFiles.forEach(file => {
      formData.append('files', {
        uri: file.uri,
        type: file.type,
        name: file.name,
      } as any);
    });
    
    try {
      const data = await storeService.upload(formData);
      setUploadStats(data);
      Toast.show({ type: 'success', text1: `Success: ${data.successCount}, Errors: ${data.errorCount}` });
      if (data.successCount > 0) {
        fetchStores();
        setSelectedFiles([]);
      }
    } catch (error) {
      Toast.show({ type: 'error', text1: 'Upload failed' });
    } finally {
      setUploading(false);
    }
  };

  // Download Functions
  const handleDownload = async (storeId: string, dealerCode: string, reportType: 'recce' | 'installation', format: 'pdf' | 'ppt' | 'excel') => {
    setDownloadMenuOpen(null);
    try {
      let blob;
      let filename;
      
      if (format === 'pdf') {
        blob = await storeService.getPdf(storeId, reportType);
        filename = `${reportType}_${dealerCode}.pdf`;
      } else if (format === 'excel') {
        blob = await storeService.getExcel(storeId, reportType);
        filename = `${reportType}_${dealerCode}.xlsx`;
      } else {
        blob = await storeService.getPpt(storeId, reportType);
        filename = `${reportType}_${dealerCode}.pptx`;
      }
      
      await fileService.downloadFile(blob, filename);
      Toast.show({ type: 'success', text1: `${format.toUpperCase()} Downloaded!` });
    } catch (error) {
      Toast.show({ type: 'error', text1: 'Download failed' });
    }
  };

  const openAssignModal = async (stage: 'RECCE' | 'INSTALLATION', specificStore?: Store) => {
    console.log('Opening assign modal', { stage, specificStore: !!specificStore });
    
    if (specificStore) {
      setSingleAssignTarget(specificStore);
    } else {
      if (selectedStoreIds.size === 0) {
        Toast.show({ type: 'error', text1: 'Select stores first' });
        return;
      }
      setSingleAssignTarget(null);
    }
    
    setAssignStage(stage);
    setSelectedUserId('');
    
    try {
      const roleCode = stage === 'RECCE' ? 'RECCE' : 'INSTALLATION';
      const data = await userService.getByRole(roleCode);
      setAvailableUsers(data.users || []);
      setIsAssignModalOpen(true);
      console.log('Assign modal opened successfully');
    } catch (error) {
      console.error('Error opening assign modal:', error);
      Toast.show({ type: 'error', text1: `Failed to fetch ${stage} users` });
      setAvailableUsers([]);
    }
  };

  const handleAssign = async () => {
    if (!selectedUserId) {
      Toast.show({ type: 'error', text1: 'Please select a user' });
      return;
    }
    
    try {
      const idsToAssign = singleAssignTarget ? [singleAssignTarget._id] : Array.from(selectedStoreIds);
      await storeService.assign(idsToAssign, selectedUserId, assignStage);
      Toast.show({ type: 'success', text1: 'Assignment successful!' });
      setIsAssignModalOpen(false);
      setSelectedStoreIds(new Set());
      setSingleAssignTarget(null);
      fetchStores();
    } catch (error: any) {
      Toast.show({ type: 'error', text1: error.response?.data?.message || 'Assignment failed' });
    }
  };

  const handleAddStore = async () => {
    if (!newStore.storeName || !newStore.dealerCode || !newStore.city) {
      Toast.show({ type: 'error', text1: 'Please fill required fields' });
      return;
    }

    try {
      await storeService.create({
        storeName: newStore.storeName,
        dealerCode: newStore.dealerCode,
        location: {
          city: newStore.city,
          state: newStore.state,
          address: newStore.address
        }
      });
      Toast.show({ type: 'success', text1: 'Store added successfully!' });
      setIsAddStoreModalOpen(false);
      setNewStore({ storeName: '', dealerCode: '', city: '', state: '', address: '' });
      fetchStores();
    } catch (error: any) {
      Toast.show({ type: 'error', text1: error.response?.data?.message || 'Failed to add store' });
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
          {item.specs && (
            <View>
              <Text style={{ color: theme.colors.textSecondary, fontSize: 12 }}>Dimensions</Text>
              <Text style={{ color: theme.colors.text, fontSize: 14, fontWeight: '600' }}>
                {item.specs.width}x{item.specs.height} ft
              </Text>
            </View>
          )}
          <View>
            <Text style={{ color: theme.colors.textSecondary, fontSize: 12 }}>Total Cost</Text>
            <Text style={{ color: '#10B981', fontSize: 14, fontWeight: '600' }}>
              ₹{item.commercials?.totalCost?.toLocaleString() || '0'}
            </Text>
          </View>
        </View>

        <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
          <TouchableOpacity 
            onPress={() => nav?.navigate('StoreDetail', { storeId: item._id })} 
            style={{ flex: 1, backgroundColor: '#3B82F620', padding: 10, borderRadius: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}
          >
            <Eye size={16} color="#3B82F6" />
            <Text style={{ color: '#3B82F6', marginLeft: 6, fontWeight: '600', fontSize: 12 }}>View</Text>
          </TouchableOpacity>
          
          {item.currentStatus === StoreStatus.UPLOADED && (
            <TouchableOpacity 
              onPress={() => openAssignModal('RECCE', item)} 
              style={{ backgroundColor: '#3B82F620', padding: 10, borderRadius: 8 }}
            >
              <UserPlus size={16} color="#3B82F6" />
            </TouchableOpacity>
          )}
          
          {item.currentStatus === StoreStatus.RECCE_SUBMITTED && (
            <>
              <TouchableOpacity 
                onPress={() => handleApproveRecce(item._id)} 
                style={{ backgroundColor: '#10B98120', padding: 10, borderRadius: 8 }}
              >
                <Check size={16} color="#10B981" />
              </TouchableOpacity>
              <TouchableOpacity 
                onPress={() => handleRejectRecce(item._id)} 
                style={{ backgroundColor: '#EF444420', padding: 10, borderRadius: 8 }}
              >
                <XCircle size={16} color="#EF4444" />
              </TouchableOpacity>
            </>
          )}
          
          {item.currentStatus === StoreStatus.RECCE_APPROVED && (
            <TouchableOpacity 
              onPress={() => openAssignModal('INSTALLATION', item)} 
              style={{ backgroundColor: '#10B98120', padding: 10, borderRadius: 8 }}
            >
              <UserPlus size={16} color="#10B981" />
            </TouchableOpacity>
          )}
          
          <TouchableOpacity 
            onPress={() => handleDelete(item)} 
            style={{ backgroundColor: '#EF444420', padding: 10, borderRadius: 8 }}
          >
            <Trash2 size={16} color="#EF4444" />
          </TouchableOpacity>
          
          {[StoreStatus.RECCE_SUBMITTED, StoreStatus.RECCE_APPROVED, StoreStatus.INSTALLATION_ASSIGNED, StoreStatus.INSTALLATION_SUBMITTED, StoreStatus.COMPLETED].includes(item.currentStatus as StoreStatus) && (
            <TouchableOpacity 
              onPress={() => {
                const reportType = item.currentStatus === StoreStatus.COMPLETED ? 'installation' : 'recce';
                handleDownload(item._id, item.dealerCode, reportType, 'pdf');
              }}
              style={{ backgroundColor: '#F59E0B20', padding: 10, borderRadius: 8 }}
            >
              <Download size={16} color="#F59E0B" />
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <View style={{ padding: 16 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <View>
            <Text style={{ fontSize: 24, fontWeight: 'bold', color: theme.colors.text }}>Store Operations</Text>
            <Text style={{ fontSize: 14, color: theme.colors.textSecondary }}>Manage and track all store activities</Text>
          </View>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <TouchableOpacity 
              onPress={handleExportStores} 
              disabled={isExporting}
              style={{ 
                backgroundColor: '#10B981', 
                paddingHorizontal: 12, 
                paddingVertical: 8, 
                borderRadius: 8,
                opacity: isExporting ? 0.6 : 1
              }}
            >
              {isExporting ? (
                <ActivityIndicator size="small" color="#FFF" />
              ) : (
                <Download size={16} color="#FFF" />
              )}
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={() => {
                console.log('Plus clicked, setting modal to true');
                setIsAddStoreModalOpen(true);
                setTimeout(() => console.log('Modal state after click:', isAddStoreModalOpen), 100);
              }} 
              style={{ backgroundColor: theme.colors.primary, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8 }}
            >
              <Plus size={16} color="#FFF" />
            </TouchableOpacity>
          </View>
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
            onPress={() => setShowStatusFilter(!showStatusFilter)}
            style={{ backgroundColor: theme.colors.surface, padding: 12, borderRadius: 8, borderWidth: 1, borderColor: theme.colors.border, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}
          >
            <Text style={{ color: theme.colors.text, fontSize: 14 }}>
              {filterStatus === 'ALL' ? 'All Status' : filterStatus.replace(/_/g, ' ')}
            </Text>
            <ChevronDown size={16} color={theme.colors.textSecondary} />
          </TouchableOpacity>
          
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
          
          {selectedStoreIds.size > 0 && (
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <TouchableOpacity 
                onPress={() => handleBulkAssign('RECCE')}
                style={{ flex: 1, backgroundColor: '#3B82F6', padding: 12, borderRadius: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}
              >
                <UserPlus size={16} color="#FFF" />
                <Text style={{ color: '#FFF', marginLeft: 6, fontWeight: '600' }}>
                  Assign Recce ({selectedStoreIds.size})
                </Text>
              </TouchableOpacity>
              <TouchableOpacity 
                onPress={() => handleBulkAssign('INSTALLATION')}
                style={{ backgroundColor: '#10B981', padding: 12, borderRadius: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}
              >
                <UserPlus size={16} color="#FFF" />
              </TouchableOpacity>
              <TouchableOpacity 
                onPress={handleBulkDelete}
                style={{ backgroundColor: '#EF4444', padding: 12, borderRadius: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}
              >
                <Trash2 size={16} color="#FFF" />
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>

      {loading ? (
        <PageSkeleton type="list" />
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
                No stores found
              </Text>
            </View>
          }
        />
      )}

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
              <Text style={{ fontSize: 18, fontWeight: 'bold', color: theme.colors.text, marginBottom: 16 }}>
                Assign {assignStage}
              </Text>
              
              <ScrollView style={{ maxHeight: 300 }}>
                {availableUsers.map(user => (
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
                  disabled={!selectedUserId}
                  style={{
                    flex: 1,
                    padding: 12,
                    borderRadius: 8,
                    backgroundColor: selectedUserId ? theme.colors.primary : theme.colors.border,
                    alignItems: 'center'
                  }}
                >
                  <Text style={{ color: '#FFF', fontWeight: '600' }}>Assign</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal>

      {/* Add Store Modal */}
      <Modal
        visible={isAddStoreModalOpen}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsAddStoreModalOpen(false)}
      >
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}>
          <View style={{ backgroundColor: theme.colors.background, borderTopLeftRadius: 20, borderTopRightRadius: 20, maxHeight: '80%' }}>
            <View style={{ padding: 20 }}>
              <Text style={{ fontSize: 18, fontWeight: 'bold', color: theme.colors.text, marginBottom: 16 }}>Add New Store</Text>
              
              <ScrollView style={{ maxHeight: 400 }}>
                <View style={{ gap: 16 }}>
                  <View>
                    <Text style={{ color: theme.colors.text, fontSize: 14, fontWeight: '600', marginBottom: 8 }}>Store Name *</Text>
                    <TextInput
                      style={{ backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: theme.colors.border, borderRadius: 8, padding: 12, color: theme.colors.text, fontSize: 16 }}
                      value={newStore.storeName}
                      onChangeText={(text) => setNewStore({ ...newStore, storeName: text })}
                      placeholder="Enter store name"
                      placeholderTextColor={theme.colors.textSecondary}
                    />
                  </View>
                  <View>
                    <Text style={{ color: theme.colors.text, fontSize: 14, fontWeight: '600', marginBottom: 8 }}>Dealer Code *</Text>
                    <TextInput
                      style={{ backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: theme.colors.border, borderRadius: 8, padding: 12, color: theme.colors.text, fontSize: 16 }}
                      value={newStore.dealerCode}
                      onChangeText={(text) => setNewStore({ ...newStore, dealerCode: text })}
                      placeholder="Enter dealer code"
                      placeholderTextColor={theme.colors.textSecondary}
                    />
                  </View>
                  <View>
                    <Text style={{ color: theme.colors.text, fontSize: 14, fontWeight: '600', marginBottom: 8 }}>City *</Text>
                    <TextInput
                      style={{ backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: theme.colors.border, borderRadius: 8, padding: 12, color: theme.colors.text, fontSize: 16 }}
                      value={newStore.city}
                      onChangeText={(text) => setNewStore({ ...newStore, city: text })}
                      placeholder="Enter city"
                      placeholderTextColor={theme.colors.textSecondary}
                    />
                  </View>
                  <View>
                    <Text style={{ color: theme.colors.text, fontSize: 14, fontWeight: '600', marginBottom: 8 }}>State</Text>
                    <TextInput
                      style={{ backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: theme.colors.border, borderRadius: 8, padding: 12, color: theme.colors.text, fontSize: 16 }}
                      value={newStore.state}
                      onChangeText={(text) => setNewStore({ ...newStore, state: text })}
                      placeholder="Enter state"
                      placeholderTextColor={theme.colors.textSecondary}
                    />
                  </View>
                  <View>
                    <Text style={{ color: theme.colors.text, fontSize: 14, fontWeight: '600', marginBottom: 8 }}>Address</Text>
                    <TextInput
                      style={{ backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: theme.colors.border, borderRadius: 8, padding: 12, color: theme.colors.text, fontSize: 16, minHeight: 80, textAlignVertical: 'top' }}
                      value={newStore.address}
                      onChangeText={(text) => setNewStore({ ...newStore, address: text })}
                      placeholder="Enter full address"
                      placeholderTextColor={theme.colors.textSecondary}
                      multiline
                    />
                  </View>
                </View>
              </ScrollView>
              
              <View style={{ flexDirection: 'row', gap: 12, marginTop: 16 }}>
                <TouchableOpacity
                  onPress={() => {
                    setIsAddStoreModalOpen(false);
                    setNewStore({ storeName: '', dealerCode: '', city: '', state: '', address: '' });
                  }}
                  style={{ flex: 1, padding: 12, borderRadius: 8, backgroundColor: theme.colors.surface, alignItems: 'center' }}
                >
                  <Text style={{ color: theme.colors.text, fontWeight: '600' }}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleAddStore}
                  disabled={!newStore.storeName || !newStore.dealerCode || !newStore.city}
                  style={{ flex: 1, padding: 12, borderRadius: 8, backgroundColor: (!newStore.storeName || !newStore.dealerCode || !newStore.city) ? theme.colors.border : theme.colors.primary, alignItems: 'center' }}
                >
                  <Text style={{ color: '#FFF', fontWeight: '600' }}>Add Store</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal>

      {/* Upload Modal */}
      <Modal
        visible={uploadModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setUploadModalVisible(false)}
      >
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}>
          <View style={{ backgroundColor: theme.colors.background, borderTopLeftRadius: 20, borderTopRightRadius: 20, maxHeight: '80%' }}>
            <View style={{ padding: 20 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <Text style={{ fontSize: 18, fontWeight: 'bold', color: theme.colors.text }}>Bulk Upload Stores</Text>
                <TouchableOpacity onPress={() => setUploadModalVisible(false)}>
                  <X size={24} color={theme.colors.text} />
                </TouchableOpacity>
              </View>
              
              {uploadStats ? (
                <View style={{ alignItems: 'center', padding: 20 }}>
                  <Text style={{ fontSize: 32, fontWeight: 'bold', color: uploadStats.errorCount === 0 ? '#10B981' : '#F59E0B' }}>
                    {uploadStats.successCount} / {uploadStats.totalProcessed}
                  </Text>
                  <Text style={{ color: theme.colors.textSecondary, marginBottom: 20 }}>Records Processed</Text>
                  <TouchableOpacity onPress={() => { setUploadModalVisible(false); setUploadStats(null); }} style={{ backgroundColor: theme.colors.primary, padding: 16, borderRadius: 8, width: '100%', alignItems: 'center' }}>
                    <Text style={{ color: '#FFF', fontWeight: 'bold' }}>Close</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <ScrollView>
                  <TouchableOpacity 
                    onPress={downloadTemplate} 
                    style={{ backgroundColor: '#10B981', padding: 16, borderRadius: 8, alignItems: 'center', marginBottom: 16 }}
                  >
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <Download size={20} color="#FFF" />
                      <Text style={{ color: '#FFF', marginLeft: 8, fontWeight: 'bold' }}>Download Template</Text>
                    </View>
                  </TouchableOpacity>
                  
                  <View style={{ borderWidth: 2, borderStyle: 'dashed', borderColor: theme.colors.border, padding: 32, borderRadius: 8, alignItems: 'center', marginBottom: 16 }}>
                    <Upload size={32} color={theme.colors.textSecondary} />
                    <Text style={{ color: theme.colors.text, marginTop: 8, fontWeight: '600' }}>File Upload</Text>
                    <Text style={{ color: theme.colors.textSecondary, fontSize: 12, textAlign: 'center', marginTop: 4 }}>
                      Please use the web portal for bulk Excel file upload
                    </Text>
                  </View>
                  
                  <TouchableOpacity 
                    onPress={() => setUploadModalVisible(false)}
                    style={{ backgroundColor: theme.colors.primary, padding: 16, borderRadius: 8, alignItems: 'center' }}
                  >
                    <Text style={{ color: '#FFF', fontWeight: 'bold' }}>Close</Text>
                  </TouchableOpacity>
                </ScrollView>
              )}
            </View>
          </View>
        </View>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal visible={deleteModalVisible} animationType="fade" transparent>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center', padding: 20 }}>
          <View style={{ backgroundColor: theme.colors.background, borderRadius: 16, padding: 24, width: '100%', maxWidth: 400, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 8 }}>
            <View style={{ alignItems: 'center', marginBottom: 20 }}>
              <View style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: '#EF444420', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                <Trash2 size={32} color="#EF4444" />
              </View>
              <Text style={{ fontSize: 20, fontWeight: 'bold', color: theme.colors.text, marginBottom: 8 }}>Delete Store</Text>
              <Text style={{ fontSize: 14, color: theme.colors.textSecondary, textAlign: 'center', lineHeight: 20 }}>
                Are you sure you want to delete "{storeToDelete?.storeName}"? This action cannot be undone and will permanently remove all store data including recce and installation records.
              </Text>
            </View>
            
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <TouchableOpacity
                onPress={() => {
                  setDeleteModalVisible(false);
                  setStoreToDelete(null);
                }}
                style={{ flex: 1, padding: 14, borderRadius: 12, backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: theme.colors.border, alignItems: 'center' }}
              >
                <Text style={{ color: theme.colors.text, fontSize: 16, fontWeight: '600' }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={confirmDelete}
                style={{ flex: 1, padding: 14, borderRadius: 12, backgroundColor: '#EF4444', alignItems: 'center' }}
              >
                <Text style={{ color: '#FFF', fontSize: 16, fontWeight: '600' }}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}