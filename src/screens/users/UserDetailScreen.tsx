import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, ActivityIndicator } from 'react-native';
import { Mail, Calendar, LogIn, Shield, Activity, CheckCircle, Clock, TrendingUp, BarChart3, MapPin } from 'lucide-react-native';
import { useTheme } from '../../context/ThemeContext';
import { userService } from '../../services/userService';
import Toast from 'react-native-toast-message';

// Mirrors elora-web's /users/[id] page (GET /users/:id/stats) — a User detail/stats
// screen mobile never had at all.
interface UserStats {
  user: {
    _id: string;
    name: string;
    email: string;
    roles: Array<{ _id: string; name: string; code: string }>;
    isActive: boolean;
    createdAt: string;
    lastLogin?: string;
    loginCount?: number;
  };
  workStats: {
    totalAssigned: number;
    completed: number;
    pending: number;
    inProgress: number;
    rejected: number;
  };
  recceStats?: {
    assigned: number;
    submitted: number;
    approved: number;
    rejected: number;
    pending: number;
  };
  installationStats?: {
    assigned: number;
    submitted: number;
    completed: number;
    pending: number;
  };
  adminStats?: {
    totalAssignments: number;
    usersManaged: number;
    storesManaged: number;
  };
  recentActivity: Array<{
    _id: string;
    storeId: string;
    storeName: string;
    dealerCode: string;
    city: string;
    status: string;
    assignedDate?: string;
    submittedDate?: string;
  }>;
}

