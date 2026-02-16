/**
 * SummaryScreen — End of trip recap
 * Shows score, stats, safety timeline, tips, and score explanation
 */
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, FontSize, BorderRadius } from '../constants/theme';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { ScoreCircle } from '../components/ScoreCircle';
import { StatRow } from '../components/StatRow';
import { EventTimeline } from '../components/EventTimeline';
import { getTripById } from '../services/database';
import { formatDuration, formatDistance, formatSpeed, speedUnitLabel } from '../services/geo';
import { SCORE_EXPLANATION } from '../services/scoring';
import { useSettings } from '../context/SettingsContext';
import { Trip } from '../types';
import type { RootStackParamList } from '../../App';

type SummaryRouteProp = RouteProp<RootStackParamList, 'Summary'>;
type NavProp = NativeStackNavigationProp<RootStackParamList>;

export function SummaryScreen() {
  const route = useRoute<SummaryRouteProp>();
  const navigation = useNavigation<NavProp>();
  const { settings } = useSettings();
  const [trip, setTrip] = useState<Trip | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);

  useEffect(() => {
    getTripById(route.params.tripId).then(setTrip);
  }, [route.params.tripId]);

  if (!trip) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.loading}>
          <Text style={styles.loadingText}>Chargement...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const unit = settings.speedUnit;
  const eventCount = trip.events.filter(
    (e) => e.type !== 'pause_recommended' && e.type !== 'pause_taken'
  ).length;

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <Text style={styles.title}>Résumé du trajet</Text>
        <Text style={styles.date}>
          {new Date(trip.startTime).toLocaleDateString('fr-FR', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            hour: '2-digit',
            minute: '2-digit',
          })}
        </Text>

        {/* Score */}
        <View style={styles.scoreContainer}>
          <ScoreCircle score={trip.score} />
        </View>

        {/* Score explanation toggle */}
        <TouchableOpacity
          onPress={() => setShowExplanation(!showExplanation)}
          style={styles.explanationToggle}
        >
          <Ionicons
            name="information-circle-outline"
            size={18}
            color={Colors.primary}
          />
          <Text style={styles.explanationToggleText}>
            Comment ce score est calculé
          </Text>
          <Ionicons
            name={showExplanation ? 'chevron-up' : 'chevron-down'}
            size={16}
            color={Colors.primary}
          />
        </TouchableOpacity>

        {showExplanation && (
          <Card style={styles.explanationCard}>
            <Text style={styles.explanationText}>{SCORE_EXPLANATION}</Text>
          </Card>
        )}

        {/* Stats */}
        <Card style={styles.statsCard}>
          <StatRow
            stats={[
              {
                icon: 'time-outline',
                label: 'Durée',
                value: formatDuration(trip.duration),
              },
              {
                icon: 'map-outline',
                label: 'Distance',
                value: formatDistance(trip.distance, unit),
              },
              {
                icon: 'speedometer-outline',
                label: `Max`,
                value: `${formatSpeed(trip.maxSpeed, unit)} ${speedUnitLabel(unit)}`,
              },
              {
                icon: 'alert-circle-outline',
                label: 'Événements',
                value: `${eventCount}`,
                color: eventCount > 0 ? Colors.warning : Colors.success,
              },
            ]}
          />
        </Card>

        {/* Safety Timeline */}
        <Text style={styles.sectionTitle}>Safety Timeline</Text>
        <Card>
          <EventTimeline events={trip.events} />
        </Card>

        {/* Tips */}
        <Text style={styles.sectionTitle}>Conseils personnalisés</Text>
        <Card>
          {trip.tips.map((tip, i) => (
            <View key={i} style={styles.tipItem}>
              <Ionicons name="bulb-outline" size={20} color={Colors.primary} />
              <Text style={styles.tipText}>{tip}</Text>
            </View>
          ))}
        </Card>

        {/* Done button */}
        <Button
          title="Retour à l'accueil"
          onPress={() => navigation.navigate('Home')}
          size="lg"
          style={styles.doneButton}
        />
      </ScrollView>
    </SafeAreaView>
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
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    color: Colors.textMuted,
    fontSize: FontSize.md,
  },
  title: {
    color: Colors.textPrimary,
    fontSize: FontSize.xl,
    fontWeight: '900',
    textAlign: 'center',
  },
  date: {
    color: Colors.textMuted,
    fontSize: FontSize.sm,
    textAlign: 'center',
    marginTop: Spacing.xs,
    marginBottom: Spacing.lg,
  },
  scoreContainer: {
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  explanationToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    marginBottom: Spacing.md,
  },
  explanationToggleText: {
    color: Colors.primary,
    fontSize: FontSize.sm,
    fontWeight: '600',
  },
  explanationCard: {
    backgroundColor: Colors.bgCardLight,
    marginBottom: Spacing.md,
  },
  explanationText: {
    color: Colors.textSecondary,
    fontSize: FontSize.sm,
    lineHeight: 20,
  },
  statsCard: {
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    color: Colors.textPrimary,
    fontSize: FontSize.lg,
    fontWeight: '700',
    marginBottom: Spacing.md,
  },
  tipItem: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
    alignItems: 'flex-start',
  },
  tipText: {
    color: Colors.textSecondary,
    fontSize: FontSize.md,
    flex: 1,
    lineHeight: 22,
  },
  doneButton: {
    marginTop: Spacing.xl,
  },
});
