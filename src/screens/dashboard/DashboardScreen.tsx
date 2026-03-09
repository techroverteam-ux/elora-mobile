import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, ScrollView, Dimensions } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { LinearGradient } from 'react-native-linear-gradient';
import { dashboardService } from '../../services/dashboardService';
import { Store, Users, CheckCircle, Clock, TrendingUp, BarChart3, Calendar, Target, Award, Zap } from 'lucide-react-native';
import Toast from 'react-native-toast-message';
import RecceUserDashboard from './RecceUserDashboard';
import InstallationUserDashboard from './InstallationUserDashboard';

const { width } = Dimensions.get('window');
const cardWidth = (width - 48) / 2;

export default function DashboardScreen({ navigation }: { navigation?: any }) {
  const { user } = useAuth();
  const { theme } = useTheme();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check user role
  const userRole = user?.roles?.[0]?.code || user?.roles?.[0]?.name;
  const isRecceUser = userRole === 'RECCE' || userRole?.toLowerCase().includes('recce');
  const isInstallationUser = userRole === 'INSTALLATION' || userRole?.toLowerCase().includes('installation');
  const isAdmin = userRole === 'SUPER_ADMIN' || userRole === 'ADMIN';

  // Show role-specific dashboards
  if (isRecceUser && !isAdmin) {
    return <RecceUserDashboard navigation={navigation} />;
  }
  
  if (isInstallationUser && !isAdmin) {
    return <InstallationUserDashboard navigation={navigation} />;
  }

  useEffect(() => {
    // Only fetch admin stats for admin users
    if (isAdmin) {
      fetchStats();
    } else {
      setLoading(false);
    }
  }, [isAdmin]);

  const fetchStats = async () => {
    try {
      const data = await dashboardService.getStats();
      setStats(data);
    } catch (error) {
      Toast.show({ type: 'error', text1: 'Failed to load stats' });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background, justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]} showsVerticalScrollIndicator={false}>
      {/* Welcome Header */}
      <LinearGradient
        colors={['#F6B21C', '#FECC00', '#E6A500']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.welcomeHeader}
      >
        <View style={styles.welcomeContent}>
          <View style={styles.greetingSection}>
            <Text style={styles.greetingText}>Good {getTimeOfDay()},</Text>
            <Text style={styles.userName}>{user?.name?.split(' ')[0] || 'User'}!</Text>
            <Text style={styles.roleText}>{user?.roles?.[0]?.name || 'Team Member'}</Text>
          </View>
          <View style={styles.avatarContainer}>
            <LinearGradient
              colors={['rgba(255,255,255,0.3)', 'rgba(255,255,255,0.1)']}
              style={styles.avatar}
            >
              <Text style={styles.avatarText}>
                {user?.name?.charAt(0)?.toUpperCase() || 'U'}
              </Text>
            </LinearGradient>
          </View>
        </View>
        <View style={styles.statsPreview}>
          <View style={styles.miniStat}>
            <Text style={styles.miniStatValue}>{stats?.totalStores || 0}</Text>
            <Text style={styles.miniStatLabel}>Stores</Text>
          </View>
          <View style={styles.miniStat}>
            <Text style={styles.miniStatValue}>{stats?.completedTasks || 0}</Text>
            <Text style={styles.miniStatLabel}>Completed</Text>
          </View>
          <View style={styles.miniStat}>
            <Text style={styles.miniStatValue}>{stats?.pendingTasks || 0}</Text>
            <Text style={styles.miniStatLabel}>Pending</Text>
          </View>
        </View>
      </LinearGradient>

      {/* Main Stats Grid */}
      <View style={styles.statsSection}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Overview</Text>
        <View style={styles.statsGrid}>
          <StatCard
            icon={<Store size={28} color="#3B82F6" />}
            title="Total Stores"
            value={stats?.totalStores || 0}
            subtitle="Active locations"
            gradient={['#3B82F6', '#1D4ED8']}
            theme={theme}
          />
          <StatCard
            icon={<Users size={28} color="#10B981" />}
            title="Team Members"
            value={stats?.totalUsers || 0}
            subtitle="Active users"
            gradient={['#10B981', '#059669']}
            theme={theme}
          />
          <StatCard
            icon={<CheckCircle size={28} color="#F59E0B" />}
            title="Completed"
            value={stats?.completedTasks || 0}
            subtitle="This month"
            gradient={['#F59E0B', '#D97706']}
            theme={theme}
          />
          <StatCard
            icon={<Clock size={28} color="#EF4444" />}
            title="In Progress"
            value={stats?.pendingTasks || 0}
            subtitle="Active tasks"
            gradient={['#EF4444', '#DC2626']}
            theme={theme}
          />
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.actionsSection}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Quick Actions</Text>
        <View style={styles.actionsGrid}>
          <ActionCard
            icon={<BarChart3 size={24} color="#8B5CF6" />}
            title="Reports"
            subtitle="View analytics"
            gradient={['#8B5CF6', '#7C3AED']}
            theme={theme}
          />
          <ActionCard
            icon={<TrendingUp size={24} color="#06B6D4" />}
            title="Analytics"
            subtitle="Performance data"
            gradient={['#06B6D4', '#0891B2']}
            theme={theme}
          />
        </View>
        <View style={styles.actionsGrid}>
          <ActionCard
            icon={<Calendar size={24} color="#EC4899" />}
            title="Schedule"
            subtitle="Manage tasks"
            gradient={['#EC4899', '#DB2777']}
            theme={theme}
          />
          <ActionCard
            icon={<Target size={24} color="#84CC16" />}
            title="Goals"
            subtitle="Track progress"
            gradient={['#84CC16', '#65A30D']}
            theme={theme}
          />
        </View>
      </View>

      {/* Performance Highlights */}
      <View style={styles.highlightsSection}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Today's Highlights</Text>
        <View style={styles.highlightCard}>
          <LinearGradient
            colors={['#F6B21C', '#FECC00']}
            style={styles.highlightGradient}
          >
            <View style={styles.highlightIcon}>
              <Award size={32} color="#FFF" />
            </View>
            <View style={styles.highlightContent}>
              <Text style={styles.highlightTitle}>Great Progress!</Text>
              <Text style={styles.highlightText}>
                You've completed {stats?.completedTasks || 0} tasks this month. Keep up the excellent work!
              </Text>
            </View>
          </LinearGradient>
        </View>
      </View>

      {/* Bottom Spacing */}
      <View style={{ height: 32 }} />
    </ScrollView>
  );
}

