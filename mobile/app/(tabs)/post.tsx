import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert, Image, Platform, Modal } from 'react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { loadsAPI, marketRequestsAPI, uploadAPI } from '../../src/services/api';
import { useAuth } from '../../src/contexts/AuthContext';

type Mode = 'select' | 'post-load' | 'market-request';

type ContainerType =
  | '20ft' | '40ft' | '40ft_hc' | '45ft_hc' | 'flatbed' | 'lowbed'
  | 'reefer_20ft' | 'reefer_40ft' | 'tanker' | 'open_top' | 'bulk' | 'other' | '';

const EQUIPMENT_TYPES: { value: ContainerType; label: string; desc: string }[] = [
  { value: '20ft', label: '20ft Container', desc: '33 CBM • 28,000 kg' },
  { value: '40ft', label: '40ft Container', desc: '67 CBM • 26,000 kg' },
  { value: '40ft_hc', label: '40ft High Cube', desc: '76 CBM • 26,000 kg' },
  { value: 'flatbed', label: 'Flatbed Truck', desc: 'Open • 25,000 kg' },
  { value: 'reefer_20ft', label: 'Reefer 20ft', desc: 'Cold • 25,000 kg' },
  { value: 'reefer_40ft', label: 'Reefer 40ft', desc: 'Cold • 26,000 kg' },
  { value: 'tanker', label: 'Tanker', desc: 'Liquid • 30,000 L' },
  { value: 'lowbed', label: 'Low Bed', desc: 'Heavy • 50,000 kg' },
];

const CARGO_TYPES = [
  'General Freight', 'Electronics', 'Textiles', 'Machinery', 'Food & Perishables',
  'Construction Materials', 'Chemicals', 'Furniture', 'Automotive Parts',
  'Agricultural Products', 'Pharmaceuticals', 'Consumer Goods', 'Raw Materials', 'Other',
];

const GOODS_TYPES = [
  'Electronics', 'Textiles & Garments', 'Machinery & Equipment', 'Food Products',
  'Construction Materials', 'Chemicals', 'Furniture', 'Automotive Parts',
  'Agricultural Products', 'Pharmaceuticals', 'Consumer Goods', 'Raw Materials', 'Other',
];

interface PickedFile {
  uri: string;
  name: string;
  type: 'image' | 'document';
}

