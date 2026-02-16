/**
 * EventTimeline — chronological list of trip events (Safety Timeline)
 */
import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, FontSize, BorderRadius } from '../constants/theme';
import { TripEvent } from '../types';
import { formatDuration } from '../services/geo';

interface EventTimelineProps {
  events: TripEvent[];
}

const EVENT_ICON_MAP: Record<string, { icon: keyof typeof Ionicons.glyphMap; color: string }> = {
  harsh_brake: { icon: 'warning', color: Colors.danger },
  harsh_accel: { icon: 'speedometer', color: Colors.warning },
  overspeed: { icon: 'flash', color: Colors.danger },
  vigilance_low: { icon: 'eye-off', color: Colors.warning },
  pause_recommended: { icon: 'cafe', color: Colors.primary },
  pause_taken: { icon: 'checkmark-circle', color: Colors.success },
};

const EVENT_LABELS: Record<string, string> = {
  harsh_brake: 'Freinage brusque',
  harsh_accel: 'Accélération brusque',
  overspeed: 'Vitesse élevée',
  vigilance_low: 'Vigilance basse',
  pause_recommended: 'Pause recommandée',
  pause_taken: 'Pause effectuée',
};

function EventItem({ event }: { event: TripEvent }) {
  const config = EVENT_ICON_MAP[event.type] || {
    icon: 'alert-circle' as const,
    color: Colors.textMuted,
  };

  const timeStr = formatDuration(Math.floor(event.timestamp / 1000));

  return (
    <View style={styles.item}>
      <View style={[styles.iconCircle, { backgroundColor: config.color + '20' }]}>
        <Ionicons name={config.icon} size={18} color={config.color} />
      </View>
      <View style={styles.content}>
        <Text style={styles.eventLabel}>{EVENT_LABELS[event.type] || event.type}</Text>
        <Text style={styles.eventMessage}>{event.message}</Text>
      </View>
      <Text style={styles.time}>+{timeStr}</Text>
    </View>
  );
}

export function EventTimeline({ events }: EventTimelineProps) {
  if (events.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="checkmark-circle" size={32} color={Colors.success} />
        <Text style={styles.emptyText}>Aucun événement détecté — bravo !</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={events}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => <EventItem event={item} />}
      scrollEnabled={false}
      ItemSeparatorComponent={() => <View style={styles.separator} />}
    />
  );
}

const styles = StyleSheet.create({
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
  },
  eventLabel: {
    color: Colors.textPrimary,
    fontSize: FontSize.sm,
    fontWeight: '700',
  },
  eventMessage: {
    color: Colors.textSecondary,
    fontSize: FontSize.xs,
    marginTop: 2,
  },
  time: {
    color: Colors.textMuted,
    fontSize: FontSize.xs,
    fontWeight: '600',
  },
  separator: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: Spacing.sm,
    marginLeft: 44,
  },
  emptyContainer: {
    alignItems: 'center',
    padding: Spacing.lg,
    gap: Spacing.sm,
  },
  emptyText: {
    color: Colors.textSecondary,
    fontSize: FontSize.md,
    textAlign: 'center',
  },
});
