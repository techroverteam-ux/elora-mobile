import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  TextInput,
  Modal,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import {
  Users, Package, CheckCircle2, Clock, MapPin, SlidersHorizontal, X, ClipboardCheck,
  Wrench, Building2, Store, FileBarChart, ChevronRight, Trophy, CalendarDays, Sparkles,
} from 'lucide-react-native';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import api from '../lib/api';
import Toast from 'react-native-toast-message';
import { Skeleton } from '../components/PageSkeleton';
import Header from '../components/Header';

// ---------------------------------------------------------------------------
// Data shape — unchanged from the previous version, so the API contract with
// GET /dashboard/stats is identical.
// ---------------------------------------------------------------------------
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
    // `stats?.kpi?.totalClients !== undefined` guard.
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
    storeId?: string;
    storeName: string;
    city: string;
    district: string;
    state: string;
    status: string;
    assignedDate: string;
  }>;
}

const EMPTY_DATA: DashboardData = {
  overview: { totalStores: 0, activeUsers: 0, totalAssigned: 0, pending: 0, submitted: 0, approved: 0, completed: 0, completionRate: 0 },
  zoneDistribution: [],
  recentStores: [],
  recce: { total: 0, assigned: 0, submitted: 0, approved: 0, rejected: 0, completionRate: 0 },
  installation: { total: 0, assigned: 0, submitted: 0, completed: 0, completionRate: 0 },
  recentActivity: { newStores: 0, recceSubmissions: 0, installations: 0, submissionsLast7Days: 0 },
  topPerformers: { recce: [], installation: [] },
  distribution: { byCity: [] },
  myTasks: [],
};

// Fixed semantic palette for the store pipeline. Brand yellow stays reserved
// for "primary action / hero"; the pipeline stages get their own hues so the
// same color always means the same stage across every card on this screen.
const STAGE = {
  pending: '#94A3B8',
  recce: '#3B82F6',
  install: '#10B981',
  warn: '#F59E0B',
  danger: '#EF4444',
  violet: '#8B5CF6',
};

const FILTER_FIELDS = [
  { key: 'store', label: 'Store name / code' },
  { key: 'client', label: 'Client code' },
  { key: 'zone', label: 'Zone' },
  { key: 'state', label: 'State' },
  { key: 'city', label: 'City' },
  { key: 'district', label: 'District' },
] as const;

// Last successful (unfiltered) dashboard per user. The app's hand-rolled
// router unmounts the Dashboard whenever you leave it, so without this every
// return showed the loading skeleton again. Now we show the cached numbers
// instantly and refresh quietly in the background.
let dashboardCache: { userKey: string; data: DashboardData } | null = null;

type Props = {
  onMenuPress: () => void;
  onProfilePress?: () => void;
  // Optional so the screen still works if a caller doesn't pass it.
  onNavigate?: (screen: string, params?: any) => void;
};

