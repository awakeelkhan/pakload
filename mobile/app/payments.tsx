import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Linking,
  Clipboard,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';

interface PaymentMethod {
  id: string;
  name: string;
  type: 'bank' | 'mobile' | 'international';
  icon: string;
  color: string;
  details: {
    label: string;
    value: string;
    copyable?: boolean;
  }[];
}

const PAYMENT_METHODS: PaymentMethod[] = [
  {
    id: 'hbl',
    name: 'Habib Bank Limited (HBL)',
    type: 'bank',
    icon: 'business',
    color: '#006747',
    details: [
      { label: 'Account Title', value: 'PakLoad Logistics Pvt Ltd', copyable: true },
      { label: 'Account Number', value: '1234-5678-9012-3456', copyable: true },
      { label: 'IBAN', value: 'PK36HABB0001234567890123', copyable: true },
      { label: 'Branch', value: 'Islamabad Main Branch' },
    ],
  },
  {
    id: 'mcb',
    name: 'MCB Bank',
    type: 'bank',
    icon: 'business',
    color: '#00A651',
    details: [
      { label: 'Account Title', value: 'PakLoad Logistics Pvt Ltd', copyable: true },
      { label: 'Account Number', value: '0987-6543-2109-8765', copyable: true },
      { label: 'IBAN', value: 'PK36MUCB0009876543210987', copyable: true },
      { label: 'Branch', value: 'Karachi Clifton Branch' },
    ],
  },
  {
    id: 'easypaisa',
    name: 'EasyPaisa',
    type: 'mobile',
    icon: 'phone-portrait',
    color: '#00A651',
    details: [
      { label: 'Account Title', value: 'PakLoad Logistics', copyable: true },
      { label: 'Mobile Number', value: '0345-1234567', copyable: true },
    ],
  },
  {
    id: 'jazzcash',
    name: 'JazzCash',
    type: 'mobile',
    icon: 'phone-portrait',
    color: '#ED1C24',
    details: [
      { label: 'Account Title', value: 'PakLoad Logistics', copyable: true },
      { label: 'Mobile Number', value: '0300-1234567', copyable: true },
    ],
  },
  {
    id: 'upaisa',
    name: 'UPaisa',
    type: 'mobile',
    icon: 'phone-portrait',
    color: '#FF6B00',
    details: [
      { label: 'Account Title', value: 'PakLoad Logistics', copyable: true },
      { label: 'Mobile Number', value: '0333-1234567', copyable: true },
    ],
  },
  {
    id: 'sadapay',
    name: 'SadaPay',
    type: 'mobile',
    icon: 'card',
    color: '#FF1493',
    details: [
      { label: 'Account Title', value: 'PakLoad Logistics Pvt Ltd', copyable: true },
      { label: 'Account Number', value: 'SP-1234567890', copyable: true },
    ],
  },
  {
    id: 'nayapay',
    name: 'NayaPay',
    type: 'mobile',
    icon: 'card',
    color: '#00CED1',
    details: [
      { label: 'Account Title', value: 'PakLoad Logistics Pvt Ltd', copyable: true },
      { label: 'Account Number', value: 'NP-9876543210', copyable: true },
    ],
  },
  {
    id: 'wise',
    name: 'Wise (International)',
    type: 'international',
    icon: 'globe',
    color: '#00B9FF',
    details: [
      { label: 'Email', value: 'payments@pakload.com', copyable: true },
      { label: 'Currency', value: 'USD, EUR, GBP' },
    ],
  },
];

