/**
 * Drive context — manages active trip state, GPS tracking, event detection
 */
import React, {
  createContext,
  useContext,
  useState,
  useRef,
  useCallback,
} from 'react';
import * as Location from 'expo-location';
import * as Haptics from 'expo-haptics';
import {
  DriveState,
  INITIAL_DRIVE_STATE,
  TripEvent,
  Trip,
  VigilanceLevel,
} from '../types';
import { useSettings } from './SettingsContext';
import { haversineDistance, msToKmh } from '../services/geo';
import { detectEvents, computeVigilance } from '../services/eventDetector';
import { computeScore, generateTips } from '../services/scoring';
import { saveTrip } from '../services/database';
import {
  GPS_INTERVAL_MS,
  GPS_DISTANCE_FILTER_M,
  VIGILANCE_DROP_START_MIN,
  VIGILANCE_LOW_AT_MIN,
} from '../constants/config';

interface DriveContextValue {
  drive: DriveState;
  latestAlert: TripEvent | null;
  startTrip: () => Promise<boolean>;
  stopTrip: () => Promise<Trip | null>;
}

const DriveContext = createContext<DriveContextValue>({
  drive: INITIAL_DRIVE_STATE,
  latestAlert: null,
  startTrip: async () => false,
  stopTrip: async () => null,
});

