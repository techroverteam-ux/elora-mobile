import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, FlatList, TouchableOpacity, TextInput, RefreshControl, Alert, ActivityIndicator, Modal, ScrollView, StyleSheet } from 'react-native';
import { Search, Eye, Camera, Upload, MapPin, Clock, Wrench, CheckSquare, Square, Download, FileText, Filter, ChevronLeft, ChevronRight, X, CheckCircle2, FileSpreadsheet } from 'lucide-react-native';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { storeService } from '../../services/storeService';
import { fileService } from '../../services/fileService';
import { modernDownloadService } from '../../services/modernDownloadService';
import DownloadButton from '../../components/DownloadButton';
import Toast from 'react-native-toast-message';
import PageSkeleton from '../../components/PageSkeleton';
import {
  Card, StatusBadge, Button, Chip, Checkbox, MetaGrid,
  ScreenHeader, SearchBar, SelectionBar, Pagination, EmptyState,
  tone, statusMeta,
} from '../../components/ui';

interface InstallationAssignment {
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
  status: string;
  assignedAt: string;
  submittedAt?: string;
  images?: string[];
  remarks?: string;
}

export default function InstallationScreen({ navigation }: { navigation?: any }) {
  console.log('InstallationScreen: Component initialized');
  
  const { theme } = useTheme();
  const { user } = useAuth();
  const [assignments, setAssignments] = useState<InstallationAssignment[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [selectedAssignments, setSelectedAssignments] = useState<Set<string>>(new Set());
  const [isExporting, setIsExporting] = useState(false);
  const [isDownloadingPPT, setIsDownloadingPPT] = useState(false);
  const [isDownloadingPDF, setIsDownloadingPDF] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  
  // Individual card download states
  const [cardDownloadStates, setCardDownloadStates] = useState<{[key: string]: {pdf: boolean, ppt: boolean}}>({});
  
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
    fetchAssignments();
  }, [page, limit, debouncedSearch, filterStatus]);

  const fetchAssignments = async () => {
    console.log('InstallationScreen: fetchAssignments called');
    
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.append('page', page.toString());
      params.append('limit', limit.toString());
      if (debouncedSearch) params.append('search', debouncedSearch);
      
      // Filter by installation-related statuses only
      if (filterStatus !== 'ALL') {
        params.append('status', filterStatus);
      } else {
        // Show only stores that have been assigned to installation
        params.append('status', 'INSTALLATION_ASSIGNED,INSTALLATION_SUBMITTED,COMPLETED');
      }
      
      console.log('InstallationScreen: API params:', params.toString());
      const response = await storeService.getAll({ 
        page,
        limit,
        search: debouncedSearch || undefined,
        status: filterStatus !== 'ALL' ? filterStatus : 'INSTALLATION_ASSIGNED,INSTALLATION_SUBMITTED,COMPLETED'
      });
      console.log('InstallationScreen: API response:', response);
      
      if (!response || !response.stores) {
        console.log('InstallationScreen: No stores in response');
        setAssignments([]);
        return;
      }
      
      // Additional client-side filter to ensure only installation-assigned stores appear
      const installationStores = response.stores.filter((store: any) => 
        store.currentStatus === 'INSTALLATION_ASSIGNED' ||
        store.currentStatus === 'INSTALLATION_SUBMITTED' ||
        store.currentStatus === 'COMPLETED'
      );
      
      // Transform stores to assignment format
      const filteredAssignments = installationStores
        .filter((store: any) => store.location && store.location.city)
        .map((store: any) => ({
          _id: store._id,
          store: {
            _id: store._id,
            dealerCode: store.dealerCode,
            storeName: store.storeName,
            location: store.location
          },
          assignedTo: store.workflow?.installationAssignedTo || { name: 'Unassigned' },
          assignedBy: store.workflow?.installationAssignedBy || { name: 'Unknown' },
          status: store.currentStatus,
          assignedAt: store.workflow?.installationAssignedAt || store.createdAt || new Date().toISOString(),
          submittedAt: store.workflow?.installationSubmittedAt || store.updatedAt,
          images: store.installation?.photos || [],
          remarks: store.remark
        }));
      
      setAssignments(filteredAssignments);
      
      // Set pagination info
      if (response.pagination) {
        setTotalPages(response.pagination.pages);
        setTotalStores(response.pagination.total);
      }
      
      console.log('InstallationScreen: Assignments loaded successfully', { count: filteredAssignments.length });
      
    } catch (error) {
      console.error('InstallationScreen: Error fetching assignments', error);
      Toast.show({ type: 'error', text1: 'Failed to load installation assignments' });
      setAssignments([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
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

  const toggleAllSelection = () => {
    const completedAssignments = assignments.filter(a => 
      a.status === 'INSTALLATION_SUBMITTED' || a.status === 'COMPLETED'
    );
    if (selectedAssignments.size === completedAssignments.length && completedAssignments.length > 0) {
      setSelectedAssignments(new Set());
    } else {
      setSelectedAssignments(new Set(completedAssignments.map(a => a._id)));
    }
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const blob = await storeService.exportInstallation();
      await modernDownloadService.downloadExcel({
        blob,
        filename: `Installation_Export_${new Date().toISOString().split('T')[0]}`
      });
    } catch (error) {
      Toast.show({ type: 'error', text1: 'Export failed' });
    } finally {
      setIsExporting(false);
    }
  };

  const handleBulkPPTDownload = async () => {
    if (selectedAssignments.size === 0) {
      Toast.show({ type: 'error', text1: 'Please select assignments' });
      return;
    }
    setIsDownloadingPPT(true);
    try {
      const blob = await storeService.bulkPpt(Array.from(selectedAssignments), 'installation');
      await modernDownloadService.downloadFile({
        blob,
        filename: `Installation_Report_${selectedAssignments.size}_Stores.pptx`
      });
      setSelectedAssignments(new Set());
    } catch (error) {
      Toast.show({ type: 'error', text1: 'Failed to download PPTs' });
    } finally {
      setIsDownloadingPPT(false);
    }
  };

  const handleBulkPDFDownload = async () => {
    if (selectedAssignments.size === 0) {
      Toast.show({ type: 'error', text1: 'Please select assignments' });
      return;
    }
    setIsDownloadingPDF(true);
    try {
      const blob = await storeService.bulkPdf(Array.from(selectedAssignments), 'installation');
      await modernDownloadService.downloadFile({
        blob,
        filename: `Installation_Report_${selectedAssignments.size}_Stores.pdf`
      });
      setSelectedAssignments(new Set());
    } catch (error) {
      Toast.show({ type: 'error', text1: 'Failed to download PDFs' });
    } finally {
      setIsDownloadingPDF(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'INSTALLATION_ASSIGNED': return '#F59E0B';
      case 'INSTALLATION_SUBMITTED': return '#3B82F6';
      case 'COMPLETED': return '#10B981';
      default: return '#6B7280';
    }
  };

  const statusOptions = [
    { label: 'All Status', value: 'ALL' },
    { label: 'Pending', value: 'INSTALLATION_ASSIGNED' },
    { label: 'Submitted', value: 'INSTALLATION_SUBMITTED' },
    { label: 'Completed', value: 'COMPLETED' }
  ];

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
  const selectableAssignments = assignments.filter(a => a.status === 'INSTALLATION_SUBMITTED' || a.status === 'COMPLETED');
  const allSelected = selectedAssignments.size === selectableAssignments.length && selectableAssignments.length > 0;

  const handleCardDownload = async (item: InstallationAssignment, format: 'pdf' | 'ppt') => {
    const assignmentId = item._id;
    setCardDownloadStates(prev => ({
      ...prev,
      [assignmentId]: { ...prev[assignmentId], [format]: true }
    }));

    try {
      if (format === 'pdf') {
        const blob = await storeService.getPdf(item.store._id, 'installation');
        await modernDownloadService.downloadFile({
          blob,
          filename: `installation_${item.store.dealerCode}.pdf`
        });
      } else {
        const blob = await storeService.getPpt(item.store._id, 'installation');
        await modernDownloadService.downloadFile({
          blob,
          filename: `installation_${item.store.dealerCode}.pptx`
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
  // Installation card
  // ---------------------------------------------------------------------------
  const renderAssignment = ({ item }: { item: InstallationAssignment }) => {
    const isSelected = selectedAssignments.has(item._id);
    const canSelect = item.status === 'INSTALLATION_SUBMITTED' || item.status === 'COMPLETED';
    const isDone = canSelect;
    const personLabel = isAdmin ? 'Assigned to' : 'Assigned by';
    const personName = isAdmin ? item.assignedTo?.name : (item as any).assignedBy?.name;
    const locationText = [item.store.location?.city, item.store.location?.state].filter(Boolean).join(', ');

    return (
      <Card
        selected={isSelected}
        onPress={() => navigation.navigate('InstallationDetail', { storeId: item.store._id })}
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
            {!!locationText && (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <MapPin size={12} color={theme.colors.textSecondary} />
                <Text style={{ color: theme.colors.textSecondary, fontSize: 12, flex: 1 }} numberOfLines={1}>{locationText}</Text>
              </View>
            )}
          </View>
          <StatusBadge status={item.status} />
        </View>

        {/* Who + when */}
        <View style={{ marginTop: 12 }}>
          <MetaGrid
            items={[
              { label: personLabel, value: personName || '—' },
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
          {item.status === 'INSTALLATION_ASSIGNED' && (
            <Button
              label="Start installation"
              variant="primary"
              size="sm"
              icon={(col) => <Upload size={15} color={col} />}
              onPress={() => navigation.navigate('InstallationForm', { storeId: item.store._id })}
            />
          )}

          <Button
            label="Details"
            variant="soft"
            color={tone.info}
            size="sm"
            icon={(col) => <Eye size={15} color={col} />}
            onPress={() => navigation.navigate('InstallationDetail', { storeId: item.store._id })}
          />

          {isDone && (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <CheckCircle2 size={15} color={tone.success} />
              <Text style={{ color: tone.success, fontSize: 12, fontWeight: '800' }}>Installed</Text>
            </View>
          )}

          <View style={{ flex: 1 }} />

          {isDone && (
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
  const hasActiveFilters = !!debouncedSearch || filterStatus !== 'ALL';

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <View style={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 6 }}>
        <ScreenHeader
          title="Installation"
          subtitle={isAdmin ? 'Installations across all stores' : 'Your installation tasks'}
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

        <SearchBar value={searchTerm} onChangeText={setSearchTerm} placeholder="Search store, city, dealer code…" />

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingTop: 12, paddingBottom: 2, alignItems: 'center' }}>
          {statusOptions.map((s) => (
            <Chip
              key={s.value}
              label={s.value === 'ALL' ? 'All' : s.label}
              color={s.value === 'ALL' ? undefined : statusMeta(s.value).color}
              active={filterStatus === s.value}
              onPress={() => {
                setFilterStatus(s.value);
                setPage(1);
              }}
            />
          ))}
          {assignments.length > 0 && isAdmin && selectableAssignments.length > 0 && (
            <TouchableOpacity onPress={toggleAllSelection} style={{ flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 6 }}>
              <Checkbox checked={allSelected} onPress={toggleAllSelection} size={18} />
              <Text style={{ color: theme.colors.text, fontSize: 12, fontWeight: '700' }}>Select all</Text>
            </TouchableOpacity>
          )}
        </ScrollView>

        {isAdmin && (
          <SelectionBar count={selectedAssignments.size} noun="installation" onClear={() => setSelectedAssignments(new Set())}>
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
          </SelectionBar>
        )}
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
                setPage(1);
                fetchAssignments();
              }}
              colors={[theme.colors.primary]}
              tintColor={theme.colors.primary}
            />
          }
          ListEmptyComponent={
            <EmptyState
              title={debouncedSearch ? 'No installations found' : filterStatus !== 'ALL' ? 'No installations with this status' : 'No installation tasks yet'}
              message={
                debouncedSearch
                  ? `Nothing matches "${debouncedSearch}". Try a different search.`
                  : filterStatus !== 'ALL'
                    ? 'Try a different status.'
                    : 'Installation tasks will appear here once stores are assigned.'
              }
              icon={<Wrench size={28} color={theme.colors.textTertiary} />}
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
                noun="installations"
                onPrev={() => setPage(p => Math.max(1, p - 1))}
                onNext={() => setPage(p => Math.min(totalPages, p + 1))}
              />
            ) : null
          }
        />
      )}
    </View>
  );
}
