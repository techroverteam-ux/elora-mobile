import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, StatusBar } from 'react-native';
import { XCircle, RefreshCw, Share2, X } from 'lucide-react-native';
import { useTheme } from '../context/ThemeContext';
import LinearGradient from 'react-native-linear-gradient';

interface DownloadErrorModalProps {
  visible: boolean;
  onClose: () => void;
  filename: string;
  errorMessage: string;
  onRetry?: () => void;
  onShare?: () => void;
}

export const DownloadErrorModal: React.FC<DownloadErrorModalProps> = ({
  visible,
  onClose,
  filename,
  errorMessage,
  onRetry,
  onShare
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

          {/* Error Icon */}
          <View style={styles.iconContainer}>
            <LinearGradient
              colors={['#EF4444', '#DC2626']}
              style={styles.errorIconBg}
            >
              <XCircle size={48} color="#FFFFFF" />
            </LinearGradient>
          </View>

          {/* Error Message */}
          <View style={styles.messageContainer}>
            <Text style={[styles.title, { color: theme.colors.text }]}>
              Download Failed
            </Text>
            <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
              Unable to download {filename}
            </Text>
          </View>

          {/* Error Details Card */}
          <View style={[styles.errorCard, { backgroundColor: '#FEF2F2', borderColor: '#FECACA' }]}>
            <Text style={[styles.errorText, { color: '#DC2626' }]}>
              {errorMessage}
            </Text>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionsContainer}>
            
            {/* Primary Action - Retry */}
            {onRetry && (
              <TouchableOpacity 
                style={styles.primaryButton}
                onPress={() => {
                  onRetry();
                  onClose();
                }}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={['#3B82F6', '#2563EB']}
                  style={styles.primaryButtonGradient}
                >
                  <RefreshCw size={20} color="#FFFFFF" />
                  <Text style={styles.primaryButtonText}>Try Again</Text>
                </LinearGradient>
              </TouchableOpacity>
            )}

            {/* Secondary Actions */}
            <View style={styles.secondaryActions}>
              
              {/* Share Button */}
              {onShare && (
                <TouchableOpacity 
                  style={[styles.secondaryButton, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
                  onPress={() => {
                    onShare();
                    onClose();
                  }}
                  activeOpacity={0.7}
                >
                  <Share2 size={18} color={theme.colors.primary} />
                  <Text style={[styles.secondaryButtonText, { color: theme.colors.primary }]}>
                    Share Anyway
                  </Text>
                </TouchableOpacity>
              )}

              {/* Cancel Button */}
              <TouchableOpacity 
                style={[styles.secondaryButton, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
                onPress={onClose}
                activeOpacity={0.7}
              >
                <Text style={[styles.secondaryButtonText, { color: theme.colors.textSecondary }]}>
                  Cancel
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={[styles.footerText, { color: theme.colors.textSecondary }]}>
              Check your internet connection and try again
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
  errorIconBg: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#EF4444',
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
  errorCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
  },
  errorText: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
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

export default DownloadErrorModal;