import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage, Language } from '../contexts/LanguageContext';

const LANGUAGES: { code: Language; name: string; nativeName: string; flag: string }[] = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇬🇧' },
  { code: 'ur', name: 'Urdu', nativeName: 'اردو', flag: '🇵🇰' },
  { code: 'ps', name: 'Pashto', nativeName: 'پښتو', flag: '🇦🇫' },
  { code: 'zh', name: 'Chinese', nativeName: '中文', flag: '🇨🇳' },
];

interface LanguageSelectorProps {
  style?: object;
}

export default function LanguageSelector({ style }: LanguageSelectorProps) {
  const { language, setLanguage, t } = useLanguage();
  const [modalVisible, setModalVisible] = useState(false);

  const currentLang = LANGUAGES.find(l => l.code === language);

  return (
    <View style={style}>
      <TouchableOpacity
        style={styles.button}
        onPress={() => setModalVisible(true)}
      >
        <Ionicons name="globe-outline" size={20} color="#16a34a" />
        <Text style={styles.buttonText}>{currentLang?.flag} {currentLang?.nativeName}</Text>
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
              <Text style={styles.modalTitle}>{t('lang.select')}</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color="#64748b" />
              </TouchableOpacity>
            </View>

            {LANGUAGES.map((lang) => (
              <TouchableOpacity
                key={lang.code}
                style={[
                  styles.languageOption,
                  language === lang.code && styles.languageOptionActive
                ]}
                onPress={() => {
                  setLanguage(lang.code);
                  setModalVisible(false);
                }}
              >
                <Text style={styles.flag}>{lang.flag}</Text>
                <View style={styles.languageInfo}>
                  <Text style={[
                    styles.nativeName,
                    language === lang.code && styles.activeText
                  ]}>
                    {lang.nativeName}
                  </Text>
                  <Text style={styles.englishName}>{lang.name}</Text>
                </View>
                {language === lang.code && (
                  <Ionicons name="checkmark-circle" size={24} color="#16a34a" />
                )}
              </TouchableOpacity>
            ))}
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
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  buttonText: {
    fontSize: 14,
    color: '#334155',
    fontWeight: '500',
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
  languageOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    backgroundColor: '#f8fafc',
  },
  languageOptionActive: {
    backgroundColor: '#dcfce7',
    borderWidth: 1,
    borderColor: '#16a34a',
  },
  flag: {
    fontSize: 28,
    marginRight: 12,
  },
  languageInfo: {
    flex: 1,
  },
  nativeName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
  },
  activeText: {
    color: '#16a34a',
  },
  englishName: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
});
