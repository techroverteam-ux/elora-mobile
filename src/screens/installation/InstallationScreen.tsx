import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, TextInput, ActivityIndicator, RefreshControl, Alert } from 'react-native';
import { Search, Eye, Camera, Upload, MapPin, Clock, Wrench, CheckSquare, Square } from 'lucide-react-native';
import { useTheme } from '../../context/ThemeContext';
import { storeAPI } from '../../lib/api';

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
  const [assignments, setAssignments] = useState<InstallationAssignment[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [selectedAssignments, setSelectedAssignments] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchAssignments();
  }, [searchTerm, filterStatus]);

  const fetchAssignments = async () => {
    console.log('InstallationScreen: fetchAssignments called');
    
    try {
      setLoading(true);
      // Use stores API to get installation assignments
      const { data } = await storeAPI.getStores({
        page: 1,
        limit: 50,
        status: 'INSTALLATION_ASSIGNED,INSTALLATION_SUBMITTED,COMPLETED',
      });
      
      // Transform stores to assignment format
      let filteredAssignments = (data.stores || []).map((store: any) => ({
        _id: store._id,
        store: {
          _id: store._id,
          dealerCode: store.dealerCode,
          storeName: store.storeName,
          location: store.location
        },
        assignedTo: store.workflow.installationAssignedTo || { name: 'Unassigned' },
        status: store.currentStatus,
        assignedAt: store.createdAt || new Date().toISOString(),
        submittedAt: store.updatedAt,
        images: [],
        remarks: store.remark
      }));
      
      if (searchTerm) {
        filteredAssignments = filteredAssignments.filter((assignment: any) => 
          assignment.store.storeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          assignment.store.dealerCode.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }
      
      setAssignments(filteredAssignments);
      console.log('InstallationScreen: Assignments loaded successfully', { count: filteredAssignments.length });
      
    } catch (error) {
      console.error('InstallationScreen: Error fetching assignments', error);
      Alert.alert('Error', 'Failed to load installation assignments');
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ASSIGNED': return '#3B82F6';
      case 'IN_PROGRESS': return '#F59E0B';
      case 'SUBMITTED': return '#10B981';
      case 'COMPLETED': return '#8B5CF6';
      default: return '#6B7280';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const renderAssignment = ({ item }: { item: InstallationAssignment }) => {
    const isSelected = selectedAssignments.has(item._id);
    const canSelect = item.status === 'SUBMITTED' || item.status === 'COMPLETED';
    
    return (
      <View style={{ 
        backgroundColor: theme.colors.surface, 
        padding: 16, 
        marginBottom: 12, 
        borderRadius: 12, 
        borderWidth: 1, 
        borderColor: theme.colors.border 
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
            <Text style={{ color: theme.colors.textSecondary, fontSize: 12 }}>Assigned To</Text>
            <Text style={{ color: theme.colors.text, fontSize: 14, fontWeight: '600' }}>
              {item.assignedTo.name}
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
        </View>
      </View>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <View style={{ padding: 16 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
          <Wrench size={24} color={theme.colors.primary} />
          <View style={{ marginLeft: 12 }}>
            <Text style={{ fontSize: 24, fontWeight: 'bold', color: theme.colors.text }}>Installation Tasks</Text>
            <Text style={{ fontSize: 14, color: theme.colors.textSecondary }}>Manage your installation assignments</Text>
          </View>
        </View>

        <View style={{ gap: 12 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: theme.colors.surface, borderRadius: 8, paddingHorizontal: 12, borderWidth: 1, borderColor: theme.colors.border }}>
            <Search size={20} color={theme.colors.textSecondary} />
            <TextInput
              style={{ flex: 1, paddingVertical: 12, paddingHorizontal: 8, color: theme.colors.text, fontSize: 16 }}
              placeholder="Search assignments..."
              placeholderTextColor={theme.colors.textSecondary}
              value={searchTerm}
              onChangeText={setSearchTerm}
            />
          </View>
          
          {selectedAssignments.size > 0 && (
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <TouchableOpacity 
                style={{ flex: 1, backgroundColor: '#F59E0B', padding: 12, borderRadius: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}
              >
                <Text style={{ color: '#FFF', fontWeight: '600' }}>
                  Generate PPT ({selectedAssignments.size})
                </Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={{ flex: 1, backgroundColor: '#EF4444', padding: 12, borderRadius: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}
              >
                <Text style={{ color: '#FFF', fontWeight: '600' }}>
                  Generate PDF ({selectedAssignments.size})
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>

      {loading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={{ color: theme.colors.textSecondary, marginTop: 16 }}>Loading assignments...</Text>
        </View>
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
              <Text style={{ color: theme.colors.textSecondary, fontSize: 16, textAlign: 'center' }}>
                No installation assignments found
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
}