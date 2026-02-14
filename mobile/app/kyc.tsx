import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Image,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';

interface KYCDocument {
  id: string;
  name: string;
  description: string;
  required: boolean;
  status: 'pending' | 'uploaded' | 'verified' | 'rejected';
  icon: string;
  uri?: string;
}

export default function KYCScreen() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [cnic, setCnic] = useState('');
  const [documents, setDocuments] = useState<KYCDocument[]>([
    {
      id: 'cnic_front',
      name: 'CNIC Front',
      description: 'Clear photo of CNIC front side',
      required: true,
      status: 'pending',
      icon: 'card',
    },
    {
      id: 'cnic_back',
      name: 'CNIC Back',
      description: 'Clear photo of CNIC back side',
      required: true,
      status: 'pending',
      icon: 'card-outline',
    },
    {
      id: 'driving_license',
      name: 'Driving License',
      description: 'Valid driving license (for carriers)',
      required: false,
      status: 'pending',
      icon: 'car',
    },
    {
      id: 'vehicle_registration',
      name: 'Vehicle Registration',
      description: 'Vehicle registration certificate',
      required: false,
      status: 'pending',
      icon: 'document-text',
    },
    {
      id: 'business_registration',
      name: 'Business Registration',
      description: 'NTN or business registration certificate',
      required: false,
      status: 'pending',
      icon: 'business',
    },
  ]);

  const pickImage = async (documentId: string) => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Please allow access to your photo library');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setDocuments(docs => docs.map(doc => 
        doc.id === documentId 
          ? { ...doc, uri: result.assets[0].uri, status: 'uploaded' as const }
          : doc
      ));
    }
  };

  const takePhoto = async (documentId: string) => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Please allow access to your camera');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setDocuments(docs => docs.map(doc => 
        doc.id === documentId 
          ? { ...doc, uri: result.assets[0].uri, status: 'uploaded' as const }
          : doc
      ));
    }
  };

  const showImageOptions = (documentId: string) => {
    Alert.alert(
      'Upload Document',
      'Choose an option',
      [
        { text: 'Take Photo', onPress: () => takePhoto(documentId) },
        { text: 'Choose from Library', onPress: () => pickImage(documentId) },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const removeDocument = (documentId: string) => {
    setDocuments(docs => docs.map(doc => 
      doc.id === documentId 
        ? { ...doc, uri: undefined, status: 'pending' as const }
        : doc
    ));
  };

  const handleSubmit = async () => {
    // Validate CNIC
    if (!cnic.trim() || cnic.length < 13) {
      Alert.alert('Error', 'Please enter a valid CNIC number');
      return;
    }

    // Check required documents
    const requiredDocs = documents.filter(d => d.required);
    const uploadedRequired = requiredDocs.filter(d => d.status === 'uploaded');
    
    if (uploadedRequired.length < requiredDocs.length) {
      Alert.alert('Error', 'Please upload all required documents');
      return;
    }

    setSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      setSubmitting(false);
      Alert.alert(
        'KYC Submitted',
        'Your documents have been submitted for verification. You will be notified once verified.',
        [{ text: 'OK', onPress: () => router.back() }]
      );
    }, 2000);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'verified': return '#10B981';
      case 'uploaded': return '#3B82F6';
      case 'rejected': return '#EF4444';
      default: return '#9CA3AF';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'verified': return 'checkmark-circle';
      case 'uploaded': return 'cloud-upload';
      case 'rejected': return 'close-circle';
      default: return 'ellipse-outline';
    }
  };

  const uploadedCount = documents.filter(d => d.status === 'uploaded' || d.status === 'verified').length;
  const progress = (uploadedCount / documents.length) * 100;

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#8B5CF6', '#7C3AED']} style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>KYC Verification</Text>
          <Text style={styles.headerSubtitle}>Verify your identity</Text>
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Progress */}
        <View style={styles.progressCard}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressTitle}>Verification Progress</Text>
            <Text style={styles.progressPercent}>{Math.round(progress)}%</Text>
          </View>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${progress}%` }]} />
          </View>
          <Text style={styles.progressText}>
            {uploadedCount} of {documents.length} documents uploaded
          </Text>
        </View>

        {/* CNIC Input */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>CNIC Number</Text>
          <View style={styles.inputContainer}>
            <Ionicons name="card" size={20} color="#8B5CF6" />
            <TextInput
              style={styles.input}
              placeholder="XXXXX-XXXXXXX-X"
              placeholderTextColor="#9CA3AF"
              value={cnic}
              onChangeText={setCnic}
              keyboardType="numeric"
              maxLength={15}
            />
          </View>
          <Text style={styles.inputHint}>Enter your 13-digit CNIC number</Text>
        </View>

        {/* Documents */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Required Documents</Text>
          
          {documents.filter(d => d.required).map((doc) => (
            <View key={doc.id} style={styles.documentItem}>
              <View style={styles.documentInfo}>
                <View style={[styles.documentIcon, { backgroundColor: getStatusColor(doc.status) + '20' }]}>
                  <Ionicons name={doc.icon as any} size={20} color={getStatusColor(doc.status)} />
                </View>
                <View style={styles.documentText}>
                  <View style={styles.documentHeader}>
                    <Text style={styles.documentName}>{doc.name}</Text>
                    <Text style={styles.requiredBadge}>Required</Text>
                  </View>
                  <Text style={styles.documentDesc}>{doc.description}</Text>
                </View>
              </View>
              
              {doc.uri ? (
                <View style={styles.uploadedContainer}>
                  <Image source={{ uri: doc.uri }} style={styles.thumbnail} />
                  <View style={styles.uploadedActions}>
                    <TouchableOpacity 
                      style={styles.changeButton}
                      onPress={() => showImageOptions(doc.id)}
                    >
                      <Text style={styles.changeButtonText}>Change</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={styles.removeButton}
                      onPress={() => removeDocument(doc.id)}
                    >
                      <Ionicons name="trash" size={16} color="#EF4444" />
                    </TouchableOpacity>
                  </View>
                </View>
              ) : (
                <TouchableOpacity 
                  style={styles.uploadButton}
                  onPress={() => showImageOptions(doc.id)}
                >
                  <Ionicons name="cloud-upload" size={20} color="#8B5CF6" />
                  <Text style={styles.uploadButtonText}>Upload</Text>
                </TouchableOpacity>
              )}
            </View>
          ))}
        </View>

        {/* Optional Documents */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Optional Documents</Text>
          
          {documents.filter(d => !d.required).map((doc) => (
            <View key={doc.id} style={styles.documentItem}>
              <View style={styles.documentInfo}>
                <View style={[styles.documentIcon, { backgroundColor: getStatusColor(doc.status) + '20' }]}>
                  <Ionicons name={doc.icon as any} size={20} color={getStatusColor(doc.status)} />
                </View>
                <View style={styles.documentText}>
                  <Text style={styles.documentName}>{doc.name}</Text>
                  <Text style={styles.documentDesc}>{doc.description}</Text>
                </View>
              </View>
              
              {doc.uri ? (
                <View style={styles.uploadedContainer}>
                  <Image source={{ uri: doc.uri }} style={styles.thumbnail} />
                  <TouchableOpacity 
                    style={styles.removeButton}
                    onPress={() => removeDocument(doc.id)}
                  >
                    <Ionicons name="trash" size={16} color="#EF4444" />
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity 
                  style={styles.uploadButtonSmall}
                  onPress={() => showImageOptions(doc.id)}
                >
                  <Ionicons name="add" size={20} color="#6B7280" />
                </TouchableOpacity>
              )}
            </View>
          ))}
        </View>

        {/* Info */}
        <View style={styles.infoCard}>
          <Ionicons name="shield-checkmark" size={24} color="#8B5CF6" />
          <View style={styles.infoContent}>
            <Text style={styles.infoTitle}>Why KYC?</Text>
            <Text style={styles.infoText}>• Verify your identity for secure transactions</Text>
            <Text style={styles.infoText}>• Build trust with other users</Text>
            <Text style={styles.infoText}>• Access all platform features</Text>
            <Text style={styles.infoText}>• Faster dispute resolution</Text>
          </View>
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          style={[styles.submitButton, submitting && styles.buttonDisabled]}
          onPress={handleSubmit}
          disabled={submitting}
        >
          {submitting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Ionicons name="checkmark-circle" size={20} color="#fff" />
              <Text style={styles.submitButtonText}>Submit for Verification</Text>
            </>
          )}
        </TouchableOpacity>

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
  progressCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  progressTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  progressPercent: {
    fontSize: 16,
    fontWeight: '700',
    color: '#8B5CF6',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#8B5CF6',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 8,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    paddingHorizontal: 12,
    gap: 10,
  },
  input: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 16,
    color: '#1F2937',
    letterSpacing: 1,
  },
  inputHint: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 8,
  },
  documentItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  documentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  documentIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  documentText: {
    flex: 1,
    marginLeft: 12,
  },
  documentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  documentName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  requiredBadge: {
    fontSize: 10,
    color: '#EF4444',
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  documentDesc: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EDE9FE',
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  uploadButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8B5CF6',
  },
  uploadButtonSmall: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-end',
  },
  uploadedContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  thumbnail: {
    width: 80,
    height: 60,
    borderRadius: 8,
  },
  uploadedActions: {
    flexDirection: 'row',
    gap: 8,
  },
  changeButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#EFF6FF',
    borderRadius: 6,
  },
  changeButtonText: {
    fontSize: 12,
    color: '#3B82F6',
    fontWeight: '500',
  },
  removeButton: {
    padding: 6,
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: '#EDE9FE',
    borderRadius: 12,
    padding: 16,
    gap: 12,
    marginBottom: 16,
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#5B21B6',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 12,
    color: '#7C3AED',
    marginBottom: 4,
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#8B5CF6',
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  buttonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});
