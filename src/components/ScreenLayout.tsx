import React from 'react';
import { View, StyleSheet } from 'react-native';
import Header from './Header';

interface ScreenLayoutProps {
  title: string;
  subtitle?: string;
  status?: 'Completed' | 'Pending' | 'In Progress';
  onMenuPress: () => void;
  onProfilePress?: () => void;
  hasNotifications?: boolean;
  children: React.ReactNode;
}

const ScreenLayout: React.FC<ScreenLayoutProps> = ({
  title,
  subtitle,
  status,
  onMenuPress,
  onProfilePress,
  hasNotifications = false,
  children
}) => {
  return (
    <View style={styles.container}>
      <Header
        title={title}
        subtitle={subtitle}
        status={status}
        onMenuPress={onMenuPress}
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