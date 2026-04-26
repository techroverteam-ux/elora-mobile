import React, { useState } from 'react';
import { TouchableOpacity, View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { Download, CheckCircle, XCircle } from 'lucide-react-native';
import { useTheme } from '../context/ThemeContext';
import { modernDownloadService } from '../services/modernDownloadService';

interface DownloadButtonProps {
  onDownload: () => Promise<{ blob?: Blob; url?: string; filename: string }>;
  title?: string;
  description?: string;
  size?: 'small' | 'medium' | 'large';
  variant?: 'primary' | 'secondary' | 'success';
  disabled?: boolean;
  style?: any;
}

export const DownloadButton: React.FC<DownloadButtonProps> = ({
  onDownload,
  title,
  description,
  size = 'medium',
  variant = 'primary',
  disabled = false,
  style
}) => {
  const { theme } = useTheme();
  const [isDownloading, setIsDownloading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [downloadState, setDownloadState] = useState<'idle' | 'downloading' | 'success' | 'error'>('idle');

  const handleDownload = async () => {
    if (isDownloading || disabled) return;

    try {
      setIsDownloading(true);
      setDownloadState('downloading');
      setProgress(0);

      // Get download data from parent component
      const downloadData = await onDownload();
      
      // Start native download
      await modernDownloadService.downloadExcel({
        ...downloadData,
        onProgress: (progressValue) => {
          setProgress(progressValue);
        },
        onComplete: () => {
          setDownloadState('success');
          setTimeout(() => {
            setDownloadState('idle');
            setIsDownloading(false);
            setProgress(0);
          }, 2000);
        },
        onError: () => {
          setDownloadState('error');
          setTimeout(() => {
            setDownloadState('idle');
            setIsDownloading(false);
            setProgress(0);
          }, 2000);
        }
      });

    } catch (error) {
      console.error('Download button error:', error);
      setDownloadState('error');
      setTimeout(() => {
        setDownloadState('idle');
        setIsDownloading(false);
        setProgress(0);
      }, 2000);
    }
  };

  const getButtonColor = () => {
    if (disabled) return theme.colors.border;
    
    switch (downloadState) {
      case 'downloading':
        return '#3B82F6';
      case 'success':
        return '#10B981';
      case 'error':
        return '#EF4444';
      default:
        switch (variant) {
          case 'primary':
            return '#10B981';
          case 'secondary':
            return theme.colors.primary;
          case 'success':
            return '#10B981';
          default:
            return '#10B981';
        }
    }
  };

  const getIconSize = () => {
    switch (size) {
      case 'small':
        return 14;
      case 'medium':
        return 16;
      case 'large':
        return 20;
      default:
        return 16;
    }
  };

  const getPadding = () => {
    switch (size) {
      case 'small':
        return 8;
      case 'medium':
        return 12;
      case 'large':
        return 16;
      default:
        return 12;
    }
  };

  const renderIcon = () => {
    const iconSize = getIconSize();
    const iconColor = '#FFF';

    switch (downloadState) {
      case 'downloading':
        return <ActivityIndicator size="small" color={iconColor} />;
      case 'success':
        return <CheckCircle size={iconSize} color={iconColor} />;
      case 'error':
        return <XCircle size={iconSize} color={iconColor} />;
      default:
        return <Download size={iconSize} color={iconColor} />;
    }
  };

  const getButtonText = () => {
    switch (downloadState) {
      case 'downloading':
        return `${progress}%`;
      case 'success':
        return 'Downloaded';
      case 'error':
        return 'Failed';
      default:
        return '';
    }
  };

  return (
    <TouchableOpacity
      onPress={handleDownload}
      disabled={isDownloading || disabled}
      style={[
        styles.button,
        {
          backgroundColor: getButtonColor(),
          padding: getPadding(),
          opacity: disabled ? 0.5 : 1,
        },
        style
      ]}
      activeOpacity={0.7}
    >
      <View style={styles.buttonContent}>
        {renderIcon()}
        {(downloadState === 'downloading' || downloadState === 'success' || downloadState === 'error') && (
          <Text style={[styles.buttonText, { fontSize: size === 'small' ? 10 : 12 }]}>
            {getButtonText()}
          </Text>
        )}
      </View>
      
      {/* Progress bar for downloading state */}
      {downloadState === 'downloading' && (
        <View style={styles.progressContainer}>
          <View 
            style={[
              styles.progressBar, 
              { 
                width: `${progress}%`,
                backgroundColor: 'rgba(255, 255, 255, 0.3)'
              }
            ]} 
          />
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 40,
    position: 'relative',
    overflow: 'hidden',
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  buttonText: {
    color: '#FFF',
    fontWeight: '600',
  },
  progressContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  progressBar: {
    height: '100%',
    borderRadius: 1,
  },
});

export default DownloadButton;