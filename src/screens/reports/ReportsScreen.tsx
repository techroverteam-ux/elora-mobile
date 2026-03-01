import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { BarChart3, TrendingUp, Users, Package, CheckCircle, Clock, Award, MapPin, Activity, Filter, Calendar, Download, Eye } from 'lucide-react-native';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import api from '../../lib/api';
import Toast from 'react-native-toast-message';
import PageSkeleton from '../../components/PageSkeleton';

interface Analytics {
  overview: {
    totalStores: number;
    activeUsers: number;
    totalAssigned: number;
    pending: number;
    submitted: number;
    approved: number;
    completed: number;
    completionRate: number;
  };
  recce: {
    total: number;
    assigned: number;
    submitted: number;
    approved: number;
    rejected: number;
    completionRate: number;
  };
  installation: {
    total: number;
    assigned: number;
    submitted: number;
    completed: number;
    completionRate: number;
  };
  recentActivity: {
    newStores: number;
    recceSubmissions: number;
    installations: number;
    submissionsLast7Days: number;
  };
  topPerformers: {
    recce: Array<{ name: string; count: number }>;
    installation: Array<{ name: string; count: number }>;
  };
  distribution: {
    byCity: Array<{ _id: string; count: number }>;
  };
  assignments: Array<{
    storeName: string;
    dealerCode: string;
    city: string;
    state: string;
    assignedTo: string;
    role: string;
    date: string;
    status: string;
    storeId: string;
  }>;
  myTasks: Array<{
    storeName: string;
    city: string;
    district: string;
    state: string;
    status: string;
    assignedDate: string;
  }>;
}

