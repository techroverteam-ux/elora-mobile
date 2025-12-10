import React, { useRef, useEffect, useState } from 'react';
import {
  View,
  Animated,
  ScrollView,
  StyleSheet,
  Text,
  Dimensions,
} from 'react-native';
import { useTheme } from 'react-native-paper';
import MaterialDesignIcons from '@react-native-vector-icons/material-design-icons';

const { width: screenWidth } = Dimensions.get('window');

interface EnhancedPullToRefreshProps {
  refreshing: boolean;
  onRefresh: () => void;
  children: React.ReactNode;
  refreshThreshold?: number;
  style?: any;
  showsVerticalScrollIndicator?: boolean;
  contentContainerStyle?: any;
}

const EnhancedPullToRefresh: React.FC<EnhancedPullToRefreshProps> = ({
  refreshing,
  onRefresh,
  children,
  refreshThreshold = 100,
  style,
  showsVerticalScrollIndicator = false,
  contentContainerStyle,
}) => {
  const { colors } = useTheme();
  const scrollViewRef = useRef<ScrollView>(null);
  
  // Animation values
  const pullDistance = useRef(new Animated.Value(0)).current;
  const refreshOpacity = useRef(new Animated.Value(0)).current;
  const iconRotation = useRef(new Animated.Value(0)).current;
  const iconScale = useRef(new Animated.Value(0)).current;
  const waveAnimation = useRef(new Animated.Value(0)).current;
  const particleAnimations = useRef(
    Array.from({ length: 6 }, () => ({
      translateY: new Animated.Value(0),
      opacity: new Animated.Value(0),
      scale: new Animated.Value(0),
    }))
  ).current;

  const [pullState, setPullState] = useState<'idle' | 'pulling' | 'ready' | 'refreshing'>('idle');
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    if (refreshing) {
      startRefreshAnimation();
    } else {
      stopRefreshAnimation();
    }
  }, [refreshing]);

  const startRefreshAnimation = () => {
    setPullState('refreshing');
    
    // Main refresh animation
    Animated.parallel([
      Animated.timing(refreshOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(iconScale, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      // Continuous rotation
      Animated.loop(
        Animated.timing(iconRotation, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        })
      ),
      // Wave effect
      Animated.loop(
        Animated.sequence([
          Animated.timing(waveAnimation, {
            toValue: 1,
            duration: 1500,
            useNativeDriver: true,
          }),
          Animated.timing(waveAnimation, {
            toValue: 0,
            duration: 1500,
            useNativeDriver: true,
          }),
        ])
      ),
    ]).start();

    // Particle animations
    particleAnimations.forEach((particle, index) => {
      Animated.loop(
        Animated.sequence([
          Animated.delay(index * 200),
          Animated.parallel([
            Animated.timing(particle.translateY, {
              toValue: -30 - Math.random() * 20,
              duration: 1000,
              useNativeDriver: true,
            }),
            Animated.timing(particle.opacity, {
              toValue: 1,
              duration: 500,
              useNativeDriver: true,
            }),
            Animated.timing(particle.scale, {
              toValue: 1,
              duration: 500,
              useNativeDriver: true,
            }),
          ]),
          Animated.parallel([
            Animated.timing(particle.opacity, {
              toValue: 0,
              duration: 500,
              useNativeDriver: true,
            }),
            Animated.timing(particle.scale, {
              toValue: 0,
              duration: 500,
              useNativeDriver: true,
            }),
          ]),
          Animated.timing(particle.translateY, {
            toValue: 0,
            duration: 0,
            useNativeDriver: true,
          }),
        ])
      ).start();
    });
  };

  const stopRefreshAnimation = () => {
    setPullState('idle');
    iconRotation.stopAnimation();
    waveAnimation.stopAnimation();
    
    particleAnimations.forEach(particle => {
      particle.translateY.stopAnimation();
      particle.opacity.stopAnimation();
      particle.scale.stopAnimation();
    });

    Animated.parallel([
      Animated.timing(refreshOpacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(iconScale, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(pullDistance, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      iconRotation.setValue(0);
      waveAnimation.setValue(0);
      particleAnimations.forEach(particle => {
        particle.translateY.setValue(0);
        particle.opacity.setValue(0);
        particle.scale.setValue(0);
      });
    });
  };

  const handleScroll = (event: any) => {
    const { contentOffset } = event.nativeEvent;
    setScrollY(contentOffset.y);

    if (contentOffset.y < 0 && !refreshing) {
      const distance = Math.abs(contentOffset.y);
      const progress = Math.min(distance / refreshThreshold, 1);
      
      pullDistance.setValue(distance);
      refreshOpacity.setValue(progress);
      iconScale.setValue(progress);

      if (distance >= refreshThreshold) {
        if (pullState !== 'ready') {
          setPullState('ready');
          // Haptic feedback could be added here
        }
      } else if (distance > 0) {
        if (pullState !== 'pulling') {
          setPullState('pulling');
        }
      } else {
        if (pullState !== 'idle') {
          setPullState('idle');
        }
      }
    }
  };

  const handleScrollEndDrag = (event: any) => {
    const { contentOffset } = event.nativeEvent;
    
    if (contentOffset.y < -refreshThreshold && !refreshing && pullState === 'ready') {
      onRefresh();
    }
  };

  const iconRotationInterpolate = iconRotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const waveScale = waveAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [0.8, 1.2],
  });

  const waveOpacity = waveAnimation.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.3, 0.1, 0.3],
  });

  const getRefreshText = () => {
    switch (pullState) {
      case 'pulling':
        return 'Pull to refresh';
      case 'ready':
        return 'Release to refresh';
      case 'refreshing':
        return 'Refreshing...';
      default:
        return '';
    }
  };

  const getIconName = () => {
    switch (pullState) {
      case 'pulling':
        return 'arrow-down';
      case 'ready':
        return 'refresh';
      case 'refreshing':
        return 'loading';
      default:
        return 'refresh';
    }
  };

  return (
    <View style={[styles.container, style]}>
      {/* Custom Refresh Header */}
      <Animated.View
        style={[
          styles.refreshHeader,
          {
            backgroundColor: colors.surface,
            opacity: refreshOpacity,
            transform: [
              {
                translateY: pullDistance.interpolate({
                  inputRange: [0, refreshThreshold],
                  outputRange: [-60, 0],
                  extrapolate: 'clamp',
                }),
              },
            ],
          },
        ]}
      >
        {/* Background Wave Effect */}
        <Animated.View
          style={[
            styles.waveBackground,
            {
              backgroundColor: colors.primary,
              opacity: waveOpacity,
              transform: [{ scale: waveScale }],
            },
          ]}
        />

        {/* Particles */}
        {particleAnimations.map((particle, index) => (
          <Animated.View
            key={index}
            style={[
              styles.particle,
              {
                backgroundColor: colors.primary,
                left: 50 + (index * 30) + Math.random() * 20,
                opacity: particle.opacity,
                transform: [
                  { translateY: particle.translateY },
                  { scale: particle.scale },
                ],
              },
            ]}
          />
        ))}

        {/* Main Refresh Icon */}
        <View style={styles.refreshContent}>
          <Animated.View
            style={[
              styles.iconContainer,
              {
                backgroundColor: colors.primary,
                transform: [
                  { scale: iconScale },
                  { rotate: refreshing ? iconRotationInterpolate : '0deg' },
                ],
              },
            ]}
          >
            <MaterialDesignIcons
              name={getIconName()}
              size={24}
              color={colors.onPrimary}
            />
          </Animated.View>
          
          <Animated.Text
            style={[
              styles.refreshText,
              {
                color: colors.onSurface,
                opacity: refreshOpacity,
              },
            ]}
          >
            {getRefreshText()}
          </Animated.Text>
        </View>

        {/* Progress Indicator */}
        <View style={styles.progressContainer}>
          <Animated.View
            style={[
              styles.progressBar,
              {
                backgroundColor: colors.outline,
                width: pullDistance.interpolate({
                  inputRange: [0, refreshThreshold],
                  outputRange: [0, screenWidth * 0.8],
                  extrapolate: 'clamp',
                }),
              },
            ]}
          />
        </View>
      </Animated.View>

      {/* ScrollView Content */}
      <ScrollView
        ref={scrollViewRef}
        style={styles.scrollView}
        contentContainerStyle={contentContainerStyle}
        showsVerticalScrollIndicator={showsVerticalScrollIndicator}
        onScroll={handleScroll}
        onScrollEndDrag={handleScrollEndDrag}
        scrollEventThrottle={16}
        bounces={true}
      >
        {children}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  refreshHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 80,
    zIndex: 1000,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  waveBackground: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  particle: {
    position: 'absolute',
    width: 4,
    height: 4,
    borderRadius: 2,
  },
  refreshContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  refreshText: {
    fontSize: 12,
    fontWeight: '500',
  },
  progressContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: 'rgba(0,0,0,0.1)',
  },
  progressBar: {
    height: 2,
    alignSelf: 'center',
  },
  scrollView: {
    flex: 1,
  },
});

export default EnhancedPullToRefresh;