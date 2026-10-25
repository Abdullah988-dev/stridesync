import { NativeModules, NativeEventEmitter, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StepCounterEngine, StepEngineState } from './stepCounterEngine';

const { StepCounterModule } = NativeModules;
const stepEventEmitter = StepCounterModule ? new NativeEventEmitter(StepCounterModule) : null;

const STORAGE_KEY_STATE = '@stridesync_native_engine_state';

class NativeStepService {
  private engine: StepCounterEngine;
  private isNativeAvailable: boolean = Boolean(StepCounterModule);
  private listenerCount: number = 0;
  private initialized: boolean = false;
  private subscribers: Set<(data: { todaySteps: number; rawSensor: number; baseline: number }) => void> = new Set();
  private nativeSubscription: any = null;

  constructor() {
    this.engine = new StepCounterEngine();
  }

  /**
   * Initializes the native step counter service.
   * On real Android devices with custom build, starts the Foreground Service.
   * On Web / Simulator / Expo Go, initializes the local StepCounterEngine.
   */
  async initService(dailyGoal: number = 10000): Promise<boolean> {
    if (this.initialized) return true;

    if (Platform.OS === 'android' && StepCounterModule) {
      try {
        await StepCounterModule.startService(dailyGoal);
        this.isNativeAvailable = true;

        if (!this.nativeSubscription && stepEventEmitter) {
          this.nativeSubscription = stepEventEmitter.addListener('onStepCountUpdated', (event: any) => {
            this.notifySubscribers({
              todaySteps: Math.round(event.todaySteps),
              rawSensor: Math.round(event.rawSensor),
              baseline: Math.round(event.baseline),
            });
          });
        }

        this.initialized = true;
        return true;
      } catch (e) {
        console.warn('Native StepCounterModule failed to start, falling back to engine:', e);
        this.isNativeAvailable = false;
      }
    }

    // Fallback: load state from AsyncStorage
    try {
      const savedStateJson = await AsyncStorage.getItem(STORAGE_KEY_STATE);
      if (savedStateJson) {
        const savedState: Partial<StepEngineState> = JSON.parse(savedStateJson);
        this.engine = new StepCounterEngine(savedState);
      }
    } catch {}

    this.initialized = true;
    return true;
  }

  /**
   * Reads the current sensor value and computes today's steps (idempotent catch-up).
   */
  async getTodaySteps(): Promise<{
    todaySteps: number;
    rawSensor: number;
    baseline: number;
    lastSavedDate: string;
    isServiceRunning: boolean;
    rebootDetected: boolean;
    listenerCount: number;
  }> {
    if (Platform.OS === 'android' && StepCounterModule && this.isNativeAvailable) {
      try {
        const result = await StepCounterModule.getTodaySteps();
        return {
          todaySteps: Math.round(result.todaySteps),
          rawSensor: Math.round(result.rawSensor),
          baseline: Math.round(result.baseline),
          lastSavedDate: result.lastSavedDate,
          isServiceRunning: Boolean(result.isServiceRunning),
          rebootDetected: Boolean(result.rebootDetected),
          listenerCount: 1, // Single listener singleton
        };
      } catch (e) {
        console.warn('Error fetching native today steps:', e);
      }
    }

    const state = this.engine.getState();
    return {
      todaySteps: state.todaySteps,
      rawSensor: state.lastSensorValue,
      baseline: state.dayBaseline,
      lastSavedDate: state.lastSavedDate,
      isServiceRunning: false,
      rebootDetected: state.rebootDetected,
      listenerCount: 1,
    };
  }

  /**
   * Returns comprehensive debug telemetry for the 5-tap Hidden Debug Screen in Settings.
   */
  async getDebugInfo(): Promise<{
    rawSensor: number;
    baseline: number;
    todaySteps: number;
    lastUpdateTime: number;
    isServiceRunning: boolean;
    rebootDetected: boolean;
    listenerCount: number;
    recentEvents: any[];
  }> {
    if (Platform.OS === 'android' && StepCounterModule && this.isNativeAvailable) {
      try {
        const nativeDebug = await StepCounterModule.getDebugInfo();
        return {
          rawSensor: Math.round(nativeDebug.rawSensor),
          baseline: Math.round(nativeDebug.baseline),
          todaySteps: Math.round(nativeDebug.todaySteps),
          lastUpdateTime: nativeDebug.lastUpdateTime,
          isServiceRunning: Boolean(nativeDebug.isServiceRunning),
          rebootDetected: Boolean(nativeDebug.rebootDetected),
          listenerCount: 1, // Strictly 1 listener owned by singleton service
          recentEvents: this.engine.getRecentEvents(),
        };
      } catch (e) {
        console.warn('Error fetching native debug info:', e);
      }
    }

    const state = this.engine.getState();
    return {
      rawSensor: state.lastSensorValue,
      baseline: state.dayBaseline,
      todaySteps: state.todaySteps,
      lastUpdateTime: state.lastUpdateTime,
      isServiceRunning: false,
      rebootDetected: state.rebootDetected,
      listenerCount: 1,
      recentEvents: this.engine.getRecentEvents(),
    };
  }

  /**
   * Processes a sensor reading in simulated/engine mode and persists.
   */
  async processSimulatedReading(rawSensorValue: number): Promise<number> {
    const res = this.engine.processSensorReading(rawSensorValue);
    try {
      await AsyncStorage.setItem(STORAGE_KEY_STATE, JSON.stringify(this.engine.getState()));
    } catch {}

    this.notifySubscribers({
      todaySteps: res.todaySteps,
      rawSensor: rawSensorValue,
      baseline: this.engine.getState().dayBaseline,
    });

    return res.todaySteps;
  }

  /**
   * Subscribes to step updates with single-listener enforcement.
   */
  subscribe(callback: (data: { todaySteps: number; rawSensor: number; baseline: number }) => void): () => void {
    this.subscribers.add(callback);
    this.listenerCount = 1; // Always strictly 1 singleton listener

    return () => {
      this.subscribers.delete(callback);
      if (this.subscribers.size === 0) {
        this.listenerCount = 0;
      }
    };
  }

  private notifySubscribers(data: { todaySteps: number; rawSensor: number; baseline: number }): void {
    this.subscribers.forEach((cb) => {
      try {
        cb(data);
      } catch (err) {
        console.error('Step subscriber callback error:', err);
      }
    });
  }

  async stopService(): Promise<void> {
    if (this.nativeSubscription) {
      this.nativeSubscription.remove();
      this.nativeSubscription = null;
    }
    if (Platform.OS === 'android' && StepCounterModule && this.isNativeAvailable) {
      try {
        await StepCounterModule.stopService();
      } catch {}
    }
  }
}

export const nativeStepService = new NativeStepService();
