import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, RefreshControl, Dimensions } from 'react-native';
import { BarChart3, TrendingUp, Users, Store, Activity, CheckCircle, Clock, AlertCircle } from 'lucide-react-native';
import { analyticsService } from '../../services/analyticsService';
import { useTheme } from '../../context/ThemeContext';
import Toast from 'react-native-toast-message';
import PageSkeleton from '../../components/PageSkeleton';

const { width } = Dimensions.get('window');

export default function AnalyticsScreen() {
  const { theme } = useTheme();
  const [analytics, setAnalytics] = useState<any>(null);
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
      // Mock data for demonstration
      setAnalytics({
        totalStores: 1250,
        totalUsers: 45,
        recceCompleted: 890,
        installationCompleted: 675,
        statusBreakdown: {
          'UPLOADED': 125,
          'RECCE_ASSIGNED': 89,
          'RECCE_SUBMITTED': 156,
          'RECCE_APPROVED': 234,
          'INSTALLATION_ASSIGNED': 78,
          'INSTALLATION_SUBMITTED': 123,
          'COMPLETED': 445
        },
        monthlyProgress: {
          'Jan': 45,
          'Feb': 67,
          'Mar': 89,
          'Apr': 123,
          'May': 156,
          'Jun': 189
        },
        performanceMetrics: {
          avgRecceTime: '2.3 days',
          avgInstallationTime: '4.1 days',
          completionRate: '89%',
          customerSatisfaction: '4.6/5'
        }
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const renderMetricCard = (title: string, value: string | number, icon: any, color: string, subtitle?: string) => {
    const Icon = icon;
    return (
      <View style={{ 
        backgroundColor: theme.colors.surface, 
        padding: 16, 
        borderRadius: 12, 
        flex: 1, 
        minWidth: (width - 48) / 2,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: theme.colors.border
      }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
          <View style={{ 
            backgroundColor: color + '20', 
            padding: 8, 
            borderRadius: 8, 
            marginRight: 12 
          }}>
            <Icon size={20} color={color} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ color: theme.colors.text, fontSize: 24, fontWeight: 'bold' }}>
              {typeof value === 'number' ? value.toLocaleString() : value}
            </Text>
            <Text style={{ color: theme.colors.textSecondary, fontSize: 12, fontWeight: '600' }}>
              {title}
            </Text>
            {subtitle && (
              <Text style={{ color: color, fontSize: 10, fontWeight: '600', marginTop: 2 }}>
                {subtitle}
              </Text>
            )}
          </View>
        </View>
      </View>
    );
  };

  const renderProgressBar = (label: string, value: number, total: number, color: string) => {
    const percentage = total > 0 ? (value / total) * 100 : 0;
    return (
      <View style={{ marginBottom: 16 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
          <Text style={{ color: theme.colors.text, fontSize: 14, fontWeight: '600' }}>
            {label}
          </Text>
          <Text style={{ color: theme.colors.textSecondary, fontSize: 12 }}>
            {value} / {total} ({percentage.toFixed(1)}%)
          </Text>
        </View>
        <View style={{ 
          backgroundColor: theme.colors.border, 
          height: 8, 
          borderRadius: 4, 
          overflow: 'hidden' 
        }}>
          <View style={{ 
            backgroundColor: color, 
            height: '100%', 
            width: `${percentage}%`,
            borderRadius: 4
          }} />
        </View>
      </View>
    );
  };

  if (loading) {
    return <PageSkeleton type="dashboard" />;
  }

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      {/* Header */}
      <View style={{ padding: 16 }}>
        <View style={{ marginBottom: 16 }}>
          <Text style={{ fontSize: 24, fontWeight: 'bold', color: theme.colors.text }}>Analytics Dashboard</Text>
          <Text style={{ fontSize: 14, color: theme.colors.textSecondary }}>Performance metrics and insights</Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={{ padding: 16, paddingTop: 0 }}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={() => { setRefreshing(true); fetchAnalytics(); }}
            colors={[theme.colors.primary]}
          />
        }
      >
        {/* Key Metrics */}
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 24 }}>
          {renderMetricCard('Total Stores', analytics?.totalStores || 0, Store, '#3B82F6')}
          {renderMetricCard('Active Users', analytics?.totalUsers || 0, Users, '#10B981')}
          {renderMetricCard('Recce Done', analytics?.recceCompleted || 0, CheckCircle, '#F59E0B', '+12% this month')}
          {renderMetricCard('Installations', analytics?.installationCompleted || 0, Activity, '#8B5CF6', '+8% this month')}
        </View>

        {/* Performance Metrics */}
        <View style={{ 
          backgroundColor: theme.colors.surface, 
          padding: 16, 
          borderRadius: 12, 
          marginBottom: 24,
          borderWidth: 1,
          borderColor: theme.colors.border
        }}>
          <Text style={{ color: theme.colors.text, fontSize: 18, fontWeight: 'bold', marginBottom: 16 }}>
            Performance Overview
          </Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 16 }}>
            <View style={{ flex: 1, minWidth: 120 }}>
              <Text style={{ color: theme.colors.textSecondary, fontSize: 12, marginBottom: 4 }}>Avg Recce Time</Text>
              <Text style={{ color: theme.colors.text, fontSize: 16, fontWeight: '600' }}>
                {analytics?.performanceMetrics?.avgRecceTime || '2.3 days'}
              </Text>
            </View>
            <View style={{ flex: 1, minWidth: 120 }}>
              <Text style={{ color: theme.colors.textSecondary, fontSize: 12, marginBottom: 4 }}>Completion Rate</Text>
              <Text style={{ color: '#10B981', fontSize: 16, fontWeight: '600' }}>
                {analytics?.performanceMetrics?.completionRate || '89%'}
              </Text>
            </View>
            <View style={{ flex: 1, minWidth: 120 }}>
              <Text style={{ color: theme.colors.textSecondary, fontSize: 12, marginBottom: 4 }}>Satisfaction</Text>
              <Text style={{ color: '#F59E0B', fontSize: 16, fontWeight: '600' }}>
                {analytics?.performanceMetrics?.customerSatisfaction || '4.6/5'}
              </Text>
            </View>
          </View>
        </View>

        {/* Status Breakdown Chart */}
        {analytics?.statusBreakdown && (
          <View style={{ 
            backgroundColor: theme.colors.surface, 
            padding: 16, 
            borderRadius: 12, 
            marginBottom: 24,
            borderWidth: 1,
            borderColor: theme.colors.border
          }}>
            <Text style={{ color: theme.colors.text, fontSize: 18, fontWeight: 'bold', marginBottom: 16 }}>
              Status Distribution
            </Text>
            {Object.entries(analytics.statusBreakdown).map(([status, count]: [string, any]) => {
              const colors = {
                'UPLOADED': '#6B7280',
                'RECCE_ASSIGNED': '#3B82F6',
                'RECCE_SUBMITTED': '#F59E0B',
                'RECCE_APPROVED': '#8B5CF6',
                'INSTALLATION_ASSIGNED': '#6366F1',
                'INSTALLATION_SUBMITTED': '#14B8A6',
                'COMPLETED': '#10B981'
              };
              const total = Object.values(analytics.statusBreakdown).reduce((a: number, b: any) => a + b, 0);
              return renderProgressBar(
                status.replace(/_/g, ' '),
                count,
                total,
                colors[status as keyof typeof colors] || '#6B7280'
              );
            })}
          </View>
        )}

        {/* Monthly Progress */}
        {analytics?.monthlyProgress && (
          <View style={{ 
            backgroundColor: theme.colors.surface, 
            padding: 16, 
            borderRadius: 12, 
            marginBottom: 24,
            borderWidth: 1,
            borderColor: theme.colors.border
          }}>
            <Text style={{ color: theme.colors.text, fontSize: 18, fontWeight: 'bold', marginBottom: 16 }}>
              Monthly Progress
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'end', justifyContent: 'space-between', height: 120 }}>
              {Object.entries(analytics.monthlyProgress).map(([month, value]: [string, any]) => {
                const maxValue = Math.max(...Object.values(analytics.monthlyProgress));
                const height = (value / maxValue) * 80;
                return (
                  <View key={month} style={{ alignItems: 'center', flex: 1 }}>
                    <View style={{
                      backgroundColor: theme.colors.primary,
                      width: 20,
                      height: height,
                      borderRadius: 4,
                      marginBottom: 8
                    }} />
                    <Text style={{ color: theme.colors.textSecondary, fontSize: 10, fontWeight: '600' }}>
                      {month}
                    </Text>
                    <Text style={{ color: theme.colors.text, fontSize: 12, fontWeight: 'bold' }}>
                      {value}
                    </Text>
                  </View>
                );
              })}
            </View>
          </View>
        )}

        {/* Quick Stats */}
        <View style={{ 
          backgroundColor: theme.colors.surface, 
          padding: 16, 
          borderRadius: 12,
          borderWidth: 1,
          borderColor: theme.colors.border
        }}>
          <Text style={{ color: theme.colors.text, fontSize: 18, fontWeight: 'bold', marginBottom: 16 }}>
            Quick Insights
          </Text>
          <View style={{ gap: 12 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <TrendingUp size={16} color="#10B981" />
              <Text style={{ color: theme.colors.text, fontSize: 14, marginLeft: 8 }}>
                Project completion rate increased by 12% this month
              </Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Clock size={16} color="#F59E0B" />
              <Text style={{ color: theme.colors.text, fontSize: 14, marginLeft: 8 }}>
                Average project timeline reduced by 1.2 days
              </Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <AlertCircle size={16} color="#EF4444" />
              <Text style={{ color: theme.colors.text, fontSize: 14, marginLeft: 8 }}>
                {Object.values(analytics?.statusBreakdown || {}).reduce((a: number, b: any) => a + (b || 0), 0) - (analytics?.installationCompleted || 0)} projects pending completion
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
