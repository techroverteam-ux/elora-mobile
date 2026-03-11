import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, TextInput, RefreshControl, Modal, ScrollView, Alert } from 'react-native';
import { Search, Plus, Edit2, Trash2, X, Building2, MapPin, CreditCard, Download, ChevronDown } from 'lucide-react-native';
import { useTheme } from '../../context/ThemeContext';
import { clientService } from '../../services/clientService';
import { elementService } from '../../services/elementService';
import Toast from 'react-native-toast-message';
import PageSkeleton from '../../components/PageSkeleton';

interface Client {
  _id: string;
  clientCode: string;
  clientName: string;
  branchName: string;
  gstNumber: string;
  elements: any[];
  createdAt: string;
}

interface Element {
  _id: string;
  name: string;
  standardRate: number;
}

interface ClientElement {
  elementId: string;
  elementName: string;
  customRate: number;
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
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [clientToDelete, setClientToDelete] = useState<Client | null>(null);
  const [formData, setFormData] = useState({
    clientName: '',
    branchName: '',
    gstNumber: '',
  });
  
  // Element management state
  const [availableElements, setAvailableElements] = useState<Element[]>([]);
  const [clientElements, setClientElements] = useState<ClientElement[]>([]);
  const [selectedElementId, setSelectedElementId] = useState('');
  const [customRate, setCustomRate] = useState('');
  const [isElementDropdownOpen, setIsElementDropdownOpen] = useState(false);

  useEffect(() => {
    fetchClients();
    fetchElements();
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

  const fetchElements = async () => {
    try {
      const data = await elementService.getAll({ limit: 100 });
      setAvailableElements(data.elements || []);
    } catch (error) {
      console.error('Failed to load elements:', error);
    }
  };

  const handleCreate = () => {
    setEditingClient(null);
    setFormData({ clientName: '', branchName: '', gstNumber: '' });
    setClientElements([]);
    setSelectedElementId('');
    setCustomRate('');
    setModalVisible(true);
  };

  const handleEdit = (client: Client) => {
    setEditingClient(client);
    setFormData({
      clientName: client.clientName,
      branchName: client.branchName,
      gstNumber: client.gstNumber,
    });
    setClientElements(client.elements || []);
    setSelectedElementId('');
    setCustomRate('');
    setModalVisible(true);
  };

  const handleSubmit = async () => {
    if (!formData.clientName || !formData.branchName || !formData.gstNumber) {
      Toast.show({ type: 'error', text1: 'Please fill all fields' });
      return;
    }

    try {
      const payload = {
        clientName: formData.clientName,
        branchName: formData.branchName,
        gstNumber: formData.gstNumber,
        elements: clientElements,
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

  const handleDelete = (client: Client) => {
    setClientToDelete(client);
    setDeleteModalVisible(true);
  };

  const confirmDelete = async () => {
    if (!clientToDelete) return;
    
    try {
      await clientService.delete(clientToDelete._id);
      Toast.show({ type: 'success', text1: 'Client deleted successfully' });
      setDeleteModalVisible(false);
      setClientToDelete(null);
      fetchClients();
    } catch (error) {
      Toast.show({ type: 'error', text1: 'Failed to delete client' });
    }
  };

  const renderClient = ({ item }: { item: Client }) => (
    <View style={{ backgroundColor: theme.colors.surface, padding: 16, marginBottom: 12, borderRadius: 12, borderWidth: 1, borderColor: theme.colors.border }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
        <View style={{ flex: 1 }}>
          <Text style={{ color: theme.colors.primary, fontSize: 12, fontWeight: '600', marginBottom: 4 }}>
            {item.clientCode}
          </Text>
          <Text style={{ color: theme.colors.text, fontSize: 16, fontWeight: '600', marginBottom: 4 }}>
            {item.clientName}
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <MapPin size={12} color={theme.colors.textSecondary} />
            <Text style={{ color: theme.colors.textSecondary, fontSize: 12, marginLeft: 4 }}>
              {item.branchName}
            </Text>
          </View>
        </View>
      </View>

      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 }}>
        <View>
          <Text style={{ color: theme.colors.textSecondary, fontSize: 12 }}>GST Number</Text>
          <Text style={{ color: theme.colors.text, fontSize: 14, fontWeight: '600', fontFamily: 'monospace' }}>{item.gstNumber}</Text>
        </View>
        <View>
          <Text style={{ color: theme.colors.textSecondary, fontSize: 12 }}>Elements</Text>
          <Text style={{ color: theme.colors.text, fontSize: 14, fontWeight: '600' }}>{item.elements.length}</Text>
        </View>
      </View>

      <View style={{ flexDirection: 'row', gap: 8 }}>
        <TouchableOpacity onPress={() => handleEdit(item)} style={{ flex: 1, backgroundColor: '#F59E0B20', padding: 10, borderRadius: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
          <Edit2 size={16} color="#F59E0B" />
          <Text style={{ color: '#F59E0B', marginLeft: 6, fontWeight: '600', fontSize: 12 }}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleDelete(item)} style={{ backgroundColor: '#EF444420', padding: 10, borderRadius: 8 }}>
          <Trash2 size={16} color="#EF4444" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      {/* Simple Header */}
      <View style={{ padding: 16 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <View>
            <Text style={{ fontSize: 24, fontWeight: 'bold', color: theme.colors.text }}>Client Management</Text>
            <Text style={{ fontSize: 14, color: theme.colors.textSecondary }}>Manage your clients</Text>
          </View>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <TouchableOpacity 
              onPress={() => {
                Toast.show({ 
                  type: 'info', 
                  text1: 'Export Feature', 
                  text2: 'Please use web portal for downloads' 
                });
              }}
              style={{ backgroundColor: '#10B981', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8 }}
            >
              <Download size={16} color="#FFF" />
            </TouchableOpacity>
            <TouchableOpacity onPress={handleCreate} style={{ backgroundColor: theme.colors.primary, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8 }}>
              <Plus size={16} color="#FFF" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Simple Search */}
        <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: theme.colors.surface, borderRadius: 8, paddingHorizontal: 12, borderWidth: 1, borderColor: theme.colors.border }}>
          <Search size={20} color={theme.colors.textSecondary} />
          <TextInput
            style={{ flex: 1, paddingVertical: 12, paddingHorizontal: 8, color: theme.colors.text, fontSize: 16 }}
            placeholder="Search clients..."
            placeholderTextColor={theme.colors.textSecondary}
            value={searchTerm}
            onChangeText={setSearchTerm}
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
          contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 0 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchClients(); }} colors={[theme.colors.primary]} />}
        />
      )}