export default function DashboardScreen({ onMenuPress, onProfilePress, onNavigate }: Props) {
  const { theme, darkMode } = useTheme();
  const { user } = useAuth();
  const c = theme.colors;

  const userKey = String((user as any)?._id || (user as any)?.id || user?.email || '');
  const cached = dashboardCache && dashboardCache.userKey === userKey ? dashboardCache.data : null;
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(cached);
  const [loading, setLoading] = useState(!cached);
  const [refreshing, setRefreshing] = useState(false);

  // Filters — mirror elora-web's /dashboard/stats query params.
  const emptyFilters = { store: '', client: '', zone: '', state: '', city: '', district: '' };
  const [filters, setFilters] = useState(emptyFilters);
  const [appliedFilters, setAppliedFilters] = useState(emptyFilters);
  const [showFilterSheet, setShowFilterSheet] = useState(false);
  const activeFilterCount = Object.values(appliedFilters).filter(Boolean).length;

  const [performerTab, setPerformerTab] = useState<'recce' | 'installation'>('recce');
  const [distTab, setDistTab] = useState<'state' | 'zone'>('state');

  const isAdmin = useMemo(() => {
    if (!user || !user.roles || !Array.isArray(user.roles)) return false;
    return user.roles.some((role: any) => role?.code === 'SUPER_ADMIN' || role?.code === 'ADMIN');
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
    // Depend on the user's id, not the user object: AuthContext can hand us a
    // new object with the same user (e.g. after a token refresh), which used
    // to trigger an extra reload.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userKey, appliedFilters]);

  const applyFilters = () => {
    setAppliedFilters(filters);
    setShowFilterSheet(false);
  };

  const resetFilters = () => {
    setFilters(emptyFilters);
    setAppliedFilters(emptyFilters);
    setShowFilterSheet(false);
  };

  const fetchDashboardData = async () => {
    try {
      if (!refreshing) setLoading(true);
      const params: Record<string, string> = {};
      Object.entries(appliedFilters).forEach(([key, value]) => {
        if (value) params[key] = value;
      });
      const { data } = await api.get('/dashboard/stats', { params });
      const kpi = data?.kpi || {};
      const totalStores = kpi.totalStores || 0;
      const recceDone = kpi.recceDoneTotal || 0;
      const installDone = kpi.installationDoneTotal || 0;

      const mappedData: DashboardData = {
        overview: {
          totalStores,
          activeUsers: kpi.activeUsers || 0,
          totalAssigned: totalStores,
          pending: Math.max(0, totalStores - recceDone),
          submitted: recceDone,
          approved: recceDone,
          completed: installDone,
          completionRate: totalStores > 0 ? Math.round((installDone / totalStores) * 100) : 0,
          totalClients: kpi.totalClients,
        },
        zoneDistribution: data?.zoneDistribution?.map((item: any) => ({ _id: item._id, count: item.count })) || [],
        recentStores: data?.recentStores?.map((store: any) => ({
          _id: store._id,
          storeName: store.storeName || 'Unnamed',
          city: store.location?.city || 'N/A',
          dealerCode: store.dealerCode,
          currentStatus: store.currentStatus,
        })) || [],
        recce: {
          total: totalStores,
          assigned: totalStores,
          submitted: recceDone,
          approved: recceDone,
          rejected: 0,
          completionRate: totalStores > 0 ? Math.round((recceDone / totalStores) * 100) : 0,
        },
        installation: {
          total: recceDone,
          assigned: recceDone,
          submitted: installDone,
          completed: installDone,
          completionRate: recceDone > 0 ? Math.round((installDone / recceDone) * 100) : 0,
        },
        recentActivity: {
          newStores: kpi.newStoresToday || 0,
          recceSubmissions: kpi.recceDoneToday || 0,
          installations: kpi.installationDoneToday || 0,
          submissionsLast7Days: kpi.recceDoneToday || 0,
        },
        topPerformers: {
          recce: data?.personnelStats?.filter((p: any) => p.role === 'RECCE')?.map((p: any) => ({ name: p.name, count: p.completedCount })) || [],
          installation: data?.personnelStats?.filter((p: any) => p.role === 'INSTALLATION')?.map((p: any) => ({ name: p.name, count: p.completedCount })) || [],
        },
        distribution: {
          // Backend only provides state-level distribution (see audit, Session 2).
          byCity: data?.stateDistribution?.map((item: any) => ({ _id: item._id, count: item.count })) || [],
        },
        myTasks: data?.recentStores?.map((store: any) => ({
          storeId: store._id,
          storeName: store.storeName,
          city: store.location?.city || '',
          district: store.location?.district || '',
          state: store.location?.state || '',
          status: store.currentStatus,
          assignedDate: store.createdAt || '',
        })) || [],
      };

      setDashboardData(mappedData);
      if (userKey && !Object.values(appliedFilters).some(Boolean)) {
        dashboardCache = { userKey, data: mappedData };
      }
    } catch (error: any) {
      console.error('DashboardScreen: Error fetching dashboard data', error);
      if (error.response?.status === 401) {
        Toast.show({ type: 'error', text1: 'Authentication required', text2: 'Please login again' });
      } else if (error.response?.status === 404) {
        Toast.show({ type: 'error', text1: 'Dashboard endpoint not found' });
      } else {
        Toast.show({ type: 'error', text1: 'Failed to load dashboard data' });
      }
      // Keep showing the last good numbers if we have them.
      setDashboardData(prev => prev || EMPTY_DATA);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const d = dashboardData || EMPTY_DATA;
  const firstName = (user?.name || '').trim().split(' ')[0] || 'there';
  const roleLabel = (user?.roles?.[0] as any)?.name || (user?.roles?.[0] as any)?.code || 'Member';
  const openStore = (storeId?: string) => {
    if (storeId && onNavigate) onNavigate('StoreDetail', { storeId });
  };

  const surfaceAlt = darkMode ? '#0F172A' : '#F8FAFC';

  return (
    <View style={{ flex: 1, backgroundColor: surfaceAlt }}>
      <Header onMenuPress={onMenuPress} onProfilePress={onProfilePress} hasNotifications={true} />

      {loading && !dashboardData ? (
        <DashboardSkeleton />
      ) : (
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 32 }}
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              fetchDashboardData();
            }}
            colors={[c.primary]}
            tintColor={c.primary}
          />
        }
      >
        {/* ---------- Greeting ---------- */}
        <View style={styles.greetingRow}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.greetingDate, { color: c.textSecondary }]}>{formatToday()}</Text>
            <Text style={[styles.greetingTitle, { color: c.text }]} numberOfLines={1}>
              {greeting()}, {firstName}
            </Text>
            <View style={[styles.roleChip, { backgroundColor: c.primary + '22' }]}>
              <Text style={[styles.roleChipText, { color: darkMode ? c.primaryLight : '#92400E' }]}>{String(roleLabel).replace(/_/g, ' ')}</Text>
            </View>
          </View>

          {isAdmin && (
            <TouchableOpacity
              onPress={() => {
                setFilters(appliedFilters);
                setShowFilterSheet(true);
              }}
              activeOpacity={0.8}
              style={[
                styles.filterBtn,
                {
                  backgroundColor: activeFilterCount > 0 ? c.primary : c.surface,
                  borderColor: activeFilterCount > 0 ? c.primary : c.border,
                },
              ]}
            >
              <SlidersHorizontal size={18} color={activeFilterCount > 0 ? '#1E293B' : c.text} />
              {activeFilterCount > 0 && (
                <View style={styles.filterBadge}>
                  <Text style={styles.filterBadgeText}>{activeFilterCount}</Text>
                </View>
              )}
            </TouchableOpacity>
          )}
        </View>

        {/* Active filter chips */}
        {isAdmin && activeFilterCount > 0 && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
            {FILTER_FIELDS.filter(f => (appliedFilters as any)[f.key]).map(f => (
              <TouchableOpacity
                key={f.key}
                onPress={() => {
                  const next = { ...appliedFilters, [f.key]: '' };
                  setAppliedFilters(next);
                  setFilters(next);
                }}
                style={[styles.chip, { backgroundColor: c.surface, borderColor: c.border }]}
              >
                <Text style={{ color: c.textSecondary, fontSize: 12 }}>{f.label.split(' ')[0]}:</Text>
                <Text style={{ color: c.text, fontSize: 12, fontWeight: '700' }}>{(appliedFilters as any)[f.key]}</Text>
                <X size={12} color={c.textSecondary} />
              </TouchableOpacity>
            ))}
            <TouchableOpacity onPress={resetFilters} style={[styles.chip, { borderColor: 'transparent' }]}>
              <Text style={{ color: STAGE.danger, fontSize: 12, fontWeight: '700' }}>Clear all</Text>
            </TouchableOpacity>
          </ScrollView>
        )}

        <View style={styles.body}>
          {isAdmin ? (
            <>
              {/* ---------- Hero: store pipeline ---------- */}
              <PipelineHero
                total={d.overview.totalStores}
                pending={d.overview.pending}
                recceDone={Math.max(0, d.recce.submitted - d.installation.completed)}
                installed={d.installation.completed}
                rate={d.overview.completionRate}
                theme={theme}
              />

              {/* ---------- Today ---------- */}
              <View>
                <SectionTitle icon={<CalendarDays size={16} color={c.textSecondary} />} title="Today" theme={theme} />
                <View style={styles.row}>
                  <TodayTile label="New stores" value={d.recentActivity.newStores} color={STAGE.violet} theme={theme} />
                  <TodayTile label="Recce done" value={d.recentActivity.recceSubmissions} color={STAGE.recce} theme={theme} />
                  <TodayTile label="Installed" value={d.recentActivity.installations} color={STAGE.install} theme={theme} />
                </View>
              </View>

              {/* ---------- Quick actions ---------- */}
              {onNavigate && (
                <View>
                  <SectionTitle icon={<Sparkles size={16} color={c.textSecondary} />} title="Quick actions" theme={theme} />
                  <View style={styles.row}>
                    <QuickAction label="Stores" icon={<Store size={20} color={STAGE.violet} />} tint={STAGE.violet} onPress={() => onNavigate('Stores')} theme={theme} />
                    <QuickAction label="Recce" icon={<ClipboardCheck size={20} color={STAGE.recce} />} tint={STAGE.recce} onPress={() => onNavigate('Recce')} theme={theme} />
                    <QuickAction label="Install" icon={<Wrench size={20} color={STAGE.install} />} tint={STAGE.install} onPress={() => onNavigate('Installation')} theme={theme} />
                    <QuickAction label="Reports" icon={<FileBarChart size={20} color={STAGE.warn} />} tint={STAGE.warn} onPress={() => onNavigate('Reports')} theme={theme} />
                  </View>
                </View>
              )}

              {/* ---------- KPI grid ---------- */}
              <View style={styles.grid}>
                <KpiCard icon={<Package size={18} color={STAGE.violet} />} tint={STAGE.violet} label="Total stores" value={d.overview.totalStores} theme={theme} />
                {d.overview.totalClients !== undefined && (
                  <KpiCard icon={<Building2 size={18} color="#0EA5E9" />} tint="#0EA5E9" label="Clients" value={d.overview.totalClients} theme={theme} />
                )}
                <KpiCard icon={<Users size={18} color={STAGE.install} />} tint={STAGE.install} label="Active users" value={d.overview.activeUsers} theme={theme} />
                <KpiCard icon={<Clock size={18} color={STAGE.warn} />} tint={STAGE.warn} label="Awaiting recce" value={d.overview.pending} theme={theme} />
              </View>

              {/* ---------- Stage cards ---------- */}
              <StageCard
                title="Recce"
                icon={<ClipboardCheck size={18} color={STAGE.recce} />}
                color={STAGE.recce}
                rate={d.recce.completionRate}
                done={d.recce.submitted}
                of={d.recce.total}
                doneLabel="Recce done"
                pendingLabel="Awaiting recce"
                onPress={onNavigate ? () => onNavigate('Recce') : undefined}
                theme={theme}
              />
              <StageCard
                title="Installation"
                icon={<Wrench size={18} color={STAGE.install} />}
                color={STAGE.install}
                rate={d.installation.completionRate}
                done={d.installation.completed}
                of={d.installation.total}
                doneLabel="Installed"
                pendingLabel="Ready to install"
                onPress={onNavigate ? () => onNavigate('Installation') : undefined}
                theme={theme}
              />

              {/* ---------- Top performers ---------- */}
              <Card theme={theme}>
                <CardHeader icon={<Trophy size={18} color={c.primary} />} title="Top performers" theme={theme} />
                <Segmented
                  options={[{ key: 'recce', label: 'Recce team' }, { key: 'installation', label: 'Installation team' }]}
                  value={performerTab}
                  onChange={(v: string) => setPerformerTab(v as any)}
                  theme={theme}
                />
                <View style={{ marginTop: 12 }}>
                  {(() => {
                    const list = [...(performerTab === 'recce' ? d.topPerformers.recce : d.topPerformers.installation)]
                      .sort((a, b) => (b.count || 0) - (a.count || 0))
                      .slice(0, 5);
                    if (!list.length) return <EmptyLine text="No completed work yet" theme={theme} />;
                    const max = Math.max(...list.map(p => p.count || 0), 1);
                    return list.map((p, i) => (
                      <PerformerRow
                        key={`${p.name}-${i}`}
                        rank={i + 1}
                        name={p.name}
                        count={p.count}
                        max={max}
                        color={performerTab === 'recce' ? STAGE.recce : STAGE.install}
                        theme={theme}
                      />
                    ));
                  })()}
                </View>
              </Card>

              {/* ---------- Distribution ---------- */}
              <Card theme={theme}>
                <CardHeader icon={<MapPin size={18} color={c.primary} />} title="Where the stores are" theme={theme} />
                <Segmented
                  options={[{ key: 'state', label: 'By state' }, { key: 'zone', label: 'By zone' }]}
                  value={distTab}
                  onChange={(v: string) => setDistTab(v as any)}
                  theme={theme}
                />
                <View style={{ marginTop: 14, gap: 12 }}>
                  {(() => {
                    const list = (distTab === 'state' ? d.distribution.byCity : d.zoneDistribution).slice(0, 8);
                    if (!list.length) return <EmptyLine text="No data available" theme={theme} />;
                    const max = Math.max(...list.map(x => x.count || 0), 1);
                    return list.map((x, i) => (
                      <DistRow key={`${x._id}-${i}`} label={x._id || 'Unknown'} value={x.count} max={max} theme={theme} />
                    ));
                  })()}
                </View>
              </Card>

              {/* ---------- Recent stores ---------- */}
              <Card theme={theme} style={{ paddingBottom: 6 }}>
                <CardHeader
                  icon={<Building2 size={18} color={c.primary} />}
                  title="Recent stores"
                  theme={theme}
                  right={onNavigate ? (
                    <TouchableOpacity onPress={() => onNavigate('Stores')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                      <Text style={{ color: darkMode ? c.primaryLight : '#B45309', fontWeight: '700', fontSize: 13 }}>View all</Text>
                    </TouchableOpacity>
                  ) : undefined}
                />
                {d.recentStores.length ? d.recentStores.slice(0, 6).map((s, i) => (
                  <ListRow
                    key={s._id || i}
                    title={s.storeName}
                    subtitle={[s.city, s.dealerCode].filter(Boolean).join(' • ')}
                    status={s.currentStatus}
                    onPress={onNavigate ? () => openStore(s._id) : undefined}
                    last={i === Math.min(d.recentStores.length, 6) - 1}
                    theme={theme}
                  />
                )) : <EmptyLine text="No recent stores" theme={theme} />}
              </Card>
            </>
          ) : (
            /* ======================= FIELD USER ======================= */
            <>
              <PipelineHero
                total={d.overview.totalAssigned}
                pending={d.overview.pending}
                recceDone={Math.max(0, d.overview.submitted - d.overview.completed)}
                installed={d.overview.completed}
                rate={d.overview.completionRate}
                title="Your assignments"
                theme={theme}
              />

              <View style={styles.grid}>
                <KpiCard icon={<Package size={18} color={STAGE.recce} />} tint={STAGE.recce} label="Assigned" value={d.overview.totalAssigned} theme={theme} />
                <KpiCard icon={<Clock size={18} color={STAGE.warn} />} tint={STAGE.warn} label="Pending" value={d.overview.pending} theme={theme} />
                <KpiCard icon={<CheckCircle2 size={18} color={STAGE.install} />} tint={STAGE.install} label="Completed" value={d.overview.approved || d.overview.completed} theme={theme} />
                <KpiCard icon={<CalendarDays size={18} color={STAGE.violet} />} tint={STAGE.violet} label="Submitted today" value={d.recentActivity.submissionsLast7Days} theme={theme} />
              </View>

              {onNavigate && (
                <View style={styles.row}>
                  <QuickAction label="Recce" icon={<ClipboardCheck size={20} color={STAGE.recce} />} tint={STAGE.recce} onPress={() => onNavigate('Recce')} theme={theme} />
                  <QuickAction label="Install" icon={<Wrench size={20} color={STAGE.install} />} tint={STAGE.install} onPress={() => onNavigate('Installation')} theme={theme} />
                  <QuickAction label="Stores" icon={<Store size={20} color={STAGE.violet} />} tint={STAGE.violet} onPress={() => onNavigate('Stores')} theme={theme} />
                </View>
              )}

              <Card theme={theme} style={{ paddingBottom: 6 }}>
                <CardHeader icon={<ClipboardCheck size={18} color={c.primary} />} title="My tasks" theme={theme} />
                {d.myTasks.length ? d.myTasks.map((t, i) => (
                  <ListRow
                    key={t.storeId || i}
                    title={t.storeName}
                    subtitle={[t.city, t.district, t.state].filter(Boolean).join(', ') || 'N/A'}
                    meta={t.assignedDate ? formatDate(t.assignedDate) : undefined}
                    status={t.status}
                    onPress={onNavigate ? () => openStore(t.storeId) : undefined}
                    last={i === d.myTasks.length - 1}
                    theme={theme}
                  />
                )) : <EmptyLine text="No tasks assigned yet" theme={theme} />}
              </Card>
            </>
          )}
        </View>
      </ScrollView>
      )}

      {/* ---------- Filter bottom sheet ---------- */}
      <Modal visible={showFilterSheet} transparent animationType="slide" onRequestClose={() => setShowFilterSheet(false)}>
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <TouchableOpacity style={styles.sheetBackdrop} activeOpacity={1} onPress={() => setShowFilterSheet(false)} />
          <View style={[styles.sheet, { backgroundColor: c.surface }]}>
            <View style={[styles.sheetHandle, { backgroundColor: c.border }]} />
            <View style={styles.sheetHeader}>
              <Text style={{ color: c.text, fontSize: 18, fontWeight: '800' }}>Filter dashboard</Text>
              <TouchableOpacity onPress={() => setShowFilterSheet(false)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                <X size={20} color={c.textSecondary} />
              </TouchableOpacity>
            </View>
            <ScrollView keyboardShouldPersistTaps="handled" style={{ maxHeight: 420 }}>
              <View style={styles.sheetGrid}>
                {FILTER_FIELDS.map(({ key, label }) => (
                  <View key={key} style={styles.sheetField}>
                    <Text style={[styles.sheetLabel, { color: c.textSecondary }]}>{label}</Text>
                    <TextInput
                      placeholder="Any"
                      placeholderTextColor={c.textTertiary}
                      value={(filters as any)[key]}
                      onChangeText={text => setFilters(prev => ({ ...prev, [key]: text }))}
                      autoCapitalize="none"
                      autoCorrect={false}
                      returnKeyType="done"
                      style={[styles.sheetInput, { borderColor: c.border, color: c.text, backgroundColor: surfaceAlt }]}
                    />
                  </View>
                ))}
              </View>
            </ScrollView>
            <View style={styles.sheetActions}>
              <TouchableOpacity onPress={resetFilters} style={[styles.sheetBtn, { borderWidth: 1, borderColor: c.border }]}>
                <Text style={{ color: c.text, fontWeight: '700' }}>Reset</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={applyFilters} style={[styles.sheetBtn, { backgroundColor: c.primary }]}>
                <Text style={{ color: '#1E293B', fontWeight: '800' }}>Apply filters</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

// ---------------------------------------------------------------------------
// Loading skeleton — mirrors the real layout (greeting, pipeline card, today
// tiles, quick actions, KPI grid) so nothing jumps when data arrives. The real
// Header stays on screen above it.
// ---------------------------------------------------------------------------
function DashboardSkeleton() {
  return (
    <View style={{ flex: 1, paddingHorizontal: 16, paddingTop: 18, gap: 18 }}>
      <View style={{ gap: 8 }}>
        <Skeleton width={110} height={12} />
        <Skeleton width={220} height={24} />
        <Skeleton width={70} height={18} borderRadius={999} />
      </View>
      <Skeleton width="100%" height={150} borderRadius={22} />
      <View style={{ flexDirection: 'row', gap: 10 }}>
        {[0, 1, 2].map(i => <Skeleton key={i} width="31%" height={84} borderRadius={16} style={{ flex: 1 }} />)}
      </View>
      <View style={{ flexDirection: 'row', gap: 10 }}>
        {[0, 1, 2, 3].map(i => <Skeleton key={i} width="23%" height={82} borderRadius={16} style={{ flex: 1 }} />)}
      </View>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
        {[0, 1, 2, 3].map(i => <Skeleton key={i} width="48%" height={68} borderRadius={16} style={{ flexGrow: 1 }} />)}
      </View>
    </View>
  );
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function greeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

function formatToday() {
  const d = new Date();
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${days[d.getDay()]}, ${d.getDate()} ${months[d.getMonth()]}`;
}

function formatDate(dateStr: string) {
  if (!dateStr) return '-';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return '-';
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${date.getDate().toString().padStart(2, '0')} ${months[date.getMonth()]} ${date.getFullYear()}`;
}

function getStatusColor(status?: string) {
  const s = status || '';
  if (s.includes('REJECTED')) return STAGE.danger;
  if (s === 'COMPLETED' || s.includes('APPROVED') || s.includes('COMPLETED')) return STAGE.install;
  if (s.includes('SUBMITTED')) return STAGE.warn;
  if (s.includes('ASSIGNED')) return STAGE.recce;
  return '#64748B';
}

function prettyStatus(status?: string) {
  if (!status) return '—';
  return status
    .replace(/_/g, ' ')
    .toLowerCase()
    .replace(/\b\w/g, ch => ch.toUpperCase());
}

// ---------------------------------------------------------------------------
// Presentation primitives
// ---------------------------------------------------------------------------
function Card({ children, theme, style }: any) {
  return (
    <View style={[styles.card, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }, style]}>
      {children}
    </View>
  );
}

function CardHeader({ icon, title, theme, right }: any) {
  return (
    <View style={styles.cardHeader}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        {icon}
        <Text style={{ fontSize: 16, fontWeight: '800', color: theme.colors.text }}>{title}</Text>
      </View>
      {right}
    </View>
  );
}

function SectionTitle({ icon, title, theme }: any) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 10 }}>
      {icon}
      <Text style={{ fontSize: 12, fontWeight: '800', color: theme.colors.textSecondary, letterSpacing: 0.8, textTransform: 'uppercase' }}>{title}</Text>
    </View>
  );
}

