import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Modal, TextInput, Alert } from 'react-native';
import { useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { loadsAPI, quotesAPI } from '../../src/services/api';
import { useAuth } from '../../src/contexts/AuthContext';

export default function LoadDetailsScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { isAuthenticated, user } = useAuth();
  
  const [showBidModal, setShowBidModal] = useState(false);
  const [bidAmount, setBidAmount] = useState('');
  const [estimatedDays, setEstimatedDays] = useState('');
  const [bidMessage, setBidMessage] = useState('');

  const { data: loadData, isLoading } = useQuery({
    queryKey: ['load', id],
    queryFn: async () => {
      const response = await loadsAPI.getById(Number(id));
      return response;
    },
    enabled: !!id,
  });

  const bidMutation = useMutation({
    mutationFn: async (data: { loadId: number; quotedPrice: number; estimatedDays: number; message?: string }) => {
      return await quotesAPI.create({
        ...data,
        carrierId: user?.id,
      });
    },
    onSuccess: () => {
      Alert.alert('Success', 'Your bid has been submitted!');
      setShowBidModal(false);
      resetBidForm();
      queryClient.invalidateQueries({ queryKey: ['loads'] });
      queryClient.invalidateQueries({ queryKey: ['myBids'] });
    },
    onError: (error: any) => {
      console.log('Bid error:', error);
      const errorMessage = error?.response?.data?.error || error?.message || 'Failed to submit bid. Please try again.';
      Alert.alert('Error', errorMessage);
    },
  });

  const resetBidForm = () => {
    setBidAmount('');
    setEstimatedDays('');
    setBidMessage('');
  };

  const handlePlaceBid = () => {
    if (!isAuthenticated) {
      Alert.alert('Sign In Required', 'Please sign in to place a bid', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign In', onPress: () => router.push('/auth/login') },
      ]);
      return;
    }
    setBidAmount(load?.budget?.toString() || '');
    setShowBidModal(true);
  };

  const submitBid = () => {
    if (!bidAmount || !estimatedDays) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }
    
    bidMutation.mutate({
      loadId: Number(id),
      quotedPrice: parseFloat(bidAmount),
      estimatedDays: parseInt(estimatedDays),
      message: bidMessage,
    });
  };

  const load = loadData?.load || loadData;

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#16a34a" />
        <Text style={styles.loadingText}>Loading load details...</Text>
      </View>
    );
  }

  if (!load) {
    return (
      <View style={styles.centerContainer}>
        <Ionicons name="alert-circle" size={64} color="#dc2626" />
        <Text style={styles.errorTitle}>Load Not Found</Text>
        <Text style={styles.errorSubtitle}>This load may have been removed or is no longer available</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Route Header */}
        <View style={styles.routeHeader}>
          <View style={styles.routeSection}>
            <View style={styles.routePoint}>
              <View style={styles.routeDotGreen} />
              <View>
                <Text style={styles.routeLabel}>PICKUP</Text>
                <Text style={styles.routeCity}>{load.origin || 'Origin'}</Text>
              </View>
            </View>
            <View style={styles.routeLineVertical} />
            <View style={styles.routePoint}>
              <View style={styles.routeDotRed} />
              <View>
                <Text style={styles.routeLabel}>DELIVERY</Text>
                <Text style={styles.routeCity}>{load.destination || 'Destination'}</Text>
              </View>
            </View>
          </View>
          
          {load.distance && (
            <View style={styles.distanceBadge}>
              <Ionicons name="navigate" size={16} color="#16a34a" />
              <Text style={styles.distanceText}>{load.distance} km</Text>
            </View>
          )}
        </View>

        {/* Status Badges */}
        <View style={styles.badgesRow}>
          {load.status === 'available' && (
            <View style={styles.availableBadge}>
              <Ionicons name="checkmark-circle" size={16} color="#16a34a" />
              <Text style={styles.availableText}>Available</Text>
            </View>
          )}
          {load.isUrgent && (
            <View style={styles.urgentBadge}>
              <Ionicons name="flash" size={16} color="#dc2626" />
              <Text style={styles.urgentText}>Urgent</Text>
            </View>
          )}
          <View style={styles.trackingBadge}>
            <Ionicons name="barcode" size={16} color="#6b7280" />
            <Text style={styles.trackingText}>{load.trackingNumber || `#${load.id}`}</Text>
          </View>
        </View>

        {/* Price Card */}
        <View style={styles.priceCard}>
          <View style={styles.priceRow}>
            <View>
              <Text style={styles.priceLabel}>Budget</Text>
              <Text style={styles.priceAmount}>${(load.budget || load.price || 0).toLocaleString()}</Text>
            </View>
            <TouchableOpacity style={styles.bidNowButton} onPress={handlePlaceBid}>
              <Ionicons name="pricetag" size={20} color="#fff" />
              <Text style={styles.bidNowText}>Place Bid</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Load Details */}
        <View style={styles.detailsCard}>
          <Text style={styles.sectionTitle}>Load Details</Text>
          
          <View style={styles.detailsGrid}>
            <View style={styles.detailItem}>
              <View style={[styles.detailIcon, { backgroundColor: '#dbeafe' }]}>
                <Ionicons name="cube" size={20} color="#2563eb" />
              </View>
              <View>
                <Text style={styles.detailLabel}>Cargo Type</Text>
                <Text style={styles.detailValue}>{load.cargoType || 'General'}</Text>
              </View>
            </View>

            <View style={styles.detailItem}>
              <View style={[styles.detailIcon, { backgroundColor: '#dcfce7' }]}>
                <Ionicons name="scale" size={20} color="#16a34a" />
              </View>
              <View>
                <Text style={styles.detailLabel}>Weight</Text>
                <Text style={styles.detailValue}>{(load.weight || 0).toLocaleString()} kg</Text>
              </View>
            </View>

            <View style={styles.detailItem}>
              <View style={[styles.detailIcon, { backgroundColor: '#fef3c7' }]}>
                <Ionicons name="car" size={20} color="#d97706" />
              </View>
              <View>
                <Text style={styles.detailLabel}>Vehicle Type</Text>
                <Text style={styles.detailValue}>{load.vehicleType || 'Any'}</Text>
              </View>
            </View>

            <View style={styles.detailItem}>
              <View style={[styles.detailIcon, { backgroundColor: '#f3e8ff' }]}>
                <Ionicons name="resize" size={20} color="#9333ea" />
              </View>
              <View>
                <Text style={styles.detailLabel}>Dimensions</Text>
                <Text style={styles.detailValue}>
                  {load.dimensions || `${load.length || 0}x${load.width || 0}x${load.height || 0} m`}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Schedule */}
        <View style={styles.detailsCard}>
          <Text style={styles.sectionTitle}>Schedule</Text>
          
          <View style={styles.scheduleRow}>
            <View style={styles.scheduleItem}>
              <Ionicons name="calendar" size={20} color="#16a34a" />
              <View>
                <Text style={styles.scheduleLabel}>Pickup Date</Text>
                <Text style={styles.scheduleValue}>
                  {load.pickupDate ? new Date(load.pickupDate).toLocaleDateString() : 'Flexible'}
                </Text>
              </View>
            </View>
            <View style={styles.scheduleItem}>
              <Ionicons name="calendar-outline" size={20} color="#dc2626" />
              <View>
                <Text style={styles.scheduleLabel}>Delivery Date</Text>
                <Text style={styles.scheduleValue}>
                  {load.deliveryDate ? new Date(load.deliveryDate).toLocaleDateString() : 'TBD'}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Description */}
        {load.description && (
          <View style={styles.detailsCard}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.descriptionText}>{load.description}</Text>
          </View>
        )}

        {/* Special Requirements */}
        {load.specialRequirements && (
          <View style={styles.detailsCard}>
            <Text style={styles.sectionTitle}>Special Requirements</Text>
            <View style={styles.requirementsList}>
              {(Array.isArray(load.specialRequirements) ? load.specialRequirements : [load.specialRequirements]).map((req: string, index: number) => (
                <View key={index} style={styles.requirementItem}>
                  <Ionicons name="checkmark-circle" size={16} color="#16a34a" />
                  <Text style={styles.requirementText}>{req}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Bottom Action Bar */}
      <View style={styles.bottomBar}>
        <View style={styles.bottomPriceInfo}>
          <Text style={styles.bottomPriceLabel}>Budget</Text>
          <Text style={styles.bottomPriceAmount}>${(load.budget || load.price || 0).toLocaleString()}</Text>
        </View>
        <TouchableOpacity style={styles.bottomBidButton} onPress={handlePlaceBid}>
          <Ionicons name="pricetag" size={20} color="#fff" />
          <Text style={styles.bottomBidText}>Place Bid</Text>
        </TouchableOpacity>
      </View>

      {/* Bid Modal */}
      <Modal
        visible={showBidModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowBidModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Place Your Bid</Text>
              <TouchableOpacity onPress={() => setShowBidModal(false)}>
                <Ionicons name="close" size={24} color="#6b7280" />
              </TouchableOpacity>
            </View>

            <View style={styles.modalLoadInfo}>
              <Text style={styles.modalLoadRoute}>
                {load.origin} → {load.destination}
              </Text>
              <Text style={styles.modalLoadDetails}>
                {load.cargoType} • {(load.weight || 0).toLocaleString()} kg
              </Text>
              <Text style={styles.modalBudget}>
                Budget: ${(load.budget || 0).toLocaleString()}
              </Text>
            </View>

            <View style={styles.modalForm}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Your Bid Amount ($) *</Text>
                <View style={styles.inputContainer}>
                  <Ionicons name="cash-outline" size={20} color="#6b7280" />
                  <TextInput
                    style={styles.modalInput}
                    placeholder="Enter your bid amount"
                    value={bidAmount}
                    onChangeText={setBidAmount}
                    keyboardType="numeric"
                    placeholderTextColor="#9ca3af"
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Estimated Delivery (days) *</Text>
                <View style={styles.inputContainer}>
                  <Ionicons name="time-outline" size={20} color="#6b7280" />
                  <TextInput
                    style={styles.modalInput}
                    placeholder="e.g., 5"
                    value={estimatedDays}
                    onChangeText={setEstimatedDays}
                    keyboardType="numeric"
                    placeholderTextColor="#9ca3af"
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Message (optional)</Text>
                <View style={[styles.inputContainer, styles.textAreaContainer]}>
                  <TextInput
                    style={[styles.modalInput, styles.textArea]}
                    placeholder="Add a message to the shipper..."
                    value={bidMessage}
                    onChangeText={setBidMessage}
                    multiline
                    numberOfLines={3}
                    placeholderTextColor="#9ca3af"
                  />
                </View>
              </View>
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={() => setShowBidModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.submitButton, bidMutation.isPending && styles.submitButtonDisabled]}
                onPress={submitBid}
                disabled={bidMutation.isPending}
              >
                {bidMutation.isPending ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <>
                    <Ionicons name="send" size={18} color="#fff" />
                    <Text style={styles.submitButtonText}>Submit Bid</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
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
  scrollView: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    backgroundColor: '#f9fafb',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6b7280',
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1f2937',
    marginTop: 16,
  },
  errorSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 8,
    textAlign: 'center',
  },
  backButton: {
    marginTop: 24,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: '#16a34a',
    borderRadius: 10,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  routeHeader: {
    backgroundColor: '#fff',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  routeSection: {
    gap: 4,
  },
  routePoint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  routeDotGreen: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#16a34a',
  },
  routeDotRed: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#dc2626',
  },
  routeLineVertical: {
    width: 2,
    height: 32,
    backgroundColor: '#e5e7eb',
    marginLeft: 7,
  },
  routeLabel: {
    fontSize: 10,
    color: '#9ca3af',
    fontWeight: '600',
    letterSpacing: 1,
  },
  routeCity: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937',
  },
  distanceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 16,
    alignSelf: 'flex-start',
    backgroundColor: '#dcfce7',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  distanceText: {
    fontSize: 14,
    color: '#16a34a',
    fontWeight: '600',
  },
  badgesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    padding: 16,
  },
  availableBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#dcfce7',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  availableText: {
    fontSize: 12,
    color: '#16a34a',
    fontWeight: '600',
  },
  urgentBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#fef2f2',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  urgentText: {
    fontSize: 12,
    color: '#dc2626',
    fontWeight: '600',
  },
  trackingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  trackingText: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '500',
    fontFamily: 'monospace',
  },
  priceCard: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceLabel: {
    fontSize: 14,
    color: '#6b7280',
  },
  priceAmount: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#16a34a',
  },
  bidNowButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#16a34a',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
  },
  bidNowText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  detailsCard: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 16,
  },
  detailsGrid: {
    gap: 16,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  detailIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 12,
    color: '#6b7280',
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  scheduleRow: {
    flexDirection: 'row',
    gap: 16,
  },
  scheduleItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#f9fafb',
    padding: 12,
    borderRadius: 12,
  },
  scheduleLabel: {
    fontSize: 12,
    color: '#6b7280',
  },
  scheduleValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
  },
  descriptionText: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 22,
  },
  requirementsList: {
    gap: 8,
  },
  requirementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  requirementText: {
    fontSize: 14,
    color: '#374151',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 10,
  },
  bottomPriceInfo: {
    gap: 2,
  },
  bottomPriceLabel: {
    fontSize: 12,
    color: '#6b7280',
  },
  bottomPriceAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#16a34a',
  },
  bottomBidButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#16a34a',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
  },
  bottomBidText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  modalLoadInfo: {
    backgroundColor: '#f9fafb',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  modalLoadRoute: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
  },
  modalLoadDetails: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
  },
  modalBudget: {
    fontSize: 16,
    fontWeight: '600',
    color: '#16a34a',
    marginTop: 8,
  },
  modalForm: {
    gap: 16,
  },
  inputGroup: {
    gap: 8,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  textAreaContainer: {
    alignItems: 'flex-start',
  },
  modalInput: {
    flex: 1,
    fontSize: 16,
    color: '#1f2937',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6b7280',
  },
  submitButton: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#16a34a',
    paddingVertical: 14,
    borderRadius: 12,
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});
