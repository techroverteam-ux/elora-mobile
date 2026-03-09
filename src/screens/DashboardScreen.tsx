import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { BarChart3, TrendingUp, Users, Package, CheckCircle, Clock, Award, MapPin, Activity } from 'lucide-react-native';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import api from '../lib/api';
import Toast from 'react-native-toast-message';
import PageSkeleton from '../components/PageSkeleton';
import Header from '../components/Header';

interface DashboardData {
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
  myTasks: Array<{
    storeName: string;
    city: string;
    district: string;
    state: string;
    status: string;
    assignedDate: string;
  }>;
}

export default function DashboardScreen({ onMenuPress, onProfilePress }: { onMenuPress: () => void; onProfilePress?: () => void }) {
  const { theme } = useTheme();
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const isAdmin = React.useMemo(() => {
    if (!user || !user.roles || !Array.isArray(user.roles)) return false;
    return user.roles.some((role: any) => 
      role?.code === "SUPER_ADMIN" || role?.code === "ADMIN"
    );
  }, [user]);

  useEffect(() => {
    // Only fetch data if user is authenticated
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    console.log('DashboardScreen: fetchDashboardData called');
    
    try {
      setLoading(true);
      const { data } = await api.get('/dashboard/stats');
      console.log('DashboardScreen: Raw API response:', data);
      
      // Map the API response to our expected format
      const mappedData = {
        overview: {
          totalStores: data?.kpi?.totalStores || 0,
          activeUsers: data?.kpi?.activeUsers || 0,
          totalAssigned: data?.kpi?.totalStores || 0,
          pending: (data?.kpi?.totalStores || 0) - (data?.kpi?.recceDoneTotal || 0),
          submitted: data?.kpi?.recceDoneTotal || 0,
          approved: data?.kpi?.recceDoneTotal || 0,
          completed: data?.kpi?.installationDoneTotal || 0,
          completionRate: data?.kpi?.totalStores > 0 ? Math.round(((data?.kpi?.installationDoneTotal || 0) / data?.kpi?.totalStores) * 100) : 0
        },
        recce: {
          total: data?.kpi?.totalStores || 0,
          assigned: data?.kpi?.totalStores || 0,
          submitted: data?.kpi?.recceDoneTotal || 0,
          approved: data?.kpi?.recceDoneTotal || 0,
          rejected: 0,
          completionRate: data?.kpi?.totalStores > 0 ? Math.round(((data?.kpi?.recceDoneTotal || 0) / data?.kpi?.totalStores) * 100) : 0
        },
        installation: {
          total: data?.kpi?.recceDoneTotal || 0,
          assigned: data?.kpi?.recceDoneTotal || 0,
          submitted: data?.kpi?.installationDoneTotal || 0,
          completed: data?.kpi?.installationDoneTotal || 0,
          completionRate: data?.kpi?.recceDoneTotal > 0 ? Math.round(((data?.kpi?.installationDoneTotal || 0) / data?.kpi?.recceDoneTotal) * 100) : 0
        },
        recentActivity: {
          newStores: data?.kpi?.newStoresToday || 0,
          recceSubmissions: data?.kpi?.recceDoneToday || 0,
          installations: data?.kpi?.installationDoneToday || 0,
          submissionsLast7Days: data?.kpi?.recceDoneToday || 0
        },
        topPerformers: {
          recce: data?.personnelStats?.filter((p: any) => p.role === 'RECCE')?.map((p: any) => ({ name: p.name, count: p.completedCount })) || [],
          installation: data?.personnelStats?.filter((p: any) => p.role === 'INSTALLATION')?.map((p: any) => ({ name: p.name, count: p.completedCount })) || []
        },
        distribution: {
          byCity: data?.stateDistribution?.map((item: any) => ({ _id: item._id, count: item.count })) || []
        },
        myTasks: data?.recentStores?.map((store: any) => ({
          storeName: store.storeName,
          city: store.location?.city || '',
          district: store.location?.district || '',
          state: store.location?.state || '',
          status: store.currentStatus,
          assignedDate: store.createdAt || ''
        })) || []
      };
      
      setDashboardData(mappedData);
      console.log('DashboardScreen: Dashboard data mapped successfully');
      
    } catch (error: any) {
      console.error('DashboardScreen: Error fetching dashboard data', error);
      
      // Check if it's an authentication error
      if (error.response?.status === 401) {
        Toast.show({ type: 'error', text1: 'Authentication required', text2: 'Please login again' });
      } else if (error.response?.status === 404) {
        Toast.show({ type: 'error', text1: 'Dashboard endpoint not found' });
      } else {
        Toast.show({ type: 'error', text1: 'Failed to load dashboard data' });
      }
      
      // Set empty data to prevent crashes
      setDashboardData({
        overview: { totalStores: 0, activeUsers: 0, totalAssigned: 0, pending: 0, submitted: 0, approved: 0, completed: 0, completionRate: 0 },
        recce: { total: 0, assigned: 0, submitted: 0, approved: 0, rejected: 0, completionRate: 0 },
        installation: { total: 0, assigned: 0, submitted: 0, completed: 0, completionRate: 0 },
        recentActivity: { newStores: 0, recceSubmissions: 0, installations: 0, submissionsLast7Days: 0 },
        topPerformers: { recce: [], installation: [] },
        distribution: { byCity: [] },
        myTasks: []
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
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

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <Header
        onMenuPress={onMenuPress}
        onProfilePress={onProfilePress}
        hasNotifications={true}
      />

      <ScrollView 
        style={{ flex: 1 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              fetchDashboardData();
            }}
            colors={[theme.colors.primary]}
          />
        }
      >
        <View style={{ padding: 16, gap: 16 }}>
          {isAdmin ? (
            /* ADMIN DASHBOARD */
            <>
              {/* Overview Cards */}
              <View style={{ gap: 12 }}>
                <Text style={{ fontSize: 18, fontWeight: 'bold', color: theme.colors.text }}>Overview</Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
                  <StatCard icon={<Package size={20} color="#3B82F6" />} label="Total Stores" value={dashboardData?.overview.totalStores || 0} color="#3B82F6" theme={theme} />
                  <StatCard icon={<Users size={20} color="#10B981" />} label="Active Users" value={dashboardData?.overview.activeUsers || 0} color="#10B981" theme={theme} />
                  <StatCard icon={<Clock size={20} color="#F59E0B" />} label="Recce Pending" value={dashboardData?.recce.assigned || 0} color="#F59E0B" theme={theme} />
                  <StatCard icon={<CheckCircle size={20} color="#10B981" />} label="Completed" value={dashboardData?.installation.completed || 0} color="#10B981" theme={theme} />
                </View>
              </View>

              {/* Recce Operations Chart */}
              <View style={{ backgroundColor: theme.colors.surface, padding: 16, borderRadius: 12, borderWidth: 1, borderColor: theme.colors.border }}>
                <Text style={{ fontSize: 18, fontWeight: 'bold', color: theme.colors.text, marginBottom: 16 }}>Recce Operations</Text>
                
                {/* Circular Progress Chart */}
                <View style={{ alignItems: 'center', marginBottom: 16 }}>
                  <View style={{ width: 120, height: 120, borderRadius: 60, backgroundColor: theme.colors.border, alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                    <View style={{ 
                      width: 100, 
                      height: 100, 
                      borderRadius: 50, 
                      backgroundColor: '#3B82F6', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      transform: [{ rotate: `${(dashboardData?.recce.completionRate || 0) * 3.6}deg` }]
                    }}>
                      <View style={{ width: 80, height: 80, borderRadius: 40, backgroundColor: theme.colors.surface, alignItems: 'center', justifyContent: 'center' }}>
                        <Text style={{ color: theme.colors.text, fontSize: 20, fontWeight: 'bold' }}>{dashboardData?.recce.completionRate || 0}%</Text>
                        <Text style={{ color: theme.colors.textSecondary, fontSize: 10 }}>Success</Text>
                      </View>
                    </View>
                  </View>
                </View>

                {/* Bar Chart */}
                <View style={{ flexDirection: 'row', alignItems: 'end', justifyContent: 'space-between', height: 100, marginBottom: 16 }}>
                  {[
                    { label: 'Assigned', value: dashboardData?.recce.assigned || 0, color: '#3B82F6' },
                    { label: 'Submitted', value: dashboardData?.recce.submitted || 0, color: '#F59E0B' },
                    { label: 'Approved', value: dashboardData?.recce.approved || 0, color: '#10B981' },
                    { label: 'Rejected', value: dashboardData?.recce.rejected || 0, color: '#EF4444' }
                  ].map((item, idx) => {
                    const maxValue = Math.max(dashboardData?.recce.assigned || 0, dashboardData?.recce.submitted || 0, dashboardData?.recce.approved || 0, dashboardData?.recce.rejected || 0);
                    const height = maxValue > 0 ? (item.value / maxValue) * 70 : 0;
                    return (
                      <View key={idx} style={{ alignItems: 'center', flex: 1 }}>
                        <View style={{
                          backgroundColor: item.color,
                          width: 20,
                          height: height,
                          borderRadius: 4,
                          marginBottom: 8
                        }} />
                        <Text style={{ color: theme.colors.textSecondary, fontSize: 10, textAlign: 'center' }}>
                          {item.label}
                        </Text>
                        <Text style={{ color: theme.colors.text, fontSize: 12, fontWeight: 'bold' }}>
                          {item.value}
                        </Text>
                      </View>
                    );
                  })}
                </View>

                <View style={{ gap: 8 }}>
                  <ProgressBar label="Assigned" value={dashboardData?.recce.assigned || 0} total={dashboardData?.recce.total || 0} color="#3B82F6" theme={theme} />
                  <ProgressBar label="Submitted" value={dashboardData?.recce.submitted || 0} total={dashboardData?.recce.total || 0} color="#F59E0B" theme={theme} />
                  <ProgressBar label="Approved" value={dashboardData?.recce.approved || 0} total={dashboardData?.recce.total || 0} color="#10B981" theme={theme} />
                </View>
              </View>

              {/* Installation Operations Chart */}
              <View style={{ backgroundColor: theme.colors.surface, padding: 16, borderRadius: 12, borderWidth: 1, borderColor: theme.colors.border }}>
                <Text style={{ fontSize: 18, fontWeight: 'bold', color: theme.colors.text, marginBottom: 16 }}>Installation Operations</Text>
                
                {/* Donut Chart */}
                <View style={{ alignItems: 'center', marginBottom: 16 }}>
                  <View style={{ width: 120, height: 120, position: 'relative' }}>
                    {/* Background Circle */}
                    <View style={{ 
                      width: 120, 
                      height: 120, 
                      borderRadius: 60, 
                      backgroundColor: theme.colors.border,
                      position: 'absolute'
                    }} />
                    
                    {/* Progress Segments */}
                    <View style={{ 
                      width: 120, 
                      height: 120, 
                      borderRadius: 60,
                      borderWidth: 15,
                      borderColor: '#F97316',
                      borderTopColor: 'transparent',
                      borderRightColor: 'transparent',
                      transform: [{ rotate: '0deg' }],
                      position: 'absolute'
                    }} />
                    
                    <View style={{ 
                      width: 120, 
                      height: 120, 
                      borderRadius: 60,
                      borderWidth: 15,
                      borderColor: 'transparent',
                      borderTopColor: '#3B82F6',
                      borderRightColor: '#3B82F6',
                      transform: [{ rotate: '90deg' }],
                      position: 'absolute'
                    }} />
                    
                    <View style={{ 
                      width: 120, 
                      height: 120, 
                      borderRadius: 60,
                      borderWidth: 15,
                      borderColor: 'transparent',
                      borderBottomColor: '#10B981',
                      borderLeftColor: '#10B981',
                      transform: [{ rotate: '180deg' }],
                      position: 'absolute'
                    }} />
                    
                    {/* Center Text */}
                    <View style={{ 
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <Text style={{ color: theme.colors.text, fontSize: 18, fontWeight: 'bold' }}>{dashboardData?.installation.completionRate || 0}%</Text>
                      <Text style={{ color: theme.colors.textSecondary, fontSize: 10 }}>Complete</Text>
                    </View>
                  </View>
                </View>

                {/* Line Chart Simulation */}
                <View style={{ height: 60, marginBottom: 16, flexDirection: 'row', alignItems: 'end' }}>
                  {[20, 35, 25, 45, 30, 50, 40].map((height, idx) => (
                    <View key={idx} style={{ flex: 1, alignItems: 'center' }}>
                      <View style={{
                        width: 4,
                        height: height,
                        backgroundColor: idx === 6 ? '#10B981' : '#3B82F6',
                        borderRadius: 2,
                        marginBottom: 4
                      }} />
                      {idx === 6 && <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: '#10B981' }} />}
                    </View>
                  ))}
                </View>

                <View style={{ gap: 8 }}>
                  <ProgressBar label="Assigned" value={dashboardData?.installation.assigned || 0} total={dashboardData?.installation.total || 0} color="#F97316" theme={theme} />
                  <ProgressBar label="Submitted" value={dashboardData?.installation.submitted || 0} total={dashboardData?.installation.total || 0} color="#3B82F6" theme={theme} />
                  <ProgressBar label="Completed" value={dashboardData?.installation.completed || 0} total={dashboardData?.installation.total || 0} color="#10B981" theme={theme} />
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
                    <Text style={{ color: theme.colors.text, fontSize: 20, fontWeight: 'bold' }}>{dashboardData?.recentActivity.newStores || 0}</Text>
                  </View>
                  <View style={{ flex: 1, backgroundColor: theme.colors.background, padding: 12, borderRadius: 8 }}>
                    <Text style={{ color: theme.colors.textSecondary, fontSize: 12 }}>Recce Submissions</Text>
                    <Text style={{ color: theme.colors.text, fontSize: 20, fontWeight: 'bold' }}>{dashboardData?.recentActivity.recceSubmissions || 0}</Text>
                  </View>
                  <View style={{ flex: 1, backgroundColor: theme.colors.background, padding: 12, borderRadius: 8 }}>
                    <Text style={{ color: theme.colors.textSecondary, fontSize: 12 }}>Installations</Text>
                    <Text style={{ color: theme.colors.text, fontSize: 20, fontWeight: 'bold' }}>{dashboardData?.recentActivity.installations || 0}</Text>
                  </View>
                </View>
              </View>

              {/* Top Performers */}
              <View style={{ backgroundColor: theme.colors.surface, padding: 16, borderRadius: 12, borderWidth: 1, borderColor: theme.colors.border }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
                  <Award size={20} color={theme.colors.primary} />
                  <Text style={{ fontSize: 18, fontWeight: 'bold', color: theme.colors.text, marginLeft: 8 }}>Top Performers</Text>
                </View>
                <View style={{ gap: 16 }}>
                  <View>
                    <Text style={{ color: theme.colors.text, fontWeight: '600', marginBottom: 8 }}>Recce Team</Text>
                    {dashboardData?.topPerformers.recce.map((user, idx) => (
                      <View key={idx} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 6 }}>
                        <Text style={{ color: theme.colors.text, fontSize: 14 }}>{user.name}</Text>
                        <Text style={{ color: theme.colors.primary, fontSize: 14, fontWeight: 'bold' }}>{user.count} tasks</Text>
                      </View>
                    ))}
                  </View>
                  <View style={{ paddingTop: 16, borderTopWidth: 1, borderTopColor: theme.colors.border }}>
                    <Text style={{ color: theme.colors.text, fontWeight: '600', marginBottom: 8 }}>Installation Team</Text>
                    {dashboardData?.topPerformers.installation.map((user, idx) => (
                      <View key={idx} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 6 }}>
                        <Text style={{ color: theme.colors.text, fontSize: 14 }}>{user.name}</Text>
                        <Text style={{ color: '#10B981', fontSize: 14, fontWeight: 'bold' }}>{user.count} tasks</Text>
                      </View>
                    ))}
                  </View>
                </View>
              </View>

              {/* Top Cities */}
              <View style={{ backgroundColor: theme.colors.surface, padding: 16, borderRadius: 12, borderWidth: 1, borderColor: theme.colors.border }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
                  <MapPin size={20} color={theme.colors.primary} />
                  <Text style={{ fontSize: 18, fontWeight: 'bold', color: theme.colors.text, marginLeft: 8 }}>Top Cities</Text>
                </View>
                <View style={{ gap: 8 }}>
                  {dashboardData?.distribution.byCity.slice(0, 8).map((city, idx) => (
                    <View key={idx} style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                      <Text style={{ color: theme.colors.text, fontSize: 14, fontWeight: '600', width: 100 }}>{city._id || 'Unknown'}</Text>
                      <View style={{ flex: 1, height: 8, backgroundColor: theme.colors.border, borderRadius: 4 }}>
                        <View style={{ 
                          height: 8, 
                          backgroundColor: theme.colors.primary, 
                          borderRadius: 4,
                          width: `${(city.count / (dashboardData?.overview.totalStores || 1)) * 100}%`
                        }} />
                      </View>
                      <Text style={{ color: theme.colors.text, fontSize: 14, fontWeight: 'bold', width: 40, textAlign: 'right' }}>{city.count}</Text>
                    </View>
                  ))}
                </View>
              </View>
            </>
          ) : (
            /* USER DASHBOARD */
            <>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
                <StatCard icon={<Package size={20} color="#3B82F6" />} label="Total Assigned" value={dashboardData?.overview.totalAssigned || 0} color="#3B82F6" theme={theme} />
                <StatCard icon={<Clock size={20} color="#F59E0B" />} label="Pending" value={dashboardData?.overview.pending || 0} color="#F59E0B" theme={theme} />
                <StatCard icon={<CheckCircle size={20} color="#10B981" />} label="Completed" value={dashboardData?.overview.approved || dashboardData?.overview.completed || 0} color="#10B981" theme={theme} />
                <StatCard icon={<TrendingUp size={20} color="#8B5CF6" />} label="Success Rate" value={`${dashboardData?.overview.completionRate || 0}%`} color="#8B5CF6" theme={theme} />
              </View>

              <View style={{ backgroundColor: theme.colors.surface, padding: 16, borderRadius: 12, borderWidth: 1, borderColor: theme.colors.border }}>
                <Text style={{ fontSize: 18, fontWeight: 'bold', color: theme.colors.text, marginBottom: 16 }}>Task Breakdown</Text>
                <View style={{ gap: 12 }}>
                  <ProgressBar label="Pending" value={dashboardData?.overview.pending || 0} total={dashboardData?.overview.totalAssigned || 0} color="#F59E0B" theme={theme} />
                  <ProgressBar label="Submitted" value={dashboardData?.overview.submitted || 0} total={dashboardData?.overview.totalAssigned || 0} color="#3B82F6" theme={theme} />
                  {dashboardData?.overview.approved !== undefined && (
                    <ProgressBar label="Approved" value={dashboardData.overview.approved} total={dashboardData?.overview.totalAssigned || 0} color="#10B981" theme={theme} />
                  )}
                  {dashboardData?.overview.completed !== undefined && (
                    <ProgressBar label="Completed" value={dashboardData.overview.completed} total={dashboardData?.overview.totalAssigned || 0} color="#10B981" theme={theme} />
                  )}
                </View>
              </View>

              <View style={{ backgroundColor: theme.colors.surface, padding: 16, borderRadius: 12, borderWidth: 1, borderColor: theme.colors.border }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
                  <Activity size={20} color={theme.colors.primary} />
                  <Text style={{ fontSize: 18, fontWeight: 'bold', color: theme.colors.text, marginLeft: 8 }}>Recent Activity</Text>
                </View>
                <View style={{ backgroundColor: theme.colors.background, padding: 12, borderRadius: 8 }}>
                  <Text style={{ color: theme.colors.textSecondary, fontSize: 12 }}>Submissions (Last 7 Days)</Text>
                  <Text style={{ color: theme.colors.text, fontSize: 24, fontWeight: 'bold' }}>{dashboardData?.recentActivity.submissionsLast7Days || 0}</Text>
                </View>
              </View>

              {/* My Tasks */}
              <View style={{ backgroundColor: theme.colors.surface, padding: 16, borderRadius: 12, borderWidth: 1, borderColor: theme.colors.border }}>
                <Text style={{ fontSize: 18, fontWeight: 'bold', color: theme.colors.text, marginBottom: 16 }}>My Tasks</Text>
                <View style={{ gap: 12 }}>
                  {dashboardData?.myTasks && dashboardData.myTasks.length > 0 ? dashboardData.myTasks.map((task, idx) => {
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
            </>
          )}
        </View>
      </ScrollView>
    </View>
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