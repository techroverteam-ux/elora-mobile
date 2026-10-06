import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, TextInput, RefreshControl, Modal, ScrollView, Alert, Switch, StyleSheet } from 'react-native';
import { Search, Plus, Edit2, Trash2, X, Building2, MapPin, CreditCard, Download, ChevronDown, Settings } from 'lucide-react-native';
import { useTheme } from '../../context/ThemeContext';
import { clientService } from '../../services/clientService';
import { elementService } from '../../services/elementService';
import { fileService } from '../../services/fileService';
import { modernDownloadService } from '../../services/modernDownloadService';
import DownloadButton from '../../components/DownloadButton';
import { permissionService } from '../../services/permissionService';
import Toast from 'react-native-toast-message';
import PageSkeleton from '../../components/PageSkeleton';
import { Card, StatusBadge, Button, Avatar, MetaGrid, ScreenHeader, SearchBar, Pagination, EmptyState, BottomSheet, ConfirmDialog, FormSection, FieldRow, TextField, SelectField, ToggleCard, tone } from '../../components/ui';

interface Client {
  _id: string;
  clientCode: string;
  clientName: string;
  branchName: string;
  gstNumber: string;
  elements: any[];
  enableLocationMapping?: boolean;
  locationConfig?: {
    enableLocationOverlay: boolean;
    showAddress?: boolean;
    showCoordinates?: boolean;
    showTimestamp?: boolean;
    mapSize?: number;
    position?: 'bottom-left' | 'bottom-right' | 'top-left' | 'top-right';
  };
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
  quantity: number;
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
    enableLocationMapping: false,
  });
  
  // Element management state
  const [availableElements, setAvailableElements] = useState<Element[]>([]);
  const [clientElements, setClientElements] = useState<ClientElement[]>([]);
  const [selectedElementId, setSelectedElementId] = useState('');
  const [customRate, setCustomRate] = useState('');
  const [elementQuantity, setElementQuantity] = useState('1');
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
      // Unpaginated on purpose — this feeds the "add element to client" picker, which needs
      // the whole catalog, not just the first page (matches elora-web's /elements/all call).
      const data = await elementService.getAllUnpaginated();
      setAvailableElements(data.elements || []);
    } catch (error) {
      console.error('Failed to load elements:', error);
    }
  };

  const handleCreate = () => {
    setEditingClient(null);
    setFormData({ clientName: '', branchName: '', gstNumber: '', enableLocationMapping: false });
    setClientElements([]);
    setSelectedElementId('');
    setCustomRate('');
    setElementQuantity('1');
    setModalVisible(true);
  };

  const handleEdit = (client: Client) => {
    setEditingClient(client);
    setFormData({
      clientName: client.clientName,
      branchName: client.branchName,
      gstNumber: client.gstNumber,
      enableLocationMapping: client.enableLocationMapping || false,
    });
    setClientElements((client.elements || []).map((el: any) => ({ ...el, quantity: el.quantity || 1 })));
    setSelectedElementId('');
    setCustomRate('');
    setElementQuantity('1');
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
        enableLocationMapping: formData.enableLocationMapping,
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

  // UI helpers -------------------------------------------------------------
  const [isExportingClients, setIsExportingClients] = useState(false);
  const handleExportClients = async () => {
    setIsExportingClients(true);
    try {
      const blob = await clientService.exportClients({ search: searchTerm });
      await modernDownloadService.downloadExcel({
        blob,
        filename: `Clients_Export_${new Date().toISOString().split('T')[0]}`
      });
    } catch (error) {
      Toast.show({ type: 'error', text1: 'Export failed' });
    } finally {
      setIsExportingClients(false);
    }
  };

  const addSelectedElement = () => {
    if (selectedElementId && customRate) {
      const element = availableElements.find(el => el._id === selectedElementId);
      if (element) {
        setClientElements([...clientElements, {
          elementId: element._id,
          elementName: element.name,
          customRate: Number(customRate),
          quantity: Math.max(1, Number(elementQuantity) || 1)
        }]);
        setSelectedElementId('');
        setCustomRate('');
        setElementQuantity('1');
      }
    }
  };

  const renderClient = ({ item }: { item: Client }) => (
    <Card onPress={() => handleEdit(item)} style={{ marginBottom: 10 }}>
      <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 12 }}>
        <Avatar name={item.clientName} size={44} color={tone.indigo} />
        <View style={{ flex: 1, gap: 3 }}>
          <Text style={{ color: theme.colors.textSecondary, fontSize: 11, fontWeight: '800', letterSpacing: 0.6 }} numberOfLines={1}>{item.clientCode}</Text>
          <Text style={{ color: theme.colors.text, fontSize: 16, fontWeight: '800' }} numberOfLines={1}>{item.clientName}</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <MapPin size={12} color={theme.colors.textSecondary} />
            <Text style={{ color: theme.colors.textSecondary, fontSize: 12, flex: 1 }} numberOfLines={1}>{item.branchName}</Text>
          </View>
        </View>
        <StatusBadge
          label={item.enableLocationMapping ? 'GPS on' : 'GPS off'}
          color={item.enableLocationMapping ? tone.success : tone.neutral}
          size="sm"
        />
      </View>

      <View style={{ marginTop: 12 }}>
        <MetaGrid
          items={[
            { label: 'GST number', value: item.gstNumber || '—' },
            { label: 'Elements', value: String(item.elements?.length || 0) },
          ]}
        />
      </View>

      <View style={{ height: StyleSheet.hairlineWidth, backgroundColor: theme.colors.border, marginVertical: 12 }} />
      <View style={{ flexDirection: 'row', gap: 8, justifyContent: 'flex-end' }}>
        <Button label="Edit" variant="soft" color={tone.info} size="sm" icon={(col) => <Edit2 size={14} color={col} />} onPress={() => handleEdit(item)} />
        <Button variant="soft" color={tone.danger} size="sm" icon={(col) => <Trash2 size={15} color={col} />} onPress={() => handleDelete(item)} />
      </View>
    </Card>
  );

  const pickableElements = availableElements.filter(element => !clientElements.some(ce => ce.elementId === element._id));

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <View style={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 6 }}>
        <ScreenHeader
          title="Clients"
          subtitle="Clients, branches and element rates"
          count={clients.length}
          actions={
            <>
              <Button variant="outline" loading={isExportingClients} disabled={isExportingClients} icon={(col) => <Download size={18} color={col} />} onPress={handleExportClients} />
              <Button label="Add" variant="primary" icon={(col) => <Plus size={18} color={col} strokeWidth={2.5} />} onPress={handleCreate} />
            </>
          }
        />
        <SearchBar value={searchTerm} onChangeText={setSearchTerm} placeholder="Search clients…" />
      </View>

      {loading ? (
        <PageSkeleton type="list" />
      ) : (
        <FlatList
          data={clients}
          renderItem={renderClient}
          keyExtractor={item => item._id}
          contentContainerStyle={{ padding: 16, paddingTop: 10, paddingBottom: 80 }}
          keyboardShouldPersistTaps="handled"
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchClients(); }} colors={[theme.colors.primary]} tintColor={theme.colors.primary} />}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <EmptyState
              title={searchTerm ? 'No clients found' : 'No clients yet'}
              message={searchTerm ? 'Try adjusting your search terms.' : 'Add your first client to get started.'}
              icon={<Building2 size={28} color={theme.colors.textTertiary} />}
              action={!searchTerm ? <Button label="Add client" variant="primary" icon={(col) => <Plus size={16} color={col} />} onPress={handleCreate} /> : undefined}
            />
          }
          ListFooterComponent={
            clients.length > 0 ? (
              <Pagination
                page={page}
                totalPages={totalPages}
                onPrev={() => setPage(p => Math.max(1, p - 1))}
                onNext={() => setPage(p => Math.min(totalPages, p + 1))}
              />
            ) : null
          }
        />
      )}

      <BottomSheet
        visible={modalVisible}
        onClose={() => { setModalVisible(false); setIsElementDropdownOpen(false); }}
        title={editingClient ? 'Edit client' : 'Add client'}
        subtitle={editingClient ? editingClient.clientCode : 'All fields are required'}
        icon={<Building2 size={18} color={theme.colors.text} />}
        footer={
          <>
            <Button label="Cancel" variant="outline" size="lg" flex onPress={() => { setModalVisible(false); setIsElementDropdownOpen(false); }} />
            <Button label={editingClient ? 'Update client' : 'Create client'} variant="primary" size="lg" flex onPress={handleSubmit} />
          </>
        }
      >
        <FormSection step={1} title="Client details">
          <TextField
            label="Client name"
            required
            value={formData.clientName}
            onChangeText={text => setFormData({ ...formData, clientName: text })}
            placeholder="Enter client name"
          />
          <FieldRow>
            <TextField
              label="Branch"
              required
              value={formData.branchName}
              onChangeText={text => setFormData({ ...formData, branchName: text })}
              placeholder="Branch name"
            />
            <TextField
              label="GST number"
              required
              hint={`${formData.gstNumber.length}/15`}
              value={formData.gstNumber}
              onChangeText={text => setFormData({ ...formData, gstNumber: text.toUpperCase() })}
              placeholder="22AAAAA0000A1Z5"
              autoCapitalize="characters"
              maxLength={15}
            />
          </FieldRow>
        </FormSection>

        <FormSection step={2} title="Photo settings">
          <ToggleCard
            value={formData.enableLocationMapping}
            onToggle={() => setFormData({ ...formData, enableLocationMapping: !formData.enableLocationMapping })}
            icon={<MapPin size={20} color={formData.enableLocationMapping ? theme.colors.text : theme.colors.textSecondary} />}
            title="GPS location on photos"
            description="Recce and installation photos get a GPS + map overlay"
          />
        </FormSection>

        <FormSection
          step={3}
          title="Element rates"
          description="Elements this client can use, with custom rates"
          right={<StatusBadge label={`${clientElements.length} added`} color={clientElements.length ? tone.success : tone.neutral} size="sm" />}
        >
          <SelectField
            label="Element"
            placeholder="Select element"
            valueText={selectedElementId ? availableElements.find(el => el._id === selectedElementId)?.name : undefined}
            selectedKey={selectedElementId}
            open={isElementDropdownOpen}
            onToggle={() => setIsElementDropdownOpen(!isElementDropdownOpen)}
            searchable
            emptyText="All elements are already added"
            options={pickableElements.map(el => ({ key: el._id, label: el.name, sublabel: `Standard ₹${el.standardRate}/sq.ft` }))}
            onSelect={(o) => {
              const element = availableElements.find(el => el._id === o.key);
              if (element) {
                setSelectedElementId(element._id);
                setCustomRate(element.standardRate.toString());
                setElementQuantity('1');
              }
              setIsElementDropdownOpen(false);
            }}
          />
          <FieldRow>
            <TextField label="Rate" suffix="₹/sq.ft" value={customRate} onChangeText={setCustomRate} placeholder="0" keyboardType="decimal-pad" />
            <TextField label="Quantity" value={elementQuantity} onChangeText={setElementQuantity} placeholder="1" keyboardType="number-pad" />
          </FieldRow>
          <Button
            label="Add element"
            variant="outline"
            disabled={!selectedElementId || !customRate}
            icon={(col) => <Plus size={16} color={col} />}
            onPress={addSelectedElement}
          />

          {clientElements.length > 0 && (
            <View style={{ gap: 8 }}>
              {clientElements.map((element, index) => (
                <View key={index} style={{ flexDirection: 'row', alignItems: 'center', gap: 10, padding: 10, borderRadius: 12, backgroundColor: theme.colors.background, borderWidth: 1, borderColor: theme.colors.border }}>
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: theme.colors.text, fontSize: 14, fontWeight: '800' }} numberOfLines={1}>{element.elementName}</Text>
                    <Text style={{ color: theme.colors.textSecondary, fontSize: 12 }}>₹{element.customRate}/sq.ft</Text>
                  </View>
                  <View style={{ alignItems: 'center' }}>
                    <Text style={{ color: theme.colors.textSecondary, fontSize: 9, fontWeight: '800', marginBottom: 2 }}>QTY</Text>
                    <TextInput
                      value={String(element.quantity ?? 1)}
                      onChangeText={(text) => {
                        const updated = [...clientElements];
                        updated[index] = { ...updated[index], quantity: Math.max(1, Number(text) || 1) };
                        setClientElements(updated);
                      }}
                      keyboardType="number-pad"
                      style={{ width: 48, textAlign: 'center', color: theme.colors.text, fontSize: 14, fontWeight: '800', borderWidth: 1, borderColor: theme.colors.border, borderRadius: 8, paddingVertical: 4 }}
                    />
                  </View>
                  <Button
                    variant="ghost"
                    color={tone.danger}
                    size="sm"
                    icon={(col) => <Trash2 size={16} color={col} />}
                    onPress={() => setClientElements(clientElements.filter((_, i) => i !== index))}
                  />
                </View>
              ))}
            </View>
          )}
        </FormSection>
      </BottomSheet>

      <ConfirmDialog
        visible={deleteModalVisible}
        title="Delete client?"
        message={`"${clientToDelete?.clientName || ''}" and all its data will be permanently removed. This can't be undone.`}
        icon={<Trash2 size={28} color={tone.danger} />}
        confirmLabel="Delete"
        onConfirm={confirmDelete}
        onCancel={() => {
          setDeleteModalVisible(false);
          setClientToDelete(null);
        }}
      />
    </View>
  );
}