function EmptyLine({ text, theme }: any) {
  return <Text style={{ color: theme.colors.textSecondary, textAlign: 'center', paddingVertical: 18, fontSize: 13 }}>{text}</Text>;
}

/**
 * Signature element: the store pipeline. Every store is in exactly one of
 * three buckets — awaiting recce, recce done (awaiting install), installed —
 * shown as one segmented bar so the whole operation reads at a glance.
 */
function PipelineHero({ total, pending, recceDone, installed, rate, title = 'Store pipeline', theme }: any) {
  const safeTotal = Math.max(total || 0, pending + recceDone + installed, 1);
  const seg = (n: number) => (n > 0 ? Math.max(2, (n / safeTotal) * 100) : 0);
  const ink = '#1E293B';
  return (
    <View style={[styles.hero, { backgroundColor: theme.colors.primary }]}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <View style={{ flex: 1 }}>
          <Text style={{ color: ink, opacity: 0.75, fontSize: 13, fontWeight: '700' }}>{title}</Text>
          <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 6, marginTop: 4 }}>
            <Text style={{ color: ink, fontSize: 40, fontWeight: '900', lineHeight: 44 }}>{rate}%</Text>
            <Text style={{ color: ink, opacity: 0.75, fontSize: 13, fontWeight: '600', marginBottom: 6 }}>installed</Text>
          </View>
        </View>
        <View style={styles.heroTotal}>
          <Text style={{ color: ink, fontSize: 20, fontWeight: '900' }}>{total || 0}</Text>
          <Text style={{ color: ink, opacity: 0.7, fontSize: 11, fontWeight: '700' }}>stores</Text>
        </View>
      </View>

      <View style={styles.heroBar}>
        {seg(installed) > 0 && <View style={{ width: `${seg(installed)}%`, backgroundColor: '#065F46' }} />}
        {seg(recceDone) > 0 && <View style={{ width: `${seg(recceDone)}%`, backgroundColor: '#1D4ED8' }} />}
        {seg(pending) > 0 && <View style={{ flex: 1, backgroundColor: 'rgba(255,255,255,0.55)' }} />}
      </View>

      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 12 }}>
        <HeroLegend color="#065F46" label="Installed" value={installed} />
        <HeroLegend color="#1D4ED8" label="Recce done" value={recceDone} />
        <HeroLegend color="rgba(255,255,255,0.85)" label="Awaiting" value={pending} />
      </View>
    </View>
  );
}

