import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, TextInput, Image } from 'react-native';
import { CheckCircle, XCircle, MessageSquare, X } from 'lucide-react-native';
import { useTheme } from '../context/ThemeContext';
import { storeService } from '../services/storeService';
import Toast from 'react-native-toast-message';

interface PhotoApprovalProps {
  storeId: string;
  photoIndex: number;
  photoUrl: string;
  currentStatus?: 'APPROVED' | 'REJECTED' | 'PENDING';
  rejectionReason?: string;
  onStatusChange: () => void;
}

export default function PhotoApproval({ 
  storeId, 
  photoIndex, 
  photoUrl, 
  currentStatus = 'PENDING',
  rejectionReason,
  onStatusChange 
}: PhotoApprovalProps) {
  const { theme } = useTheme();
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<'APPROVED' | 'REJECTED'>('APPROVED');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);

  const handleStatusChange = async () => {
    if (selectedStatus === 'REJECTED' && !reason.trim()) {
      Toast.show({ type: 'error', text1: 'Rejection reason is required' });
      return;
    }

    try {
      setLoading(true);
      await storeService.reviewReccePhoto(
        storeId, 
        photoIndex, 
        selectedStatus, 
        selectedStatus === 'REJECTED' ? reason : undefined
      );
      
      Toast.show({ 
        type: 'success', 
        text1: `Photo ${selectedStatus.toLowerCase()}` 
      });
      
      setModalVisible(false);
      setReason('');
      onStatusChange();
    } catch (error: any) {
      Toast.show({ 
        type: 'error', 
        text1: error.response?.data?.message || 'Failed to update status' 
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = () => {
    switch (currentStatus) {
      case 'APPROVED': return '#10B981';
      case 'REJECTED': return '#EF4444';
      default: return '#F59E0B';
    }
  };

  const getStatusIcon = () => {
    switch (currentStatus) {
      case 'APPROVED': return <CheckCircle size={16} color="#10B981" />;
      case 'REJECTED': return <XCircle size={16} color="#EF4444" />;
      default: return <MessageSquare size={16} color="#F59E0B" />;
    }
  };

  return (
    <>
      <View style={{ 
        flexDirection: 'row', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        backgroundColor: theme.colors.surface,
        padding: 12,
        borderRadius: 8,
        marginTop: 8
      }}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          {getStatusIcon()}
          <Text style={{ 
            color: getStatusColor(), 
            fontSize: 12, 
            fontWeight: '600', 
            marginLeft: 6 
          }}>
            {currentStatus}
          </Text>
        </View>

        <TouchableOpacity
          onPress={() => setModalVisible(true)}
          style={{
            backgroundColor: theme.colors.primary + '20',
            paddingHorizontal: 12,
            paddingVertical: 6,
            borderRadius: 6
          }}
        >
          <Text style={{ color: theme.colors.primary, fontSize: 12, fontWeight: '600' }}>
            Change Status
          </Text>
        </TouchableOpacity>
      </View>

      {rejectionReason && (
        <View style={{
          backgroundColor: '#EF444420',
          padding: 8,
          borderRadius: 6,
          marginTop: 4,
          borderLeftWidth: 3,
          borderLeftColor: '#EF4444'
        }}>
          <Text style={{ color: '#EF4444', fontSize: 11, fontWeight: '600' }}>
            Rejection Reason:
          </Text>
          <Text style={{ color: '#EF4444', fontSize: 12, marginTop: 2 }}>
            {rejectionReason}
          </Text>
        </View>
      )}

      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 }}>
          <View style={{
            backgroundColor: theme.colors.background,
            borderRadius: 16,
            padding: 20,
            maxHeight: '80%'
          }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <Text style={{ fontSize: 18, fontWeight: 'bold', color: theme.colors.text }}>
                Review Photo {photoIndex + 1}
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <X size={24} color={theme.colors.text} />
              </TouchableOpacity>
            </View>

            <View style={{ alignItems: 'center', marginBottom: 20 }}>
              <Image
                source={{ uri: photoUrl }}
                style={{ width: 200, height: 150, borderRadius: 8 }}
                resizeMode="cover"
              />
            </View>

            <View style={{ marginBottom: 16 }}>
              <Text style={{ color: theme.colors.text, fontSize: 14, fontWeight: '600', marginBottom: 12 }}>
                Select Status
              </Text>
              <View style={{ flexDirection: 'row', gap: 12 }}>
                <TouchableOpacity
                  onPress={() => setSelectedStatus('APPROVED')}
                  style={{
                    flex: 1,
                    padding: 12,
                    borderRadius: 8,
                    backgroundColor: selectedStatus === 'APPROVED' ? '#10B98120' : theme.colors.surface,
                    borderWidth: 2,
                    borderColor: selectedStatus === 'APPROVED' ? '#10B981' : theme.colors.border,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <CheckCircle size={16} color={selectedStatus === 'APPROVED' ? '#10B981' : theme.colors.textSecondary} />
                  <Text style={{ 
                    color: selectedStatus === 'APPROVED' ? '#10B981' : theme.colors.textSecondary,
                    marginLeft: 6,
                    fontWeight: '600'
                  }}>
                    Approve
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => setSelectedStatus('REJECTED')}
                  style={{
                    flex: 1,
                    padding: 12,
                    borderRadius: 8,
                    backgroundColor: selectedStatus === 'REJECTED' ? '#EF444420' : theme.colors.surface,
                    borderWidth: 2,
                    borderColor: selectedStatus === 'REJECTED' ? '#EF4444' : theme.colors.border,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <XCircle size={16} color={selectedStatus === 'REJECTED' ? '#EF4444' : theme.colors.textSecondary} />
                  <Text style={{ 
                    color: selectedStatus === 'REJECTED' ? '#EF4444' : theme.colors.textSecondary,
                    marginLeft: 6,
                    fontWeight: '600'
                  }}>
                    Reject
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {selectedStatus === 'REJECTED' && (
              <View style={{ marginBottom: 16 }}>
                <Text style={{ color: theme.colors.text, fontSize: 14, fontWeight: '600', marginBottom: 8 }}>
                  Rejection Reason *
                </Text>
                <TextInput
                  value={reason}
                  onChangeText={setReason}
                  placeholder="Enter reason for rejection..."
                  placeholderTextColor={theme.colors.textSecondary}
                  style={{
                    backgroundColor: theme.colors.surface,
                    borderWidth: 1,
                    borderColor: theme.colors.border,
                    borderRadius: 8,
                    padding: 12,
                    color: theme.colors.text,
                    minHeight: 80,
                    textAlignVertical: 'top'
                  }}
                  multiline
                />
              </View>
            )}

            <View style={{ flexDirection: 'row', gap: 12 }}>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                style={{
                  flex: 1,
                  padding: 12,
                  borderRadius: 8,
                  backgroundColor: theme.colors.surface,
                  alignItems: 'center'
                }}
              >
                <Text style={{ color: theme.colors.text, fontWeight: '600' }}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleStatusChange}
                disabled={loading || (selectedStatus === 'REJECTED' && !reason.trim())}
                style={{
                  flex: 1,
                  padding: 12,
                  borderRadius: 8,
                  backgroundColor: (selectedStatus === 'REJECTED' && !reason.trim()) ? theme.colors.border : theme.colors.primary,
                  alignItems: 'center'
                }}
              >
                <Text style={{ color: '#FFF', fontWeight: '600' }}>
                  {loading ? 'Updating...' : 'Update Status'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}