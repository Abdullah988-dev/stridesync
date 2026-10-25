import * as SQLite from 'expo-sqlite';
import { Platform } from 'react-native';

export interface DailyStepRecord {
  date: string; // YYYY-MM-DD
  steps: number;
  distanceKm: number;
  calories: number;
  activeMinutes: number;
  goalReached: boolean;
  updatedAt: string;
}

export interface HourlyStepRecord {
  hour: number; // 0 - 23
  steps: number;
}

export interface AchievementRecord {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt: string | null;
  requirement: number;
  category: string;
}

// In-memory fallback for web / unsupported environments
let memoryDailySteps: Map<string, DailyStepRecord> = new Map();
let memoryHourlySteps: Map<string, Map<number, number>> = new Map();
let memoryAchievements: Map<string, AchievementRecord> = new Map();

let dbInstance: SQLite.SQLiteDatabase | null = null;

export async function getDb(): Promise<SQLite.SQLiteDatabase | null> {
  if (Platform.OS === 'web') return null;
  if (!dbInstance) {
    try {
      dbInstance = await SQLite.openDatabaseAsync('stridesync.db');
    } catch (e) {
      console.warn('Failed to open SQLite database:', e);
      return null;
    }
  }
  return dbInstance;
}

/**
 * Initializes the SQLite database tables.
 */
export async function initDatabase(): Promise<void> {
  const db = await getDb();
  if (!db) {
    return;
  }

  try {
    await db.execAsync(`
      PRAGMA journal_mode = WAL;
      CREATE TABLE IF NOT EXISTS daily_steps (
        date TEXT PRIMARY KEY,
        steps INTEGER NOT NULL,
        distance_km REAL NOT NULL,
        calories REAL NOT NULL,
        active_minutes INTEGER NOT NULL,
        goal_reached INTEGER NOT NULL,
        updated_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS hourly_steps (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        date TEXT NOT NULL,
        hour INTEGER NOT NULL,
        steps INTEGER NOT NULL,
        UNIQUE(date, hour)
      );

      CREATE TABLE IF NOT EXISTS achievements (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        icon TEXT NOT NULL,
        unlocked_at TEXT,
        requirement INTEGER NOT NULL,
        category TEXT NOT NULL
      );
    `);
  } catch (error) {
    console.warn('Error creating SQLite tables:', error);
  }
}

/**
 * Saves or updates daily step record.
 */
export async function saveDailySteps(record: {
  date: string;
  steps: number;
  distanceKm: number;
  calories: number;
  activeMinutes: number;
  goalReached: boolean;
}): Promise<void> {
  const updatedAt = new Date().toISOString();
  const db = await getDb();

  if (!db) {
    memoryDailySteps.set(record.date, {
      ...record,
      updatedAt,
    });
    return;
  }

  try {
    await db.runAsync(
      `INSERT INTO daily_steps (date, steps, distance_km, calories, active_minutes, goal_reached, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)
       ON CONFLICT(date) DO UPDATE SET
         steps = excluded.steps,
         distance_km = excluded.distance_km,
         calories = excluded.calories,
         active_minutes = excluded.active_minutes,
         goal_reached = excluded.goal_reached,
         updated_at = excluded.updated_at;`,
      [
        record.date,
        record.steps,
        record.distanceKm,
        record.calories,
        record.activeMinutes,
        record.goalReached ? 1 : 0,
        updatedAt,
      ]
    );
  } catch (error) {
    console.error('Failed to save daily steps to SQLite:', error);
  }
}

/**
 * Gets daily step record for a specific date.
 */
export async function getDailySteps(date: string): Promise<DailyStepRecord | null> {
  const db = await getDb();
  if (!db) {
    return memoryDailySteps.get(date) || null;
  }

  try {
    const row = await db.getFirstAsync<any>(
      `SELECT date, steps, distance_km as distanceKm, calories, active_minutes as activeMinutes, goal_reached as goalReached, updated_at as updatedAt
       FROM daily_steps WHERE date = ?;`,
      [date]
    );

    if (!row) return null;
    return {
      date: row.date,
      steps: Number(row.steps),
      distanceKm: Number(row.distanceKm),
      calories: Number(row.calories),
      activeMinutes: Number(row.activeMinutes),
      goalReached: Boolean(row.goalReached),
      updatedAt: row.updatedAt,
    };
  } catch (error) {
    console.error('Failed to fetch daily steps from SQLite:', error);
    return null;
  }
}

/**
 * Gets all daily step records sorted by date descending.
 */
