import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { LinearGradient } from 'react-native-linear-gradient';
import { Camera, CheckCircle, Clock, MapPin, Calendar, TrendingUp } from 'lucide-react-native';
import { storeService } from '../../services/storeService';
import Toast from 'react-native-toast-message';

export default function RecceUserDashboard({ navigation }: { navigation: any }) {
  const { user } = useAuth();
  const { theme } = useTheme();
  const [stats, setStats] = useState({
    assigned: 0,
    submitted: 0,
    approved: 0,
    pending: 0,
    recentTasks: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecceStats();
  }, []);

  const fetchRecceStats = async () => {
    try {
      const response = await storeService.getAll({
        status: 'RECCE_ASSIGNED,RECCE_SUBMITTED,RECCE_APPROVED,RECCE_REJECTED'
      });
      
      const stores = response.stores || [];
      const assigned = stores.filter(s => s.currentStatus === 'RECCE_ASSIGNED').length;
      const submitted = stores.filter(s => s.currentStatus === 'RECCE_SUBMITTED').length;
      const approved = stores.filter(s => s.currentStatus === 'RECCE_APPROVED').length;
      const pending = assigned;
      
      setStats({
        assigned,
        submitted,
        approved,
        pending,
        recentTasks: stores.slice(0, 5)
      });
    } catch (error) {
      Toast.show({ type: 'error', text1: 'Failed to load stats' });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.colors.background, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      {/* Header */}
      <LinearGradient
        colors={['#3B82F6', '#1D4ED8']}
        style={{ padding: 20, paddingTop: 40, borderBottomLeftRadius: 20, borderBottomRightRadius: 20 }}
      >
        <Text style={{ color: '#FFF', fontSize: 16, opacity: 0.9 }}>Good {getTimeOfDay()},</Text>
        <Text style={{ color: '#FFF', fontSize: 28, fontWeight: 'bold', marginTop: 4 }}>
          {user?.name?.split(' ')[0] || 'User'}!
        </Text>
        <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 14, fontWeight: '600', marginTop: 4 }}>
          RECCE INSPECTOR
        </Text>
      </LinearGradient>

      {/* Stats Cards */}
      <View style={{ padding: 16, marginTop: -30 }}>
        <View style={{ flexDirection: 'row', gap: 12, marginBottom: 20 }}>
          <View style={{ 
            flex: 1, 
            backgroundColor: theme.colors.surface, 
            borderRadius: 16, 
            padding: 16,
            borderWidth: 1,
            borderColor: theme.colors.border
          }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
              <Clock size={20} color="#F59E0B" />
              <Text style={{ color: theme.colors.text, fontSize: 14, fontWeight: '600', marginLeft: 8 }}>
                Pending
              </Text>
            </View>
            <Text style={{ color: theme.colors.text, fontSize: 24, fontWeight: 'bold' }}>
              {stats.pending}
            </Text>
            <Text style={{ color: theme.colors.textSecondary, fontSize: 12 }}>
              Tasks assigned
            </Text>
          </View>

          <View style={{ 
            flex: 1, 
            backgroundColor: theme.colors.surface, 
            borderRadius: 16, 
            padding: 16,
            borderWidth: 1,
            borderColor: theme.colors.border
          }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
              <CheckCircle size={20} color="#10B981" />
              <Text style={{ color: theme.colors.text, fontSize: 14, fontWeight: '600', marginLeft: 8 }}>
                Completed
              </Text>
            </View>
            <Text style={{ color: theme.colors.text, fontSize: 24, fontWeight: 'bold' }}>
              {stats.submitted + stats.approved}
            </Text>
            <Text style={{ color: theme.colors.textSecondary, fontSize: 12 }}>
              This month
            </Text>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={{ marginBottom: 20 }}>
          <Text style={{ color: theme.colors.text, fontSize: 18, fontWeight: 'bold', marginBottom: 12 }}>
            Quick Actions
          </Text>
          <TouchableOpacity
            onPress={() => navigation.navigate('Recce')}
            style={{
              backgroundColor: theme.colors.primary,
              borderRadius: 16,
              padding: 20,
              flexDirection: 'row',
              alignItems: 'center',
              marginBottom: 12
            }}
          >
            <Camera size={24} color="#FFF" />
            <View style={{ marginLeft: 16, flex: 1 }}>
              <Text style={{ color: '#FFF', fontSize: 16, fontWeight: 'bold' }}>
                Start Recce Inspection
              </Text>
              <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 14 }}>
                View and complete assigned tasks
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => navigation.navigate('Reports')}
            style={{
              backgroundColor: theme.colors.surface,
              borderRadius: 16,
              padding: 20,
              flexDirection: 'row',
              alignItems: 'center',
              borderWidth: 1,
              borderColor: theme.colors.border
            }}
          >
            <TrendingUp size={24} color={theme.colors.primary} />
            <View style={{ marginLeft: 16, flex: 1 }}>
              <Text style={{ color: theme.colors.text, fontSize: 16, fontWeight: 'bold' }}>
                My Reports
              </Text>
              <Text style={{ color: theme.colors.textSecondary, fontSize: 14 }}>
                View submission history
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Recent Tasks */}
        <View>
          <Text style={{ color: theme.colors.text, fontSize: 18, fontWeight: 'bold', marginBottom: 12 }}>
            Recent Tasks
          </Text>
          {stats.recentTasks.length > 0 ? (
            stats.recentTasks.map((task: any, index: number) => (
              <TouchableOpacity
                key={index}
                onPress={() => navigation.navigate('RecceDetail', { storeId: task._id })}
                style={{
                  backgroundColor: theme.colors.surface,
                  borderRadius: 12,
                  padding: 16,
                  marginBottom: 12,
                  borderWidth: 1,
                  borderColor: theme.colors.border
                }}
              >
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <Text style={{ color: theme.colors.text, fontSize: 16, fontWeight: 'bold' }}>
                    {task.storeName}
                  </Text>
                  <View style={{ 
                    backgroundColor: getStatusColor(task.currentStatus) + '20', 
                    paddingHorizontal: 8, 
                    paddingVertical: 4, 
                    borderRadius: 8 
                  }}>
                    <Text style={{ 
                      color: getStatusColor(task.currentStatus), 
                      fontSize: 10, 
                      fontWeight: 'bold' 
                    }}>
                      {task.currentStatus?.replace(/_/g, ' ')}
                    </Text>
                  </View>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <MapPin size={12} color={theme.colors.textSecondary} />
                  <Text style={{ color: theme.colors.textSecondary, fontSize: 12, marginLeft: 4 }}>
                    {task.location?.city}, {task.location?.state}
                  </Text>
                </View>
              </TouchableOpacity>
            ))
          ) : (
            <View style={{
              backgroundColor: theme.colors.surface,
              borderRadius: 12,
              padding: 20,
              alignItems: 'center',
              borderWidth: 1,
              borderColor: theme.colors.border
            }}>
              <Camera size={48} color={theme.colors.textSecondary} />
              <Text style={{ color: theme.colors.text, fontSize: 16, fontWeight: 'bold', marginTop: 12 }}>
                No Tasks Assigned
              </Text>
              <Text style={{ color: theme.colors.textSecondary, fontSize: 14, textAlign: 'center', marginTop: 4 }}>
                You don't have any recce tasks assigned yet.
              </Text>
            </View>
          )}
        </View>
      </View>
    </ScrollView>
  );
}

function getTimeOfDay() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Morning';
  if (hour < 17) return 'Afternoon';
  return 'Evening';
}

function getStatusColor(status: string) {
  switch (status) {
    case 'RECCE_ASSIGNED': return '#F59E0B';
    case 'RECCE_SUBMITTED': return '#3B82F6';
    case 'RECCE_APPROVED': return '#10B981';
    case 'RECCE_REJECTED': return '#EF4444';
    default: return '#6B7280';
  }
}