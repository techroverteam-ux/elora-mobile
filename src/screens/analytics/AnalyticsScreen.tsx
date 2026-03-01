import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, RefreshControl } from 'react-native';
import { BarChart3, TrendingUp, Users, Store } from 'lucide-react-native';
import { analyticsService } from '../../services/analyticsService';
import Toast from 'react-native-toast-message';
import PageSkeleton from '../../components/PageSkeleton';

export default function AnalyticsScreen() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const data = await analyticsService.getDashboard();
      setAnalytics(data);
    } catch (error) {
      Toast.show({ type: 'error', text1: 'Failed to load analytics' });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  if (loading) {
    return <PageSkeleton type="dashboard" />;
  }

  return (
    <View className="flex-1 bg-gray-50">
      <View className="bg-white px-4 py-3 border-b border-gray-200">
        <Text className="text-2xl font-bold text-gray-900">Analytics</Text>
        <Text className="text-sm text-gray-500">Performance metrics</Text>
      </View>
      <ScrollView
        contentContainerStyle={{ padding: 16 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchAnalytics(); }} />
        }
      >
        <View className="flex-row flex-wrap gap-3">
          <View className="bg-white p-4 rounded-xl flex-1 min-w-[45%] border border-gray-200">
            <Store size={24} color="#3b82f6" />
            <Text className="text-2xl font-bold text-gray-900 mt-2">{analytics?.totalStores || 0}</Text>
            <Text className="text-sm text-gray-500">Total Stores</Text>
          </View>
          <View className="bg-white p-4 rounded-xl flex-1 min-w-[45%] border border-gray-200">
            <Users size={24} color="#10b981" />
            <Text className="text-2xl font-bold text-gray-900 mt-2">{analytics?.totalUsers || 0}</Text>
            <Text className="text-sm text-gray-500">Total Users</Text>
          </View>
          <View className="bg-white p-4 rounded-xl flex-1 min-w-[45%] border border-gray-200">
            <TrendingUp size={24} color="#f59e0b" />
            <Text className="text-2xl font-bold text-gray-900 mt-2">{analytics?.recceCompleted || 0}</Text>
            <Text className="text-sm text-gray-500">Recce Completed</Text>
          </View>
          <View className="bg-white p-4 rounded-xl flex-1 min-w-[45%] border border-gray-200">
            <BarChart3 size={24} color="#8b5cf6" />
            <Text className="text-2xl font-bold text-gray-900 mt-2">{analytics?.installationCompleted || 0}</Text>
            <Text className="text-sm text-gray-500">Installation Done</Text>
          </View>
        </View>
        {analytics?.statusBreakdown && (
          <View className="bg-white p-4 rounded-xl mt-4 border border-gray-200">
            <Text className="text-lg font-bold text-gray-900 mb-3">Status Breakdown</Text>
            {Object.entries(analytics.statusBreakdown).map(([status, count]) => (
              <View key={status} className="flex-row justify-between py-2 border-b border-gray-100">
                <Text className="text-sm text-gray-600">{status.replace(/_/g, ' ')}</Text>
                <Text className="text-sm font-semibold text-gray-900">{count}</Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}
