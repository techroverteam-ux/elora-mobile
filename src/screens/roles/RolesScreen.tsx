import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, TextInput, ActivityIndicator, RefreshControl, Modal, ScrollView, Alert } from 'react-native';
import { Search, Plus, Edit2, Trash2, X, Shield, ChevronLeft, ChevronRight } from 'lucide-react-native';
import { useTheme } from '../../context/ThemeContext';
import { roleService } from '../../services/roleService';
import { Role, PermissionSet } from '../../types';
import Toast from 'react-native-toast-message';

const MODULES = ['users', 'roles', 'stores', 'recce', 'installation', 'enquiries', 'reports', 'elements', 'clients'];

export default function RolesScreen() {
  const { theme } = useTheme();
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    permissions: {} as Record<string, PermissionSet>,
  });

  useEffect(() => {
    fetchRoles();
  }, [page, searchTerm]);

  const generateDefaultPermissions = () => {
    return MODULES.reduce((acc, module) => {
      acc[module] = { view: true, create: true, edit: true, delete: true };
      return acc;
    }, {} as Record<string, PermissionSet>);
  };

  const fetchRoles = async () => {
    try {
      setLoading(true);
      const data = await roleService.getAll({ page, limit: 10, search: searchTerm });
      setRoles(data.roles || []);
      setTotalPages(data.pagination?.pages || 1);
    } catch (error) {
      Toast.show({ type: 'error', text1: 'Failed to load roles' });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleCreate = () => {
    setEditingRole(null);
    setFormData({ name: '', code: '', permissions: generateDefaultPermissions() });
    setModalVisible(true);
  };

  const handleEdit = (role: Role) => {
    setEditingRole(role);
    setFormData({
      name: role.name,
      code: role.code,
      permissions: { ...generateDefaultPermissions(), ...role.permissions },
    });
    setModalVisible(true);
  };

  const togglePermission = (module: string, action: keyof PermissionSet) => {
    setFormData(prev => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        [module]: {
          ...prev.permissions[module],
          [action]: !prev.permissions[module][action],
        },
      },
    }));
  };

  const handleSubmit = async () => {
    try {
      if (editingRole) {
        await roleService.update(editingRole._id, formData);
        Toast.show({ type: 'success', text1: 'Role updated successfully' });
      } else {
        await roleService.create(formData);
        Toast.show({ type: 'success', text1: 'Role created successfully' });
      }
      setModalVisible(false);
      fetchRoles();
    } catch (error: any) {
      Toast.show({ type: 'error', text1: error.response?.data?.message || 'Operation failed' });
    }
  };

  const handleDelete = (id: string, code: string) => {
    if (code === 'SUPER_ADMIN') {
      Toast.show({ type: 'error', text1: 'Cannot delete SUPER_ADMIN role' });
      return;
    }
    Alert.alert('Delete Role', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await roleService.delete(id);
            Toast.show({ type: 'success', text1: 'Role deleted' });
            fetchRoles();
          } catch (error) {
            Toast.show({ type: 'error', text1: 'Failed to delete role' });
          }
        },
      },
    ]);
  };

  const renderRole = ({ item }: { item: Role }) => (
    <View style={{ backgroundColor: theme.colors.surface, padding: 16, marginBottom: 12, borderRadius: 12, borderWidth: 1, borderColor: theme.colors.border }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
        <View style={{ width: 40, height: 40, borderRadius: 8, backgroundColor: theme.colors.primary + '20', alignItems: 'center', justifyContent: 'center' }}>
          <Shield size={20} color={theme.colors.primary} />
        </View>
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={{ color: theme.colors.text, fontSize: 16, fontWeight: '600' }}>{item.name}</Text>
          <Text style={{ color: theme.colors.textSecondary, fontSize: 12, fontFamily: 'monospace' }}>{item.code}</Text>
        </View>
      </View>
      <View style={{ marginBottom: 12 }}>
        {Object.entries(item.permissions).slice(0, 3).map(([key, val]) => (
          <View key={key} style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
            <Text style={{ color: theme.colors.textSecondary, fontSize: 12, textTransform: 'capitalize' }}>{key}</Text>
            <View style={{ flexDirection: 'row', gap: 4 }}>
              <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: val.view ? '#10B981' : theme.colors.border }} />
              <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: val.create ? '#3B82F6' : theme.colors.border }} />
              <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: val.edit ? '#F59E0B' : theme.colors.border }} />
              <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: val.delete ? '#EF4444' : theme.colors.border }} />
            </View>
          </View>
        ))}
      </View>
      <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: 8, paddingTop: 12, borderTopWidth: 1, borderTopColor: theme.colors.border }}>
        <TouchableOpacity onPress={() => handleEdit(item)} style={{ padding: 8, backgroundColor: '#3B82F620', borderRadius: 8 }}>
          <Edit2 size={18} color="#3B82F6" />
        </TouchableOpacity>
        {item.code !== 'SUPER_ADMIN' && (
          <TouchableOpacity onPress={() => handleDelete(item._id, item.code)} style={{ padding: 8, backgroundColor: '#EF444420', borderRadius: 8 }}>
            <Trash2 size={18} color="#EF4444" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <View style={{ padding: 16 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <View>
            <Text style={{ fontSize: 24, fontWeight: 'bold', color: theme.colors.text }}>Roles</Text>
            <Text style={{ fontSize: 14, color: theme.colors.textSecondary }}>Manage permissions</Text>
          </View>
          <TouchableOpacity onPress={handleCreate} style={{ backgroundColor: theme.colors.primary, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8, flexDirection: 'row', alignItems: 'center' }}>
            <Plus size={20} color="#FFF" />
            <Text style={{ color: '#FFF', marginLeft: 6, fontWeight: '600' }}>Add</Text>
          </TouchableOpacity>
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: theme.colors.surface, borderRadius: 8, paddingHorizontal: 12, marginBottom: 16, borderWidth: 1, borderColor: theme.colors.border }}>
          <Search size={20} color={theme.colors.textSecondary} />
          <TextInput
            placeholder="Search roles..."
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
          data={roles}
          renderItem={renderRole}
          keyExtractor={item => item._id}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 80 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchRoles(); }} colors={[theme.colors.primary]} />}
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
              <Text style={{ fontSize: 20, fontWeight: 'bold', color: theme.colors.text }}>{editingRole ? 'Edit Role' : 'Create Role'}</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <X size={24} color={theme.colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={{ color: theme.colors.textSecondary, fontSize: 12, fontWeight: '600', marginBottom: 6 }}>ROLE NAME</Text>
              <TextInput
                value={formData.name}
                onChangeText={text => setFormData({ ...formData, name: text })}
                style={{ backgroundColor: theme.colors.surface, padding: 12, borderRadius: 8, color: theme.colors.text, marginBottom: 16, borderWidth: 1, borderColor: theme.colors.border }}
                placeholder="Role name"
                placeholderTextColor={theme.colors.textSecondary}
              />

              <Text style={{ color: theme.colors.textSecondary, fontSize: 12, fontWeight: '600', marginBottom: 6 }}>ROLE CODE</Text>
              <TextInput
                value={formData.code}
                onChangeText={text => setFormData({ ...formData, code: text.toUpperCase().replace(/\s+/g, '_') })}
                style={{ backgroundColor: theme.colors.surface, padding: 12, borderRadius: 8, color: theme.colors.text, marginBottom: 16, borderWidth: 1, borderColor: theme.colors.border }}
                placeholder="ROLE_CODE"
                placeholderTextColor={theme.colors.textSecondary}
                editable={!editingRole}
                autoCapitalize="characters"
              />

              <Text style={{ color: theme.colors.textSecondary, fontSize: 12, fontWeight: '600', marginBottom: 12 }}>PERMISSIONS</Text>
              {MODULES.map(module => (
                <View key={module} style={{ backgroundColor: theme.colors.surface, padding: 12, borderRadius: 8, marginBottom: 8, borderWidth: 1, borderColor: theme.colors.border }}>
                  <Text style={{ color: theme.colors.text, fontWeight: '600', marginBottom: 8, textTransform: 'capitalize' }}>{module}</Text>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
                    {(['view', 'create', 'edit', 'delete'] as const).map(action => (
                      <TouchableOpacity
                        key={action}
                        onPress={() => togglePermission(module, action)}
                        style={{ alignItems: 'center' }}
                      >
                        <View style={{ width: 24, height: 24, borderRadius: 4, borderWidth: 2, borderColor: formData.permissions[module]?.[action] ? theme.colors.primary : theme.colors.border, backgroundColor: formData.permissions[module]?.[action] ? theme.colors.primary : 'transparent', marginBottom: 4 }} />
                        <Text style={{ color: theme.colors.textSecondary, fontSize: 10, textTransform: 'capitalize' }}>{action}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              ))}

              <TouchableOpacity onPress={handleSubmit} style={{ backgroundColor: theme.colors.primary, padding: 16, borderRadius: 8, alignItems: 'center', marginTop: 20 }}>
                <Text style={{ color: '#FFF', fontSize: 16, fontWeight: 'bold' }}>{editingRole ? 'Update Role' : 'Create Role'}</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}
