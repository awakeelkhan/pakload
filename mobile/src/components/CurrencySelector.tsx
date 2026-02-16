import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export type Currency = 'PKR' | 'USD' | 'CNY';

const CURRENCIES: { code: Currency; name: string; symbol: string; flag: string }[] = [
  { code: 'PKR', name: 'Pakistani Rupee', symbol: 'Rs', flag: '🇵🇰' },
  { code: 'USD', name: 'US Dollar', symbol: '$', flag: '🇺🇸' },
  { code: 'CNY', name: 'Chinese Yuan', symbol: '¥', flag: '🇨🇳' },
];

// Exchange rates (approximate)
const EXCHANGE_RATES: Record<Currency, number> = {
  PKR: 1,
  USD: 0.0036, // 1 PKR = 0.0036 USD
  CNY: 0.026,  // 1 PKR = 0.026 CNY
};

interface CurrencySelectorProps {
  value: Currency;
  onChange: (currency: Currency) => void;
  style?: object;
}

export function convertCurrency(amount: number, from: Currency, to: Currency): number {
  const inPKR = from === 'PKR' ? amount : amount / EXCHANGE_RATES[from];
  return to === 'PKR' ? inPKR : inPKR * EXCHANGE_RATES[to];
}

export function formatCurrency(amount: number, currency: Currency): string {
  const curr = CURRENCIES.find(c => c.code === currency);
  return `${curr?.symbol || ''} ${amount.toLocaleString()}`;
}

export default function CurrencySelector({ value, onChange, style }: CurrencySelectorProps) {
  const [modalVisible, setModalVisible] = useState(false);

  const currentCurrency = CURRENCIES.find(c => c.code === value);

  return (
    <View style={style}>
      <TouchableOpacity
        style={styles.button}
        onPress={() => setModalVisible(true)}
      >
        <Text style={styles.flag}>{currentCurrency?.flag}</Text>
        <Text style={styles.buttonText}>{value}</Text>
        <Ionicons name="chevron-down" size={16} color="#64748b" />
      </TouchableOpacity>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Currency</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color="#64748b" />
              </TouchableOpacity>
            </View>

            {CURRENCIES.map((curr) => (
              <TouchableOpacity
                key={curr.code}
                style={[
                  styles.currencyOption,
                  value === curr.code && styles.currencyOptionActive
                ]}
                onPress={() => {
                  onChange(curr.code);
                  setModalVisible(false);
                }}
              >
                <Text style={styles.currencyFlag}>{curr.flag}</Text>
                <View style={styles.currencyInfo}>
                  <Text style={[
                    styles.currencyCode,
                    value === curr.code && styles.activeText
                  ]}>
                    {curr.code}
                  </Text>
                  <Text style={styles.currencyName}>{curr.name}</Text>
                </View>
                <Text style={styles.symbol}>{curr.symbol}</Text>
                {value === curr.code && (
                  <Ionicons name="checkmark-circle" size={24} color="#16a34a" />
                )}
              </TouchableOpacity>
            ))}

            <View style={styles.ratesInfo}>
              <Text style={styles.ratesTitle}>Exchange Rates (Approx)</Text>
              <Text style={styles.rateText}>1 USD = 278 PKR</Text>
              <Text style={styles.rateText}>1 CNY = 38 PKR</Text>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  flag: {
    fontSize: 18,
  },
  buttonText: {
    fontSize: 14,
    color: '#334155',
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e293b',
  },
  currencyOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    backgroundColor: '#f8fafc',
  },
  currencyOptionActive: {
    backgroundColor: '#dcfce7',
    borderWidth: 1,
    borderColor: '#16a34a',
  },
  currencyFlag: {
    fontSize: 28,
    marginRight: 12,
  },
  currencyInfo: {
    flex: 1,
  },
  currencyCode: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
  },
  activeText: {
    color: '#16a34a',
  },
  currencyName: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
  symbol: {
    fontSize: 18,
    fontWeight: '700',
    color: '#64748b',
    marginRight: 12,
  },
  ratesInfo: {
    marginTop: 16,
    padding: 12,
    backgroundColor: '#f0f9ff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#bae6fd',
  },
  ratesTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#0369a1',
    marginBottom: 6,
  },
  rateText: {
    fontSize: 12,
    color: '#0c4a6e',
  },
});
