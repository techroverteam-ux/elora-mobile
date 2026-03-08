import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, TextInput, RefreshControl, Modal, ScrollView, Alert, StyleSheet } from 'react-native';
import { Search, Plus, Edit2, Trash2, X, ChevronLeft, ChevronRight, Building2, MapPin, CreditCard, FileText } from 'lucide-react-native';
import { useTheme } from '../../context/ThemeContext';
import { clientService } from '../../services/clientService';
import { LinearGradient } from 'react-native-linear-gradient';
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
    <View style={[styles.clientCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
      <View style={styles.clientHeader}>
        <LinearGradient
          colors={['#06B6D4', '#0891B2']}
          style={styles.clientIcon}
        >
          <Building2 size={24} color="#FFF" />
        </LinearGradient>
        <View style={styles.clientInfo}>
          <Text style={[styles.clientName, { color: theme.colors.text }]}>{item.clientName}</Text>
          <Text style={[styles.clientCode, { color: theme.colors.textSecondary }]}>{item.clientCode}</Text>
        </View>
        <View style={[styles.amountBadge, { backgroundColor: '#10B98120' }]}>
          <Text style={[styles.amountText, { color: '#10B981' }]}>₹{item.amount.toLocaleString()}</Text>
        </View>
      </View>

      <View style={styles.clientDetails}>
        <View style={styles.detailRow}>
          <View style={styles.detailIcon}>
            <MapPin size={14} color={theme.colors.textSecondary} />
          </View>
          <Text style={[styles.detailLabel, { color: theme.colors.textSecondary }]}>Branch:</Text>
          <Text style={[styles.detailValue, { color: theme.colors.text }]}>{item.branchName}</Text>
        </View>
        <View style={styles.detailRow}>
          <View style={styles.detailIcon}>
            <CreditCard size={14} color={theme.colors.textSecondary} />
          </View>
          <Text style={[styles.detailLabel, { color: theme.colors.textSecondary }]}>GST:</Text>
          <Text style={[styles.detailValue, { color: theme.colors.text, fontFamily: 'monospace' }]}>{item.gstNumber}</Text>
        </View>
        <View style={styles.detailRow}>
          <View style={styles.detailIcon}>
            <FileText size={14} color={theme.colors.textSecondary} />
          </View>
          <Text style={[styles.detailLabel, { color: theme.colors.textSecondary }]}>Elements:</Text>
          <Text style={[styles.detailValue, { color: theme.colors.text }]}>{item.elements.length} element(s)</Text>
        </View>
      </View>

      <View style={styles.clientActions}>
        <TouchableOpacity onPress={() => handleEdit(item)} style={[styles.actionButton, { backgroundColor: '#F59E0B20' }]}>
          <Edit2 size={16} color="#F59E0B" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleDelete(item._id)} style={[styles.actionButton, { backgroundColor: '#EF444420' }]}>
          <Trash2 size={16} color="#EF4444" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      {/* Enhanced Header */}
      <LinearGradient
        colors={['#06B6D4', '#0891B2']}
        style={styles.headerGradient}
      >
        <View style={styles.headerContent}>
          <View style={styles.headerTitleSection}>
            <View style={styles.headerIconContainer}>
              <Building2 size={28} color="#FFF" />
            </View>
            <View style={styles.headerTextContainer}>
              <Text style={styles.headerTitle}>Client Management</Text>
              <Text style={styles.headerSubtitle}>Manage client information and contracts</Text>
            </View>
          </View>
          <TouchableOpacity onPress={handleCreate} style={styles.headerButton}>
            <Plus size={18} color="#FFF" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Search Section */}
      <View style={styles.searchSection}>
        <View style={styles.searchContainer}>
          <Search size={20} color={theme.colors.textSecondary} />
          <TextInput
            placeholder="Search clients by name or code..."
            placeholderTextColor={theme.colors.textSecondary}
            value={searchTerm}
            onChangeText={setSearchTerm}
            style={[styles.searchInput, { color: theme.colors.text }]}
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

const styles = StyleSheet.create({
  headerGradient: {
    paddingHorizontal: 20,
    paddingVertical: 24,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitleSection: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFF',
    letterSpacing: -0.3,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '600',
    marginTop: 4,
  },
  headerButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  searchSection: {
    padding: 20,
    paddingBottom: 12,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 12,
    fontSize: 16,
    fontWeight: '500',
  },
  clientCard: {
    padding: 20,
    marginBottom: 16,
    borderRadius: 16,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  clientHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  clientIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  clientInfo: {
    flex: 1,
  },
  clientName: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  clientCode: {
    fontSize: 14,
    fontWeight: '500',
    fontFamily: 'monospace',
  },
  amountBadge: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
  },
  amountText: {
    fontSize: 16,
    fontWeight: '800',
  },
  clientDetails: {
    marginBottom: 16,
    gap: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailIcon: {
    width: 24,
    alignItems: 'center',
    marginRight: 8,
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: '600',
    width: 80,
  },
  detailValue: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
  },
  clientActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  actionButton: {
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
