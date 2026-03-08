import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, TextInput, RefreshControl, Alert, ActivityIndicator } from 'react-native';
import { Search, Eye, Camera, Upload, MapPin, Clock, Download, FileText, CheckSquare, Square, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react-native';
import { useTheme } from '../../context/ThemeContext';
import { recceService } from '../../services/recceService';
import { fileService } from '../../services/fileService';
import Toast from 'react-native-toast-message';
import PageSkeleton from '../../components/PageSkeleton';
import { testRecceAPI, debugStorage } from '../../utils/testRecceAPI';

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

export default function RecceScreen({ navigation }: { navigation?: any }) {
  console.log('RecceScreen: Component initialized');
  
  const { theme } = useTheme();
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

  // Enhanced state to match web portal
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalStores, setTotalStores] = useState(0);
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  
  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);
  
  // Check admin status
  useEffect(() => {
    // This would come from auth context in real app
    // For now, assume admin if needed
    setIsAdmin(true);
  }, []);

  useEffect(() => {
    fetchAssignments();
  }, [debouncedSearch, filterStatus, page, limit]);

  const fetchAssignments = async () => {
    console.log('RecceScreen: fetchAssignments called');
    
    try {
      setLoading(true);
      const params = {
        page,
        limit,
        search: debouncedSearch || undefined,
        status: filterStatus,
      };
      
      console.log('RecceScreen: API params:', params);
      const response = await recceService.getAssignments(params);
      console.log('RecceScreen: API response:', response);
      
      if (!response || !response.stores) {
        console.log('RecceScreen: No stores in response');
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
          assignedBy: store.workflow?.recceAssignedBy || { name: 'Unknown' },
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
      
      console.log('RecceScreen: Assignments loaded successfully', { count: filteredAssignments.length });
      
    } catch (error) {
      console.error('RecceScreen: Error fetching assignments', error);
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

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const blob = await recceService.export();
      await fileService.downloadFile(blob, 'Recce_Export.xlsx');
      Toast.show({ type: 'success', text1: 'Recce data exported successfully!' });
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
      const blob = await recceService.bulkPpt(Array.from(selectedAssignments));
      await fileService.downloadFile(blob, `Recce_Report_${selectedAssignments.size}_Stores.pptx`);
      Toast.show({ type: 'success', text1: `Downloaded PPT with ${selectedAssignments.size} stores` });
      setSelectedAssignments(new Set());
    } catch (error) {
      Toast.show({ type: 'error', text1: 'Failed to download PPTs' });
    } finally {
      setIsDownloadingPPT(false);
    }
  };

  const handleDebugAPI = async () => {
    console.log('Debug button pressed');
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
    setIsDownloadingPDF(true);
    try {
      const blob = await recceService.bulkPdf(Array.from(selectedAssignments));
      await fileService.downloadFile(blob, `Recce_Report_${selectedAssignments.size}_Stores.pdf`);
      Toast.show({ type: 'success', text1: `Downloaded PDF with ${selectedAssignments.size} stores` });
      setSelectedAssignments(new Set());
    } catch (error) {
      Toast.show({ type: 'error', text1: 'Failed to download PDFs' });
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

  const renderAssignment = ({ item }: { item: RecceAssignment }) => {
    const isSelected = selectedAssignments.has(item._id);
    const canSelect = item.status === 'RECCE_SUBMITTED' || item.status === 'RECCE_APPROVED';
    
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
          <View style={{ flexDirection: 'row', alignItems: 'flex-start', flex: 1 }}>
            {canSelect && (
              <TouchableOpacity onPress={() => toggleSelection(item._id)} style={{ marginRight: 12, marginTop: 2 }}>
                {isSelected ? 
                  <CheckSquare size={20} color={theme.colors.primary} /> : 
                  <Square size={20} color={theme.colors.textSecondary} />
                }
              </TouchableOpacity>
            )}
            
            <View style={{ flex: 1 }}>
              <Text style={{ color: theme.colors.primary, fontSize: 12, fontWeight: '600', marginBottom: 4 }}>
                {item.store.dealerCode}
              </Text>
              <Text style={{ color: theme.colors.text, fontSize: 16, fontWeight: '600', marginBottom: 4 }}>
                {item.store.storeName}
              </Text>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <MapPin size={12} color={theme.colors.textSecondary} />
                <Text style={{ color: theme.colors.textSecondary, fontSize: 12, marginLeft: 4 }}>
                  {item.store.location.city}, {item.store.location.state}
                </Text>
              </View>
            </View>
          </View>
          
          <View style={{ backgroundColor: getStatusColor(item.status) + '20', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 }}>
            <Text style={{ color: getStatusColor(item.status), fontSize: 10, fontWeight: '600' }}>
              {item.status.replace(/_/g, ' ')}
            </Text>
          </View>
        </View>

        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 }}>
          <View>
            <Text style={{ color: theme.colors.textSecondary, fontSize: 12 }}>
              {isAdmin ? 'Assigned To' : 'Assigned By'}
            </Text>
            <Text style={{ color: theme.colors.text, fontSize: 14, fontWeight: '600' }}>
              {isAdmin ? item.assignedTo.name : (item.assignedBy?.name || 'Unknown')}
            </Text>
          </View>
          <View>
            <Text style={{ color: theme.colors.textSecondary, fontSize: 12 }}>Assigned Date</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Clock size={12} color={theme.colors.textSecondary} />
              <Text style={{ color: theme.colors.text, fontSize: 14, fontWeight: '600', marginLeft: 4 }}>
                {formatDate(item.assignedAt)}
              </Text>
            </View>
          </View>
          {item.submittedAt && (
            <View>
              <Text style={{ color: theme.colors.textSecondary, fontSize: 12 }}>Submitted</Text>
              <Text style={{ color: '#10B981', fontSize: 14, fontWeight: '600' }}>
                {formatDate(item.submittedAt)}
              </Text>
            </View>
          )}
        </View>

        {item.images && item.images.length > 0 && (
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
            <Camera size={16} color="#10B981" />
            <Text style={{ color: '#10B981', fontSize: 12, marginLeft: 4, fontWeight: '600' }}>
              {item.images.length} images attached
            </Text>
          </View>
        )}

        {item.remarks && (
          <View style={{ marginBottom: 12, padding: 8, backgroundColor: theme.colors.background, borderRadius: 8 }}>
            <Text style={{ color: theme.colors.textSecondary, fontSize: 12, marginBottom: 4 }}>Remarks</Text>
            <Text style={{ color: theme.colors.text, fontSize: 14 }}>{item.remarks}</Text>
          </View>
        )}

        <View style={{ flexDirection: 'row', gap: 8 }}>
          <TouchableOpacity 
            onPress={() => navigation.navigate('RecceDetail', { storeId: item.store._id })} 
            style={{ flex: 1, backgroundColor: '#3B82F620', padding: 10, borderRadius: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}
          >
            <Eye size={16} color="#3B82F6" />
            <Text style={{ color: '#3B82F6', marginLeft: 6, fontWeight: '600', fontSize: 12 }}>View Details</Text>
          </TouchableOpacity>
          
          {item.status === 'RECCE_ASSIGNED' && (
            <TouchableOpacity 
              onPress={() => navigation.navigate('RecceForm', { storeId: item.store._id })} 
              style={{ backgroundColor: '#10B98120', padding: 10, borderRadius: 8, flexDirection: 'row', alignItems: 'center' }}
            >
              <Upload size={16} color="#10B981" />
              <Text style={{ color: '#10B981', marginLeft: 6, fontWeight: '600', fontSize: 12 }}>Start Recce</Text>
            </TouchableOpacity>
          )}
          
          {(item.status === 'RECCE_SUBMITTED' || item.status === 'RECCE_APPROVED') && (
            <TouchableOpacity 
              style={{ backgroundColor: '#10B98120', padding: 10, borderRadius: 8, flexDirection: 'row', alignItems: 'center' }}
            >
              <CheckSquare size={16} color="#10B981" />
              <Text style={{ color: '#10B981', marginLeft: 6, fontWeight: '600', fontSize: 12 }}>Recce Submitted</Text>
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
            <Text style={{ fontSize: 24, fontWeight: 'bold', color: theme.colors.text }}>Recce Inspection</Text>
            <Text style={{ fontSize: 14, color: theme.colors.textSecondary }}>Manage your recce assignments</Text>
          </View>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <TouchableOpacity onPress={handleDebugAPI} style={{ backgroundColor: '#6366F1', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8 }}>
              <Text style={{ color: '#FFF', fontSize: 12, fontWeight: '600' }}>Debug API</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleExport} disabled={isExporting} style={{ backgroundColor: '#10B981', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, opacity: isExporting ? 0.6 : 1 }}>
              {isExporting ? (
                <ActivityIndicator size="small" color="#FFF" />
              ) : (
                <Download size={16} color="#FFF" />
              )}
            </TouchableOpacity>
          </View>
        </View>

        <View style={{ gap: 12 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: theme.colors.surface, borderRadius: 8, paddingHorizontal: 12, borderWidth: 1, borderColor: theme.colors.border }}>
            <Search size={20} color={theme.colors.textSecondary} />
            <TextInput
              style={{ flex: 1, paddingVertical: 12, paddingHorizontal: 8, color: theme.colors.text, fontSize: 16 }}
              placeholder="Search store name, city..."
              placeholderTextColor={theme.colors.textSecondary}
              value={searchTerm}
              onChangeText={setSearchTerm}
            />
          </View>
          
          {/* Status Filter Dropdown */}
          <TouchableOpacity 
            onPress={() => setShowStatusFilter(!showStatusFilter)}
            style={{ backgroundColor: theme.colors.surface, padding: 12, borderRadius: 8, borderWidth: 1, borderColor: theme.colors.border, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}
          >
            <Text style={{ color: theme.colors.text, fontSize: 14 }}>
              {filterStatus === 'ALL' ? 'All Status' : 
               filterStatus === 'RECCE_ASSIGNED' ? 'Pending' :
               filterStatus === 'RECCE_SUBMITTED' ? 'Submitted' :
               filterStatus === 'RECCE_APPROVED' ? 'Approved' : filterStatus.replace(/_/g, ' ')}
            </Text>
            <ChevronDown size={16} color={theme.colors.textSecondary} />
          </TouchableOpacity>
          
          {showStatusFilter && (
            <View style={{ backgroundColor: theme.colors.surface, borderRadius: 8, borderWidth: 1, borderColor: theme.colors.border, overflow: 'hidden' }}>
              {[
                { value: 'ALL', label: 'All Status' },
                { value: 'RECCE_ASSIGNED', label: 'Pending' },
                { value: 'RECCE_SUBMITTED', label: 'Submitted' },
                { value: 'RECCE_APPROVED', label: 'Approved' }
              ].map((status) => (
                <TouchableOpacity
                  key={status.value}
                  onPress={() => {
                    setFilterStatus(status.value);
                    setShowStatusFilter(false);
                  }}
                  style={{ padding: 12, borderBottomWidth: 1, borderBottomColor: theme.colors.border }}
                >
                  <Text style={{ color: theme.colors.text, fontSize: 14 }}>{status.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
          
          {selectedAssignments.size > 0 && (
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <TouchableOpacity 
                onPress={handleBulkPPTDownload}
                disabled={isDownloadingPPT}
                style={{ flex: 1, backgroundColor: '#F59E0B', padding: 12, borderRadius: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', opacity: isDownloadingPPT ? 0.6 : 1 }}
              >
                {isDownloadingPPT ? (
                  <ActivityIndicator size="small" color="#FFF" />
                ) : (
                  <FileText size={16} color="#FFF" />
                )}
                <Text style={{ color: '#FFF', marginLeft: 6, fontWeight: '600' }}>
                  PPT ({selectedAssignments.size})
                </Text>
              </TouchableOpacity>
              <TouchableOpacity 
                onPress={handleBulkPDFDownload}
                disabled={isDownloadingPDF}
                style={{ flex: 1, backgroundColor: '#EF4444', padding: 12, borderRadius: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', opacity: isDownloadingPDF ? 0.6 : 1 }}
              >
                {isDownloadingPDF ? (
                  <ActivityIndicator size="small" color="#FFF" />
                ) : (
                  <FileText size={16} color="#FFF" />
                )}
                <Text style={{ color: '#FFF', marginLeft: 6, fontWeight: '600' }}>
                  PDF ({selectedAssignments.size})
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>

      {loading ? (
        <PageSkeleton type="list" />
      ) : (
        <FlatList
          data={assignments}
          renderItem={renderAssignment}
          keyExtractor={(item) => item._id}
          contentContainerStyle={{ padding: 16, paddingTop: 0 }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                setRefreshing(true);
                fetchAssignments();
              }}
              colors={[theme.colors.primary]}
            />
          }
          ListEmptyComponent={
            <View style={{ alignItems: 'center', justifyContent: 'center', paddingVertical: 40 }}>
              <Search size={48} color={theme.colors.textSecondary} style={{ opacity: 0.5 }} />
              <Text style={{ color: theme.colors.text, fontSize: 18, fontWeight: '600', marginTop: 16, marginBottom: 8 }}>
                {debouncedSearch ? 'No stores found' : filterStatus !== 'ALL' ? 'No stores with this status' : 'No recce tasks available'}
              </Text>
              <Text style={{ color: theme.colors.textSecondary, fontSize: 14, textAlign: 'center', marginBottom: 16 }}>
                {debouncedSearch 
                  ? `No stores match "${debouncedSearch}". Try a different search term.`
                  : filterStatus !== 'ALL'
                    ? `No stores found with this status. Try selecting a different status.`
                    : 'There are no recce tasks assigned yet.'}
              </Text>
              {(debouncedSearch || filterStatus !== 'ALL') && (
                <TouchableOpacity 
                  onPress={() => { setSearchTerm(''); setFilterStatus('ALL'); }}
                  style={{ backgroundColor: theme.colors.primary, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8 }}
                >
                  <Text style={{ color: '#FFF', fontWeight: '600' }}>Clear Filters</Text>
                </TouchableOpacity>
              )}
            </View>
          }
          ListFooterComponent={
            totalPages > 1 ? (
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 16, paddingHorizontal: 16, backgroundColor: theme.colors.surface, marginTop: 16, borderRadius: 8 }}>
                <Text style={{ color: theme.colors.textSecondary, fontSize: 12 }}>
                  Showing {(page-1)*limit + 1}-{Math.min(page*limit, totalStores)} of {totalStores}
                </Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <TouchableOpacity 
                    onPress={() => setPage(p => Math.max(1, p-1))} 
                    disabled={page === 1}
                    style={{ padding: 8, borderRadius: 4, backgroundColor: page === 1 ? theme.colors.border : theme.colors.primary }}
                  >
                    <ChevronLeft size={16} color={page === 1 ? theme.colors.textSecondary : '#FFF'} />
                  </TouchableOpacity>
                  <Text style={{ color: theme.colors.text, fontSize: 14, fontWeight: '600', minWidth: 20, textAlign: 'center' }}>
                    {page}
                  </Text>
                  <TouchableOpacity 
                    onPress={() => setPage(p => Math.min(totalPages, p+1))} 
                    disabled={page === totalPages}
                    style={{ padding: 8, borderRadius: 4, backgroundColor: page === totalPages ? theme.colors.border : theme.colors.primary }}
                  >
                    <ChevronRight size={16} color={page === totalPages ? theme.colors.textSecondary : '#FFF'} />
                  </TouchableOpacity>
                </View>
              </View>
            ) : null
          }
        />
      )}
    </View>
  );
}