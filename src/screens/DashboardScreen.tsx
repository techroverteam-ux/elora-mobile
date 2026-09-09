import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl, TextInput } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import {
  BarChart3, TrendingUp, Users, Package, CheckCircle, Clock, Award, MapPin, Activity,
  Filter, X, LayoutGrid, ClipboardCheck, Wrench, Building2,
} from 'lucide-react-native';
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
    // undefined (not 0) means the backend didn't send this field — matches web's
    // `stats?.kpi?.totalClients !== undefined` guard for showing the KPI card at all.
    totalClients?: number;
  };
  zoneDistribution: Array<{ _id: string; count: number }>;
  recentStores: Array<{ _id: string; storeName: string; city: string; dealerCode: string; currentStatus: string }>;
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

  // Dashboard filters — mirrors elora-web's /dashboard/stats query params
  // (store/client/zone/state/city/district). Web also supports a date range,
  // but mobile has no date-picker dependency installed yet, so that's left out for now.
  const emptyFilters = { store: '', client: '', zone: '', state: '', city: '', district: '' };
  const [filters, setFilters] = useState(emptyFilters);
  const [appliedFilters, setAppliedFilters] = useState(emptyFilters);
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const activeFilterCount = Object.values(appliedFilters).filter(Boolean).length;

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
  }, [user, appliedFilters]);

  const applyFilters = () => {
    setAppliedFilters(filters);
    setShowFilterPanel(false);
  };

  const resetFilters = () => {
    setFilters(emptyFilters);
    setAppliedFilters(emptyFilters);
    setShowFilterPanel(false);
  };

  const fetchDashboardData = async () => {
    console.log('DashboardScreen: fetchDashboardData called');

    try {
      setLoading(true);
      const params: Record<string, string> = {};
      Object.entries(appliedFilters).forEach(([key, value]) => {
        if (value) params[key] = value;
      });
      const { data } = await api.get('/dashboard/stats', { params });
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
          completionRate: data?.kpi?.totalStores > 0 ? Math.round(((data?.kpi?.installationDoneTotal || 0) / data?.kpi?.totalStores) * 100) : 0,
          totalClients: data?.kpi?.totalClients
        },
        zoneDistribution: data?.zoneDistribution?.map((item: any) => ({ _id: item._id, count: item.count })) || [],
        recentStores: data?.recentStores?.map((store: any) => ({
          _id: store._id,
          storeName: store.storeName || 'Unnamed',
          city: store.location?.city || 'N/A',
          dealerCode: store.dealerCode,
          currentStatus: store.currentStatus
        })) || [],
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
        zoneDistribution: [],
        recentStores: [],
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
              {/* Filters (mirrors elora-web's Dashboard filter panel) */}
              <View style={{ gap: 12 }}>
                <TouchableOpacity
                  onPress={() => setShowFilterPanel(!showFilterPanel)}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    alignSelf: 'flex-start',
                    gap: 6,
                    paddingHorizontal: 14,
                    paddingVertical: 9,
                    borderRadius: 999,
                    borderWidth: 1,
                    borderColor: activeFilterCount > 0 ? theme.colors.primary : theme.colors.border,
                    backgroundColor: theme.colors.surface,
                  }}
                >
                  <Filter size={15} color={activeFilterCount > 0 ? theme.colors.primary : theme.colors.text} />
                  <Text style={{ color: activeFilterCount > 0 ? theme.colors.primary : theme.colors.text, fontWeight: '600', fontSize: 13 }}>Filters</Text>
                  {activeFilterCount > 0 && (
                    <View style={{ backgroundColor: theme.colors.primary, borderRadius: 10, minWidth: 18, height: 18, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 4 }}>
                      <Text style={{ color: '#FFF', fontSize: 11, fontWeight: '700' }}>{activeFilterCount}</Text>
                    </View>
                  )}
                </TouchableOpacity>

                {showFilterPanel && (
                  <Card theme={theme} style={{ gap: 10 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Text style={{ fontSize: 15, fontWeight: '700', color: theme.colors.text }}>Filter Dashboard</Text>
                      <TouchableOpacity onPress={() => setShowFilterPanel(false)}>
                        <X size={18} color={theme.colors.textSecondary} />
                      </TouchableOpacity>
                    </View>

                    {[
                      { key: 'store', label: 'Store Name/Code' },
                      { key: 'client', label: 'Client Code' },
                      { key: 'zone', label: 'Zone' },
                      { key: 'state', label: 'State' },
                      { key: 'city', label: 'City' },
                      { key: 'district', label: 'District' },
                    ].map(({ key, label }) => (
                      <TextInput
                        key={key}
                        placeholder={label}
                        placeholderTextColor={theme.colors.textSecondary}
                        value={(filters as any)[key]}
                        onChangeText={(text) => setFilters(prev => ({ ...prev, [key]: text }))}
                        style={{
                          borderWidth: 1,
                          borderColor: theme.colors.border,
                          borderRadius: 10,
                          paddingHorizontal: 14,
                          paddingVertical: 11,
                          color: theme.colors.text,
                          fontSize: 14,
                          backgroundColor: theme.colors.background,
                        }}
                      />
                    ))}

                    <View style={{ flexDirection: 'row', gap: 10, marginTop: 4 }}>
                      <TouchableOpacity
                        onPress={resetFilters}
                        style={{ flex: 1, paddingVertical: 12, borderRadius: 10, alignItems: 'center', backgroundColor: theme.colors.background, borderWidth: 1, borderColor: theme.colors.border }}
                      >
                        <Text style={{ color: theme.colors.text, fontWeight: '600' }}>Reset</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={applyFilters}
                        style={{ flex: 1, paddingVertical: 12, borderRadius: 10, alignItems: 'center', backgroundColor: theme.colors.primary }}
                      >
                        <Text style={{ color: '#FFF', fontWeight: '700' }}>Apply</Text>
                      </TouchableOpacity>
                    </View>
                  </Card>
                )}
              </View>

              {/* Overview Cards */}
              <View style={{ gap: 12 }}>
                <SectionHeader icon={<LayoutGrid size={18} color={theme.colors.primary} />} title="Overview" theme={theme} />
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
                  <StatCard icon={<Package size={19} color="#3B82F6" />} label="Total Stores" value={dashboardData?.overview.totalStores || 0} color="#3B82F6" theme={theme} />
                  {dashboardData?.overview.totalClients !== undefined && (
                    <StatCard icon={<Building2 size={19} color="#8B5CF6" />} label="Total Clients" value={dashboardData.overview.totalClients} color="#8B5CF6" theme={theme} />
                  )}
                  <StatCard icon={<Users size={19} color="#10B981" />} label="Active Users" value={dashboardData?.overview.activeUsers || 0} color="#10B981" theme={theme} />
                  <StatCard icon={<Clock size={19} color="#F59E0B" />} label="Recce Pending" value={dashboardData?.recce.assigned || 0} color="#F59E0B" theme={theme} />
                  <StatCard icon={<CheckCircle size={19} color="#10B981" />} label="Completed" value={dashboardData?.installation.completed || 0} color="#10B981" theme={theme} />
                </View>
              </View>

              {/* Recce Operations */}
              <Card theme={theme}>
                <SectionHeader icon={<ClipboardCheck size={18} color="#3B82F6" />} title="Recce Operations" theme={theme} />

                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 20, marginBottom: 20 }}>
                  <RadialProgress
                    percentage={dashboardData?.recce.completionRate || 0}
                    color="#3B82F6"
                    theme={theme}
                    sublabel="Approved"
                  />
                  <View style={{ flex: 1, gap: 10 }}>
                    <MiniBar label="Assigned" value={dashboardData?.recce.assigned || 0} color="#3B82F6" theme={theme} />
                    <MiniBar label="Submitted" value={dashboardData?.recce.submitted || 0} color="#F59E0B" theme={theme} />
                    <MiniBar label="Approved" value={dashboardData?.recce.approved || 0} color="#10B981" theme={theme} />
                    <MiniBar label="Rejected" value={dashboardData?.recce.rejected || 0} color="#EF4444" theme={theme} />
                  </View>
                </View>

                <View style={{ gap: 10 }}>
                  <ProgressBar label="Assigned" value={dashboardData?.recce.assigned || 0} total={dashboardData?.recce.total || 0} color="#3B82F6" theme={theme} />
                  <ProgressBar label="Submitted" value={dashboardData?.recce.submitted || 0} total={dashboardData?.recce.total || 0} color="#F59E0B" theme={theme} />
                  <ProgressBar label="Approved" value={dashboardData?.recce.approved || 0} total={dashboardData?.recce.total || 0} color="#10B981" theme={theme} />
                </View>
              </Card>

              {/* Installation Operations */}
              <Card theme={theme}>
                <SectionHeader icon={<Wrench size={18} color="#10B981" />} title="Installation Operations" theme={theme} />

                <View style={{ alignItems: 'center', marginBottom: 20 }}>
                  <RadialProgress
                    percentage={dashboardData?.installation.completionRate || 0}
                    color="#10B981"
                    theme={theme}
                    size={128}
                    sublabel="Complete"
                  />
                </View>

                <View style={{ gap: 10 }}>
                  <ProgressBar label="Assigned" value={dashboardData?.installation.assigned || 0} total={dashboardData?.installation.total || 0} color="#F97316" theme={theme} />
                  <ProgressBar label="Submitted" value={dashboardData?.installation.submitted || 0} total={dashboardData?.installation.total || 0} color="#3B82F6" theme={theme} />
                  <ProgressBar label="Completed" value={dashboardData?.installation.completed || 0} total={dashboardData?.installation.total || 0} color="#10B981" theme={theme} />
                </View>
              </Card>

              {/* Recent Activity */}
              <Card theme={theme}>
                <SectionHeader icon={<Activity size={18} color={theme.colors.primary} />} title="Recent Activity" subtitle="Last 7 days" theme={theme} />
                <View style={{ flexDirection: 'row', gap: 12 }}>
                  <MiniStatTile label="New Stores" value={dashboardData?.recentActivity.newStores || 0} color="#3B82F6" theme={theme} />
                  <MiniStatTile label="Recce Submissions" value={dashboardData?.recentActivity.recceSubmissions || 0} color="#F59E0B" theme={theme} />
                  <MiniStatTile label="Installations" value={dashboardData?.recentActivity.installations || 0} color="#10B981" theme={theme} />
                </View>
              </Card>

              {/* Top Performers */}
              <Card theme={theme}>
                <SectionHeader icon={<Award size={18} color={theme.colors.primary} />} title="Top Performers" theme={theme} />
                <View style={{ gap: 18 }}>
                  <View style={{ gap: 4 }}>
                    <Text style={{ color: theme.colors.textSecondary, fontWeight: '700', fontSize: 12, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>Recce Team</Text>
                    {dashboardData?.topPerformers.recce.length ? dashboardData.topPerformers.recce.map((person, idx) => (
                      <PerformerRow key={idx} name={person.name} count={person.count} color="#3B82F6" theme={theme} />
                    )) : (
                      <Text style={{ color: theme.colors.textSecondary, fontSize: 13, paddingVertical: 8 }}>No data available</Text>
                    )}
                  </View>
                  <View style={{ gap: 4, paddingTop: 14, borderTopWidth: 1, borderTopColor: theme.colors.border }}>
                    <Text style={{ color: theme.colors.textSecondary, fontWeight: '700', fontSize: 12, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>Installation Team</Text>
                    {dashboardData?.topPerformers.installation.length ? dashboardData.topPerformers.installation.map((person, idx) => (
                      <PerformerRow key={idx} name={person.name} count={person.count} color="#10B981" theme={theme} />
                    )) : (
                      <Text style={{ color: theme.colors.textSecondary, fontSize: 13, paddingVertical: 8 }}>No data available</Text>
                    )}
                  </View>
                </View>
              </Card>

              {/* Top States (backend only provides state-level distribution — this was
                  mislabeled "Top Cities" even though it renders stateDistribution data) */}
              <Card theme={theme}>
                <SectionHeader icon={<MapPin size={18} color={theme.colors.primary} />} title="Top States" theme={theme} />
                <View style={{ gap: 12 }}>
                  {dashboardData?.distribution.byCity.length ? dashboardData.distribution.byCity.slice(0, 8).map((city, idx) => (
                    <RankedBar key={idx} rank={idx + 1} label={city._id || 'Unknown'} value={city.count} total={dashboardData?.overview.totalStores || 1} color={theme.colors.primary} theme={theme} />
                  )) : (
                    <Text style={{ color: theme.colors.textSecondary, textAlign: 'center', paddingVertical: 16 }}>No data available</Text>
                  )}
                </View>
              </Card>

              {/* Zone Distribution */}
              <Card theme={theme}>
                <SectionHeader icon={<BarChart3 size={18} color="#F59E0B" />} title="Zone Distribution" theme={theme} />
                <View style={{ gap: 12 }}>
                  {dashboardData?.zoneDistribution && dashboardData.zoneDistribution.length > 0 ? dashboardData.zoneDistribution.map((zone, idx) => (
                    <RankedBar key={idx} rank={idx + 1} label={zone._id || 'N/A'} value={zone.count} total={dashboardData?.overview.totalStores || 1} color="#F59E0B" theme={theme} />
                  )) : (
                    <Text style={{ color: theme.colors.textSecondary, textAlign: 'center', paddingVertical: 16 }}>No data available</Text>
                  )}
                </View>
              </Card>

              {/* Recent Stores (web shows this to all users; mobile previously only rendered
                  the equivalent data in the non-admin "My Tasks" section, so admins saw nothing) */}
              <Card theme={theme}>
                <SectionHeader icon={<Building2 size={18} color={theme.colors.primary} />} title="Recent Stores" theme={theme} />
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
                  {dashboardData?.recentStores && dashboardData.recentStores.length > 0 ? dashboardData.recentStores.map((store) => (
                    <View key={store._id} style={{ width: '47%', backgroundColor: theme.colors.background, padding: 14, borderRadius: 14, borderWidth: 1, borderColor: theme.colors.border, gap: 6 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                        <MapPin size={13} color={theme.colors.primary} />
                        <Text style={{ flex: 1, color: theme.colors.text, fontWeight: '700', fontSize: 13 }} numberOfLines={1}>{store.storeName}</Text>
                      </View>
                      <Text style={{ color: theme.colors.textSecondary, fontSize: 12 }} numberOfLines={1}>{store.city} • {store.dealerCode}</Text>
                      <StatusPill status={store.currentStatus} />
                    </View>
                  )) : (
                    <Text style={{ color: theme.colors.textSecondary, textAlign: 'center', paddingVertical: 16, width: '100%' }}>No recent stores</Text>
                  )}
                </View>
              </Card>
            </>
          ) : (
            /* USER DASHBOARD */
            <>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
                <StatCard icon={<Package size={19} color="#3B82F6" />} label="Total Assigned" value={dashboardData?.overview.totalAssigned || 0} color="#3B82F6" theme={theme} />
                <StatCard icon={<Clock size={19} color="#F59E0B" />} label="Pending" value={dashboardData?.overview.pending || 0} color="#F59E0B" theme={theme} />
                <StatCard icon={<CheckCircle size={19} color="#10B981" />} label="Completed" value={dashboardData?.overview.approved || dashboardData?.overview.completed || 0} color="#10B981" theme={theme} />
                <StatCard icon={<TrendingUp size={19} color="#8B5CF6" />} label="Success Rate" value={`${dashboardData?.overview.completionRate || 0}%`} color="#8B5CF6" theme={theme} />
              </View>

              <Card theme={theme}>
                <SectionHeader icon={<LayoutGrid size={18} color={theme.colors.primary} />} title="Task Breakdown" theme={theme} />
                <View style={{ gap: 14 }}>
                  <ProgressBar label="Pending" value={dashboardData?.overview.pending || 0} total={dashboardData?.overview.totalAssigned || 0} color="#F59E0B" theme={theme} />
                  <ProgressBar label="Submitted" value={dashboardData?.overview.submitted || 0} total={dashboardData?.overview.totalAssigned || 0} color="#3B82F6" theme={theme} />
                  {dashboardData?.overview.approved !== undefined && (
                    <ProgressBar label="Approved" value={dashboardData.overview.approved} total={dashboardData?.overview.totalAssigned || 0} color="#10B981" theme={theme} />
                  )}
                  {dashboardData?.overview.completed !== undefined && (
                    <ProgressBar label="Completed" value={dashboardData.overview.completed} total={dashboardData?.overview.totalAssigned || 0} color="#10B981" theme={theme} />
                  )}
                </View>
              </Card>

              <Card theme={theme}>
                <SectionHeader icon={<Activity size={18} color={theme.colors.primary} />} title="Recent Activity" theme={theme} />
                <View style={{ backgroundColor: theme.colors.background, padding: 14, borderRadius: 12 }}>
                  <Text style={{ color: theme.colors.textSecondary, fontSize: 12 }}>Submissions (Last 7 Days)</Text>
                  <Text style={{ color: theme.colors.text, fontSize: 26, fontWeight: '800', marginTop: 2 }}>{dashboardData?.recentActivity.submissionsLast7Days || 0}</Text>
                </View>
              </Card>

              {/* My Tasks */}
              <Card theme={theme}>
                <SectionHeader icon={<ClipboardCheck size={18} color={theme.colors.primary} />} title="My Tasks" theme={theme} />
                <View style={{ gap: 12 }}>
                  {dashboardData?.myTasks && dashboardData.myTasks.length > 0 ? dashboardData.myTasks.map((task, idx) => {
                    const location = [task.city, task.district, task.state].filter(Boolean).join(', ') || 'N/A';
                    return (
                      <View key={idx} style={{ backgroundColor: theme.colors.background, padding: 14, borderRadius: 12, borderWidth: 1, borderColor: theme.colors.border }}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                          <View style={{ flex: 1 }}>
                            <Text style={{ color: theme.colors.text, fontWeight: '700', fontSize: 15 }}>{task.storeName}</Text>
                            <Text style={{ color: theme.colors.textSecondary, fontSize: 13, marginTop: 3 }}>{location}</Text>
                          </View>
                          <View style={{ alignItems: 'flex-end', gap: 4 }}>
                            <StatusPill status={task.status} />
                            <Text style={{ color: theme.colors.textSecondary, fontSize: 11 }}>
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
              </Card>
            </>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

// ---- Shared presentation primitives ---------------------------------------

function Card({ children, theme, style }: any) {
  return (
    <View style={[{ backgroundColor: theme.colors.surface, borderRadius: 16, borderWidth: 1, borderColor: theme.colors.border, padding: 18 }, style]}>
      {children}
    </View>
  );
}

function SectionHeader({ icon, title, subtitle, theme, right }: any) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        {icon}
        <View>
          <Text style={{ fontSize: 16, fontWeight: '700', color: theme.colors.text }}>{title}</Text>
          {subtitle ? <Text style={{ fontSize: 11, color: theme.colors.textSecondary, marginTop: 1 }}>{subtitle}</Text> : null}
        </View>
      </View>
      {right}
    </View>
  );
}

function StatCard({ icon, label, value, color, theme }: any) {
  return (
    <View style={{
      backgroundColor: theme.colors.surface,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: theme.colors.border,
      padding: 16,
      minWidth: 152,
      flex: 1,
      gap: 12,
    }}>
      <View style={{ width: 38, height: 38, borderRadius: 19, backgroundColor: color + '18', alignItems: 'center', justifyContent: 'center' }}>
        {icon}
      </View>
      <View>
        <Text style={{ color: theme.colors.text, fontSize: 22, fontWeight: '800' }}>{value}</Text>
        <Text style={{ color: theme.colors.textSecondary, fontSize: 12, marginTop: 2 }}>{label}</Text>
      </View>
    </View>
  );
}

function ProgressBar({ label, value, total, color, theme }: any) {
  const percentage = total > 0 ? Math.min(100, (value / total) * 100) : 0;

  return (
    <View style={{ gap: 6 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <Text style={{ color: theme.colors.textSecondary, fontSize: 13, fontWeight: '600' }}>{label}</Text>
        <Text style={{ color: theme.colors.text, fontSize: 13, fontWeight: '700' }}>{value}</Text>
      </View>
      <View style={{ height: 8, backgroundColor: theme.colors.border, borderRadius: 999, overflow: 'hidden' }}>
        <View style={{ height: '100%', width: `${percentage}%`, backgroundColor: color, borderRadius: 999 }} />
      </View>
    </View>
  );
}

// Compact inline bar used next to the Recce radial progress — same data as the
// full-width ProgressBars below it, just a denser at-a-glance readout.
function MiniBar({ label, value, color, theme }: any) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
      <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: color }} />
      <Text style={{ flex: 1, color: theme.colors.textSecondary, fontSize: 12 }}>{label}</Text>
      <Text style={{ color: theme.colors.text, fontSize: 13, fontWeight: '700' }}>{value}</Text>
    </View>
  );
}

function MiniStatTile({ label, value, color, theme }: any) {
  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background, padding: 14, borderRadius: 12, gap: 4 }}>
      <Text style={{ color: theme.colors.textSecondary, fontSize: 11 }}>{label}</Text>
      <Text style={{ color: color || theme.colors.text, fontSize: 22, fontWeight: '800' }}>{value}</Text>
    </View>
  );
}

function PerformerRow({ name, count, color, theme }: any) {
  const initial = (name || '?').charAt(0).toUpperCase();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 6, gap: 10 }}>
      <View style={{ width: 30, height: 30, borderRadius: 15, backgroundColor: color + '20', alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ color, fontSize: 13, fontWeight: '700' }}>{initial}</Text>
      </View>
      <Text style={{ flex: 1, color: theme.colors.text, fontSize: 14 }}>{name}</Text>
      <Text style={{ color, fontSize: 13, fontWeight: '700' }}>{count} tasks</Text>
    </View>
  );
}

