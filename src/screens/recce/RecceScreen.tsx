import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, TextInput, RefreshControl, Alert, ActivityIndicator, Modal, ScrollView, StyleSheet } from 'react-native';
import { Search, Eye, Camera, Upload, MapPin, Clock, Download, FileText, CheckSquare, Square, ChevronDown, ChevronLeft, ChevronRight, FileSpreadsheet, X, UserPlus, CheckCircle2, ClipboardCheck } from 'lucide-react-native';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { recceService } from '../../services/recceService';
import { fileService } from '../../services/fileService';
import { modernDownloadService } from '../../services/modernDownloadService';
import { permissionService } from '../../services/permissionService';
import { userService } from '../../services/userService';
import { storeService } from '../../services/storeService';
import Toast from 'react-native-toast-message';
import PageSkeleton from '../../components/PageSkeleton';
import {
  Card, StatusBadge, Button, Chip, Checkbox, Avatar, MetaGrid,
  ScreenHeader, SearchBar, SelectionBar, Pagination, EmptyState, BottomSheet,
  tone, statusMeta,
} from '../../components/ui';
import { testRecceAPI, debugStorage } from '../../utils/testRecceAPI';
import { StackNavigationProp } from '@react-navigation/stack';
import { RecceStackParamList } from '../../navigation/types';

type RecceScreenNavigationProp = StackNavigationProp<RecceStackParamList, 'RecceList'>;

interface RecceAssignment {
  _id: string;
  store: {
    _id: string;
    dealerCode: string;
    storeName: string;
    location: {
      city: string;
      state?: string;
      address?: string;
    };
  };
  assignedTo: {
    _id: string;
    name: string;
  };
  assignedBy?: {
    _id: string;
    name: string;
  };
  status: string;
  assignedAt: string;
  submittedAt?: string;
  images?: any[];
  remarks?: string;
}

