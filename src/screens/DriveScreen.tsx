/**
 * DriveScreen — Focus Mode driving interface
 *
 * Minimal UI: speed, duration, vigilance ring, stop button
 * AlertToast overlays for non-intrusive notifications
 * Dark theme permanent, keep awake enabled
 */
import React, { useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useKeepAwake } from 'expo-keep-awake';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, FontSize, BorderRadius, Shadow } from '../constants/theme';
import { VigilanceRing } from '../components/VigilanceRing';
import { AlertToast } from '../components/AlertToast';
import { useDrive } from '../context/DriveContext';
import { useSettings } from '../context/SettingsContext';
import { formatDuration, formatSpeed, speedUnitLabel } from '../services/geo';
import type { RootStackParamList } from '../../App';

type NavProp = NativeStackNavigationProp<RootStackParamList>;

export function DriveScreen() {
  useKeepAwake(); // Keep screen on during drive

  const navigation = useNavigation<NavProp>();
  const { drive, latestAlert, stopTrip } = useDrive();
  const { settings } = useSettings();

  const handleStop = useCallback(async () => {
    const trip = await stopTrip();
    if (trip) {
      navigation.replace('Summary', { tripId: trip.id });
    } else {
      navigation.goBack();
    }
  }, [stopTrip, navigation]);

  const unit = settings.speedUnit;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.bg} />

      {/* Alert toast overlay */}
      <AlertToast event={latestAlert} />

      <SafeAreaView style={styles.safe}>
        {/* Top bar — minimal */}
        <View style={styles.topBar}>
          <View style={styles.topIndicator}>
            <View style={styles.liveDot} />
            <Text style={styles.liveText}>EN COURS</Text>
          </View>
          <Text style={styles.duration}>{formatDuration(drive.elapsedSec)}</Text>
        </View>

        {/* Main speed display */}
        <View style={styles.speedContainer}>
          <Text style={styles.speedValue}>
            {formatSpeed(drive.currentSpeed, unit)}
          </Text>
          <Text style={styles.speedUnit}>{speedUnitLabel(unit)}</Text>
        </View>

        {/* Vigilance ring */}
        <View style={styles.vigilanceContainer}>
          <VigilanceRing
            score={drive.vigilanceScore}
            level={drive.vigilance}
            size={100}
            strokeWidth={8}
          />
        </View>

        {/* Bottom info strip */}
        <View style={styles.infoStrip}>
          <View style={styles.infoItem}>
            <Ionicons name="speedometer-outline" size={18} color={Colors.textMuted} />
            <Text style={styles.infoValue}>
              {formatSpeed(drive.maxSpeed, unit)} {speedUnitLabel(unit)}
            </Text>
            <Text style={styles.infoLabel}>Max</Text>
          </View>
          <View style={styles.infoItem}>
            <Ionicons name="map-outline" size={18} color={Colors.textMuted} />
            <Text style={styles.infoValue}>
              {(drive.distance / 1000).toFixed(1)} km
            </Text>
            <Text style={styles.infoLabel}>Distance</Text>
          </View>
          <View style={styles.infoItem}>
            <Ionicons name="alert-circle-outline" size={18} color={Colors.textMuted} />
            <Text style={styles.infoValue}>{drive.events.length}</Text>
            <Text style={styles.infoLabel}>Événements</Text>
          </View>
        </View>

        {/* Stop button */}
        <TouchableOpacity
          onPress={handleStop}
          style={styles.stopButton}
          activeOpacity={0.7}
        >
          <View style={styles.stopInner}>
            <Ionicons name="stop" size={28} color={Colors.white} />
            <Text style={styles.stopText}>Terminer</Text>
          </View>
        </TouchableOpacity>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  safe: {
    flex: 1,
    justifyContent: 'space-between',
    padding: Spacing.lg,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  topIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  liveDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.success,
  },
  liveText: {
    color: Colors.success,
    fontSize: FontSize.xs,
    fontWeight: '800',
    letterSpacing: 2,
  },
  duration: {
    color: Colors.textSecondary,
    fontSize: FontSize.lg,
    fontWeight: '600',
  },
  speedContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  speedValue: {
    color: Colors.textPrimary,
    fontSize: 96,
    fontWeight: '900',
    lineHeight: 110,
  },
  speedUnit: {
    color: Colors.textMuted,
    fontSize: FontSize.xl,
    fontWeight: '600',
    marginTop: -8,
  },
  vigilanceContainer: {
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  infoStrip: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: Colors.bgCard,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
  },
  infoItem: {
    alignItems: 'center',
    gap: 4,
  },
  infoValue: {
    color: Colors.textPrimary,
    fontSize: FontSize.md,
    fontWeight: '700',
  },
  infoLabel: {
    color: Colors.textMuted,
    fontSize: FontSize.xs,
  },
  stopButton: {
    backgroundColor: Colors.danger,
    borderRadius: BorderRadius.xl,
    paddingVertical: Spacing.lg,
    alignItems: 'center',
    ...Shadow.card,
  },
  stopInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  stopText: {
    color: Colors.white,
    fontSize: FontSize.lg,
    fontWeight: '800',
  },
});
