import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator, Image, Modal } from 'react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { documentsAPI, uploadAPI } from '../src/services/api';
import { useAuth } from '../src/contexts/AuthContext';

type DocumentType = 'cnic' | 'license' | 'vehicle_registration' | 'insurance' | 'other';

interface Document {
  id: number;
  type: DocumentType;
  name: string;
  status: 'pending' | 'approved' | 'rejected';
  uploadedAt: string;
  expiryDate?: string;
}

const DOCUMENT_TYPES: { type: DocumentType; label: string; icon: string; required: boolean }[] = [
  { type: 'cnic', label: 'CNIC / National ID', icon: 'card-outline', required: true },
  { type: 'license', label: 'Driving License', icon: 'car-outline', required: true },
  { type: 'vehicle_registration', label: 'Vehicle Registration', icon: 'document-text-outline', required: false },
  { type: 'insurance', label: 'Insurance Certificate', icon: 'shield-checkmark-outline', required: false },
];

export default function DocumentsScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAuth();
  const [uploading, setUploading] = useState<DocumentType | null>(null);
  const [viewingImage, setViewingImage] = useState<string | null>(null);

  const { data: documents, isLoading, refetch } = useQuery({
    queryKey: ['my-documents'],
    queryFn: async () => {
      try {
        const response = await documentsAPI.getMyDocuments();
        return response?.documents || [];
      } catch {
        return [];
      }
    },
    enabled: isAuthenticated,
  });

  const getDocumentByType = (type: DocumentType): Document | undefined => {
    return documents?.find((doc: Document) => doc.type === type);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return '#22c55e';
      case 'rejected': return '#ef4444';
      case 'pending': return '#f59e0b';
      default: return '#6b7280';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return 'checkmark-circle';
      case 'rejected': return 'close-circle';
      case 'pending': return 'time';
      default: return 'help-circle';
    }
  };

  const handleUpload = async (type: DocumentType) => {
    Alert.alert(
      'Upload Document',
      'Choose how to upload your document',
      [
        { text: 'Take Photo', onPress: () => takeDocumentPhoto(type) },
        { text: 'Choose from Gallery', onPress: () => pickDocumentImage(type) },
        { text: 'Upload PDF', onPress: () => pickDocumentFile(type) },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const takeDocumentPhoto = async (type: DocumentType) => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Please allow camera access to take photos of your documents.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      quality: 0.8,
      allowsEditing: true,
    });

    if (!result.canceled && result.assets[0]) {
      await uploadDocument(type, result.assets[0].uri, `${type}-${Date.now()}.jpg`);
    }
  };

  const pickDocumentImage = async (type: DocumentType) => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Please allow access to your photo library.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
      allowsEditing: true,
    });

    if (!result.canceled && result.assets[0]) {
      await uploadDocument(type, result.assets[0].uri, result.assets[0].fileName || `${type}-${Date.now()}.jpg`);
    }
  };

  const pickDocumentFile = async (type: DocumentType) => {
    const result = await DocumentPicker.getDocumentAsync({
      type: ['application/pdf', 'image/*'],
    });

    if (!result.canceled && result.assets[0]) {
      await uploadDocument(type, result.assets[0].uri, result.assets[0].name);
    }
  };

  const uploadDocument = async (type: DocumentType, uri: string, filename: string) => {
    setUploading(type);
    try {
      // Upload the file
      const uploadResult = await uploadAPI.uploadImage(uri, filename);
      
      if (uploadResult.url) {
        // Save document reference to backend
        await documentsAPI.uploadDocument({
          documentType: type,
          documentUrl: uploadResult.url,
        });
        
        Alert.alert('Success', 'Document uploaded successfully. It will be reviewed shortly.');
        refetch();
      }
    } catch (error: any) {
      console.log('Upload error:', error);
      Alert.alert('Upload Failed', 'Could not upload document. Please try again.');
    } finally {
      setUploading(null);
    }
  };

  const handleViewDocument = (doc: any) => {
    // Check if document has an image URL
    const imageUrl = doc.documentUrl || doc.url || doc.imageUrl;
    if (imageUrl && (imageUrl.endsWith('.jpg') || imageUrl.endsWith('.jpeg') || imageUrl.endsWith('.png') || imageUrl.includes('image'))) {
      setViewingImage(imageUrl);
    } else {
      Alert.alert(
        doc.name || doc.documentType,
        `Status: ${(doc.status || 'pending').charAt(0).toUpperCase() + (doc.status || 'pending').slice(1)}\nUploaded: ${doc.uploadedAt ? new Date(doc.uploadedAt).toLocaleDateString() : 'N/A'}${doc.expiryDate ? `\nExpires: ${new Date(doc.expiryDate).toLocaleDateString()}` : ''}`,
        [{ text: 'OK' }]
      );
    }
  };

  if (!isAuthenticated) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#14532d" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Documents</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.emptyState}>
          <Ionicons name="lock-closed-outline" size={64} color="#d1d5db" />
          <Text style={styles.emptyTitle}>Sign In Required</Text>
          <Text style={styles.emptyText}>Please sign in to manage your documents</Text>
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
        <Text style={styles.headerTitle}>Documents</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Info Card */}
        <View style={styles.infoCard}>
          <Ionicons name="information-circle" size={24} color="#3b82f6" />
          <View style={styles.infoContent}>
            <Text style={styles.infoTitle}>Document Verification</Text>
            <Text style={styles.infoText}>
              Upload your documents for verification. Verified documents help build trust with shippers and carriers.
            </Text>
          </View>
        </View>

        {/* Document List */}
        <View style={styles.documentList}>
          {DOCUMENT_TYPES.map((docType) => {
            const doc = getDocumentByType(docType.type);
            
            return (
              <TouchableOpacity
                key={docType.type}
                style={styles.documentCard}
                onPress={() => doc ? handleViewDocument(doc) : handleUpload(docType.type)}
              >
                <View style={[styles.documentIcon, doc && { backgroundColor: getStatusColor(doc.status) + '20' }]}>
                  <Ionicons 
                    name={docType.icon as any} 
                    size={24} 
                    color={doc ? getStatusColor(doc.status) : '#6b7280'} 
                  />
                </View>
                
                <View style={styles.documentInfo}>
                  <View style={styles.documentHeader}>
                    <Text style={styles.documentTitle}>{docType.label}</Text>
                    {docType.required && (
                      <View style={styles.requiredBadge}>
                        <Text style={styles.requiredText}>Required</Text>
                      </View>
                    )}
                  </View>
                  
                  {doc ? (
                    <View style={styles.statusContainer}>
                      <Ionicons name={getStatusIcon(doc.status) as any} size={16} color={getStatusColor(doc.status)} />
                      <Text style={[styles.statusText, { color: getStatusColor(doc.status) }]}>
                        {doc.status.charAt(0).toUpperCase() + doc.status.slice(1)}
                      </Text>
                    </View>
                  ) : (
                    <Text style={styles.notUploadedText}>Not uploaded</Text>
                  )}
                </View>

                <View style={styles.documentAction}>
                  {uploading === docType.type ? (
                    <ActivityIndicator size="small" color="#14532d" />
                  ) : doc ? (
                    <Ionicons name="eye-outline" size={20} color="#6b7280" />
                  ) : (
                    <View style={styles.uploadButton}>
                      <Ionicons name="cloud-upload-outline" size={18} color="#14532d" />
                      <Text style={styles.uploadButtonText}>Upload</Text>
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Help Section */}
        <View style={styles.helpSection}>
          <Text style={styles.helpTitle}>Need Help?</Text>
          <Text style={styles.helpText}>
            If you have any issues with document verification, please contact our support team at support@pakload.com
          </Text>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Image Viewing Modal */}
      <Modal
        visible={!!viewingImage}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setViewingImage(null)}
      >
        <View style={styles.imageModalContainer}>
          <TouchableOpacity 
            style={styles.imageModalClose}
            onPress={() => setViewingImage(null)}
          >
            <Ionicons name="close" size={28} color="#fff" />
          </TouchableOpacity>
          {viewingImage && (
            <Image 
              source={{ uri: viewingImage }} 
              style={styles.imageModalImage}
              resizeMode="contain"
            />
          )}
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
  infoCard: {
    flexDirection: 'row',
    backgroundColor: '#eff6ff',
    borderRadius: 12,
    padding: 16,
    gap: 12,
    marginBottom: 20,
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1e40af',
    marginBottom: 4,
  },
  infoText: {
    fontSize: 13,
    color: '#3b82f6',
    lineHeight: 18,
  },
  documentList: {
    gap: 12,
  },
  documentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  documentIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  documentInfo: {
    flex: 1,
    marginLeft: 12,
  },
  documentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  documentTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1f2937',
  },
  requiredBadge: {
    backgroundColor: '#fef2f2',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  requiredText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#ef4444',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statusText: {
    fontSize: 13,
    fontWeight: '500',
  },
  notUploadedText: {
    fontSize: 13,
    color: '#9ca3af',
  },
  documentAction: {
    marginLeft: 8,
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#f0fdf4',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  uploadButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#14532d',
  },
  helpSection: {
    marginTop: 24,
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  helpTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 8,
  },
  helpText: {
    fontSize: 13,
    color: '#6b7280',
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
  imageModalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageModalClose: {
    position: 'absolute',
    top: 60,
    right: 20,
    zIndex: 10,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageModalImage: {
    width: '90%',
    height: '70%',
  },
});