export default function RecceScreen({ navigation }: { navigation: RecceScreenNavigationProp }) {
  const { theme } = useTheme();
  const { isAdmin, canViewCommercialInfo, user } = useAuth();
  const [assignments, setAssignments] = useState<RecceAssignment[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [selectedAssignments, setSelectedAssignments] = useState<Set<string>>(new Set());
  const [isExporting, setIsExporting] = useState(false);
  const [isDownloadingPPT, setIsDownloadingPPT] = useState(false);
  const [isDownloadingPDF, setIsDownloadingPDF] = useState(false);
  const [showStatusFilter, setShowStatusFilter] = useState(false);

  // Bulk "Assign Installation" (admin-only, mirrors elora-web's Recce page action)
  const [isInstallAssignModalOpen, setIsInstallAssignModalOpen] = useState(false);
  const [availableInstallUsers, setAvailableInstallUsers] = useState<any[]>([]);
  const [selectedInstallUserId, setSelectedInstallUserId] = useState('');
  const [isAssigningInstallation, setIsAssigningInstallation] = useState(false);

  // Individual card download states
  const [cardDownloadStates, setCardDownloadStates] = useState<{[key: string]: {pdf: boolean, ppt: boolean}}>({});

  // Enhanced state to match web portal
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalStores, setTotalStores] = useState(0);
  const [debouncedSearch, setDebouncedSearch] = useState('');
  
  // Get admin status from auth context
  const isAdminUser = isAdmin();
  
  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    fetchAssignments();
  }, [debouncedSearch, filterStatus, page, limit]);

  const fetchAssignments = async () => {
    try {
      setLoading(true);
      const params = {
        page,
        limit,
        search: debouncedSearch || undefined,
        status: filterStatus,
      };
      
      const response = await recceService.getAssignments(params);
      
      if (!response || !response.stores) {
        setAssignments([]);
        return;
      }
      
      // Transform stores to assignment format
      const filteredAssignments = response.stores
        .filter((store: any) => store.location && store.location.city)
        .map((store: any) => ({
          _id: store._id,
          store: {
            _id: store._id,
            dealerCode: store.dealerCode,
            storeName: store.storeName,
            location: store.location
          },
          assignedTo: store.workflow?.recceAssignedTo || { name: 'Unassigned' },
          assignedBy: store.workflow?.recceAssignedBy || { name: 'System' },
          status: store.currentStatus,
          assignedAt: store.createdAt || new Date().toISOString(),
          submittedAt: store.updatedAt,
          images: store.recce?.reccePhotos || [],
          remarks: store.remark
        }));
      
      setAssignments(filteredAssignments);
      
      // Set pagination data
      if (response.pagination) {
        setTotalPages(response.pagination.pages);
        setTotalStores(response.pagination.total);
      }
      
    } catch (error) {
      Toast.show({ type: 'error', text1: 'Failed to load recce assignments' });
      setAssignments([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'RECCE_ASSIGNED': return '#3B82F6';
      case 'RECCE_SUBMITTED': return '#F59E0B';
      case 'RECCE_APPROVED': return '#10B981';
      case 'RECCE_REJECTED': return '#EF4444';
      default: return '#6B7280';
    }
  };

  const toggleSelection = (id: string) => {
    const newSet = new Set(selectedAssignments);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedAssignments(newSet);
  };

  // Only Recce-approved stores are eligible to hand off to an installer
  const getEligibleInstallStoreIds = () => {
    return assignments
      .filter(a => selectedAssignments.has(a._id) && a.status === 'RECCE_APPROVED')
      .map(a => a.store._id);
  };

  const openInstallAssignModal = async () => {
    const eligibleIds = getEligibleInstallStoreIds();
    if (eligibleIds.length === 0) {
      Toast.show({ type: 'error', text1: 'Select at least one Recce-approved store' });
      return;
    }
    if (eligibleIds.length < selectedAssignments.size) {
      Toast.show({ type: 'info', text1: `${eligibleIds.length} of ${selectedAssignments.size} selected are eligible`, text2: 'Only Recce-approved stores can be assigned' });
    }

    setSelectedInstallUserId('');
    try {
      const data = await userService.getByRole('INSTALLATION');
      setAvailableInstallUsers(data.users || []);
      setIsInstallAssignModalOpen(true);
    } catch (error) {
      Toast.show({ type: 'error', text1: 'Failed to fetch installation users' });
      setAvailableInstallUsers([]);
    }
  };

  const handleAssignInstallation = async () => {
    if (!selectedInstallUserId) {
      Toast.show({ type: 'error', text1: 'Please select an installer' });
      return;
    }
    const storeIds = getEligibleInstallStoreIds();
    if (storeIds.length === 0) {
      Toast.show({ type: 'error', text1: 'No eligible stores selected' });
      return;
    }

    setIsAssigningInstallation(true);
    try {
      await storeService.assign(storeIds, selectedInstallUserId, 'INSTALLATION');
      Toast.show({ type: 'success', text1: `Installation assigned to ${storeIds.length} store${storeIds.length > 1 ? 's' : ''}` });
      setIsInstallAssignModalOpen(false);
      setSelectedAssignments(new Set());
      fetchAssignments();
    } catch (error: any) {
      Toast.show({ type: 'error', text1: error.response?.data?.message || 'Assignment failed' });
    } finally {
      setIsAssigningInstallation(false);
    }
  };

  const handleExport = async () => {
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
      const blob = await recceService.exportRecce();
      
      if (!blob || blob.size === 0) {
        throw new Error('Empty file received from server');
      }
      
      await modernDownloadService.downloadExcel({
        blob,
        filename: `Recce_Export_${new Date().toISOString().split('T')[0]}`
      });
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to export data';
      Toast.show({ type: 'error', text1: 'Export Failed', text2: errorMessage });
    } finally {
      setIsExporting(false);
    }
  };

  const handleBulkPPTDownload = async () => {
    if (selectedAssignments.size === 0) {
      Toast.show({ type: 'error', text1: 'Please select assignments' });
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
    
    const selectedStoreIds = Array.from(selectedAssignments);
    
    setIsDownloadingPPT(true);
    try {
      const blob = await recceService.bulkPpt(selectedStoreIds);
      
      if (!blob || blob.size === 0) {
        throw new Error('Empty file received from server');
      }
      
      await modernDownloadService.downloadFile({
        blob,
        filename: `Recce_Report_${selectedAssignments.size}_Stores.pptx`
      });
      setSelectedAssignments(new Set());
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to download PPTs';
      Toast.show({ type: 'error', text1: 'Download Failed', text2: errorMessage });
    } finally {
      setIsDownloadingPPT(false);
    }
  };

  const handleDebugAPI = async () => {
    await debugStorage();
    const result = await testRecceAPI();
    
    if (result.success) {
      Toast.show({ 
        type: 'success', 
        text1: 'API Test Successful', 
        text2: `Found ${result.storeCount} stores` 
      });
    } else {
      Toast.show({ 
        type: 'error', 
        text1: 'API Test Failed', 
        text2: result.error 
      });
    }
  };

  const handleBulkPDFDownload = async () => {
    if (selectedAssignments.size === 0) {
      Toast.show({ type: 'error', text1: 'Please select assignments' });
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
    
    const selectedStoreIds = Array.from(selectedAssignments);
    
    setIsDownloadingPDF(true);
    try {
      const blob = await recceService.bulkPdf(selectedStoreIds);
      
      if (!blob || blob.size === 0) {
        throw new Error('Empty file received from server');
      }
      
      await modernDownloadService.downloadFile({
        blob,
        filename: `Recce_Report_${selectedAssignments.size}_Stores.pdf`
      });
      setSelectedAssignments(new Set());
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to download PDFs';
      Toast.show({ type: 'error', text1: 'Download Failed', text2: errorMessage });
    } finally {
      setIsDownloadingPDF(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  // ---------------------------------------------------------------------------
  // UI-only helpers (same logic that used to be inline in the JSX).
  // ---------------------------------------------------------------------------
  const REPORT_STATUSES = ['RECCE_SUBMITTED', 'RECCE_APPROVED', 'INSTALLATION_ASSIGNED', 'INSTALLATION_SUBMITTED', 'INSTALLATION_APPROVED', 'COMPLETED'];

  const STATUS_FILTERS = [
    { value: 'ALL', label: 'All' },
    { value: 'RECCE_ASSIGNED', label: 'Pending' },
    { value: 'RECCE_SUBMITTED', label: 'Submitted' },
    { value: 'RECCE_APPROVED', label: 'Approved' },
  ];

  const handleCardDownload = async (item: RecceAssignment, format: 'pdf' | 'ppt') => {
    const assignmentId = item._id;
    setCardDownloadStates(prev => ({
      ...prev,
      [assignmentId]: { ...prev[assignmentId], [format]: true }
    }));

    try {
      if (format === 'pdf') {
        const blob = await recceService.getPdf(item.store._id);
        await modernDownloadService.downloadFile({
          blob,
          filename: `recce_${item.store.dealerCode}.pdf`
        });
      } else {
        const blob = await recceService.getPpt(item.store._id);
        await modernDownloadService.downloadFile({
          blob,
          filename: `recce_${item.store.dealerCode}.pptx`
        });
      }
    } catch (error) {
      Toast.show({ type: 'error', text1: format === 'pdf' ? 'PDF Download Failed' : 'PPT Download Failed' });
    } finally {
      setCardDownloadStates(prev => ({
        ...prev,
        [assignmentId]: { ...prev[assignmentId], [format]: false }
      }));
    }
  };

  // ---------------------------------------------------------------------------
  // Recce card
  // ---------------------------------------------------------------------------
  const renderAssignment = ({ item }: { item: RecceAssignment }) => {
    const isSelected = selectedAssignments.has(item._id);
    // Allow selection for all stores that have completed recce (same as web portal)
    const canSelect = ['RECCE_SUBMITTED', 'RECCE_APPROVED', 'INSTALLATION_ASSIGNED', 'INSTALLATION_SUBMITTED', 'INSTALLATION_APPROVED', 'COMPLETED'].includes(item.status);
    const hasReports = REPORT_STATUSES.includes(item.status);
    const isComplete = item.status === 'RECCE_APPROVED' || (item.status === 'RECCE_SUBMITTED' && !isAdminUser);
    const personLabel = isAdminUser ? 'Assigned to' : 'Assigned by';
    const personName = isAdminUser ? item.assignedTo?.name || 'Unassigned' : item.assignedBy?.name || 'System';
    const locationText = `${item.store.location.city}${item.store.location.state ? `, ${item.store.location.state}` : ''}`;

    return (
      <Card
        selected={isSelected}
        onPress={() => navigation.navigate('RecceDetail', { storeId: item.store._id })}
        style={{ marginBottom: 12 }}
      >
        {/* Identity + status */}
        <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 12 }}>
          {canSelect && (
            <View style={{ paddingTop: 2 }}>
              <Checkbox checked={isSelected} onPress={() => toggleSelection(item._id)} />
            </View>
          )}
          <View style={{ flex: 1, gap: 3 }}>
            <Text style={{ color: theme.colors.textSecondary, fontSize: 11, fontWeight: '800', letterSpacing: 0.6 }} numberOfLines={1}>
              {item.store.dealerCode}
            </Text>
            <Text style={{ color: theme.colors.text, fontSize: 16, fontWeight: '800' }} numberOfLines={2}>
              {item.store.storeName}
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <MapPin size={12} color={theme.colors.textSecondary} />
              <Text style={{ color: theme.colors.textSecondary, fontSize: 12, flex: 1 }} numberOfLines={1}>{locationText}</Text>
            </View>
          </View>
          <StatusBadge status={item.status} />
        </View>

        {/* Who + when */}
        <View style={{ marginTop: 12 }}>
          <MetaGrid
            items={[
              { label: personLabel, value: personName },
              { label: 'Assigned', value: formatDate(item.assignedAt) },
              !!item.submittedAt && { label: 'Updated', value: formatDate(item.submittedAt!), color: tone.success },
            ]}
          />
        </View>

        {/* Photos + remarks */}
        {(item.images && item.images.length > 0) || item.remarks ? (
          <View style={{ marginTop: 10, gap: 8 }}>
            {item.images && item.images.length > 0 && (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Camera size={14} color={tone.success} />
                <Text style={{ color: tone.success, fontSize: 12, fontWeight: '700' }}>
                  {item.images.length} photo{item.images.length > 1 ? 's' : ''} attached
                </Text>
              </View>
            )}
            {!!item.remarks && (
              <View style={{ padding: 10, borderRadius: 10, backgroundColor: theme.colors.surfaceSecondary, borderLeftWidth: 3, borderLeftColor: theme.colors.primary }}>
                <Text style={{ color: theme.colors.textSecondary, fontSize: 10, fontWeight: '800', letterSpacing: 0.5, marginBottom: 2 }}>REMARKS</Text>
                <Text style={{ color: theme.colors.text, fontSize: 13 }}>{item.remarks}</Text>
              </View>
            )}
          </View>
        ) : null}

        {/* Actions */}
        <View style={{ height: StyleSheet.hairlineWidth, backgroundColor: theme.colors.border, marginVertical: 12 }} />
        <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          {item.status === 'RECCE_ASSIGNED' && (
            <Button
              label="Start recce"
              variant="primary"
              size="sm"
              icon={(col) => <Upload size={15} color={col} />}
              onPress={() => navigation.navigate('RecceForm', { storeId: item.store._id })}
            />
          )}

          {isAdminUser && item.status === 'RECCE_SUBMITTED' && (
            <Button
              label="Review photos"
              variant="soft"
              color={tone.violet}
              size="sm"
              icon={(col) => <CheckSquare size={15} color={col} />}
              onPress={() => navigation.navigate('RecceReview', { storeId: item.store._id })}
            />
          )}

          <Button
            label="Details"
            variant="soft"
            color={tone.info}
            size="sm"
            icon={(col) => <Eye size={15} color={col} />}
            onPress={() => navigation.navigate('RecceDetail', { storeId: item.store._id })}
          />

          {isComplete && (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <CheckCircle2 size={15} color={tone.success} />
              <Text style={{ color: tone.success, fontSize: 12, fontWeight: '800' }}>Recce complete</Text>
            </View>
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
        </View>
      </Card>
    );
  };

  // ---------------------------------------------------------------------------
  // Screen
  // ---------------------------------------------------------------------------
  const eligibleInstallCount = getEligibleInstallStoreIds().length;
  const hasActiveFilters = !!debouncedSearch || filterStatus !== 'ALL';

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <View style={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 6 }}>
        <ScreenHeader
          title="Recce"
          subtitle={isAdminUser ? 'Inspections across all stores' : 'Your recce assignments'}
          count={totalStores}
          actions={
            <Button
              variant="outline"
              loading={isExporting}
              disabled={isExporting}
              icon={(col) => <Download size={18} color={col} />}
              onPress={handleExport}
            />
          }
        />

        <SearchBar value={searchTerm} onChangeText={setSearchTerm} placeholder="Search store name, city…" />

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingTop: 12, paddingBottom: 2 }}>
          {STATUS_FILTERS.map((s) => (
            <Chip
              key={s.value}
              label={s.label}
              color={s.value === 'ALL' ? undefined : statusMeta(s.value).color}
              active={filterStatus === s.value}
              onPress={() => setFilterStatus(s.value)}
            />
          ))}
        </ScrollView>

        <SelectionBar count={selectedAssignments.size} noun="recce" onClear={() => setSelectedAssignments(new Set())}>
          <Button
            label="PPT"
            variant="solid"
            color={tone.warning}
            size="sm"
            loading={isDownloadingPPT}
            icon={(col) => <FileSpreadsheet size={14} color={col} />}
            onPress={handleBulkPPTDownload}
          />
          <Button
            label="PDF"
            variant="solid"
            color={tone.danger}
            size="sm"
            loading={isDownloadingPDF}
            icon={(col) => <FileText size={14} color={col} />}
            onPress={handleBulkPDFDownload}
          />
          {isAdminUser && (
            <Button
              label="Assign"
              variant="primary"
              size="sm"
              icon={(col) => <UserPlus size={14} color={col} />}
              onPress={openInstallAssignModal}
            />
          )}
        </SelectionBar>
      </View>

      {loading ? (
        <PageSkeleton type="list" />
      ) : (
        <FlatList
          data={assignments}
          renderItem={renderAssignment}
          keyExtractor={(item) => item._id}
          contentContainerStyle={{ padding: 16, paddingTop: 10, paddingBottom: 32 }}
          keyboardShouldPersistTaps="handled"
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                setRefreshing(true);
                fetchAssignments();
              }}
              colors={[theme.colors.primary]}
              tintColor={theme.colors.primary}
            />
          }
          ListEmptyComponent={
            <EmptyState
              title={debouncedSearch ? 'No stores found' : filterStatus !== 'ALL' ? 'No stores with this status' : 'No recce tasks yet'}
              message={
                debouncedSearch
                  ? `Nothing matches "${debouncedSearch}". Try a different search.`
                  : filterStatus !== 'ALL'
                    ? 'Try a different status.'
                    : 'Recce tasks will appear here once stores are assigned.'
              }
              icon={<ClipboardCheck size={28} color={theme.colors.textTertiary} />}
              action={hasActiveFilters ? (
                <Button label="Clear filters" variant="outline" onPress={() => { setSearchTerm(''); setFilterStatus('ALL'); }} />
              ) : undefined}
            />
          }
          ListFooterComponent={
            assignments.length > 0 ? (
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

      {/* Bulk Assign Installation (admin-only) */}
      <BottomSheet
        visible={isInstallAssignModalOpen}
        onClose={() => setIsInstallAssignModalOpen(false)}
        title="Assign installation"
        subtitle={`${eligibleInstallCount} recce-approved store${eligibleInstallCount === 1 ? '' : 's'} will be assigned`}
        icon={<UserPlus size={18} color={theme.colors.text} />}
        maxHeight="85%"
        footer={
          <>
            <Button label="Cancel" variant="outline" size="lg" flex onPress={() => setIsInstallAssignModalOpen(false)} />
            <Button
              label="Assign"
              variant="primary"
              size="lg"
              flex
              loading={isAssigningInstallation}
              disabled={!selectedInstallUserId || isAssigningInstallation}
              onPress={handleAssignInstallation}
            />
          </>
        }
      >
        <View style={{ gap: 8 }}>
          {availableInstallUsers.length === 0 ? (
            <EmptyState title="No installation users found" />
          ) : availableInstallUsers.map((u: any) => {
            const sel = selectedInstallUserId === u._id;
            return (
              <TouchableOpacity
                key={u._id}
                onPress={() => setSelectedInstallUserId(u._id)}
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
                <Avatar name={u.name} size={40} filled={sel} />
                <View style={{ flex: 1 }}>
                  <Text style={{ color: theme.colors.text, fontWeight: '800', fontSize: 14 }} numberOfLines={1}>{u.name}</Text>
                  <Text style={{ color: theme.colors.textSecondary, fontSize: 12 }} numberOfLines={1}>{u.email}</Text>
                </View>
                <Checkbox checked={sel} onPress={() => setSelectedInstallUserId(u._id)} />
              </TouchableOpacity>
            );
          })}
        </View>
      </BottomSheet>
    </View>
  );
}
