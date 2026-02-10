import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions, StatusBar, Easing } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

interface SplashScreenProps {
  onFinish?: () => void;
}

export default function SplashScreen({ onFinish }: SplashScreenProps) {
  // Animation values - Upwork-style clean animations
  const truckPosition = useRef(new Animated.Value(-180)).current;
  const truckBounce = useRef(new Animated.Value(0)).current;
  const wheelRotation = useRef(new Animated.Value(0)).current;
  const cargoFloat = useRef(new Animated.Value(0)).current;
  const roadLinePosition = useRef(new Animated.Value(0)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const logoScale = useRef(new Animated.Value(0.8)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;
  const textSlide = useRef(new Animated.Value(20)).current;
  const taglineOpacity = useRef(new Animated.Value(0)).current;
  const progressWidth = useRef(new Animated.Value(0)).current;
  const dotOpacity1 = useRef(new Animated.Value(0.3)).current;
  const dotOpacity2 = useRef(new Animated.Value(0.3)).current;
  const dotOpacity3 = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    // Continuous wheel rotation
    const wheelLoop = Animated.loop(
      Animated.timing(wheelRotation, {
        toValue: 1,
        duration: 300,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );

    // Truck bounce animation (simulates road bumps)
    const bounceLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(truckBounce, {
          toValue: -2,
          duration: 120,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(truckBounce, {
          toValue: 0,
          duration: 120,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );

    // Cargo gentle float
    const cargoLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(cargoFloat, {
          toValue: -2,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(cargoFloat, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ])
    );

    // Road lines moving animation
    const roadLoop = Animated.loop(
      Animated.timing(roadLinePosition, {
        toValue: -80,
        duration: 400,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );

    // Loading dots animation
    const dotsLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(dotOpacity1, { toValue: 1, duration: 300, useNativeDriver: true }),
        Animated.timing(dotOpacity2, { toValue: 1, duration: 300, useNativeDriver: true }),
        Animated.timing(dotOpacity3, { toValue: 1, duration: 300, useNativeDriver: true }),
        Animated.delay(200),
        Animated.parallel([
          Animated.timing(dotOpacity1, { toValue: 0.3, duration: 300, useNativeDriver: true }),
          Animated.timing(dotOpacity2, { toValue: 0.3, duration: 300, useNativeDriver: true }),
          Animated.timing(dotOpacity3, { toValue: 0.3, duration: 300, useNativeDriver: true }),
        ]),
      ])
    );

    // Start continuous animations
    wheelLoop.start();
    bounceLoop.start();
    cargoLoop.start();
    roadLoop.start();
    dotsLoop.start();

    // Main animation sequence
    Animated.sequence([
      // 1. Logo fades in
      Animated.parallel([
        Animated.timing(logoOpacity, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.spring(logoScale, {
          toValue: 1,
          friction: 8,
          tension: 100,
          useNativeDriver: true,
        }),
      ]),
      // 2. Truck drives in from left
      Animated.timing(truckPosition, {
        toValue: width / 2 - 70,
        duration: 1200,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      // 3. Text appears
      Animated.parallel([
        Animated.timing(textOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(textSlide, {
          toValue: 0,
          friction: 8,
          tension: 100,
          useNativeDriver: true,
        }),
      ]),
      // 4. Tagline appears
      Animated.timing(taglineOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      // 5. Progress bar fills
      Animated.timing(progressWidth, {
        toValue: 1,
        duration: 1200,
        easing: Easing.bezier(0.4, 0, 0.2, 1),
        useNativeDriver: false,
      }),
    ]).start(() => {
      wheelLoop.stop();
      bounceLoop.stop();
      cargoLoop.stop();
      roadLoop.stop();
      dotsLoop.stop();
      setTimeout(() => onFinish?.(), 150);
    });

    return () => {
      wheelLoop.stop();
      bounceLoop.stop();
      cargoLoop.stop();
      roadLoop.stop();
      dotsLoop.stop();
    };
  }, []);

  const wheelSpin = wheelRotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" translucent />
      
      {/* Clean white background - Upwork style */}
      <View style={styles.background}>
        {/* Subtle green accent at top */}
        <View style={styles.topAccent} />
        
        {/* Main content */}
        <View style={styles.content}>
          {/* Logo Section */}
          <Animated.View
            style={[
              styles.logoSection,
              {
                opacity: logoOpacity,
                transform: [{ scale: logoScale }],
              },
            ]}
          >
            <View style={styles.logoContainer}>
              <View style={styles.logoIcon}>
                <Ionicons name="cube" size={32} color="#fff" />
              </View>
            </View>
          </Animated.View>

          {/* Animated Truck Scene */}
          <View style={styles.truckScene}>
            {/* Road */}
            <View style={styles.road}>
              <View style={styles.roadSurface} />
              {/* Moving road lines */}
              <Animated.View 
                style={[
                  styles.roadLinesContainer,
                  { transform: [{ translateX: roadLinePosition }] }
                ]}
              >
                {[...Array(10)].map((_, i) => (
                  <View key={i} style={styles.roadLine} />
                ))}
              </Animated.View>
            </View>

            {/* Truck Container */}
            <Animated.View
              style={[
                styles.truckContainer,
                {
                  transform: [
                    { translateX: truckPosition },
                    { translateY: truckBounce },
                  ],
                },
              ]}
            >
              {/* Cargo Boxes on truck */}
              <Animated.View 
                style={[
                  styles.cargoArea,
                  { transform: [{ translateY: cargoFloat }] }
                ]}
              >
                <View style={styles.cargoBox1}>
                  <Ionicons name="cube" size={16} color="#fff" />
                </View>
                <View style={styles.cargoBox2}>
                  <Ionicons name="cube-outline" size={12} color="#fff" />
                </View>
                <View style={styles.cargoBox3} />
              </Animated.View>

              {/* Truck Trailer */}
              <View style={styles.trailer}>
                <View style={styles.trailerSide} />
              </View>

              {/* Truck Cab */}
              <View style={styles.truckCab}>
                <View style={styles.cabWindow} />
                <View style={styles.cabGrill} />
              </View>

              {/* Wheels with spinning animation */}
              <Animated.View
                style={[
                  styles.wheel,
                  styles.wheelFront,
                  { transform: [{ rotate: wheelSpin }] },
                ]}
              >
                <View style={styles.wheelHub} />
                <View style={styles.wheelSpoke} />
                <View style={[styles.wheelSpoke, { transform: [{ rotate: '60deg' }] }]} />
                <View style={[styles.wheelSpoke, { transform: [{ rotate: '120deg' }] }]} />
              </Animated.View>
              <Animated.View
                style={[
                  styles.wheel,
                  styles.wheelMiddle,
                  { transform: [{ rotate: wheelSpin }] },
                ]}
              >
                <View style={styles.wheelHub} />
                <View style={styles.wheelSpoke} />
                <View style={[styles.wheelSpoke, { transform: [{ rotate: '60deg' }] }]} />
                <View style={[styles.wheelSpoke, { transform: [{ rotate: '120deg' }] }]} />
              </Animated.View>
              <Animated.View
                style={[
                  styles.wheel,
                  styles.wheelBack,
                  { transform: [{ rotate: wheelSpin }] },
                ]}
              >
                <View style={styles.wheelHub} />
                <View style={styles.wheelSpoke} />
                <View style={[styles.wheelSpoke, { transform: [{ rotate: '60deg' }] }]} />
                <View style={[styles.wheelSpoke, { transform: [{ rotate: '120deg' }] }]} />
              </Animated.View>
            </Animated.View>
          </View>

          {/* App name - Upwork style typography */}
          <Animated.View
            style={[
              styles.textContainer,
              {
                opacity: textOpacity,
                transform: [{ translateY: textSlide }],
              },
            ]}
          >
            <Text style={styles.appName}>Pak</Text>
            <Text style={styles.appNameBold}>Load</Text>
          </Animated.View>

          {/* Tagline */}
          <Animated.Text style={[styles.tagline, { opacity: taglineOpacity }]}>
            Pakistan's Premier Freight Platform
          </Animated.Text>

          {/* Feature pills - Upwork style */}
          <Animated.View style={[styles.featuresRow, { opacity: taglineOpacity }]}>
            <View style={styles.featurePill}>
              <Ionicons name="checkmark-circle" size={14} color="#14532d" />
              <Text style={styles.featureText}>Verified Carriers</Text>
            </View>
            <View style={styles.featurePill}>
              <Ionicons name="flash" size={14} color="#14532d" />
              <Text style={styles.featureText}>Fast Booking</Text>
            </View>
          </Animated.View>
        </View>

        {/* Bottom section */}
        <View style={styles.bottomSection}>
          {/* Progress bar - Upwork green */}
          <View style={styles.progressContainer}>
            <View style={styles.progressTrack}>
              <Animated.View
                style={[
                  styles.progressBar,
                  {
                    width: progressWidth.interpolate({
                      inputRange: [0, 1],
                      outputRange: ['0%', '100%'],
                    }),
                  },
                ]}
              />
            </View>
          </View>

          {/* Loading dots */}
          <View style={styles.loadingDots}>
            <Animated.View style={[styles.dot, { opacity: dotOpacity1 }]} />
            <Animated.View style={[styles.dot, { opacity: dotOpacity2 }]} />
            <Animated.View style={[styles.dot, { opacity: dotOpacity3 }]} />
          </View>

          {/* Footer */}
          <Text style={styles.footerText}>Connecting Shippers & Carriers</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  background: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  topAccent: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 4,
    backgroundColor: '#14532d',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  logoSection: {
    marginBottom: 20,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: '#14532d',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#14532d',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
  },
  logoIcon: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  truckScene: {
    width: width,
    height: 120,
    marginVertical: 30,
    position: 'relative',
    overflow: 'hidden',
  },
  road: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 24,
    overflow: 'hidden',
  },
  roadSurface: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 20,
    backgroundColor: '#e5e7eb',
    borderTopWidth: 2,
    borderTopColor: '#d1d5db',
  },
  roadLinesContainer: {
    position: 'absolute',
    bottom: 8,
    left: 0,
    flexDirection: 'row',
    width: width * 3,
  },
  roadLine: {
    width: 30,
    height: 3,
    backgroundColor: '#9ca3af',
    marginHorizontal: 20,
    borderRadius: 2,
  },
  truckContainer: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    width: 140,
    height: 70,
  },
  cargoArea: {
    position: 'absolute',
    left: 55,
    bottom: 35,
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  cargoBox1: {
    width: 36,
    height: 28,
    backgroundColor: '#f59e0b',
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#d97706',
  },
  cargoBox2: {
    width: 26,
    height: 22,
    backgroundColor: '#3b82f6',
    borderRadius: 3,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 3,
    borderWidth: 1,
    borderColor: '#2563eb',
  },
  cargoBox3: {
    width: 20,
    height: 16,
    backgroundColor: '#ef4444',
    borderRadius: 2,
    marginLeft: 3,
    borderWidth: 1,
    borderColor: '#dc2626',
  },
  trailer: {
    position: 'absolute',
    left: 48,
    bottom: 12,
    width: 85,
    height: 28,
    backgroundColor: '#374151',
    borderRadius: 3,
    borderWidth: 1,
    borderColor: '#1f2937',
  },
  trailerSide: {
    position: 'absolute',
    top: 2,
    left: 2,
    right: 2,
    height: 3,
    backgroundColor: '#4b5563',
    borderRadius: 1,
  },
  truckCab: {
    position: 'absolute',
    left: 0,
    bottom: 8,
    width: 55,
    height: 42,
    backgroundColor: '#14532d',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#166534',
  },
  cabWindow: {
    position: 'absolute',
    top: 5,
    left: 5,
    right: 5,
    height: 14,
    backgroundColor: '#86efac',
    borderRadius: 3,
    borderWidth: 1,
    borderColor: '#4ade80',
  },
  cabGrill: {
    position: 'absolute',
    bottom: 4,
    left: 4,
    right: 4,
    height: 8,
    backgroundColor: '#166534',
    borderRadius: 2,
  },
  wheel: {
    position: 'absolute',
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#1f2937',
    borderWidth: 2,
    borderColor: '#374151',
    alignItems: 'center',
    justifyContent: 'center',
  },
  wheelFront: {
    left: 10,
    bottom: 0,
  },
  wheelMiddle: {
    left: 55,
    bottom: 0,
  },
  wheelBack: {
    left: 110,
    bottom: 0,
  },
  wheelHub: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#6b7280',
  },
  wheelSpoke: {
    position: 'absolute',
    width: 1,
    height: 12,
    backgroundColor: '#4b5563',
  },
  textContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 8,
  },
  appName: {
    fontSize: 42,
    fontWeight: '300',
    color: '#1f2937',
    letterSpacing: -1,
  },
  appNameBold: {
    fontSize: 42,
    fontWeight: '700',
    color: '#14532d',
    letterSpacing: -1,
  },
  tagline: {
    fontSize: 15,
    color: '#6b7280',
    fontWeight: '500',
    marginBottom: 20,
  },
  featuresRow: {
    flexDirection: 'row',
    gap: 12,
  },
  featurePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0fdf4',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
    borderWidth: 1,
    borderColor: '#dcfce7',
  },
  featureText: {
    fontSize: 12,
    color: '#14532d',
    fontWeight: '600',
  },
  bottomSection: {
    paddingHorizontal: 40,
    paddingBottom: 50,
    alignItems: 'center',
  },
  progressContainer: {
    width: '100%',
    marginBottom: 16,
  },
  progressTrack: {
    height: 4,
    backgroundColor: '#e5e7eb',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#14532d',
    borderRadius: 2,
  },
  loadingDots: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 16,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#14532d',
  },
  footerText: {
    fontSize: 13,
    color: '#9ca3af',
    fontWeight: '500',
  },
});
