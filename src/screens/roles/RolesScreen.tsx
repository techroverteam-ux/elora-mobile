import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, TextInput, RefreshControl, Modal, ScrollView, Alert, ActivityIndicator, StyleSheet } from 'react-native';
import { Search, Plus, Edit2, Trash2, X, Shield, ChevronLeft, ChevronRight, Download } from 'lucide-react-native';
import { useTheme } from '../../context/ThemeContext';
import { roleService } from '../../services/roleService';
import { fileService } from '../../services/fileService';
import { modernDownloadService } from '../../services/modernDownloadService';
import DownloadButton from '../../components/DownloadButton';
import { Role, PermissionSet } from '../../types';
import Toast from 'react-native-toast-message';
import PageSkeleton from '../../components/PageSkeleton';
import { Card, Button, Checkbox, ScreenHeader, SearchBar, Pagination, EmptyState, BottomSheet, ConfirmDialog, TextField, FieldRow, tone, alpha } from '../../components/ui';

const MODULES = ['users', 'roles', 'stores', 'recce', 'installation', 'rfq', 'enquiries', 'reports', 'elements', 'clients'];

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

  // UI helpers -------------------------------------------------------------
  const ACTIONS = ['view', 'create', 'edit', 'delete'] as const;
  const ACTION_COLORS: Record<string, string> = { view: tone.success, create: tone.info, edit: tone.warning, delete: tone.danger };

  const accessLevel = (p?: PermissionSet) => {
    if (!p) return 'none';
    const n = ACTIONS.filter(a => p[a]).length;
    return n === 4 ? 'full' : n === 0 ? 'none' : 'partial';
  };

  // Tap a module name to switch all four actions on (or off if all are on).
  const toggleModuleAll = (module: string) => {
    setFormData(prev => {
      const cur = prev.permissions[module] || { view: false, create: false, edit: false, delete: false };
      const allOn = ACTIONS.every(a => cur[a]);
      return {
        ...prev,
        permissions: {
          ...prev.permissions,
          [module]: { view: !allOn, create: !allOn, edit: !allOn, delete: !allOn },
        },
      };
    });
  };

  const renderRole = ({ item }: { item: Role }) => {
    const perms = item.permissions || ({} as Record<string, PermissionSet>);
    const modules = Object.keys(perms);
    const fullCount = modules.filter(m => accessLevel(perms[m]) === 'full').length;
    const anyCount = modules.filter(m => accessLevel(perms[m]) !== 'none').length;
    const isSuper = item.code === 'SUPER_ADMIN';
    return (
      <Card onPress={() => handleEdit(item)} style={{ marginBottom: 10 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <View style={{ width: 44, height: 44, borderRadius: 13, backgroundColor: alpha(isSuper ? tone.danger : tone.indigo, 0.12), alignItems: 'center', justifyContent: 'center' }}>
            <Shield size={21} color={isSuper ? tone.danger : tone.indigo} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ color: theme.colors.text, fontSize: 16, fontWeight: '800' }} numberOfLines={1}>{item.name}</Text>
            <Text style={{ color: theme.colors.textSecondary, fontSize: 12, fontFamily: 'monospace', marginTop: 2 }}>{item.code}</Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={{ color: theme.colors.text, fontSize: 16, fontWeight: '900' }}>{anyCount}<Text style={{ color: theme.colors.textSecondary, fontSize: 12, fontWeight: '700' }}>/{modules.length || MODULES.length}</Text></Text>
            <Text style={{ color: theme.colors.textSecondary, fontSize: 11 }}>modules</Text>
          </View>
        </View>

        {modules.length > 0 && (
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 12 }}>
            {modules.map(m => {
              const lvl = accessLevel(perms[m]);
              const col = lvl === 'full' ? tone.success : lvl === 'partial' ? tone.warning : theme.colors.textTertiary;
              return (
                <View key={m} style={{ flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 999, backgroundColor: lvl === 'none' ? theme.colors.surfaceSecondary : alpha(col, 0.12) }}>
                  <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: col }} />
                  <Text style={{ color: lvl === 'none' ? theme.colors.textTertiary : theme.colors.text, fontSize: 11, fontWeight: '700', textTransform: 'capitalize' }}>{m}</Text>
                </View>
              );
            })}
          </View>
        )}

        <View style={{ height: StyleSheet.hairlineWidth, backgroundColor: theme.colors.border, marginVertical: 12 }} />
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Text style={{ color: theme.colors.textSecondary, fontSize: 12, flex: 1 }}>{fullCount} with full access</Text>
          <Button label="Edit" variant="soft" color={tone.info} size="sm" icon={(col) => <Edit2 size={14} color={col} />} onPress={() => handleEdit(item)} />
          {!isSuper && (
            <Button variant="soft" color={tone.danger} size="sm" icon={(col) => <Trash2 size={15} color={col} />} onPress={() => handleDelete(item)} />
          )}
        </View>
      </Card>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <View style={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 6 }}>
        <ScreenHeader
          title="Roles"
          subtitle="Who can do what"
          count={roles.length}
          actions={
            <>
              <Button variant="outline" loading={isExporting} disabled={isExporting} icon={(col) => <Download size={18} color={col} />} onPress={handleExport} />
              <Button label="Add" variant="primary" icon={(col) => <Plus size={18} color={col} strokeWidth={2.5} />} onPress={handleCreate} />
            </>
          }
        />
        <SearchBar value={searchTerm} onChangeText={setSearchTerm} placeholder="Search roles…" />
        <View style={{ flexDirection: 'row', gap: 14, paddingTop: 10 }}>
          {[['Full', tone.success], ['Partial', tone.warning], ['None', theme.colors.textTertiary]].map(([l, col]) => (
            <View key={l} style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
              <View style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: col }} />
              <Text style={{ color: theme.colors.textSecondary, fontSize: 11 }}>{l} access</Text>
            </View>
          ))}
        </View>
      </View>

      {loading ? (
        <PageSkeleton type="list" />
      ) : (
        <FlatList
          data={roles}
          renderItem={renderRole}
          keyExtractor={item => item._id}
          contentContainerStyle={{ padding: 16, paddingTop: 10, paddingBottom: 80 }}
          keyboardShouldPersistTaps="handled"
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchRoles(); }} colors={[theme.colors.primary]} tintColor={theme.colors.primary} />}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <EmptyState
              title={searchTerm ? 'No roles found' : 'No roles yet'}
              message={searchTerm ? 'Try adjusting your search terms.' : 'Add your first role to get started.'}
              icon={<Shield size={28} color={theme.colors.textTertiary} />}
              action={!searchTerm ? <Button label="Add role" variant="primary" icon={(col) => <Plus size={16} color={col} />} onPress={handleCreate} /> : undefined}
            />
          }
          ListFooterComponent={
            roles.length > 0 ? (
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
        onClose={() => setModalVisible(false)}
        title={editingRole ? 'Edit role' : 'Create role'}
        subtitle="Tap a module name to toggle all its permissions"
        icon={<Shield size={18} color={theme.colors.text} />}
        footer={
          <>
            <Button label="Cancel" variant="outline" size="lg" flex onPress={() => setModalVisible(false)} />
            <Button label={editingRole ? 'Update role' : 'Create role'} variant="primary" size="lg" flex onPress={handleSubmit} />
          </>
        }
      >
        <FieldRow>
          <TextField
            label="Role name"
            required
            value={formData.name}
            onChangeText={text => setFormData({ ...formData, name: text })}
            placeholder="e.g. Recce Team"
          />
          <TextField
            label="Role code"
            required
            hint={editingRole ? 'locked' : undefined}
            value={formData.code}
            onChangeText={text => setFormData({ ...formData, code: text.toUpperCase().replace(/\s+/g, '_') })}
            placeholder="ROLE_CODE"
            editable={!editingRole}
            autoCapitalize="characters"
          />
        </FieldRow>

        <View style={{ borderWidth: 1, borderColor: theme.colors.border, borderRadius: 16, overflow: 'hidden' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 10, backgroundColor: theme.colors.surfaceSecondary }}>
            <Text style={{ flex: 1, color: theme.colors.textSecondary, fontSize: 11, fontWeight: '800', letterSpacing: 0.5 }}>MODULE</Text>
            {ACTIONS.map(a => (
              <Text key={a} style={{ width: 48, textAlign: 'center', color: ACTION_COLORS[a], fontSize: 11, fontWeight: '900', textTransform: 'capitalize' }}>{a}</Text>
            ))}
          </View>
          {MODULES.map((module, i) => (
            <View key={module} style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 10, borderTopWidth: i === 0 ? 0 : StyleSheet.hairlineWidth, borderTopColor: theme.colors.border, backgroundColor: theme.colors.surface }}>
              <TouchableOpacity onPress={() => toggleModuleAll(module)} style={{ flex: 1 }} hitSlop={{ top: 6, bottom: 6 }}>
                <Text style={{ color: theme.colors.text, fontSize: 14, fontWeight: '700', textTransform: 'capitalize' }}>{module}</Text>
              </TouchableOpacity>
              {ACTIONS.map(action => (
                <View key={action} style={{ width: 48, alignItems: 'center' }}>
                  <Checkbox checked={!!formData.permissions[module]?.[action]} onPress={() => togglePermission(module, action)} />
                </View>
              ))}
            </View>
          ))}
        </View>
      </BottomSheet>

      <ConfirmDialog
        visible={deleteModalVisible}
        title="Delete role?"
        message={`"${roleToDelete?.name || ''}" and all its permissions will be removed. This can't be undone.`}
        icon={<Trash2 size={28} color={tone.danger} />}
        confirmLabel="Delete"
        onConfirm={confirmDelete}
        onCancel={() => {
          setDeleteModalVisible(false);
          setRoleToDelete(null);
        }}
      />
    </View>
  );
}
