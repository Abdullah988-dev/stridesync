import { describe, it, expect } from '@jest/globals';
import {
  calculateStrideLengthCm,
  calculateDistanceKm,
  kmToMiles,
  milesToKm,
  kgToLbs,
  lbsToKg,
  calculateCaloriesBurned,
  calculateActiveMinutes,
  calculateGoalProgress,
  formatSteps,
  formatDistance,
} from '../src/utils/calculations';

describe('Biometric & Step Calculations', () => {
  describe('calculateStrideLengthCm', () => {
    it('calculates male stride length correctly (height * 0.415)', () => {
      // 180 * 0.415 = 74.7
      expect(calculateStrideLengthCm(180, 'male')).toBe(74.7);
    });

    it('calculates female stride length correctly (height * 0.413)', () => {
      // 165 * 0.413 = 68.145 => 68.1
      expect(calculateStrideLengthCm(165, 'female')).toBe(68.1);
    });

    it('returns default fallback when height is 0 or negative', () => {
      expect(calculateStrideLengthCm(0)).toBe(70);
      expect(calculateStrideLengthCm(-10)).toBe(70);
    });
  });

  describe('calculateDistanceKm', () => {
    it('calculates distance in km based on steps and height', () => {
      // 10,000 steps * 72.6 cm / 100,000 = 7.26 km
      const distance = calculateDistanceKm(10000, 175, 'male');
      expect(distance).toBe(7.26);
    });

    it('returns 0 km when steps is 0 or negative', () => {
      expect(calculateDistanceKm(0)).toBe(0);
      expect(calculateDistanceKm(-500)).toBe(0);
    });
  });

  describe('Unit Conversions', () => {
    it('converts km to miles', () => {
      // 10 km * 0.621371 = 6.21 mi
      expect(kmToMiles(10)).toBe(6.21);
    });

    it('converts miles to km', () => {
      // 5 mi * 1.60934 = 8.05 km
      expect(milesToKm(5)).toBe(8.05);
    });

    it('converts kg to lbs', () => {
      // 70 kg * 2.20462 = 154.3 lbs
      expect(kgToLbs(70)).toBe(154.3);
    });

    it('converts lbs to kg', () => {
      // 154.3 lbs / 2.20462 = 70.0 kg
      expect(lbsToKg(154.3)).toBe(70);
    });
  });

  describe('calculateCaloriesBurned', () => {
    it('calculates calories adjusted for 70kg user (0.04 kcal/step)', () => {
      // 10,000 * 0.04 * (70 / 70) = 400 kcal
      expect(calculateCaloriesBurned(10000, 70)).toBe(400);
    });

    it('scales calories proportionally for a heavier person (85kg)', () => {
      // 10,000 * 0.04 * (85 / 70) = ~486 kcal
      expect(calculateCaloriesBurned(10000, 85)).toBe(486);
    });

    it('returns 0 calories when steps is 0', () => {
      expect(calculateCaloriesBurned(0, 70)).toBe(0);
    });
  });

  describe('calculateActiveMinutes', () => {
    it('calculates active walking minutes at ~100 steps per minute', () => {
      expect(calculateActiveMinutes(5000)).toBe(50);
      expect(calculateActiveMinutes(10000)).toBe(100);
      expect(calculateActiveMinutes(0)).toBe(0);
    });
  });

  describe('calculateGoalProgress', () => {
    it('calculates percentage toward daily target', () => {
      expect(calculateGoalProgress(5000, 10000)).toBe(50);
      expect(calculateGoalProgress(10000, 10000)).toBe(100);
      expect(calculateGoalProgress(12500, 10000)).toBe(125);
    });

    it('handles zero goal safely without dividing by zero', () => {
      expect(calculateGoalProgress(5000, 0)).toBe(0);
    });
  });

  describe('Formatters', () => {
    it('formats step count with commas', () => {
      expect(formatSteps(10245)).toBe('10,245');
      expect(formatSteps(0)).toBe('0');
    });

    it('formats distance with appropriate unit', () => {
      expect(formatDistance(7.26, 'metric')).toBe('7.26 km');
      expect(formatDistance(7.26, 'imperial')).toBe('4.51 mi');
    });
  });
});
