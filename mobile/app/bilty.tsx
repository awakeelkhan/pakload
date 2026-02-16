import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Share,
  Alert,
  Linking,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

interface BiltyData {
  biltyNumber: string;
  trackingNumber: string;
  date: string;
  status: string;
  origin: string;
  destination: string;
  pickupDate: string;
  deliveryDate: string;
  cargoType: string;
  weight: string;
  shipper: {
    name: string;
    company?: string;
    phone: string;
  };
  carrier: {
    name: string;
    company?: string;
    phone: string;
    vehicleNumber?: string;
  };
  price: number;
  currency: string;
}

export default function BiltyScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [sharing, setSharing] = useState(false);

  // Mock data - in production, fetch from API using params.bookingId
  const biltyData: BiltyData = {
    biltyNumber: `BLT-${Date.now().toString().slice(-8)}`,
    trackingNumber: params.trackingNumber?.toString() || 'LP-2024-001234',
    date: new Date().toLocaleDateString('en-PK'),
    status: 'CONFIRMED',
    origin: params.origin?.toString() || 'Karachi',
    destination: params.destination?.toString() || 'Lahore',
    pickupDate: '2024-02-15',
    deliveryDate: '2024-02-18',
    cargoType: 'General Cargo',
    weight: '15,000 kg',
    shipper: {
      name: 'Ahmed Khan',
      company: 'ABC Traders',
      phone: '+92 300 1234567',
    },
    carrier: {
      name: 'Muhammad Ali',
      company: 'Ali Transport Co.',
      phone: '+92 321 7654321',
      vehicleNumber: 'LEA-1234',
    },
    price: parseInt(params.price?.toString() || '125000'),
    currency: 'PKR',
  };

  const generatePDF = async () => {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          .header { text-align: center; border-bottom: 2px solid #16a34a; padding-bottom: 20px; margin-bottom: 20px; }
          .logo { font-size: 28px; font-weight: bold; color: #16a34a; }
          .bilty-number { font-size: 14px; color: #666; margin-top: 10px; }
          .tracking { background: #f0fdf4; padding: 10px; border-radius: 8px; text-align: center; margin: 20px 0; }
          .tracking-number { font-size: 18px; font-weight: bold; color: #16a34a; }
          .section { margin: 20px 0; }
          .section-title { font-size: 14px; font-weight: bold; color: #374151; border-bottom: 1px solid #e5e7eb; padding-bottom: 8px; margin-bottom: 12px; }
          .row { display: flex; justify-content: space-between; margin: 8px 0; }
          .label { color: #6b7280; font-size: 12px; }
          .value { font-weight: 500; font-size: 12px; }
          .parties { display: flex; gap: 20px; }
          .party { flex: 1; background: #f9fafb; padding: 15px; border-radius: 8px; }
          .party-title { font-weight: bold; color: #374151; margin-bottom: 10px; }
          .total { background: #16a34a; color: white; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0; }
          .total-label { font-size: 14px; }
          .total-value { font-size: 24px; font-weight: bold; }
          .terms { font-size: 10px; color: #6b7280; margin-top: 30px; }
          .terms h4 { color: #374151; margin-bottom: 8px; }
          .terms ul { padding-left: 20px; }
          .footer { text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 10px; color: #9ca3af; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="logo">🚛 PakLoad</div>
          <div>Pakistan's Premier Logistics Platform</div>
          <div class="bilty-number">Bilty No: ${biltyData.biltyNumber} | Date: ${biltyData.date}</div>
        </div>

        <div class="tracking">
          <div>Tracking Number</div>
          <div class="tracking-number">${biltyData.trackingNumber}</div>
          <div style="color: #16a34a; font-weight: bold;">✓ ${biltyData.status}</div>
        </div>

        <div class="section">
          <div class="section-title">Route Details</div>
          <div class="row"><span class="label">Origin:</span><span class="value">${biltyData.origin}</span></div>
          <div class="row"><span class="label">Destination:</span><span class="value">${biltyData.destination}</span></div>
          <div class="row"><span class="label">Pickup Date:</span><span class="value">${biltyData.pickupDate}</span></div>
          <div class="row"><span class="label">Delivery Date:</span><span class="value">${biltyData.deliveryDate}</span></div>
        </div>

        <div class="section">
          <div class="section-title">Cargo Details</div>
          <div class="row"><span class="label">Cargo Type:</span><span class="value">${biltyData.cargoType}</span></div>
          <div class="row"><span class="label">Weight:</span><span class="value">${biltyData.weight}</span></div>
        </div>

        <div class="parties">
          <div class="party">
            <div class="party-title">Shipper / Consignor</div>
            <div class="row"><span class="label">Name:</span><span class="value">${biltyData.shipper.name}</span></div>
            <div class="row"><span class="label">Company:</span><span class="value">${biltyData.shipper.company || 'N/A'}</span></div>
            <div class="row"><span class="label">Phone:</span><span class="value">${biltyData.shipper.phone}</span></div>
          </div>
          <div class="party">
            <div class="party-title">Carrier / Transporter</div>
            <div class="row"><span class="label">Name:</span><span class="value">${biltyData.carrier.name}</span></div>
            <div class="row"><span class="label">Company:</span><span class="value">${biltyData.carrier.company || 'N/A'}</span></div>
            <div class="row"><span class="label">Phone:</span><span class="value">${biltyData.carrier.phone}</span></div>
            <div class="row"><span class="label">Vehicle:</span><span class="value">${biltyData.carrier.vehicleNumber || 'N/A'}</span></div>
          </div>
        </div>

        <div class="total">
          <div class="total-label">Total Freight Charges</div>
          <div class="total-value">${biltyData.currency} ${biltyData.price.toLocaleString()}</div>
        </div>

        <div class="terms">
          <h4>Terms & Conditions</h4>
          <ul>
            <li>Carrier is responsible for safe and timely delivery of goods.</li>
            <li>Any damage or loss must be reported within 24 hours of delivery.</li>
            <li>Payment terms as agreed between parties.</li>
            <li>This document serves as proof of booking confirmation.</li>
            <li>Disputes shall be resolved as per PakLoad platform policies.</li>
          </ul>
        </div>

        <div class="footer">
          <p>This is a computer-generated document. No signature required.</p>
          <p>Generated on ${new Date().toLocaleString('en-PK')}</p>
          <p>PakLoad Logistics Platform | support@pakload.com</p>
        </div>
      </body>
      </html>
    `;

    return html;
  };

  const handlePrint = async () => {
    Alert.alert(
      'Print Bilty',
      'To print this bilty, please take a screenshot or use the Share option to send it to a printer-enabled app.',
      [{ text: 'OK' }]
    );
  };

  const handleShare = async () => {
    setSharing(true);
    try {
      await Share.share({
        message: `Bilty ${biltyData.biltyNumber}\n\nRoute: ${biltyData.origin} → ${biltyData.destination}\nTracking: ${biltyData.trackingNumber}\nAmount: ${biltyData.currency} ${biltyData.price.toLocaleString()}\n\nView on PakLoad app for full details.`,
        title: `Bilty ${biltyData.biltyNumber}`,
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to share bilty');
    } finally {
      setSharing(false);
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#16a34a', '#15803d']} style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Bilty / Invoice</Text>
          <Text style={styles.headerSubtitle}>{biltyData.biltyNumber}</Text>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.headerButton} onPress={handlePrint}>
            <Ionicons name="print" size={22} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerButton} onPress={handleShare} disabled={sharing}>
            <Ionicons name="share-social" size={22} color="#fff" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Tracking Banner */}
        <View style={styles.trackingBanner}>
          <Text style={styles.trackingLabel}>Tracking Number</Text>
          <Text style={styles.trackingNumber}>{biltyData.trackingNumber}</Text>
          <View style={styles.statusBadge}>
            <Ionicons name="checkmark-circle" size={16} color="#16a34a" />
            <Text style={styles.statusText}>{biltyData.status}</Text>
          </View>
        </View>

        {/* Route Section */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Route Details</Text>
          <View style={styles.routeContainer}>
            <View style={styles.routePoint}>
              <View style={styles.dotGreen} />
              <View>
                <Text style={styles.routeLabel}>Origin</Text>
                <Text style={styles.routeValue}>{biltyData.origin}</Text>
                <Text style={styles.routeDate}>{biltyData.pickupDate}</Text>
              </View>
            </View>
            <View style={styles.routeLine} />
            <View style={styles.routePoint}>
              <View style={styles.dotRed} />
              <View>
                <Text style={styles.routeLabel}>Destination</Text>
                <Text style={styles.routeValue}>{biltyData.destination}</Text>
                <Text style={styles.routeDate}>{biltyData.deliveryDate}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Cargo Details */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Cargo Details</Text>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Cargo Type</Text>
            <Text style={styles.detailValue}>{biltyData.cargoType}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Weight</Text>
            <Text style={styles.detailValue}>{biltyData.weight}</Text>
          </View>
        </View>

        {/* Parties */}
        <View style={styles.partiesContainer}>
          <View style={[styles.partyCard, { backgroundColor: '#EFF6FF' }]}>
            <View style={styles.partyHeader}>
              <Ionicons name="business" size={20} color="#3B82F6" />
              <Text style={[styles.partyTitle, { color: '#1E40AF' }]}>Shipper</Text>
            </View>
            <Text style={styles.partyName}>{biltyData.shipper.name}</Text>
            {biltyData.shipper.company && (
              <Text style={styles.partyCompany}>{biltyData.shipper.company}</Text>
            )}
            <Text style={styles.partyPhone}>{biltyData.shipper.phone}</Text>
          </View>

          <View style={[styles.partyCard, { backgroundColor: '#F0FDF4' }]}>
            <View style={styles.partyHeader}>
              <Ionicons name="car" size={20} color="#16a34a" />
              <Text style={[styles.partyTitle, { color: '#166534' }]}>Carrier</Text>
            </View>
            <Text style={styles.partyName}>{biltyData.carrier.name}</Text>
            {biltyData.carrier.company && (
              <Text style={styles.partyCompany}>{biltyData.carrier.company}</Text>
            )}
            <Text style={styles.partyPhone}>{biltyData.carrier.phone}</Text>
            {biltyData.carrier.vehicleNumber && (
              <Text style={styles.partyVehicle}>Vehicle: {biltyData.carrier.vehicleNumber}</Text>
            )}
          </View>
        </View>

        {/* Payment */}
        <View style={styles.paymentCard}>
          <Text style={styles.paymentLabel}>Total Freight Charges</Text>
          <Text style={styles.paymentValue}>
            {biltyData.currency} {biltyData.price.toLocaleString()}
          </Text>
        </View>

        {/* Terms */}
        <View style={styles.termsCard}>
          <Text style={styles.termsTitle}>Terms & Conditions</Text>
          <Text style={styles.termsText}>• Carrier is responsible for safe and timely delivery</Text>
          <Text style={styles.termsText}>• Damage/loss must be reported within 24 hours</Text>
          <Text style={styles.termsText}>• Payment as per agreed terms</Text>
          <Text style={styles.termsText}>• Disputes resolved per PakLoad policies</Text>
        </View>

        {/* Actions */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity style={styles.actionButton} onPress={handlePrint}>
            <Ionicons name="print" size={20} color="#fff" />
            <Text style={styles.actionButtonText}>Print Bilty</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.actionButton, styles.shareButton]} 
            onPress={handleShare}
            disabled={sharing}
          >
            <Ionicons name="share-social" size={20} color="#16a34a" />
            <Text style={[styles.actionButtonText, { color: '#16a34a' }]}>
              {sharing ? 'Sharing...' : 'Share PDF'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Computer-generated document</Text>
          <Text style={styles.footerText}>Generated: {new Date().toLocaleString('en-PK')}</Text>
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
    flex: 1,
    marginLeft: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
  },
  headerSubtitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  headerButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  trackingBanner: {
    backgroundColor: '#F0FDF4',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#16a34a',
  },
  trackingLabel: {
    fontSize: 12,
    color: '#6B7280',
  },
  trackingNumber: {
    fontSize: 20,
    fontWeight: '700',
    color: '#16a34a',
    marginTop: 4,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 8,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#16a34a',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 12,
  },
  routeContainer: {
    paddingLeft: 8,
  },
  routePoint: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  dotGreen: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#16a34a',
    marginTop: 4,
  },
  dotRed: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#EF4444',
    marginTop: 4,
  },
  routeLine: {
    width: 2,
    height: 30,
    backgroundColor: '#E5E7EB',
    marginLeft: 5,
    marginVertical: 4,
  },
  routeLabel: {
    fontSize: 11,
    color: '#6B7280',
  },
  routeValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1F2937',
  },
  routeDate: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  detailLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1F2937',
  },
  partiesContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  partyCard: {
    flex: 1,
    borderRadius: 12,
    padding: 14,
  },
  partyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  partyTitle: {
    fontSize: 13,
    fontWeight: '700',
  },
  partyName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  partyCompany: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  partyPhone: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
  partyVehicle: {
    fontSize: 12,
    color: '#16a34a',
    fontWeight: '500',
    marginTop: 4,
  },
  paymentCard: {
    backgroundColor: '#16a34a',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    marginBottom: 16,
  },
  paymentLabel: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
  },
  paymentValue: {
    fontSize: 28,
    fontWeight: '700',
    color: '#fff',
    marginTop: 4,
  },
  termsCard: {
    backgroundColor: '#FEF3C7',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  termsTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#92400E',
    marginBottom: 8,
  },
  termsText: {
    fontSize: 12,
    color: '#B45309',
    marginBottom: 4,
  },
  actionsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#16a34a',
    padding: 14,
    borderRadius: 10,
    gap: 8,
  },
  shareButton: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#16a34a',
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  footerText: {
    fontSize: 11,
    color: '#9CA3AF',
  },
});
