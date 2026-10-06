import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, TextInput, RefreshControl, Alert, Modal, ScrollView, ActivityIndicator, StyleSheet } from 'react-native';
import { Search, Plus, Eye, Trash2, Check, XCircle, ChevronDown, Upload, UserPlus, CheckSquare, Square, Download, FileText, FileSpreadsheet, MoreVertical, X, User, Wrench, Filter, ChevronLeft, ChevronRight, MapPin, Phone, Store as StoreIcon, Navigation, Layers } from 'lucide-react-native';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { storeService } from '../../services/storeService';
import { userService } from '../../services/userService';
import { fileService } from '../../services/fileService';
import { modernDownloadService } from '../../services/modernDownloadService';
import { permissionService } from '../../services/permissionService';
import { locationService } from '../../services/locationService';
import { LinearGradient } from 'react-native-linear-gradient';
import Toast from 'react-native-toast-message';
import { useNavigation } from '@react-navigation/native';
import PageSkeleton from '../../components/PageSkeleton';
import BulkUpload from '../../components/BulkUpload';
import {
  Card, StatusBadge, Button, Chip, Checkbox, Avatar, MetaGrid, AssigneeRow,
  ScreenHeader, SearchBar, ActiveFilters, SelectionBar, Pagination, EmptyState,
  BottomSheet, ConfirmDialog,
  FormSection, FieldRow, TextField, SelectField, ToggleCard, SegmentedControl,
  tone, statusMeta,
} from '../../components/ui';

