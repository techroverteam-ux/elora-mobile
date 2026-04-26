import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { Download, FileText, FileSpreadsheet, Presentation } from 'lucide-react-native';
import { useTheme } from '../../context/ThemeContext';
import { storeService } from '../../services/storeService';
import { clientService } from '../../services/clientService';
import { userService } from '../../services/userService';
import { roleService } from '../../services/roleService';
import { fileService } from '../../services/fileService';
import { modernDownloadService } from '../../services/modernDownloadService';
import DownloadButton from '../../components/DownloadButton';
import Toast from 'react-native-toast-message';

export default function ExportScreen() {
  const { theme } = useTheme();
  const [loading, setLoading] = useState({});

  const handleExport = async (type: string, service: any, filename: string) => {
    setLoading(prev => ({ ...prev, [type]: true }));
    
    try {
      const blob = await service();
      await modernDownloadService.downloadExcel({
        blob,
        filename
      });
    } catch (error) {
      // Error handling is done by the modern download service
    } finally {
      setLoading(prev => ({ ...prev, [type]: false }));
    }
  };

  const ExportCard = ({ title, description, onPress, icon, loading }) => (
    <TouchableOpacity
      onPress={onPress}
      disabled={loading}
      style={{
        backgroundColor: theme.colors.surface,
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: theme.colors.border,
        opacity: loading ? 0.6 : 1,
        flexDirection: 'row',
        alignItems: 'center'
      }}
    >
      <View style={{ 
        backgroundColor: theme.colors.primary + '20', 
        padding: 12, 
        borderRadius: 8, 
        marginRight: 12 
      }}>
        {icon}
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ 
          color: theme.colors.text, 
          fontSize: 16, 
          fontWeight: '600',
          marginBottom: 4
        }}>
          {title}
        </Text>
        <Text style={{ 
          color: theme.colors.textSecondary, 
          fontSize: 12 
        }}>
          {description}
        </Text>
      </View>
      <Download size={20} color={theme.colors.primary} />
    </TouchableOpacity>
  );

  return (
    <ScrollView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <View style={{ padding: 16 }}>
        <Text style={{ 
          fontSize: 24, 
          fontWeight: 'bold', 
          color: theme.colors.text,
          marginBottom: 8
        }}>
          Export & Reports
        </Text>
        <Text style={{ 
          color: theme.colors.textSecondary, 
          marginBottom: 24 
        }}>
          Download data and generate reports
        </Text>

        <Text style={{ 
          fontSize: 18, 
          fontWeight: '600', 
          color: theme.colors.text,
          marginBottom: 16
        }}>
          Store Exports
        </Text>

        <ExportCard
          title="All Stores Export"
          description="Export complete store database"
          icon={<FileSpreadsheet size={20} color={theme.colors.primary} />}
          loading={loading.stores}
          onPress={() => handleExport('stores', storeService.export, `Stores_Export_${Date.now()}.xlsx`)}
        />

        <ExportCard
          title="Recce Data Export"
          description="Export all recce submissions"
          icon={<FileText size={20} color={theme.colors.primary} />}
          loading={loading.recce}
          onPress={() => handleExport('recce', storeService.exportRecce, `Recce_Export_${Date.now()}.xlsx`)}
        />

        <ExportCard
          title="Installation Data Export"
          description="Export all installation data"
          icon={<Presentation size={20} color={theme.colors.primary} />}
          loading={loading.installation}
          onPress={() => handleExport('installation', storeService.exportInstallation, `Installation_Export_${Date.now()}.xlsx`)}
        />

        <Text style={{ 
          fontSize: 18, 
          fontWeight: '600', 
          color: theme.colors.text,
          marginTop: 24,
          marginBottom: 16
        }}>
          Other Exports
        </Text>

        <ExportCard
          title="Clients Export"
          description="Export all client data"
          icon={<FileSpreadsheet size={20} color={theme.colors.primary} />}
          loading={loading.clients}
          onPress={() => handleExport('clients', clientService.export, `Clients_Export_${Date.now()}.xlsx`)}
        />

        <ExportCard
          title="Users Export"
          description="Export all user data"
          icon={<FileSpreadsheet size={20} color={theme.colors.primary} />}
          loading={loading.users}
          onPress={() => handleExport('users', userService.export, `Users_Export_${Date.now()}.xlsx`)}
        />

        <ExportCard
          title="Roles Export"
          description="Export all role data"
          icon={<FileSpreadsheet size={20} color={theme.colors.primary} />}
          loading={loading.roles}
          onPress={() => handleExport('roles', roleService.export, `Roles_Export_${Date.now()}.xlsx`)}
        />

        <Text style={{ 
          fontSize: 18, 
          fontWeight: '600', 
          color: theme.colors.text,
          marginTop: 24,
          marginBottom: 16
        }}>
          Templates
        </Text>

        <TouchableOpacity
          onPress={() => handleExport('store_template', storeService.getTemplate, 'Store_Upload_Template.xlsx')}
          disabled={loading.store_template}
          style={{
            backgroundColor: '#10B981',
            padding: 16,
            borderRadius: 12,
            alignItems: 'center',
            marginBottom: 12,
            opacity: loading.store_template ? 0.6 : 1
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Download size={20} color="#FFF" />
            <Text style={{ 
              color: '#FFF', 
              fontSize: 16, 
              fontWeight: '600',
              marginLeft: 8
            }}>
              Store Upload Template
            </Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => handleExport('user_template', userService.downloadTemplate, 'User_Upload_Template.xlsx')}
          disabled={loading.user_template}
          style={{
            backgroundColor: '#10B981',
            padding: 16,
            borderRadius: 12,
            alignItems: 'center',
            marginBottom: 24,
            opacity: loading.user_template ? 0.6 : 1
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Download size={20} color="#FFF" />
            <Text style={{ 
              color: '#FFF', 
              fontSize: 16, 
              fontWeight: '600',
              marginLeft: 8
            }}>
              User Upload Template
            </Text>
          </View>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}