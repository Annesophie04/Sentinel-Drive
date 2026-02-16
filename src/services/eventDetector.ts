/**
 * Event detection engine
 *
 * Analyzes speed history to detect harsh braking, acceleration, and overspeed events.
 * Uses configurable sensitivity thresholds.
 */
import { TripEvent, TripEventType, AlertSensitivity } from '../types';
import {
  HARSH_ACCEL_THRESHOLD_KMH,
  HARSH_BRAKE_THRESHOLD_KMH,
  DEFAULT_SPEED_LIMIT_KMH,
  DETECTION_WINDOW_MS,
  SENSITIVITY,
} from '../constants/config';

/** Generate a simple unique ID */
function uid(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

interface SpeedSample {
  speed: number; // km/h
  time: number;  // epoch ms
}

/**
 * Detect events from the latest speed samples.
 * Returns new events detected since lastCheckTime.
 */
export function detectEvents(
  speedHistory: SpeedSample[],
  lastCheckTime: number,
  tripStartTime: number,
  sensitivity: AlertSensitivity,
  speedLimit: number = DEFAULT_SPEED_LIMIT_KMH
): TripEvent[] {
  const events: TripEvent[] = [];
  const mult = SENSITIVITY[sensitivity];

  // Only look at recent samples
  const recent = speedHistory.filter((s) => s.time > lastCheckTime);
  if (recent.length < 2) return events;

  for (let i = 1; i < recent.length; i++) {
    const prev = recent[i - 1];
    const curr = recent[i];
    const dt = curr.time - prev.time;

    // Skip if time gap too large (bad GPS or paused)
    if (dt > DETECTION_WINDOW_MS * 2) continue;

    const deltaSpeed = curr.speed - prev.speed;
    const relativeTime = curr.time - tripStartTime;

    // Harsh acceleration
    if (deltaSpeed > HARSH_ACCEL_THRESHOLD_KMH * mult) {
      events.push({
        id: uid(),
        type: 'harsh_accel',
        timestamp: relativeTime,
        value: Math.round(curr.speed),
        message: 'Accélération brusque détectée',
      });
    }

    // Harsh braking (delta is negative)
    if (-deltaSpeed > HARSH_BRAKE_THRESHOLD_KMH * mult) {
      events.push({
        id: uid(),
        type: 'harsh_brake',
        timestamp: relativeTime,
        value: Math.round(curr.speed),
        message: 'Freinage brusque détecté — gardez vos distances',
      });
    }

    // Overspeed
    if (curr.speed > speedLimit * mult && prev.speed <= speedLimit * mult) {
      events.push({
        id: uid(),
        type: 'overspeed',
        timestamp: relativeTime,
        value: Math.round(curr.speed),
        message: `Vitesse élevée : ${Math.round(curr.speed)} km/h`,
      });
    }
  }

  return events;
}

/**
 * Compute vigilance score based on driving duration and pauses.
 * Returns a value between 0 and 100.
 */
export function computeVigilance(
  elapsedMin: number,
  dropStartMin: number,
  lowAtMin: number,
  pausesTaken: number
): number {
  // Each pause "resets" some fatigue
  const effectiveElapsed = Math.max(0, elapsedMin - pausesTaken * 15);

  if (effectiveElapsed <= dropStartMin) return 100;
  if (effectiveElapsed >= lowAtMin) return 20;

  // Linear decay between dropStart and lowAt
  const ratio = (effectiveElapsed - dropStartMin) / (lowAtMin - dropStartMin);
  return Math.round(100 - ratio * 80);
}
