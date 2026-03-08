import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, TextInput, Modal, Alert } from 'react-native';
import { Search, Plus, Edit2, Trash2, X, Package, IndianRupee } from 'lucide-react-native';
import { useTheme } from '../../context/ThemeContext';
import { elementService } from '../../services/elementService';
import Toast from 'react-native-toast-message';
import PageSkeleton from '../../components/PageSkeleton';

interface Element {
  _id: string;
  elementId: string;
  elementName: string;
  baseRate: number;
  category: string;
  description?: string;
}

export default function ElementsScreen() {
  const { theme } = useTheme();
  const [elements, setElements] = useState<Element[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [editingElement, setEditingElement] = useState<Element | null>(null);
  const [formData, setFormData] = useState({
    elementName: '',
    baseRate: '',
    category: '',
    description: ''
  });

  const fetchElements = useCallback(async () => {
    try {
      setLoading(true);
      const data = await elementService.getAll({ search: searchTerm });
      setElements(data.elements || []);
    } catch (error) {
      Toast.show({ type: 'error', text1: 'Failed to load elements' });
    } finally {
      setLoading(false);
    }
  }, [searchTerm]);

  useEffect(() => {
    fetchElements();
  }, [fetchElements]);

  const handleSubmit = async () => {
    if (!formData.elementName || !formData.baseRate) {
      Toast.show({ type: 'error', text1: 'Name and rate are required' });
      return;
    }

    try {
      const payload = {
        elementName: formData.elementName,
        baseRate: Number(formData.baseRate),
        category: formData.category,
        description: formData.description
      };

      if (editingElement) {
        await elementService.update(editingElement._id, payload);
        Toast.show({ type: 'success', text1: 'Element updated' });
      } else {
        await elementService.create(payload);
        Toast.show({ type: 'success', text1: 'Element created' });
      }
      
      setModalVisible(false);
      resetForm();
      fetchElements();
    } catch (error: any) {
      Toast.show({ type: 'error', text1: error.response?.data?.message || 'Operation failed' });
    }
  };

  const handleDelete = (element: Element) => {
    Alert.alert('Delete Element', `Delete "${element.elementName}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await elementService.delete(element._id);
            Toast.show({ type: 'success', text1: 'Element deleted' });
            fetchElements();
          } catch (error) {
            Toast.show({ type: 'error', text1: 'Failed to delete element' });
          }
        }
      }
    ]);
  };

  const resetForm = () => {
    setFormData({ elementName: '', baseRate: '', category: '', description: '' });
    setEditingElement(null);
  };

  const openModal = (element?: Element) => {
    if (element) {
      setEditingElement(element);
      setFormData({
        elementName: element.elementName,
        baseRate: element.baseRate.toString(),
        category: element.category,
        description: element.description || ''
      });
    } else {
      resetForm();
    }
    setModalVisible(true);
  };

  const renderElement = ({ item }: { item: Element }) => (
    <View style={{ 
      backgroundColor: theme.colors.surface, 
      padding: 16, 
      marginBottom: 12, 
      borderRadius: 12, 
      borderWidth: 1, 
      borderColor: theme.colors.border 
    }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
        <View style={{ 
          width: 48, 
          height: 48, 
          borderRadius: 24, 
          backgroundColor: theme.colors.primary + '20', 
          alignItems: 'center', 
          justifyContent: 'center', 
          marginRight: 12 
        }}>
          <Package size={24} color={theme.colors.primary} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ color: theme.colors.text, fontSize: 16, fontWeight: '600' }}>
            {item.elementName}
          </Text>
          <Text style={{ color: theme.colors.textSecondary, fontSize: 12 }}>
            {item.category}
          </Text>
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          <Text style={{ color: theme.colors.primary, fontSize: 16, fontWeight: 'bold' }}>
            ₹{item.baseRate}
          </Text>
          <Text style={{ color: theme.colors.textSecondary, fontSize: 10 }}>
            per sq.ft
          </Text>
        </View>
      </View>

      <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: 8 }}>
        <TouchableOpacity 
          onPress={() => openModal(item)}
          style={{ padding: 8, backgroundColor: '#3B82F620', borderRadius: 8 }}
        >
          <Edit2 size={18} color="#3B82F6" />
        </TouchableOpacity>
        <TouchableOpacity 
          onPress={() => handleDelete(item)}
          style={{ padding: 8, backgroundColor: '#EF444420', borderRadius: 8 }}
        >
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
            <Text style={{ fontSize: 14, color: theme.colors.textSecondary }}>Manage board elements</Text>
          </View>
          <TouchableOpacity 
            onPress={() => openModal()}
            style={{ 
              backgroundColor: theme.colors.primary, 
              paddingHorizontal: 16, 
              paddingVertical: 10, 
              borderRadius: 8, 
              flexDirection: 'row', 
              alignItems: 'center' 
            }}
          >
            <Plus size={20} color="#FFF" />
          </TouchableOpacity>
        </View>

        <View style={{ 
          flexDirection: 'row', 
          alignItems: 'center', 
          backgroundColor: theme.colors.surface, 
          borderRadius: 8, 
          paddingHorizontal: 12, 
          marginBottom: 16, 
          borderWidth: 1, 
          borderColor: theme.colors.border 
        }}>
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
        <PageSkeleton type="list" />
      ) : (
        <FlatList
          data={elements}
          renderItem={renderElement}
          keyExtractor={item => item._id}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 80 }}
        />
      )}

      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}>
          <View style={{ 
            backgroundColor: theme.colors.background, 
            borderTopLeftRadius: 20, 
            borderTopRightRadius: 20, 
            padding: 20 
          }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <Text style={{ fontSize: 20, fontWeight: 'bold', color: theme.colors.text }}>
                {editingElement ? 'Edit Element' : 'Add Element'}
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <X size={24} color={theme.colors.text} />
              </TouchableOpacity>
            </View>

            <View style={{ gap: 16 }}>
              <View>
                <Text style={{ color: theme.colors.textSecondary, fontSize: 12, fontWeight: '600', marginBottom: 6 }}>
                  ELEMENT NAME *
                </Text>
                <TextInput
                  value={formData.elementName}
                  onChangeText={text => setFormData({ ...formData, elementName: text })}
                  style={{ 
                    backgroundColor: theme.colors.surface, 
                    padding: 12, 
                    borderRadius: 8, 
                    color: theme.colors.text, 
                    borderWidth: 1, 
                    borderColor: theme.colors.border 
                  }}
                  placeholder="Enter element name"
                  placeholderTextColor={theme.colors.textSecondary}
                />
              </View>

              <View>
                <Text style={{ color: theme.colors.textSecondary, fontSize: 12, fontWeight: '600', marginBottom: 6 }}>
                  BASE RATE (₹/sq.ft) *
                </Text>
                <TextInput
                  value={formData.baseRate}
                  onChangeText={text => setFormData({ ...formData, baseRate: text })}
                  style={{ 
                    backgroundColor: theme.colors.surface, 
                    padding: 12, 
                    borderRadius: 8, 
                    color: theme.colors.text, 
                    borderWidth: 1, 
                    borderColor: theme.colors.border 
                  }}
                  placeholder="Enter rate per sq.ft"
                  placeholderTextColor={theme.colors.textSecondary}
                  keyboardType="decimal-pad"
                />
              </View>

              <View>
                <Text style={{ color: theme.colors.textSecondary, fontSize: 12, fontWeight: '600', marginBottom: 6 }}>
                  CATEGORY
                </Text>
                <TextInput
                  value={formData.category}
                  onChangeText={text => setFormData({ ...formData, category: text })}
                  style={{ 
                    backgroundColor: theme.colors.surface, 
                    padding: 12, 
                    borderRadius: 8, 
                    color: theme.colors.text, 
                    borderWidth: 1, 
                    borderColor: theme.colors.border 
                  }}
                  placeholder="Enter category"
                  placeholderTextColor={theme.colors.textSecondary}
                />
              </View>

              <TouchableOpacity 
                onPress={handleSubmit}
                style={{ 
                  backgroundColor: theme.colors.primary, 
                  padding: 16, 
                  borderRadius: 8, 
                  alignItems: 'center', 
                  marginTop: 20 
                }}
              >
                <Text style={{ color: '#FFF', fontSize: 16, fontWeight: 'bold' }}>
                  {editingElement ? 'Update Element' : 'Create Element'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}