import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, TextInput, RefreshControl, Modal, ScrollView, Alert } from 'react-native';
import { Search, Plus, Edit2, Trash2, X, ChevronLeft, ChevronRight, Building2 } from 'lucide-react-native';
import { useTheme } from '../../context/ThemeContext';
import { clientService } from '../../services/clientService';
import Toast from 'react-native-toast-message';
import PageSkeleton from '../../components/PageSkeleton';

interface Client {
  _id: string;
  clientCode: string;
  clientName: string;
  branchName: string;
  amount: number;
  gstNumber: string;
  elements: any[];
  createdAt: string;
}

export default function ClientsScreen() {
  const { theme } = useTheme();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [formData, setFormData] = useState({
    clientName: '',
    branchName: '',
    amount: '',
    gstNumber: '',
  });

  useEffect(() => {
    fetchClients();
  }, [page, searchTerm]);

  const fetchClients = async () => {
    try {
      setLoading(true);
      const data = await clientService.getAll({ page, limit: 10, search: searchTerm });
      setClients(data.clients || []);
      setTotalPages(data.pagination?.pages || 1);
    } catch (error) {
      Toast.show({ type: 'error', text1: 'Failed to load clients' });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleCreate = () => {
    setEditingClient(null);
    setFormData({ clientName: '', branchName: '', amount: '', gstNumber: '' });
    setModalVisible(true);
  };

  const handleEdit = (client: Client) => {
    setEditingClient(client);
    setFormData({
      clientName: client.clientName,
      branchName: client.branchName,
      amount: client.amount.toString(),
      gstNumber: client.gstNumber,
    });
    setModalVisible(true);
  };

  const handleSubmit = async () => {
    if (!formData.clientName || !formData.branchName || !formData.amount || !formData.gstNumber) {
      Toast.show({ type: 'error', text1: 'Please fill all fields' });
      return;
    }

    try {
      const payload = {
        clientName: formData.clientName,
        branchName: formData.branchName,
        amount: Number(formData.amount),
        gstNumber: formData.gstNumber,
        elements: editingClient?.elements || [],
      };

      if (editingClient) {
        await clientService.update(editingClient._id, payload);
        Toast.show({ type: 'success', text1: 'Client updated' });
      } else {
        await clientService.create(payload);
        Toast.show({ type: 'success', text1: 'Client created' });
      }
      setModalVisible(false);
      fetchClients();
    } catch (error: any) {
      Toast.show({ type: 'error', text1: error.response?.data?.message || 'Operation failed' });
    }
  };

  const handleDelete = (id: string) => {
    Alert.alert('Delete Client', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await clientService.delete(id);
            Toast.show({ type: 'success', text1: 'Client deleted' });
            fetchClients();
          } catch (error) {
            Toast.show({ type: 'error', text1: 'Failed to delete client' });
          }
        },
      },
    ]);
  };

  const renderClient = ({ item }: { item: Client }) => (
    <View style={{ backgroundColor: theme.colors.surface, padding: 16, marginBottom: 12, borderRadius: 12, borderWidth: 1, borderColor: theme.colors.border }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
        <View style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: theme.colors.primary + '20', alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
          <Building2 size={24} color={theme.colors.primary} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ color: theme.colors.text, fontSize: 16, fontWeight: '600', marginBottom: 2 }}>{item.clientName}</Text>
          <Text style={{ color: theme.colors.textSecondary, fontSize: 12 }}>{item.clientCode}</Text>
        </View>
      </View>

      <View style={{ marginBottom: 12 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
          <Text style={{ color: theme.colors.textSecondary, fontSize: 12 }}>Branch:</Text>
          <Text style={{ color: theme.colors.text, fontSize: 12, fontWeight: '600' }}>{item.branchName}</Text>
        </View>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
          <Text style={{ color: theme.colors.textSecondary, fontSize: 12 }}>Amount:</Text>
          <Text style={{ color: theme.colors.primary, fontSize: 14, fontWeight: 'bold' }}>₹{item.amount.toLocaleString()}</Text>
        </View>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
          <Text style={{ color: theme.colors.textSecondary, fontSize: 12 }}>GST:</Text>
          <Text style={{ color: theme.colors.text, fontSize: 12, fontFamily: 'monospace' }}>{item.gstNumber}</Text>
        </View>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <Text style={{ color: theme.colors.textSecondary, fontSize: 12 }}>Elements:</Text>
          <Text style={{ color: theme.colors.text, fontSize: 12, fontWeight: '600' }}>{item.elements.length} element(s)</Text>
        </View>
      </View>

      <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: 8, paddingTop: 12, borderTopWidth: 1, borderTopColor: theme.colors.border }}>
        <TouchableOpacity onPress={() => handleEdit(item)} style={{ padding: 8, backgroundColor: '#3B82F620', borderRadius: 8 }}>
          <Edit2 size={18} color="#3B82F6" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleDelete(item._id)} style={{ padding: 8, backgroundColor: '#EF444420', borderRadius: 8 }}>
          <Trash2 size={18} color="#EF4444" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <View style={{ padding: 16 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <View>
            <Text style={{ fontSize: 24, fontWeight: 'bold', color: theme.colors.text }}>Clients</Text>
            <Text style={{ fontSize: 14, color: theme.colors.textSecondary }}>Manage clients</Text>
          </View>
          <TouchableOpacity onPress={handleCreate} style={{ backgroundColor: theme.colors.primary, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8, flexDirection: 'row', alignItems: 'center' }}>
            <Plus size={20} color="#FFF" />
          </TouchableOpacity>
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: theme.colors.surface, borderRadius: 8, paddingHorizontal: 12, marginBottom: 16, borderWidth: 1, borderColor: theme.colors.border }}>
          <Search size={20} color={theme.colors.textSecondary} />
          <TextInput
            placeholder="Search clients..."
            placeholderTextColor={theme.colors.textSecondary}
            value={searchTerm}
            onChangeText={setSearchTerm}
            style={{ flex: 1, paddingVertical: 12, paddingHorizontal: 8, color: theme.colors.text }}
          />
        </View>
      </View>

      {loading ? (
        <PageSkeleton type="list" />
      ) : (
        <FlatList
          data={clients}
          renderItem={renderClient}
          keyExtractor={item => item._id}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 80 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchClients(); }} colors={[theme.colors.primary]} />}
          ListFooterComponent={
            <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 16, gap: 12 }}>
              <TouchableOpacity onPress={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} style={{ padding: 8, backgroundColor: theme.colors.surface, borderRadius: 8, opacity: page === 1 ? 0.5 : 1 }}>
                <ChevronLeft size={20} color={theme.colors.text} />
              </TouchableOpacity>
              <Text style={{ color: theme.colors.text, fontWeight: '600' }}>Page {page} of {totalPages}</Text>
              <TouchableOpacity onPress={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} style={{ padding: 8, backgroundColor: theme.colors.surface, borderRadius: 8, opacity: page === totalPages ? 0.5 : 1 }}>
                <ChevronRight size={20} color={theme.colors.text} />
              </TouchableOpacity>
            </View>
          }
        />
      )}

      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}>
          <View style={{ backgroundColor: theme.colors.background, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, maxHeight: '90%' }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <Text style={{ fontSize: 20, fontWeight: 'bold', color: theme.colors.text }}>{editingClient ? 'Edit Client' : 'Add Client'}</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <X size={24} color={theme.colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={{ color: theme.colors.textSecondary, fontSize: 12, fontWeight: '600', marginBottom: 6 }}>CLIENT NAME</Text>
              <TextInput
                value={formData.clientName}
                onChangeText={text => setFormData({ ...formData, clientName: text })}
                style={{ backgroundColor: theme.colors.surface, padding: 12, borderRadius: 8, color: theme.colors.text, marginBottom: 16, borderWidth: 1, borderColor: theme.colors.border }}
                placeholder="Enter client name"
                placeholderTextColor={theme.colors.textSecondary}
              />

              <Text style={{ color: theme.colors.textSecondary, fontSize: 12, fontWeight: '600', marginBottom: 6 }}>BRANCH NAME</Text>
              <TextInput
                value={formData.branchName}
                onChangeText={text => setFormData({ ...formData, branchName: text })}
                style={{ backgroundColor: theme.colors.surface, padding: 12, borderRadius: 8, color: theme.colors.text, marginBottom: 16, borderWidth: 1, borderColor: theme.colors.border }}
                placeholder="Enter branch name"
                placeholderTextColor={theme.colors.textSecondary}
              />

              <Text style={{ color: theme.colors.textSecondary, fontSize: 12, fontWeight: '600', marginBottom: 6 }}>AMOUNT</Text>
              <TextInput
                value={formData.amount}
                onChangeText={text => setFormData({ ...formData, amount: text })}
                style={{ backgroundColor: theme.colors.surface, padding: 12, borderRadius: 8, color: theme.colors.text, marginBottom: 16, borderWidth: 1, borderColor: theme.colors.border }}
                placeholder="Enter amount"
                placeholderTextColor={theme.colors.textSecondary}
                keyboardType="decimal-pad"
              />

              <Text style={{ color: theme.colors.textSecondary, fontSize: 12, fontWeight: '600', marginBottom: 6 }}>GST NUMBER</Text>
              <TextInput
                value={formData.gstNumber}
                onChangeText={text => setFormData({ ...formData, gstNumber: text.toUpperCase() })}
                style={{ backgroundColor: theme.colors.surface, padding: 12, borderRadius: 8, color: theme.colors.text, marginBottom: 16, borderWidth: 1, borderColor: theme.colors.border }}
                placeholder="22AAAAA0000A1Z5"
                placeholderTextColor={theme.colors.textSecondary}
                autoCapitalize="characters"
                maxLength={15}
              />

              <TouchableOpacity onPress={handleSubmit} style={{ backgroundColor: theme.colors.primary, padding: 16, borderRadius: 8, alignItems: 'center', marginTop: 20 }}>
                <Text style={{ color: '#FFF', fontSize: 16, fontWeight: 'bold' }}>{editingClient ? 'Update Client' : 'Create Client'}</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}