export default function UserDetailScreen({ route }: { route: { params: { userId: string } } }) {
  const { theme } = useTheme();
  const { userId } = route.params;
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, [userId]);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const data = await userService.getStats(userId);
      setStats(data);
    } catch (error) {
      Toast.show({ type: 'error', text1: 'Failed to load user details' });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.colors.background }}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  if (!stats) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.colors.background, padding: 24 }}>
        <Text style={{ color: theme.colors.textSecondary }}>Could not load user details</Text>
      </View>
    );
  }

  const isRecceUser = stats.user.roles.some(r => r.code === 'RECCE');
  const isInstallUser = stats.user.roles.some(r => r.code === 'INSTALLATION');
  const isAdminUser = stats.user.roles.some(r => r.code === 'SUPER_ADMIN' || r.code === 'ADMIN');

  const cardStyle = { backgroundColor: theme.colors.surface, padding: 16, borderRadius: 12, borderWidth: 1, borderColor: theme.colors.border };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: theme.colors.background }} contentContainerStyle={{ padding: 16, gap: 16 }}>
      {/* User Info Card */}
      <View style={cardStyle}>
        <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 16 }}>
          <View style={{ width: 56, height: 56, borderRadius: 28, backgroundColor: theme.colors.primary, alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ color: '#FFF', fontSize: 22, fontWeight: 'bold' }}>{stats.user.name.charAt(0)}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <Text style={{ fontSize: 18, fontWeight: 'bold', color: theme.colors.text, flex: 1 }}>{stats.user.name}</Text>
              <View style={{ backgroundColor: stats.user.isActive ? '#10B98120' : '#EF444420', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10 }}>
                <Text style={{ color: stats.user.isActive ? '#10B981' : '#EF4444', fontSize: 11, fontWeight: '600' }}>
                  {stats.user.isActive ? 'Active' : 'Inactive'}
                </Text>
              </View>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 }}>
              <Mail size={13} color={theme.colors.textSecondary} />
              <Text style={{ color: theme.colors.textSecondary, fontSize: 13 }}>{stats.user.email}</Text>
            </View>
          </View>
        </View>

        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 16 }}>
          {stats.user.roles.map(role => (
            <View key={role._id} style={{ backgroundColor: theme.colors.primary + '20', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12, flexDirection: 'row', alignItems: 'center' }}>
              <Shield size={10} color={theme.colors.primary} />
              <Text style={{ color: theme.colors.primary, fontSize: 11, fontWeight: '600', marginLeft: 4 }}>{role.name}</Text>
            </View>
          ))}
        </View>

        <View style={{ flexDirection: 'row', gap: 8, marginTop: 16 }}>
          <View style={{ flex: 1, backgroundColor: theme.colors.background, padding: 10, borderRadius: 8 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 }}>
              <Calendar size={13} color="#3B82F6" />
              <Text style={{ fontSize: 11, color: theme.colors.textSecondary, fontWeight: '600' }}>Joined</Text>
            </View>
            <Text style={{ fontSize: 13, fontWeight: '600', color: theme.colors.text }}>
              {new Date(stats.user.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </Text>
          </View>
          <View style={{ flex: 1, backgroundColor: theme.colors.background, padding: 10, borderRadius: 8 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 }}>
              <LogIn size={13} color="#10B981" />
              <Text style={{ fontSize: 11, color: theme.colors.textSecondary, fontWeight: '600' }}>Login Activity</Text>
            </View>
            <Text style={{ fontSize: 13, fontWeight: '600', color: theme.colors.text }}>{stats.user.loginCount || 0} times</Text>
            {stats.user.lastLogin && (
              <Text style={{ fontSize: 10, color: theme.colors.textSecondary, marginTop: 2 }}>
                Last: {new Date(stats.user.lastLogin).toLocaleDateString()}
              </Text>
            )}
          </View>
        </View>
      </View>

      {/* Stats Overview */}
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
        <StatTile icon={<Activity size={20} color="#3B82F6" />} label="Total Assigned" value={stats.workStats.totalAssigned} color="#3B82F6" theme={theme} />
        <StatTile icon={<CheckCircle size={20} color="#10B981" />} label="Completed" value={stats.workStats.completed} color="#10B981" theme={theme} />
        <StatTile icon={<Clock size={20} color="#F59E0B" />} label="Pending" value={stats.workStats.pending} color="#F59E0B" theme={theme} />
        <StatTile icon={<TrendingUp size={20} color="#8B5CF6" />} label="In Progress" value={stats.workStats.inProgress} color="#8B5CF6" theme={theme} />
      </View>

      {/* Recce Performance */}
      {isRecceUser && stats.recceStats && (
        <View style={cardStyle}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
            <BarChart3 size={18} color="#3B82F6" />
            <Text style={{ fontSize: 16, fontWeight: 'bold', color: theme.colors.text, marginLeft: 8 }}>Recce Performance</Text>
          </View>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
            <MiniStat label="Assigned" value={stats.recceStats.assigned} theme={theme} />
            <MiniStat label="Submitted" value={stats.recceStats.submitted} theme={theme} />
            <MiniStat label="Approved" value={stats.recceStats.approved} color="#10B981" theme={theme} />
            <MiniStat label="Rejected" value={stats.recceStats.rejected} color="#EF4444" theme={theme} />
            <MiniStat label="Pending" value={stats.recceStats.pending} color="#F59E0B" theme={theme} />
          </View>
        </View>
      )}

      {/* Installation Performance */}
      {isInstallUser && stats.installationStats && (
        <View style={cardStyle}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
            <BarChart3 size={18} color="#10B981" />
            <Text style={{ fontSize: 16, fontWeight: 'bold', color: theme.colors.text, marginLeft: 8 }}>Installation Performance</Text>
          </View>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
            <MiniStat label="Assigned" value={stats.installationStats.assigned} theme={theme} />
            <MiniStat label="Submitted" value={stats.installationStats.submitted} theme={theme} />
            <MiniStat label="Completed" value={stats.installationStats.completed} color="#10B981" theme={theme} />
            <MiniStat label="Pending" value={stats.installationStats.pending} color="#F59E0B" theme={theme} />
          </View>
        </View>
      )}

      {/* Admin Overview */}
      {isAdminUser && stats.adminStats && (
        <View style={cardStyle}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
            <Shield size={18} color="#8B5CF6" />
            <Text style={{ fontSize: 16, fontWeight: 'bold', color: theme.colors.text, marginLeft: 8 }}>Admin Overview</Text>
          </View>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
            <MiniStat label="Total Assignments Made" value={stats.adminStats.totalAssignments} theme={theme} />
            <MiniStat label="Users Managed" value={stats.adminStats.usersManaged} theme={theme} />
            <MiniStat label="Stores Managed" value={stats.adminStats.storesManaged} theme={theme} />
          </View>
        </View>
      )}

      {/* Recent Activity */}
      <View style={cardStyle}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
          <Activity size={18} color={theme.colors.primary} />
          <Text style={{ fontSize: 16, fontWeight: 'bold', color: theme.colors.text, marginLeft: 8 }}>Recent Activity</Text>
        </View>
        {stats.recentActivity.length === 0 ? (
          <Text style={{ color: theme.colors.textSecondary, textAlign: 'center', paddingVertical: 24 }}>No recent activity</Text>
        ) : (
          stats.recentActivity.map((activity, idx) => (
            <View
              key={activity._id || idx}
              style={{
                paddingVertical: 10,
                borderTopWidth: idx === 0 ? 0 : 1,
                borderTopColor: theme.colors.border,
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                <MapPin size={13} color={theme.colors.textSecondary} />
                <Text style={{ color: theme.colors.text, fontWeight: '600', fontSize: 14 }}>{activity.storeName}</Text>
                <View style={{ backgroundColor: theme.colors.primary + '20', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 8 }}>
                  <Text style={{ color: theme.colors.primary, fontSize: 10, fontWeight: '600' }}>{activity.dealerCode}</Text>
                </View>
              </View>
              <Text style={{ color: theme.colors.textSecondary, fontSize: 12, marginTop: 4 }}>
                {activity.city} • {activity.status?.replace(/_/g, ' ')}
              </Text>
              {activity.assignedDate && (
                <Text style={{ color: theme.colors.textSecondary, fontSize: 11, marginTop: 2 }}>
                  Assigned: {new Date(activity.assignedDate).toLocaleDateString()}
                  {activity.submittedDate && ` • Submitted: ${new Date(activity.submittedDate).toLocaleDateString()}`}
                </Text>
              )}
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
}

function StatTile({ icon, label, value, color, theme }: any) {
  return (
    <View style={{ flex: 1, minWidth: '45%', backgroundColor: theme.colors.surface, borderRadius: 12, borderWidth: 1, borderColor: theme.colors.border, padding: 14 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
        {icon}
        <Text style={{ fontSize: 20, fontWeight: 'bold', color: theme.colors.text }}>{value}</Text>
      </View>
      <Text style={{ fontSize: 12, fontWeight: '600', color }}>{label}</Text>
    </View>
  );
}

function MiniStat({ label, value, color, theme }: any) {
  return (
    <View style={{ minWidth: 90, backgroundColor: theme.colors.background, padding: 10, borderRadius: 8 }}>
      <Text style={{ fontSize: 18, fontWeight: 'bold', color: color || theme.colors.text }}>{value}</Text>
      <Text style={{ fontSize: 11, color: theme.colors.textSecondary }}>{label}</Text>
    </View>
  );
}
