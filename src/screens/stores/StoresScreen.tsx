import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, TextInput, RefreshControl, Alert, Modal, ScrollView, ActivityIndicator, StyleSheet } from 'react-native';
import { Search, Plus, Eye, Trash2, Check, XCircle, ChevronDown, Upload, UserPlus, CheckSquare, Square, Download, FileText, FileSpreadsheet, MoreVertical, X, User, Wrench } from 'lucide-react-native';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { storeService } from '../../services/storeService';
import { userService } from '../../services/userService';
import { fileService } from '../../services/fileService';
import { modernDownloadService } from '../../services/modernDownloadService';
import { permissionService } from '../../services/permissionService';
import { LinearGradient } from 'react-native-linear-gradient';
import Toast from 'react-native-toast-message';
import { useNavigation } from '@react-navigation/native';
import PageSkeleton from '../../components/PageSkeleton';
import BulkUpload from '../../components/BulkUpload';

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
  
  const navigation = useNavigation();
  const nav = navigationProp || navigation;
  const { theme } = useTheme();
  const { isAdmin, canViewCommercialInfo } = useAuth();
  const isAdminUser = isAdmin();
  const canViewCosts = canViewCommercialInfo();
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
  const [filteredUsers, setFilteredUsers] = useState<any[]>([]);
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [selectedUserId, setSelectedUserId] = useState('');
  const [singleAssignTarget, setSingleAssignTarget] = useState<Store | null>(null);

  // Additional filters
  const [filterCity, setFilterCity] = useState('');
  const [filterClientCode, setFilterClientCode] = useState('');
  const [filterClientName, setFilterClientName] = useState('');
  const [clients, setClients] = useState<any[]>([]);
  const [showClientDropdown, setShowClientDropdown] = useState(false);
  
  // Download menu state
  const [downloadMenuOpen, setDownloadMenuOpen] = useState<{storeId: string; type: string} | null>(null);
  
  // New store form data
  const [newStoreData, setNewStoreData] = useState({
    zone: '', state: '', district: '', city: '',
    vendorCode: '', dealerCode: '', dealerName: '', dealerAddress: '',
    clientCode: '',
    latitude: '', longitude: ''
  });

  // Add Store Modal - using ref to prevent re-render issues
  const [isAddStoreModalOpen, setIsAddStoreModalOpen] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [storeToDelete, setStoreToDelete] = useState<Store | null>(null);

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      const response = await storeService.getClients();
      setClients(response.clients || response.data?.clients || response.data || []);
    } catch (error) {
      console.error('Failed to fetch clients', error);
      setClients([]);
    }
  };

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

  // Bulk Upload
  const [uploadModalVisible, setUploadModalVisible] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadStats, setUploadStats] = useState<any>(null);

  // Export and Bulk Operations
  const [isExporting, setIsExporting] = useState(false);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [isDownloadingPPT, setIsDownloadingPPT] = useState(false);
  const [isDownloadingPDF, setIsDownloadingPDF] = useState(false);
  
  // Individual card download states
  const [cardDownloadStates, setCardDownloadStates] = useState<{[key: string]: {pdf: boolean, ppt: boolean}}>({});

  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalStores, setTotalStores] = useState(0);

  useEffect(() => {
    fetchStores();
  }, [searchTerm, filterStatus]);

  const fetchStores = async () => {
    try {
      setLoading(true);
      const params = {
        page,
        limit: 20,
        status: filterStatus !== 'ALL' ? filterStatus : undefined,
        search: searchTerm || undefined,
        city: filterCity || undefined,
        clientCode: filterClientCode || undefined,
        clientName: filterClientName || undefined,
      };
      
      const data = await storeService.getAll(params);
      setStores(data.stores || []);
      if (data.pagination) {
        setTotalPages(data.pagination.pages);
        setTotalStores(data.pagination.total);
      }
      
    } catch (error) {
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
    // Request storage permission first
    const hasPermission = await permissionService.checkStoragePermission();
    if (!hasPermission) {
      const granted = await permissionService.requestStoragePermission();
      if (!granted) {
        permissionService.showStoragePermissionDeniedAlert();
        return;
      }
    }
    
    setIsExporting(true);
    try {
      Toast.show({ type: 'info', text1: 'Preparing Excel...', text2: 'Please wait' });
      
      const params = {
        status: filterStatus !== 'ALL' ? filterStatus : undefined,
        search: searchTerm || undefined,
        city: filterCity || undefined,
        clientCode: filterClientCode || undefined,
        clientName: filterClientName || undefined,
      };
      
      const blob = await storeService.exportStores(params);
      
      if (!blob || blob.size === 0) {
        throw new Error('Empty file received from server');
      }
      
      await fileService.downloadFile(blob, `Stores_Export_${new Date().toISOString().split('T')[0]}.xlsx`);
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to export stores';
      Toast.show({ type: 'error', text1: 'Export Failed', text2: errorMessage });
    } finally {
      setIsExporting(false);
    }
  };

  const handleBulkPPTDownload = async () => {
    if (selectedStoreIds.size === 0) {
      Toast.show({ type: 'error', text1: 'Please select stores' });
      return;
    }
    
    // Request storage permission first
    const hasPermission = await permissionService.checkStoragePermission();
    if (!hasPermission) {
      const granted = await permissionService.requestStoragePermission();
      if (!granted) {
        permissionService.showStoragePermissionDeniedAlert();
        return;
      }
    }
    
    const selectedIds = Array.from(selectedStoreIds);
    
    setIsDownloadingPPT(true);
    try {
      Toast.show({ type: 'info', text1: 'Preparing PPT...', text2: 'Please wait' });
      
      const reportType = 'recce';
      const blob = await storeService.bulkPpt(selectedIds, reportType);
      
      if (!blob || blob.size === 0) {
        throw new Error('Empty file received from server');
      }
      
      await fileService.downloadFile(blob, `Store_Report_${selectedStoreIds.size}_Stores.pptx`);
      setSelectedStoreIds(new Set());
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to download PPTs';
      Toast.show({ type: 'error', text1: 'Download Failed', text2: errorMessage });
    } finally {
      setIsDownloadingPPT(false);
    }
  };

  const handleBulkPDFDownload = async () => {
    if (selectedStoreIds.size === 0) {
      Toast.show({ type: 'error', text1: 'Please select stores' });
      return;
    }
    
    // Request storage permission first
    const hasPermission = await permissionService.checkStoragePermission();
    if (!hasPermission) {
      const granted = await permissionService.requestStoragePermission();
      if (!granted) {
        permissionService.showStoragePermissionDeniedAlert();
        return;
      }
    }
    
    const selectedIds = Array.from(selectedStoreIds);
    
    setIsDownloadingPDF(true);
    try {
      Toast.show({ type: 'info', text1: 'Preparing PDF...', text2: 'Please wait' });
      
      const reportType = 'recce';
      const blob = await storeService.bulkPdf(selectedIds, reportType);
      
      if (!blob || blob.size === 0) {
        throw new Error('Empty file received from server');
      }
      
      await fileService.downloadFile(blob, `Store_Report_${selectedStoreIds.size}_Stores.pdf`);
      setSelectedStoreIds(new Set());
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to download PDFs';
      Toast.show({ type: 'error', text1: 'Download Failed', text2: errorMessage });
    } finally {
      setIsDownloadingPDF(false);
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

  // Download Functions with menu support
  const toggleDownloadMenu = (storeId: string, type: string) => {
    if (downloadMenuOpen?.storeId === storeId && downloadMenuOpen?.type === type) {
      setDownloadMenuOpen(null);
    } else {
      setDownloadMenuOpen({ storeId, type });
    }
  };

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
    } catch (error) {
      Toast.show({ type: 'error', text1: 'Download failed' });
    }
  };

  const openAssignModal = async (stage: 'RECCE' | 'INSTALLATION', specificStore?: Store) => {
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
    if (!newStoreData.dealerCode || !newStoreData.dealerName) {
      Toast.show({ type: 'error', text1: 'Dealer Code and Name are required' });
      return;
    }
    if (!newStoreData.clientCode) {
      Toast.show({ type: 'error', text1: 'Client Code is required' });
      return;
    }

    try {
      const payload = {
        dealerCode: newStoreData.dealerCode,
        storeName: newStoreData.dealerName,
        vendorCode: newStoreData.vendorCode,
        clientCode: newStoreData.clientCode,
        location: {
          zone: newStoreData.zone,
          state: newStoreData.state,
          district: newStoreData.district,
          city: newStoreData.city,
          address: newStoreData.dealerAddress,
          ...(newStoreData.latitude && newStoreData.longitude && {
            coordinates: {
              lat: Number(newStoreData.latitude),
              lng: Number(newStoreData.longitude)
            }
          })
        }
      };
      const response = await storeService.create(payload);
      Toast.show({ type: 'success', text1: 'Store added successfully!' });
      setIsAddStoreModalOpen(false);
      setNewStoreData({
        zone: '', state: '', district: '', city: '',
        vendorCode: '', dealerCode: '', dealerName: '', dealerAddress: '',
        clientCode: '',
        latitude: '', longitude: ''
      });
      fetchStores();
      
      // Show assign recce option after successful store creation
      if (response.store) {
        setTimeout(() => {
          Toast.show({
            type: 'info',
            text1: 'Store Created Successfully!',
            text2: 'Tap the assign button (👤+) to assign recce inspection',
            visibilityTime: 5000
          });
        }, 1000);
      }
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
    // Allow selection for stores with completed recce data (same as web portal)
    const canSelect = [StoreStatus.RECCE_SUBMITTED, StoreStatus.RECCE_APPROVED, StoreStatus.INSTALLATION_ASSIGNED, StoreStatus.INSTALLATION_SUBMITTED, StoreStatus.COMPLETED].includes(item.currentStatus as StoreStatus);
    
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
          {canSelect && (
            <TouchableOpacity onPress={() => toggleStoreSelection(item._id)} style={{ marginRight: 12 }}>
              {isSelected ? 
                <CheckSquare size={20} color={theme.colors.primary} /> : 
                <Square size={20} color={theme.colors.textSecondary} />
              }
            </TouchableOpacity>
          )}
          
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
          {canViewCosts && (
            <View>
              <Text style={{ color: theme.colors.textSecondary, fontSize: 12 }}>Total Cost</Text>
              <Text style={{ color: '#10B981', fontSize: 14, fontWeight: '600' }}>
                ₹{item.commercials?.totalCost?.toLocaleString() || '0'}
              </Text>
            </View>
          )}
        </View>

        {/* Show Recce Assignment Info */}
        {item.workflow?.recceAssignedTo && (
          <View style={{ 
            backgroundColor: '#3B82F610', 
            borderRadius: 8, 
            padding: 8, 
            marginBottom: 12,
            borderWidth: 1,
            borderColor: '#3B82F620'
          }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <User size={14} color="#3B82F6" />
                <Text style={{ color: '#3B82F6', fontSize: 12, fontWeight: '600', marginLeft: 4 }}>Recce By:</Text>
                <Text style={{ color: theme.colors.text, fontSize: 12, fontWeight: '600', marginLeft: 4 }}>
                  {item.workflow.recceAssignedTo.name}
                </Text>
              </View>
              {item.currentStatus === 'RECCE_SUBMITTED' && (
                <View style={{ backgroundColor: '#F59E0B20', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 8 }}>
                  <Text style={{ color: '#F59E0B', fontSize: 10, fontWeight: '600' }}>SUBMITTED</Text>
                </View>
              )}
              {item.currentStatus === 'RECCE_APPROVED' && (
                <View style={{ backgroundColor: '#10B98120', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 8 }}>
                  <Text style={{ color: '#10B981', fontSize: 10, fontWeight: '600' }}>APPROVED</Text>
                </View>
              )}
            </View>
          </View>
        )}

        {/* Show Installation Assignment Info */}
        {item.workflow?.installationAssignedTo && (
          <View style={{ 
            backgroundColor: '#10B98110', 
            borderRadius: 8, 
            padding: 8, 
            marginBottom: 12,
            borderWidth: 1,
            borderColor: '#10B98120'
          }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Wrench size={14} color="#10B981" />
                <Text style={{ color: '#10B981', fontSize: 12, fontWeight: '600', marginLeft: 4 }}>Installation By:</Text>
                <Text style={{ color: theme.colors.text, fontSize: 12, fontWeight: '600', marginLeft: 4 }}>
                  {item.workflow.installationAssignedTo.name}
                </Text>
              </View>
              {item.currentStatus === 'INSTALLATION_SUBMITTED' && (
                <View style={{ backgroundColor: '#14B8A620', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 8 }}>
                  <Text style={{ color: '#14B8A6', fontSize: 10, fontWeight: '600' }}>SUBMITTED</Text>
                </View>
              )}
              {item.currentStatus === 'COMPLETED' && (
                <View style={{ backgroundColor: '#10B98120', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 8 }}>
                  <Text style={{ color: '#10B981', fontSize: 10, fontWeight: '600' }}>COMPLETED</Text>
                </View>
              )}
            </View>
          </View>
        )}

        <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
          <TouchableOpacity 
            onPress={() => nav?.navigate('StoreDetail', { storeId: item._id })} 
            style={{ flex: 1, backgroundColor: '#3B82F620', padding: 10, borderRadius: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}
          >
            <Eye size={16} color="#3B82F6" />
            <Text style={{ color: '#3B82F6', marginLeft: 6, fontWeight: '600', fontSize: 12 }}>View</Text>
          </TouchableOpacity>
          
          {(item.currentStatus === StoreStatus.UPLOADED || !item.workflow.recceAssignedTo) && (
            <TouchableOpacity 
              onPress={() => openAssignModal('RECCE', item)} 
              style={{ backgroundColor: '#3B82F620', padding: 10, borderRadius: 8, flexDirection: 'row', alignItems: 'center', minWidth: 80, justifyContent: 'center' }}
            >
              <UserPlus size={16} color="#3B82F6" />
              <Text style={{ color: '#3B82F6', marginLeft: 4, fontWeight: '600', fontSize: 11 }}>Assign</Text>
            </TouchableOpacity>
          )}
          
          {isAdminUser && item.currentStatus === StoreStatus.RECCE_SUBMITTED && (
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
              style={{ backgroundColor: '#10B98120', padding: 10, borderRadius: 8, flexDirection: 'row', alignItems: 'center', minWidth: 80, justifyContent: 'center' }}
            >
              <UserPlus size={16} color="#10B981" />
              <Text style={{ color: '#10B981', marginLeft: 4, fontWeight: '600', fontSize: 11 }}>Install</Text>
            </TouchableOpacity>
          )}
          
          <TouchableOpacity 
            onPress={() => handleDelete(item)} 
            style={{ backgroundColor: '#EF444420', padding: 10, borderRadius: 8 }}
          >
            <Trash2 size={16} color="#EF4444" />
          </TouchableOpacity>
          
          {[StoreStatus.RECCE_SUBMITTED, StoreStatus.RECCE_APPROVED, StoreStatus.INSTALLATION_ASSIGNED, StoreStatus.INSTALLATION_SUBMITTED, StoreStatus.COMPLETED].includes(item.currentStatus as StoreStatus) && (
            <View style={{ flexDirection: 'row', gap: 4 }}>
              {/* PDF Download */}
              <TouchableOpacity
                onPress={async () => {
                  const storeId = item._id;
                  setCardDownloadStates(prev => ({
                    ...prev,
                    [storeId]: { ...prev[storeId], pdf: true }
                  }));
                  
                  try {
                    const reportType = item.currentStatus === StoreStatus.COMPLETED ? 'installation' : 'recce';
                    const blob = await storeService.getPdf(item._id, reportType);
                    await modernDownloadService.downloadFile({
                      blob,
                      filename: `${reportType}_${item.dealerCode}.pdf`
                    });
                  } catch (error) {
                    Toast.show({ type: 'error', text1: 'PDF Download Failed' });
                  } finally {
                    setCardDownloadStates(prev => ({
                      ...prev,
                      [storeId]: { ...prev[storeId], pdf: false }
                    }));
                  }
                }}
                disabled={cardDownloadStates[item._id]?.pdf}
                style={{ 
                  backgroundColor: '#EF4444', 
                  paddingHorizontal: 12, 
                  paddingVertical: 8, 
                  borderRadius: 8, 
                  flexDirection: 'row', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  minWidth: 60,
                  shadowColor: '#EF4444',
                  shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: 0.2,
                  shadowRadius: 2,
                  elevation: 2
                }}
              >
                {cardDownloadStates[item._id]?.pdf ? (
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <ActivityIndicator size="small" color="#FFF" />
                    <Text style={{ color: '#FFF', fontSize: 9, fontWeight: '600', marginLeft: 4 }}>...</Text>
                  </View>
                ) : (
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <FileText size={14} color="#FFF" />
                    <Text style={{ color: '#FFF', fontSize: 11, fontWeight: '600', marginLeft: 4 }}>PDF</Text>
                  </View>
                )}
              </TouchableOpacity>
              
              {/* PPT Download */}
              <TouchableOpacity
                onPress={async () => {
                  const storeId = item._id;
                  setCardDownloadStates(prev => ({
                    ...prev,
                    [storeId]: { ...prev[storeId], ppt: true }
                  }));
                  
                  try {
                    const reportType = item.currentStatus === StoreStatus.COMPLETED ? 'installation' : 'recce';
                    const blob = await storeService.getPpt(item._id, reportType);
                    await modernDownloadService.downloadFile({
                      blob,
                      filename: `${reportType}_${item.dealerCode}.pptx`
                    });
                  } catch (error) {
                    Toast.show({ type: 'error', text1: 'PPT Download Failed' });
                  } finally {
                    setCardDownloadStates(prev => ({
                      ...prev,
                      [storeId]: { ...prev[storeId], ppt: false }
                    }));
                  }
                }}
                disabled={cardDownloadStates[item._id]?.ppt}
                style={{ 
                  backgroundColor: '#F59E0B', 
                  paddingHorizontal: 12, 
                  paddingVertical: 8, 
                  borderRadius: 8, 
                  flexDirection: 'row', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  minWidth: 60,
                  shadowColor: '#F59E0B',
                  shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: 0.2,
                  shadowRadius: 2,
                  elevation: 2
                }}
              >
                {cardDownloadStates[item._id]?.ppt ? (
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <ActivityIndicator size="small" color="#FFF" />
                    <Text style={{ color: '#FFF', fontSize: 9, fontWeight: '600', marginLeft: 4 }}>...</Text>
                  </View>
                ) : (
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <FileSpreadsheet size={14} color="#FFF" />
                    <Text style={{ color: '#FFF', fontSize: 11, fontWeight: '600', marginLeft: 4 }}>PPT</Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      {/* Simple Header */}
      <View style={{ padding: 16 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <View>
            <Text style={{ fontSize: 24, fontWeight: 'bold', color: theme.colors.text }}>Store Operations</Text>
            <Text style={{ fontSize: 14, color: theme.colors.textSecondary }}>Manage store activities</Text>
          </View>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            {/* Hide BulkUpload component in mobile - users should use web portal */}
            {/* <BulkUpload onUploadComplete={fetchStores} /> */}
            <TouchableOpacity
              onPress={async () => {
                try {
                  const params = {
                    status: filterStatus !== 'ALL' ? filterStatus : undefined,
                    search: searchTerm || undefined,
                    city: filterCity || undefined,
                    clientCode: filterClientCode || undefined,
                    clientName: filterClientName || undefined,
                  };
                  const blob = await storeService.exportStores(params);
                  await modernDownloadService.downloadExcel({
                    blob,
                    filename: `Stores_Export_${new Date().toISOString().split('T')[0]}`
                  });
                } catch (error) {
                  Toast.show({ type: 'error', text1: 'Export Failed' });
                }
              }}
              disabled={isExporting}
              style={{ 
                backgroundColor: '#10B981', 
                paddingHorizontal: 12, 
                paddingVertical: 8, 
                borderRadius: 8, 
                flexDirection: 'row', 
                alignItems: 'center',
                opacity: isExporting ? 0.6 : 1
              }}
            >
              {isExporting ? (
                <ActivityIndicator size="small" color="#FFF" />
              ) : (
                <Download size={16} color="#FFF" />
              )}
              <Text style={{ color: '#FFF', fontSize: 12, fontWeight: '600', marginLeft: 4 }}>
                {isExporting ? 'Exporting...' : 'Export'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={() => setIsAddStoreModalOpen(true)} 
              style={{ backgroundColor: theme.colors.primary, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8 }}
            >
              <Plus size={16} color="#FFF" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Simple Search */}
        <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: theme.colors.surface, borderRadius: 8, paddingHorizontal: 12, borderWidth: 1, borderColor: theme.colors.border, marginBottom: 12 }}>
          <Search size={20} color={theme.colors.textSecondary} />
          <TextInput
            style={{ flex: 1, paddingVertical: 12, paddingHorizontal: 8, color: theme.colors.text, fontSize: 16 }}
            placeholder="Search stores..."
            placeholderTextColor={theme.colors.textSecondary}
            value={searchTerm}
            onChangeText={setSearchTerm}
          />
        </View>
        
        {/* Enhanced Bulk Download Buttons with Count */}
        {selectedStoreIds.size > 0 && (
          <View style={{ marginBottom: 12 }}>
            {/* Selection Count Header */}
            <View style={{ 
              flexDirection: 'row', 
              alignItems: 'center', 
              justifyContent: 'space-between',
              backgroundColor: theme.colors.primary + '10',
              paddingHorizontal: 12,
              paddingVertical: 8,
              borderRadius: 8,
              marginBottom: 8,
              borderWidth: 1,
              borderColor: theme.colors.primary + '20'
            }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <CheckSquare size={16} color={theme.colors.primary} />
                <Text style={{ 
                  color: theme.colors.primary, 
                  fontSize: 14, 
                  fontWeight: '600', 
                  marginLeft: 6 
                }}>
                  {selectedStoreIds.size} store{selectedStoreIds.size > 1 ? 's' : ''} selected
                </Text>
              </View>
              <TouchableOpacity 
                onPress={() => setSelectedStoreIds(new Set())}
                style={{ padding: 4 }}
              >
                <X size={16} color={theme.colors.textSecondary} />
              </TouchableOpacity>
            </View>
            
            {/* Download Buttons */}
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <TouchableOpacity
                onPress={async () => {
                  try {
                    const selectedIds = Array.from(selectedStoreIds);
                    const reportType = 'recce';
                    const blob = await storeService.bulkPpt(selectedIds, reportType);
                    await modernDownloadService.downloadFile({
                      blob,
                      filename: `Store_Report_${selectedStoreIds.size}_Stores.pptx`
                    });
                    setSelectedStoreIds(new Set());
                  } catch (error) {
                    Toast.show({ type: 'error', text1: 'PPT Download Failed' });
                  }
                }}
                disabled={isDownloadingPPT}
                style={{ 
                  flex: 1, 
                  backgroundColor: '#F59E0B', 
                  paddingVertical: 14, 
                  paddingHorizontal: 16, 
                  borderRadius: 10, 
                  flexDirection: 'row', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  shadowColor: '#F59E0B',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.2,
                  shadowRadius: 4,
                  elevation: 3
                }}
              >
                {isDownloadingPPT ? (
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <ActivityIndicator size="small" color="#FFF" />
                    <View style={{ 
                      marginLeft: 8, 
                      backgroundColor: 'rgba(255,255,255,0.2)', 
                      paddingHorizontal: 8, 
                      paddingVertical: 2, 
                      borderRadius: 4 
                    }}>
                      <Text style={{ color: '#FFF', fontSize: 10, fontWeight: '600' }}>Generating...</Text>
                    </View>
                  </View>
                ) : (
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <FileSpreadsheet size={18} color="#FFF" />
                    <Text style={{ color: '#FFF', fontSize: 14, fontWeight: '600', marginLeft: 8 }}>PPT</Text>
                    <View style={{ 
                      backgroundColor: 'rgba(255,255,255,0.2)', 
                      paddingHorizontal: 6, 
                      paddingVertical: 2, 
                      borderRadius: 10, 
                      marginLeft: 6 
                    }}>
                      <Text style={{ color: '#FFF', fontSize: 11, fontWeight: '600' }}>{selectedStoreIds.size}</Text>
                    </View>
                  </View>
                )}
              </TouchableOpacity>
              
              <TouchableOpacity
                onPress={async () => {
                  try {
                    const selectedIds = Array.from(selectedStoreIds);
                    const reportType = 'recce';
                    const blob = await storeService.bulkPdf(selectedIds, reportType);
                    await modernDownloadService.downloadFile({
                      blob,
                      filename: `Store_Report_${selectedStoreIds.size}_Stores.pdf`
                    });
                    setSelectedStoreIds(new Set());
                  } catch (error) {
                    Toast.show({ type: 'error', text1: 'PDF Download Failed' });
                  }
                }}
                disabled={isDownloadingPDF}
                style={{ 
                  flex: 1, 
                  backgroundColor: '#EF4444', 
                  paddingVertical: 14, 
                  paddingHorizontal: 16, 
                  borderRadius: 10, 
                  flexDirection: 'row', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  shadowColor: '#EF4444',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.2,
                  shadowRadius: 4,
                  elevation: 3
                }}
              >
                {isDownloadingPDF ? (
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <ActivityIndicator size="small" color="#FFF" />
                    <View style={{ 
                      marginLeft: 8, 
                      backgroundColor: 'rgba(255,255,255,0.2)', 
                      paddingHorizontal: 8, 
                      paddingVertical: 2, 
                      borderRadius: 4 
                    }}>
                      <Text style={{ color: '#FFF', fontSize: 10, fontWeight: '600' }}>Generating...</Text>
                    </View>
                  </View>
                ) : (
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <FileText size={18} color="#FFF" />
                    <Text style={{ color: '#FFF', fontSize: 14, fontWeight: '600', marginLeft: 8 }}>PDF</Text>
                    <View style={{ 
                      backgroundColor: 'rgba(255,255,255,0.2)', 
                      paddingHorizontal: 6, 
                      paddingVertical: 2, 
                      borderRadius: 10, 
                      marginLeft: 6 
                    }}>
                      <Text style={{ color: '#FFF', fontSize: 11, fontWeight: '600' }}>{selectedStoreIds.size}</Text>
                    </View>
                  </View>
                )}
              </TouchableOpacity>
            </View>
          </View>
        )}
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
              
              {/* User Search */}
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
                  {/* Basic Details */}
                  <Text style={{ fontSize: 14, fontWeight: 'bold', color: theme.colors.primary, marginBottom: 8 }}>BASIC DETAILS</Text>
                  
                  <View style={{ flexDirection: 'row', gap: 12 }}>
                    <View style={{ flex: 1 }}>
                      <Text style={{ color: theme.colors.text, fontSize: 12, fontWeight: '600', marginBottom: 8 }}>Dealer Code *</Text>
                      <TextInput
                        style={{ backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: theme.colors.border, borderRadius: 8, padding: 12, color: theme.colors.text, fontSize: 16 }}
                        value={newStoreData.dealerCode}
                        onChangeText={(text) => setNewStoreData({ ...newStoreData, dealerCode: text })}
                        placeholder="Enter dealer code"
                        placeholderTextColor={theme.colors.textSecondary}
                      />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{ color: theme.colors.text, fontSize: 12, fontWeight: '600', marginBottom: 8 }}>Dealer Name *</Text>
                      <TextInput
                        style={{ backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: theme.colors.border, borderRadius: 8, padding: 12, color: theme.colors.text, fontSize: 16 }}
                        value={newStoreData.dealerName}
                        onChangeText={(text) => setNewStoreData({ ...newStoreData, dealerName: text })}
                        placeholder="Enter dealer name"
                        placeholderTextColor={theme.colors.textSecondary}
                      />
                    </View>
                  </View>
                  
                  <View style={{ flexDirection: 'row', gap: 12 }}>
                    <View style={{ flex: 1 }}>
                      <Text style={{ color: theme.colors.text, fontSize: 12, fontWeight: '600', marginBottom: 8 }}>Vendor Code</Text>
                      <TextInput
                        style={{ backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: theme.colors.border, borderRadius: 8, padding: 12, color: theme.colors.text, fontSize: 16 }}
                        value={newStoreData.vendorCode}
                        onChangeText={(text) => setNewStoreData({ ...newStoreData, vendorCode: text })}
                        placeholder="Enter vendor code"
                        placeholderTextColor={theme.colors.textSecondary}
                      />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{ color: theme.colors.text, fontSize: 12, fontWeight: '600', marginBottom: 8 }}>Client Code *</Text>
                      <TouchableOpacity
                        onPress={() => setShowClientDropdown(!showClientDropdown)}
                        style={{ backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: theme.colors.border, borderRadius: 8, padding: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}
                      >
                        <Text style={{ color: newStoreData.clientCode ? theme.colors.text : theme.colors.textSecondary, fontSize: 16 }}>
                          {newStoreData.clientCode ? `${clients.find(c => c.clientCode === newStoreData.clientCode)?.clientName || newStoreData.clientCode} (${newStoreData.clientCode})` : 'Select Client'}
                        </Text>
                        <ChevronDown size={16} color={theme.colors.textSecondary} />
                      </TouchableOpacity>
                      {showClientDropdown && (
                        <View style={{ backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: theme.colors.border, borderRadius: 8, marginTop: 4, maxHeight: 150 }}>
                          <ScrollView>
                            {clients.map((client) => (
                              <TouchableOpacity
                                key={client._id}
                                onPress={() => {
                                  setNewStoreData({ ...newStoreData, clientCode: client.clientCode });
                                  setShowClientDropdown(false);
                                }}
                                style={{ padding: 12, borderBottomWidth: 1, borderBottomColor: theme.colors.border }}
                              >
                                <Text style={{ color: theme.colors.text, fontSize: 14, fontWeight: '600' }}>{client.clientName}</Text>
                                <Text style={{ color: theme.colors.textSecondary, fontSize: 12 }}>{client.clientCode}</Text>
                              </TouchableOpacity>
                            ))}
                          </ScrollView>
                        </View>
                      )}
                    </View>
                  </View>
                  
                  {/* Location */}
                  <Text style={{ fontSize: 14, fontWeight: 'bold', color: theme.colors.primary, marginBottom: 8, marginTop: 16 }}>LOCATION</Text>
                  
                  <View style={{ flexDirection: 'row', gap: 12 }}>
                    <View style={{ flex: 1 }}>
                      <Text style={{ color: theme.colors.text, fontSize: 12, fontWeight: '600', marginBottom: 8 }}>Zone</Text>
                      <TextInput
                        style={{ backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: theme.colors.border, borderRadius: 8, padding: 12, color: theme.colors.text, fontSize: 16 }}
                        value={newStoreData.zone}
                        onChangeText={(text) => setNewStoreData({ ...newStoreData, zone: text })}
                        placeholder="Enter zone"
                        placeholderTextColor={theme.colors.textSecondary}
                      />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{ color: theme.colors.text, fontSize: 12, fontWeight: '600', marginBottom: 8 }}>State</Text>
                      <TextInput
                        style={{ backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: theme.colors.border, borderRadius: 8, padding: 12, color: theme.colors.text, fontSize: 16 }}
                        value={newStoreData.state}
                        onChangeText={(text) => setNewStoreData({ ...newStoreData, state: text })}
                        placeholder="Enter state"
                        placeholderTextColor={theme.colors.textSecondary}
                      />
                    </View>
                  </View>
                  
                  <View style={{ flexDirection: 'row', gap: 12 }}>
                    <View style={{ flex: 1 }}>
                      <Text style={{ color: theme.colors.text, fontSize: 12, fontWeight: '600', marginBottom: 8 }}>District *</Text>
                      <TextInput
                        style={{ backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: theme.colors.border, borderRadius: 8, padding: 12, color: theme.colors.text, fontSize: 16 }}
                        value={newStoreData.district}
                        onChangeText={(text) => setNewStoreData({ ...newStoreData, district: text })}
                        placeholder="Enter district"
                        placeholderTextColor={theme.colors.textSecondary}
                      />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{ color: theme.colors.text, fontSize: 12, fontWeight: '600', marginBottom: 8 }}>City *</Text>
                      <TextInput
                        style={{ backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: theme.colors.border, borderRadius: 8, padding: 12, color: theme.colors.text, fontSize: 16 }}
                        value={newStoreData.city}
                        onChangeText={(text) => setNewStoreData({ ...newStoreData, city: text })}
                        placeholder="Enter city"
                        placeholderTextColor={theme.colors.textSecondary}
                      />
                    </View>
                  </View>
                  
                  <View>
                    <Text style={{ color: theme.colors.text, fontSize: 12, fontWeight: '600', marginBottom: 8 }}>Address</Text>
                    <TextInput
                      style={{ backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: theme.colors.border, borderRadius: 8, padding: 12, color: theme.colors.text, fontSize: 16, minHeight: 80, textAlignVertical: 'top' }}
                      value={newStoreData.dealerAddress}
                      onChangeText={(text) => setNewStoreData({ ...newStoreData, dealerAddress: text })}
                      placeholder="Enter full address"
                      placeholderTextColor={theme.colors.textSecondary}
                      multiline
                    />
                  </View>
                  
                  <View style={{ flexDirection: 'row', gap: 12 }}>
                    <View style={{ flex: 1 }}>
                      <Text style={{ color: theme.colors.text, fontSize: 12, fontWeight: '600', marginBottom: 8 }}>Latitude</Text>
                      <TextInput
                        style={{ backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: theme.colors.border, borderRadius: 8, padding: 12, color: theme.colors.text, fontSize: 16 }}
                        value={newStoreData.latitude}
                        onChangeText={(text) => setNewStoreData({ ...newStoreData, latitude: text })}
                        placeholder="e.g. 28.7041"
                        placeholderTextColor={theme.colors.textSecondary}
                        keyboardType="numeric"
                      />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{ color: theme.colors.text, fontSize: 12, fontWeight: '600', marginBottom: 8 }}>Longitude</Text>
                      <TextInput
                        style={{ backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: theme.colors.border, borderRadius: 8, padding: 12, color: theme.colors.text, fontSize: 16 }}
                        value={newStoreData.longitude}
                        onChangeText={(text) => setNewStoreData({ ...newStoreData, longitude: text })}
                        placeholder="e.g. 77.1025"
                        placeholderTextColor={theme.colors.textSecondary}
                        keyboardType="numeric"
                      />
                    </View>
                  </View>
                </View>
              </ScrollView>
              
              <View style={{ flexDirection: 'row', gap: 12, marginTop: 16 }}>
                <TouchableOpacity
                  onPress={() => {
                    setIsAddStoreModalOpen(false);
                    setNewStoreData({
                      zone: '', state: '', district: '', city: '',
                      vendorCode: '', dealerCode: '', dealerName: '', dealerAddress: '',
                      clientCode: '',
                      latitude: '', longitude: ''
                    });
                  }}
                  style={{ flex: 1, padding: 12, borderRadius: 8, backgroundColor: theme.colors.surface, alignItems: 'center' }}
                >
                  <Text style={{ color: theme.colors.text, fontWeight: '600' }}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleAddStore}
                  disabled={!newStoreData.dealerCode || !newStoreData.dealerName || !newStoreData.clientCode}
                  style={{ flex: 1, padding: 12, borderRadius: 8, backgroundColor: (!newStoreData.dealerCode || !newStoreData.dealerName || !newStoreData.clientCode) ? theme.colors.border : theme.colors.primary, alignItems: 'center' }}
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

