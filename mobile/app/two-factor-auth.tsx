import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, ActivityIndicator, Switch } from 'react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../src/contexts/AuthContext';

export default function TwoFactorAuthScreen() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuth();
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);
  const [showSetup, setShowSetup] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<'method' | 'verify'>('method');
  const [selectedMethod, setSelectedMethod] = useState<'sms' | 'email' | 'app'>('sms');

  const handleEnable2FA = () => {
    setShowSetup(true);
    setStep('method');
  };

  const handleSelectMethod = (method: 'sms' | 'email' | 'app') => {
    setSelectedMethod(method);
    setStep('verify');
    
    // Simulate sending verification code
    const destination = method === 'sms' ? user?.phone : user?.email;
    Alert.alert(
      'Verification Code Sent',
      `A 6-digit code has been sent to ${destination || 'your registered ' + method}`
    );
  };

  const handleVerify = () => {
    if (verificationCode.length !== 6) {
      Alert.alert('Error', 'Please enter a valid 6-digit code');
      return;
    }

    setIsLoading(true);
    
    // Simulate verification
    setTimeout(() => {
      setIsLoading(false);
      setIs2FAEnabled(true);
      setShowSetup(false);
      setVerificationCode('');
      Alert.alert('Success', 'Two-Factor Authentication has been enabled successfully!');
    }, 1500);
  };

  const handleDisable2FA = () => {
    Alert.alert(
      'Disable 2FA',
      'Are you sure you want to disable Two-Factor Authentication? This will make your account less secure.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Disable', 
          style: 'destructive',
          onPress: () => {
            setIs2FAEnabled(false);
            Alert.alert('2FA Disabled', 'Two-Factor Authentication has been disabled.');
          }
        },
      ]
    );
  };

  if (!isAuthenticated) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#14532d" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Two-Factor Auth</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.emptyState}>
          <Ionicons name="lock-closed-outline" size={64} color="#d1d5db" />
          <Text style={styles.emptyTitle}>Sign In Required</Text>
          <Text style={styles.emptyText}>Please sign in to manage two-factor authentication</Text>
          <TouchableOpacity style={styles.signInButton} onPress={() => router.push('/auth/login')}>
            <Text style={styles.signInButtonText}>Sign In</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#14532d" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Two-Factor Auth</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Status Card */}
        <View style={styles.statusCard}>
          <View style={[styles.statusIcon, is2FAEnabled ? styles.statusIconEnabled : styles.statusIconDisabled]}>
            <Ionicons 
              name={is2FAEnabled ? "shield-checkmark" : "shield-outline"} 
              size={32} 
              color={is2FAEnabled ? "#16a34a" : "#6b7280"} 
            />
          </View>
          <Text style={styles.statusTitle}>
            {is2FAEnabled ? 'Two-Factor Authentication is ON' : 'Two-Factor Authentication is OFF'}
          </Text>
          <Text style={styles.statusText}>
            {is2FAEnabled 
              ? 'Your account is protected with an additional layer of security.'
              : 'Add an extra layer of security to your account by requiring a verification code when signing in.'}
          </Text>
          
          {!showSetup && (
            <TouchableOpacity 
              style={[styles.toggleButton, is2FAEnabled ? styles.toggleButtonDisable : styles.toggleButtonEnable]}
              onPress={is2FAEnabled ? handleDisable2FA : handleEnable2FA}
            >
              <Text style={[styles.toggleButtonText, is2FAEnabled ? styles.toggleButtonTextDisable : styles.toggleButtonTextEnable]}>
                {is2FAEnabled ? 'Disable 2FA' : 'Enable 2FA'}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Setup Flow */}
        {showSetup && (
          <View style={styles.setupCard}>
            {step === 'method' ? (
              <>
                <Text style={styles.setupTitle}>Choose Verification Method</Text>
                <Text style={styles.setupText}>How would you like to receive your verification codes?</Text>
                
                <TouchableOpacity style={styles.methodOption} onPress={() => handleSelectMethod('sms')}>
                  <View style={[styles.methodIcon, { backgroundColor: '#dcfce7' }]}>
                    <Ionicons name="chatbubble-outline" size={24} color="#16a34a" />
                  </View>
                  <View style={styles.methodInfo}>
                    <Text style={styles.methodTitle}>SMS</Text>
                    <Text style={styles.methodText}>Receive codes via text message</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
                </TouchableOpacity>

                <TouchableOpacity style={styles.methodOption} onPress={() => handleSelectMethod('email')}>
                  <View style={[styles.methodIcon, { backgroundColor: '#dbeafe' }]}>
                    <Ionicons name="mail-outline" size={24} color="#2563eb" />
                  </View>
                  <View style={styles.methodInfo}>
                    <Text style={styles.methodTitle}>Email</Text>
                    <Text style={styles.methodText}>Receive codes via email</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.cancelButton} 
                  onPress={() => setShowSetup(false)}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <Text style={styles.setupTitle}>Enter Verification Code</Text>
                <Text style={styles.setupText}>
                  Enter the 6-digit code sent to your {selectedMethod === 'sms' ? 'phone' : 'email'}
                </Text>
                
                <TextInput
                  style={styles.codeInput}
                  value={verificationCode}
                  onChangeText={setVerificationCode}
                  placeholder="000000"
                  placeholderTextColor="#9ca3af"
                  keyboardType="number-pad"
                  maxLength={6}
                  textAlign="center"
                />

                <TouchableOpacity 
                  style={[styles.verifyButton, isLoading && styles.verifyButtonDisabled]}
                  onPress={handleVerify}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Text style={styles.verifyButtonText}>Verify & Enable</Text>
                  )}
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.cancelButton} 
                  onPress={() => { setStep('method'); setVerificationCode(''); }}
                >
                  <Text style={styles.cancelButtonText}>Back</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        )}

        {/* Info Section */}
        <View style={styles.infoSection}>
          <Text style={styles.infoTitle}>Why use Two-Factor Authentication?</Text>
          <View style={styles.infoItem}>
            <Ionicons name="checkmark-circle" size={20} color="#16a34a" />
            <Text style={styles.infoText}>Protects your account even if your password is compromised</Text>
          </View>
          <View style={styles.infoItem}>
            <Ionicons name="checkmark-circle" size={20} color="#16a34a" />
            <Text style={styles.infoText}>Prevents unauthorized access to your loads and payments</Text>
          </View>
          <View style={styles.infoItem}>
            <Ionicons name="checkmark-circle" size={20} color="#16a34a" />
            <Text style={styles.infoText}>Required for high-value transactions</Text>
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0fdf4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  statusCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  statusIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  statusIconEnabled: {
    backgroundColor: '#dcfce7',
  },
  statusIconDisabled: {
    backgroundColor: '#f3f4f6',
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 8,
    textAlign: 'center',
  },
  statusText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  toggleButton: {
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
  },
  toggleButtonEnable: {
    backgroundColor: '#14532d',
  },
  toggleButtonDisable: {
    backgroundColor: '#fef2f2',
  },
  toggleButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  toggleButtonTextEnable: {
    color: '#fff',
  },
  toggleButtonTextDisable: {
    color: '#dc2626',
  },
  setupCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  setupTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 8,
  },
  setupText: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 20,
  },
  methodOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    marginBottom: 12,
  },
  methodIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  methodInfo: {
    flex: 1,
    marginLeft: 12,
  },
  methodTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  methodText: {
    fontSize: 13,
    color: '#6b7280',
    marginTop: 2,
  },
  codeInput: {
    backgroundColor: '#f9fafb',
    borderWidth: 2,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    paddingVertical: 16,
    fontSize: 32,
    fontWeight: '700',
    color: '#1f2937',
    letterSpacing: 8,
    marginBottom: 20,
  },
  verifyButton: {
    backgroundColor: '#14532d',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  verifyButtonDisabled: {
    opacity: 0.6,
  },
  verifyButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  cancelButton: {
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  cancelButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#6b7280',
  },
  infoSection: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 16,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: '#4b5563',
    lineHeight: 20,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1f2937',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  signInButton: {
    backgroundColor: '#14532d',
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
  },
  signInButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});
