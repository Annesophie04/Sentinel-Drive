/**
 * OnboardingScreen — Safety disclaimer + welcome
 * Only shown once. Stored in local settings after user accepts.
 */
import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, FontSize, BorderRadius } from '../constants/theme';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { useSettings } from '../context/SettingsContext';

export function OnboardingScreen() {
  const { updateSetting } = useSettings();

  const handleAccept = async () => {
    await updateSetting('onboardingComplete', true);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Logo area */}
        <View style={styles.logoContainer}>
          <View style={styles.logoCircle}>
            <Ionicons name="shield-checkmark" size={48} color={Colors.primary} />
          </View>
          <Text style={styles.appName}>Sentinel Drive</Text>
          <Text style={styles.appSub}>Sense</Text>
        </View>

        {/* Safety disclaimer */}
        <Card style={styles.disclaimerCard}>
          <View style={styles.disclaimerHeader}>
            <Ionicons name="alert-circle" size={24} color={Colors.warning} />
            <Text style={styles.disclaimerTitle}>Avertissement important</Text>
          </View>
          <Text style={styles.disclaimerText}>
            Sentinel Drive Sense est une <Text style={styles.bold}>aide à la prévention routière</Text>.
            {'\n\n'}
            Cette application n'est <Text style={styles.bold}>pas un système autonome</Text> et ne remplace
            en aucun cas votre vigilance au volant.
            {'\n\n'}
            <Text style={styles.bold}>Gardez toujours votre attention sur la route.</Text>
            {'\n'}Ne manipulez pas votre téléphone en conduisant. Configurez l'application
            avant de prendre le volant.
          </Text>
        </Card>

        {/* Features preview */}
        <Text style={styles.sectionTitle}>Ce que fait l'application</Text>

        <View style={styles.features}>
          <FeatureItem
            icon="analytics-outline"
            title="Analyse de conduite"
            desc="Détecte les freinages brusques, accélérations et vitesse élevée via GPS"
          />
          <FeatureItem
            icon="eye-outline"
            title="Suivi de vigilance"
            desc="Estime votre niveau d'attention selon la durée de conduite"
          />
          <FeatureItem
            icon="school-outline"
            title="Score pédagogique"
            desc="Un score transparent pour comprendre et améliorer vos habitudes"
          />
          <FeatureItem
            icon="notifications-off-outline"
            title="Mode Focus"
            desc="Interface minimale pendant la conduite, zéro distraction"
          />
        </View>

        {/* Accept button */}
        <Button
          title="J'ai compris — Commencer"
          onPress={handleAccept}
          size="lg"
          style={styles.acceptButton}
        />

        <Text style={styles.legal}>
          En continuant, vous acceptez que cette application est un outil d'aide
          et ne garantit pas la sécurité routière.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

function FeatureItem({
  icon,
  title,
  desc,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  desc: string;
}) {
  return (
    <View style={styles.featureItem}>
      <View style={styles.featureIcon}>
        <Ionicons name={icon} size={22} color={Colors.primary} />
      </View>
      <View style={styles.featureText}>
        <Text style={styles.featureTitle}>{title}</Text>
        <Text style={styles.featureDesc}>{desc}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  scroll: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xxl,
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: Spacing.xl,
    marginBottom: Spacing.xl,
  },
  logoCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: Colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  appName: {
    color: Colors.textPrimary,
    fontSize: FontSize.xxl,
    fontWeight: '900',
    letterSpacing: 1,
  },
  appSub: {
    color: Colors.primary,
    fontSize: FontSize.lg,
    fontWeight: '600',
    letterSpacing: 3,
    textTransform: 'uppercase',
  },
  disclaimerCard: {
    backgroundColor: Colors.bgCardLight,
    borderLeftWidth: 4,
    borderLeftColor: Colors.warning,
    marginBottom: Spacing.xl,
  },
  disclaimerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  disclaimerTitle: {
    color: Colors.warning,
    fontSize: FontSize.lg,
    fontWeight: '700',
  },
  disclaimerText: {
    color: Colors.textSecondary,
    fontSize: FontSize.md,
    lineHeight: 22,
  },
  bold: {
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  sectionTitle: {
    color: Colors.textPrimary,
    fontSize: FontSize.lg,
    fontWeight: '700',
    marginBottom: Spacing.md,
  },
  features: {
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
  featureItem: {
    flexDirection: 'row',
    gap: Spacing.md,
    alignItems: 'flex-start',
  },
  featureIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureText: {
    flex: 1,
  },
  featureTitle: {
    color: Colors.textPrimary,
    fontSize: FontSize.md,
    fontWeight: '700',
  },
  featureDesc: {
    color: Colors.textMuted,
    fontSize: FontSize.sm,
    marginTop: 2,
  },
  acceptButton: {
    marginBottom: Spacing.md,
  },
  legal: {
    color: Colors.textMuted,
    fontSize: FontSize.xs,
    textAlign: 'center',
    lineHeight: 16,
  },
});
