import { describe, it, expect } from '@jest/globals';
import {
  formatDate,
  getPastDaysDateStrings,
  calculateStreaks,
} from '../src/utils/dateHelpers';

describe('Date & Streak Helpers', () => {
  it('formats dates consistently to YYYY-MM-DD', () => {
    const testDate = new Date(2026, 9, 20); // Oct 20, 2026
    expect(formatDate(testDate)).toBe('2026-10-20');
  });

  it('generates array of past days ending today', () => {
    const days = getPastDaysDateStrings(7);
    expect(days).toHaveLength(7);
    expect(days[0] < days[6]).toBe(true); // Chronological order (oldest to newest)
  });

  describe('calculateStreaks', () => {
    it('returns 0 streaks for empty records', () => {
      const result = calculateStreaks([]);
      expect(result.currentStreak).toBe(0);
      expect(result.longestStreak).toBe(0);
    });

    it('calculates longest streak correctly from chronological historical data', () => {
      const records = [
        { date: '2026-10-01', goalReached: true, steps: 10000 },
        { date: '2026-10-02', goalReached: true, steps: 11000 },
        { date: '2026-10-03', goalReached: true, steps: 10500 },
        { date: '2026-10-04', goalReached: false, steps: 4000 },
        { date: '2026-10-05', goalReached: true, steps: 10200 },
        { date: '2026-10-06', goalReached: true, steps: 10800 },
      ];

      const result = calculateStreaks(records);
      expect(result.longestStreak).toBe(3);
    });
  });
});
