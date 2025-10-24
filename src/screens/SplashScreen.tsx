import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  StatusBar,
  Animated,
  Image,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import MaterialDesignIcons from '@react-native-vector-icons/material-design-icons';
import { AppColors } from '../theme/colors';

const { width, height } = Dimensions.get('window');

interface SplashScreenProps {
  onFinish: () => void;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.5)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    StatusBar.setBarStyle('light-content');
    StatusBar.setBackgroundColor(AppColors.primary);

    // Animation sequence
    Animated.sequence([
      // Logo animation
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
      ]),
      // Text slide up
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();

    // Auto finish after 2.5 seconds
    const timer = setTimeout(() => {
      onFinish();
    }, 2500);

    return () => {
      clearTimeout(timer);
      StatusBar.setBarStyle('dark-content');
      StatusBar.setBackgroundColor('#ffffff');
    };
  }, [fadeAnim, scaleAnim, slideAnim, onFinish]);

  return (
    <LinearGradient
      colors={['#FF9933', '#F8803B', '#FF6600']} // Saffron gradient
      style={styles.container}
    >
      <StatusBar backgroundColor="#FF9933" barStyle="light-content" />
      
      {/* Logo Container */}
      <View style={styles.logoContainer}>
        <Animated.View
          style={[
            styles.logoWrapper,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <View style={styles.iconContainer}>
            <Image 
              source={require('../assets/images/shreeKrishna.png')}
              style={styles.logoImage}
              resizeMode="contain"
            />
          </View>
        </Animated.View>

        <Animated.View
          style={[
            styles.textContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <Text style={styles.appName}>Geeta Bal Sanskaar</Text>
          <Text style={styles.tagline}>Spiritual Wisdom & Guidance</Text>
        </Animated.View>
      </View>

      {/* Bottom Section */}
      <Animated.View
        style={[
          styles.bottomSection,
          {
            opacity: fadeAnim,
          },
        ]}
      >
        <View style={styles.loadingContainer}>
          <View style={styles.loadingDot} />
          <View style={styles.loadingDot} />
          <View style={styles.loadingDot} />
        </View>
        <Text style={styles.loadingText}>Loading...</Text>
      </Animated.View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  logoWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 30,
  },
  iconContainer: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  logoImage: {
    width: 100,
    height: 100,
  },
  textContainer: {
    alignItems: 'center',
  },
  appName: {
    fontSize: 32,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 8,
    letterSpacing: 1,
  },
  tagline: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '500',
    textAlign: 'center',
  },
  bottomSection: {
    position: 'absolute',
    bottom: 80,
    alignItems: 'center',
  },
  loadingContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  loadingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.7)',
    marginHorizontal: 4,
  },
  loadingText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    fontWeight: '500',
  },
});

export default SplashScreen;