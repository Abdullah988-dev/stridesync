/**
 * StepCounterEngine
 * 
 * Pure mathematical sensor engine implementing the idempotent hardware step counting formula:
 * todaySteps = (currentSensorValue - dayBaseline) + stepsBeforeReboot
 * 
 * Handles:
 * 1. Normal increments
 * 2. Duplicate / same sensor values (no-op)
 * 3. Out-of-order sensor readings
 * 4. Device reboots (sensor resets to 0 / low value)
 * 5. Midnight rollover (new day resets baseline)
 * 6. Big jump clamping (> 5 steps per second)
 */

export interface StepEngineState {
  dayBaseline: number;
  lastSensorValue: number;
  lastSavedDate: string;
  stepsBeforeReboot: number;
  todaySteps: number;
  lastUpdateTime: number; // timestamp ms
  rebootDetected: boolean;
  listenerCount: number;
}

export interface StepEngineEventLog {
  timestamp: number;
  rawSensorValue: number;
  computedSteps: number;
  delta: number;
  type: 'NORMAL' | 'DUPLICATE' | 'REBOOT' | 'MIDNIGHT_ROLLOVER' | 'CLAMPED' | 'OUT_OF_ORDER';
}

export const MAX_STEPS_PER_SECOND = 5.0; // Clamps unrealistic jumps (> 5 steps/sec)

export class StepCounterEngine {
  private state: StepEngineState;
  private recentEvents: StepEngineEventLog[] = [];
  private static readonly MAX_EVENT_LOGS = 50;

  constructor(initialState?: Partial<StepEngineState>) {
    const today = new Date().toISOString().slice(0, 10);
    this.state = {
      dayBaseline: 0,
      lastSensorValue: 0,
      lastSavedDate: today,
      stepsBeforeReboot: 0,
      todaySteps: 0,
      lastUpdateTime: Date.now(),
      rebootDetected: false,
      listenerCount: 1,
      ...initialState,
    };
  }

  public getState(): StepEngineState {
    return { ...this.state };
  }

  public getRecentEvents(): StepEngineEventLog[] {
    return [...this.recentEvents];
  }

  /**
   * Processes a raw cumulative sensor reading from Sensor.TYPE_STEP_COUNTER.
   * Returns the updated todaySteps count and event log type.
   */
  public processSensorReading(
    rawSensorValue: number,
    currentDateStr: string = new Date().toISOString().slice(0, 10),
    currentTimeMs: number = Date.now()
  ): { todaySteps: number; eventType: StepEngineEventLog['type'] } {
    let eventType: StepEngineEventLog['type'] = 'NORMAL';
    const oldTodaySteps = this.state.todaySteps;

    // 1. Initial State / First reading ever
    if (this.state.lastSensorValue === 0 && this.state.dayBaseline === 0) {
      this.state.dayBaseline = rawSensorValue;
      this.state.lastSensorValue = rawSensorValue;
      this.state.lastSavedDate = currentDateStr;
      this.state.todaySteps = 0;
      this.state.lastUpdateTime = currentTimeMs;

      this.logEvent(currentTimeMs, rawSensorValue, 0, 0, 'NORMAL');
      return { todaySteps: 0, eventType: 'NORMAL' };
    }

    // 2. Midnight Rollover (Date changed)
    if (currentDateStr !== this.state.lastSavedDate) {
      this.state.dayBaseline = rawSensorValue;
      this.state.stepsBeforeReboot = 0;
      this.state.todaySteps = 0;
      this.state.lastSavedDate = currentDateStr;
      this.state.lastSensorValue = rawSensorValue;
      this.state.lastUpdateTime = currentTimeMs;
      this.state.rebootDetected = false;

      this.logEvent(currentTimeMs, rawSensorValue, 0, 0, 'MIDNIGHT_ROLLOVER');
      return { todaySteps: 0, eventType: 'MIDNIGHT_ROLLOVER' };
    }

    // 3. Same value received twice (Duplicate event)
    if (rawSensorValue === this.state.lastSensorValue) {
      this.logEvent(currentTimeMs, rawSensorValue, this.state.todaySteps, 0, 'DUPLICATE');
      return { todaySteps: this.state.todaySteps, eventType: 'DUPLICATE' };
    }

    // 4. Reboot Detection (Sensor reset to 0 or count since boot is lower than last recorded)
    if (rawSensorValue < this.state.lastSensorValue) {
      // If the difference is small (e.g. 1 or 2 steps jitter) and not a fresh boot, handle out-of-order
      if (this.state.lastSensorValue - rawSensorValue <= 2 && rawSensorValue > 0) {
        this.logEvent(currentTimeMs, rawSensorValue, this.state.todaySteps, 0, 'OUT_OF_ORDER');
        return { todaySteps: this.state.todaySteps, eventType: 'OUT_OF_ORDER' };
      }

      // Phone rebooted! Hardware step counter reset.
      // Carry forward steps counted today prior to reboot
      const stepsCountedBeforeReboot = Math.max(0, this.state.lastSensorValue - this.state.dayBaseline);
      this.state.stepsBeforeReboot += stepsCountedBeforeReboot;
      this.state.dayBaseline = rawSensorValue;
      this.state.lastSensorValue = rawSensorValue;
      this.state.rebootDetected = true;
      this.state.lastUpdateTime = currentTimeMs;

      const computed = this.state.stepsBeforeReboot + (rawSensorValue - this.state.dayBaseline);
      this.state.todaySteps = computed;

      this.logEvent(currentTimeMs, rawSensorValue, computed, computed - oldTodaySteps, 'REBOOT');
      return { todaySteps: computed, eventType: 'REBOOT' };
    }

    // 5. Normal Increment with Jump-Clamp
    const rawDelta = rawSensorValue - this.state.lastSensorValue;
    const elapsedSeconds = Math.max(0.1, (currentTimeMs - this.state.lastUpdateTime) / 1000);
    const maxAllowedDelta = Math.ceil(elapsedSeconds * MAX_STEPS_PER_SECOND);

    let effectiveDelta = rawDelta;
    if (rawDelta > maxAllowedDelta && elapsedSeconds < 60) {
      // Unrealistic jump detected! (e.g. > 5 steps/sec during a short interval)
      effectiveDelta = maxAllowedDelta;
      eventType = 'CLAMPED';
      // Shift baseline forward to absorb the rejected anomaly
      this.state.dayBaseline += (rawDelta - effectiveDelta);
    }

    const computed = Math.max(
      oldTodaySteps,
      (rawSensorValue - this.state.dayBaseline) + this.state.stepsBeforeReboot
    );

    this.state.todaySteps = computed;
    this.state.lastSensorValue = rawSensorValue;
    this.state.lastUpdateTime = currentTimeMs;

    this.logEvent(currentTimeMs, rawSensorValue, computed, effectiveDelta, eventType);
    return { todaySteps: computed, eventType };
  }

  private logEvent(
    timestamp: number,
    rawSensorValue: number,
    computedSteps: number,
    delta: number,
    type: StepEngineEventLog['type']
  ): void {
    this.recentEvents.unshift({
      timestamp,
      rawSensorValue,
      computedSteps,
      delta,
      type,
    });

    if (this.recentEvents.length > StepCounterEngine.MAX_EVENT_LOGS) {
      this.recentEvents.pop();
    }
  }
}