function getTimeOfDay() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Morning';
  if (hour < 17) return 'Afternoon';
  return 'Evening';
}

function StatCard({ icon, title, value, subtitle, gradient, theme }: any) {
  return (
    <View style={[styles.statCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
      <LinearGradient
        colors={gradient}
        style={styles.statIconContainer}
      >
        {icon}
      </LinearGradient>
      <View style={styles.statContent}>
        <Text style={[styles.statValue, { color: theme.colors.text }]}>{value}</Text>
        <Text style={[styles.statTitle, { color: theme.colors.text }]}>{title}</Text>
        <Text style={[styles.statSubtitle, { color: theme.colors.textSecondary }]}>{subtitle}</Text>
      </View>
    </View>
  );
}

function ActionCard({ icon, title, subtitle, gradient, theme }: any) {
  return (
    <TouchableOpacity style={[styles.actionCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
      <LinearGradient
        colors={gradient}
        style={styles.actionIconContainer}
      >
        {icon}
      </LinearGradient>
      <View style={styles.actionContent}>
        <Text style={[styles.actionTitle, { color: theme.colors.text }]}>{title}</Text>
        <Text style={[styles.actionSubtitle, { color: theme.colors.textSecondary }]}>{subtitle}</Text>
      </View>
      <View style={styles.actionArrow}>
        <Zap size={16} color={theme.colors.textSecondary} />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  welcomeHeader: {
    paddingHorizontal: 20,
    paddingVertical: 32,
    marginBottom: 24,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  welcomeContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  greetingSection: {
    flex: 1,
  },
  greetingText: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 16,
    fontWeight: '500',
  },
  userName: {
    color: '#FFF',
    fontSize: 32,
    fontWeight: '800',
    marginTop: 4,
    letterSpacing: -0.5,
  },
  roleText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    fontWeight: '600',
    marginTop: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  avatarContainer: {
    marginLeft: 16,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  avatarText: {
    color: '#FFF',
    fontSize: 24,
    fontWeight: '800',
  },
  statsPreview: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 16,
    paddingVertical: 16,
    backdropFilter: 'blur(10px)',
  },
  miniStat: {
    alignItems: 'center',
  },
  miniStatValue: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: '800',
  },
  miniStatLabel: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
  statsSection: {
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 16,
    letterSpacing: -0.3,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  statCard: {
    width: cardWidth,
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 6,
  },
  statIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statContent: {
    alignItems: 'flex-start',
  },
  statValue: {
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 4,
    letterSpacing: -0.5,
  },
  statTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 2,
  },
  statSubtitle: {
    fontSize: 12,
    fontWeight: '600',
    opacity: 0.8,
  },
  actionsSection: {
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  actionsGrid: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 16,
  },
  actionCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 4,
  },
  actionIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  actionContent: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 2,
  },
  actionSubtitle: {
    fontSize: 12,
    fontWeight: '600',
    opacity: 0.7,
  },
  actionArrow: {
    marginLeft: 8,
  },
  highlightsSection: {
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  highlightCard: {
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  highlightGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 24,
  },
  highlightIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 20,
  },
  highlightContent: {
    flex: 1,
  },
  highlightTitle: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 8,
  },
  highlightText: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 20,
  },
});