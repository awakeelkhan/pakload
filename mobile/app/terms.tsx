import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

export default function TermsScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#22c55e', '#16a34a']} style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Terms of Service</Text>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          <View style={styles.iconContainer}>
            <Ionicons name="document-text" size={32} color="#22c55e" />
          </View>
          <Text style={styles.lastUpdated}>Effective Date: January 11, 2026</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>1. User Accounts</Text>
          <Text style={styles.sectionText}>
            To use PakLoad, you must:{'\n'}
            • Be at least 18 years old{'\n'}
            • Provide accurate and complete information{'\n'}
            • Maintain the security of your account{'\n'}
            • Comply with all applicable laws and regulations
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>2. Platform Services</Text>
          <Text style={styles.sectionText}>
            PakLoad provides:{'\n'}
            • Load posting and matching services{'\n'}
            • Carrier verification and ratings{'\n'}
            • Real-time shipment tracking{'\n'}
            • Secure payment processing{'\n'}
            • Communication tools between shippers and carriers
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>3. User Responsibilities</Text>
          <Text style={styles.sectionText}>
            Shippers must:{'\n'}
            • Provide accurate load information{'\n'}
            • Ensure cargo is properly packaged{'\n'}
            • Have necessary permits and documentation{'\n'}
            • Pay agreed rates on time{'\n\n'}
            Carriers must:{'\n'}
            • Maintain valid licenses and insurance{'\n'}
            • Provide accurate vehicle information{'\n'}
            • Deliver shipments safely and on time{'\n'}
            • Update tracking information regularly
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>4. Fees and Payments</Text>
          <Text style={styles.sectionText}>
            PakLoad charges service fees for platform usage. All fees are clearly displayed before transaction confirmation.{'\n\n'}
            Excluded costs (paid by users):{'\n'}
            • Payment processing fees{'\n'}
            • Insurance costs{'\n'}
            • Fuel and operational expenses{'\n'}
            • Customs and duties
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>5. Limitation of Liability</Text>
          <Text style={styles.sectionText}>
            PakLoad acts as a platform connecting shippers and carriers. We are not responsible for:{'\n'}
            • Loss or damage to cargo{'\n'}
            • Delays in delivery{'\n'}
            • Disputes between users{'\n'}
            • Third-party service failures
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>6. Termination</Text>
          <Text style={styles.sectionText}>
            We reserve the right to suspend or terminate accounts that violate these terms, engage in fraudulent activity, or pose security risks.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>7. Governing Law</Text>
          <Text style={styles.sectionText}>
            These Terms are governed by the laws of Pakistan. Any disputes shall be resolved in Pakistani courts.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>8. Contact Information</Text>
          <View style={styles.contactCard}>
            <Text style={styles.contactItem}>
              <Text style={styles.contactLabel}>Legal Inquiries: </Text>
              legal@pakload.com
            </Text>
            <Text style={styles.contactItem}>
              <Text style={styles.contactLabel}>Technical Support: </Text>
              abdul.wakeel@hypercloud.pk
            </Text>
            <Text style={styles.contactItem}>
              <Text style={styles.contactLabel}>Phone: </Text>
              +92 51 8897668
            </Text>
          </View>
        </View>

        <View style={{ height: 40 }} />
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
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 20,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#f0fdf4',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  lastUpdated: {
    fontSize: 14,
    color: '#64748b',
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 12,
  },
  sectionText: {
    fontSize: 14,
    color: '#475569',
    lineHeight: 22,
  },
  contactCard: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
  },
  contactItem: {
    fontSize: 14,
    color: '#475569',
    marginBottom: 8,
  },
  contactLabel: {
    fontWeight: '600',
    color: '#1e293b',
  },
});
