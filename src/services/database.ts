/**
 * Database service using expo-sqlite
 * Handles trip persistence and settings storage
 */
import * as SQLite from 'expo-sqlite';
import { Trip, TripEvent, UserSettings, DEFAULT_SETTINGS } from '../types';

const DB_NAME = 'sentinel_drive.db';

let db: SQLite.SQLiteDatabase | null = null;

/** Open (or create) the database and run migrations */
export async function initDatabase(): Promise<void> {
  db = await SQLite.openDatabaseAsync(DB_NAME);

  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS trips (
      id TEXT PRIMARY KEY,
      start_time INTEGER NOT NULL,
      end_time INTEGER NOT NULL,
      duration INTEGER NOT NULL,
      distance REAL NOT NULL,
      max_speed REAL NOT NULL,
      avg_speed REAL NOT NULL,
      score INTEGER NOT NULL,
      events TEXT NOT NULL,
      tips TEXT NOT NULL
    );
  `);
}

function getDb(): SQLite.SQLiteDatabase {
  if (!db) throw new Error('Database not initialized. Call initDatabase() first.');
  return db;
}

// ─── Settings ────────────────────────────────────────────────────────────────

export async function loadSettings(): Promise<UserSettings> {
  const database = getDb();
  const rows = await database.getAllAsync<{ key: string; value: string }>(
    'SELECT key, value FROM settings'
  );

  const settings = { ...DEFAULT_SETTINGS };
  for (const row of rows) {
    const key = row.key as keyof UserSettings;
    if (key in settings) {
      try {
        (settings as any)[key] = JSON.parse(row.value);
      } catch {
        (settings as any)[key] = row.value;
      }
    }
  }
  return settings;
}

export async function saveSetting<K extends keyof UserSettings>(
  key: K,
  value: UserSettings[K]
): Promise<void> {
  const database = getDb();
  const serialized = JSON.stringify(value);
  await database.runAsync(
    'INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)',
    [key, serialized]
  );
}

export async function saveAllSettings(settings: UserSettings): Promise<void> {
  const entries = Object.entries(settings) as [keyof UserSettings, any][];
  for (const [key, value] of entries) {
    await saveSetting(key, value);
  }
}

// ─── Trips ───────────────────────────────────────────────────────────────────

export async function saveTrip(trip: Trip): Promise<void> {
  const database = getDb();
  await database.runAsync(
    `INSERT OR REPLACE INTO trips
      (id, start_time, end_time, duration, distance, max_speed, avg_speed, score, events, tips)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      trip.id,
      trip.startTime,
      trip.endTime,
      trip.duration,
      trip.distance,
      trip.maxSpeed,
      trip.avgSpeed,
      trip.score,
      JSON.stringify(trip.events),
      JSON.stringify(trip.tips),
    ]
  );
}

export async function getAllTrips(): Promise<Trip[]> {
  const database = getDb();
  const rows = await database.getAllAsync<{
    id: string;
    start_time: number;
    end_time: number;
    duration: number;
    distance: number;
    max_speed: number;
    avg_speed: number;
    score: number;
    events: string;
    tips: string;
  }>('SELECT * FROM trips ORDER BY start_time DESC');

  return rows.map((row) => ({
    id: row.id,
    startTime: row.start_time,
    endTime: row.end_time,
    duration: row.duration,
    distance: row.distance,
    maxSpeed: row.max_speed,
    avgSpeed: row.avg_speed,
    score: row.score,
    events: JSON.parse(row.events) as TripEvent[],
    tips: JSON.parse(row.tips) as string[],
  }));
}

export async function getTripById(id: string): Promise<Trip | null> {
  const database = getDb();
  const row = await database.getFirstAsync<{
    id: string;
    start_time: number;
    end_time: number;
    duration: number;
    distance: number;
    max_speed: number;
    avg_speed: number;
    score: number;
    events: string;
    tips: string;
  }>('SELECT * FROM trips WHERE id = ?', [id]);

  if (!row) return null;

  return {
    id: row.id,
    startTime: row.start_time,
    endTime: row.end_time,
    duration: row.duration,
    distance: row.distance,
    maxSpeed: row.max_speed,
    avgSpeed: row.avg_speed,
    score: row.score,
    events: JSON.parse(row.events) as TripEvent[],
    tips: JSON.parse(row.tips) as string[],
  };
}

export async function deleteTrip(id: string): Promise<void> {
  const database = getDb();
  await database.runAsync('DELETE FROM trips WHERE id = ?', [id]);
}