interface Store {
  _id: string;
  storeId?: string;
  dealerCode: string;
  storeName: string;
  location: {
    city: string;
    state?: string;
  };
  contact?: {
    mobile?: string;
    personName?: string;
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
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [availableCities, setAvailableCities] = useState<string[]>([]);
  const [showCityDropdown, setShowCityDropdown] = useState(false);
  const [showFilterClientDropdown, setShowFilterClientDropdown] = useState(false);
  
  // Download menu state
  const [downloadMenuOpen, setDownloadMenuOpen] = useState<{storeId: string; type: string} | null>(null);
  
  // New store form data
  const [newStoreData, setNewStoreData] = useState({
    zone: '', state: '', district: '', city: '',
    vendorCode: '', dealerCode: '', dealerName: '', dealerAddress: '',
    clientCode: '',
    latitude: '', longitude: '',
    directInstallation: false,
    boards: [] as { elementId: string; elementName: string; quantity: number; customRate: number; width: string; height: string; unit: string }[]
  });
  const [openBoardElementIndex, setOpenBoardElementIndex] = useState<number | null>(null);

  // Add Store Modal - using ref to prevent re-render issues
  const [isAddStoreModalOpen, setIsAddStoreModalOpen] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [storeToDelete, setStoreToDelete] = useState<Store | null>(null);
  const [fetchingLocation, setFetchingLocation] = useState(false);

  const handleGetCurrentLocation = async () => {
    try {
      setFetchingLocation(true);
      Toast.show({ type: 'info', text1: 'Acquiring GPS location...' });
      const loc = await locationService.getCurrentLocation();
      if (!loc || !loc.latitude || !loc.longitude) {
        Toast.show({ type: 'error', text1: 'Could not acquire GPS position' });
        return;
      }

      let geo: any = null;
      try {
        geo = await locationService.reverseGeocode(loc.latitude, loc.longitude);
      } catch (e) {
        console.warn('Reverse geocode fallback:', e);
      }

      // The geocoder returns plain "lat, lng" as formattedAddress when every
      // lookup fails. Never put that into the Address field.
      const hasRealAddress = !!(geo && (geo.street || geo.city || geo.state || geo.postalCode));

      // The user tapped "Use GPS", so the GPS result replaces whatever is in
      // the fields (same as the recce form). Previously these were only filled
      // when empty, so a partial / coordinate-only first result got stuck.
      setNewStoreData((prev) => ({
        ...prev,
        latitude: String(loc.latitude.toFixed(6)),
        longitude: String(loc.longitude.toFixed(6)),
        ...(hasRealAddress && {
          dealerAddress: geo.formattedAddress || prev.dealerAddress,
          city: geo.city || prev.city,
          district: geo.district || prev.district,
          state: geo.state || prev.state,
        }),
      }));

      if (hasRealAddress) {
        Toast.show({ type: 'success', text1: 'GPS Location Detected', text2: geo.formattedAddress });
      } else {
        Toast.show({
          type: 'info',
          text1: 'Coordinates saved',
          text2: 'Could not look up the address. Please type it in.',
        });
      }
    } catch (err: any) {
      console.error('GPS detection error:', err);
      Alert.alert(
        'GPS Location Error',
        err?.message || 'Failed to detect current location. Please verify that Location (GPS) is turned on in your device settings.'
      );
    } finally {
      setFetchingLocation(false);
    }
  };

  useEffect(() => {
    fetchClients();
    fetchCities();
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

  const fetchCities = async () => {
    try {
      const response = await storeService.getCities();
      setAvailableCities(response.cities || response.data?.cities || []);
    } catch (error) {
      console.error('Failed to fetch cities', error);
      setAvailableCities([]);
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
    fetchStores(1);
  }, [searchTerm, filterStatus]);

  const fetchStores = async (pageOverride?: number) => {
    const requestedPage = pageOverride ?? page;
    try {
      setLoading(true);
      const params = {
        page: requestedPage,
        limit: 20,
        status: filterStatus !== 'ALL' ? filterStatus : undefined,
        search: searchTerm || undefined,
        city: filterCity || undefined,
        clientCode: filterClientCode || undefined,
        clientName: filterClientName || undefined,
      };

      if (pageOverride !== undefined && pageOverride !== page) {
        setPage(pageOverride);
      }

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

  const isDirectInstallBoardsInvalid = () => {
    if (!newStoreData.directInstallation) return false;
    if (newStoreData.boards.length === 0) return true;
    return newStoreData.boards.some(b => !b.width || !b.height || !b.elementId);
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
    if (newStoreData.directInstallation && newStoreData.boards.length === 0) {
      Toast.show({ type: 'error', text1: 'Add at least one board for Direct Installation' });
      return;
    }
    if (isDirectInstallBoardsInvalid()) {
      Toast.show({ type: 'error', text1: 'Each board needs a width, height and element selected' });
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
        },
        directInstallation: newStoreData.directInstallation,
        ...(newStoreData.directInstallation && { boards: newStoreData.boards })
      };
      const response = await storeService.create(payload);
      Toast.show({
        type: 'success',
        text1: response?.autoAssigned ? 'Store added' : 'Store added successfully!',
        text2: response?.autoAssigned ? (response.message || undefined) : undefined,
      });
      setIsAddStoreModalOpen(false);
      setOpenBoardElementIndex(null);
      setNewStoreData({
        zone: '', state: '', district: '', city: '',
        vendorCode: '', dealerCode: '', dealerName: '', dealerAddress: '',
        clientCode: '',
        latitude: '', longitude: '',
        directInstallation: false,
        boards: []
      });
      fetchStores();
      
      // Show assign recce option after successful store creation
      if (response.store && !response.autoAssigned) {
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

  // ---------------------------------------------------------------------------
  // UI-only helpers (no new behaviour — these are the same handlers that were
  // previously written inline in the JSX, moved here so the JSX stays readable).
  // ---------------------------------------------------------------------------
  const REPORT_STATUSES = [StoreStatus.RECCE_SUBMITTED, StoreStatus.RECCE_APPROVED, StoreStatus.INSTALLATION_ASSIGNED, StoreStatus.INSTALLATION_SUBMITTED, StoreStatus.COMPLETED];

  // Filters are applied after state settles, so fetchStores() always sees the
  // new values (previously Reset could re-fetch with the old city/client).
  const [filterRefetchToken, setFilterRefetchToken] = useState(0);
  useEffect(() => {
    if (filterRefetchToken > 0) fetchStores(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterRefetchToken]);

  const sheetFilterCount = (filterCity ? 1 : 0) + (filterClientCode ? 1 : 0);

  const resetSheetFilters = () => {
    setFilterCity('');
    setFilterClientCode('');
    setFilterClientName('');
    setFilterStatus('ALL');
    setFilterRefetchToken(t => t + 1);
  };

  const applySheetFilters = () => {
    setShowFilterPanel(false);
    setShowCityDropdown(false);
    setShowFilterClientDropdown(false);
    setFilterRefetchToken(t => t + 1);
  };

  const resetNewStoreForm = () => {
    setNewStoreData({
      zone: '', state: '', district: '', city: '',
      vendorCode: '', dealerCode: '', dealerName: '', dealerAddress: '',
      clientCode: '',
      latitude: '', longitude: '',
      directInstallation: false,
      boards: []
    });
  };

  const closeAddStore = () => {
    setIsAddStoreModalOpen(false);
    setOpenBoardElementIndex(null);
    setShowClientDropdown(false);
    resetNewStoreForm();
  };

  const updateBoard = (index: number, patch: any) => {
    const newBoards = [...newStoreData.boards];
    newBoards[index] = { ...newBoards[index], ...patch };
    setNewStoreData({ ...newStoreData, boards: newBoards });
  };

  const handleHeaderExport = async () => {
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
  };

  const handleSelectionPPT = async () => {
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
  };

  const handleSelectionPDF = async () => {
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
  };

  const handleCardDownload = async (item: Store, format: 'pdf' | 'ppt') => {
    const storeId = item._id;
    setCardDownloadStates(prev => ({
      ...prev,
      [storeId]: { ...prev[storeId], [format]: true }
    }));

    try {
      const reportType = item.currentStatus === StoreStatus.COMPLETED ? 'installation' : 'recce';
      if (format === 'pdf') {
        const blob = await storeService.getPdf(item._id, reportType);
        await modernDownloadService.downloadFile({
          blob,
          filename: `${reportType}_${item.dealerCode}.pdf`
        });
      } else {
        const blob = await storeService.getPpt(item._id, reportType);
        await modernDownloadService.downloadFile({
          blob,
          filename: `${reportType}_${item.dealerCode}.pptx`
        });
      }
    } catch (error) {
      Toast.show({ type: 'error', text1: format === 'pdf' ? 'PDF Download Failed' : 'PPT Download Failed' });
    } finally {
      setCardDownloadStates(prev => ({
        ...prev,
        [storeId]: { ...prev[storeId], [format]: false }
      }));
    }
  };

  const addStoreDisabled = !newStoreData.dealerCode || !newStoreData.dealerName || !newStoreData.clientCode || isDirectInstallBoardsInvalid();
  const selectedClientForForm = clients.find(c => c.clientCode === newStoreData.clientCode);

  // ---------------------------------------------------------------------------
  // Store card
  // ---------------------------------------------------------------------------
  const renderStore = ({ item }: { item: Store }) => {
    const isSelected = selectedStoreIds.has(item._id);
    // Allow selection for stores with completed recce data (same as web portal)
    const canSelect = [StoreStatus.RECCE_SUBMITTED, StoreStatus.RECCE_APPROVED, StoreStatus.INSTALLATION_ASSIGNED, StoreStatus.INSTALLATION_SUBMITTED, StoreStatus.COMPLETED].includes(item.currentStatus as StoreStatus);
    const hasReports = REPORT_STATUSES.includes(item.currentStatus as StoreStatus);
    const locationText = [item.location?.city, item.location?.state].filter(Boolean).join(', ');

    const recceStatus =
      item.currentStatus === 'RECCE_SUBMITTED' ? { label: 'Submitted', color: tone.warning }
      : item.currentStatus === 'RECCE_APPROVED' ? { label: 'Approved', color: tone.success }
      : null;
    const installStatus =
      item.currentStatus === 'INSTALLATION_SUBMITTED' ? { label: 'Submitted', color: tone.teal }
      : item.currentStatus === 'COMPLETED' ? { label: 'Completed', color: tone.success }
      : null;

    return (
      <Card
        selected={isSelected}
        onPress={() => nav?.navigate('StoreDetail', { storeId: item._id })}
        style={{ marginBottom: 12 }}
      >
        {/* Top: select · identity · status */}
        <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 12 }}>
          {canSelect && (
            <View style={{ paddingTop: 2 }}>
              <Checkbox checked={isSelected} onPress={() => toggleStoreSelection(item._id)} />
            </View>
          )}
          <View style={{ flex: 1, gap: 3 }}>
            <Text style={{ color: theme.colors.textSecondary, fontSize: 11, fontWeight: '800', letterSpacing: 0.6 }} numberOfLines={1}>
              {item.storeId || item.dealerCode}
            </Text>
            <Text style={{ color: theme.colors.text, fontSize: 16, fontWeight: '800' }} numberOfLines={2}>
              {item.storeName}
            </Text>
            {!!locationText && (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <MapPin size={12} color={theme.colors.textSecondary} />
                <Text style={{ color: theme.colors.textSecondary, fontSize: 12, flex: 1 }} numberOfLines={1}>{locationText}</Text>
              </View>
            )}
            {item.contact?.mobile && (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <Phone size={12} color={theme.colors.textSecondary} />
                <Text style={{ color: theme.colors.textSecondary, fontSize: 12 }}>{item.contact.mobile}</Text>
              </View>
            )}
          </View>
          <StatusBadge status={item.currentStatus} />
        </View>

        {/* Key facts */}
        <View style={{ marginTop: 12 }}>
          <MetaGrid
            items={[
              { label: 'Dealer code', value: item.dealerCode || '—' },
              !!item.specs && { label: 'Size', value: `${item.specs!.width}×${item.specs!.height} ft` },
              canViewCosts && { label: 'Total cost', value: `₹${item.commercials?.totalCost?.toLocaleString() || '0'}`, color: tone.success },
            ]}
          />
        </View>

        {/* Who's on it */}
        {(item.workflow?.recceAssignedTo || item.workflow?.installationAssignedTo) && (
          <View style={{ marginTop: 10, gap: 2 }}>
            {item.workflow?.recceAssignedTo && (
              <AssigneeRow role="Recce ·" name={item.workflow.recceAssignedTo.name} color={tone.info} status={recceStatus} />
            )}
            {item.workflow?.installationAssignedTo && (
              <AssigneeRow role="Install ·" name={item.workflow.installationAssignedTo.name} color={tone.success} status={installStatus} />
            )}
          </View>
        )}

        {/* Actions */}
        <View style={{ height: StyleSheet.hairlineWidth, backgroundColor: theme.colors.border, marginVertical: 12 }} />
        <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          <Button
            label="View"
            variant="soft"
            color={tone.info}
            size="sm"
            icon={(col) => <Eye size={15} color={col} />}
            onPress={() => nav?.navigate('StoreDetail', { storeId: item._id })}
          />

          {(item.currentStatus === StoreStatus.UPLOADED || !item.workflow.recceAssignedTo) && (
            <Button
              label="Assign recce"
              variant="soft"
              color={tone.info}
              size="sm"
              icon={(col) => <UserPlus size={15} color={col} />}
              onPress={() => openAssignModal('RECCE', item)}
            />
          )}

          {isAdminUser && item.currentStatus === StoreStatus.RECCE_SUBMITTED && (
            <>
              <Button label="Approve" variant="soft" color={tone.success} size="sm" icon={(col) => <Check size={15} color={col} />} onPress={() => handleApproveRecce(item._id)} />
              <Button label="Reject" variant="soft" color={tone.danger} size="sm" icon={(col) => <XCircle size={15} color={col} />} onPress={() => handleRejectRecce(item._id)} />
            </>
          )}

          {item.currentStatus === StoreStatus.RECCE_APPROVED && (
            <Button
              label="Assign install"
              variant="soft"
              color={tone.success}
              size="sm"
              icon={(col) => <Wrench size={15} color={col} />}
              onPress={() => openAssignModal('INSTALLATION', item)}
            />
          )}

          <View style={{ flex: 1 }} />

          {hasReports && (
            <>
              <Button
                label="PDF"
                variant="outline"
                color={tone.danger}
                size="sm"
                loading={!!cardDownloadStates[item._id]?.pdf}
                icon={(col) => <FileText size={14} color={col} />}
                onPress={() => handleCardDownload(item, 'pdf')}
              />
              <Button
                label="PPT"
                variant="outline"
                color={tone.warning}
                size="sm"
                loading={!!cardDownloadStates[item._id]?.ppt}
                icon={(col) => <FileSpreadsheet size={14} color={col} />}
                onPress={() => handleCardDownload(item, 'ppt')}
              />
            </>
          )}

          <Button
            variant="soft"
            color={tone.danger}
            size="sm"
            icon={(col) => <Trash2 size={15} color={col} />}
            onPress={() => handleDelete(item)}
          />
        </View>
      </Card>
    );
  };

  // ---------------------------------------------------------------------------
  // Screen
  // ---------------------------------------------------------------------------
  const statusChips = ['ALL', ...Object.values(StoreStatus)];
  const activeFilterItems = [
    filterCity ? { key: 'city', label: `City: ${filterCity}`, onRemove: () => { setFilterCity(''); setFilterRefetchToken(t => t + 1); } } : null,
    filterClientCode ? { key: 'client', label: `Client: ${filterClientName || filterClientCode}`, onRemove: () => { setFilterClientCode(''); setFilterClientName(''); setFilterRefetchToken(t => t + 1); } } : null,
  ].filter(Boolean) as Array<{ key: string; label: string; onRemove: () => void }>;

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      {/* Fixed header: title, search, status chips, selection bar */}
      <View style={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 6 }}>
        <ScreenHeader
          title="Stores"
          subtitle="Manage store activities"
          count={totalStores}
          actions={
            <>
              {/* Hide BulkUpload component in mobile - users should use web portal */}
              {/* <BulkUpload onUploadComplete={fetchStores} /> */}
              <Button
                variant="outline"
                loading={isExporting}
                disabled={isExporting}
                icon={(col) => <Download size={18} color={col} />}
                onPress={handleHeaderExport}
              />
              <Button
                label="Add"
                variant="primary"
                icon={(col) => <Plus size={18} color={col} strokeWidth={2.5} />}
                onPress={() => setIsAddStoreModalOpen(true)}
              />
            </>
          }
        />

        <SearchBar
          value={searchTerm}
          onChangeText={setSearchTerm}
          placeholder="Search store, dealer code, city…"
          onFilterPress={() => setShowFilterPanel(true)}
          activeFilters={sheetFilterCount}
        />

        <ActiveFilters items={activeFilterItems} onClearAll={resetSheetFilters} />

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingTop: 12, paddingBottom: 2 }}>
          {statusChips.map((status) => (
            <Chip
              key={status}
              label={status === 'ALL' ? 'All' : statusMeta(status).label}
              color={status === 'ALL' ? undefined : statusMeta(status).color}
              active={filterStatus === status}
              onPress={() => setFilterStatus(status)}
            />
          ))}
        </ScrollView>

        <SelectionBar count={selectedStoreIds.size} noun="store" onClear={() => setSelectedStoreIds(new Set())}>
          <Button
            label="PPT"
            variant="solid"
            color={tone.warning}
            size="sm"
            loading={isDownloadingPPT}
            icon={(col) => <FileSpreadsheet size={14} color={col} />}
            onPress={handleSelectionPPT}
          />
          <Button
            label="PDF"
            variant="solid"
            color={tone.danger}
            size="sm"
            loading={isDownloadingPDF}
            icon={(col) => <FileText size={14} color={col} />}
            onPress={handleSelectionPDF}
          />
        </SelectionBar>
      </View>

      {loading ? (
        <PageSkeleton type="list" />
      ) : (
        <FlatList
          data={stores}
          renderItem={renderStore}
          keyExtractor={(item) => item._id}
          contentContainerStyle={{ padding: 16, paddingTop: 10, paddingBottom: 32 }}
          keyboardShouldPersistTaps="handled"
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                setRefreshing(true);
                fetchStores();
              }}
              colors={[theme.colors.primary]}
              tintColor={theme.colors.primary}
            />
          }
          ListEmptyComponent={
            <EmptyState
              title="No stores found"
              message={searchTerm || filterStatus !== 'ALL' || sheetFilterCount ? 'Try a different search or clear the filters.' : 'Add your first store to get started.'}
              icon={<StoreIcon size={28} color={theme.colors.textTertiary} />}
              action={
                searchTerm || filterStatus !== 'ALL' || sheetFilterCount ? (
                  <Button label="Clear filters" variant="outline" onPress={() => { setSearchTerm(''); resetSheetFilters(); }} />
                ) : (
                  <Button label="Add store" variant="primary" icon={(col) => <Plus size={16} color={col} />} onPress={() => setIsAddStoreModalOpen(true)} />
                )
              }
            />
          }
          ListFooterComponent={
            stores.length > 0 ? (
              <Pagination
                page={page}
                totalPages={totalPages}
                total={totalStores}
                noun="stores"
                onPrev={() => page > 1 && fetchStores(page - 1)}
                onNext={() => page < totalPages && fetchStores(page + 1)}
              />
            ) : null
          }
        />
      )}

      {/* ---------------- Filter sheet (City / Client) ---------------- */}
      <BottomSheet
        visible={showFilterPanel}
        onClose={() => setShowFilterPanel(false)}
        title="Filter stores"
        subtitle="Narrow the list by city or client"
        icon={<Filter size={18} color={theme.colors.text} />}
        footer={
          <>
            <Button label="Reset" variant="outline" size="lg" flex onPress={() => { resetSheetFilters(); setShowFilterPanel(false); }} />
            <Button label="Apply filters" variant="primary" size="lg" flex onPress={applySheetFilters} />
          </>
        }
      >
        <SelectField
          label="City"
          placeholder="All cities"
          valueText={filterCity || undefined}
          selectedKey={filterCity}
          open={showCityDropdown}
          onToggle={() => setShowCityDropdown(!showCityDropdown)}
          searchable={availableCities.length > 8}
          options={[{ key: '', label: 'All cities', muted: true }, ...availableCities.map((city) => ({ key: city, label: city }))]}
          onSelect={(o) => { setFilterCity(o.key); setShowCityDropdown(false); }}
        />
        <SelectField
          label="Client"
          placeholder="All clients"
          valueText={filterClientCode ? `${filterClientName || filterClientCode}` : undefined}
          selectedKey={filterClientCode}
          open={showFilterClientDropdown}
          onToggle={() => setShowFilterClientDropdown(!showFilterClientDropdown)}
          searchable={clients.length > 8}
          options={[
            { key: '', label: 'All clients', muted: true },
            ...clients.map((client) => ({ key: client.clientCode, label: client.clientName, sublabel: client.clientCode })),
          ]}
          onSelect={(o) => {
            if (!o.key) {
              setFilterClientCode('');
              setFilterClientName('');
            } else {
              setFilterClientCode(o.key);
              setFilterClientName(o.label);
            }
            setShowFilterClientDropdown(false);
          }}
        />
      </BottomSheet>

      {/* ---------------- Assign sheet ---------------- */}
      <BottomSheet
        visible={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        title={assignStage === 'RECCE' ? 'Assign recce' : 'Assign installation'}
        subtitle={singleAssignTarget ? singleAssignTarget.storeName : `${selectedStoreIds.size} store${selectedStoreIds.size === 1 ? '' : 's'} selected`}
        icon={<UserPlus size={18} color={theme.colors.text} />}
        maxHeight="85%"
        footer={
          <>
            <Button label="Cancel" variant="outline" size="lg" flex onPress={() => setIsAssignModalOpen(false)} />
            <Button label="Assign" variant="primary" size="lg" flex disabled={!selectedUserId} onPress={handleAssign} />
          </>
        }
      >
        <SearchBar value={userSearchTerm} onChangeText={setUserSearchTerm} placeholder="Search by name or email…" />
        <View style={{ gap: 8 }}>
          {filteredUsers.length === 0 ? (
            <EmptyState title="No users found" message={`No ${assignStage === 'RECCE' ? 'recce' : 'installation'} users match your search.`} />
          ) : filteredUsers.map(user => {
            const sel = selectedUserId === user._id;
            return (
              <TouchableOpacity
                key={user._id}
                onPress={() => setSelectedUserId(user._id)}
                activeOpacity={0.8}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 12,
                  padding: 12,
                  borderRadius: 14,
                  backgroundColor: sel ? theme.colors.primary + '18' : theme.colors.surface,
                  borderWidth: sel ? 1.5 : 1,
                  borderColor: sel ? theme.colors.primary : theme.colors.border,
                }}
              >
                <Avatar name={user.name} size={40} filled={sel} />
                <View style={{ flex: 1 }}>
                  <Text style={{ color: theme.colors.text, fontWeight: '800', fontSize: 14 }} numberOfLines={1}>{user.name}</Text>
                  <Text style={{ color: theme.colors.textSecondary, fontSize: 12 }} numberOfLines={1}>{user.email}</Text>
                </View>
                <Checkbox checked={sel} onPress={() => setSelectedUserId(user._id)} />
              </TouchableOpacity>
            );
          })}
        </View>
      </BottomSheet>

      {/* ---------------- Add Store sheet ---------------- */}
      <BottomSheet
        visible={isAddStoreModalOpen}
        onClose={closeAddStore}
        title="Add new store"
        subtitle="Fields marked * are required"
        icon={<StoreIcon size={18} color={theme.colors.text} />}
        footer={
          <>
            <Button label="Cancel" variant="outline" size="lg" flex onPress={closeAddStore} />
            <Button label="Add store" variant="primary" size="lg" flex disabled={addStoreDisabled} onPress={handleAddStore} />
          </>
        }
      >
        {/* 1 · Store details */}
        <FormSection step={1} title="Store details" description="Pick the client first, then the dealer">
          <SelectField
            label="Client"
            required
            placeholder="Select client"
            valueText={newStoreData.clientCode ? `${selectedClientForForm?.clientName || newStoreData.clientCode} (${newStoreData.clientCode})` : undefined}
            selectedKey={newStoreData.clientCode}
            open={showClientDropdown}
            onToggle={() => setShowClientDropdown(!showClientDropdown)}
            searchable
            emptyText="No clients found"
            options={clients.map((client) => ({ key: client.clientCode, label: client.clientName, sublabel: client.clientCode }))}
            onSelect={(o) => {
              setNewStoreData({ ...newStoreData, clientCode: o.key });
              setShowClientDropdown(false);
            }}
          />
          <FieldRow>
            <TextField
              label="Dealer code"
              required
              value={newStoreData.dealerCode}
              onChangeText={(text) => setNewStoreData({ ...newStoreData, dealerCode: text })}
              placeholder="e.g. DL1023"
              autoCapitalize="characters"
            />
            <TextField
              label="Vendor code"
              value={newStoreData.vendorCode}
              onChangeText={(text) => setNewStoreData({ ...newStoreData, vendorCode: text })}
              placeholder="Optional"
              autoCapitalize="characters"
            />
          </FieldRow>
          <TextField
            label="Dealer / store name"
            required
            value={newStoreData.dealerName}
            onChangeText={(text) => setNewStoreData({ ...newStoreData, dealerName: text })}
            placeholder="Enter dealer name"
          />
        </FormSection>

        {/* 2 · Location */}
        <FormSection
          step={2}
          title="Location"
          description="Where the store is"
          right={
            <Button
              label={fetchingLocation ? 'Locating…' : 'Use GPS'}
              variant="soft"
              color={tone.info}
              size="sm"
              loading={fetchingLocation}
              icon={(col) => <Navigation size={14} color={col} />}
              onPress={handleGetCurrentLocation}
            />
          }
        >
          <FieldRow>
            <TextField label="Zone" value={newStoreData.zone} onChangeText={(text) => setNewStoreData({ ...newStoreData, zone: text })} placeholder="Zone" />
            <TextField label="State" value={newStoreData.state} onChangeText={(text) => setNewStoreData({ ...newStoreData, state: text })} placeholder="State" />
          </FieldRow>
          <FieldRow>
            <TextField label="District" required value={newStoreData.district} onChangeText={(text) => setNewStoreData({ ...newStoreData, district: text })} placeholder="District" />
            <TextField label="City" required value={newStoreData.city} onChangeText={(text) => setNewStoreData({ ...newStoreData, city: text })} placeholder="City" />
          </FieldRow>
          <TextField
            label="Address"
            value={newStoreData.dealerAddress}
            onChangeText={(text) => setNewStoreData({ ...newStoreData, dealerAddress: text })}
            placeholder="Full address"
            multiline
          />
          <FieldRow>
            <TextField
              label="Latitude"
              value={newStoreData.latitude}
              onChangeText={(text) => setNewStoreData({ ...newStoreData, latitude: text })}
              placeholder="28.7041"
              keyboardType="numeric"
            />
            <TextField
              label="Longitude"
              value={newStoreData.longitude}
              onChangeText={(text) => setNewStoreData({ ...newStoreData, longitude: text })}
              placeholder="77.1025"
              keyboardType="numeric"
            />
          </FieldRow>
        </FormSection>

        {/* 3 · Workflow */}
        <FormSection step={3} title="Workflow" description="Normal flow starts with a recce">
          <ToggleCard
            value={newStoreData.directInstallation}
            onToggle={() => setNewStoreData({
              ...newStoreData,
              directInstallation: !newStoreData.directInstallation,
              boards: !newStoreData.directInstallation ? newStoreData.boards : []
            })}
            icon={<Layers size={20} color={newStoreData.directInstallation ? theme.colors.text : theme.colors.textSecondary} />}
            title="Direct installation"
            description="Skip recce and add the boards now"
          />

          {newStoreData.directInstallation && (
            <View style={{ gap: 12 }}>
              {newStoreData.boards.length === 0 && (
                <Text style={{ color: theme.colors.textSecondary, fontSize: 12, textAlign: 'center', paddingVertical: 6 }}>
                  No boards yet — add at least one board.
                </Text>
              )}

              {newStoreData.boards.map((board, index) => (
                <View key={index} style={{ borderWidth: 1, borderColor: theme.colors.border, borderRadius: 14, padding: 12, gap: 12, backgroundColor: theme.colors.background }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                      <View style={{ width: 24, height: 24, borderRadius: 7, backgroundColor: theme.colors.surfaceSecondary, alignItems: 'center', justifyContent: 'center' }}>
                        <Text style={{ color: theme.colors.text, fontSize: 11, fontWeight: '900' }}>{index + 1}</Text>
                      </View>
                      <Text style={{ color: theme.colors.text, fontSize: 13, fontWeight: '800' }}>Board {index + 1}</Text>
                    </View>
                    <Button
                      variant="ghost"
                      color={tone.danger}
                      size="sm"
                      icon={(col) => <Trash2 size={15} color={col} />}
                      onPress={() => {
                        const newBoards = newStoreData.boards.filter((_, i) => i !== index);
                        setNewStoreData({ ...newStoreData, boards: newBoards });
                        if (openBoardElementIndex === index) setOpenBoardElementIndex(null);
                      }}
                    />
                  </View>

                  <FieldRow>
                    <TextField label="Width" required value={board.width} onChangeText={(text) => updateBoard(index, { width: text })} placeholder="W" keyboardType="numeric" />
                    <TextField label="Height" required value={board.height} onChangeText={(text) => updateBoard(index, { height: text })} placeholder="H" keyboardType="numeric" />
                    <SegmentedControl
                      label="Unit"
                      options={[{ key: 'ft', label: 'ft' }, { key: 'in', label: 'in' }]}
                      value={board.unit}
                      onChange={(k) => updateBoard(index, { unit: k })}
                    />
                  </FieldRow>

                  <SelectField
                    label="Element"
                    required
                    placeholder={newStoreData.clientCode ? 'Select element' : 'Select a client first'}
                    valueText={board.elementId ? `${board.elementName} (₹${board.customRate}/sq.unit)` : undefined}
                    selectedKey={board.elementId}
                    open={openBoardElementIndex === index}
                    onToggle={() => setOpenBoardElementIndex(openBoardElementIndex === index ? null : index)}
                    emptyText="No elements configured for this client"
                    options={(selectedClientForForm?.elements || []).map((el: any) => ({ key: el.elementId, label: el.elementName, sublabel: `₹${el.customRate}/sq.unit` }))}
                    onSelect={(o) => {
                      const el = (selectedClientForForm?.elements || []).find((e: any) => e.elementId === o.key);
                      if (el) updateBoard(index, { elementId: el.elementId, elementName: el.elementName, customRate: el.customRate });
                      setOpenBoardElementIndex(null);
                    }}
                  />

                  <View style={{ width: 110 }}>
                    <TextField
                      label="Quantity"
                      value={String(board.quantity)}
                      onChangeText={(text) => updateBoard(index, { quantity: Number(text) || 1 })}
                      placeholder="1"
                      keyboardType="numeric"
                    />
                  </View>
                </View>
              ))}

              <Button
                label="Add board"
                variant="outline"
                icon={(col) => <Plus size={16} color={col} />}
                onPress={() => setNewStoreData({
                  ...newStoreData,
                  boards: [...newStoreData.boards, { elementId: '', elementName: '', quantity: 1, customRate: 0, width: '', height: '', unit: 'ft' }]
                })}
              />
            </View>
          )}
        </FormSection>
      </BottomSheet>

      {/* ---------------- Upload sheet (web-portal notice, unchanged behaviour) ---------------- */}
      <BottomSheet
        visible={uploadModalVisible}
        onClose={() => setUploadModalVisible(false)}
        title="Bulk upload stores"
        icon={<Upload size={18} color={theme.colors.text} />}
        footer={
          <Button
            label="Close"
            variant="primary"
            size="lg"
            flex
            onPress={() => { setUploadModalVisible(false); if (uploadStats) setUploadStats(null); }}
          />
        }
      >
        {uploadStats ? (
          <View style={{ alignItems: 'center', paddingVertical: 12 }}>
            <Text style={{ fontSize: 34, fontWeight: '900', color: uploadStats.errorCount === 0 ? tone.success : tone.warning }}>
              {uploadStats.successCount} / {uploadStats.totalProcessed}
            </Text>
            <Text style={{ color: theme.colors.textSecondary }}>Records processed</Text>
          </View>
        ) : (
          <>
            <Button label="Download template" variant="solid" color={tone.success} size="lg" icon={(col) => <Download size={18} color={col} />} onPress={downloadTemplate} />
            <View style={{ borderWidth: 2, borderStyle: 'dashed', borderColor: theme.colors.border, padding: 28, borderRadius: 16, alignItems: 'center' }}>
              <Upload size={30} color={theme.colors.textSecondary} />
              <Text style={{ color: theme.colors.text, marginTop: 8, fontWeight: '800' }}>File upload</Text>
              <Text style={{ color: theme.colors.textSecondary, fontSize: 12, textAlign: 'center', marginTop: 4 }}>
                Please use the web portal for bulk Excel file upload
              </Text>
            </View>
          </>
        )}
      </BottomSheet>

      {/* ---------------- Delete confirmation ---------------- */}
      <ConfirmDialog
        visible={deleteModalVisible}
        title="Delete store?"
        message={`"${storeToDelete?.storeName || ''}" and all its recce and installation records will be permanently removed. This can't be undone.`}
        icon={<Trash2 size={28} color={tone.danger} />}
        confirmLabel="Delete"
        onConfirm={confirmDelete}
        onCancel={() => {
          setDeleteModalVisible(false);
          setStoreToDelete(null);
        }}
      />
    </View>
  );
}
