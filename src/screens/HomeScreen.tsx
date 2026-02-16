/**
 * HomeScreen — Main dashboard
 * Shows vigilance status, start trip button, access to history and settings
 */
import React, { useCallback, useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Colors, Spacing, FontSize, BorderRadius, Shadow } from '../constants/theme';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { VigilanceRing } from '../components/VigilanceRing';
import { StatRow } from '../components/StatRow';
import { useDrive } from '../context/DriveContext';
import { getAllTrips } from '../services/database';
import { formatDistance, formatDuration } from '../services/geo';
import { useSettings } from '../context/SettingsContext';
import type { RootStackParamList } from '../../App';
import { Trip } from '../types';

type NavProp = NativeStackNavigationProp<RootStackParamList>;

export function HomeScreen() {
  const navigation = useNavigation<NavProp>();
  const { drive, startTrip } = useDrive();
  const { settings } = useSettings();
  const [recentTrips, setRecentTrips] = useState<Trip[]>([]);
  const [starting, setStarting] = useState(false);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      getAllTrips().then((trips) => setRecentTrips(trips.slice(0, 3)));
    });
    return unsubscribe;
  }, [navigation]);

  const handleStartTrip = useCallback(async () => {
    setStarting(true);
    const ok = await startTrip();
    setStarting(false);
    if (ok) {
      navigation.navigate('Drive');
    }
  }, [startTrip, navigation]);

  // Compute overall stats
  const totalTrips = recentTrips.length;
  const avgScore =
    totalTrips > 0
      ? Math.round(recentTrips.reduce((s, t) => s + t.score, 0) / totalTrips)
      : 0;
  const totalDistance = recentTrips.reduce((s, t) => s + t.distance, 0);

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Sentinel Drive</Text>
            <Text style={styles.subtitle}>Sense</Text>
          </View>
          <TouchableOpacity
            onPress={() => navigation.navigate('Settings')}
            style={styles.settingsBtn}
          >
            <Ionicons name="settings-outline" size={24} color={Colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Vigilance card */}
        <Card glow style={styles.vigilanceCard}>
          <Text style={styles.cardTitle}>Vigilance actuelle</Text>
          <View style={styles.vigilanceCenter}>
            <VigilanceRing
              score={drive.isActive ? drive.vigilanceScore : 100}
              level={drive.isActive ? drive.vigilance : 'high'}
              size={140}
            />
          </View>
          <Text style={styles.vigilanceHint}>
            {drive.isActive
              ? 'Trajet en cours...'
              : 'Prêt à démarrer un trajet'}
          </Text>
        </Card>

        {/* Start trip button */}
        <Button
          title={drive.isActive ? 'Trajet en cours...' : 'Démarrer un trajet'}
          onPress={handleStartTrip}
          size="lg"
          disabled={drive.isActive || starting}
          loading={starting}
          style={styles.startButton}
        />

        {/* Quick stats */}
        {totalTrips > 0 && (
          <Card style={styles.statsCard}>
            <Text style={styles.cardTitle}>Résumé récent</Text>
            <StatRow
              stats={[
                {
                  icon: 'navigate-outline',
                  label: 'Trajets',
                  value: `${totalTrips}`,
                },
                {
                  icon: 'star-outline',
                  label: 'Score moy.',
                  value: `${avgScore}`,
                  color: avgScore >= 80 ? Colors.success : avgScore >= 50 ? Colors.warning : Colors.danger,
                },
                {
                  icon: 'map-outline',
                  label: 'Distance',
                  value: formatDistance(totalDistance, settings.speedUnit),
                },
              ]}
            />
          </Card>
        )}

        {/* Recent trips */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Derniers trajets</Text>
          {totalTrips > 0 && (
            <TouchableOpacity onPress={() => navigation.navigate('History')}>
              <Text style={styles.seeAll}>Tout voir</Text>
            </TouchableOpacity>
          )}
        </View>

        {totalTrips === 0 ? (
          <Card>
            <View style={styles.emptyState}>
              <Ionicons name="car-outline" size={40} color={Colors.textMuted} />
              <Text style={styles.emptyText}>
                Aucun trajet enregistré.{'\n'}Démarrez votre premier trajet !
              </Text>
            </View>
          </Card>
        ) : (
          recentTrips.map((trip) => (
            <TouchableOpacity
              key={trip.id}
              onPress={() => navigation.navigate('TripDetail', { tripId: trip.id })}
            >
              <Card style={styles.tripCard}>
                <View style={styles.tripRow}>
                  <View style={styles.tripInfo}>
                    <Text style={styles.tripDate}>
                      {new Date(trip.startTime).toLocaleDateString('fr-FR', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </Text>
                    <Text style={styles.tripMeta}>
                      {formatDuration(trip.duration)} · {formatDistance(trip.distance, settings.speedUnit)}
                    </Text>
                  </View>
                  <View style={styles.tripScore}>
                    <Text
                      style={[
                        styles.scoreText,
                        {
                          color:
                            trip.score >= 80
                              ? Colors.success
                              : trip.score >= 50
                              ? Colors.warning
                              : Colors.danger,
                        },
                      ]}
                    >
                      {trip.score}
                    </Text>
                    <Text style={styles.scoreLabel}>/100</Text>
                  </View>
                </View>
              </Card>
            </TouchableOpacity>
          ))
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
  scroll: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xxl,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  greeting: {
    color: Colors.textPrimary,
    fontSize: FontSize.xl,
    fontWeight: '900',
  },
  subtitle: {
    color: Colors.primary,
    fontSize: FontSize.sm,
    fontWeight: '600',
    letterSpacing: 3,
    textTransform: 'uppercase',
  },
  settingsBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.bgCard,
    alignItems: 'center',
    justifyContent: 'center',
  },
  vigilanceCard: {
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  cardTitle: {
    color: Colors.textSecondary,
    fontSize: FontSize.sm,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: Spacing.md,
  },
  vigilanceCenter: {
    marginVertical: Spacing.md,
  },
  vigilanceHint: {
    color: Colors.textMuted,
    fontSize: FontSize.sm,
  },
  startButton: {
    marginBottom: Spacing.lg,
  },
  statsCard: {
    marginBottom: Spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    color: Colors.textPrimary,
    fontSize: FontSize.lg,
    fontWeight: '700',
  },
  seeAll: {
    color: Colors.primary,
    fontSize: FontSize.sm,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  emptyText: {
    color: Colors.textMuted,
    fontSize: FontSize.md,
    textAlign: 'center',
    lineHeight: 22,
  },
  tripCard: {
    marginBottom: Spacing.sm,
    padding: Spacing.md,
  },
  tripRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tripInfo: {
    flex: 1,
  },
  tripDate: {
    color: Colors.textPrimary,
    fontSize: FontSize.md,
    fontWeight: '600',
  },
  tripMeta: {
    color: Colors.textMuted,
    fontSize: FontSize.sm,
    marginTop: 4,
  },
  tripScore: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  scoreText: {
    fontSize: FontSize.xxl,
    fontWeight: '900',
  },
  scoreLabel: {
    color: Colors.textMuted,
    fontSize: FontSize.sm,
    marginLeft: 2,
  },
});