export default function PostScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { isAuthenticated, user } = useAuth();

  const [mode, setMode] = useState<Mode>('select');

  // Load form state
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [pickupDate, setPickupDate] = useState('');
  const [deliveryDate, setDeliveryDate] = useState('');
  const [cargoType, setCargoType] = useState('');
  const [cargoWeight, setCargoWeight] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [equipmentType, setEquipmentType] = useState<ContainerType>('');
  const [images, setImages] = useState<PickedFile[]>([]);
  const [documents, setDocuments] = useState<PickedFile[]>([]);
  const [showPickupDatePicker, setShowPickupDatePicker] = useState(false);
  const [showDeliveryDatePicker, setShowDeliveryDatePicker] = useState(false);
  const [pickupDateObj, setPickupDateObj] = useState<Date | null>(null);
  const [deliveryDateObj, setDeliveryDateObj] = useState<Date | null>(null);
  const [currency, setCurrency] = useState<'PKR' | 'USD'>('PKR');

  // Market request form state
  const [reqTitle, setReqTitle] = useState('');
  const [reqGoodsType, setReqGoodsType] = useState('');
  const [reqDescription, setReqDescription] = useState('');
  const [reqOriginCity, setReqOriginCity] = useState('');
  const [reqDestinationCity, setReqDestinationCity] = useState('');
  const [reqBudgetMin, setReqBudgetMin] = useState('');
  const [reqBudgetMax, setReqBudgetMax] = useState('');

  const resetLoadForm = () => {
    setOrigin(''); setDestination(''); setPickupDate(''); setDeliveryDate('');
    setCargoType(''); setCargoWeight(''); setPrice(''); setDescription('');
    setEquipmentType(''); setImages([]); setDocuments([]);
    setPickupDateObj(null); setDeliveryDateObj(null);
  };

  const formatDate = (date: Date) => {
    return date.toISOString().split('T')[0]; // YYYY-MM-DD
  };

  const handlePickupDateChange = (event: any, selectedDate?: Date) => {
    setShowPickupDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setPickupDateObj(selectedDate);
      setPickupDate(formatDate(selectedDate));
    }
  };

  const handleDeliveryDateChange = (event: any, selectedDate?: Date) => {
    setShowDeliveryDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setDeliveryDateObj(selectedDate);
      setDeliveryDate(formatDate(selectedDate));
    }
  };

  const resetRequestForm = () => {
    setReqTitle(''); setReqGoodsType(''); setReqDescription('');
    setReqOriginCity(''); setReqDestinationCity(''); setReqBudgetMin(''); setReqBudgetMax('');
  };

  // Image picker
  const pickImages = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Please allow access to your photo library.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.8,
    });
    if (!result.canceled && result.assets) {
      const newImages: PickedFile[] = result.assets.map((a) => ({
        uri: a.uri,
        name: a.fileName || `image-${Date.now()}.jpg`,
        type: 'image',
      }));
      setImages((prev) => [...prev, ...newImages].slice(0, 5));
    }
  };

  // Document picker
  const pickDocuments = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
      multiple: true,
    });
    if (!result.canceled && result.assets) {
      const newDocs: PickedFile[] = result.assets.map((a) => ({
        uri: a.uri,
        name: a.name || `doc-${Date.now()}.pdf`,
        type: 'document',
      }));
      setDocuments((prev) => [...prev, ...newDocs].slice(0, 5));
    }
  };

  const removeImage = (uri: string) => setImages((prev) => prev.filter((f) => f.uri !== uri));
  const removeDocument = (uri: string) => setDocuments((prev) => prev.filter((f) => f.uri !== uri));

  // Create load mutation
  const loadMutation = useMutation({
    mutationFn: async () => {
      // Upload images and documents to server first
      let uploadedImageUrls: string[] = [];
      let uploadedDocUrls: string[] = [];
      
      if (images.length > 0) {
        try {
          const uploadResult = await uploadAPI.uploadImages(
            images.map(f => ({ uri: f.uri, name: f.name }))
          );
          uploadedImageUrls = uploadResult.urls || [];
        } catch (uploadError) {
          console.log('Image upload failed, using local URIs:', uploadError);
          uploadedImageUrls = images.map(f => f.uri);
        }
      }
      
      if (documents.length > 0) {
        try {
          for (const doc of documents) {
            const uploadResult = await uploadAPI.uploadDocument(doc.uri, doc.name);
            if (uploadResult.url) {
              uploadedDocUrls.push(uploadResult.url);
            }
          }
        } catch (uploadError) {
          console.log('Document upload failed, using local URIs:', uploadError);
          uploadedDocUrls = documents.map(f => f.uri);
        }
      }
      
      return loadsAPI.create({
        origin,
        destination,
        pickupDate,
        deliveryDate,
        cargoType,
        cargoWeight: Number(cargoWeight),
        price: Number(price),
        currency,
        description: description || undefined,
        containerType: equipmentType || undefined,
        images: uploadedImageUrls.length ? uploadedImageUrls : undefined,
        documents: uploadedDocUrls.length ? uploadedDocUrls : undefined,
      });
    },
    onSuccess: (result: any) => {
      queryClient.invalidateQueries({ queryKey: ['loads'] });
      resetLoadForm();
      setMode('select');
      Alert.alert('Success', 'Load posted successfully!', [
        { text: 'View Load', onPress: () => router.push(`/loads/${result?.load?.id || ''}`) },
        { text: 'Done' },
      ]);
    },
    onError: (error: any) => {
      Alert.alert('Error', error?.response?.data?.error || error?.message || 'Failed to post load');
    },
  });

  // Create market request mutation
  const requestMutation = useMutation({
    mutationFn: async () => {
      return marketRequestsAPI.create({
        title: reqTitle,
        goodsType: reqGoodsType,
        description: reqDescription,
        originCity: reqOriginCity || undefined,
        destinationCity: reqDestinationCity || undefined,
        budgetMin: reqBudgetMin ? Number(reqBudgetMin) : undefined,
        budgetMax: reqBudgetMax ? Number(reqBudgetMax) : undefined,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['marketRequests'] });
      resetRequestForm();
      setMode('select');
      Alert.alert('Success', 'Request submitted! Our team will contact you soon.');
    },
    onError: (error: any) => {
      Alert.alert('Error', error?.response?.data?.error || error?.message || 'Failed to submit request');
    },
  });

  const validateLoad = () => {
    if (!isAuthenticated) {
      Alert.alert('Sign In Required', 'Please sign in to post a load', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign In', onPress: () => router.push('/auth/login') },
      ]);
      return false;
    }
    if (user?.role !== 'shipper' && user?.role !== 'admin') {
      Alert.alert('Not Allowed', 'Only shippers can post loads');
      return false;
    }
    if (!origin || !destination || !pickupDate || !deliveryDate || !cargoType || !cargoWeight || !price) {
      Alert.alert('Missing Fields', 'Please fill all required fields');
      return false;
    }
    return true;
  };

  const validateRequest = () => {
    if (!isAuthenticated) {
      Alert.alert('Sign In Required', 'Please sign in to submit a request', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign In', onPress: () => router.push('/auth/login') },
      ]);
      return false;
    }
    if (!reqTitle || !reqGoodsType || !reqDescription) {
      Alert.alert('Missing Fields', 'Please fill title, goods type, and description');
      return false;
    }
    return true;
  };

  const submitLoad = () => {
    if (validateLoad()) loadMutation.mutate();
  };

  const submitRequest = () => {
    if (validateRequest()) requestMutation.mutate();
  };

  // ==================== MODE SELECT ====================
  if (mode === 'select') {
    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.selectContent}>
        <View style={styles.selectHeader}>
          <Text style={styles.selectTitle}>How can we help you today?</Text>
          <Text style={styles.selectSubtitle}>Choose the option that best fits your needs</Text>
        </View>

        {/* Post Load Option */}
        <TouchableOpacity style={styles.optionCard} onPress={() => setMode('post-load')} activeOpacity={0.8}>
          <View style={[styles.optionIcon, { backgroundColor: '#dcfce7' }]}>
            <Ionicons name="cube" size={28} color="#22c55e" />
          </View>
          <Text style={styles.optionTitle}>Post a Load</Text>
          <Text style={styles.optionDesc}>I have cargo ready and want carriers to bid on it</Text>
          <View style={styles.optionBullets}>
            <View style={styles.bullet}><View style={[styles.dot, { backgroundColor: '#22c55e' }]} /><Text style={styles.bulletText}>Select equipment type (20ft, 40ft, flatbed)</Text></View>
            <View style={styles.bullet}><View style={[styles.dot, { backgroundColor: '#22c55e' }]} /><Text style={styles.bulletText}>Upload product images & documents</Text></View>
            <View style={styles.bullet}><View style={[styles.dot, { backgroundColor: '#22c55e' }]} /><Text style={styles.bulletText}>Receive bids from verified carriers</Text></View>
          </View>
          <Text style={styles.optionCta}>Get Started →</Text>
        </TouchableOpacity>

        {/* Market Request Option */}
        <TouchableOpacity style={styles.optionCard} onPress={() => setMode('market-request')} activeOpacity={0.8}>
          <View style={[styles.optionIcon, { backgroundColor: '#dbeafe' }]}>
            <Ionicons name="people" size={28} color="#2563eb" />
          </View>
          <Text style={styles.optionTitle}>Submit a Request</Text>
          <Text style={styles.optionDesc}>I need help finding the best transport option</Text>
          <View style={styles.optionBullets}>
            <View style={styles.bullet}><View style={[styles.dot, { backgroundColor: '#2563eb' }]} /><Text style={styles.bulletText}>Tell us what you need transported</Text></View>
            <View style={styles.bullet}><View style={[styles.dot, { backgroundColor: '#2563eb' }]} /><Text style={styles.bulletText}>Our team finds the best options</Text></View>
            <View style={styles.bullet}><View style={[styles.dot, { backgroundColor: '#2563eb' }]} /><Text style={styles.bulletText}>We negotiate on your behalf</Text></View>
          </View>
          <Text style={[styles.optionCta, { color: '#2563eb' }]}>Submit Request →</Text>
        </TouchableOpacity>
      </ScrollView>
    );
  }

  // ==================== POST LOAD FORM ====================
  if (mode === 'post-load') {
    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.formContent} showsVerticalScrollIndicator={false}>
        <TouchableOpacity style={styles.backButton} onPress={() => setMode('select')}>
          <Ionicons name="arrow-back" size={20} color="#6b7280" />
          <Text style={styles.backText}>Back to options</Text>
        </TouchableOpacity>

        <View style={styles.formHeader}>
          <View style={[styles.formHeaderIcon, { backgroundColor: '#dcfce7' }]}>
            <Ionicons name="cube" size={24} color="#22c55e" />
          </View>
          <View>
            <Text style={styles.formTitle}>Post a New Load</Text>
            <Text style={styles.formSubtitle}>Fill in the details below</Text>
          </View>
        </View>

        {/* Route */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Route</Text>
          <View style={styles.row}>
            <View style={styles.flex}>
              <Text style={styles.label}>Origin *</Text>
              <TextInput style={styles.input} value={origin} onChangeText={setOrigin} placeholder="e.g., Lahore" placeholderTextColor="#9ca3af" />
            </View>
            <View style={styles.flex}>
              <Text style={styles.label}>Destination *</Text>
              <TextInput style={styles.input} value={destination} onChangeText={setDestination} placeholder="e.g., Karachi" placeholderTextColor="#9ca3af" />
            </View>
          </View>
        </View>

        {/* Schedule */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Schedule</Text>
          <View style={styles.row}>
            <View style={styles.flex}>
              <Text style={styles.label}>Pickup Date *</Text>
              <TouchableOpacity style={styles.dateInput} onPress={() => setShowPickupDatePicker(true)}>
                <Ionicons name="calendar-outline" size={18} color="#6b7280" />
                <Text style={pickupDate ? styles.dateText : styles.datePlaceholder}>
                  {pickupDate || 'Select date'}
                </Text>
              </TouchableOpacity>
            </View>
            <View style={styles.flex}>
              <Text style={styles.label}>Delivery Date *</Text>
              <TouchableOpacity style={styles.dateInput} onPress={() => setShowDeliveryDatePicker(true)}>
                <Ionicons name="calendar-outline" size={18} color="#6b7280" />
                <Text style={deliveryDate ? styles.dateText : styles.datePlaceholder}>
                  {deliveryDate || 'Select date'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Date Pickers */}
        {showPickupDatePicker && (
          <DateTimePicker
            value={pickupDateObj || new Date()}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={handlePickupDateChange}
            minimumDate={new Date()}
          />
        )}
        {showDeliveryDatePicker && (
          <DateTimePicker
            value={deliveryDateObj || new Date()}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={handleDeliveryDateChange}
            minimumDate={pickupDateObj || new Date()}
          />
        )}

        {/* Cargo */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Cargo Details</Text>
          <Text style={styles.label}>Cargo Type *</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
            {CARGO_TYPES.map((t) => (
              <TouchableOpacity key={t} style={[styles.chip, cargoType === t && styles.chipActive]} onPress={() => setCargoType(t)}>
                <Text style={[styles.chipText, cargoType === t && styles.chipTextActive]}>{t}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          <View style={styles.row}>
            <View style={styles.flex}>
              <Text style={styles.label}>Weight (kg) *</Text>
              <TextInput style={styles.input} value={cargoWeight} onChangeText={setCargoWeight} keyboardType="numeric" placeholder="e.g., 15000" placeholderTextColor="#9ca3af" />
            </View>
            <View style={styles.flex}>
              <Text style={styles.label}>Your Rate (PKR) *</Text>
              <TextInput style={styles.input} value={price} onChangeText={setPrice} keyboardType="numeric" placeholder="e.g., 125000" placeholderTextColor="#9ca3af" />
            </View>
          </View>
          <Text style={styles.label}>Description</Text>
          <TextInput style={[styles.input, styles.textArea]} value={description} onChangeText={setDescription} placeholder="Packaging, handling instructions..." placeholderTextColor="#9ca3af" multiline numberOfLines={3} />
        </View>

        {/* Equipment */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Equipment Type</Text>
          <View style={styles.equipmentGrid}>
            {EQUIPMENT_TYPES.map((eq) => (
              <TouchableOpacity key={eq.value} style={[styles.equipmentCard, equipmentType === eq.value && styles.equipmentCardActive]} onPress={() => setEquipmentType(eq.value)}>
                <Text style={[styles.equipmentLabel, equipmentType === eq.value && styles.equipmentLabelActive]}>{eq.label}</Text>
                <Text style={styles.equipmentDesc}>{eq.desc}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Media */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Images & Documents</Text>
          <Text style={styles.helper}>Upload photos of your cargo and any relevant documents</Text>

          {/* Images */}
          <View style={styles.mediaSection}>
            <View style={styles.mediaHeader}>
              <Ionicons name="image" size={18} color="#6b7280" />
              <Text style={styles.mediaTitle}>Product Images</Text>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 8 }}>
              {images.map((img) => (
                <View key={img.uri} style={styles.imageThumbWrap}>
                  <Image source={{ uri: img.uri }} style={styles.imageThumb} />
                  <TouchableOpacity style={styles.removeBtn} onPress={() => removeImage(img.uri)}>
                    <Ionicons name="close" size={14} color="#fff" />
                  </TouchableOpacity>
                </View>
              ))}
              {images.length < 5 && (
                <TouchableOpacity style={styles.addMediaBtn} onPress={pickImages}>
                  <Ionicons name="add" size={24} color="#22c55e" />
                </TouchableOpacity>
              )}
            </ScrollView>
            <Text style={styles.mediaHint}>Max 5 images</Text>
          </View>

          {/* Documents */}
          <View style={styles.mediaSection}>
            <View style={styles.mediaHeader}>
              <Ionicons name="document-text" size={18} color="#6b7280" />
              <Text style={styles.mediaTitle}>Documents</Text>
            </View>
            {documents.map((doc) => (
              <View key={doc.uri} style={styles.docRow}>
                <Ionicons name="document" size={18} color="#2563eb" />
                <Text style={styles.docName} numberOfLines={1}>{doc.name}</Text>
                <TouchableOpacity onPress={() => removeDocument(doc.uri)}>
                  <Ionicons name="close-circle" size={20} color="#ef4444" />
                </TouchableOpacity>
              </View>
            ))}
            {documents.length < 5 && (
              <TouchableOpacity style={styles.addDocBtn} onPress={pickDocuments}>
                <Ionicons name="cloud-upload" size={18} color="#22c55e" />
                <Text style={styles.addDocText}>Upload Document</Text>
              </TouchableOpacity>
            )}
            <Text style={styles.mediaHint}>Max 5 documents (PDF, DOC)</Text>
          </View>
        </View>

        {/* Submit */}
        <TouchableOpacity style={[styles.submitBtn, loadMutation.isPending && styles.submitBtnDisabled]} onPress={submitLoad} disabled={loadMutation.isPending}>
          <Ionicons name="checkmark-circle" size={20} color="#fff" />
          <Text style={styles.submitBtnText}>{loadMutation.isPending ? 'Posting...' : 'Post Load'}</Text>
        </TouchableOpacity>
        <View style={{ height: 40 }} />
      </ScrollView>
    );
  }

  // ==================== MARKET REQUEST FORM ====================
  if (mode === 'market-request') {
    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.formContent} showsVerticalScrollIndicator={false}>
        <TouchableOpacity style={styles.backButton} onPress={() => setMode('select')}>
          <Ionicons name="arrow-back" size={20} color="#6b7280" />
          <Text style={styles.backText}>Back to options</Text>
        </TouchableOpacity>

        <View style={styles.formHeader}>
          <View style={[styles.formHeaderIcon, { backgroundColor: '#dbeafe' }]}>
            <Ionicons name="briefcase" size={24} color="#2563eb" />
          </View>
          <View>
            <Text style={styles.formTitle}>Submit a Market Request</Text>
            <Text style={styles.formSubtitle}>Tell us what you need</Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>Title *</Text>
          <TextInput style={styles.input} value={reqTitle} onChangeText={setReqTitle} placeholder="e.g., Need textile rolls transported" placeholderTextColor="#9ca3af" />

          <Text style={[styles.label, { marginTop: 12 }]}>Goods Type *</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
            {GOODS_TYPES.map((t) => (
              <TouchableOpacity key={t} style={[styles.chip, reqGoodsType === t && styles.chipActiveBlue]} onPress={() => setReqGoodsType(t)}>
                <Text style={[styles.chipText, reqGoodsType === t && styles.chipTextActive]}>{t}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <Text style={styles.label}>Description *</Text>
          <TextInput style={[styles.input, styles.textArea]} value={reqDescription} onChangeText={setReqDescription} placeholder="Describe what you need..." placeholderTextColor="#9ca3af" multiline numberOfLines={4} />
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Route (Optional)</Text>
          <View style={styles.row}>
            <View style={styles.flex}>
              <Text style={styles.label}>Origin City</Text>
              <TextInput style={styles.input} value={reqOriginCity} onChangeText={setReqOriginCity} placeholder="e.g., Karachi" placeholderTextColor="#9ca3af" />
            </View>
            <View style={styles.flex}>
              <Text style={styles.label}>Destination City</Text>
              <TextInput style={styles.input} value={reqDestinationCity} onChangeText={setReqDestinationCity} placeholder="e.g., Lahore" placeholderTextColor="#9ca3af" />
            </View>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Budget (Optional)</Text>
          <View style={styles.row}>
            <View style={styles.flex}>
              <Text style={styles.label}>Min (PKR)</Text>
              <TextInput style={styles.input} value={reqBudgetMin} onChangeText={setReqBudgetMin} keyboardType="numeric" placeholder="0" placeholderTextColor="#9ca3af" />
            </View>
            <View style={styles.flex}>
              <Text style={styles.label}>Max (PKR)</Text>
              <TextInput style={styles.input} value={reqBudgetMax} onChangeText={setReqBudgetMax} keyboardType="numeric" placeholder="0" placeholderTextColor="#9ca3af" />
            </View>
          </View>
        </View>

        <TouchableOpacity style={[styles.submitBtn, { backgroundColor: '#2563eb' }, requestMutation.isPending && styles.submitBtnDisabled]} onPress={submitRequest} disabled={requestMutation.isPending}>
          <Ionicons name="send" size={20} color="#fff" />
          <Text style={styles.submitBtnText}>{requestMutation.isPending ? 'Submitting...' : 'Submit Request'}</Text>
        </TouchableOpacity>
        <View style={{ height: 40 }} />
      </ScrollView>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  selectContent: { padding: 20, paddingTop: 24 },
  formContent: { padding: 16 },
  selectHeader: { alignItems: 'center', marginBottom: 24 },
  selectTitle: { fontSize: 24, fontWeight: '800', color: '#0f172a', textAlign: 'center' },
  selectSubtitle: { fontSize: 15, color: '#64748b', marginTop: 6, textAlign: 'center' },
  optionCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  optionIcon: { width: 56, height: 56, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginBottom: 14 },
  optionTitle: { fontSize: 20, fontWeight: '800', color: '#0f172a', marginBottom: 6 },
  optionDesc: { fontSize: 14, color: '#64748b', marginBottom: 14 },
  optionBullets: { gap: 8, marginBottom: 14 },
  bullet: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  dot: { width: 6, height: 6, borderRadius: 3 },
  bulletText: { fontSize: 13, color: '#64748b' },
  optionCta: { fontSize: 15, fontWeight: '700', color: '#22c55e' },
  backButton: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 16 },
  backText: { fontSize: 14, color: '#6b7280' },
  formHeader: { flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 20 },
  formHeaderIcon: { width: 48, height: 48, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  formTitle: { fontSize: 22, fontWeight: '800', color: '#0f172a' },
  formSubtitle: { fontSize: 14, color: '#64748b', marginTop: 2 },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 14, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#0f172a', marginBottom: 12 },
  label: { fontSize: 12, fontWeight: '700', color: '#374151', marginBottom: 6 },
  helper: { fontSize: 12, color: '#64748b', marginBottom: 12 },
  input: { backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15, color: '#0f172a' },
  textArea: { height: 90, textAlignVertical: 'top' },
  row: { flexDirection: 'row', gap: 12 },
  flex: { flex: 1 },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: '#f1f5f9', marginRight: 8 },
  chipActive: { backgroundColor: '#22c55e' },
  chipActiveBlue: { backgroundColor: '#2563eb' },
  chipText: { fontSize: 13, color: '#64748b', fontWeight: '600' },
  chipTextActive: { color: '#fff' },
  equipmentGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  equipmentCard: { width: '48%', padding: 14, borderRadius: 12, borderWidth: 2, borderColor: '#e2e8f0', backgroundColor: '#fff' },
  equipmentCardActive: { borderColor: '#22c55e', backgroundColor: '#f0fdf4' },
  equipmentLabel: { fontSize: 14, fontWeight: '700', color: '#0f172a' },
  equipmentLabelActive: { color: '#22c55e' },
  equipmentDesc: { fontSize: 11, color: '#64748b', marginTop: 4 },
  mediaSection: { marginTop: 14 },
  mediaHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  mediaTitle: { fontSize: 14, fontWeight: '700', color: '#374151' },
  mediaHint: { fontSize: 11, color: '#94a3b8', marginTop: 6 },
  imageThumbWrap: { position: 'relative', marginRight: 10 },
  imageThumb: { width: 80, height: 80, borderRadius: 10, backgroundColor: '#e2e8f0' },
  removeBtn: { position: 'absolute', top: -6, right: -6, width: 22, height: 22, borderRadius: 11, backgroundColor: '#ef4444', alignItems: 'center', justifyContent: 'center' },
  addMediaBtn: { width: 80, height: 80, borderRadius: 10, borderWidth: 2, borderColor: '#22c55e', borderStyle: 'dashed', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f0fdf4' },
  docRow: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#f8fafc', borderRadius: 10, padding: 12, marginTop: 8 },
  docName: { flex: 1, fontSize: 13, color: '#374151' },
  addDocBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderWidth: 2, borderColor: '#22c55e', borderStyle: 'dashed', borderRadius: 12, paddingVertical: 14, marginTop: 10, backgroundColor: '#f0fdf4' },
  addDocText: { fontSize: 14, fontWeight: '600', color: '#22c55e' },
  submitBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, backgroundColor: '#22c55e', paddingVertical: 16, borderRadius: 14, marginTop: 10 },
  submitBtnDisabled: { opacity: 0.6 },
  submitBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  dateInput: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 14 },
  dateText: { fontSize: 15, color: '#0f172a' },
  datePlaceholder: { fontSize: 15, color: '#9ca3af' },
});
