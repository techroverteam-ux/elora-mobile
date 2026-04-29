import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, FlatList, TouchableOpacity, TextInput, RefreshControl, Alert, ActivityIndicator, Modal } from 'react-native';
import { Search, Eye, Camera, Upload, MapPin, Clock, Wrench, CheckSquare, Square, Download, FileText, Filter, ChevronLeft, ChevronRight, X } from 'lucide-react-native';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { storeService } from '../../services/storeService';
import { fileService } from '../../services/fileService';
import { modernDownloadService } from '../../services/modernDownloadService';
import DownloadButton from '../../components/DownloadButton';
import Toast from 'react-native-toast-message';
import PageSkeleton from '../../components/PageSkeleton';

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

  const renderAssignment = ({ item }: { item: InstallationAssignment }) => {
    const isSelected = selectedAssignments.has(item._id);
    const canSelect = item.status === 'INSTALLATION_SUBMITTED' || item.status === 'COMPLETED';
    
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
              {isAdmin ? item.assignedTo.name : item.assignedBy.name}
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

        <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
          <TouchableOpacity 
            onPress={() => {
              console.log('InstallationScreen: Navigating to detail', item._id);
              navigation.navigate('InstallationDetail', { storeId: item.store._id });
            }} 
            style={{ flex: 1, backgroundColor: '#3B82F620', padding: 10, borderRadius: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}
          >
            <Eye size={16} color="#3B82F6" />
            <Text style={{ color: '#3B82F6', marginLeft: 6, fontWeight: '600', fontSize: 12 }}>View Details</Text>
          </TouchableOpacity>
          
          {item.status === 'INSTALLATION_ASSIGNED' && (
            <TouchableOpacity 
              onPress={() => {
                console.log('InstallationScreen: Starting installation', item._id);
                navigation.navigate('InstallationForm', { storeId: item.store._id });
              }} 
              style={{ backgroundColor: '#10B98120', padding: 10, borderRadius: 8, flexDirection: 'row', alignItems: 'center' }}
            >
              <Upload size={16} color="#10B981" />
              <Text style={{ color: '#10B981', marginLeft: 6, fontWeight: '600', fontSize: 12 }}>Start Installation</Text>
            </TouchableOpacity>
          )}
          
          {(item.status === 'INSTALLATION_SUBMITTED' || item.status === 'COMPLETED') && (
            <TouchableOpacity 
              style={{ backgroundColor: '#10B98120', padding: 10, borderRadius: 8, flexDirection: 'row', alignItems: 'center' }}
            >
              <CheckSquare size={16} color="#10B981" />
              <Text style={{ color: '#10B981', marginLeft: 6, fontWeight: '600', fontSize: 12 }}>Installation Complete</Text>
            </TouchableOpacity>
          )}
          
          {/* Individual Download Buttons */}
          {(item.status === 'INSTALLATION_SUBMITTED' || item.status === 'COMPLETED') && (
            <View style={{ flexDirection: 'row', gap: 4, marginTop: 8, width: '100%' }}>
              {/* PDF Download */}
              <TouchableOpacity
                onPress={async () => {
                  const assignmentId = item._id;
                  setCardDownloadStates(prev => ({
                    ...prev,
                    [assignmentId]: { ...prev[assignmentId], pdf: true }
                  }));
                  
                  try {
                    const blob = await storeService.getPdf(item.store._id, 'installation');
                    await modernDownloadService.downloadFile({
                      blob,
                      filename: `installation_${item.store.dealerCode}.pdf`
                    });
                  } catch (error) {
                    Toast.show({ type: 'error', text1: 'PDF Download Failed' });
                  } finally {
                    setCardDownloadStates(prev => ({
                      ...prev,
                      [assignmentId]: { ...prev[assignmentId], pdf: false }
                    }));
                  }
                }}
                disabled={cardDownloadStates[item._id]?.pdf}
                style={{ 
                  flex: 1,
                  backgroundColor: '#EF4444', 
                  paddingHorizontal: 12, 
                  paddingVertical: 8, 
                  borderRadius: 8, 
                  flexDirection: 'row', 
                  alignItems: 'center', 
                  justifyContent: 'center',
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
                  const assignmentId = item._id;
                  setCardDownloadStates(prev => ({
                    ...prev,
                    [assignmentId]: { ...prev[assignmentId], ppt: true }
                  }));
                  
                  try {
                    const blob = await storeService.getPpt(item.store._id, 'installation');
                    await modernDownloadService.downloadFile({
                      blob,
                      filename: `installation_${item.store.dealerCode}.pptx`
                    });
                  } catch (error) {
                    Toast.show({ type: 'error', text1: 'PPT Download Failed' });
                  } finally {
                    setCardDownloadStates(prev => ({
                      ...prev,
                      [assignmentId]: { ...prev[assignmentId], ppt: false }
                    }));
                  }
                }}
                disabled={cardDownloadStates[item._id]?.ppt}
                style={{ 
                  flex: 1,
                  backgroundColor: '#F59E0B', 
                  paddingHorizontal: 12, 
                  paddingVertical: 8, 
                  borderRadius: 8, 
                  flexDirection: 'row', 
                  alignItems: 'center', 
                  justifyContent: 'center',
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
                    <FileText size={14} color="#FFF" />
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
      <View style={{ padding: 16 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Wrench size={24} color={theme.colors.primary} />
            <View style={{ marginLeft: 12 }}>
              <Text style={{ fontSize: 24, fontWeight: 'bold', color: theme.colors.text }}>Installation Tasks</Text>
              <Text style={{ fontSize: 14, color: theme.colors.textSecondary }}>Manage your installation assignments</Text>
            </View>
          </View>
            <DownloadButton
              onDownload={async () => {
                const blob = await storeService.exportInstallation();
                return {
                  blob,
                  filename: `Installation_Export_${new Date().toISOString().split('T')[0]}.xlsx`
                };
              }}
              title="Export"
              description="Downloading installation assignments..."
              size="medium"
              variant="success"
              disabled={isExporting}
            />
        </View>

        <View style={{ gap: 12 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: theme.colors.surface, borderRadius: 8, paddingHorizontal: 12, borderWidth: 1, borderColor: theme.colors.border }}>
            <Search size={20} color={theme.colors.textSecondary} />
            <TextInput
              style={{ flex: 1, paddingVertical: 12, paddingHorizontal: 8, color: theme.colors.text, fontSize: 16 }}
              placeholder="Search store name, city, dealer code..."
              placeholderTextColor={theme.colors.textSecondary}
              value={searchTerm}
              onChangeText={setSearchTerm}
            />
          </View>
          
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <TouchableOpacity 
              onPress={() => setShowFilters(true)}
              style={{ 
                backgroundColor: theme.colors.surface, 
                padding: 12, 
                borderRadius: 8, 
                borderWidth: 1, 
                borderColor: theme.colors.border, 
                flexDirection: 'row', 
                alignItems: 'center',
                flex: 1
              }}
            >
              <Filter size={16} color={theme.colors.textSecondary} />
              <Text style={{ color: theme.colors.text, fontSize: 14, marginLeft: 8 }}>
                {filterStatus === 'ALL' ? 'All Status' : statusOptions.find(s => s.value === filterStatus)?.label}
              </Text>
            </TouchableOpacity>
            
            {assignments.length > 0 && isAdmin && (
              <TouchableOpacity 
                onPress={toggleAllSelection}
                style={{ 
                  backgroundColor: theme.colors.surface, 
                  padding: 12, 
                  borderRadius: 8, 
                  borderWidth: 1, 
                  borderColor: theme.colors.border, 
                  flexDirection: 'row', 
                  alignItems: 'center'
                }}
              >
                {selectedAssignments.size === assignments.filter(a => a.status === 'INSTALLATION_SUBMITTED' || a.status === 'COMPLETED').length && assignments.filter(a => a.status === 'INSTALLATION_SUBMITTED' || a.status === 'COMPLETED').length > 0 ? 
                  <CheckSquare size={20} color={theme.colors.primary} /> : 
                  <Square size={20} color={theme.colors.textSecondary} />
                }
                <Text style={{ color: theme.colors.text, marginLeft: 8, fontWeight: '600', fontSize: 12 }}>
                  Select All
                </Text>
              </TouchableOpacity>
            )}
          </View>
          
          {isAdmin && selectedAssignments.size > 0 && (
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
                    {selectedAssignments.size} installation{selectedAssignments.size > 1 ? 's' : ''} selected
                  </Text>
                </View>
                <TouchableOpacity 
                  onPress={() => setSelectedAssignments(new Set())}
                  style={{ padding: 4 }}
                >
                  <X size={16} color={theme.colors.textSecondary} />
                </TouchableOpacity>
              </View>
              
              {/* Enhanced Download Buttons */}
              <View style={{ flexDirection: 'row', gap: 8 }}>
                <TouchableOpacity
                  onPress={handleBulkPPTDownload}
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
                      <FileText size={18} color="#FFF" />
                      <Text style={{ color: '#FFF', fontSize: 14, fontWeight: '600', marginLeft: 8 }}>PPT</Text>
                      <View style={{ 
                        backgroundColor: 'rgba(255,255,255,0.2)', 
                        paddingHorizontal: 6, 
                        paddingVertical: 2, 
                        borderRadius: 10, 
                        marginLeft: 6 
                      }}>
                        <Text style={{ color: '#FFF', fontSize: 11, fontWeight: '600' }}>{selectedAssignments.size}</Text>
                      </View>
                    </View>
                  )}
                </TouchableOpacity>
                
                <TouchableOpacity
                  onPress={handleBulkPDFDownload}
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
                        <Text style={{ color: '#FFF', fontSize: 11, fontWeight: '600' }}>{selectedAssignments.size}</Text>
                      </View>
                    </View>
                  )}
                </TouchableOpacity>
              </View>
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
                setPage(1);
                fetchAssignments();
              }}
              colors={[theme.colors.primary]}
            />
          }
          ListEmptyComponent={
            <View style={{ alignItems: 'center', justifyContent: 'center', paddingVertical: 40 }}>
              <Wrench size={48} color={theme.colors.textSecondary} />
              <Text style={{ color: theme.colors.text, fontSize: 18, fontWeight: '600', marginTop: 16, textAlign: 'center' }}>
                {debouncedSearch ? 'No installations found' : filterStatus !== 'ALL' ? 'No installations with this status' : 'No installation tasks available'}
              </Text>
              <Text style={{ color: theme.colors.textSecondary, fontSize: 14, marginTop: 8, textAlign: 'center' }}>
                {debouncedSearch 
                  ? `No installations match "${debouncedSearch}". Try a different search term.`
                  : filterStatus !== 'ALL'
                    ? `No installations found with status "${statusOptions.find(s => s.value === filterStatus)?.label}". Try selecting a different status.`
                    : 'There are no installation tasks assigned yet.'}
              </Text>
              {(debouncedSearch || filterStatus !== 'ALL') && (
                <TouchableOpacity 
                  onPress={() => { setSearchTerm(''); setFilterStatus('ALL'); }}
                  style={{ 
                    backgroundColor: theme.colors.primary, 
                    paddingHorizontal: 16, 
                    paddingVertical: 8, 
                    borderRadius: 8, 
                    marginTop: 16 
                  }}
                >
                  <Text style={{ color: '#FFFFFF', fontWeight: '600' }}>Clear Filters</Text>
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
      
      {/* Status Filter Modal */}
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
            maxHeight: '50%'
          }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, marginBottom: 20 }}>
              <Text style={{ fontSize: 18, fontWeight: 'bold', color: theme.colors.text }}>Filter by Status</Text>
              <TouchableOpacity onPress={() => setShowFilters(false)}>
                <X size={24} color={theme.colors.textSecondary} />
              </TouchableOpacity>
            </View>
            
            <FlatList
              data={statusOptions}
              keyExtractor={(item) => item.value}
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() => {
                    setFilterStatus(item.value);
                    setPage(1);
                    setShowFilters(false);
                  }}
                  style={{ 
                    padding: 16, 
                    borderBottomWidth: 1, 
                    borderBottomColor: theme.colors.border,
                    backgroundColor: filterStatus === item.value ? theme.colors.primary + '20' : 'transparent'
                  }}
                >
                  <Text style={{ 
                    color: filterStatus === item.value ? theme.colors.primary : theme.colors.text, 
                    fontSize: 16,
                    fontWeight: filterStatus === item.value ? '600' : '400'
                  }}>
                    {item.label}
                  </Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}