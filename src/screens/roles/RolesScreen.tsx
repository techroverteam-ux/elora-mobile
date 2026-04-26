import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, TextInput, RefreshControl, Modal, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { Search, Plus, Edit2, Trash2, X, Shield, ChevronLeft, ChevronRight, Download } from 'lucide-react-native';
import { useTheme } from '../../context/ThemeContext';
import { roleService } from '../../services/roleService';
import { fileService } from '../../services/fileService';
import { modernDownloadService } from '../../services/modernDownloadService';
import DownloadButton from '../../components/DownloadButton';
import { Role, PermissionSet } from '../../types';
import Toast from 'react-native-toast-message';
import PageSkeleton from '../../components/PageSkeleton';

const MODULES = ['users', 'roles', 'stores', 'recce', 'installation', 'enquiries', 'reports', 'elements', 'clients'];

export default function RolesScreen() {
  const { theme } = useTheme();
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [modalVisible, setModalVisible] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [roleToDelete, setRoleToDelete] = useState<Role | null>(null);
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

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const params = { search: searchTerm };
      const blob = await roleService.export(params);
      await fileService.downloadFile(blob, `Roles_Export_${Date.now()}.xlsx`);
      Toast.show({ type: 'success', text1: 'Roles exported successfully!' });
    } catch (error) {
      Toast.show({ type: 'error', text1: 'Failed to export roles' });
    } finally {
      setIsExporting(false);
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

  const handleDelete = (role: Role) => {
    if (role.code === 'SUPER_ADMIN') {
      Toast.show({ type: 'error', text1: 'Cannot delete SUPER_ADMIN role' });
      return;
    }
    setRoleToDelete(role);
    setDeleteModalVisible(true);
  };

  const confirmDelete = async () => {
    if (!roleToDelete) return;
    
    try {
      await roleService.delete(roleToDelete._id);
      Toast.show({ type: 'success', text1: 'Role deleted successfully' });
      setDeleteModalVisible(false);
      setRoleToDelete(null);
      fetchRoles();
    } catch (error) {
      Toast.show({ type: 'error', text1: 'Failed to delete role' });
    }
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
          <TouchableOpacity onPress={() => handleDelete(item)} style={{ padding: 8, backgroundColor: '#EF444420', borderRadius: 8 }}>
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
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <DownloadButton
              onDownload={async () => {
                const params = { search: searchTerm };
                const blob = await roleService.export(params);
                return {
                  blob,
                  filename: `Roles_Export_${new Date().toISOString().split('T')[0]}.xlsx`
                };
              }}
              title="Export Roles"
              description="Downloading roles data..."
              size="medium"
              variant="success"
              disabled={isExporting}
            />
            <TouchableOpacity onPress={handleCreate} style={{ backgroundColor: theme.colors.primary, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8, flexDirection: 'row', alignItems: 'center' }}>
              <Plus size={20} color="#FFF" />
              <Text style={{ color: '#FFF', marginLeft: 6, fontWeight: '600' }}>Add</Text>
            </TouchableOpacity>
          </View>
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
        <PageSkeleton type="list" />
      ) : roles.length === 0 ? (
        <View style={{ 
          flex: 1, 
          justifyContent: 'center', 
          alignItems: 'center', 
          paddingHorizontal: 32 
        }}>
          <Shield size={64} color={theme.colors.textSecondary} style={{ opacity: 0.5 }} />
          <Text style={{ 
            color: theme.colors.textSecondary, 
            fontSize: 18, 
            fontWeight: '600', 
            marginTop: 16, 
            textAlign: 'center' 
          }}>
            {searchTerm ? 'No roles found' : 'No roles yet'}
          </Text>
          <Text style={{ 
            color: theme.colors.textSecondary, 
            fontSize: 14, 
            marginTop: 8, 
            textAlign: 'center',
            opacity: 0.8
          }}>
            {searchTerm 
              ? 'Try adjusting your search terms' 
              : 'Add your first role to get started'
            }
          </Text>
          {!searchTerm && (
            <TouchableOpacity 
              onPress={handleCreate}
              style={{ 
                backgroundColor: theme.colors.primary, 
                paddingHorizontal: 24, 
                paddingVertical: 12, 
                borderRadius: 8, 
                marginTop: 20,
                flexDirection: 'row',
                alignItems: 'center',
                gap: 8
              }}
            >
              <Plus size={20} color="#FFF" />
              <Text style={{ color: '#FFF', fontSize: 16, fontWeight: '600' }}>
                Add Role
              </Text>
            </TouchableOpacity>
          )}
        </View>
      ) : (
        <FlatList
          data={roles}
          renderItem={renderRole}
          keyExtractor={item => item._id}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 80 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchRoles(); }} colors={[theme.colors.primary]} />}
          showsVerticalScrollIndicator={false}
          ListFooterComponent={
            totalPages > 1 ? (
              <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 16, gap: 12 }}>
                <TouchableOpacity onPress={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} style={{ padding: 8, backgroundColor: theme.colors.surface, borderRadius: 8, opacity: page === 1 ? 0.5 : 1 }}>
                  <ChevronLeft size={20} color={theme.colors.text} />
                </TouchableOpacity>
                <Text style={{ color: theme.colors.text, fontWeight: '600' }}>Page {page} of {totalPages}</Text>
                <TouchableOpacity onPress={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} style={{ padding: 8, backgroundColor: theme.colors.surface, borderRadius: 8, opacity: page === totalPages ? 0.5 : 1 }}>
                  <ChevronRight size={20} color={theme.colors.text} />
                </TouchableOpacity>
              </View>
            ) : null
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

      {/* Delete Confirmation Modal */}
      <Modal visible={deleteModalVisible} animationType="fade" transparent>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center', padding: 20 }}>
          <View style={{ backgroundColor: theme.colors.background, borderRadius: 16, padding: 24, width: '100%', maxWidth: 400, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 8 }}>
            <View style={{ alignItems: 'center', marginBottom: 20 }}>
              <View style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: '#EF444420', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                <Trash2 size={32} color="#EF4444" />
              </View>
              <Text style={{ fontSize: 20, fontWeight: 'bold', color: theme.colors.text, marginBottom: 8 }}>Delete Role</Text>
              <Text style={{ fontSize: 14, color: theme.colors.textSecondary, textAlign: 'center', lineHeight: 20 }}>
                Are you sure you want to delete the role "{roleToDelete?.name}"? This action cannot be undone and will remove all permissions associated with this role.
              </Text>
            </View>
            
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <TouchableOpacity
                onPress={() => {
                  setDeleteModalVisible(false);
                  setRoleToDelete(null);
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
