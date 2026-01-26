import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, ActivityIndicator, Animated, Keyboard, KeyboardAvoidingView, Platform, Dimensions } from 'react-native';
import { useState, useEffect, useRef } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../src/contexts/AuthContext';
import { authAPI } from '../../src/services/api';

const { width } = Dimensions.get('window');

export default function LoginScreen() {
  const router = useRouter();
  const { login, loginWithOtp, loginWithGoogle, isAuthenticated } = useAuth();
  
  // Animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const buttonScale = useRef(new Animated.Value(1)).current;
  
  // Redirect if already authenticated (e.g., after Google login)
  useEffect(() => {
    if (isAuthenticated) {
      router.replace('/(tabs)');
    }
  }, [isAuthenticated]);
  
  // Entry animation
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);
  
  const [loginMethod, setLoginMethod] = useState<'email' | 'phone'>('email');
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    phone: '',
    password: '',
    otp: '',
  });
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const triggerShake = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
    ]).start();
  };
  
  const animateButton = () => {
    Animated.sequence([
      Animated.timing(buttonScale, { toValue: 0.95, duration: 100, useNativeDriver: true }),
      Animated.timing(buttonScale, { toValue: 1, duration: 100, useNativeDriver: true }),
    ]).start();
  };

  const handleLogin = async () => {
    Keyboard.dismiss();
    setErrors({});
    animateButton();
    
    if (loginMethod === 'email') {
      if (!formData.email) {
        setErrors({ email: 'Email is required' });
        triggerShake();
        return;
      }
      if (!validateEmail(formData.email)) {
        setErrors({ email: 'Please enter a valid email' });
        triggerShake();
        return;
      }
      if (!formData.password) {
        setErrors({ password: 'Password is required' });
        triggerShake();
        return;
      }
      
      setIsLoading(true);
      try {
        await login(formData.email, formData.password);
        router.replace('/(tabs)');
      } catch (error: any) {
        triggerShake();
        Alert.alert(
          'Login Failed', 
          error.message || 'Invalid email or password. Please check your credentials and try again.',
          [{ text: 'OK', style: 'default' }]
        );
      } finally {
        setIsLoading(false);
      }
    } else {
      if (!formData.otp) {
        setErrors({ otp: 'OTP is required' });
        return;
      }
      
      setIsLoading(true);
      try {
        await loginWithOtp(formData.phone, formData.otp);
        router.replace('/(tabs)');
      } catch (error: any) {
        Alert.alert('Verification Failed', error.message || 'Invalid OTP');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleRequestOtp = async () => {
    if (!formData.phone) {
      setErrors({ phone: 'Phone number is required' });
      return;
    }
    
    setIsLoading(true);
    try {
      await authAPI.requestOtp(formData.phone);
      setShowOtpInput(true);
      Alert.alert('OTP Sent', 'Please check your phone for the verification code');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to send OTP');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialLogin = async (provider: string) => {
    if (provider === 'google') {
      setIsLoading(true);
      try {
        await loginWithGoogle();
      } catch (error: any) {
        Alert.alert('Google Login Failed', error.message || 'Could not sign in with Google');
      } finally {
        setIsLoading(false);
      }
    } else {
      Alert.alert('Coming Soon', `${provider} login will be available soon`);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <LinearGradient
        colors={['#f0fdf4', '#dcfce7', '#f0fdf4']}
        style={styles.gradient}
      >
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Animated.View 
            style={[
              styles.content,
              {
                opacity: fadeAnim,
                transform: [
                  { translateY: slideAnim },
                  { translateX: shakeAnim },
                ],
              },
            ]}
          >
            {/* Logo */}
            <View style={styles.logoContainer}>
              <View style={styles.logoIcon}>
                <Ionicons name="cube" size={40} color="#fff" />
              </View>
            </View>
            
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.title}>Welcome Back</Text>
              <Text style={styles.subtitle}>Sign in to your PakLoad account</Text>
            </View>

        {/* Social Login */}
        <View style={styles.socialContainer}>
          <TouchableOpacity
            style={styles.socialButton}
            onPress={() => handleSocialLogin('google')}
          >
            <Ionicons name="logo-google" size={24} color="#DB4437" />
            <Text style={styles.socialButtonText}>Continue with Google</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.socialButton}
            onPress={() => handleSocialLogin('facebook')}
          >
            <Ionicons name="logo-facebook" size={24} color="#1877F2" />
            <Text style={styles.socialButtonText}>Continue with Facebook</Text>
          </TouchableOpacity>
        </View>

        {/* Divider */}
        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>Or continue with</Text>
          <View style={styles.dividerLine} />
        </View>

        {/* Login Method Toggle */}
        <View style={styles.toggleContainer}>
          <TouchableOpacity
            style={[styles.toggleButton, loginMethod === 'email' && styles.toggleButtonActive]}
            onPress={() => setLoginMethod('email')}
          >
            <Text style={[styles.toggleButtonText, loginMethod === 'email' && styles.toggleButtonTextActive]}>
              Email
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.toggleButton, loginMethod === 'phone' && styles.toggleButtonActive]}
            onPress={() => setLoginMethod('phone')}
          >
            <Text style={[styles.toggleButtonText, loginMethod === 'phone' && styles.toggleButtonTextActive]}>
              Phone
            </Text>
          </TouchableOpacity>
        </View>

        {/* Login Form */}
        {loginMethod === 'email' ? (
          <View style={styles.form}>
            <View style={styles.inputContainer}>
              <Ionicons name="mail-outline" size={20} color="#6b7280" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Email address"
                value={formData.email}
                onChangeText={(text) => setFormData({...formData, email: text})}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputContainer}>
              <Ionicons name="lock-closed-outline" size={20} color="#6b7280" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Password"
                value={formData.password}
                onChangeText={(text) => setFormData({...formData, password: text})}
                secureTextEntry
              />
            </View>

            <TouchableOpacity>
              <Text style={styles.forgotPassword}>Forgot password?</Text>
            </TouchableOpacity>

            {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
            {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}

            <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
              <TouchableOpacity 
                style={[styles.loginButton, isLoading && styles.loginButtonDisabled]} 
                onPress={handleLogin}
                disabled={isLoading}
                activeOpacity={0.8}
              >
                {isLoading ? (
                  <View style={styles.loadingContainer}>
                    <ActivityIndicator size="small" color="#fff" />
                    <Text style={styles.loadingText}>Signing in...</Text>
                  </View>
                ) : (
                  <Text style={styles.loginButtonText}>Sign In</Text>
                )}
              </TouchableOpacity>
            </Animated.View>
          </View>
        ) : (
          <View style={styles.form}>
            <View style={styles.inputContainer}>
              <Ionicons name="call-outline" size={20} color="#6b7280" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="+92 300 1234567"
                value={formData.phone}
                onChangeText={(text) => setFormData({...formData, phone: text})}
                keyboardType="phone-pad"
              />
            </View>

            {!showOtpInput ? (
              <TouchableOpacity style={styles.loginButton} onPress={handleRequestOtp}>
                <Text style={styles.loginButtonText}>Request OTP</Text>
              </TouchableOpacity>
            ) : (
              <>
                <View style={styles.inputContainer}>
                  <TextInput
                    style={[styles.input, styles.otpInput]}
                    placeholder="Enter 6-digit OTP"
                    value={formData.otp}
                    onChangeText={(text) => setFormData({...formData, otp: text})}
                    keyboardType="number-pad"
                    maxLength={6}
                  />
                </View>

                <TouchableOpacity onPress={handleRequestOtp}>
                  <Text style={styles.resendOtp}>Didn't receive code? Resend</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
                  <Text style={styles.loginButtonText}>Verify & Sign In</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        )}

            {/* Sign Up Link */}
            <View style={styles.signupContainer}>
              <Text style={styles.signupText}>Don't have an account? </Text>
              <TouchableOpacity onPress={() => router.push('/auth/register')}>
                <Text style={styles.signupLink}>Sign Up</Text>
              </TouchableOpacity>
            </View>
            
            {/* Terms */}
            <Text style={styles.termsText}>
              By signing in, you agree to our Terms of Service and Privacy Policy
            </Text>
          </Animated.View>
        </ScrollView>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingVertical: 40,
  },
  content: {
    padding: 24,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  logoIcon: {
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: '#22c55e',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#22c55e',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  header: {
    marginBottom: 32,
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
  },
  socialContainer: {
    gap: 12,
    marginBottom: 24,
  },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  socialButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#e5e7eb',
  },
  dividerText: {
    marginHorizontal: 16,
    fontSize: 14,
    color: '#6b7280',
  },
  toggleContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  toggleButton: {
    flex: 1,
    padding: 12,
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    alignItems: 'center',
  },
  toggleButtonActive: {
    backgroundColor: '#22c55e',
  },
  toggleButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6b7280',
  },
  toggleButtonTextActive: {
    color: '#fff',
  },
  form: {
    gap: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    paddingHorizontal: 16,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    paddingVertical: 16,
    fontSize: 16,
    color: '#1f2937',
  },
  otpInput: {
    textAlign: 'center',
    fontSize: 24,
    letterSpacing: 8,
  },
  forgotPassword: {
    fontSize: 14,
    color: '#22c55e',
    textAlign: 'right',
  },
  resendOtp: {
    fontSize: 14,
    color: '#22c55e',
    textAlign: 'center',
  },
  loginButton: {
    backgroundColor: '#22c55e',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  loginButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  signupText: {
    fontSize: 14,
    color: '#6b7280',
  },
  signupLink: {
    fontSize: 14,
    fontWeight: '600',
    color: '#22c55e',
  },
  loginButtonDisabled: {
    opacity: 0.7,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  loadingText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  errorText: {
    color: '#dc2626',
    fontSize: 14,
    marginTop: -8,
    marginBottom: 8,
    marginLeft: 4,
  },
  termsText: {
    fontSize: 12,
    color: '#9ca3af',
    textAlign: 'center',
    marginTop: 24,
    lineHeight: 18,
  },
});
