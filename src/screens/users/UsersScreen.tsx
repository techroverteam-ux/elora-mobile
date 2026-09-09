import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, TextInput, RefreshControl, Modal, ScrollView, Alert, ActivityIndicator } from 'react-native';
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

  const renderUser = ({ item }: { item: User }) => (
    <View style={{ backgroundColor: theme.colors.surface, padding: 16, marginBottom: 12, borderRadius: 12, borderWidth: 1, borderColor: theme.colors.border }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
          <View style={{ width: 40, height: 40, borderRadius: 8, backgroundColor: theme.colors.primary, alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
            <Text style={{ color: '#FFF', fontSize: 16, fontWeight: '600' }}>{item.name.charAt(0)}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ color: theme.colors.text, fontSize: 16, fontWeight: '600', marginBottom: 4 }}>
              {item.name}
            </Text>
            <Text style={{ color: theme.colors.textSecondary, fontSize: 12 }}>
              {item.email}
            </Text>
          </View>
        </View>
        <View style={{ backgroundColor: item.isActive ? '#10B98120' : '#EF444420', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 }}>
          <Text style={{ color: item.isActive ? '#10B981' : '#EF4444', fontSize: 10, fontWeight: '600' }}>
            {item.isActive ? 'Active' : 'Inactive'}
          </Text>
        </View>
      </View>
      
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 12, gap: 6 }}>
        {item.roles.map(role => (
          <View key={role._id} style={{ backgroundColor: theme.colors.primary + '20', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12, flexDirection: 'row', alignItems: 'center' }}>
            <Shield size={10} color={theme.colors.primary} />
            <Text style={{ color: theme.colors.primary, fontSize: 10, fontWeight: '600', marginLeft: 4 }}>{role.name}</Text>
          </View>
        ))}
      </View>
      
      <View style={{ flexDirection: 'row', gap: 8 }}>
        <TouchableOpacity onPress={() => navigation?.navigate?.('UserDetail', { userId: item._id })} style={{ backgroundColor: theme.colors.primary + '20', padding: 10, borderRadius: 8 }}>
          <Eye size={16} color={theme.colors.primary} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => toggleStatus(item)} style={{ backgroundColor: '#3B82F620', padding: 10, borderRadius: 8 }}>
          <UserCheck size={16} color="#3B82F6" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => openBulkAssignModal(item)} style={{ backgroundColor: '#8B5CF620', padding: 10, borderRadius: 8 }}>
          <Building2 size={16} color="#8B5CF6" />
        </TouchableOpacity>
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
            <Text style={{ fontSize: 24, fontWeight: 'bold', color: theme.colors.text }}>User Management</Text>
            <Text style={{ fontSize: 14, color: theme.colors.textSecondary }}>Manage system users</Text>
          </View>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <DownloadButton
              onDownload={async () => {
                const params = { search: searchTerm };
                const blob = await userService.export(params);
                return {
                  blob,
                  filename: `Users_Export_${new Date().toISOString().split('T')[0]}.xlsx`
                };
              }}
              title="Export"
              description="Downloading users data..."
              size="medium"
              variant="success"
              disabled={isExporting}
            />
            <TouchableOpacity onPress={openBulkUploadModal} style={{ backgroundColor: '#3B82F6', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, justifyContent: 'center' }}>
              <Upload size={16} color="#FFF" />
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
            placeholder="Search users..."
            placeholderTextColor={theme.colors.textSecondary}
            value={searchTerm}
            onChangeText={setSearchTerm}
          />
        </View>
      </View>

      {loading ? (
        <PageSkeleton type="list" />
      ) : users.length === 0 ? (
        <View style={{ 
          flex: 1, 
          justifyContent: 'center', 
          alignItems: 'center', 
          paddingHorizontal: 32 
        }}>
          <UsersIcon size={64} color={theme.colors.textSecondary} style={{ opacity: 0.5 }} />
          <Text style={{ 
            color: theme.colors.textSecondary, 
            fontSize: 18, 
            fontWeight: '600', 
            marginTop: 16, 
            textAlign: 'center' 
          }}>
            {searchTerm ? 'No users found' : 'No users yet'}
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
              : 'Add your first user to get started'
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
                Add User
              </Text>
            </TouchableOpacity>
          )}
        </View>
      ) : (
        <FlatList
          data={users}
          renderItem={renderUser}
          keyExtractor={item => item._id}
          contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 0 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchUsers(); }} colors={[theme.colors.primary]} />}
          showsVerticalScrollIndicator={false}
        />
      )}

      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}>
          <View style={{ backgroundColor: theme.colors.background, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, maxHeight: '90%' }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <Text style={{ fontSize: 20, fontWeight: 'bold', color: theme.colors.text }}>{editingUser ? 'Edit User' : 'Create User'}</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <X size={24} color={theme.colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={{ color: theme.colors.textSecondary, fontSize: 12, fontWeight: '600', marginBottom: 6 }}>NAME</Text>
              <TextInput
                value={formData.name}
                onChangeText={text => setFormData({ ...formData, name: text })}
                style={{ backgroundColor: theme.colors.surface, padding: 12, borderRadius: 8, color: theme.colors.text, marginBottom: 16, borderWidth: 1, borderColor: theme.colors.border }}
                placeholder="Full name"
                placeholderTextColor={theme.colors.textSecondary}
              />

              <Text style={{ color: theme.colors.textSecondary, fontSize: 12, fontWeight: '600', marginBottom: 6 }}>EMAIL</Text>
              <TextInput
                value={formData.email}
                onChangeText={text => setFormData({ ...formData, email: text })}
                style={{ backgroundColor: theme.colors.surface, padding: 12, borderRadius: 8, color: theme.colors.text, marginBottom: 16, borderWidth: 1, borderColor: theme.colors.border }}
                placeholder="email@example.com"
                placeholderTextColor={theme.colors.textSecondary}
                keyboardType="email-address"
                autoCapitalize="none"
              />

              <Text style={{ color: theme.colors.textSecondary, fontSize: 12, fontWeight: '600', marginBottom: 6 }}>PASSWORD</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: theme.colors.surface, borderRadius: 8, marginBottom: 16, borderWidth: 1, borderColor: theme.colors.border }}>
                <TextInput
                  value={formData.password}
                  onChangeText={text => setFormData({ ...formData, password: text })}
                  style={{ flex: 1, padding: 12, color: theme.colors.text }}
                  placeholder={editingUser ? 'Leave blank to keep current' : 'Enter password'}
                  placeholderTextColor={theme.colors.textSecondary}
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={{ padding: 12 }}>
                  {showPassword ? <EyeOff size={20} color={theme.colors.textSecondary} /> : <Eye size={20} color={theme.colors.textSecondary} />}
                </TouchableOpacity>
              </View>

              <Text style={{ color: theme.colors.textSecondary, fontSize: 12, fontWeight: '600', marginBottom: 8 }}>ROLES</Text>
              <TouchableOpacity
                onPress={() => setShowRoleDropdown(!showRoleDropdown)}
                style={{ backgroundColor: theme.colors.surface, padding: 12, borderRadius: 8, marginBottom: 8, borderWidth: 1, borderColor: theme.colors.border, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}
              >
                <Text style={{ color: formData.roles.length > 0 ? theme.colors.text : theme.colors.textSecondary }}>
                  {formData.roles.length > 0 ? `${formData.roles.length} role(s) selected` : 'Select roles'}
                </Text>
                <ChevronDown size={16} color={theme.colors.textSecondary} />
              </TouchableOpacity>
              
              {showRoleDropdown && (
                <View style={{ backgroundColor: theme.colors.surface, borderRadius: 8, borderWidth: 1, borderColor: theme.colors.border, marginBottom: 16, maxHeight: 200 }}>
                  <ScrollView>
                    {roles.map(role => (
                      <TouchableOpacity
                        key={role._id}
                        onPress={() => toggleRole(role._id)}
                        style={{ flexDirection: 'row', alignItems: 'center', padding: 12, borderBottomWidth: 1, borderBottomColor: theme.colors.border }}
                      >
                        <View style={{ width: 20, height: 20, borderRadius: 4, borderWidth: 2, borderColor: formData.roles.includes(role._id) ? theme.colors.primary : theme.colors.border, backgroundColor: formData.roles.includes(role._id) ? theme.colors.primary : 'transparent', marginRight: 12 }} />
                        <Text style={{ color: theme.colors.text, fontWeight: '600' }}>{role.name}</Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              )}

              <TouchableOpacity onPress={handleSubmit} style={{ backgroundColor: theme.colors.primary, padding: 16, borderRadius: 8, alignItems: 'center', marginTop: 20 }}>
                <Text style={{ color: '#FFF', fontSize: 16, fontWeight: 'bold' }}>{editingUser ? 'Update User' : 'Create User'}</Text>
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
              <Text style={{ fontSize: 20, fontWeight: 'bold', color: theme.colors.text, marginBottom: 8 }}>Delete User</Text>
              <Text style={{ fontSize: 14, color: theme.colors.textSecondary, textAlign: 'center', lineHeight: 20 }}>
                Are you sure you want to delete {userToDelete?.name}? This action cannot be undone and will permanently remove the user from the system.
              </Text>
            </View>
            
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <TouchableOpacity
                onPress={() => {
                  setDeleteModalVisible(false);
                  setUserToDelete(null);
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

      {/* Bulk Excel Upload Modal (matches web's Users bulk-upload flow) */}
      <Modal
        visible={bulkUploadModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setBulkUploadModalVisible(false)}
      >
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}>
          <View style={{ backgroundColor: theme.colors.background, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, maxHeight: '85%' }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <Text style={{ fontSize: 18, fontWeight: 'bold', color: theme.colors.text }}>Bulk Upload Users</Text>
              <TouchableOpacity onPress={() => setBulkUploadModalVisible(false)}>
                <X size={24} color={theme.colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {uploadStats ? (
                <View style={{ gap: 12 }}>
                  <View style={{
                    padding: 16, borderRadius: 12,
                    backgroundColor: uploadStats.errorCount === 0 ? '#10B98120' : '#EF444420',
                  }}>
                    <Text style={{ fontSize: 16, fontWeight: 'bold', color: uploadStats.errorCount === 0 ? '#10B981' : '#EF4444' }}>
                      {uploadStats.errorCount === 0 ? 'Upload Successful!' : 'Upload Rejected'}
                    </Text>
                    <Text style={{ color: theme.colors.textSecondary, fontSize: 12, marginTop: 4 }}>
                      Processed: {uploadStats.totalProcessed ?? 0} | Valid: {uploadStats.successCount ?? 0} | Errors: {uploadStats.errorCount ?? 0}
                    </Text>
                    {uploadStats.errorCount > 0 && (
                      <Text style={{ color: theme.colors.textSecondary, fontSize: 11, marginTop: 6 }}>
                        Fix all errors and re-upload the file.
                      </Text>
                    )}
                  </View>
                  {uploadStats.errors?.length > 0 && (
                    <View style={{ gap: 4 }}>
                      {uploadStats.errors.slice(0, 20).map((e: any, i: number) => (
                        <Text key={i} style={{ color: theme.colors.textSecondary, fontSize: 12 }}>
                          • {e.error}{e.row ? ` (Row ${e.row})` : ''}
                        </Text>
                      ))}
                    </View>
                  )}
                  <TouchableOpacity
                    onPress={() => { setBulkUploadModalVisible(false); setUploadStats(null); }}
                    style={{ backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: theme.colors.border, padding: 14, borderRadius: 8, alignItems: 'center', marginTop: 8 }}
                  >
                    <Text style={{ color: theme.colors.text, fontWeight: '600' }}>Close</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={{ gap: 12 }}>
                  <TouchableOpacity
                    onPress={handleDownloadTemplate}
                    disabled={isDownloadingTemplate}
                    style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: '#10B98120', padding: 14, borderRadius: 8 }}
                  >
                    {isDownloadingTemplate ? <ActivityIndicator size="small" color="#10B981" /> : <Download size={18} color="#10B981" />}
                    <Text style={{ color: '#10B981', fontWeight: '600' }}>Download Template</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={handleAddBulkUploadFiles}
                    style={{ borderWidth: 2, borderStyle: 'dashed', borderColor: theme.colors.border, borderRadius: 8, padding: 20, alignItems: 'center', gap: 8 }}
                  >
                    <FileSpreadsheet size={28} color={theme.colors.textSecondary} />
                    <Text style={{ color: theme.colors.textSecondary, fontSize: 13, fontWeight: '600' }}>Tap to select Excel file(s)</Text>
                  </TouchableOpacity>

                  {bulkUploadFiles.length > 0 && (
                    <View style={{ gap: 8 }}>
                      {bulkUploadFiles.map((file, i) => (
                        <View key={i} style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: theme.colors.surface, padding: 10, borderRadius: 8, borderWidth: 1, borderColor: theme.colors.border }}>
                          <FileSpreadsheet size={16} color={theme.colors.primary} />
                          <Text style={{ flex: 1, marginLeft: 8, color: theme.colors.text, fontSize: 13 }} numberOfLines={1}>{file.name}</Text>
                          <TouchableOpacity onPress={() => removeBulkUploadFile(i)}>
                            <X size={16} color="#EF4444" />
                          </TouchableOpacity>
                        </View>
                      ))}
                    </View>
                  )}

                  <TouchableOpacity
                    onPress={handleBulkUpload}
                    disabled={isBulkUploading || bulkUploadFiles.length === 0}
                    style={{
                      backgroundColor: bulkUploadFiles.length === 0 ? theme.colors.border : theme.colors.primary,
                      padding: 14, borderRadius: 8, alignItems: 'center', flexDirection: 'row', justifyContent: 'center',
                    }}
                  >
                    {isBulkUploading ? <ActivityIndicator size="small" color="#FFF" /> : <Text style={{ color: '#FFF', fontWeight: 'bold' }}>Upload</Text>}
                  </TouchableOpacity>
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Bulk Assign Stores Modal (matches web's per-user "Bulk Assign Stores" Excel flow) */}
      <Modal
        visible={bulkAssignModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setBulkAssignModalVisible(false)}
      >
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}>
          <View style={{ backgroundColor: theme.colors.background, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, maxHeight: '85%' }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
              <Text style={{ fontSize: 18, fontWeight: 'bold', color: theme.colors.text }}>Bulk Assign Stores</Text>
              <TouchableOpacity onPress={() => setBulkAssignModalVisible(false)}>
                <X size={24} color={theme.colors.text} />
              </TouchableOpacity>
            </View>
            <Text style={{ color: theme.colors.textSecondary, fontSize: 13, marginBottom: 16 }}>to {bulkAssignTarget?.name}</Text>

            <ScrollView showsVerticalScrollIndicator={false}>
              {bulkAssignStats ? (
                <View style={{ gap: 12 }}>
                  <View style={{ padding: 16, borderRadius: 12, alignItems: 'center', backgroundColor: (bulkAssignStats.errors?.length || 0) === 0 ? '#10B98120' : '#F59E0B20' }}>
                    <Text style={{ fontSize: 28, fontWeight: 'bold', color: (bulkAssignStats.errors?.length || 0) === 0 ? '#10B981' : '#F59E0B' }}>
                      {bulkAssignStats.successCount ?? 0} / {bulkAssignStats.totalProcessed ?? 0}
                    </Text>
                    <Text style={{ color: theme.colors.textSecondary, fontSize: 12, marginTop: 4 }}>stores assigned</Text>
                  </View>
                  {bulkAssignStats.errors?.length > 0 && (
                    <View style={{ gap: 4 }}>
                      {bulkAssignStats.errors.slice(0, 20).map((e: any, i: number) => (
                        <Text key={i} style={{ color: theme.colors.textSecondary, fontSize: 12 }}>
                          • {e.error}{e.row ? ` (Row ${e.row})` : ''}
                        </Text>
                      ))}
                    </View>
                  )}
                  <TouchableOpacity
                    onPress={() => { setBulkAssignModalVisible(false); setBulkAssignStats(null); }}
                    style={{ backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: theme.colors.border, padding: 14, borderRadius: 8, alignItems: 'center', marginTop: 8 }}
                  >
                    <Text style={{ color: theme.colors.text, fontWeight: '600' }}>Close</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={{ gap: 12 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 8, backgroundColor: '#3B82F620', padding: 10, borderRadius: 8 }}>
                    <Info size={14} color="#3B82F6" style={{ marginTop: 2 }} />
                    <Text style={{ flex: 1, color: theme.colors.textSecondary, fontSize: 12 }}>
                      Upload an Excel file listing store/dealer codes to assign to this installer or recce user.
                    </Text>
                  </View>

                  <TouchableOpacity
                    onPress={handleAddBulkAssignFiles}
                    style={{ borderWidth: 2, borderStyle: 'dashed', borderColor: theme.colors.border, borderRadius: 8, padding: 20, alignItems: 'center', gap: 8 }}
                  >
                    <FileSpreadsheet size={28} color={theme.colors.textSecondary} />
                    <Text style={{ color: theme.colors.textSecondary, fontSize: 13, fontWeight: '600' }}>Tap to select Excel file(s)</Text>
                  </TouchableOpacity>

                  {bulkAssignFiles.length > 0 && (
                    <View style={{ gap: 8 }}>
                      {bulkAssignFiles.map((file, i) => (
                        <View key={i} style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: theme.colors.surface, padding: 10, borderRadius: 8, borderWidth: 1, borderColor: theme.colors.border }}>
                          <FileSpreadsheet size={16} color={theme.colors.primary} />
                          <Text style={{ flex: 1, marginLeft: 8, color: theme.colors.text, fontSize: 13 }} numberOfLines={1}>{file.name}</Text>
                          <TouchableOpacity onPress={() => removeBulkAssignFile(i)}>
                            <X size={16} color="#EF4444" />
                          </TouchableOpacity>
                        </View>
                      ))}
                    </View>
                  )}

                  <TouchableOpacity
                    onPress={handleBulkAssign}
                    disabled={isBulkAssigning || bulkAssignFiles.length === 0}
                    style={{
                      backgroundColor: bulkAssignFiles.length === 0 ? theme.colors.border : theme.colors.primary,
                      padding: 14, borderRadius: 8, alignItems: 'center', flexDirection: 'row', justifyContent: 'center',
                    }}
                  >
                    {isBulkAssigning ? <ActivityIndicator size="small" color="#FFF" /> : <Text style={{ color: '#FFF', fontWeight: 'bold' }}>Assign Stores</Text>}
                  </TouchableOpacity>
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}


