import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, TextInput, ActivityIndicator, RefreshControl, Alert } from 'react-native';
import { Search, Eye, Camera, Upload, MapPin, Clock } from 'lucide-react-native';
import { useTheme } from '../../context/ThemeContext';
import { storeAPI } from '../../lib/api';

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
  status: string;
  assignedAt: string;
  submittedAt?: string;
  images?: string[];
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

  useEffect(() => {
    fetchAssignments();
  }, [searchTerm, filterStatus]);

  const fetchAssignments = async () => {
    console.log('RecceScreen: fetchAssignments called');
    
    try {
      setLoading(true);
      // Use stores API to get recce assignments
      const { data } = await storeAPI.getStores({
        page: 1,
        limit: 50,
        status: 'RECCE_ASSIGNED,RECCE_SUBMITTED',
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
        assignedTo: store.workflow.recceAssignedTo || { name: 'Unassigned' },
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
      console.log('RecceScreen: Assignments loaded successfully', { count: filteredAssignments.length });
      
    } catch (error) {
      console.error('RecceScreen: Error fetching assignments', error);
      Alert.alert('Error', 'Failed to load recce assignments');
      setAssignments([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ASSIGNED': return '#3B82F6';
      case 'IN_PROGRESS': return '#F59E0B';
      case 'SUBMITTED': return '#10B981';
      case 'APPROVED': return '#8B5CF6';
      case 'REJECTED': return '#EF4444';
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

  const renderAssignment = ({ item }: { item: RecceAssignment }) => (
    <View style={{ 
      backgroundColor: theme.colors.surface, 
      padding: 16, 
      marginBottom: 12, 
      borderRadius: 12, 
      borderWidth: 1, 
      borderColor: theme.colors.border 
    }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
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
      </View>
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <View style={{ padding: 16 }}>
        <View style={{ marginBottom: 16 }}>
          <Text style={{ fontSize: 24, fontWeight: 'bold', color: theme.colors.text }}>Recce Assignments</Text>
          <Text style={{ fontSize: 14, color: theme.colors.textSecondary }}>Manage your recce tasks</Text>
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
                No recce assignments found
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
}