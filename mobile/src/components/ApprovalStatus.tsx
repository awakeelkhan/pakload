import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type ApprovalStatusType = 'pending' | 'approved' | 'rejected';

interface ApprovalStatusProps {
  status: ApprovalStatusType;
  rejectionReason?: string;
  compact?: boolean;
}

export default function ApprovalStatus({ status, rejectionReason, compact = false }: ApprovalStatusProps) {
  const getStatusConfig = () => {
    switch (status) {
      case 'pending':
        return {
          icon: 'time-outline' as const,
          color: '#f59e0b',
          bgColor: '#fef3c7',
          borderColor: '#fcd34d',
          text: 'Pending Approval',
          description: 'Waiting for admin review',
        };
      case 'approved':
        return {
          icon: 'checkmark-circle' as const,
          color: '#16a34a',
          bgColor: '#dcfce7',
          borderColor: '#86efac',
          text: 'Approved',
          description: 'Approved by admin',
        };
      case 'rejected':
        return {
          icon: 'close-circle' as const,
          color: '#dc2626',
          bgColor: '#fee2e2',
          borderColor: '#fca5a5',
          text: 'Rejected',
          description: rejectionReason || 'Rejected by admin',
        };
      default:
        return {
          icon: 'help-circle-outline' as const,
          color: '#64748b',
          bgColor: '#f1f5f9',
          borderColor: '#cbd5e1',
          text: 'Unknown',
          description: '',
        };
    }
  };

  const config = getStatusConfig();

  if (compact) {
    return (
      <View style={[styles.compactContainer, { backgroundColor: config.bgColor, borderColor: config.borderColor }]}>
        <Ionicons name={config.icon} size={14} color={config.color} />
        <Text style={[styles.compactText, { color: config.color }]}>{config.text}</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: config.bgColor, borderColor: config.borderColor }]}>
      <View style={styles.header}>
        <Ionicons name={config.icon} size={24} color={config.color} />
        <Text style={[styles.title, { color: config.color }]}>{config.text}</Text>
      </View>
      <Text style={[styles.description, { color: config.color }]}>{config.description}</Text>
      
      {status === 'pending' && (
        <View style={styles.infoBox}>
          <Ionicons name="information-circle-outline" size={16} color="#0369a1" />
          <Text style={styles.infoText}>
            Your submission is being reviewed by our admin team. This usually takes 1-2 business hours.
          </Text>
        </View>
      )}
      
      {status === 'rejected' && rejectionReason && (
        <View style={styles.reasonBox}>
          <Text style={styles.reasonLabel}>Reason:</Text>
          <Text style={styles.reasonText}>{rejectionReason}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginVertical: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
  },
  description: {
    fontSize: 14,
    marginLeft: 32,
  },
  compactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    gap: 4,
  },
  compactText: {
    fontSize: 12,
    fontWeight: '600',
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#e0f2fe',
    padding: 10,
    borderRadius: 8,
    marginTop: 12,
    gap: 8,
  },
  infoText: {
    flex: 1,
    fontSize: 12,
    color: '#0369a1',
    lineHeight: 18,
  },
  reasonBox: {
    backgroundColor: 'rgba(220, 38, 38, 0.1)',
    padding: 10,
    borderRadius: 8,
    marginTop: 12,
  },
  reasonLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#dc2626',
    marginBottom: 4,
  },
  reasonText: {
    fontSize: 13,
    color: '#7f1d1d',
    lineHeight: 18,
  },
});
