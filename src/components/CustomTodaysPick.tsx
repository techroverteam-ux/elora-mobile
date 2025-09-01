import MaterialDesignIcons from '@react-native-vector-icons/material-design-icons';
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ImageSourcePropType,
} from 'react-native';
import CustomFastImage from './CustomFastImage';
import { useTheme } from 'react-native-paper';

interface CustomTodaysPickProps {
  imageSource: string | number;
  title?: string;
  subtitle?: string;
  description?: string;
  onPress?: () => void;
}

const CustomTodaysPick: React.FC<CustomTodaysPickProps> = ({
  imageSource,
  title,
  subtitle,
  description,
  onPress,
}) => {
  const { colors } = useTheme();

  return (
    <View style={styles.container}>
      <Text style={[styles.header, { color: colors.onSurface }]}>Today's Pick</Text>
      <View style={styles.card}>
        <CustomFastImage imageUrl={imageSource} style={styles.image} />
        <TouchableOpacity style={styles.playButton} onPress={onPress}>
          <MaterialDesignIcons name="play-circle" size={50} color={colors.onPrimary} />
        </TouchableOpacity>
      </View>
      {title && (
        <Text style={[styles.title, { color: colors.onSurface }]}>{title}</Text>
      )}
      {subtitle && (
        <Text style={[styles.subtitle, { color: colors.onSurfaceVariant }]}>{subtitle}</Text>
      )}
      {description && (
        <Text style={[styles.description, { color: colors.onSurfaceVariant }]}>{description}</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  header: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 8,
  },
  card: {
    position: 'relative',
    borderRadius: 12,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: 350,
    borderRadius: 12,
  },
  playButton: {
    position: 'absolute',
    top: '40%',
    left: '40%',
  },
  title: {
    fontWeight: '600',
    fontSize: 18,
    marginTop: 8,
  },
  subtitle: {
    color: 'gray',
    marginTop: 4,
  },
  description: {
    marginTop: 6,
    color: '#444',
  },
});

export default CustomTodaysPick;
