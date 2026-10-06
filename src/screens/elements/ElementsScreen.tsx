import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, TextInput, Modal, Alert, StyleSheet } from 'react-native';
import { Search, Plus, Edit2, Trash2, X, Package, IndianRupee } from 'lucide-react-native';
import { useTheme } from '../../context/ThemeContext';
import { elementService } from '../../services/elementService';
import Toast from 'react-native-toast-message';
import PageSkeleton from '../../components/PageSkeleton';
import { Card, StatusBadge, Button, ScreenHeader, SearchBar, EmptyState, BottomSheet, TextField, FieldRow, tone, alpha } from '../../components/ui';

interface Element {
  _id: string;
  elementId?: string;
  elementName?: string;
  name?: string; // Web API field
  baseRate?: number;
  standardRate?: number; // Web API field
  category?: string;
  description?: string;
  createdAt?: string;
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
      console.log('Fetching elements with search term:', searchTerm);
      
      const response = await elementService.getAll({ search: searchTerm });
      console.log('Elements API response:', response);
      
      // Handle different response structures - match web implementation
      let elementsData = [];
      if (response.elements) {
        elementsData = response.elements;
      } else if (response.data && response.data.elements) {
        elementsData = response.data.elements;
      } else if (response.data && Array.isArray(response.data)) {
        elementsData = response.data;
      } else if (Array.isArray(response)) {
        elementsData = response;
      } else {
        console.warn('Unexpected response structure:', response);
        elementsData = [];
      }
      
      // Map web field names to mobile field names
      const mappedElements = elementsData.map((element: any) => ({
        _id: element._id,
        elementId: element._id, // Use _id as elementId
        elementName: element.name || element.elementName, // Web uses 'name', mobile expects 'elementName'
        baseRate: element.standardRate || element.baseRate, // Web uses 'standardRate', mobile expects 'baseRate'
        category: element.category || 'General', // Default category if not provided
        description: element.description || '',
        createdAt: element.createdAt
      }));
      
      console.log('Setting mapped elements data:', mappedElements);
      setElements(mappedElements);
      
      if (mappedElements.length === 0) {
        Toast.show({ 
          type: 'info', 
          text1: 'No elements found', 
          text2: searchTerm ? 'Try adjusting your search' : 'Add your first element' 
        });
      }
    } catch (error: any) {
      console.error('Elements fetch error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to load elements';
      Toast.show({ 
        type: 'error', 
        text1: 'Failed to load elements',
        text2: errorMessage
      });
      setElements([]);
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
      // Map mobile field names to web API field names
      const payload = {
        name: formData.elementName, // Web API expects 'name'
        standardRate: Number(formData.baseRate), // Web API expects 'standardRate'
        category: formData.category || 'General',
        description: formData.description || ''
      };

      console.log('Submitting element payload:', payload);

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
      console.error('Element submit error:', error);
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
        elementName: element.elementName || element.name || '', // Handle both field names
        baseRate: (element.baseRate || element.standardRate || 0).toString(), // Handle both field names
        category: element.category || 'General',
        description: element.description || ''
      });
    } else {
      resetForm();
    }
    setModalVisible(true);
  };

  const renderElement = ({ item }: { item: Element }) => (
    <Card onPress={() => openModal(item)} style={{ marginBottom: 10 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <View style={{ width: 46, height: 46, borderRadius: 14, backgroundColor: alpha(tone.violet, 0.12), alignItems: 'center', justifyContent: 'center' }}>
          <Package size={22} color={tone.violet} />
        </View>
        <View style={{ flex: 1, gap: 4 }}>
          <Text style={{ color: theme.colors.text, fontSize: 15, fontWeight: '800' }} numberOfLines={1}>{item.elementName}</Text>
          <StatusBadge label={item.category || 'General'} color={tone.neutral} size="sm" />
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          <Text style={{ color: theme.colors.text, fontSize: 18, fontWeight: '900' }}>₹{item.baseRate || 0}</Text>
          <Text style={{ color: theme.colors.textSecondary, fontSize: 11 }}>per sq.ft</Text>
        </View>
      </View>
      {!!item.description && (
        <Text style={{ color: theme.colors.textSecondary, fontSize: 12, marginTop: 10 }} numberOfLines={2}>{item.description}</Text>
      )}
      <View style={{ height: StyleSheet.hairlineWidth, backgroundColor: theme.colors.border, marginVertical: 12 }} />
      <View style={{ flexDirection: 'row', gap: 8, justifyContent: 'flex-end' }}>
        <Button label="Edit" variant="soft" color={tone.info} size="sm" icon={(col) => <Edit2 size={14} color={col} />} onPress={() => openModal(item)} />
        <Button variant="soft" color={tone.danger} size="sm" icon={(col) => <Trash2 size={15} color={col} />} onPress={() => handleDelete(item)} />
      </View>
    </Card>
  );

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <View style={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 6 }}>
        <ScreenHeader
          title="Elements"
          subtitle="Board elements and base rates"
          count={elements.length}
          actions={
            <Button label="Add" variant="primary" icon={(col) => <Plus size={18} color={col} strokeWidth={2.5} />} onPress={() => openModal()} />
          }
        />
        <SearchBar value={searchTerm} onChangeText={setSearchTerm} placeholder="Search elements…" />
      </View>

      {loading ? (
        <PageSkeleton type="list" />
      ) : (
        <FlatList
          data={elements}
          renderItem={renderElement}
          keyExtractor={item => item._id}
          contentContainerStyle={{ padding: 16, paddingTop: 10, paddingBottom: 80 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <EmptyState
              title={searchTerm ? 'No elements found' : 'No elements yet'}
              message={searchTerm ? 'Try adjusting your search terms.' : 'Add your first element to get started.'}
              icon={<Package size={28} color={theme.colors.textTertiary} />}
              action={!searchTerm ? (
                <Button label="Add element" variant="primary" icon={(col) => <Plus size={16} color={col} />} onPress={() => openModal()} />
              ) : (
                <Button label="Clear search" variant="outline" onPress={() => setSearchTerm('')} />
              )}
            />
          }
        />
      )}

      <BottomSheet
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        title={editingElement ? 'Edit element' : 'Add element'}
        subtitle="Name and rate are required"
        icon={<Package size={18} color={theme.colors.text} />}
        footer={
          <>
            <Button label="Cancel" variant="outline" size="lg" flex onPress={() => setModalVisible(false)} />
            <Button label={editingElement ? 'Update' : 'Create'} variant="primary" size="lg" flex onPress={handleSubmit} />
          </>
        }
      >
        <TextField
          label="Element name"
          required
          value={formData.elementName}
          onChangeText={text => setFormData({ ...formData, elementName: text })}
          placeholder="e.g. Flex board"
        />
        <FieldRow>
          <TextField
            label="Base rate"
            required
            suffix="₹/sq.ft"
            value={formData.baseRate}
            onChangeText={text => setFormData({ ...formData, baseRate: text })}
            placeholder="0"
            keyboardType="decimal-pad"
          />
          <TextField
            label="Category"
            value={formData.category}
            onChangeText={text => setFormData({ ...formData, category: text })}
            placeholder="General"
          />
        </FieldRow>
      </BottomSheet>
    </View>
  );
}
