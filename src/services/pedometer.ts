import { Pedometer } from 'expo-sensors';
import { Platform } from 'react-native';

export interface PedometerStatus {
  isAvailable: boolean;
  hasPermission: boolean;
  isSimulated: boolean;
  errorMessage?: string;
}

export type StepCountCallback = (stepDelta: number) => void;

class PedometerService {
  private subscription: Pedometer.Subscription | null = null;
  private lastSessionSteps = 0;
  private isListening = false;

  /**
   * Checks if pedometer sensor is available and requests permissions.
   */
  async checkPermissionsAndAvailability(): Promise<PedometerStatus> {
    if (Platform.OS === 'web') {
      return {
        isAvailable: false,
        hasPermission: false,
        isSimulated: true,
        errorMessage: 'Sensors are not available in web browsers.',
      };
    }

    try {
      const isAvailable = await Pedometer.isAvailableAsync();
      if (!isAvailable) {
        return {
          isAvailable: false,
          hasPermission: false,
          isSimulated: true,
          errorMessage: 'Step counting sensor is not present on this device/simulator.',
        };
      }

      const permissionResponse = await Pedometer.requestPermissionsAsync();
      const hasPermission = permissionResponse.granted;

      return {
        isAvailable: true,
        hasPermission,
        isSimulated: !hasPermission,
        errorMessage: hasPermission ? undefined : 'Motion sensor permission was denied.',
      };
    } catch (error) {
      return {
        isAvailable: false,
        hasPermission: false,
        isSimulated: true,
        errorMessage: error instanceof Error ? error.message : 'Sensor initialization failed',
      };
    }
  }

  /**
   * Fetches historical steps between two dates from hardware sensor (iOS HealthKit / Android Sensor).
   */
  async getStepCountBetween(start: Date, end: Date): Promise<number> {
    if (Platform.OS !== 'ios') return 0;

    try {
      const isAvailable = await Pedometer.isAvailableAsync();
      if (!isAvailable) return 0;

      const result = await Pedometer.getStepCountAsync(start, end);
      return result ? result.steps : 0;
    } catch {
      return 0;
    }
  }

  /**
   * Fetches step count recorded today from midnight till now.
   */
  async getTodayStepsFromSensor(): Promise<number> {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const now = new Date();

    return this.getStepCountBetween(startOfDay, now);
  }

  /**
   * Starts live subscription for active steps.
   */
  startLiveStepTracking(onStepsChanged: StepCountCallback): void {
    if (this.isListening) return;

    this.lastSessionSteps = 0;

    try {
      this.subscription = Pedometer.watchStepCount((result) => {
        const currentSteps = result.steps;
        const delta = currentSteps - this.lastSessionSteps;
        if (delta > 0) {
          this.lastSessionSteps = currentSteps;
          onStepsChanged(delta);
        }
      });
      this.isListening = true;
    } catch (error) {
      console.warn('Failed to start Pedometer live subscription:', error);
    }
  }

  /**
   * Stops live step tracking.
   */
  stopLiveStepTracking(): void {
    if (this.subscription) {
      this.subscription.remove();
      this.subscription = null;
    }
    this.isListening = false;
    this.lastSessionSteps = 0;
  }
}

export const pedometerService = new PedometerService();
