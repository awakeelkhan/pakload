import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, ActivityIndicator, Modal } from 'react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../src/contexts/AuthContext';

interface PaymentMethod {
  id: string;
  type: 'bank' | 'card' | 'easypaisa' | 'jazzcash';
  name: string;
  details: string;
  isDefault: boolean;
}

export default function PaymentMethodsScreen() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [showAddModal, setShowAddModal] = useState(false);
  const [addType, setAddType] = useState<'bank' | 'card' | 'easypaisa' | 'jazzcash'>('bank');
  const [isLoading, setIsLoading] = useState(false);
  
  // Form state
  const [bankName, setBankName] = useState('');
  const [accountTitle, setAccountTitle] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [iban, setIban] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');

  // Mock payment methods - in real app, fetch from API
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);

  const getIcon = (type: string) => {
    switch (type) {
      case 'bank': return 'business-outline';
      case 'card': return 'card-outline';
      case 'easypaisa': return 'phone-portrait-outline';
      case 'jazzcash': return 'phone-portrait-outline';
      default: return 'wallet-outline';
    }
  };

  const getColor = (type: string) => {
    switch (type) {
      case 'bank': return '#2563eb';
      case 'card': return '#7c3aed';
      case 'easypaisa': return '#22c55e';
      case 'jazzcash': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const handleAddPayment = () => {
    if (addType === 'bank') {
      if (!bankName || !accountTitle || !accountNumber) {
        Alert.alert('Error', 'Please fill all required fields');
        return;
      }
    } else if (addType === 'easypaisa' || addType === 'jazzcash') {
      if (!mobileNumber || !accountTitle) {
        Alert.alert('Error', 'Please fill all required fields');
        return;
      }
    }

    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      const newMethod: PaymentMethod = {
        id: Date.now().toString(),
        type: addType,
        name: addType === 'bank' ? bankName : addType === 'easypaisa' ? 'Easypaisa' : 'JazzCash',
        details: addType === 'bank' ? `****${accountNumber.slice(-4)}` : mobileNumber,
        isDefault: paymentMethods.length === 0,
      };
      
      setPaymentMethods([...paymentMethods, newMethod]);
      setShowAddModal(false);
      resetForm();
      setIsLoading(false);
      Alert.alert('Success', 'Payment method added successfully');
    }, 1000);
  };

  const resetForm = () => {
    setBankName('');
    setAccountTitle('');
    setAccountNumber('');
    setIban('');
    setMobileNumber('');
  };

  const handleDelete = (id: string) => {
    Alert.alert(
      'Delete Payment Method',
      'Are you sure you want to remove this payment method?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => {
            setPaymentMethods(paymentMethods.filter(m => m.id !== id));
          }
        },
      ]
    );
  };

  const handleSetDefault = (id: string) => {
    setPaymentMethods(paymentMethods.map(m => ({
      ...m,
      isDefault: m.id === id,
    })));
  };

  if (!isAuthenticated) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#14532d" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Payment Methods</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.emptyState}>
          <Ionicons name="lock-closed-outline" size={64} color="#d1d5db" />
          <Text style={styles.emptyTitle}>Sign In Required</Text>
          <Text style={styles.emptyText}>Please sign in to manage your payment methods</Text>
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
        <Text style={styles.headerTitle}>Payment Methods</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Add Payment Options */}
        <Text style={styles.sectionTitle}>Add Payment Method</Text>
        <View style={styles.addOptionsRow}>
          <TouchableOpacity 
            style={styles.addOption} 
            onPress={() => { setAddType('bank'); setShowAddModal(true); }}
          >
            <View style={[styles.addOptionIcon, { backgroundColor: '#dbeafe' }]}>
              <Ionicons name="business-outline" size={24} color="#2563eb" />
            </View>
            <Text style={styles.addOptionText}>Bank Account</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.addOption} 
            onPress={() => { setAddType('easypaisa'); setShowAddModal(true); }}
          >
            <View style={[styles.addOptionIcon, { backgroundColor: '#dcfce7' }]}>
              <Ionicons name="phone-portrait-outline" size={24} color="#22c55e" />
            </View>
            <Text style={styles.addOptionText}>Easypaisa</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.addOption} 
            onPress={() => { setAddType('jazzcash'); setShowAddModal(true); }}
          >
            <View style={[styles.addOptionIcon, { backgroundColor: '#fee2e2' }]}>
              <Ionicons name="phone-portrait-outline" size={24} color="#ef4444" />
            </View>
            <Text style={styles.addOptionText}>JazzCash</Text>
          </TouchableOpacity>
        </View>

        {/* Saved Payment Methods */}
        <Text style={styles.sectionTitle}>Saved Methods</Text>
        {paymentMethods.length === 0 ? (
          <View style={styles.noMethods}>
            <Ionicons name="wallet-outline" size={48} color="#d1d5db" />
            <Text style={styles.noMethodsText}>No payment methods added yet</Text>
            <Text style={styles.noMethodsSubtext}>Add a bank account or mobile wallet to receive payments</Text>
          </View>
        ) : (
          <View style={styles.methodsList}>
            {paymentMethods.map((method) => (
              <View key={method.id} style={styles.methodCard}>
                <View style={[styles.methodIcon, { backgroundColor: `${getColor(method.type)}15` }]}>
                  <Ionicons name={getIcon(method.type) as any} size={24} color={getColor(method.type)} />
                </View>
                <View style={styles.methodInfo}>
                  <View style={styles.methodHeader}>
                    <Text style={styles.methodName}>{method.name}</Text>
                    {method.isDefault && (
                      <View style={styles.defaultBadge}>
                        <Text style={styles.defaultBadgeText}>Default</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.methodDetails}>{method.details}</Text>
                </View>
                <View style={styles.methodActions}>
                  {!method.isDefault && (
                    <TouchableOpacity onPress={() => handleSetDefault(method.id)}>
                      <Ionicons name="star-outline" size={20} color="#6b7280" />
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity onPress={() => handleDelete(method.id)}>
                    <Ionicons name="trash-outline" size={20} color="#ef4444" />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Info Section */}
        <View style={styles.infoSection}>
          <Ionicons name="shield-checkmark-outline" size={20} color="#22c55e" />
          <Text style={styles.infoText}>
            Your payment information is encrypted and securely stored. We never share your details with third parties.
          </Text>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Add Payment Modal */}
      <Modal
        visible={showAddModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowAddModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                Add {addType === 'bank' ? 'Bank Account' : addType === 'easypaisa' ? 'Easypaisa' : 'JazzCash'}
              </Text>
              <TouchableOpacity onPress={() => setShowAddModal(false)}>
                <Ionicons name="close" size={24} color="#6b7280" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              {addType === 'bank' ? (
                <>
                  <Text style={styles.inputLabel}>Bank Name *</Text>
                  <TextInput
                    style={styles.input}
                    value={bankName}
                    onChangeText={setBankName}
                    placeholder="e.g., HBL, UBL, MCB"
                    placeholderTextColor="#9ca3af"
                  />

                  <Text style={styles.inputLabel}>Account Title *</Text>
                  <TextInput
                    style={styles.input}
                    value={accountTitle}
                    onChangeText={setAccountTitle}
                    placeholder="Name on account"
                    placeholderTextColor="#9ca3af"
                  />

                  <Text style={styles.inputLabel}>Account Number *</Text>
                  <TextInput
                    style={styles.input}
                    value={accountNumber}
                    onChangeText={setAccountNumber}
                    placeholder="Enter account number"
                    placeholderTextColor="#9ca3af"
                    keyboardType="numeric"
                  />

                  <Text style={styles.inputLabel}>IBAN (Optional)</Text>
                  <TextInput
                    style={styles.input}
                    value={iban}
                    onChangeText={setIban}
                    placeholder="PK00XXXX0000000000000000"
                    placeholderTextColor="#9ca3af"
                    autoCapitalize="characters"
                  />
                </>
              ) : (
                <>
                  <Text style={styles.inputLabel}>Account Title *</Text>
                  <TextInput
                    style={styles.input}
                    value={accountTitle}
                    onChangeText={setAccountTitle}
                    placeholder="Name on account"
                    placeholderTextColor="#9ca3af"
                  />

                  <Text style={styles.inputLabel}>Mobile Number *</Text>
                  <TextInput
                    style={styles.input}
                    value={mobileNumber}
                    onChangeText={setMobileNumber}
                    placeholder="03XX-XXXXXXX"
                    placeholderTextColor="#9ca3af"
                    keyboardType="phone-pad"
                  />
                </>
              )}
            </ScrollView>

            <TouchableOpacity 
              style={[styles.addButton, isLoading && styles.addButtonDisabled]} 
              onPress={handleAddPayment}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.addButtonText}>Add Payment Method</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 12,
    marginTop: 8,
  },
  addOptionsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  addOption: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  addOptionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  addOptionText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
    textAlign: 'center',
  },
  noMethods: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 32,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  noMethodsText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginTop: 16,
  },
  noMethodsSubtext: {
    fontSize: 13,
    color: '#6b7280',
    textAlign: 'center',
    marginTop: 8,
  },
  methodsList: {
    gap: 12,
  },
  methodCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
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
  methodHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  methodName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1f2937',
  },
  defaultBadge: {
    backgroundColor: '#dcfce7',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  defaultBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#16a34a',
  },
  methodDetails: {
    fontSize: 13,
    color: '#6b7280',
    marginTop: 2,
  },
  methodActions: {
    flexDirection: 'row',
    gap: 16,
  },
  infoSection: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#f0fdf4',
    borderRadius: 12,
    padding: 16,
    marginTop: 24,
    gap: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: '#166534',
    lineHeight: 18,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 20,
    paddingBottom: 40,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937',
  },
  modalBody: {
    padding: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: '#1f2937',
  },
  addButton: {
    backgroundColor: '#14532d',
    marginHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  addButtonDisabled: {
    opacity: 0.6,
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});
