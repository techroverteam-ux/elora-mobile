import React, { useEffect, useState, useRef } from 'react';
import { View, StyleSheet, StatusBar, Text, Animated, Image } from 'react-native';
import { LinearGradient } from 'react-native-linear-gradient';

const SplashScreen = () => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  
  const line1Anim = useRef(new Animated.Value(0)).current;
  const line2Anim = useRef(new Animated.Value(0)).current;
  const line3Anim = useRef(new Animated.Value(0)).current;
  
  const line1Scale = useRef(new Animated.Value(0.5)).current;
  const line2Scale = useRef(new Animated.Value(0.5)).current;
  const line3Scale = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    // Enhanced staggered text animation with more dynamic effects
    const startTextAnimation = () => {
      // Line 1 - Slide from left with rotation
      setTimeout(() => {
        Animated.parallel([
          Animated.timing(line1Anim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.spring(line1Scale, {
            toValue: 1,
            tension: 120,
            friction: 6,
            useNativeDriver: true,
          }),
        ]).start();
      }, 800);
      
      // Line 2 - Bounce from right
      setTimeout(() => {
        Animated.parallel([
          Animated.timing(line2Anim, {
            toValue: 1,
            duration: 700,
            useNativeDriver: true,
          }),
          Animated.spring(line2Scale, {
            toValue: 1,
            tension: 150,
            friction: 5,
            useNativeDriver: true,
          }),
        ]).start();
      }, 1200);
      
      // Line 3 - Scale up from center
      setTimeout(() => {
        Animated.parallel([
          Animated.timing(line3Anim, {
            toValue: 1,
            duration: 900,
            useNativeDriver: true,
          }),
          Animated.spring(line3Scale, {
            toValue: 1,
            tension: 80,
            friction: 8,
            useNativeDriver: true,
          }),
        ]).start();
      }, 1600);
    };

    startTextAnimation();
  }, []);

  return (
    <LinearGradient
      colors={['#FFFFFF', '#FEF3C7', '#F6B21C']}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <StatusBar backgroundColor="#F6B21C" barStyle="dark-content" />
      
      <View style={styles.logoContainer}>
        <Image
          source={require('../assets/images/logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>
      
      <View style={styles.textContainer}>
        <Animated.View style={{
          opacity: line1Anim,
          transform: [{ scale: line1Scale }, { translateX: -50 }, { rotate: '2deg' }]
        }}>
          <Text style={[styles.taglineText, styles.line1]}>WE DON'T JUST PRINT.</Text>
        </Animated.View>
        
        <Animated.View style={{
          opacity: line2Anim,
          transform: [{ scale: line2Scale }, { translateX: 30 }]
        }}>
          <Text style={[styles.taglineText, styles.line2]}>WE INSTALL YOUR BRAND</Text>
        </Animated.View>
        
        <Animated.View style={{
          opacity: line3Anim,
          transform: [{ scale: line3Scale }]
        }}>
          <Text style={[styles.taglineText, styles.line3]}>INTO THE REAL WORLD</Text>
        </Animated.View>
      </View>
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
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#F6B21C',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  logo: {
    width: 300,
    height: 100,
  },
  textContainer: {
    marginTop: 40,
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  taglineText: {
    fontSize: 22,
    fontWeight: '900',
    textAlign: 'center',
    lineHeight: 32,
    marginVertical: 6,
    letterSpacing: 1.5,
    textShadowColor: 'rgba(246, 178, 28, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
    fontFamily: 'System',
    textTransform: 'uppercase',
  },
  line1: {
    color: '#B45309',
    fontSize: 20,
    fontStyle: 'italic',
  },
  line2: {
    color: '#92400E',
    fontSize: 24,
    fontWeight: '800',
    textDecorationLine: 'underline',
  },
  line3: {
    color: '#78350F',
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: 2,
  },
});

export default SplashScreen;