export default function PaymentsScreen() {
  const router = useRouter();
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
  const [transactionId, setTransactionId] = useState('');
  const [amount, setAmount] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [proofImage, setProofImage] = useState<string | null>(null);

  const pickProofImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Please allow access to your photo library to upload payment proof.');
      return;
    }
    
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });
    
    if (!result.canceled && result.assets[0]) {
      setProofImage(result.assets[0].uri);
    }
  };

  const takeProofPhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Please allow camera access to take a photo of payment proof.');
      return;
    }
    
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 0.8,
    });
    
    if (!result.canceled && result.assets[0]) {
      setProofImage(result.assets[0].uri);
    }
  };

  const handleCopy = (text: string, label: string) => {
    Clipboard.setString(text);
    Alert.alert('Copied', `${label} copied to clipboard`);
  };

  const handleSubmitPayment = () => {
    if (!selectedMethod || !transactionId.trim() || !amount.trim()) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }

    setSubmitting(true);
    // Simulate API call
    setTimeout(() => {
      setSubmitting(false);
      Alert.alert(
        'Payment Submitted',
        'Your payment has been submitted for verification. You will be notified once approved.',
        [{ text: 'OK', onPress: () => {
          setTransactionId('');
          setAmount('');
          setSelectedMethod(null);
        }}]
      );
    }, 1500);
  };

  const renderPaymentMethod = (method: PaymentMethod) => {
    const isSelected = selectedMethod === method.id;

    return (
      <TouchableOpacity
        key={method.id}
        style={[styles.methodCard, isSelected && { borderColor: method.color, borderWidth: 2 }]}
        onPress={() => setSelectedMethod(isSelected ? null : method.id)}
      >
        <View style={styles.methodHeader}>
          <View style={[styles.methodIcon, { backgroundColor: method.color + '20' }]}>
            <Ionicons name={method.icon as any} size={24} color={method.color} />
          </View>
          <View style={styles.methodInfo}>
            <Text style={styles.methodName}>{method.name}</Text>
            <Text style={styles.methodType}>
              {method.type === 'bank' ? 'Bank Transfer' : 
               method.type === 'mobile' ? 'Mobile Wallet' : 'International'}
            </Text>
          </View>
          <Ionicons 
            name={isSelected ? 'chevron-up' : 'chevron-down'} 
            size={20} 
            color="#9CA3AF" 
          />
        </View>

        {isSelected && (
          <View style={styles.methodDetails}>
            {method.details.map((detail, index) => (
              <View key={index} style={styles.detailRow}>
                <Text style={styles.detailLabel}>{detail.label}</Text>
                <View style={styles.detailValueContainer}>
                  <Text style={styles.detailValue}>{detail.value}</Text>
                  {detail.copyable && (
                    <TouchableOpacity 
                      onPress={() => handleCopy(detail.value, detail.label)}
                      style={styles.copyButton}
                    >
                      <Ionicons name="copy-outline" size={16} color="#3B82F6" />
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            ))}
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#16a34a', '#15803d']} style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Payment Options</Text>
          <Text style={styles.headerSubtitle}>Choose your payment method</Text>
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Payment Methods */}
        <Text style={styles.sectionTitle}>Available Payment Methods</Text>
        
        <Text style={styles.categoryTitle}>Bank Transfer</Text>
        {PAYMENT_METHODS.filter(m => m.type === 'bank').map(renderPaymentMethod)}

        <Text style={styles.categoryTitle}>Mobile Wallets</Text>
        {PAYMENT_METHODS.filter(m => m.type === 'mobile').map(renderPaymentMethod)}

        <Text style={styles.categoryTitle}>International</Text>
        {PAYMENT_METHODS.filter(m => m.type === 'international').map(renderPaymentMethod)}

        {/* Submit Payment */}
        {selectedMethod && (
          <View style={styles.submitCard}>
            <Text style={styles.submitTitle}>Submit Payment Confirmation</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Transaction ID / Reference</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter transaction ID"
                placeholderTextColor="#9CA3AF"
                value={transactionId}
                onChangeText={setTransactionId}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Amount (PKR)</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter amount"
                placeholderTextColor="#9CA3AF"
                value={amount}
                onChangeText={setAmount}
                keyboardType="numeric"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Payment Proof (Screenshot/Photo)</Text>
              {proofImage ? (
                <View style={styles.proofImageContainer}>
                  <Image source={{ uri: proofImage }} style={styles.proofImage} />
                  <TouchableOpacity 
                    style={styles.removeProofButton}
                    onPress={() => setProofImage(null)}
                  >
                    <Ionicons name="close-circle" size={24} color="#dc2626" />
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={styles.proofButtonsRow}>
                  <TouchableOpacity style={styles.proofButton} onPress={pickProofImage}>
                    <Ionicons name="image" size={20} color="#16a34a" />
                    <Text style={styles.proofButtonText}>Gallery</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.proofButton} onPress={takeProofPhoto}>
                    <Ionicons name="camera" size={20} color="#16a34a" />
                    <Text style={styles.proofButtonText}>Camera</Text>
                  </TouchableOpacity>
                </View>
              )}
              <Text style={styles.proofHint}>Upload a screenshot of your payment confirmation</Text>
            </View>

            <TouchableOpacity
              style={[styles.submitButton, submitting && styles.buttonDisabled]}
              onPress={handleSubmitPayment}
              disabled={submitting}
            >
              {submitting ? (
                <Text style={styles.buttonText}>Submitting...</Text>
              ) : (
                <>
                  <Ionicons name="checkmark-circle" size={20} color="#fff" />
                  <Text style={styles.buttonText}>Submit for Verification</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        )}

        {/* Instructions */}
        <View style={styles.instructionsCard}>
          <Ionicons name="information-circle" size={24} color="#3B82F6" />
          <View style={styles.instructionsContent}>
            <Text style={styles.instructionsTitle}>How to Pay</Text>
            <Text style={styles.instructionsText}>1. Select a payment method above</Text>
            <Text style={styles.instructionsText}>2. Transfer the amount using the provided details</Text>
            <Text style={styles.instructionsText}>3. Enter the transaction ID and amount</Text>
            <Text style={styles.instructionsText}>4. Submit for verification</Text>
            <Text style={styles.instructionsText}>5. Wait for admin approval (usually within 24 hours)</Text>
          </View>
        </View>

        {/* Support */}
        <View style={styles.supportCard}>
          <Text style={styles.supportTitle}>Need Help?</Text>
          <Text style={styles.supportText}>Contact our support team for payment assistance</Text>
          <TouchableOpacity 
            style={styles.supportButton}
            onPress={() => Linking.openURL('mailto:support@pakload.com')}
          >
            <Ionicons name="mail" size={18} color="#fff" />
            <Text style={styles.supportButtonText}>Contact Support</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 32 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 48,
    paddingBottom: 16,
    paddingHorizontal: 16,
  },
  backButton: {
    padding: 8,
  },
  headerContent: {
    marginLeft: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 16,
  },
  categoryTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
    marginTop: 16,
    marginBottom: 8,
  },
  methodCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  methodHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  methodIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  methodInfo: {
    flex: 1,
    marginLeft: 12,
  },
  methodName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1F2937',
  },
  methodType: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  methodDetails: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  detailLabel: {
    fontSize: 13,
    color: '#6B7280',
  },
  detailValueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailValue: {
    fontSize: 13,
    fontWeight: '500',
    color: '#1F2937',
  },
  copyButton: {
    padding: 4,
  },
  submitCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    borderWidth: 2,
    borderColor: '#16a34a',
  },
  submitTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    padding: 14,
    fontSize: 15,
    color: '#1F2937',
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#16a34a',
    padding: 16,
    borderRadius: 10,
    gap: 8,
  },
  buttonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  instructionsCard: {
    flexDirection: 'row',
    backgroundColor: '#EFF6FF',
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    gap: 12,
  },
  instructionsContent: {
    flex: 1,
  },
  instructionsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E40AF',
    marginBottom: 8,
  },
  instructionsText: {
    fontSize: 12,
    color: '#3B82F6',
    marginBottom: 4,
  },
  supportCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    alignItems: 'center',
  },
  supportTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
  },
  supportText: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 4,
    marginBottom: 12,
  },
  supportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3B82F6',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    gap: 8,
  },
  supportButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  proofImageContainer: {
    position: 'relative',
    marginTop: 8,
  },
  proofImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    backgroundColor: '#f1f5f9',
  },
  removeProofButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#fff',
    borderRadius: 12,
  },
  proofButtonsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  proofButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#f0fdf4',
    borderWidth: 1,
    borderColor: '#16a34a',
    borderStyle: 'dashed',
    borderRadius: 12,
    paddingVertical: 16,
  },
  proofButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#16a34a',
  },
  proofHint: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 8,
  },
});
