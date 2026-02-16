/**
 * TripDetailScreen — Detailed view of a past trip
 * Reuses SummaryScreen-like layout for consistency
 */
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, FontSize } from '../constants/theme';
import { Card } from '../components/Card';
import { ScoreCircle } from '../components/ScoreCircle';
import { StatRow } from '../components/StatRow';
import { EventTimeline } from '../components/EventTimeline';
import { getTripById, deleteTrip } from '../services/database';
import { formatDuration, formatDistance, formatSpeed, speedUnitLabel } from '../services/geo';
import { useSettings } from '../context/SettingsContext';
import { Trip } from '../types';
import type { RootStackParamList } from '../../App';

type DetailRouteProp = RouteProp<RootStackParamList, 'TripDetail'>;
type NavProp = NativeStackNavigationProp<RootStackParamList>;

export function TripDetailScreen() {
  const route = useRoute<DetailRouteProp>();
  const navigation = useNavigation<NavProp>();
  const { settings } = useSettings();
  const [trip, setTrip] = useState<Trip | null>(null);

  useEffect(() => {
    getTripById(route.params.tripId).then(setTrip);
  }, [route.params.tripId]);

  const handleDelete = () => {
    Alert.alert(
      'Supprimer le trajet',
      'Cette action est irréversible.',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            if (trip) {
              await deleteTrip(trip.id);
              navigation.goBack();
            }
          },
        },
      ]
    );
  };

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

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.title}>Détail du trajet</Text>
        <TouchableOpacity onPress={handleDelete} style={styles.backBtn}>
          <Ionicons name="trash-outline" size={22} color={Colors.danger} />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.date}>
          {new Date(trip.startTime).toLocaleDateString('fr-FR', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          })}
        </Text>

        <View style={styles.scoreContainer}>
          <ScoreCircle score={trip.score} size={150} />
        </View>

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
                label: `Vit. max`,
                value: `${formatSpeed(trip.maxSpeed, unit)}`,
              },
              {
                icon: 'trending-up-outline',
                label: 'Vit. moy.',
                value: `${formatSpeed(trip.avgSpeed, unit)}`,
              },
            ]}
          />
        </Card>

        <Text style={styles.sectionTitle}>Safety Timeline</Text>
        <Card>
          <EventTimeline events={trip.events} />
        </Card>

        {trip.tips.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Conseils</Text>
            <Card>
              {trip.tips.map((tip, i) => (
                <View key={i} style={styles.tipItem}>
                  <Ionicons name="bulb-outline" size={20} color={Colors.primary} />
                  <Text style={styles.tipText}>{tip}</Text>
                </View>
              ))}
            </Card>
          </>
        )}
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
    paddingBottom: Spacing.sm,
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    color: Colors.textPrimary,
    fontSize: FontSize.lg,
    fontWeight: '700',
  },
  scroll: {
    padding: Spacing.lg,
    paddingTop: 0,
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
  date: {
    color: Colors.textMuted,
    fontSize: FontSize.sm,
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
  scoreContainer: {
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  statsCard: {
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    color: Colors.textPrimary,
    fontSize: FontSize.lg,
    fontWeight: '700',
    marginBottom: Spacing.md,
    marginTop: Spacing.md,
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
});
