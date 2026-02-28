import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, ActivityIndicator, RefreshControl } from 'react-native';
import { Bell, CheckCircle } from 'lucide-react-native';
import { notificationService } from '../../services/notificationService';
import Toast from 'react-native-toast-message';

export default function NotificationsScreen() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const data = await notificationService.getAll();
      setNotifications(data.notifications || []);
    } catch (error) {
      Toast.show({ type: 'error', text1: 'Failed to load notifications' });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const renderNotification = ({ item }) => (
    <View className={`bg-white p-4 mb-2 border-l-4 ${item.read ? 'border-gray-300' : 'border-blue-500'}`}>
      <View className="flex-row items-start gap-3">
        <Bell size={20} color={item.read ? '#9ca3af' : '#3b82f6'} />
        <View className="flex-1">
          <Text className={`text-sm ${item.read ? 'text-gray-600' : 'text-gray-900 font-semibold'}`}>
            {item.message}
          </Text>
          <Text className="text-xs text-gray-400 mt-1">
            {new Date(item.createdAt).toLocaleString()}
          </Text>
        </View>
        {item.read && <CheckCircle size={16} color="#10b981" />}
      </View>
    </View>
  );

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50">
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      <View className="bg-white px-4 py-3 border-b border-gray-200">
        <Text className="text-2xl font-bold text-gray-900">Notifications</Text>
        <Text className="text-sm text-gray-500">{notifications.length} notifications</Text>
      </View>
      <FlatList
        data={notifications}
        renderItem={renderNotification}
        keyExtractor={(item) => item._id}
        contentContainerStyle={{ padding: 16 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchNotifications(); }} />
        }
        ListEmptyComponent={
          <View className="items-center justify-center py-20">
            <Bell size={48} color="#d1d5db" />
            <Text className="text-gray-400 mt-4">No notifications</Text>
          </View>
        }
      />
    </View>
  );
}
