/**
 * SettingsScreen — User preferences
 */
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, FontSize, BorderRadius } from '../constants/theme';
import { Card } from '../components/Card';
import { useSettings } from '../context/SettingsContext';
import { AlertSensitivity, SpeedUnit } from '../types';

const SENSITIVITY_OPTIONS: { value: AlertSensitivity; label: string; desc: string }[] = [
  { value: 'low', label: 'Faible', desc: 'Moins d\'alertes' },
  { value: 'medium', label: 'Moyen', desc: 'Équilibré' },
  { value: 'high', label: 'Élevé', desc: 'Plus d\'alertes' },
];

const PAUSE_OPTIONS = [30, 45, 60, 90, 120];

const UNIT_OPTIONS: { value: SpeedUnit; label: string }[] = [
  { value: 'kmh', label: 'km/h' },
  { value: 'mph', label: 'mph' },
];

export function SettingsScreen() {
  const navigation = useNavigation();
  const { settings, updateSetting } = useSettings();

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.title}>Paramètres</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Alert Sensitivity */}
        <Text style={styles.sectionTitle}>Sensibilité des alertes</Text>
        <Card>
          <View style={styles.optionRow}>
            {SENSITIVITY_OPTIONS.map((opt) => (
              <TouchableOpacity
                key={opt.value}
                onPress={() => updateSetting('alertSensitivity', opt.value)}
                style={[
                  styles.optionChip,
                  settings.alertSensitivity === opt.value && styles.optionChipActive,
                ]}
              >
                <Text
                  style={[
                    styles.optionLabel,
                    settings.alertSensitivity === opt.value && styles.optionLabelActive,
                  ]}
                >
                  {opt.label}
                </Text>
                <Text style={styles.optionDesc}>{opt.desc}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </Card>

        {/* Pause threshold */}
        <Text style={styles.sectionTitle}>Seuil de pause recommandée</Text>
        <Card>
          <View style={styles.optionRow}>
            {PAUSE_OPTIONS.map((min) => (
              <TouchableOpacity
                key={min}
                onPress={() => updateSetting('pauseThresholdMin', min)}
                style={[
                  styles.pauseChip,
                  settings.pauseThresholdMin === min && styles.optionChipActive,
                ]}
              >
                <Text
                  style={[
                    styles.pauseChipText,
                    settings.pauseThresholdMin === min && styles.optionLabelActive,
                  ]}
                >
                  {min} min
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </Card>

        {/* Vibration */}
        <Text style={styles.sectionTitle}>Vibration</Text>
        <Card>
          <View style={styles.switchRow}>
            <View>
              <Text style={styles.switchLabel}>Retour haptique</Text>
              <Text style={styles.switchDesc}>
                Vibration lors des alertes de conduite
              </Text>
            </View>
            <Switch
              value={settings.vibrationEnabled}
              onValueChange={(val) => updateSetting('vibrationEnabled', val)}
              trackColor={{ false: Colors.bgCardLight, true: Colors.primaryDim }}
              thumbColor={settings.vibrationEnabled ? Colors.primary : Colors.textMuted}
            />
          </View>
        </Card>

        {/* Speed unit */}
        <Text style={styles.sectionTitle}>Unité de vitesse</Text>
        <Card>
          <View style={styles.optionRow}>
            {UNIT_OPTIONS.map((opt) => (
              <TouchableOpacity
                key={opt.value}
                onPress={() => updateSetting('speedUnit', opt.value)}
                style={[
                  styles.unitChip,
                  settings.speedUnit === opt.value && styles.optionChipActive,
                ]}
              >
                <Text
                  style={[
                    styles.unitChipText,
                    settings.speedUnit === opt.value && styles.optionLabelActive,
                  ]}
                >
                  {opt.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </Card>

        {/* About */}
        <Text style={styles.sectionTitle}>À propos</Text>
        <Card>
          <View style={styles.aboutRow}>
            <Ionicons name="shield-checkmark" size={32} color={Colors.primary} />
            <View style={styles.aboutText}>
              <Text style={styles.aboutTitle}>Sentinel Drive Sense</Text>
              <Text style={styles.aboutVersion}>Version 1.0.0 — MVP</Text>
              <Text style={styles.aboutDesc}>
                Application d'aide à la prévention routière.{'\n'}
                Ne remplace pas votre vigilance au volant.
              </Text>
            </View>
          </View>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    color: Colors.textPrimary,
    fontSize: FontSize.xl,
    fontWeight: '900',
  },
  placeholder: {
    width: 40,
  },
  scroll: {
    padding: Spacing.lg,
    paddingTop: 0,
    paddingBottom: Spacing.xxl,
  },
  sectionTitle: {
    color: Colors.textSecondary,
    fontSize: FontSize.sm,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: Spacing.sm,
    marginTop: Spacing.lg,
  },
  optionRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    flexWrap: 'wrap',
  },
  optionChip: {
    flex: 1,
    minWidth: 90,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.bgCardLight,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.transparent,
  },
  optionChipActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primarySoft,
  },
  optionLabel: {
    color: Colors.textSecondary,
    fontSize: FontSize.md,
    fontWeight: '700',
  },
  optionLabelActive: {
    color: Colors.primary,
  },
  optionDesc: {
    color: Colors.textMuted,
    fontSize: FontSize.xs,
    marginTop: 4,
  },
  pauseChip: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.bgCardLight,
    borderWidth: 1,
    borderColor: Colors.transparent,
  },
  pauseChipText: {
    color: Colors.textSecondary,
    fontSize: FontSize.sm,
    fontWeight: '600',
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  switchLabel: {
    color: Colors.textPrimary,
    fontSize: FontSize.md,
    fontWeight: '600',
  },
  switchDesc: {
    color: Colors.textMuted,
    fontSize: FontSize.sm,
    marginTop: 4,
  },
  unitChip: {
    flex: 1,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.bgCardLight,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.transparent,
  },
  unitChipText: {
    color: Colors.textSecondary,
    fontSize: FontSize.lg,
    fontWeight: '700',
  },
  aboutRow: {
    flexDirection: 'row',
    gap: Spacing.md,
    alignItems: 'flex-start',
  },
  aboutText: {
    flex: 1,
  },
  aboutTitle: {
    color: Colors.textPrimary,
    fontSize: FontSize.md,
    fontWeight: '700',
  },
  aboutVersion: {
    color: Colors.textMuted,
    fontSize: FontSize.sm,
    marginTop: 2,
  },
  aboutDesc: {
    color: Colors.textSecondary,
    fontSize: FontSize.sm,
    marginTop: Spacing.sm,
    lineHeight: 20,
  },
});
