/**
 * Biometric and Step Calculation Utilities
 *
 * Formulas:
 * - Stride length: heightCm * 0.415 (male) / heightCm * 0.413 (female)
 * - Distance: steps * strideLength (converted to km or miles)
 * - Calories: steps * 0.04 * (weightKg / 70) (MET-adjusted)
 * - Active minutes: steps / 100 (standard recommendation: 100 steps per min brisk walk)
 */

export type Gender = 'male' | 'female' | 'other';
export type UnitSystem = 'metric' | 'imperial';

/**
 * Calculates estimated stride length in centimeters based on height and gender.
 */
export function calculateStrideLengthCm(heightCm: number, gender: Gender = 'male'): number {
  if (heightCm <= 0) return 70; // safe fallback (70cm)
  const factor = gender === 'female' ? 0.413 : 0.415;
  return Math.round(heightCm * factor * 10) / 10;
}

/**
 * Calculates distance in kilometers.
 */
export function calculateDistanceKm(
  steps: number,
  heightCm: number = 175,
  gender: Gender = 'male'
): number {
  if (steps <= 0) return 0;
  const strideCm = calculateStrideLengthCm(heightCm, gender);
  const distanceKm = (steps * strideCm) / 100000;
  return Math.round(distanceKm * 100) / 100; // 2 decimal places
}

/**
 * Converts kilometers to miles.
 */
export function kmToMiles(km: number): number {
  return Math.round(km * 0.621371 * 100) / 100;
}

/**
 * Converts miles to kilometers.
 */
export function milesToKm(miles: number): number {
  return Math.round(miles * 1.60934 * 100) / 100;
}

/**
 * Converts kg to lbs.
 */
export function kgToLbs(kg: number): number {
  return Math.round(kg * 2.20462 * 10) / 10;
}

/**
 * Converts lbs to kg.
 */
export function lbsToKg(lbs: number): number {
  return Math.round((lbs / 2.20462) * 10) / 10;
}

/**
 * Calculates calories burned based on step count and user body weight.
 * Base: ~0.04 kcal per step for a 70kg person.
 */
export function calculateCaloriesBurned(steps: number, weightKg: number = 70): number {
  if (steps <= 0) return 0;
  const normalizedWeight = weightKg > 0 ? weightKg : 70;
  const calories = steps * 0.04 * (normalizedWeight / 70);
  return Math.round(calories);
}

/**
 * Calculates active walking minutes (~100 steps per active brisk minute).
 */
export function calculateActiveMinutes(steps: number): number {
  if (steps <= 0) return 0;
  return Math.round(steps / 100);
}

/**
 * Calculates percentage toward daily goal, capped at 100% or unbounded.
 */
export function calculateGoalProgress(steps: number, dailyGoal: number): number {
  if (dailyGoal <= 0) return 0;
  const pct = (steps / dailyGoal) * 100;
  return Math.round(pct * 10) / 10;
}

/**
 * Formats a step count with thousands commas (e.g., "10,245").
 */
export function formatSteps(steps: number): string {
  if (isNaN(steps) || steps < 0) return '0';
  return steps.toLocaleString();
}

/**
 * Formats distance with unit based on current unit system.
 */
export function formatDistance(distanceKm: number, unitSystem: UnitSystem = 'metric'): string {
  if (unitSystem === 'imperial') {
    const miles = kmToMiles(distanceKm);
    return `${miles.toFixed(2)} mi`;
  }
  return `${distanceKm.toFixed(2)} km`;
}

/**
 * Formats active time in hours and minutes.
 */
export function formatActiveTime(minutes: number): string {
  if (minutes < 60) {
    return `${minutes} min`;
  }
  const hours = Math.floor(minutes / 60);
  const remainingMins = minutes % 60;
  return `${hours}h ${remainingMins}m`;
}