function HeroLegend({ color, label, value }: any) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
      <View style={{ width: 10, height: 10, borderRadius: 3, backgroundColor: color, borderWidth: 1, borderColor: 'rgba(30,41,59,0.15)' }} />
      <Text style={{ color: '#1E293B', fontSize: 12 }}>
        <Text style={{ fontWeight: '900' }}>{value || 0}</Text> {label}
      </Text>
    </View>
  );
}

function TodayTile({ label, value, color, theme }: any) {
  return (
    <View style={[styles.todayTile, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
      <View style={{ width: 22, height: 4, borderRadius: 2, backgroundColor: color, marginBottom: 10 }} />
      <Text style={{ color: theme.colors.text, fontSize: 24, fontWeight: '900' }}>{value || 0}</Text>
      <Text style={{ color: theme.colors.textSecondary, fontSize: 12, marginTop: 2 }} numberOfLines={1}>{label}</Text>
    </View>
  );
}

function QuickAction({ label, icon, tint, onPress, theme }: any) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.75} style={[styles.quick, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
      <View style={[styles.quickIcon, { backgroundColor: tint + '1A' }]}>{icon}</View>
      <Text style={{ color: theme.colors.text, fontSize: 12, fontWeight: '700' }} numberOfLines={1}>{label}</Text>
    </TouchableOpacity>
  );
}

function KpiCard({ icon, tint, label, value, theme }: any) {
  return (
    <View style={[styles.kpi, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
      <View style={[styles.kpiIcon, { backgroundColor: tint + '1A' }]}>{icon}</View>
      <View style={{ flex: 1 }}>
        <Text style={{ color: theme.colors.text, fontSize: 22, fontWeight: '900' }} numberOfLines={1}>{value ?? 0}</Text>
        <Text style={{ color: theme.colors.textSecondary, fontSize: 12 }} numberOfLines={1}>{label}</Text>
      </View>
    </View>
  );
}

function StageCard({ title, icon, color, rate, done, of, doneLabel, pendingLabel, onPress, theme }: any) {
  const pending = Math.max(0, (of || 0) - (done || 0));
  const Wrapper: any = onPress ? TouchableOpacity : View;
  return (
    <Wrapper onPress={onPress} activeOpacity={0.8} style={[styles.card, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
        <RadialProgress percentage={rate} color={color} theme={theme} />
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 }}>
            {icon}
            <Text style={{ fontSize: 16, fontWeight: '800', color: theme.colors.text, flex: 1 }}>{title}</Text>
            {onPress && <ChevronRight size={18} color={theme.colors.textTertiary} />}
          </View>
          <StatLine dot={color} label={doneLabel} value={done} theme={theme} />
          <StatLine dot={theme.colors.textTertiary} label={pendingLabel} value={pending} theme={theme} />
          <View style={[styles.divider, { backgroundColor: theme.colors.border }]} />
          <StatLine label="Total in stage" value={of} theme={theme} bold />
        </View>
      </View>
    </Wrapper>
  );
}

function StatLine({ dot, label, value, theme, bold }: any) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 3 }}>
      {dot ? <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: dot }} /> : <View style={{ width: 8 }} />}
      <Text style={{ flex: 1, color: theme.colors.textSecondary, fontSize: 13 }}>{label}</Text>
      <Text style={{ color: theme.colors.text, fontSize: 14, fontWeight: bold ? '900' : '700' }}>{value ?? 0}</Text>
    </View>
  );
}

