import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions, StatusBar } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

interface SplashScreenProps {
  onFinish?: () => void;
}

export default function SplashScreen({ onFinish }: SplashScreenProps) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const truckPosition = useRef(new Animated.Value(-100)).current;
  const loadingWidth = useRef(new Animated.Value(0)).current;
  const taglineOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Orchestrated animation sequence
    Animated.sequence([
      // 1. Fade in and scale up logo
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }),
      ]),
      // 2. Truck drives in
      Animated.spring(truckPosition, {
        toValue: 0,
        friction: 7,
        tension: 50,
        useNativeDriver: true,
      }),
      // 3. Show tagline
      Animated.timing(taglineOpacity, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      // 4. Loading bar animation
      Animated.timing(loadingWidth, {
        toValue: 1,
        duration: 1500,
        useNativeDriver: false,
      }),
    ]).start(() => {
      // Animation complete - navigate to main app
      setTimeout(() => {
        onFinish?.();
      }, 300);
    });
  }, []);

  return (
    <LinearGradient
      colors={['#16a34a', '#22c55e', '#15803d']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <StatusBar barStyle="light-content" backgroundColor="#16a34a" />
      
      {/* Decorative circles */}
      <View style={[styles.decorativeCircle, styles.circle1]} />
      <View style={[styles.decorativeCircle, styles.circle2]} />
      <View style={[styles.decorativeCircle, styles.circle3]} />

      {/* Main content */}
      <Animated.View
        style={[
          styles.logoContainer,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        {/* Truck Icon with animation */}
        <Animated.View
          style={[
            styles.truckContainer,
            {
              transform: [{ translateX: truckPosition }],
            },
          ]}
        >
          <View style={styles.iconWrapper}>
            {/* Truck body */}
            <View style={styles.truckBody}>
              {/* Packages */}
              <View style={[styles.package, styles.package1]} />
              <View style={[styles.package, styles.package2]} />
              <View style={[styles.package, styles.package3]} />
            </View>
            
            {/* Truck cabin */}
            <View style={styles.truckCabin}>
              <View style={styles.cabinWindow} />
            </View>
            
            {/* Wheels */}
            <View style={[styles.wheel, styles.wheel1]}>
              <View style={styles.wheelInner} />
            </View>
            <View style={[styles.wheel, styles.wheel2]}>
              <View style={styles.wheelInner} />
            </View>
            
            {/* Speed lines */}
            <View style={[styles.speedLine, styles.speedLine1]} />
            <View style={[styles.speedLine, styles.speedLine2]} />
            <View style={[styles.speedLine, styles.speedLine3]} />
            
            {/* Location pin */}
            <View style={styles.locationPin}>
              <Ionicons name="location" size={24} color="#16a34a" />
            </View>
          </View>
        </Animated.View>

        {/* App name */}
        <Text style={styles.appName}>PakLoad</Text>

        {/* Tagline */}
        <Animated.Text style={[styles.tagline, { opacity: taglineOpacity }]}>
          Pakistan's #1 Load Matching Platform
        </Animated.Text>
      </Animated.View>

      {/* Loading bar */}
      <View style={styles.loadingContainer}>
        <View style={styles.loadingTrack}>
          <Animated.View
            style={[
              styles.loadingBar,
              {
                width: loadingWidth.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0%', '100%'],
                }),
              },
            ]}
          />
        </View>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>Connecting Shippers & Carriers</Text>
        <Text style={styles.versionText}>v1.0.0</Text>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  decorativeCircle: {
    position: 'absolute',
    borderRadius: 1000,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  circle1: {
    width: 200,
    height: 200,
    top: 50,
    left: -50,
  },
  circle2: {
    width: 300,
    height: 300,
    top: 150,
    right: -100,
  },
  circle3: {
    width: 250,
    height: 250,
    bottom: 100,
    left: -80,
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  truckContainer: {
    marginBottom: 30,
  },
  iconWrapper: {
    width: 200,
    height: 120,
    position: 'relative',
  },
  truckBody: {
    position: 'absolute',
    left: 10,
    top: 30,
    width: 100,
    height: 50,
    backgroundColor: 'white',
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-around',
    paddingBottom: 5,
    paddingHorizontal: 5,
  },
  package: {
    borderRadius: 3,
  },
  package1: {
    width: 25,
    height: 20,
    backgroundColor: '#fbbf24',
  },
  package2: {
    width: 20,
    height: 15,
    backgroundColor: '#f97316',
  },
  package3: {
    width: 30,
    height: 25,
    backgroundColor: '#3b82f6',
  },
  truckCabin: {
    position: 'absolute',
    left: 110,
    top: 40,
    width: 45,
    height: 40,
    backgroundColor: 'white',
    borderTopRightRadius: 12,
    borderBottomRightRadius: 4,
  },
  cabinWindow: {
    position: 'absolute',
    top: 5,
    left: 8,
    right: 5,
    height: 20,
    backgroundColor: 'rgba(22, 163, 74, 0.6)',
    borderTopRightRadius: 8,
  },
  wheel: {
    position: 'absolute',
    width: 28,
    height: 28,
    backgroundColor: '#1f2937',
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  wheel1: {
    left: 25,
    bottom: 15,
  },
  wheel2: {
    left: 120,
    bottom: 15,
  },
  wheelInner: {
    width: 14,
    height: 14,
    backgroundColor: '#6b7280',
    borderRadius: 7,
  },
  speedLine: {
    position: 'absolute',
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderRadius: 2,
  },
  speedLine1: {
    width: 25,
    left: -15,
    top: 40,
  },
  speedLine2: {
    width: 35,
    left: -25,
    top: 52,
  },
  speedLine3: {
    width: 20,
    left: -10,
    top: 64,
  },
  locationPin: {
    position: 'absolute',
    right: 25,
    top: 0,
    width: 32,
    height: 32,
    backgroundColor: 'white',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  appName: {
    fontSize: 48,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  tagline: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
  },
  loadingContainer: {
    position: 'absolute',
    bottom: 150,
    alignItems: 'center',
  },
  loadingTrack: {
    width: 200,
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  loadingBar: {
    height: '100%',
    backgroundColor: 'white',
    borderRadius: 2,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  footer: {
    position: 'absolute',
    bottom: 50,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 4,
  },
  versionText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.5)',
  },
});
