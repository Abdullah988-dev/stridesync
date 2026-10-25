/**
 * Date helper utilities for StrideSync
 * Handles local timezone, day formatting, and streak calculations.
 */

/**
 * Returns today's date formatted as YYYY-MM-DD in local time.
 */
export function getTodayDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Formats a Date object to YYYY-MM-DD.
 */
export function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Returns an array of the past `days` date strings ending today (oldest to newest).
 */
export function getPastDaysDateStrings(days: number): string[] {
  const dates: string[] = [];
  const now = new Date();

  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    dates.push(formatDate(d));
  }

  return dates;
}

/**
 * Gets short weekday label (e.g. "Mon", "Tue").
 */
export function getShortWeekday(dateString: string): string {
  const [year, month, day] = dateString.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString('en-US', { weekday: 'short' });
}

/**
 * Gets a human-friendly display date: "Today", "Yesterday", or "Oct 20".
 */
export function formatDisplayDate(dateString: string): string {
  const today = getTodayDateString();
  if (dateString === today) return 'Today';

  const [year, month, day] = dateString.split('-').map(Number);
  const date = new Date(year, month - 1, day);

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  if (formatDate(yesterday) === dateString) return 'Yesterday';

  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export interface DayGoalRecord {
  date: string;
  goalReached: boolean;
  steps: number;
}

/**
 * Calculates current streak and longest streak from historical daily records.
 * Consecutive days where goalReached is true.
 */
export function calculateStreaks(records: DayGoalRecord[]): {
  currentStreak: number;
  longestStreak: number;
} {
  if (!records || records.length === 0) {
    return { currentStreak: 0, longestStreak: 0 };
  }

  // Sort descending by date (most recent first)
  const sorted = [...records].sort((a, b) => b.date.localeCompare(a.date));
  const today = getTodayDateString();
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = formatDate(yesterday);

  // Check if today or yesterday has goal reached
  let currentStreak = 0;
  const map = new Map<string, boolean>();
  records.forEach((r) => map.set(r.date, r.goalReached));

  let checkDate = new Date();
  // If today isn't completed yet, check if yesterday was completed to keep the streak alive
  if (!map.get(today)) {
    checkDate.setDate(checkDate.getDate() - 1);
  }

  while (true) {
    const dateStr = formatDate(checkDate);
    if (map.get(dateStr)) {
      currentStreak++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      break;
    }
  }

  // Calculate longest streak historically
  let longestStreak = 0;
  let tempStreak = 0;

  // Sort ascending for chronological walk
  const ascending = [...records].sort((a, b) => a.date.localeCompare(b.date));

  for (let i = 0; i < ascending.length; i++) {
    if (ascending[i].goalReached) {
      tempStreak++;
      if (tempStreak > longestStreak) {
        longestStreak = tempStreak;
      }
    } else {
      tempStreak = 0;
    }
  }

  return {
    currentStreak,
    longestStreak: Math.max(longestStreak, currentStreak),
  };
}
