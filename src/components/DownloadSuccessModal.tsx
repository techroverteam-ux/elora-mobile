import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, Dimensions, StatusBar } from 'react-native';
import { CheckCircle, Share2, FolderOpen, X, Download } from 'lucide-react-native';
import { useTheme } from '../context/ThemeContext';
import LinearGradient from 'react-native-linear-gradient';

interface DownloadSuccessModalProps {
  visible: boolean;
  onClose: () => void;
  filename: string;
  fileSize?: string;
  downloadPath: string;
  onOpenFile?: () => void;
  onShareFile?: () => void;
  onOpenFolder?: () => void;
}

const { width, height } = Dimensions.get('window');

export const DownloadSuccessModal: React.FC<DownloadSuccessModalProps> = ({
  visible,
  onClose,
  filename,
  fileSize,
  downloadPath,
  onOpenFile,
  onShareFile,
  onOpenFolder
}) => {
  const { theme } = useTheme();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <StatusBar backgroundColor="rgba(0,0,0,0.7)" barStyle="light-content" />
      
      {/* Backdrop */}
      <View style={styles.backdrop}>
        <TouchableOpacity 
          style={styles.backdropTouchable} 
          activeOpacity={1} 
          onPress={onClose}
        />
        
        {/* Modal Content */}
        <View style={[styles.modalContainer, { backgroundColor: theme.colors.background }]}>
          
          {/* Close Button */}
          <TouchableOpacity 
            style={[styles.closeButton, { backgroundColor: theme.colors.surface }]} 
            onPress={onClose}
          >
            <X size={20} color={theme.colors.textSecondary} />
          </TouchableOpacity>

          {/* Success Icon with Animation */}
          <View style={styles.iconContainer}>
            <LinearGradient
              colors={['#10B981', '#059669']}
              style={styles.successIconBg}
            >
              <CheckCircle size={48} color="#FFFFFF" />
            </LinearGradient>
          </View>

          {/* Success Message */}
          <View style={styles.messageContainer}>
            <Text style={[styles.title, { color: theme.colors.text }]}>
              Download Complete!
            </Text>
            <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
              Your file has been saved successfully
            </Text>
          </View>

          {/* File Info Card */}
          <View style={[styles.fileInfoCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
            <View style={styles.fileInfoHeader}>
              <View style={[styles.fileIcon, { backgroundColor: '#10B98120' }]}>
                <Download size={20} color="#10B981" />
              </View>
              <View style={styles.fileDetails}>
                <Text style={[styles.fileName, { color: theme.colors.text }]} numberOfLines={1}>
                  {filename}
                </Text>
                {fileSize && (
                  <Text style={[styles.fileSize, { color: theme.colors.textSecondary }]}>
                    {fileSize} • Downloads folder
                  </Text>
                )}
                {!fileSize && (
                  <Text style={[styles.fileSize, { color: theme.colors.textSecondary }]}>
                    Saved to Downloads folder
                  </Text>
                )}
              </View>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionsContainer}>
            
            {/* Primary Action - Open File */}
            {onOpenFile && (
              <TouchableOpacity 
                style={[styles.primaryButton]}
                onPress={() => {
                  onOpenFile();
                  onClose();
                }}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={['#3B82F6', '#2563EB']}
                  style={styles.primaryButtonGradient}
                >
                  <FolderOpen size={20} color="#FFFFFF" />
                  <Text style={styles.primaryButtonText}>Open File</Text>
                </LinearGradient>
              </TouchableOpacity>
            )}

            {/* Secondary Actions */}
            <View style={styles.secondaryActions}>
              
              {/* Share Button */}
              {onShareFile && (
                <TouchableOpacity 
                  style={[styles.secondaryButton, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
                  onPress={() => {
                    onShareFile();
                    onClose();
                  }}
                  activeOpacity={0.7}
                >
                  <Share2 size={18} color={theme.colors.primary} />
                  <Text style={[styles.secondaryButtonText, { color: theme.colors.primary }]}>
                    Share
                  </Text>
                </TouchableOpacity>
              )}

              {/* Open Folder Button */}
              {onOpenFolder && (
                <TouchableOpacity 
                  style={[styles.secondaryButton, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
                  onPress={() => {
                    onOpenFolder();
                    onClose();
                  }}
                  activeOpacity={0.7}
                >
                  <FolderOpen size={18} color={theme.colors.primary} />
                  <Text style={[styles.secondaryButtonText, { color: theme.colors.primary }]}>
                    Folder
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={[styles.footerText, { color: theme.colors.textSecondary }]}>
              File saved to Downloads • Tap outside to close
            </Text>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  backdropTouchable: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  modalContainer: {
    width: '100%',
    maxWidth: 380,
    borderRadius: 24,
    paddingTop: 32,
    paddingBottom: 24,
    paddingHorizontal: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.25,
    shadowRadius: 25,
    elevation: 25,
    position: 'relative',
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  successIconBg: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  messageContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
  },
  fileInfoCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
  },
  fileInfoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  fileIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  fileDetails: {
    flex: 1,
  },
  fileName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  fileSize: {
    fontSize: 14,
    lineHeight: 18,
  },
  actionsContainer: {
    marginBottom: 16,
  },
  primaryButton: {
    marginBottom: 12,
    borderRadius: 16,
    overflow: 'hidden',
  },
  primaryButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    gap: 8,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryActions: {
    flexDirection: 'row',
    gap: 12,
  },
  secondaryButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    gap: 6,
  },
  secondaryButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  footer: {
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 16,
  },
});

export default DownloadSuccessModal;