      <Modal visible={modalVisible} animationType="slide" transparent accessibilityViewIsModal={true}>
        <View 
          style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}
          accessible={false}
          importantForAccessibility="no-hide-descendants"
        >
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

              {/* Element Rates Section */}
              <Text style={{ color: theme.colors.textSecondary, fontSize: 12, fontWeight: '600', marginBottom: 6 }}>ELEMENT RATES</Text>
              
              {/* Add Element */}
              <View style={{ marginBottom: 16 }}>
                <Text style={{ color: theme.colors.textSecondary, fontSize: 11, marginBottom: 8 }}>Add Element</Text>
                <View style={{ flexDirection: 'row', gap: 8, marginBottom: 8 }}>
                  <View style={{ flex: 2 }}>
                    <TouchableOpacity
                      onPress={() => setIsElementDropdownOpen(!isElementDropdownOpen)}
                      style={{
                        backgroundColor: theme.colors.surface,
                        borderWidth: 1,
                        borderColor: theme.colors.border,
                        borderRadius: 8,
                        padding: 12,
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}
                    >
                      <Text style={{ 
                        color: selectedElementId ? theme.colors.text : theme.colors.textSecondary, 
                        fontSize: 14
                      }}>
                        {selectedElementId 
                          ? availableElements.find(el => el._id === selectedElementId)?.name || 'Select Element'
                          : 'Select Element'
                        }
                      </Text>
                      <ChevronDown size={16} color={theme.colors.textSecondary} />
                    </TouchableOpacity>
                    
                    {isElementDropdownOpen && (
                      <View style={{
                        backgroundColor: theme.colors.surface,
                        borderWidth: 1,
                        borderColor: theme.colors.border,
                        borderRadius: 8,
                        marginTop: 4,
                        maxHeight: 150,
                        position: 'absolute',
                        top: 50,
                        left: 0,
                        right: 0,
                        zIndex: 1000
                      }}>
                        <ScrollView style={{ maxHeight: 150 }}>
                          {availableElements
                            .filter(element => !clientElements.some(ce => ce.elementId === element._id))
                            .map((element) => (
                            <TouchableOpacity
                              key={element._id}
                              onPress={() => {
                                setSelectedElementId(element._id);
                                setCustomRate(element.standardRate.toString());
                                setIsElementDropdownOpen(false);
                              }}
                              style={{
                                padding: 12,
                                borderBottomWidth: 1,
                                borderBottomColor: theme.colors.border
                              }}
                            >
                              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                <Text style={{ color: theme.colors.text, fontSize: 14 }}>
                                  {element.name}
                                </Text>
                                <Text style={{ color: theme.colors.textSecondary, fontSize: 12 }}>
                                  ₹{element.standardRate}
                                </Text>
                              </View>
                            </TouchableOpacity>
                          ))}
                        </ScrollView>
                      </View>
                    )}
                  </View>
                  
                  <View style={{ flex: 1 }}>
                    <TextInput
                      value={customRate}
                      onChangeText={setCustomRate}
                      style={{
                        backgroundColor: theme.colors.surface,
                        padding: 12,
                        borderRadius: 8,
                        color: theme.colors.text,
                        borderWidth: 1,
                        borderColor: theme.colors.border
                      }}
                      placeholder="Rate"
                      placeholderTextColor={theme.colors.textSecondary}
                      keyboardType="decimal-pad"
                    />
                  </View>
                </View>
                
                <TouchableOpacity
                  onPress={() => {
                    if (selectedElementId && customRate) {
                      const element = availableElements.find(el => el._id === selectedElementId);
                      if (element) {
                        setClientElements([...clientElements, {
                          elementId: element._id,
                          elementName: element.name,
                          customRate: Number(customRate)
                        }]);
                        setSelectedElementId('');
                        setCustomRate('');
                      }
                    }
                  }}
                  disabled={!selectedElementId || !customRate}
                  style={{
                    backgroundColor: (!selectedElementId || !customRate) ? theme.colors.border : theme.colors.primary,
                    padding: 10,
                    borderRadius: 8,
                    alignItems: 'center'
                  }}
                >
                  <Text style={{ color: '#FFF', fontSize: 12, fontWeight: '600' }}>Add Element</Text>
                </TouchableOpacity>
              </View>
              
              {/* Current Elements */}
              {clientElements.length > 0 && (
                <View style={{ marginBottom: 16 }}>
                  <Text style={{ color: theme.colors.textSecondary, fontSize: 11, marginBottom: 8 }}>Current Elements</Text>
                  {clientElements.map((element, index) => (
                    <View key={index} style={{
                      backgroundColor: theme.colors.background,
                      padding: 12,
                      borderRadius: 8,
                      marginBottom: 8,
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      borderWidth: 1,
                      borderColor: theme.colors.border
                    }}>
                      <View style={{ flex: 1 }}>
                        <Text style={{ color: theme.colors.text, fontSize: 14, fontWeight: '600' }}>
                          {element.elementName}
                        </Text>
                        <Text style={{ color: theme.colors.textSecondary, fontSize: 12 }}>
                          ₹{element.customRate}/sq.ft
                        </Text>
                      </View>
                      <TouchableOpacity
                        onPress={() => {
                          setClientElements(clientElements.filter((_, i) => i !== index));
                        }}
                        style={{ padding: 8 }}
                      >
                        <Trash2 size={16} color="#EF4444" />
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              )}

              <TouchableOpacity onPress={handleSubmit} style={{ backgroundColor: theme.colors.primary, padding: 16, borderRadius: 8, alignItems: 'center', marginTop: 20 }}>
                <Text style={{ color: '#FFF', fontSize: 16, fontWeight: 'bold' }}>{editingClient ? 'Update Client' : 'Create Client'}</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal visible={deleteModalVisible} animationType="fade" transparent accessibilityViewIsModal={true}>
        <View 
          style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center', padding: 20 }}
          accessible={false}
          importantForAccessibility="no-hide-descendants"
        >
          <View style={{ backgroundColor: theme.colors.background, borderRadius: 16, padding: 24, width: '100%', maxWidth: 400, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 8 }}>
            <View style={{ alignItems: 'center', marginBottom: 20 }}>
              <View style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: '#EF444420', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                <Trash2 size={32} color="#EF4444" />
              </View>
              <Text style={{ fontSize: 20, fontWeight: 'bold', color: theme.colors.text, marginBottom: 8 }}>Delete Client</Text>
              <Text style={{ fontSize: 14, color: theme.colors.textSecondary, textAlign: 'center', lineHeight: 20 }}>
                Are you sure you want to delete "{clientToDelete?.clientName}"? This action cannot be undone and will permanently remove all client data.
              </Text>
            </View>
            
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <TouchableOpacity
                onPress={() => {
                  setDeleteModalVisible(false);
                  setClientToDelete(null);
                }}
                style={{ flex: 1, padding: 14, borderRadius: 12, backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: theme.colors.border, alignItems: 'center' }}
              >
                <Text style={{ color: theme.colors.text, fontSize: 16, fontWeight: '600' }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={confirmDelete}
                style={{ flex: 1, padding: 14, borderRadius: 12, backgroundColor: '#EF4444', alignItems: 'center' }}
              >
                <Text style={{ color: '#FFF', fontSize: 16, fontWeight: '600' }}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