// A labeled bar with a small rank badge — used for both the Top States and Zone
// Distribution lists, which are structurally identical (label + count out of a total).
function RankedBar({ rank, label, value, total, color, theme }: any) {
  const percentage = total > 0 ? Math.min(100, (value / total) * 100) : 0;
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
      <View style={{ width: 20, height: 20, borderRadius: 10, backgroundColor: theme.colors.background, alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ color: theme.colors.textSecondary, fontSize: 10, fontWeight: '700' }}>{rank}</Text>
      </View>
      <Text style={{ color: theme.colors.text, fontSize: 13, fontWeight: '600', width: 84 }} numberOfLines={1}>{label}</Text>
      <View style={{ flex: 1, height: 8, backgroundColor: theme.colors.border, borderRadius: 999, overflow: 'hidden' }}>
        <View style={{ height: '100%', width: `${percentage}%`, backgroundColor: color, borderRadius: 999 }} />
      </View>
      <Text style={{ color: theme.colors.text, fontSize: 13, fontWeight: '700', width: 32, textAlign: 'right' }}>{value}</Text>
    </View>
  );
}

// Status → color mapping shared by the Recent Stores grid and My Tasks list.
// Handles both the store lifecycle values (RECCE_ASSIGNED, INSTALLATION_APPROVED, ...)
// and the shorter values used elsewhere (APPROVED, SUBMITTED, COMPLETED).
function getStatusColor(status?: string) {
  const s = status || '';
  if (s.includes('REJECTED')) return '#EF4444';
  if (s === 'COMPLETED' || s.includes('APPROVED')) return '#10B981';
  if (s.includes('SUBMITTED')) return '#F59E0B';
  if (s.includes('ASSIGNED')) return '#3B82F6';
  return '#6B7280';
}

