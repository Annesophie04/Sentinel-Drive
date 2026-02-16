/**
 * Configuration defaults for Sentinel Drive Sense
 */

/** GPS polling interval in milliseconds */
export const GPS_INTERVAL_MS = 2000;

/** Minimum distance (m) between GPS updates to record */
export const GPS_DISTANCE_FILTER_M = 5;

/** Speed thresholds (km/h) */
export const DEFAULT_SPEED_LIMIT_KMH = 130;

/** Acceleration / braking detection: delta speed (km/h) over DETECTION_WINDOW_MS */
export const HARSH_ACCEL_THRESHOLD_KMH = 15;
export const HARSH_BRAKE_THRESHOLD_KMH = 20;
export const DETECTION_WINDOW_MS = 3000;

/** Vigilance: starts dropping after this many minutes */
export const VIGILANCE_DROP_START_MIN = 20;
/** Vigilance: fully low at this duration (minutes) */
export const VIGILANCE_LOW_AT_MIN = 90;

/** Default pause reminder threshold (minutes) */
export const DEFAULT_PAUSE_THRESHOLD_MIN = 60;

/** Score penalties */
export const PENALTY_HARSH_BRAKE = 5;
export const PENALTY_HARSH_ACCEL = 3;
export const PENALTY_OVERSPEED_PER_EVENT = 4;
export const PENALTY_LONG_DRIVE_NO_PAUSE = 10;

/** Alert sensitivity multipliers */
export const SENSITIVITY = {
  low: 1.4,
  medium: 1.0,
  high: 0.7,
} as const;
