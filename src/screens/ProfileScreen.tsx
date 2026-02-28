import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { User, Mail, Phone, Shield, Calendar, LogOut } from 'lucide-react-native';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';

interface ProfileScreenProps {
  navigation: {
    goBack: () => void;
  };
}

export default function ProfileScreen({ navigation }: ProfileScreenProps) {
  const { theme } = useTheme();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: theme.colors.background }} contentContainerStyle={{ padding: 16 }}>
        {/* Profile Card */}
        <View style={{ 
          backgroundColor: theme.colors.surface, 
          borderRadius: 12, 
          padding: 20, 
          marginBottom: 16,
          borderWidth: 1,
          borderColor: theme.colors.border,
          alignItems: 'center'
        }}>
          <View style={{ 
            width: 80, 
            height: 80, 
            borderRadius: 40, 
            backgroundColor: theme.colors.primary + '20',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 16
          }}>
            <Text style={{ 
              color: theme.colors.primary, 
              fontSize: 32, 
              fontWeight: 'bold' 
            }}>
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </Text>
          </View>
          
          <Text style={{ 
            fontSize: 24, 
            fontWeight: 'bold', 
            color: theme.colors.text, 
            marginBottom: 4 
          }}>
            {user?.name || 'User Name'}
          </Text>
          
          <View style={{ 
            backgroundColor: theme.colors.primary + '20', 
            paddingHorizontal: 12, 
            paddingVertical: 6, 
            borderRadius: 16 
          }}>
            <Text style={{ 
              color: theme.colors.primary, 
              fontSize: 12, 
              fontWeight: '600' 
            }}>
              {user?.roles?.[0]?.name || user?.roles?.[0]?.code || 'Member'}
            </Text>
          </View>
        </View>

        {/* User Details */}
        <View style={{ 
          backgroundColor: theme.colors.surface, 
          borderRadius: 12, 
          padding: 16, 
          marginBottom: 16,
          borderWidth: 1,
          borderColor: theme.colors.border
        }}>
          <Text style={{ 
            fontSize: 18, 
            fontWeight: 'bold', 
            color: theme.colors.text, 
            marginBottom: 16 
          }}>
            Account Information
          </Text>
          
          <View style={{ gap: 16 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Mail size={20} color={theme.colors.primary} />
              <View style={{ marginLeft: 12, flex: 1 }}>
                <Text style={{ color: theme.colors.textSecondary, fontSize: 12 }}>Email</Text>
                <Text style={{ color: theme.colors.text, fontSize: 14, fontWeight: '600' }}>
                  {user?.email || 'Not provided'}
                </Text>
              </View>
            </View>

            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Phone size={20} color={theme.colors.primary} />
              <View style={{ marginLeft: 12, flex: 1 }}>
                <Text style={{ color: theme.colors.textSecondary, fontSize: 12 }}>Phone</Text>
                <Text style={{ color: theme.colors.text, fontSize: 14, fontWeight: '600' }}>
                  {user?.phone || 'Not provided'}
                </Text>
              </View>
            </View>

            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Shield size={20} color={theme.colors.primary} />
              <View style={{ marginLeft: 12, flex: 1 }}>
                <Text style={{ color: theme.colors.textSecondary, fontSize: 12 }}>Role</Text>
                <Text style={{ color: theme.colors.text, fontSize: 14, fontWeight: '600' }}>
                  {user?.roles?.[0]?.name || user?.roles?.[0]?.code || 'Member'}
                </Text>
              </View>
            </View>

            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Calendar size={20} color={theme.colors.primary} />
              <View style={{ marginLeft: 12, flex: 1 }}>
                <Text style={{ color: theme.colors.textSecondary, fontSize: 12 }}>Member Since</Text>
                <Text style={{ color: theme.colors.text, fontSize: 14, fontWeight: '600' }}>
                  {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Not available'}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Session Info */}
        <View style={{ 
          backgroundColor: theme.colors.surface, 
          borderRadius: 12, 
          padding: 16, 
          marginBottom: 16,
          borderWidth: 1,
          borderColor: theme.colors.border
        }}>
          <Text style={{ 
            fontSize: 18, 
            fontWeight: 'bold', 
            color: theme.colors.text, 
            marginBottom: 16 
          }}>
            Session Information
          </Text>
          
          <View style={{ gap: 12 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ color: theme.colors.textSecondary, fontSize: 14 }}>Status</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View style={{ 
                  width: 8, 
                  height: 8, 
                  borderRadius: 4, 
                  backgroundColor: '#10B981', 
                  marginRight: 6 
                }} />
                <Text style={{ color: '#10B981', fontSize: 14, fontWeight: '600' }}>Active</Text>
              </View>
            </View>
            
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ color: theme.colors.textSecondary, fontSize: 14 }}>Last Login</Text>
              <Text style={{ color: theme.colors.text, fontSize: 14, fontWeight: '600' }}>
                {new Date().toLocaleDateString()}
              </Text>
            </View>
          </View>
        </View>

        {/* Logout Button */}
        <TouchableOpacity
          onPress={handleLogout}
          style={{
            backgroundColor: '#EF4444',
            padding: 16,
            borderRadius: 12,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 32
          }}
        >
          <LogOut size={20} color="#FFFFFF" />
          <Text style={{ 
            color: '#FFFFFF', 
            fontSize: 16, 
            fontWeight: 'bold', 
            marginLeft: 8 
          }}>
            Logout
          </Text>
        </TouchableOpacity>
      </ScrollView>
    );
}