function StatusPill({ status }: { status?: string }) {
  const color = getStatusColor(status);
  return (
    <View style={{ alignSelf: 'flex-start', backgroundColor: color + '20', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 999 }}>
      <Text style={{ color, fontSize: 10, fontWeight: '700' }}>{(status || '-').replace(/_/g, ' ')}</Text>
    </View>
  );
}

// Real circular progress (SVG arc) — replaces the old "rotate a solid circle by
// degrees" and multi-border "donut" tricks, neither of which actually rendered
// an accurate percentage.
function RadialProgress({ percentage, color, theme, size = 108, strokeWidth = 11, sublabel }: any) {
  const clamped = Math.max(0, Math.min(100, percentage || 0));
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (clamped / 100) * circumference;
  const center = size / 2;

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size}>
        <Circle cx={center} cy={center} r={radius} stroke={theme.colors.border} strokeWidth={strokeWidth} fill="none" />
        <Circle
          cx={center}
          cy={center}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={`${circumference}, ${circumference}`}
          strokeDashoffset={offset}
          strokeLinecap="round"
          rotation="-90"
          origin={`${center}, ${center}`}
        />
      </Svg>
      <View style={{ position: 'absolute', alignItems: 'center' }}>
        <Text style={{ fontSize: size * 0.19, fontWeight: '800', color: theme.colors.text }}>{Math.round(clamped)}%</Text>
        {sublabel ? <Text style={{ fontSize: 10, color: theme.colors.textSecondary, marginTop: 1 }}>{sublabel}</Text> : null}
      </View>
    </View>
  );
}