function Segmented({ options, value, onChange, theme }: any) {
  return (
    <View style={[styles.segment, { backgroundColor: theme.colors.surfaceSecondary }]}>
      {options.map((o: any) => {
        const active = o.key === value;
        return (
          <TouchableOpacity
            key={o.key}
            onPress={() => onChange(o.key)}
            activeOpacity={0.8}
            style={[styles.segmentItem, active && { backgroundColor: theme.colors.surface, borderColor: theme.colors.border, borderWidth: 1 }]}
          >
            <Text style={{ fontSize: 13, fontWeight: active ? '800' : '600', color: active ? theme.colors.text : theme.colors.textSecondary }}>{o.label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

function PerformerRow({ rank, name, count, max, color, theme }: any) {
  const pct = max > 0 ? Math.max(4, ((count || 0) / max) * 100) : 0;
  const medal = rank === 1 ? '#F6B21C' : rank === 2 ? '#94A3B8' : rank === 3 ? '#D97706' : null;
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 8 }}>
      <View style={[styles.avatar, { backgroundColor: color + '1F' }]}>
        <Text style={{ color, fontWeight: '900', fontSize: 14 }}>{(name || '?').charAt(0).toUpperCase()}</Text>
        {medal && (
          <View style={[styles.medal, { backgroundColor: medal, borderColor: theme.colors.surface }]}>
            <Text style={{ color: '#FFF', fontSize: 9, fontWeight: '900' }}>{rank}</Text>
          </View>
        )}
      </View>
      <View style={{ flex: 1, gap: 5 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <Text style={{ color: theme.colors.text, fontSize: 14, fontWeight: '700', flex: 1 }} numberOfLines={1}>{name}</Text>
          <Text style={{ color: theme.colors.text, fontSize: 13, fontWeight: '800' }}>{count || 0}</Text>
        </View>
        <View style={[styles.track, { backgroundColor: theme.colors.surfaceSecondary }]}>
          <View style={{ width: `${pct}%`, height: '100%', backgroundColor: color, borderRadius: 999 }} />
        </View>
      </View>
    </View>
  );
}

function DistRow({ label, value, max, theme }: any) {
  const pct = max > 0 ? Math.max(3, ((value || 0) / max) * 100) : 0;
  return (
    <View style={{ gap: 6 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <Text style={{ color: theme.colors.text, fontSize: 13, fontWeight: '600', flex: 1 }} numberOfLines={1}>{label}</Text>
        <Text style={{ color: theme.colors.text, fontSize: 13, fontWeight: '800' }}>{value || 0}</Text>
      </View>
      <View style={[styles.track, { backgroundColor: theme.colors.surfaceSecondary }]}>
        <View style={{ width: `${pct}%`, height: '100%', backgroundColor: theme.colors.primary, borderRadius: 999 }} />
      </View>
    </View>
  );
}

function ListRow({ title, subtitle, meta, status, onPress, last, theme }: any) {
  const color = getStatusColor(status);
  const Wrapper: any = onPress ? TouchableOpacity : View;
  return (
    <Wrapper
      onPress={onPress}
      activeOpacity={0.7}
      style={[styles.listRow, !last && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: theme.colors.border }]}
    >
      <View style={[styles.listIcon, { backgroundColor: color + '1A' }]}>
        <Store size={18} color={color} />
      </View>
      <View style={{ flex: 1, gap: 3 }}>
        <Text style={{ color: theme.colors.text, fontSize: 14, fontWeight: '700' }} numberOfLines={1}>{title}</Text>
        <Text style={{ color: theme.colors.textSecondary, fontSize: 12 }} numberOfLines={1}>{subtitle}</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 2 }}>
          <View style={[styles.pill, { backgroundColor: color + '1A' }]}>
            <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: color }} />
            <Text style={{ color, fontSize: 11, fontWeight: '700' }}>{prettyStatus(status)}</Text>
          </View>
          {meta ? <Text style={{ color: theme.colors.textTertiary, fontSize: 11 }}>{meta}</Text> : null}
        </View>
      </View>
      {onPress && <ChevronRight size={18} color={theme.colors.textTertiary} />}
    </Wrapper>
  );
}

// Real circular progress (SVG arc).
function RadialProgress({ percentage, color, theme, size = 92, strokeWidth = 10 }: any) {
  const clamped = Math.max(0, Math.min(100, percentage || 0));
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (clamped / 100) * circumference;
  const center = size / 2;
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size}>
        <Circle cx={center} cy={center} r={radius} stroke={theme.colors.surfaceSecondary} strokeWidth={strokeWidth} fill="none" />
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
        <Text style={{ fontSize: 20, fontWeight: '900', color: theme.colors.text }}>{Math.round(clamped)}%</Text>
      </View>
    </View>
  );
}

// ---------------------------------------------------------------------------
const styles = StyleSheet.create({
  greetingRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingTop: 18, paddingBottom: 6, gap: 12 },
  greetingDate: { fontSize: 12, fontWeight: '600', letterSpacing: 0.3 },
  greetingTitle: { fontSize: 24, fontWeight: '900', marginTop: 2 },
  roleChip: { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 3, borderRadius: 999, marginTop: 8 },
  roleChipText: { fontSize: 11, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.6 },
  filterBtn: { width: 46, height: 46, borderRadius: 14, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  filterBadge: { position: 'absolute', top: -5, right: -5, minWidth: 18, height: 18, borderRadius: 9, paddingHorizontal: 4, backgroundColor: '#1E293B', alignItems: 'center', justifyContent: 'center' },
  filterBadgeText: { color: '#FFF', fontSize: 10, fontWeight: '800' },
  chipRow: { paddingHorizontal: 16, gap: 8, paddingTop: 8 },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999, borderWidth: 1 },
  body: { padding: 16, gap: 18 },
  row: { flexDirection: 'row', gap: 10 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  hero: { borderRadius: 22, padding: 18 },
  heroTotal: { backgroundColor: 'rgba(255,255,255,0.45)', borderRadius: 14, paddingHorizontal: 12, paddingVertical: 8, alignItems: 'center' },
  heroBar: { flexDirection: 'row', height: 14, borderRadius: 7, overflow: 'hidden', marginTop: 16, backgroundColor: 'rgba(255,255,255,0.55)', gap: 2 },
  todayTile: { flex: 1, borderRadius: 16, borderWidth: 1, padding: 14 },
  quick: { flex: 1, borderRadius: 16, borderWidth: 1, paddingVertical: 14, alignItems: 'center', gap: 8 },
  quickIcon: { width: 42, height: 42, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  kpi: { flexGrow: 1, flexBasis: '46%', flexDirection: 'row', alignItems: 'center', gap: 12, borderRadius: 16, borderWidth: 1, padding: 14 },
  kpiIcon: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  card: { borderRadius: 20, borderWidth: 1, padding: 16 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 },
  divider: { height: StyleSheet.hairlineWidth, marginVertical: 6 },
  segment: { flexDirection: 'row', borderRadius: 12, padding: 3 },
  segmentItem: { flex: 1, paddingVertical: 8, borderRadius: 10, alignItems: 'center', borderColor: 'transparent', borderWidth: 1 },
  avatar: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center' },
  medal: { position: 'absolute', bottom: -3, right: -3, width: 17, height: 17, borderRadius: 9, alignItems: 'center', justifyContent: 'center', borderWidth: 2 },
  track: { height: 6, borderRadius: 999, overflow: 'hidden' },
  listRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12 },
  listIcon: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  pill: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 999 },
  sheetBackdrop: { flex: 1, backgroundColor: 'rgba(15,23,42,0.5)' },
  sheet: { borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingHorizontal: 18, paddingBottom: 24, paddingTop: 10 },
  sheetHandle: { width: 40, height: 5, borderRadius: 3, alignSelf: 'center', marginBottom: 12 },
  sheetHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  sheetGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  sheetField: { flexBasis: '47%', flexGrow: 1, gap: 6 },
  sheetLabel: { fontSize: 12, fontWeight: '700' },
  sheetInput: { borderWidth: 1, borderRadius: 12, paddingHorizontal: 12, paddingVertical: Platform.OS === 'ios' ? 12 : 9, fontSize: 14 },
  sheetActions: { flexDirection: 'row', gap: 10, marginTop: 18 },
  sheetBtn: { flex: 1, height: 50, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
});
