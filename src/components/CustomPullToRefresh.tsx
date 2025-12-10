import React, { useRef, useEffect } from 'react';
import {
  View,
  Animated,
  PanGestureHandler,
  State,
  StyleSheet,
} from 'react-native';
import { useTheme } from 'react-native-paper';
import MaterialDesignIcons from '@react-native-vector-icons/material-design-icons';

interface CustomPullToRefreshProps {
  refreshing: boolean;
  onRefresh: () => void;
  children: React.ReactNode;
  pullDistance?: number;
  refreshThreshold?: number;
}

const CustomPullToRefresh: React.FC<CustomPullToRefreshProps> = ({
  refreshing,
  onRefresh,
  children,
  pullDistance = 120,
  refreshThreshold = 80,
}) => {
  const { colors } = useTheme();
  const translateY = useRef(new Animated.Value(0)).current;
  const pullValue = useRef(new Animated.Value(0)).current;
  const rotateValue = useRef(new Animated.Value(0)).current;
  const scaleValue = useRef(new Animated.Value(0)).current;
  const opacityValue = useRef(new Animated.Value(0)).current;

  const isRefreshing = useRef(false);
  const canRefresh = useRef(false);

  useEffect(() => {
    if (refreshing) {
      startRefreshAnimation();
    } else {
      stopRefreshAnimation();
    }
  }, [refreshing]);

  const startRefreshAnimation = () => {
    isRefreshing.current = true;
    
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: refreshThreshold,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.loop(
        Animated.timing(rotateValue, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        })
      ),
      Animated.timing(scaleValue, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(opacityValue, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const stopRefreshAnimation = () => {
    isRefreshing.current = false;
    rotateValue.stopAnimation();
    
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(pullValue, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(scaleValue, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(opacityValue, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      rotateValue.setValue(0);
    });
  };

  const onGestureEvent = Animated.event(
    [{ nativeEvent: { translationY: pullValue } }],
    { 
      useNativeDriver: true,
      listener: (event: any) => {
        const { translationY } = event.nativeEvent;
        
        if (translationY > 0 && !isRefreshing.current) {
          const progress = Math.min(translationY / refreshThreshold, 1);
          
          opacityValue.setValue(progress);
          scaleValue.setValue(progress);
          
          if (translationY >= refreshThreshold) {
            canRefresh.current = true;
          } else {
            canRefresh.current = false;
          }
        }
      }
    }
  );

  const onHandlerStateChange = (event: any) => {
    if (event.nativeEvent.state === State.END) {
      if (canRefresh.current && !isRefreshing.current) {
        onRefresh();
      } else if (!isRefreshing.current) {
        Animated.parallel([
          Animated.timing(pullValue, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(opacityValue, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(scaleValue, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
        ]).start();
      }
      canRefresh.current = false;
    }
  };

  const spin = rotateValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={styles.container}>
      {/* Custom Refresh Indicator */}
      <Animated.View
        style={[
          styles.refreshContainer,
          {
            backgroundColor: colors.surface,
            transform: [
              { translateY: Animated.add(pullValue, translateY) },
              { scale: scaleValue },
            ],
            opacity: opacityValue,
          },
        ]}
      >
        <View style={[styles.refreshIndicator, { backgroundColor: colors.primary }]}>
          <Animated.View
            style={{
              transform: [{ rotate: spin }],
            }}
          >
            <MaterialDesignIcons
              name={refreshing ? "loading" : "refresh"}
              size={24}
              color={colors.onPrimary}
            />
          </Animated.View>
        </View>
        
        {/* Ripple Effect */}
        <Animated.View
          style={[
            styles.ripple,
            {
              backgroundColor: colors.primary,
              opacity: opacityValue.interpolate({
                inputRange: [0, 1],
                outputRange: [0, 0.2],
              }),
              transform: [
                {
                  scale: scaleValue.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, 2],
                  }),
                },
              ],
            },
          ]}
        />
      </Animated.View>

      {/* Content with Gesture Handler */}
      <PanGestureHandler
        onGestureEvent={onGestureEvent}
        onHandlerStateChange={onHandlerStateChange}
        enabled={!refreshing}
      >
        <Animated.View
          style={[
            styles.content,
            {
              transform: [
                {
                  translateY: refreshing
                    ? translateY
                    : pullValue.interpolate({
                        inputRange: [0, pullDistance],
                        outputRange: [0, pullDistance * 0.5],
                        extrapolate: 'clamp',
                      }),
                },
              ],
            },
          ]}
        >
          {children}
        </Animated.View>
      </PanGestureHandler>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  refreshContainer: {
    position: 'absolute',
    top: -60,
    left: 0,
    right: 0,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  refreshIndicator: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  ripple: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  content: {
    flex: 1,
  },
});

export default CustomPullToRefresh;