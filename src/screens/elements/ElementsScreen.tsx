import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, TextInput, ActivityIndicator, RefreshControl, Modal, ScrollView, Alert } from 'react-native';
import { Search, Plus, Edit2, Trash2, X, ChevronLeft, ChevronRight, Layers } from 'lucide-react-native';
import { useTheme } from '../../context/ThemeContext';
import { elementService } from '../../services/elementService';
import Toast from 'react-native-toast-message';

interface Element {
  _id: string;
  name: string;
  standardRate: number;
  createdAt: string;
}

export default function ElementsScreen() {
  const { theme } = useTheme();
  const [elements, setElements] = useState<Element[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingElement, setEditingElement] = useState<Element | null>(null);
  const [formData, setFormData] = useState({ name: '', standardRate: '' });

  useEffect(() => {
    fetchElements();
  }, [page, searchTerm]);

  const fetchElements = async () => {
    try {
      setLoading(true);
      const data = await elementService.getAll({ page, limit: 10, search: searchTerm });
      setElements(data.elements || []);
      setTotalPages(data.pagination?.pages || 1);
    } catch (error) {
      Toast.show({ type: 'error', text1: 'Failed to load elements' });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleCreate = () => {
    setEditingElement(null);
    setFormData({ name: '', standardRate: '' });
    setModalVisible(true);
  };

  const handleEdit = (element: Element) => {
    setEditingElement(element);
    setFormData({ name: element.name, standardRate: element.standardRate.toString() });
    setModalVisible(true);
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.standardRate) {
      Toast.show({ type: 'error', text1: 'Please fill all fields' });
      return;
    }

    try {
      const payload = { name: formData.name, standardRate: Number(formData.standardRate) };
      if (editingElement) {
        await elementService.update(editingElement._id, payload);
        Toast.show({ type: 'success', text1: 'Element updated' });
      } else {
        await elementService.create(payload);
        Toast.show({ type: 'success', text1: 'Element created' });
      }
      setModalVisible(false);
      fetchElements();
    } catch (error: any) {
      Toast.show({ type: 'error', text1: error.response?.data?.message || 'Operation failed' });
    }
  };

  const handleDelete = (id: string) => {
    Alert.alert('Delete Element', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await elementService.delete(id);
            Toast.show({ type: 'success', text1: 'Element deleted' });
            fetchElements();
          } catch (error) {
            Toast.show({ type: 'error', text1: 'Failed to delete element' });
          }
        },
      },
    ]);
  };

  const renderElement = ({ item }: { item: Element }) => (
    <View style={{ backgroundColor: theme.colors.surface, padding: 16, marginBottom: 12, borderRadius: 12, borderWidth: 1, borderColor: theme.colors.border }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <View style={{ flex: 1 }}>
          <Text style={{ color: theme.colors.text, fontSize: 16, fontWeight: '600', marginBottom: 4 }}>{item.name}</Text>
          <Text style={{ color: theme.colors.primary, fontSize: 18, fontWeight: 'bold' }}>₹{item.standardRate.toLocaleString()}/sq.ft</Text>
        </View>
        <View style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: theme.colors.primary + '20', alignItems: 'center', justifyContent: 'center' }}>
          <Layers size={24} color={theme.colors.primary} />
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
            <Text style={{ fontSize: 24, fontWeight: 'bold', color: theme.colors.text }}>Elements</Text>
            <Text style={{ fontSize: 14, color: theme.colors.textSecondary }}>Manage element rates</Text>
          </View>
          <TouchableOpacity onPress={handleCreate} style={{ backgroundColor: theme.colors.primary, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8, flexDirection: 'row', alignItems: 'center' }}>
            <Plus size={20} color="#FFF" />
          </TouchableOpacity>
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: theme.colors.surface, borderRadius: 8, paddingHorizontal: 12, marginBottom: 16, borderWidth: 1, borderColor: theme.colors.border }}>
          <Search size={20} color={theme.colors.textSecondary} />
          <TextInput
            placeholder="Search elements..."
            placeholderTextColor={theme.colors.textSecondary}
            value={searchTerm}
            onChangeText={setSearchTerm}
            style={{ flex: 1, paddingVertical: 12, paddingHorizontal: 8, color: theme.colors.text }}
          />
        </View>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={theme.colors.primary} style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={elements}
          renderItem={renderElement}
          keyExtractor={item => item._id}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 80 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchElements(); }} colors={[theme.colors.primary]} />}
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
          <View style={{ backgroundColor: theme.colors.background, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, maxHeight: '80%' }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <Text style={{ fontSize: 20, fontWeight: 'bold', color: theme.colors.text }}>{editingElement ? 'Edit Element' : 'Add Element'}</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <X size={24} color={theme.colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={{ color: theme.colors.textSecondary, fontSize: 12, fontWeight: '600', marginBottom: 6 }}>ELEMENT NAME</Text>
              <TextInput
                value={formData.name}
                onChangeText={text => setFormData({ ...formData, name: text })}
                style={{ backgroundColor: theme.colors.surface, padding: 12, borderRadius: 8, color: theme.colors.text, marginBottom: 16, borderWidth: 1, borderColor: theme.colors.border }}
                placeholder="Enter element name"
                placeholderTextColor={theme.colors.textSecondary}
              />

              <Text style={{ color: theme.colors.textSecondary, fontSize: 12, fontWeight: '600', marginBottom: 6 }}>STANDARD RATE (₹/sq.ft)</Text>
              <TextInput
                value={formData.standardRate}
                onChangeText={text => setFormData({ ...formData, standardRate: text })}
                style={{ backgroundColor: theme.colors.surface, padding: 12, borderRadius: 8, color: theme.colors.text, marginBottom: 16, borderWidth: 1, borderColor: theme.colors.border }}
                placeholder="Enter rate"
                placeholderTextColor={theme.colors.textSecondary}
                keyboardType="decimal-pad"
              />

              <TouchableOpacity onPress={handleSubmit} style={{ backgroundColor: theme.colors.primary, padding: 16, borderRadius: 8, alignItems: 'center', marginTop: 20 }}>
                <Text style={{ color: '#FFF', fontSize: 16, fontWeight: 'bold' }}>{editingElement ? 'Update Element' : 'Create Element'}</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}
