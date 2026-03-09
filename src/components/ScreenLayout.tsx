import React from 'react';
import { View, StyleSheet } from 'react-native';
import Header from './Header';

interface ScreenLayoutProps {
  title?: string;
  subtitle?: string;
  status?: 'Completed' | 'Pending' | 'In Progress';
  onMenuPress: () => void;
  onBackPress?: () => void;
  showBackButton?: boolean;
  onProfilePress?: () => void;
  hasNotifications?: boolean;
  children: React.ReactNode;
}

const ScreenLayout: React.FC<ScreenLayoutProps> = ({
  onMenuPress,
  onBackPress,
  showBackButton = false,
  onProfilePress,
  hasNotifications = false,
  children
}) => {
  return (
    <View style={styles.container}>
      <Header
        onMenuPress={onMenuPress}
        onBackPress={onBackPress}
        showBackButton={showBackButton}
        onProfilePress={onProfilePress}
        hasNotifications={hasNotifications}
      />
      <View style={styles.content}>
        {children}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
});

export default ScreenLayout;