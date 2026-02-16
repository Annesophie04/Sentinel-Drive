/**
 * Core type definitions for Sentinel Drive Sense
 */

/** Vigilance levels */
export type VigilanceLevel = 'high' | 'medium' | 'low';

/** Event types detected during a trip */
export type TripEventType =
  | 'harsh_brake'
  | 'harsh_accel'
  | 'overspeed'
  | 'vigilance_low'
  | 'pause_recommended'
  | 'pause_taken';

/** A single event during a trip */
export interface TripEvent {
  id: string;
  type: TripEventType;
  timestamp: number;       // ms since trip start
  value?: number;          // e.g. speed at that moment
  message: string;         // human-readable short message
}

/** GPS data point */
export interface GpsPoint {
  latitude: number;
  longitude: number;
  speed: number | null;    // m/s from device, can be null
  timestamp: number;       // epoch ms
  accuracy: number | null;
}

/** Complete trip record */
export interface Trip {
  id: string;
  startTime: number;       // epoch ms
  endTime: number;         // epoch ms
  duration: number;        // seconds
  distance: number;        // meters
  maxSpeed: number;        // km/h
  avgSpeed: number;        // km/h
  score: number;           // 0–100
  events: TripEvent[];
  tips: string[];
}

/** Alert sensitivity setting */
export type AlertSensitivity = 'low' | 'medium' | 'high';

/** Speed unit preference */
export type SpeedUnit = 'kmh' | 'mph';

/** User settings stored locally */
export interface UserSettings {
  onboardingComplete: boolean;
  alertSensitivity: AlertSensitivity;
  pauseThresholdMin: number;
  vibrationEnabled: boolean;
  speedUnit: SpeedUnit;
}

/** Defaults for settings */
export const DEFAULT_SETTINGS: UserSettings = {
  onboardingComplete: false,
  alertSensitivity: 'medium',
  pauseThresholdMin: 60,
  vibrationEnabled: true,
  speedUnit: 'kmh',
};

/** Live drive state shared via context */
export interface DriveState {
  isActive: boolean;
  startTime: number | null;
  elapsedSec: number;
  currentSpeed: number;     // km/h
  distance: number;         // meters
  maxSpeed: number;         // km/h
  vigilance: VigilanceLevel;
  vigilanceScore: number;   // 0–100
  events: TripEvent[];
  lastGps: GpsPoint | null;
  speedHistory: { speed: number; time: number }[];
}

export const INITIAL_DRIVE_STATE: DriveState = {
  isActive: false,
  startTime: null,
  elapsedSec: 0,
  currentSpeed: 0,
  distance: 0,
  maxSpeed: 0,
  vigilance: 'high',
  vigilanceScore: 100,
  events: [],
  lastGps: null,
  speedHistory: [],
};
