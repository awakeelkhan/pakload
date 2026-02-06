import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

export default function PrivacyScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#22c55e', '#16a34a']} style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Privacy Policy</Text>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          <View style={styles.iconContainer}>
            <Ionicons name="shield-checkmark" size={32} color="#22c55e" />
          </View>
          <Text style={styles.lastUpdated}>Last Updated: January 11, 2026</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Information We Collect</Text>
          <Text style={styles.sectionText}>
            We collect information you provide directly:{'\n'}
            • Account information (name, email, phone){'\n'}
            • Business details (company name, licenses){'\n'}
            • Payment information{'\n'}
            • Load and shipment details{'\n'}
            • Communications with other users
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>How We Use Your Information</Text>
          <Text style={styles.sectionText}>
            We use your information to:{'\n'}
            • Provide and improve our services{'\n'}
            • Match loads with carriers{'\n'}
            • Process payments{'\n'}
            • Send notifications and updates{'\n'}
            • Ensure platform security{'\n'}
            • Comply with legal requirements
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Information Sharing</Text>
          <Text style={styles.sectionText}>
            We may share your information with:{'\n'}
            • Other users (for load matching){'\n'}
            • Payment processors{'\n'}
            • Service providers{'\n'}
            • Legal authorities when required{'\n\n'}
            We never sell your personal information to third parties.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Data Security</Text>
          <Text style={styles.sectionText}>
            We implement industry-standard security measures:{'\n'}
            • Encrypted data transmission (SSL/TLS){'\n'}
            • Secure data storage{'\n'}
            • Regular security audits{'\n'}
            • Access controls and monitoring
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Rights</Text>
          <Text style={styles.sectionText}>
            You have the right to:{'\n'}
            • Access your personal data{'\n'}
            • Correct inaccurate information{'\n'}
            • Delete your account{'\n'}
            • Export your data{'\n'}
            • Opt-out of marketing communications
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Cookies & Tracking</Text>
          <Text style={styles.sectionText}>
            We use cookies and similar technologies to:{'\n'}
            • Remember your preferences{'\n'}
            • Analyze platform usage{'\n'}
            • Improve user experience{'\n'}
            • Provide personalized content
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact Us</Text>
          <View style={styles.contactCard}>
            <Text style={styles.contactItem}>
              <Text style={styles.contactLabel}>Privacy Officer: </Text>
              privacy@pakload.com
            </Text>
            <Text style={styles.contactItem}>
              <Text style={styles.contactLabel}>Support: </Text>
              support@pakload.com
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
