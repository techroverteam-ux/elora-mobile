import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, TextInput, RefreshControl, Modal, ScrollView, Alert, ActivityIndicator, StyleSheet } from 'react-native';
import { Search, Plus, Edit2, Trash2, X, Eye, EyeOff, Download, Users as UsersIcon, UserCheck, Shield, ChevronDown, Upload, FileSpreadsheet, Building2, Info } from 'lucide-react-native';
import { pick, types, isErrorWithCode, errorCodes } from '@react-native-documents/picker';
import { useTheme } from '../../context/ThemeContext';
import { userService } from '../../services/userService';
import { roleService } from '../../services/roleService';
import { fileService } from '../../services/fileService';
import { modernDownloadService } from '../../services/modernDownloadService';
import DownloadButton from '../../components/DownloadButton';
import { User, Role } from '../../types';
import Toast from 'react-native-toast-message';
import PageSkeleton from '../../components/PageSkeleton';
import { Card, StatusBadge, Button, Chip, Avatar, ScreenHeader, SearchBar, Pagination, EmptyState, BottomSheet, ConfirmDialog, FormSection, TextField, tone, alpha } from '../../components/ui';

type PickedFile = { uri: string; name: string; type: string };

export default function UsersScreen({ navigation }: { navigation?: { navigate: (screen: string, params?: any) => void } } = {}) {
  const { theme } = useTheme();
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [modalVisible, setModalVisible] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    roles: [] as string[],
    isActive: true,
  });

  // Bulk Excel upload of users (matches elora-web's POST /users/upload flow)
  const [bulkUploadModalVisible, setBulkUploadModalVisible] = useState(false);
  const [bulkUploadFiles, setBulkUploadFiles] = useState<PickedFile[]>([]);
  const [isBulkUploading, setIsBulkUploading] = useState(false);
  const [isDownloadingTemplate, setIsDownloadingTemplate] = useState(false);
  const [uploadStats, setUploadStats] = useState<any>(null);

  // Bulk-assign stores to a user via Excel (matches web's POST /users/:id/bulk-assign-stores)
  const [bulkAssignModalVisible, setBulkAssignModalVisible] = useState(false);
  const [bulkAssignTarget, setBulkAssignTarget] = useState<User | null>(null);
  const [bulkAssignFiles, setBulkAssignFiles] = useState<PickedFile[]>([]);
  const [isBulkAssigning, setIsBulkAssigning] = useState(false);
  const [bulkAssignStats, setBulkAssignStats] = useState<any>(null);

  useEffect(() => {
    fetchRoles();
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [page, searchTerm]);

  const fetchRoles = async () => {
    try {
      const data = await roleService.getAll({ limit: 100 });
      setRoles(data.roles || []);
    } catch (error) {
      console.error('Failed to fetch roles', error);
    }
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await userService.getAll({ page, limit: 10, search: searchTerm });
      setUsers(data.users);
      setTotalPages(data.pagination.pages);
    } catch (error) {
      Toast.show({ type: 'error', text1: 'Failed to load users' });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleExport = async () => {
    Toast.show({ 
      type: 'info', 
      text1: 'Export Feature', 
      text2: 'Please use web portal for downloads' 
    });
  };

  const handleCreate = () => {
    setEditingUser(null);
    setFormData({ name: '', email: '', password: '', roles: [], isActive: true });
    setModalVisible(true);
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      password: '',
      roles: user.roles.map(r => r._id),
      isActive: user.isActive,
    });
    setModalVisible(true);
  };

  const handleSubmit = async () => {
    // Validation
    if (!formData.name.trim()) {
      Toast.show({ type: 'error', text1: 'Name is required' });
      return;
    }
    if (!formData.email.trim()) {
      Toast.show({ type: 'error', text1: 'Email is required' });
      return;
    }
    if (!editingUser && !formData.password.trim()) {
      Toast.show({ type: 'error', text1: 'Password is required for new users' });
      return;
    }
    if (formData.roles.length === 0) {
      Toast.show({ type: 'error', text1: 'At least one role must be selected' });
      return;
    }

    try {
      const payload: any = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        roles: formData.roles,
        isActive: formData.isActive,
      };
      if (formData.password.trim()) payload.password = formData.password.trim();

      console.log('Creating/updating user with payload:', payload);

      if (editingUser) {
        await userService.update(editingUser._id, payload);
        Toast.show({ type: 'success', text1: 'User updated successfully' });
      } else {
        const result = await userService.create(payload);
        console.log('User creation result:', result);
        Toast.show({ type: 'success', text1: 'User created successfully' });
      }
      setModalVisible(false);
      fetchUsers();
    } catch (error: any) {
      console.error('User creation/update error:', error);
      console.error('Error response:', error?.response);
      console.error('Error message:', error?.message);
      
      let errorMessage = 'Operation failed';
      if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error?.message) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      } else {
        errorMessage = 'Network error or server unavailable';
      }
      
      Toast.show({ type: 'error', text1: 'Error', text2: errorMessage });
    }
  };

  const handleDelete = (user: User) => {
    setUserToDelete(user);
    setDeleteModalVisible(true);
  };

  const confirmDelete = async () => {
    if (!userToDelete) return;
    
    try {
      await userService.delete(userToDelete._id);
      Toast.show({ type: 'success', text1: 'User deleted successfully' });
      setDeleteModalVisible(false);
      setUserToDelete(null);
      fetchUsers();
    } catch (error) {
      Toast.show({ type: 'error', text1: 'Failed to delete user' });
    }
  };

  const toggleStatus = async (user: User) => {
    try {
      await userService.toggleStatus(user._id, !user.isActive);
      Toast.show({ type: 'success', text1: `User ${!user.isActive ? 'activated' : 'deactivated'}` });
      fetchUsers();
    } catch (error) {
      Toast.show({ type: 'error', text1: 'Failed to update status' });
    }
  };

  const toggleRole = (roleId: string) => {
    setFormData(prev => ({
      ...prev,
      roles: prev.roles.includes(roleId)
        ? prev.roles.filter(id => id !== roleId)
        : [...prev.roles, roleId],
    }));
  };

  // Pick one or more .xlsx/.xls files from the device. Returns [] (silently) if the
  // user cancels the picker.
  const pickExcelFiles = async (): Promise<PickedFile[]> => {
    try {
      const results = await pick({ type: [types.xlsx, types.xls], allowMultiSelection: true });
      return results.map(r => ({
        uri: r.uri,
        name: r.name || 'upload.xlsx',
        type: r.type || 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      }));
    } catch (error) {
      if (isErrorWithCode(error) && error.code === errorCodes.OPERATION_CANCELED) {
        return [];
      }
      Toast.show({ type: 'error', text1: 'Failed to pick file' });
      return [];
    }
  };

  const openBulkUploadModal = () => {
    setBulkUploadFiles([]);
    setUploadStats(null);
    setBulkUploadModalVisible(true);
  };

  const handleDownloadTemplate = async () => {
    setIsDownloadingTemplate(true);
    try {
      const blob = await userService.getTemplate();
      await modernDownloadService.downloadFile({
        blob,
        filename: 'Users_Upload_Template.xlsx',
      });
    } catch (error) {
      Toast.show({ type: 'error', text1: 'Failed to download template' });
    } finally {
      setIsDownloadingTemplate(false);
    }
  };

  const handleAddBulkUploadFiles = async () => {
    const picked = await pickExcelFiles();
    if (picked.length > 0) {
      setBulkUploadFiles(prev => [...prev, ...picked]);
    }
  };

  const removeBulkUploadFile = (index: number) => {
    setBulkUploadFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleBulkUpload = async () => {
    if (bulkUploadFiles.length === 0) return;
    setIsBulkUploading(true);
    try {
      const data = await userService.uploadBulk(bulkUploadFiles);
      setUploadStats(data);
      if (data?.errorCount > 0) {
        Toast.show({ type: 'error', text1: `Upload rejected: ${data.errorCount} errors found` });
      } else {
        Toast.show({ type: 'success', text1: `${data?.successCount ?? 0} users uploaded successfully!` });
        setBulkUploadFiles([]);
        fetchUsers();
      }
    } catch (error: any) {
      Toast.show({ type: 'error', text1: 'Upload failed', text2: error?.response?.data?.message || 'Please try again' });
    } finally {
      setIsBulkUploading(false);
    }
  };

  const openBulkAssignModal = (user: User) => {
    setBulkAssignTarget(user);
    setBulkAssignFiles([]);
    setBulkAssignStats(null);
    setBulkAssignModalVisible(true);
  };

  const handleAddBulkAssignFiles = async () => {
    const picked = await pickExcelFiles();
    if (picked.length > 0) {
      setBulkAssignFiles(prev => [...prev, ...picked]);
    }
  };

  const removeBulkAssignFile = (index: number) => {
    setBulkAssignFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleBulkAssign = async () => {
    if (!bulkAssignTarget || bulkAssignFiles.length === 0) return;
    setIsBulkAssigning(true);
    try {
      const data = await userService.bulkAssignStores(bulkAssignTarget._id, bulkAssignFiles);
      setBulkAssignStats(data);
      Toast.show({ type: 'success', text1: `${data?.successCount ?? 0} stores assigned to ${bulkAssignTarget.name}` });
      setBulkAssignFiles([]);
    } catch (error: any) {
      Toast.show({ type: 'error', text1: 'Assignment failed', text2: error?.response?.data?.message || 'Please try again' });
    } finally {
      setIsBulkAssigning(false);
    }
  };

  // UI helpers -------------------------------------------------------------
  const [isExportingUsers, setIsExportingUsers] = useState(false);
  const handleExportUsers = async () => {
    setIsExportingUsers(true);
    try {
      const blob = await userService.export({ search: searchTerm });
      await modernDownloadService.downloadExcel({
        blob,
        filename: `Users_Export_${new Date().toISOString().split('T')[0]}`
      });
    } catch (error) {
      Toast.show({ type: 'error', text1: 'Export failed' });
    } finally {
      setIsExportingUsers(false);
    }
  };

  const roleTint = (code?: string, name?: string) => {
    const k = String(code || name || '').toUpperCase();
    if (k.includes('ADMIN')) return tone.danger;
    if (k.includes('RECCE')) return tone.info;
    if (k.includes('INSTALL')) return tone.success;
    return tone.violet;
  };

  const FileDrop = ({ files, onAdd, onRemove }: { files: PickedFile[]; onAdd: () => void; onRemove: (i: number) => void }) => (
    <View style={{ gap: 8 }}>
      <TouchableOpacity
        onPress={onAdd}
        activeOpacity={0.8}
        style={{ borderWidth: 2, borderStyle: 'dashed', borderColor: theme.colors.border, borderRadius: 16, paddingVertical: 24, alignItems: 'center', gap: 6, backgroundColor: theme.colors.surface }}
      >
        <View style={{ width: 48, height: 48, borderRadius: 14, backgroundColor: alpha(tone.success, 0.12), alignItems: 'center', justifyContent: 'center' }}>
          <FileSpreadsheet size={24} color={tone.success} />
        </View>
        <Text style={{ color: theme.colors.text, fontSize: 14, fontWeight: '800' }}>Choose Excel file(s)</Text>
        <Text style={{ color: theme.colors.textSecondary, fontSize: 12 }}>.xlsx or .xls</Text>
      </TouchableOpacity>
      {files.map((file, i) => (
        <View key={i} style={{ flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: theme.colors.surface, padding: 10, borderRadius: 12, borderWidth: 1, borderColor: theme.colors.border }}>
          <FileSpreadsheet size={18} color={tone.success} />
          <Text style={{ flex: 1, color: theme.colors.text, fontSize: 13, fontWeight: '600' }} numberOfLines={1}>{file.name}</Text>
          <TouchableOpacity onPress={() => onRemove(i)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <X size={16} color={tone.danger} />
          </TouchableOpacity>
        </View>
      ))}
    </View>
  );

  const ResultPanel = ({ ok, big, caption, errors }: { ok: boolean; big: string; caption: string; errors?: any[] }) => (
    <View style={{ gap: 12 }}>
      <View style={{ padding: 18, borderRadius: 16, alignItems: 'center', backgroundColor: alpha(ok ? tone.success : tone.danger, 0.1) }}>
        <Text style={{ fontSize: 28, fontWeight: '900', color: ok ? tone.success : tone.danger }}>{big}</Text>
        <Text style={{ color: theme.colors.textSecondary, fontSize: 12, marginTop: 4, textAlign: 'center' }}>{caption}</Text>
      </View>
      {errors && errors.length > 0 && (
        <View style={{ gap: 6, padding: 12, borderRadius: 12, backgroundColor: theme.colors.surfaceSecondary }}>
          <Text style={{ color: theme.colors.textSecondary, fontSize: 10, fontWeight: '900', letterSpacing: 0.5 }}>ERRORS</Text>
          {errors.slice(0, 20).map((e: any, i: number) => (
            <Text key={i} style={{ color: theme.colors.text, fontSize: 12 }}>• {e.error}{e.row ? ` (Row ${e.row})` : ''}</Text>
          ))}
        </View>
      )}
    </View>
  );

  const renderUser = ({ item }: { item: User }) => (
    <Card onPress={() => navigation?.navigate?.('UserDetail', { userId: item._id })} style={{ marginBottom: 10, opacity: item.isActive ? 1 : 0.85 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <Avatar name={item.name} size={44} color={roleTint(item.roles?.[0]?.code, item.roles?.[0]?.name)} />
        <View style={{ flex: 1 }}>
          <Text style={{ color: theme.colors.text, fontSize: 16, fontWeight: '800' }} numberOfLines={1}>{item.name}</Text>
          <Text style={{ color: theme.colors.textSecondary, fontSize: 12, marginTop: 2 }} numberOfLines={1}>{item.email}</Text>
        </View>
        <StatusBadge label={item.isActive ? 'Active' : 'Inactive'} color={item.isActive ? tone.success : tone.danger} size="sm" />
      </View>

      {item.roles?.length > 0 && (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 12 }}>
          {item.roles.map(role => (
            <View key={role._id} style={{ flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 9, paddingVertical: 4, borderRadius: 999, backgroundColor: alpha(roleTint(role.code, role.name), 0.12) }}>
              <Shield size={11} color={roleTint(role.code, role.name)} />
              <Text style={{ color: roleTint(role.code, role.name), fontSize: 11, fontWeight: '800' }}>{role.name}</Text>
            </View>
          ))}
        </View>
      )}

      <View style={{ height: StyleSheet.hairlineWidth, backgroundColor: theme.colors.border, marginVertical: 12 }} />
      <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
        <Button label="Details" variant="soft" color={tone.info} size="sm" icon={(col) => <Eye size={14} color={col} />} onPress={() => navigation?.navigate?.('UserDetail', { userId: item._id })} />
        <Button label="Assign stores" variant="soft" color={tone.violet} size="sm" icon={(col) => <Building2 size={14} color={col} />} onPress={() => openBulkAssignModal(item)} />
        <View style={{ flex: 1 }} />
        <Button
          variant="soft"
          color={item.isActive ? tone.warning : tone.success}
          size="sm"
          icon={(col) => <UserCheck size={15} color={col} />}
          onPress={() => toggleStatus(item)}
        />
        <Button variant="soft" color={theme.colors.textSecondary} size="sm" icon={(col) => <Edit2 size={15} color={col} />} onPress={() => handleEdit(item)} />
        <Button variant="soft" color={tone.danger} size="sm" icon={(col) => <Trash2 size={15} color={col} />} onPress={() => handleDelete(item)} />
      </View>
    </Card>
  );

  const selectedRoleNames = roles.filter(r => formData.roles.includes(r._id)).map(r => r.name);

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <View style={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 6 }}>
        <ScreenHeader
          title="Users"
          subtitle="People, roles and access"
          count={users.length}
          actions={
            <>
              <Button variant="outline" loading={isExportingUsers} disabled={isExportingUsers} icon={(col) => <Download size={18} color={col} />} onPress={handleExportUsers} />
              <Button variant="outline" icon={(col) => <Upload size={18} color={col} />} onPress={openBulkUploadModal} />
              <Button label="Add" variant="primary" icon={(col) => <Plus size={18} color={col} strokeWidth={2.5} />} onPress={handleCreate} />
            </>
          }
        />
        <SearchBar value={searchTerm} onChangeText={setSearchTerm} placeholder="Search name or email…" />
      </View>

      {loading ? (
        <PageSkeleton type="list" />
      ) : (
        <FlatList
          data={users}
          renderItem={renderUser}
          keyExtractor={item => item._id}
          contentContainerStyle={{ padding: 16, paddingTop: 10, paddingBottom: 80 }}
          keyboardShouldPersistTaps="handled"
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchUsers(); }} colors={[theme.colors.primary]} tintColor={theme.colors.primary} />}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <EmptyState
              title={searchTerm ? 'No users found' : 'No users yet'}
              message={searchTerm ? 'Try adjusting your search terms.' : 'Add your first user to get started.'}
              icon={<UsersIcon size={28} color={theme.colors.textTertiary} />}
              action={!searchTerm ? <Button label="Add user" variant="primary" icon={(col) => <Plus size={16} color={col} />} onPress={handleCreate} /> : undefined}
            />
          }
          ListFooterComponent={
            users.length > 0 ? (
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

      {/* ---------- Create / edit user ---------- */}
      <BottomSheet
        visible={modalVisible}
        onClose={() => { setModalVisible(false); setShowRoleDropdown(false); }}
        title={editingUser ? 'Edit user' : 'Create user'}
        subtitle={editingUser ? editingUser.email : 'Name, email, password and at least one role'}
        icon={<UsersIcon size={18} color={theme.colors.text} />}
        footer={
          <>
            <Button label="Cancel" variant="outline" size="lg" flex onPress={() => { setModalVisible(false); setShowRoleDropdown(false); }} />
            <Button label={editingUser ? 'Update user' : 'Create user'} variant="primary" size="lg" flex onPress={handleSubmit} />
          </>
        }
      >
        <FormSection step={1} title="Account">
          <TextField label="Full name" required value={formData.name} onChangeText={text => setFormData({ ...formData, name: text })} placeholder="Full name" />
          <TextField
            label="Email"
            required
            value={formData.email}
            onChangeText={text => setFormData({ ...formData, email: text })}
            placeholder="email@example.com"
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <View>
            <TextField
              label="Password"
              required={!editingUser}
              hint={editingUser ? 'leave blank to keep' : undefined}
              value={formData.password}
              onChangeText={text => setFormData({ ...formData, password: text })}
              placeholder={editingUser ? 'Leave blank to keep current' : 'Enter password'}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              style={{ paddingRight: 36 }}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: 12, bottom: 12 }} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              {showPassword ? <EyeOff size={20} color={theme.colors.textSecondary} /> : <Eye size={20} color={theme.colors.textSecondary} />}
            </TouchableOpacity>
          </View>
        </FormSection>

        <FormSection
          step={2}
          title="Roles"
          description="Pick one or more"
          right={<StatusBadge label={`${formData.roles.length} selected`} color={formData.roles.length ? tone.success : tone.neutral} size="sm" />}
        >
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {roles.map(role => (
              <Chip
                key={role._id}
                label={role.name}
                color={roleTint(role.code, role.name)}
                active={formData.roles.includes(role._id)}
                onPress={() => toggleRole(role._id)}
              />
            ))}
          </View>
          {roles.length === 0 && <Text style={{ color: theme.colors.textSecondary, fontSize: 12 }}>No roles found. Create roles first.</Text>}
          {selectedRoleNames.length > 0 && (
            <Text style={{ color: theme.colors.textSecondary, fontSize: 12 }}>Selected: <Text style={{ color: theme.colors.text, fontWeight: '700' }}>{selectedRoleNames.join(', ')}</Text></Text>
          )}
        </FormSection>
      </BottomSheet>

      {/* ---------- Delete ---------- */}
      <ConfirmDialog
        visible={deleteModalVisible}
        title="Delete user?"
        message={`${userToDelete?.name || 'This user'} will be permanently removed from the system. This can't be undone.`}
        icon={<Trash2 size={28} color={tone.danger} />}
        confirmLabel="Delete"
        onConfirm={confirmDelete}
        onCancel={() => {
          setDeleteModalVisible(false);
          setUserToDelete(null);
        }}
      />

      {/* ---------- Bulk upload users ---------- */}
      <BottomSheet
        visible={bulkUploadModalVisible}
        onClose={() => setBulkUploadModalVisible(false)}
        title="Bulk upload users"
        subtitle="Download the template, fill it in, then upload"
        icon={<Upload size={18} color={theme.colors.text} />}
        footer={uploadStats ? (
          <Button label="Close" variant="outline" size="lg" flex onPress={() => { setBulkUploadModalVisible(false); setUploadStats(null); }} />
        ) : (
          <>
            <Button label="Template" variant="soft" color={tone.success} size="lg" flex loading={isDownloadingTemplate} icon={(col) => <Download size={16} color={col} />} onPress={handleDownloadTemplate} />
            <Button label="Upload" variant="primary" size="lg" flex loading={isBulkUploading} disabled={isBulkUploading || bulkUploadFiles.length === 0} onPress={handleBulkUpload} />
          </>
        )}
      >
        {uploadStats ? (
          <ResultPanel
            ok={uploadStats.errorCount === 0}
            big={uploadStats.errorCount === 0 ? 'Upload successful' : 'Upload rejected'}
            caption={`Processed ${uploadStats.totalProcessed ?? 0} · Valid ${uploadStats.successCount ?? 0} · Errors ${uploadStats.errorCount ?? 0}${uploadStats.errorCount > 0 ? '\nFix all errors and re-upload the file.' : ''}`}
            errors={uploadStats.errors}
          />
        ) : (
          <FileDrop files={bulkUploadFiles} onAdd={handleAddBulkUploadFiles} onRemove={removeBulkUploadFile} />
        )}
      </BottomSheet>

      {/* ---------- Bulk assign stores to a user ---------- */}
      <BottomSheet
        visible={bulkAssignModalVisible}
        onClose={() => setBulkAssignModalVisible(false)}
        title="Assign stores"
        subtitle={bulkAssignTarget ? `to ${bulkAssignTarget.name}` : undefined}
        icon={<Building2 size={18} color={theme.colors.text} />}
        footer={bulkAssignStats ? (
          <Button label="Close" variant="outline" size="lg" flex onPress={() => { setBulkAssignModalVisible(false); setBulkAssignStats(null); }} />
        ) : (
          <>
            <Button label="Cancel" variant="outline" size="lg" flex onPress={() => setBulkAssignModalVisible(false)} />
            <Button label="Assign stores" variant="primary" size="lg" flex loading={isBulkAssigning} disabled={isBulkAssigning || bulkAssignFiles.length === 0} onPress={handleBulkAssign} />
          </>
        )}
      >
        {bulkAssignStats ? (
          <ResultPanel
            ok={(bulkAssignStats.errors?.length || 0) === 0}
            big={`${bulkAssignStats.successCount ?? 0} / ${bulkAssignStats.totalProcessed ?? 0}`}
            caption="stores assigned"
            errors={bulkAssignStats.errors}
          />
        ) : (
          <>
            <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 8, backgroundColor: alpha(tone.info, 0.1), padding: 12, borderRadius: 12 }}>
              <Info size={15} color={tone.info} style={{ marginTop: 1 }} />
              <Text style={{ flex: 1, color: theme.colors.text, fontSize: 12, lineHeight: 17 }}>
                Upload an Excel file listing store/dealer codes to assign to this installer or recce user.
              </Text>
            </View>
            <FileDrop files={bulkAssignFiles} onAdd={handleAddBulkAssignFiles} onRemove={removeBulkAssignFile} />
          </>
        )}
      </BottomSheet>
    </View>
  );
}
