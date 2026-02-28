import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl, Modal, ScrollView, TextInput } from 'react-native';
import { MessageSquare, Mail, Phone, Clock, User, X } from 'lucide-react-native';
import { useTheme } from '../../context/ThemeContext';
import { enquiryService } from '../../services/enquiryService';
import Toast from 'react-native-toast-message';

interface Enquiry {
  _id: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  status: 'NEW' | 'READ' | 'CONTACTED' | 'RESOLVED';
  remark?: string;
  createdAt: string;
}

export default function EnquiriesScreen() {
  const { theme } = useTheme();
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedEnquiry, setSelectedEnquiry] = useState<Enquiry | null>(null);
  const [remark, setRemark] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchEnquiries();
  }, []);

  const fetchEnquiries = async () => {
    try {
      setLoading(true);
      const data = await enquiryService.getAll();
      const sorted = Array.isArray(data) ? data.sort((a: Enquiry, b: Enquiry) => {
        if (a.status === 'NEW' && b.status !== 'NEW') return -1;
        if (a.status !== 'NEW' && b.status === 'NEW') return 1;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }) : [];
      setEnquiries(sorted);
    } catch (error) {
      Toast.show({ type: 'error', text1: 'Failed to load enquiries' });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'NEW': return '#3B82F6';
      case 'READ': return '#8B5CF6';
      case 'CONTACTED': return '#F59E0B';
      case 'RESOLVED': return '#10B981';
      default: return '#6B7280';
    }
  };

  const openEnquiry = async (enquiry: Enquiry) => {
    setSelectedEnquiry(enquiry);
    setRemark(enquiry.remark || '');
    
    if (enquiry.status === 'NEW') {
      try {
        await enquiryService.updateRemark(enquiry._id, enquiry.remark || '', 'READ');
        setEnquiries(prev => prev.map(e => e._id === enquiry._id ? { ...e, status: 'READ' as const } : e));
      } catch (error) {
        console.error('Failed to update status');
      }
    }
  };

  const saveRemark = async () => {
    if (!selectedEnquiry) return;
    
    try {
      setSaving(true);
      const updatedStatus = selectedEnquiry.status === 'NEW' ? 'READ' : selectedEnquiry.status;
      await enquiryService.updateRemark(selectedEnquiry._id, remark.trim(), updatedStatus);
      
      setEnquiries(prev => prev.map(e => e._id === selectedEnquiry._id ? { ...e, remark: remark.trim(), status: updatedStatus } : e));
      Toast.show({ type: 'success', text1: 'Remark saved successfully' });
      setSelectedEnquiry(null);
    } catch (error) {
      Toast.show({ type: 'error', text1: 'Failed to save remark' });
    } finally {
      setSaving(false);
    }
  };

  const renderEnquiry = ({ item }: { item: Enquiry }) => (
    <TouchableOpacity
      onPress={() => openEnquiry(item)}
      style={{ backgroundColor: theme.colors.surface, padding: 16, marginBottom: 12, borderRadius: 12, borderWidth: 1, borderColor: theme.colors.border }}
    >
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
        <View style={{ flex: 1 }}>
          <Text style={{ color: theme.colors.text, fontSize: 16, fontWeight: '600', marginBottom: 4 }}>{item.name}</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
            <Clock size={12} color={theme.colors.textSecondary} />
            <Text style={{ color: theme.colors.textSecondary, fontSize: 12, marginLeft: 4 }}>
              {new Date(item.createdAt).toLocaleDateString()}
            </Text>
          </View>
        </View>
        <View style={{ backgroundColor: getStatusColor(item.status) + '20', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 }}>
          <Text style={{ color: getStatusColor(item.status), fontSize: 10, fontWeight: '600' }}>{item.status}</Text>
        </View>
      </View>

      <View style={{ marginBottom: 8 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
          <Mail size={12} color={theme.colors.textSecondary} />
          <Text style={{ color: theme.colors.textSecondary, fontSize: 12, marginLeft: 6 }}>{item.email}</Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Phone size={12} color={theme.colors.textSecondary} />
          <Text style={{ color: theme.colors.textSecondary, fontSize: 12, marginLeft: 6 }}>{item.phone}</Text>
        </View>
      </View>

      <Text style={{ color: theme.colors.text, fontSize: 14 }} numberOfLines={2}>{item.message}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <View style={{ padding: 16 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
          <MessageSquare size={24} color={theme.colors.primary} />
          <View style={{ marginLeft: 12 }}>
            <Text style={{ fontSize: 24, fontWeight: 'bold', color: theme.colors.text }}>Enquiries</Text>
            <Text style={{ fontSize: 14, color: theme.colors.textSecondary }}>Customer messages</Text>
          </View>
        </View>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={theme.colors.primary} style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={enquiries}
          renderItem={renderEnquiry}
          keyExtractor={item => item._id}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 80 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchEnquiries(); }} colors={[theme.colors.primary]} />}
        />
      )}

      <Modal visible={!!selectedEnquiry} animationType="slide" transparent>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}>
          <View style={{ backgroundColor: theme.colors.background, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, maxHeight: '90%' }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <Text style={{ fontSize: 20, fontWeight: 'bold', color: theme.colors.text }}>Enquiry Details</Text>
              <TouchableOpacity onPress={() => setSelectedEnquiry(null)}>
                <X size={24} color={theme.colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {selectedEnquiry && (
                <>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 }}>
                    <View style={{ backgroundColor: getStatusColor(selectedEnquiry.status) + '20', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16 }}>
                      <Text style={{ color: getStatusColor(selectedEnquiry.status), fontSize: 12, fontWeight: '600' }}>{selectedEnquiry.status}</Text>
                    </View>
                    <Text style={{ color: theme.colors.textSecondary, fontSize: 12 }}>
                      {new Date(selectedEnquiry.createdAt).toLocaleString()}
                    </Text>
                  </View>

                  <View style={{ backgroundColor: theme.colors.surface, padding: 12, borderRadius: 8, marginBottom: 16 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                      <User size={16} color={theme.colors.textSecondary} />
                      <Text style={{ color: theme.colors.text, fontSize: 14, fontWeight: '600', marginLeft: 8 }}>{selectedEnquiry.name}</Text>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                      <Mail size={16} color={theme.colors.textSecondary} />
                      <Text style={{ color: theme.colors.text, fontSize: 14, marginLeft: 8 }}>{selectedEnquiry.email}</Text>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <Phone size={16} color={theme.colors.textSecondary} />
                      <Text style={{ color: theme.colors.text, fontSize: 14, marginLeft: 8 }}>{selectedEnquiry.phone}</Text>
                    </View>
                  </View>

                  <View style={{ marginBottom: 16 }}>
                    <Text style={{ color: theme.colors.textSecondary, fontSize: 12, fontWeight: '600', marginBottom: 8 }}>MESSAGE</Text>
                    <View style={{ backgroundColor: theme.colors.surface, padding: 12, borderRadius: 8 }}>
                      <Text style={{ color: theme.colors.text, fontSize: 14 }}>{selectedEnquiry.message}</Text>
                    </View>
                  </View>

                  <View style={{ marginBottom: 16 }}>
                    <Text style={{ color: theme.colors.textSecondary, fontSize: 12, fontWeight: '600', marginBottom: 8 }}>REMARK (OPTIONAL)</Text>
                    <TextInput
                      value={remark}
                      onChangeText={setRemark}
                      multiline
                      numberOfLines={3}
                      placeholder="Add notes or follow-up actions..."
                      placeholderTextColor={theme.colors.textSecondary}
                      style={{ backgroundColor: theme.colors.surface, padding: 12, borderRadius: 8, color: theme.colors.text, textAlignVertical: 'top', borderWidth: 1, borderColor: theme.colors.border }}
                    />
                  </View>

                  <TouchableOpacity
                    onPress={saveRemark}
                    disabled={saving}
                    style={{ backgroundColor: theme.colors.primary, padding: 16, borderRadius: 8, alignItems: 'center' }}
                  >
                    <Text style={{ color: '#FFF', fontSize: 16, fontWeight: 'bold' }}>
                      {saving ? 'Saving...' : 'Save Remark'}
                    </Text>
                  </TouchableOpacity>
                </>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}
