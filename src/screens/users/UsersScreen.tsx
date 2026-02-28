import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, TextInput, ActivityIndicator, RefreshControl, Modal, ScrollView, Alert } from 'react-native';
import { Search, Plus, Edit2, Trash2, X, Eye, EyeOff, ChevronLeft, ChevronRight } from 'lucide-react-native';
import { useTheme } from '../../context/ThemeContext';
import { userService } from '../../services/userService';
import { roleService } from '../../services/roleService';
import { User, Role } from '../../types';
import Toast from 'react-native-toast-message';

export default function UsersScreen() {
  const { theme } = useTheme();
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    roles: [] as string[],
    isActive: true,
  });

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
    try {
      const payload: any = {
        name: formData.name,
        email: formData.email,
        roles: formData.roles,
        isActive: formData.isActive,
      };
      if (formData.password) payload.password = formData.password;

      if (editingUser) {
        await userService.update(editingUser._id, payload);
        Toast.show({ type: 'success', text1: 'User updated successfully' });
      } else {
        await userService.create(payload);
        Toast.show({ type: 'success', text1: 'User created successfully' });
      }
      setModalVisible(false);
      fetchUsers();
    } catch (error: any) {
      Toast.show({ type: 'error', text1: error.response?.data?.message || 'Operation failed' });
    }
  };

  const handleDelete = (id: string) => {
    Alert.alert('Delete User', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await userService.delete(id);
            Toast.show({ type: 'success', text1: 'User deleted' });
            fetchUsers();
          } catch (error) {
            Toast.show({ type: 'error', text1: 'Failed to delete user' });
          }
        },
      },
    ]);
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

  const renderUser = ({ item }: { item: User }) => (
    <View style={{ backgroundColor: theme.colors.surface, padding: 16, marginBottom: 12, borderRadius: 12, borderWidth: 1, borderColor: theme.colors.border }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
        <View style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: theme.colors.primary, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ color: '#FFF', fontSize: 20, fontWeight: 'bold' }}>{item.name.charAt(0)}</Text>
        </View>
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={{ color: theme.colors.text, fontSize: 16, fontWeight: '600' }}>{item.name}</Text>
          <Text style={{ color: theme.colors.textSecondary, fontSize: 14 }}>{item.email}</Text>
        </View>
      </View>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 12 }}>
        {item.roles.map(role => (
          <View key={role._id} style={{ backgroundColor: theme.colors.primary + '20', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12, marginRight: 6, marginBottom: 6 }}>
            <Text style={{ color: theme.colors.primary, fontSize: 12, fontWeight: '600' }}>{role.name}</Text>
          </View>
        ))}
      </View>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <TouchableOpacity onPress={() => toggleStatus(item)} style={{ backgroundColor: item.isActive ? '#10B98120' : '#EF444420', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16 }}>
          <Text style={{ color: item.isActive ? '#10B981' : '#EF4444', fontSize: 12, fontWeight: '600' }}>{item.isActive ? 'Active' : 'Inactive'}</Text>
        </TouchableOpacity>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <TouchableOpacity onPress={() => handleEdit(item)} style={{ padding: 8, backgroundColor: '#3B82F620', borderRadius: 8 }}>
            <Edit2 size={18} color="#3B82F6" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleDelete(item._id)} style={{ padding: 8, backgroundColor: '#EF444420', borderRadius: 8 }}>
            <Trash2 size={18} color="#EF4444" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <View style={{ padding: 16 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <View>
            <Text style={{ fontSize: 24, fontWeight: 'bold', color: theme.colors.text }}>Users</Text>
            <Text style={{ fontSize: 14, color: theme.colors.textSecondary }}>Manage system users</Text>
          </View>
          <TouchableOpacity onPress={handleCreate} style={{ backgroundColor: theme.colors.primary, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8, flexDirection: 'row', alignItems: 'center' }}>
            <Plus size={20} color="#FFF" />
            <Text style={{ color: '#FFF', marginLeft: 6, fontWeight: '600' }}>Add</Text>
          </TouchableOpacity>
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: theme.colors.surface, borderRadius: 8, paddingHorizontal: 12, marginBottom: 16, borderWidth: 1, borderColor: theme.colors.border }}>
          <Search size={20} color={theme.colors.textSecondary} />
          <TextInput
            placeholder="Search users..."
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
          data={users}
          renderItem={renderUser}
          keyExtractor={item => item._id}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 80 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchUsers(); }} colors={[theme.colors.primary]} />}
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
              {roles.map(role => (
                <TouchableOpacity
                  key={role._id}
                  onPress={() => toggleRole(role._id)}
                  style={{ flexDirection: 'row', alignItems: 'center', padding: 12, backgroundColor: theme.colors.surface, borderRadius: 8, marginBottom: 8, borderWidth: 1, borderColor: formData.roles.includes(role._id) ? theme.colors.primary : theme.colors.border }}
                >
                  <View style={{ width: 20, height: 20, borderRadius: 4, borderWidth: 2, borderColor: formData.roles.includes(role._id) ? theme.colors.primary : theme.colors.border, backgroundColor: formData.roles.includes(role._id) ? theme.colors.primary : 'transparent', marginRight: 12 }} />
                  <Text style={{ color: theme.colors.text, fontWeight: '600' }}>{role.name}</Text>
                </TouchableOpacity>
              ))}

              <TouchableOpacity onPress={handleSubmit} style={{ backgroundColor: theme.colors.primary, padding: 16, borderRadius: 8, alignItems: 'center', marginTop: 20 }}>
                <Text style={{ color: '#FFF', fontSize: 16, fontWeight: 'bold' }}>{editingUser ? 'Update User' : 'Create User'}</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}