export default function ReportsScreen() {
  console.log('ReportsScreen: Component initialized');
  
  const { theme } = useTheme();
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    status: '',
    zone: '',
    state: '',
    city: ''
  });

  const isAdmin = React.useMemo(() => {
    if (!user || !user.roles || !Array.isArray(user.roles)) return false;
    return user.roles.some((role: any) => 
      role?.code === "SUPER_ADMIN" || role?.code === "ADMIN"
    );
  }, [user]);

  useEffect(() => {
    fetchAnalytics();
  }, [filters]);

  const fetchAnalytics = async () => {
    console.log('ReportsScreen: fetchAnalytics called');
    
    try {
      setLoading(true);
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });
      params.append('_t', Date.now().toString());
      
      const { data } = await api.get(`/analytics/dashboard?${params.toString()}`);
      setAnalytics(data.analytics || {});
      console.log('ReportsScreen: Analytics loaded successfully');
      
    } catch (error) {
      console.error('ReportsScreen: Error fetching analytics', error);
      Toast.show({ type: 'error', text1: 'Failed to load analytics' });
      // Set empty analytics to prevent crashes
      setAnalytics({
        overview: { totalStores: 0, activeUsers: 0, totalAssigned: 0, pending: 0, submitted: 0, approved: 0, completed: 0, completionRate: 0 },
        recce: { total: 0, assigned: 0, submitted: 0, approved: 0, rejected: 0, completionRate: 0 },
        installation: { total: 0, assigned: 0, submitted: 0, completed: 0, completionRate: 0 },
        recentActivity: { newStores: 0, recceSubmissions: 0, installations: 0, submissionsLast7Days: 0 },
        topPerformers: { recce: [], installation: [] },
        distribution: { byCity: [] },
        assignments: [],
        myTasks: []
      });
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    fetchAnalytics();
  };

  const resetFilters = () => {
    setFilters({
      startDate: '',
      endDate: '',
      status: '',
      zone: '',
      state: '',
      city: ''
    });
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    const day = date.getDate().toString().padStart(2, '0');
    const month = date.toLocaleString('en-US', { month: 'short' });
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  if (loading) {
    return <PageSkeleton type="dashboard" />;
  }

  if (!analytics) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.colors.background, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ color: theme.colors.textSecondary, fontSize: 16 }}>No data available</Text>
      </View>
    );
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <View style={{ padding: 16 }}>
        {/* Header */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <View>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
              <BarChart3 size={24} color={theme.colors.primary} />
              <Text style={{ fontSize: 24, fontWeight: 'bold', color: theme.colors.text, marginLeft: 8 }}>Reports</Text>
            </View>
            <Text style={{ fontSize: 14, color: theme.colors.textSecondary }}>
              {isAdmin ? 'Complete project overview and insights' : 'Your performance metrics and tasks'}
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => setShowFilters(!showFilters)}
            style={{ backgroundColor: theme.colors.surface, padding: 12, borderRadius: 8, borderWidth: 1, borderColor: theme.colors.border }}
          >
            <Filter size={20} color={theme.colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Filters */}
        {showFilters && (
          <View style={{ backgroundColor: theme.colors.surface, borderRadius: 12, borderWidth: 1, borderColor: theme.colors.border, padding: 16, marginBottom: 16 }}>
            <Text style={{ color: theme.colors.text, fontWeight: '600', marginBottom: 12 }}>Filters</Text>
            <View style={{ gap: 12 }}>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                <TextInput
                  style={{ flex: 1, backgroundColor: theme.colors.background, padding: 12, borderRadius: 8, color: theme.colors.text, borderWidth: 1, borderColor: theme.colors.border }}
                  placeholder="Start Date (YYYY-MM-DD)"
                  placeholderTextColor={theme.colors.textSecondary}
                  value={filters.startDate}
                  onChangeText={(text) => setFilters({ ...filters, startDate: text })}
                />
                <TextInput
                  style={{ flex: 1, backgroundColor: theme.colors.background, padding: 12, borderRadius: 8, color: theme.colors.text, borderWidth: 1, borderColor: theme.colors.border }}
                  placeholder="End Date (YYYY-MM-DD)"
                  placeholderTextColor={theme.colors.textSecondary}
                  value={filters.endDate}
                  onChangeText={(text) => setFilters({ ...filters, endDate: text })}
                />
              </View>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                <TextInput
                  style={{ flex: 1, backgroundColor: theme.colors.background, padding: 12, borderRadius: 8, color: theme.colors.text, borderWidth: 1, borderColor: theme.colors.border }}
                  placeholder="Zone"
                  placeholderTextColor={theme.colors.textSecondary}
                  value={filters.zone}
                  onChangeText={(text) => setFilters({ ...filters, zone: text })}
                />
                <TextInput
                  style={{ flex: 1, backgroundColor: theme.colors.background, padding: 12, borderRadius: 8, color: theme.colors.text, borderWidth: 1, borderColor: theme.colors.border }}
                  placeholder="State"
                  placeholderTextColor={theme.colors.textSecondary}
                  value={filters.state}
                  onChangeText={(text) => setFilters({ ...filters, state: text })}
                />
              </View>
              <TextInput
                style={{ backgroundColor: theme.colors.background, padding: 12, borderRadius: 8, color: theme.colors.text, borderWidth: 1, borderColor: theme.colors.border }}
                placeholder="City"
                placeholderTextColor={theme.colors.textSecondary}
                value={filters.city}
                onChangeText={(text) => setFilters({ ...filters, city: text })}
              />
              <View style={{ flexDirection: 'row', gap: 8 }}>
                <TouchableOpacity
                  onPress={applyFilters}
                  style={{ flex: 1, backgroundColor: theme.colors.primary, padding: 12, borderRadius: 8, alignItems: 'center' }}
                >
                  <Text style={{ color: '#FFF', fontWeight: '600' }}>Apply</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={resetFilters}
                  style={{ flex: 1, backgroundColor: theme.colors.border, padding: 12, borderRadius: 8, alignItems: 'center' }}
                >
                  <Text style={{ color: theme.colors.text, fontWeight: '600' }}>Reset</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}

        {isAdmin ? (
          /* ADMIN DASHBOARD */
          <View style={{ gap: 16 }}>
            {/* Overview Cards */}
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
              <StatCard icon={<Package size={20} color="#3B82F6" />} label="Total Stores" value={analytics.overview.totalStores} color="#3B82F6" theme={theme} />
              <StatCard icon={<Users size={20} color="#10B981" />} label="Active Users" value={analytics.overview.activeUsers} color="#10B981" theme={theme} />
              <StatCard icon={<Clock size={20} color="#F59E0B" />} label="Recce Pending" value={analytics.recce.assigned} color="#F59E0B" theme={theme} />
              <StatCard icon={<CheckCircle size={20} color="#10B981" />} label="Completed" value={analytics.installation.completed} color="#10B981" theme={theme} />
            </View>

            {/* Recce & Installation Stats */}
            <View style={{ gap: 16 }}>
              <View style={{ backgroundColor: theme.colors.surface, padding: 16, borderRadius: 12, borderWidth: 1, borderColor: theme.colors.border }}>
                <Text style={{ fontSize: 18, fontWeight: 'bold', color: theme.colors.text, marginBottom: 16 }}>Recce Operations</Text>
                <View style={{ gap: 12 }}>
                  <ProgressBar label="Assigned" value={analytics.recce.assigned} total={analytics.recce.total} color="#3B82F6" theme={theme} />
                  <ProgressBar label="Submitted" value={analytics.recce.submitted} total={analytics.recce.total} color="#F59E0B" theme={theme} />
                  <ProgressBar label="Approved" value={analytics.recce.approved} total={analytics.recce.total} color="#10B981" theme={theme} />
                  <ProgressBar label="Rejected" value={analytics.recce.rejected} total={analytics.recce.total} color="#EF4444" theme={theme} />
                </View>
                <View style={{ marginTop: 16, paddingTop: 16, borderTopWidth: 1, borderTopColor: theme.colors.border }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text style={{ color: theme.colors.textSecondary, fontSize: 14 }}>Success Rate</Text>
                    <Text style={{ color: '#10B981', fontSize: 18, fontWeight: 'bold' }}>{analytics.recce.completionRate}%</Text>
                  </View>
                </View>
              </View>

              <View style={{ backgroundColor: theme.colors.surface, padding: 16, borderRadius: 12, borderWidth: 1, borderColor: theme.colors.border }}>
                <Text style={{ fontSize: 18, fontWeight: 'bold', color: theme.colors.text, marginBottom: 16 }}>Installation Operations</Text>
                <View style={{ gap: 12 }}>
                  <ProgressBar label="Assigned" value={analytics.installation.assigned} total={analytics.installation.total} color="#F97316" theme={theme} />
                  <ProgressBar label="Submitted" value={analytics.installation.submitted} total={analytics.installation.total} color="#3B82F6" theme={theme} />
                  <ProgressBar label="Completed" value={analytics.installation.completed} total={analytics.installation.total} color="#10B981" theme={theme} />
                </View>
                <View style={{ marginTop: 16, paddingTop: 16, borderTopWidth: 1, borderTopColor: theme.colors.border }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text style={{ color: theme.colors.textSecondary, fontSize: 14 }}>Completion Rate</Text>
                    <Text style={{ color: '#10B981', fontSize: 18, fontWeight: 'bold' }}>{analytics.installation.completionRate}%</Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Recent Activity */}
            <View style={{ backgroundColor: theme.colors.surface, padding: 16, borderRadius: 12, borderWidth: 1, borderColor: theme.colors.border }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
                <Activity size={20} color={theme.colors.primary} />
                <Text style={{ fontSize: 18, fontWeight: 'bold', color: theme.colors.text, marginLeft: 8 }}>Recent Activity (Last 7 Days)</Text>
              </View>
              <View style={{ flexDirection: 'row', gap: 12 }}>
                <View style={{ flex: 1, backgroundColor: theme.colors.background, padding: 12, borderRadius: 8 }}>
                  <Text style={{ color: theme.colors.textSecondary, fontSize: 12 }}>New Stores</Text>
                  <Text style={{ color: theme.colors.text, fontSize: 20, fontWeight: 'bold' }}>{analytics.recentActivity.newStores}</Text>
                </View>
                <View style={{ flex: 1, backgroundColor: theme.colors.background, padding: 12, borderRadius: 8 }}>
                  <Text style={{ color: theme.colors.textSecondary, fontSize: 12 }}>Recce Submissions</Text>
                  <Text style={{ color: theme.colors.text, fontSize: 20, fontWeight: 'bold' }}>{analytics.recentActivity.recceSubmissions}</Text>
                </View>
                <View style={{ flex: 1, backgroundColor: theme.colors.background, padding: 12, borderRadius: 8 }}>
                  <Text style={{ color: theme.colors.textSecondary, fontSize: 12 }}>Installations</Text>
                  <Text style={{ color: theme.colors.text, fontSize: 20, fontWeight: 'bold' }}>{analytics.recentActivity.installations}</Text>
                </View>
              </View>
            </View>

            {/* Top Performers & Distribution */}
            <View style={{ gap: 16 }}>
              <View style={{ backgroundColor: theme.colors.surface, padding: 16, borderRadius: 12, borderWidth: 1, borderColor: theme.colors.border }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
                  <Award size={20} color={theme.colors.primary} />
                  <Text style={{ fontSize: 18, fontWeight: 'bold', color: theme.colors.text, marginLeft: 8 }}>Top Performers</Text>
                </View>
                <View style={{ gap: 16 }}>
                  <View>
                    <Text style={{ color: theme.colors.text, fontWeight: '600', marginBottom: 8 }}>Recce Team</Text>
                    {analytics.topPerformers.recce.map((user, idx) => (
                      <View key={idx} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 6 }}>
                        <Text style={{ color: theme.colors.text, fontSize: 14 }}>{user.name}</Text>
                        <Text style={{ color: theme.colors.primary, fontSize: 14, fontWeight: 'bold' }}>{user.count} tasks</Text>
                      </View>
                    ))}
                  </View>
                  <View style={{ paddingTop: 16, borderTopWidth: 1, borderTopColor: theme.colors.border }}>
                    <Text style={{ color: theme.colors.text, fontWeight: '600', marginBottom: 8 }}>Installation Team</Text>
                    {analytics.topPerformers.installation.map((user, idx) => (
                      <View key={idx} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 6 }}>
                        <Text style={{ color: theme.colors.text, fontSize: 14 }}>{user.name}</Text>
                        <Text style={{ color: '#10B981', fontSize: 14, fontWeight: 'bold' }}>{user.count} tasks</Text>
                      </View>
                    ))}
                  </View>
                </View>
              </View>

              <View style={{ backgroundColor: theme.colors.surface, padding: 16, borderRadius: 12, borderWidth: 1, borderColor: theme.colors.border }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
                  <MapPin size={20} color={theme.colors.primary} />
                  <Text style={{ fontSize: 18, fontWeight: 'bold', color: theme.colors.text, marginLeft: 8 }}>Top Cities</Text>
                </View>
                <View style={{ gap: 8 }}>
                  {analytics.distribution.byCity.slice(0, 8).map((city, idx) => (
                    <View key={idx} style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                      <Text style={{ color: theme.colors.text, fontSize: 14, fontWeight: '600', width: 100 }}>{city._id || 'Unknown'}</Text>
                      <View style={{ flex: 1, height: 8, backgroundColor: theme.colors.border, borderRadius: 4 }}>
                        <View style={{ 
                          height: 8, 
                          backgroundColor: theme.colors.primary, 
                          borderRadius: 4,
                          width: `${(city.count / analytics.overview.totalStores) * 100}%`
                        }} />
                      </View>
                      <Text style={{ color: theme.colors.text, fontSize: 14, fontWeight: 'bold', width: 40, textAlign: 'right' }}>{city.count}</Text>
                    </View>
                  ))}
                </View>
              </View>
            </View>
          </View>
        ) : (
          /* USER DASHBOARD */
          <View style={{ gap: 16 }}>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
              <StatCard icon={<Package size={20} color="#3B82F6" />} label="Total Assigned" value={analytics.overview.totalAssigned || 0} color="#3B82F6" theme={theme} />
              <StatCard icon={<Clock size={20} color="#F59E0B" />} label="Pending" value={analytics.overview.pending || 0} color="#F59E0B" theme={theme} />
              <StatCard icon={<CheckCircle size={20} color="#10B981" />} label="Completed" value={analytics.overview.approved || analytics.overview.completed || 0} color="#10B981" theme={theme} />
              <StatCard icon={<TrendingUp size={20} color="#8B5CF6" />} label="Success Rate" value={`${analytics.overview.completionRate || 0}%`} color="#8B5CF6" theme={theme} />
            </View>

            <View style={{ backgroundColor: theme.colors.surface, padding: 16, borderRadius: 12, borderWidth: 1, borderColor: theme.colors.border }}>
              <Text style={{ fontSize: 18, fontWeight: 'bold', color: theme.colors.text, marginBottom: 16 }}>Task Breakdown</Text>
              <View style={{ gap: 12 }}>
                <ProgressBar label="Pending" value={analytics.overview.pending || 0} total={analytics.overview.totalAssigned || 0} color="#F59E0B" theme={theme} />
                <ProgressBar label="Submitted" value={analytics.overview.submitted || 0} total={analytics.overview.totalAssigned || 0} color="#3B82F6" theme={theme} />
                {analytics.overview.approved !== undefined && (
                  <ProgressBar label="Approved" value={analytics.overview.approved} total={analytics.overview.totalAssigned || 0} color="#10B981" theme={theme} />
                )}
                {analytics.overview.completed !== undefined && (
                  <ProgressBar label="Completed" value={analytics.overview.completed} total={analytics.overview.totalAssigned || 0} color="#10B981" theme={theme} />
                )}
              </View>
            </View>

            <View style={{ flexDirection: 'row', gap: 16 }}>
              <View style={{ flex: 1, backgroundColor: theme.colors.surface, padding: 16, borderRadius: 12, borderWidth: 1, borderColor: theme.colors.border }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
                  <Activity size={20} color={theme.colors.primary} />
                  <Text style={{ fontSize: 16, fontWeight: 'bold', color: theme.colors.text, marginLeft: 8 }}>Recent Activity</Text>
                </View>
                <View style={{ backgroundColor: theme.colors.background, padding: 12, borderRadius: 8 }}>
                  <Text style={{ color: theme.colors.textSecondary, fontSize: 12 }}>Submissions (Last 7 Days)</Text>
                  <Text style={{ color: theme.colors.text, fontSize: 24, fontWeight: 'bold' }}>{analytics.recentActivity.submissionsLast7Days || 0}</Text>
                </View>
              </View>
            </View>

            {/* My Tasks */}
            <View style={{ backgroundColor: theme.colors.surface, padding: 16, borderRadius: 12, borderWidth: 1, borderColor: theme.colors.border }}>
              <Text style={{ fontSize: 18, fontWeight: 'bold', color: theme.colors.text, marginBottom: 16 }}>My Tasks</Text>
              <View style={{ gap: 12 }}>
                {analytics.myTasks && analytics.myTasks.length > 0 ? analytics.myTasks.map((task, idx) => {
                  const location = [task.city, task.district, task.state].filter(Boolean).join(', ') || 'N/A';
                  return (
                    <View key={idx} style={{ backgroundColor: theme.colors.background, padding: 12, borderRadius: 8, borderWidth: 1, borderColor: theme.colors.border }}>
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                        <View style={{ flex: 1 }}>
                          <Text style={{ color: theme.colors.text, fontWeight: '600', fontSize: 16 }}>{task.storeName}</Text>
                          <Text style={{ color: theme.colors.textSecondary, fontSize: 14, marginTop: 4 }}>{location}</Text>
                        </View>
                        <View style={{ alignItems: 'flex-end' }}>
                          <View style={{ 
                            backgroundColor: task.status === 'COMPLETED' ? '#10B98120' : 
                                           task.status === 'SUBMITTED' ? '#F59E0B20' : 
                                           task.status === 'APPROVED' ? '#3B82F620' : '#6B728020',
                            paddingHorizontal: 8,
                            paddingVertical: 4,
                            borderRadius: 12
                          }}>
                            <Text style={{ 
                              color: task.status === 'COMPLETED' ? '#10B981' : 
                                     task.status === 'SUBMITTED' ? '#F59E0B' : 
                                     task.status === 'APPROVED' ? '#3B82F6' : '#6B7280',
                              fontSize: 10,
                              fontWeight: '600'
                            }}>
                              {task.status?.replace(/_/g, ' ')}
                            </Text>
                          </View>
                          <Text style={{ color: theme.colors.textSecondary, fontSize: 12, marginTop: 4 }}>
                            {task.assignedDate ? formatDate(task.assignedDate) : 'N/A'}
                          </Text>
                        </View>
                      </View>
                    </View>
                  );
                }) : (
                  <Text style={{ color: theme.colors.textSecondary, textAlign: 'center', paddingVertical: 32 }}>No tasks assigned yet</Text>
                )}
              </View>
            </View>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

function StatCard({ icon, label, value, color, theme }: any) {
  return (
    <View style={{ 
      backgroundColor: theme.colors.surface, 
      padding: 16, 
      borderRadius: 12, 
      borderWidth: 1, 
      borderColor: theme.colors.border,
      minWidth: 160,
      flex: 1
    }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <View style={{ 
          padding: 8, 
          borderRadius: 8, 
          backgroundColor: color + '20'
        }}>
          {icon}
        </View>
        <View>
          <Text style={{ color: theme.colors.textSecondary, fontSize: 12 }}>{label}</Text>
          <Text style={{ color: theme.colors.text, fontSize: 20, fontWeight: 'bold' }}>{value}</Text>
        </View>
      </View>
    </View>
  );
}

function ProgressBar({ label, value, total, color, theme }: any) {
  const percentage = total > 0 ? (value / total) * 100 : 0;

  return (
    <View>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
        <Text style={{ color: theme.colors.text, fontSize: 14 }}>{label}</Text>
        <Text style={{ color: theme.colors.text, fontSize: 14, fontWeight: 'bold' }}>{value}</Text>
      </View>
      <View style={{ height: 8, backgroundColor: theme.colors.border, borderRadius: 4 }}>
        <View style={{ 
          height: 8, 
          backgroundColor: color, 
          borderRadius: 4,
          width: `${percentage}%`
        }} />
      </View>
    </View>
  );
}