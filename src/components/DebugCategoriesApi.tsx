import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useGetRecentCategoriesQuery, useGetAllCategoriesQuery } from '../data/redux/services/categoriesApi';
import { useTheme } from 'react-native-paper';

// Debug component to test the categories API - only for development
const DebugCategoriesApi: React.FC = () => {
  const { colors } = useTheme();
  const [showDebug, setShowDebug] = useState(false);
  
  const { data: recentCategories, isLoading: recentLoading, error: recentError } = useGetRecentCategoriesQuery({ limit: 6 });
  const { data: allCategories, isLoading: allLoading, error: allError } = useGetAllCategoriesQuery();

  if (!__DEV__) return null; // Only show in development

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={[styles.debugButton, { backgroundColor: colors.primary }]}
        onPress={() => setShowDebug(!showDebug)}
      >
        <Text style={styles.debugButtonText}>
          {showDebug ? 'Hide' : 'Show'} Categories API Debug
        </Text>
      </TouchableOpacity>

      {showDebug && (
        <ScrollView style={[styles.debugPanel, { backgroundColor: colors.surface }]}>
          <Text style={[styles.debugTitle, { color: colors.onSurface }]}>Categories API Debug</Text>
          
          {/* Recent Categories */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.onSurface }]}>Recent Categories (6):</Text>
            <Text style={[styles.status, { color: recentLoading ? colors.primary : recentError ? '#ff0000' : '#00ff00' }]}>
              Status: {recentLoading ? 'Loading...' : recentError ? 'Error' : 'Success'}
            </Text>
            {recentError && (
              <Text style={[styles.error, { color: colors.error }]}>
                Error: {JSON.stringify(recentError, null, 2)}
              </Text>
            )}
            {recentCategories && (
              <Text style={[styles.data, { color: colors.onSurfaceVariant }]}>
                Count: {recentCategories.length}
                {'\n'}
                Categories: {recentCategories.map(cat => cat.title).join(', ')}
              </Text>
            )}
          </View>

          {/* All Categories */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.onSurface }]}>All Categories:</Text>
            <Text style={[styles.status, { color: allLoading ? colors.primary : allError ? '#ff0000' : '#00ff00' }]}>
              Status: {allLoading ? 'Loading...' : allError ? 'Error' : 'Success'}
            </Text>
            {allError && (
              <Text style={[styles.error, { color: colors.error }]}>
                Error: {JSON.stringify(allError, null, 2)}
              </Text>
            )}
            {allCategories && (
              <Text style={[styles.data, { color: colors.onSurfaceVariant }]}>
                Total Count: {allCategories.data?.length || 0}
                {'\n'}
                Success: {allCategories.success ? 'Yes' : 'No'}
                {'\n'}
                Message: {allCategories.message}
              </Text>
            )}
          </View>
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    margin: 10,
  },
  debugButton: {
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  debugButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  debugPanel: {
    marginTop: 10,
    padding: 15,
    borderRadius: 5,
    maxHeight: 300,
  },
  debugTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  section: {
    marginBottom: 15,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  status: {
    fontSize: 12,
    marginBottom: 5,
  },
  error: {
    fontSize: 10,
    fontFamily: 'monospace',
  },
  data: {
    fontSize: 11,
    fontFamily: 'monospace',
  },
});

export default DebugCategoriesApi;