import React, { useState, useEffect, useRef } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Platform,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import { TERMS_OF_SERVICE, PRIVACY_POLICY, LegalDocument } from '../constants/legalContent';

interface LegalModalProps {
  visible: boolean;
  initialTab?: 'terms' | 'privacy';
  onClose: () => void;
}

export const LegalModal: React.FC<LegalModalProps> = ({
  visible,
  initialTab = 'terms',
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'terms' | 'privacy'>(initialTab);
  const scrollViewRef = useRef<ScrollView>(null);

  // Synchroniser l'onglet actif et réinitialiser le scroll en haut à l'ouverture ou au changement d'onglet
  useEffect(() => {
    if (visible) {
      setActiveTab(initialTab);
      setTimeout(() => {
        scrollViewRef.current?.scrollTo({ y: 0, animated: false });
      }, 50);
    }
  }, [visible, initialTab]);

  const handleTabChange = (tab: 'terms' | 'privacy') => {
    setActiveTab(tab);
    scrollViewRef.current?.scrollTo({ y: 0, animated: true });
  };

  const doc: LegalDocument = activeTab === 'terms' ? TERMS_OF_SERVICE : PRIVACY_POLICY;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right', 'bottom']}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

        {/* 1. Modal Top Header */}
        <View style={styles.headerContainer}>
          <View style={styles.headerLeft}>
            <View style={styles.badgeIconContainer}>
              <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
                <Path
                  d="M12 22S20 18 20 12V5L12 2L4 5V12C4 18 12 22 12 22Z"
                  stroke="#19A66A"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <Path
                  d="M9 12L11 14L15 10"
                  stroke="#19A66A"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </Svg>
            </View>
            <View>
              <Text style={styles.headerTitle}>Cadre Légal & Sécurité</Text>
              <Text style={styles.headerSubtitle}>Tontine Express • Sénégal</Text>
            </View>
          </View>

          {/* Close Button (X) */}
          <TouchableOpacity
            onPress={onClose}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            style={styles.closeButton}
            activeOpacity={0.7}
          >
            <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
              <Path
                d="M18 6L6 18M6 6L18 18"
                stroke="#475569"
                strokeWidth={2.4}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </Svg>
          </TouchableOpacity>
        </View>

        {/* 2. Segmented Tab Controls */}
        <View style={styles.tabsWrapper}>
          <View style={styles.tabsContainer}>
            <TouchableOpacity
              onPress={() => handleTabChange('terms')}
              style={[
                styles.tabButton,
                activeTab === 'terms' && styles.tabButtonActive,
              ]}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === 'terms' ? styles.tabTextActive : styles.tabTextInactive,
                ]}
              >
                Conditions (CGU)
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => handleTabChange('privacy')}
              style={[
                styles.tabButton,
                activeTab === 'privacy' && styles.tabButtonActive,
              ]}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === 'privacy' ? styles.tabTextActive : styles.tabTextInactive,
                ]}
              >
                Confidentialité (CDP)
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 3. Scrollable Document Content Area */}
        <View style={styles.scrollWrapper}>
          <ScrollView
            ref={scrollViewRef}
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={true}
            bounces={true}
            alwaysBounceVertical={true}
            nestedScrollEnabled={true}
            keyboardShouldPersistTaps="handled"
          >
            {/* Header Document Card */}
            <View style={styles.docHeaderCard}>
              <View style={styles.categoryBadge}>
                <Text style={styles.categoryBadgeText}>
                  {activeTab === 'terms' ? 'Contrat Utilisateur' : 'Protection des Données (CDP)'}
                </Text>
              </View>

              <Text style={styles.docTitle}>{doc.title}</Text>
              <Text style={styles.docSubtitle}>{doc.subtitle}</Text>

              <View style={styles.docMetaRow}>
                <Text style={styles.docMetaDate}>Mise à jour : {doc.lastUpdated}</Text>
                <View style={styles.senegalBadge}>
                  <View style={styles.greenDot} />
                  <Text style={styles.senegalBadgeText}>Droit sénégalais</Text>
                </View>
              </View>
            </View>

            {/* Compliance Banner */}
            <View style={styles.complianceBanner}>
              <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" style={{ marginTop: 1 }}>
                <Path
                  d="M12 9V13M12 17H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
                  stroke="#D97706"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </Svg>
              <Text style={styles.complianceText}>{doc.complianceNotice}</Text>
            </View>

            {/* Structured Sections */}
            {doc.sections.map((section) => (
              <View key={section.id} style={styles.sectionCard}>
                <Text style={styles.sectionTitle}>{section.title}</Text>
                {section.content.map((paragraph, pIdx) => (
                  <Text key={pIdx} style={styles.sectionParagraph}>
                    {paragraph}
                  </Text>
                ))}
              </View>
            ))}

            {/* Legal Footnote */}
            <View style={styles.footnoteContainer}>
              <Text style={styles.footnoteText}>
                Tontine Express • Tous droits réservés © 2026.
                {'\n'}Pour toute réclamation légale : support@tontine-express.sn
              </Text>
            </View>
          </ScrollView>
        </View>

        {/* 4. Fixed Bottom Action Button (Non-overlapping) */}
        <View style={styles.bottomBar}>
          <TouchableOpacity
            onPress={onClose}
            style={styles.acceptButton}
            activeOpacity={0.85}
          >
            <Text style={styles.acceptButtonText}>J'ai lu et compris</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  headerContainer: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  badgeIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(25, 166, 106, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#173F73',
  },
  headerSubtitle: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '500',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabsWrapper: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    padding: 4,
    borderRadius: 12,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabButtonActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  tabText: {
    fontSize: 12,
    fontWeight: '700',
  },
  tabTextActive: {
    color: '#173F73',
  },
  tabTextInactive: {
    color: '#64748B',
  },
  scrollWrapper: {
    flex: 1,
    width: '100%',
  },
  scrollView: {
    flex: 1,
    width: '100%',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 24,
  },
  docHeaderCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 18,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 99,
    backgroundColor: 'rgba(25, 166, 106, 0.1)',
    marginBottom: 8,
  },
  categoryBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#19A66A',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  docTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#0F172A',
    marginBottom: 6,
    lineHeight: 24,
  },
  docSubtitle: {
    fontSize: 12,
    color: '#64748B',
    lineHeight: 18,
    marginBottom: 12,
  },
  docMetaRow: {
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  docMetaDate: {
    fontSize: 10,
    color: '#94A3B8',
    fontWeight: '500',
  },
  senegalBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  greenDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#19A66A',
  },
  senegalBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#475569',
  },
  complianceBanner: {
    backgroundColor: 'rgba(254, 243, 199, 0.6)',
    borderWidth: 1,
    borderColor: '#FDE68A',
    borderRadius: 14,
    padding: 14,
    marginBottom: 14,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  complianceText: {
    fontSize: 11,
    color: '#92400E',
    lineHeight: 17,
    flex: 1,
    fontWeight: '600',
  },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 2,
    elevation: 1,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#173F73',
    marginBottom: 10,
    lineHeight: 18,
  },
  sectionParagraph: {
    fontSize: 12,
    color: '#475569',
    lineHeight: 19,
    marginBottom: 8,
  },
  footnoteContainer: {
    marginTop: 8,
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
  },
  footnoteText: {
    fontSize: 10,
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 16,
  },
  bottomBar: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 16 : 18,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 4,
  },
  acceptButton: {
    width: '100%',
    backgroundColor: '#19A66A',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#19A66A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  acceptButtonText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 14,
    letterSpacing: 0.3,
  },
});