export async function getAllDailySteps(): Promise<DailyStepRecord[]> {
  const db = await getDb();
  if (!db) {
    return Array.from(memoryDailySteps.values()).sort((a, b) => b.date.localeCompare(a.date));
  }

  try {
    const rows = await db.getAllAsync<any>(
      `SELECT date, steps, distance_km as distanceKm, calories, active_minutes as activeMinutes, goal_reached as goalReached, updated_at as updatedAt
       FROM daily_steps ORDER BY date DESC;`
    );

    return rows.map((row) => ({
      date: row.date,
      steps: Number(row.steps),
      distanceKm: Number(row.distanceKm),
      calories: Number(row.calories),
      activeMinutes: Number(row.activeMinutes),
      goalReached: Boolean(row.goalReached),
      updatedAt: row.updatedAt,
    }));
  } catch (error) {
    console.error('Failed to fetch all daily steps from SQLite:', error);
    return [];
  }
}

/**
 * Gets daily step records between start and end dates inclusive.
 */
export async function getRangeDailySteps(
  startDate: string,
  endDate: string
): Promise<DailyStepRecord[]> {
  const db = await getDb();
  if (!db) {
    return Array.from(memoryDailySteps.values())
      .filter((r) => r.date >= startDate && r.date <= endDate)
      .sort((a, b) => a.date.localeCompare(b.date));
  }

  try {
    const rows = await db.getAllAsync<any>(
      `SELECT date, steps, distance_km as distanceKm, calories, active_minutes as activeMinutes, goal_reached as goalReached, updated_at as updatedAt
       FROM daily_steps WHERE date >= ? AND date <= ? ORDER BY date ASC;`,
      [startDate, endDate]
    );

    return rows.map((row) => ({
      date: row.date,
      steps: Number(row.steps),
      distanceKm: Number(row.distanceKm),
      calories: Number(row.calories),
      activeMinutes: Number(row.activeMinutes),
      goalReached: Boolean(row.goalReached),
      updatedAt: row.updatedAt,
    }));
  } catch (error) {
    console.error('Failed to fetch range daily steps from SQLite:', error);
    return [];
  }
}

/**
 * Saves hourly step breakdown for a given date.
 */
export async function saveHourlySteps(date: string, hour: number, steps: number): Promise<void> {
  const db = await getDb();
  if (!db) {
    if (!memoryHourlySteps.has(date)) {
      memoryHourlySteps.set(date, new Map());
    }
    memoryHourlySteps.get(date)!.set(hour, steps);
    return;
  }

  try {
    await db.runAsync(
      `INSERT INTO hourly_steps (date, hour, steps)
       VALUES (?, ?, ?)
       ON CONFLICT(date, hour) DO UPDATE SET steps = excluded.steps;`,
      [date, hour, steps]
    );
  } catch (error) {
    console.error('Failed to save hourly steps to SQLite:', error);
  }
}

/**
 * Gets hourly step breakdown for a specific date (24 hours).
 */
export async function getHourlySteps(date: string): Promise<HourlyStepRecord[]> {
  const db = await getDb();
  const defaultHourly = Array.from({ length: 24 }, (_, i) => ({ hour: i, steps: 0 }));

  if (!db) {
    const map = memoryHourlySteps.get(date);
    if (!map) return defaultHourly;
    return defaultHourly.map((h) => ({
      hour: h.hour,
      steps: map.get(h.hour) || 0,
    }));
  }

  try {
    const rows = await db.getAllAsync<any>(
      `SELECT hour, steps FROM hourly_steps WHERE date = ? ORDER BY hour ASC;`,
      [date]
    );

    const stepMap = new Map<number, number>();
    rows.forEach((r) => stepMap.set(Number(r.hour), Number(r.steps)));

    return defaultHourly.map((h) => ({
      hour: h.hour,
      steps: stepMap.get(h.hour) || 0,
    }));
  } catch (error) {
    console.error('Failed to fetch hourly steps from SQLite:', error);
    return defaultHourly;
  }
}

/**
 * Clears all data in the database (used for reset).
 */
export async function resetDatabase(): Promise<void> {
  memoryDailySteps.clear();
  memoryHourlySteps.clear();
  memoryAchievements.clear();

  const db = await getDb();
  if (!db) return;

  try {
    await db.execAsync(`
      DELETE FROM daily_steps;
      DELETE FROM hourly_steps;
      DELETE FROM achievements;
    `);
  } catch (error) {
    console.error('Failed to reset SQLite database:', error);
  }
}
