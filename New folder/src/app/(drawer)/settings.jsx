import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Globe2, Scale, Trash2, Leaf, Check } from 'lucide-react-native';

import { useSettingsStore } from '../../store/settingsStore';
import { useHistoryStore } from '../../store/historyStore';
import { useChatStore } from '../../store/chatStore';
import { useLanguagePref } from '../../hooks/useLanguagePref';
import { APP_CONFIG, t } from '../../constants/config';
import { colors, radii, spacing, typography, shadow } from '../../constants/theme';

function SectionTitle({ icon: Icon, children }) {
  return (
    <View style={styles.sectionTitleRow}>
      <Icon size={16} color={colors.accent} strokeWidth={2.25} />
      <Text style={styles.sectionTitle}>{children}</Text>
    </View>
  );
}

export default function SettingsScreen() {
  const { jurisdiction, setJurisdiction } = useSettingsStore();
  const { language, setLanguage } = useLanguagePref();
  const { clearHistory } = useHistoryStore();
  const { clearMessages } = useChatStore();

  const handleClearAll = () => {
    Alert.alert(
      t('dataManagement', language),
      t('confirmClearMsg', language),
      [
        { text: t('cancel', language), style: 'cancel' },
        {
          text: t('clearAllLocalData', language),
          style: 'destructive',
          onPress: () => {
            clearHistory();
            clearMessages();
            Alert.alert(t('done', language), t('allDataCleared', language));
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom', 'left', 'right']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t('settingsTitle', language)}</Text>
        <Text style={styles.headerSubtitle}>
          {t('settingsSubtitle', language)}
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* ─── Language ────────────────────────────────────────── */}
        <View style={styles.card}>
          <SectionTitle icon={Globe2}>{t('languageSection', language)}</SectionTitle>
          <Text style={styles.cardDescription}>
            {t('languageDesc', language)}
          </Text>
          <View style={styles.langGrid}>
            {APP_CONFIG.supportedLanguages.map((lang) => {
              const isSelected = language === lang.code;
              return (
                <TouchableOpacity
                  key={lang.code}
                  style={[styles.langChip, isSelected && styles.langChipSelected]}
                  onPress={() => setLanguage(lang.code)}
                  accessibilityRole="radio"
                  accessibilityState={{ checked: isSelected }}
                  accessibilityLabel={`Select ${lang.nativeLabel}`}
                >
                  <Text style={[styles.langNative, isSelected && styles.langNativeSelected]}>
                    {lang.label}
                  </Text>
                  <Text style={[styles.langEnglish, isSelected && styles.langEnglishSelected]}>
                    {lang.nativeLabel}
                  </Text>
                  {isSelected && (
                    <View style={styles.langCheck}>
                      <Check size={12} color="#FFFFFF" strokeWidth={3} />
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* ─── Jurisdiction ───────────────────────────────────── */}
        <View style={styles.card}>
          <SectionTitle icon={Scale}>{t('jurisdictionSection', language)}</SectionTitle>
          <Text style={styles.cardDescription}>
            {t('jurisdictionDesc', language)}
          </Text>
          <View style={styles.chipCol}>
            {[
              {
                code: 'IN',
                label: t('indiaLabel', language),
                detail: t('indiaDetail', language),
              },
              {
                code: 'GLOBAL',
                label: t('internationalLabel', language),
                detail: t('internationalDetail', language),
              },
            ].map((j) => {
              const isSelected = jurisdiction === j.code;
              return (
                <TouchableOpacity
                  key={j.code}
                  style={[styles.jurisdictionCard, isSelected && styles.jurisdictionCardSelected]}
                  onPress={() => setJurisdiction(j.code)}
                  accessibilityRole="radio"
                  accessibilityState={{ checked: isSelected }}
                >
                  <View style={styles.jurisdictionHeader}>
                    <View style={[styles.radio, isSelected && styles.radioSelected]}>
                      {isSelected && <View style={styles.radioInner} />}
                    </View>
                    <Text style={[styles.jurisdictionLabel, isSelected && styles.jurisdictionLabelSelected]}>
                      {j.label}
                    </Text>
                  </View>
                  <Text style={styles.jurisdictionDetail}>{j.detail}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* ─── Data Management ────────────────────────────────── */}
        <View style={styles.card}>
          <SectionTitle icon={Trash2}>{t('dataManagement', language)}</SectionTitle>
          <Text style={styles.cardDescription}>
            {t('dataDesc', language)}
          </Text>
          <TouchableOpacity
            style={styles.dangerBtn}
            onPress={handleClearAll}
            accessibilityRole="button"
            accessibilityLabel={t('clearAllLocalData', language)}
          >
            <Trash2 size={15} color={colors.danger} strokeWidth={2} />
            <Text style={styles.dangerBtnText}>{t('clearAllLocalData', language)}</Text>
          </TouchableOpacity>
        </View>

        {/* ─── About ──────────────────────────────────────────── */}
        <View style={styles.card}>
          <SectionTitle icon={Leaf}>{t('aboutSection', language)}</SectionTitle>
          <Text style={styles.infoText}>
            {t('aboutAppText', language)}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  header: {
    padding: spacing.lg,
    backgroundColor: colors.bg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    ...typography.title,
  },
  headerSubtitle: {
    marginTop: spacing.xs,
    ...typography.subtitle,
  },
  scrollContent: {
    padding: spacing.lg,
    gap: spacing.lg,
    paddingBottom: spacing.xxxl,
  },
  card: {
    padding: spacing.lg,
    borderRadius: radii.lg,
    backgroundColor: colors.surfaceRaised,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.md,
    ...shadow.sm,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  cardDescription: {
    ...typography.bodySmall,
  },

  // Language grid
  langGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  langChip: {
    flex: 1,
    minWidth: 140,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.bgSubtle,
    position: 'relative',
    gap: 2,
  },
  langChipSelected: {
    borderColor: colors.brand,
    backgroundColor: colors.brandSubtle,
  },
  langNative: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  langNativeSelected: {
    color: colors.brand,
  },
  langEnglish: {
    fontSize: 12,
    color: colors.textMuted,
  },
  langEnglishSelected: {
    color: colors.brandLight,
    fontWeight: '500',
  },
  langCheck: {
    position: 'absolute',
    top: -6,
    right: -6,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.brand,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Jurisdiction
  chipCol: {
    gap: spacing.sm,
  },
  jurisdictionCard: {
    padding: spacing.md,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.bgSubtle,
    gap: spacing.xs,
  },
  jurisdictionCardSelected: {
    borderColor: colors.brand,
    backgroundColor: colors.brandSubtle,
  },
  jurisdictionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  radio: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: colors.borderStrong,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioSelected: {
    borderColor: colors.brand,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.brand,
  },
  jurisdictionLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  jurisdictionLabelSelected: {
    color: colors.brand,
  },
  jurisdictionDetail: {
    fontSize: 12,
    color: colors.textMuted,
    marginLeft: 26,
  },
  dangerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.danger,
    backgroundColor: colors.dangerBg,
  },
  dangerBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.danger,
  },
  infoText: {
    ...typography.bodySmall,
    lineHeight: 20,
  },
});