export function DriveProvider({ children }: { children: React.ReactNode }) {
  const { settings } = useSettings();
  const [drive, setDrive] = useState<DriveState>(INITIAL_DRIVE_STATE);
  const [latestAlert, setLatestAlert] = useState<TripEvent | null>(null);

  const locationSub = useRef<Location.LocationSubscription | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastCheckRef = useRef<number>(0);
  const stateRef = useRef<DriveState>(INITIAL_DRIVE_STATE);

  // Keep stateRef in sync
  const updateDrive = useCallback((updater: (prev: DriveState) => DriveState) => {
    setDrive((prev) => {
      const next = updater(prev);
      stateRef.current = next;
      return next;
    });
  }, []);

  const startTrip = useCallback(async (): Promise<boolean> => {
    // Request location permission
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') return false;

    const now = Date.now();
    const initialState: DriveState = {
      ...INITIAL_DRIVE_STATE,
      isActive: true,
      startTime: now,
    };
    stateRef.current = initialState;
    setDrive(initialState);
    lastCheckRef.current = now;
    setLatestAlert(null);

    // Start GPS watching
    locationSub.current = await Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.High,
        timeInterval: GPS_INTERVAL_MS,
        distanceInterval: GPS_DISTANCE_FILTER_M,
      },
      (location) => {
        const { latitude, longitude, speed, accuracy } = location.coords;
        const timestamp = location.timestamp;
        const currentSpeedKmh = speed != null && speed >= 0 ? msToKmh(speed) : 0;

        updateDrive((prev) => {
          let distance = prev.distance;

          // Compute distance from last point
          if (prev.lastGps) {
            const d = haversineDistance(
              prev.lastGps.latitude,
              prev.lastGps.longitude,
              latitude,
              longitude
            );
            // Filter out GPS jumps (> 500m in one update is suspicious)
            if (d < 500) {
              distance += d;
            }
          }

          const newMaxSpeed = Math.max(prev.maxSpeed, currentSpeedKmh);
          const newHistory = [
            ...prev.speedHistory,
            { speed: currentSpeedKmh, time: timestamp },
          ];

          // Detect events
          const newEvents = detectEvents(
            newHistory,
            lastCheckRef.current,
            prev.startTime!,
            settings.alertSensitivity
          );
          lastCheckRef.current = timestamp;

          // Trigger haptic + show alert for new events
          if (newEvents.length > 0 && settings.vibrationEnabled) {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
            setLatestAlert(newEvents[newEvents.length - 1]);
            // Auto-dismiss alert after 4s
            setTimeout(() => setLatestAlert(null), 4000);
          }

          const allEvents = [...prev.events, ...newEvents];

          return {
            ...prev,
            currentSpeed: currentSpeedKmh,
            distance,
            maxSpeed: newMaxSpeed,
            lastGps: { latitude, longitude, speed, timestamp, accuracy },
            speedHistory: newHistory,
            events: allEvents,
          };
        });
      }
    );

    // Timer for elapsed time + vigilance
    timerRef.current = setInterval(() => {
      updateDrive((prev) => {
        if (!prev.startTime) return prev;
        const elapsedSec = Math.floor((Date.now() - prev.startTime) / 1000);
        const elapsedMin = elapsedSec / 60;

        const pausesTaken = prev.events.filter((e) => e.type === 'pause_taken').length;
        const vigScore = computeVigilance(
          elapsedMin,
          VIGILANCE_DROP_START_MIN,
          VIGILANCE_LOW_AT_MIN,
          pausesTaken
        );

        let vigLevel: VigilanceLevel = 'high';
        if (vigScore < 50) vigLevel = 'low';
        else if (vigScore < 75) vigLevel = 'medium';

        // Check if we should emit a vigilance_low or pause_recommended event
        const newEvents: TripEvent[] = [];
        const relTime = Date.now() - prev.startTime;

        if (
          vigLevel === 'low' &&
          prev.vigilance !== 'low'
        ) {
          const evt: TripEvent = {
            id: `vig-${Date.now()}`,
            type: 'vigilance_low',
            timestamp: relTime,
            message: 'Vigilance en baisse — pause recommandée',
          };
          newEvents.push(evt);
          if (settings.vibrationEnabled) {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          }
          setLatestAlert(evt);
          setTimeout(() => setLatestAlert(null), 5000);
        }

        // Pause recommendation
        if (
          elapsedMin > 0 &&
          elapsedMin % settings.pauseThresholdMin < 1 &&
          Math.floor(elapsedMin) === settings.pauseThresholdMin &&
          !prev.events.some((e) => e.type === 'pause_recommended')
        ) {
          const evt: TripEvent = {
            id: `pause-${Date.now()}`,
            type: 'pause_recommended',
            timestamp: relTime,
            message: `${settings.pauseThresholdMin} min de conduite — pensez à faire une pause`,
          };
          newEvents.push(evt);
          if (settings.vibrationEnabled) {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          }
          setLatestAlert(evt);
          setTimeout(() => setLatestAlert(null), 5000);
        }

        return {
          ...prev,
          elapsedSec,
          vigilanceScore: vigScore,
          vigilance: vigLevel,
          events: [...prev.events, ...newEvents],
        };
      });
    }, 1000);

    return true;
  }, [settings, updateDrive]);

  const stopTrip = useCallback(async (): Promise<Trip | null> => {
    // Stop GPS
    if (locationSub.current) {
      locationSub.current.remove();
      locationSub.current = null;
    }
    // Stop timer
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    const state = stateRef.current;
    if (!state.startTime) return null;

    const endTime = Date.now();
    const durationSec = Math.floor((endTime - state.startTime) / 1000);

    const scoreBreakdown = computeScore(
      state.events,
      durationSec,
      settings.pauseThresholdMin
    );
    const tips = generateTips(state.events, durationSec);

    const avgSpeed =
      durationSec > 0 ? (state.distance / 1000) / (durationSec / 3600) : 0;

    const trip: Trip = {
      id: `trip-${state.startTime}`,
      startTime: state.startTime,
      endTime,
      duration: durationSec,
      distance: state.distance,
      maxSpeed: state.maxSpeed,
      avgSpeed: Math.round(avgSpeed * 10) / 10,
      score: scoreBreakdown.final,
      events: state.events,
      tips,
    };

    // Save to database
    await saveTrip(trip);

    // Reset state
    setDrive(INITIAL_DRIVE_STATE);
    stateRef.current = INITIAL_DRIVE_STATE;
    setLatestAlert(null);

    return trip;
  }, [settings]);

  return (
    <DriveContext.Provider value={{ drive, latestAlert, startTrip, stopTrip }}>
      {children}
    </DriveContext.Provider>
  );
}

export function useDrive() {
  return useContext(DriveContext);
}
