import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const PermissionDebugger = () => {
  const { user } = useAuth();
  const { theme } = useTheme();
  const [isVisible, setIsVisible] = useState(false);

  if (!user) return null;

  const modules = [
    'dashboard', 'clients', 'users', 'roles', 'stores', 
    'recce', 'installation', 'elements', 'rfq', 'enquiries', 'reports'
  ];

  const checkPermission = (moduleName: string) => {
    if (!user || !user.roles || !Array.isArray(user.roles)) return false;

    // SUPER_ADMIN bypass
    if (user.roles.some((r: any) => r.code === "SUPER_ADMIN")) return true;

    // Check permissions
    return user.roles.some((role: any) => {
      const perms = role.permissions;
      if (!perms) return false;
      return perms[moduleName]?.view === true;
    });
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={[styles.toggleButton, { backgroundColor: theme.colors.primary }]}
        onPress={() => setIsVisible(!isVisible)}
      >
        <Text style={styles.toggleText}>
          {isVisible ? 'Hide' : 'Show'} Permission Debug
        </Text>
      </TouchableOpacity>

      {isVisible && (
        <ScrollView style={[styles.debugPanel, { backgroundColor: theme.colors.surface }]}>
          <Text style={[styles.title, { color: theme.colors.text }]}>
            Permission Debugger
          </Text>
          
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              User Info:
            </Text>
            <Text style={[styles.info, { color: theme.colors.textSecondary }]}>
              Name: {user.name}
            </Text>
            <Text style={[styles.info, { color: theme.colors.textSecondary }]}>
              Email: {user.email}
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              Roles:
            </Text>
            {user.roles?.map((role: any, index: number) => (
              <View key={index} style={styles.roleItem}>
                <Text style={[styles.roleName, { color: theme.colors.text }]}>
                  {role.name} ({role.code})
                </Text>
                <Text style={[styles.rolePerms, { color: theme.colors.textSecondary }]}>
                  Permissions: {role.permissions ? 'Yes' : 'No'}
                </Text>
              </View>
            ))}
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              Module Access:
            </Text>
            {modules.map((module) => {
              const hasAccess = checkPermission(module);
              return (
                <View key={module} style={styles.moduleItem}>
                  <Text style={[styles.moduleName, { color: theme.colors.text }]}>
                    {module}
                  </Text>
                  <Text style={[
                    styles.moduleAccess, 
                    { color: hasAccess ? '#10B981' : '#EF4444' }
                  ]}>
                    {hasAccess ? '✅ ALLOWED' : '❌ DENIED'}
                  </Text>
                </View>
              );
            })}
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              Raw Permissions:
            </Text>
            <ScrollView style={styles.rawData}>
              <Text style={[styles.rawText, { color: theme.colors.textSecondary }]}>
                {JSON.stringify(user.roles, null, 2)}
              </Text>
            </ScrollView>
          </View>
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 50,
    right: 10,
    zIndex: 1000,
  },
  toggleButton: {
    padding: 8,
    borderRadius: 8,
    minWidth: 120,
    alignItems: 'center',
  },
  toggleText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  debugPanel: {
    marginTop: 8,
    maxHeight: 400,
    width: 300,
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  info: {
    fontSize: 12,
    marginBottom: 4,
  },
  roleItem: {
    marginBottom: 8,
    padding: 8,
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 4,
  },
  roleName: {
    fontSize: 12,
    fontWeight: '600',
  },
  rolePerms: {
    fontSize: 10,
    marginTop: 2,
  },
  moduleItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  moduleName: {
    fontSize: 12,
    flex: 1,
  },
  moduleAccess: {
    fontSize: 10,
    fontWeight: '600',
  },
  rawData: {
    maxHeight: 100,
    backgroundColor: 'rgba(0,0,0,0.05)',
    padding: 8,
    borderRadius: 4,
  },
  rawText: {
    fontSize: 10,
    fontFamily: 'monospace',
  },
});

export default PermissionDebugger;