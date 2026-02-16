/**
 * HistoryScreen — List of all past trips
 */
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, FontSize, BorderRadius, Shadow } from '../constants/theme';
import { Card } from '../components/Card';
import { getAllTrips } from '../services/database';
import { formatDuration, formatDistance } from '../services/geo';
import { useSettings } from '../context/SettingsContext';
import { Trip } from '../types';
import type { RootStackParamList } from '../../App';

type NavProp = NativeStackNavigationProp<RootStackParamList>;

export function HistoryScreen() {
  const navigation = useNavigation<NavProp>();
  const { settings } = useSettings();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadTrips = useCallback(async () => {
    const data = await getAllTrips();
    setTrips(data);
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', loadTrips);
    return unsubscribe;
  }, [navigation, loadTrips]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadTrips();
    setRefreshing(false);
  }, [loadTrips]);

  const renderTrip = ({ item }: { item: Trip }) => {
    const scoreColor =
      item.score >= 80
        ? Colors.success
        : item.score >= 50
        ? Colors.warning
        : Colors.danger;

    return (
      <TouchableOpacity
        onPress={() => navigation.navigate('TripDetail', { tripId: item.id })}
        activeOpacity={0.7}
      >
        <Card style={styles.tripCard}>
          <View style={styles.tripRow}>
            {/* Score badge */}
            <View style={[styles.scoreBadge, { backgroundColor: scoreColor + '20' }]}>
              <Text style={[styles.scoreBadgeText, { color: scoreColor }]}>
                {item.score}
              </Text>
            </View>

            {/* Trip info */}
            <View style={styles.tripInfo}>
              <Text style={styles.tripDate}>
                {new Date(item.startTime).toLocaleDateString('fr-FR', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </Text>
              <Text style={styles.tripTime}>
                {new Date(item.startTime).toLocaleTimeString('fr-FR', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </Text>
              <View style={styles.tripMeta}>
                <View style={styles.metaItem}>
                  <Ionicons name="time-outline" size={14} color={Colors.textMuted} />
                  <Text style={styles.metaText}>{formatDuration(item.duration)}</Text>
                </View>
                <View style={styles.metaItem}>
                  <Ionicons name="map-outline" size={14} color={Colors.textMuted} />
                  <Text style={styles.metaText}>
                    {formatDistance(item.distance, settings.speedUnit)}
                  </Text>
                </View>
                <View style={styles.metaItem}>
                  <Ionicons name="alert-circle-outline" size={14} color={Colors.textMuted} />
                  <Text style={styles.metaText}>{item.events.length}</Text>
                </View>
              </View>
            </View>

            {/* Arrow */}
            <Ionicons name="chevron-forward" size={20} color={Colors.textMuted} />
          </View>
        </Card>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.title}>Historique</Text>
        <View style={styles.placeholder} />
      </View>

      {trips.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="document-text-outline" size={48} color={Colors.textMuted} />
          <Text style={styles.emptyText}>Aucun trajet enregistré</Text>
        </View>
      ) : (
        <FlatList
          data={trips}
          keyExtractor={(item) => item.id}
          renderItem={renderTrip}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={Colors.primary}
            />
          }
        />
      )}
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
  list: {
    padding: Spacing.lg,
    paddingTop: 0,
    gap: Spacing.sm,
  },
  tripCard: {
    padding: Spacing.md,
  },
  tripRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  scoreBadge: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreBadgeText: {
    fontSize: FontSize.lg,
    fontWeight: '900',
  },
  tripInfo: {
    flex: 1,
  },
  tripDate: {
    color: Colors.textPrimary,
    fontSize: FontSize.md,
    fontWeight: '600',
  },
  tripTime: {
    color: Colors.textSecondary,
    fontSize: FontSize.sm,
    marginTop: 2,
  },
  tripMeta: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginTop: Spacing.sm,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    color: Colors.textMuted,
    fontSize: FontSize.xs,
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.md,
  },
  emptyText: {
    color: Colors.textMuted,
    fontSize: FontSize.md,
  },
});
