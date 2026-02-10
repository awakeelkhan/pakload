import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions, StatusBar, Easing } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

interface SplashScreenProps {
  onFinish?: () => void;
}

export default function SplashScreen({ onFinish }: SplashScreenProps) {
  // Animation values
  const logoScale = useRef(new Animated.Value(0)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const logoRotate = useRef(new Animated.Value(0)).current;
  const textSlide = useRef(new Animated.Value(40)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;
  const taglineSlide = useRef(new Animated.Value(30)).current;
  const taglineOpacity = useRef(new Animated.Value(0)).current;
  const progressWidth = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const glowOpacity = useRef(new Animated.Value(0.3)).current;
  const dotScale1 = useRef(new Animated.Value(0.5)).current;
  const dotScale2 = useRef(new Animated.Value(0.5)).current;
  const dotScale3 = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    // Glow animation for logo background
    const glowLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(glowOpacity, {
          toValue: 0.6,
          duration: 1200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(glowOpacity, {
          toValue: 0.3,
          duration: 1200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );

    // Loading dots animation
    const dotsLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(dotScale1, { toValue: 1, duration: 250, useNativeDriver: true }),
        Animated.timing(dotScale2, { toValue: 1, duration: 250, useNativeDriver: true }),
        Animated.timing(dotScale3, { toValue: 1, duration: 250, useNativeDriver: true }),
        Animated.delay(200),
        Animated.parallel([
          Animated.timing(dotScale1, { toValue: 0.5, duration: 250, useNativeDriver: true }),
          Animated.timing(dotScale2, { toValue: 0.5, duration: 250, useNativeDriver: true }),
          Animated.timing(dotScale3, { toValue: 0.5, duration: 250, useNativeDriver: true }),
        ]),
      ])
    );

    // Pulse animation
    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.08,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );

    // Main animation sequence
    Animated.sequence([
      // 1. Logo appears with bounce and slight rotation
      Animated.parallel([
        Animated.spring(logoScale, {
          toValue: 1,
          friction: 5,
          tension: 100,
          useNativeDriver: true,
        }),
        Animated.timing(logoOpacity, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(logoRotate, {
          toValue: 1,
          duration: 600,
          easing: Easing.out(Easing.back(1.2)),
          useNativeDriver: true,
        }),
      ]),
      // 2. App name slides up with spring
      Animated.parallel([
        Animated.spring(textSlide, {
          toValue: 0,
          friction: 6,
          tension: 80,
          useNativeDriver: true,
        }),
        Animated.timing(textOpacity, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
      ]),
      // 3. Tagline slides up
      Animated.parallel([
        Animated.timing(taglineSlide, {
          toValue: 0,
          duration: 400,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(taglineOpacity, {
          toValue: 1,
          duration: 350,
          useNativeDriver: true,
        }),
      ]),
      // 4. Progress bar fills smoothly
      Animated.timing(progressWidth, {
        toValue: 1,
        duration: 2000,
        easing: Easing.bezier(0.4, 0, 0.2, 1),
        useNativeDriver: false,
      }),
    ]).start(() => {
      pulseLoop.stop();
      glowLoop.stop();
      dotsLoop.stop();
      setTimeout(() => onFinish?.(), 150);
    });

    glowLoop.start();
    pulseLoop.start();
    dotsLoop.start();

    return () => {
      pulseLoop.stop();
      glowLoop.stop();
      dotsLoop.stop();
    };
  }, []);

  const rotateInterpolate = logoRotate.interpolate({
    inputRange: [0, 1],
    outputRange: ['-15deg', '0deg'],
  });

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#14532d" translucent />
      
      {/* Full screen gradient background */}
      <LinearGradient
        colors={['#14532d', '#166534', '#15803d', '#16a34a']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={styles.gradient}
      >
        {/* Decorative background elements */}
        <View style={styles.bgPattern}>
          <Animated.View style={[styles.bgCircle, styles.bgCircle1, { opacity: glowOpacity }]} />
          <Animated.View style={[styles.bgCircle, styles.bgCircle2, { opacity: glowOpacity }]} />
          <Animated.View style={[styles.bgCircle, styles.bgCircle3, { opacity: glowOpacity }]} />
          <View style={[styles.bgLine, styles.bgLine1]} />
          <View style={[styles.bgLine, styles.bgLine2]} />
        </View>

        {/* Main content */}
        <View style={styles.content}>
          {/* Logo container with glow effect */}
          <Animated.View
            style={[
              styles.logoWrapper,
              {
                opacity: logoOpacity,
                transform: [
                  { scale: Animated.multiply(logoScale, pulseAnim) },
                  { rotate: rotateInterpolate },
                ],
              },
            ]}
          >
            {/* Glow effect behind logo */}
            <Animated.View style={[styles.logoGlow, { opacity: glowOpacity }]} />
            
            {/* Logo icon container */}
            <View style={styles.logoContainer}>
              <View style={styles.logoInner}>
                <Ionicons name="cube" size={36} color="#fff" />
                <View style={styles.truckIcon}>
                  <Ionicons name="car-sport" size={22} color="#22c55e" />
                </View>
              </View>
            </View>
          </Animated.View>

          {/* App name */}
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
            <Text style={styles.appNameHighlight}>Load</Text>
          </Animated.View>

          {/* Tagline */}
          <Animated.Text
            style={[
              styles.tagline,
              {
                opacity: taglineOpacity,
                transform: [{ translateY: taglineSlide }],
              },
            ]}
          >
            Pakistan's Premier Freight Platform
          </Animated.Text>

          {/* Features badges */}
          <Animated.View
            style={[
              styles.featuresRow,
              {
                opacity: taglineOpacity,
                transform: [{ translateY: taglineSlide }],
              },
            ]}
          >
            <View style={styles.featureBadge}>
              <Ionicons name="shield-checkmark" size={14} color="#86efac" />
              <Text style={styles.featureText}>Verified</Text>
            </View>
            <View style={styles.featureBadge}>
              <Ionicons name="flash" size={14} color="#86efac" />
              <Text style={styles.featureText}>Fast</Text>
            </View>
            <View style={styles.featureBadge}>
              <Ionicons name="lock-closed" size={14} color="#86efac" />
              <Text style={styles.featureText}>Secure</Text>
            </View>
          </Animated.View>
        </View>

        {/* Bottom section */}
        <View style={styles.bottomSection}>
          {/* Progress bar */}
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
            <Animated.View style={[styles.dot, { transform: [{ scale: dotScale1 }] }]} />
            <Animated.View style={[styles.dot, { transform: [{ scale: dotScale2 }] }]} />
            <Animated.View style={[styles.dot, { transform: [{ scale: dotScale3 }] }]} />
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>Connecting Shippers & Carriers</Text>
            <View style={styles.footerDivider} />
            <Text style={styles.versionText}>v1.0.0</Text>
          </View>
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
    width: width,
    height: height,
  },
  bgPattern: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  bgCircle: {
    position: 'absolute',
    borderRadius: 1000,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  bgCircle1: {
    width: width * 0.8,
    height: width * 0.8,
    top: -width * 0.3,
    right: -width * 0.2,
  },
  bgCircle2: {
    width: width * 0.6,
    height: width * 0.6,
    bottom: height * 0.15,
    left: -width * 0.3,
  },
  bgCircle3: {
    width: width * 0.4,
    height: width * 0.4,
    top: height * 0.35,
    right: -width * 0.15,
  },
  bgLine: {
    position: 'absolute',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    transform: [{ rotate: '-35deg' }],
  },
  bgLine1: {
    width: width * 2,
    height: 80,
    top: height * 0.2,
    left: -width * 0.5,
  },
  bgLine2: {
    width: width * 2,
    height: 40,
    top: height * 0.6,
    left: -width * 0.3,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  logoWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  logoGlow: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: 'rgba(134, 239, 172, 0.3)',
  },
  logoContainer: {
    width: 120,
    height: 120,
    borderRadius: 32,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.25)',
  },
  logoInner: {
    width: 90,
    height: 90,
    borderRadius: 24,
    backgroundColor: '#22c55e',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
  },
  truckIcon: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  textContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  appName: {
    fontSize: 48,
    fontWeight: '300',
    color: '#fff',
    letterSpacing: -1,
  },
  appNameHighlight: {
    fontSize: 48,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: -1,
  },
  tagline: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.85)',
    fontWeight: '500',
    letterSpacing: 0.5,
    marginBottom: 24,
  },
  featuresRow: {
    flexDirection: 'row',
    gap: 12,
  },
  featureBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  featureText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '600',
  },
  bottomSection: {
    paddingHorizontal: 40,
    paddingBottom: 60,
    alignItems: 'center',
  },
  progressContainer: {
    width: '100%',
    marginBottom: 20,
  },
  progressTrack: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#86efac',
    borderRadius: 2,
  },
  loadingDots: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 24,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  footerText: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.7)',
    fontWeight: '500',
  },
  footerDivider: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
  },
  versionText: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.5)',
    fontWeight: '500',
  },
});
