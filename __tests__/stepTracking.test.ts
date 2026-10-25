import { describe, it, expect, beforeEach } from '@jest/globals';
import { StepCounterEngine } from '../src/services/stepCounterEngine';

describe('StepCounterEngine - Hardware Sensor & Formula Verification', () => {
  let engine: StepCounterEngine;

  beforeEach(() => {
    engine = new StepCounterEngine();
  });

  it('1. Normal Increment: accurately computes todaySteps from hardware sensor', () => {
    const day = '2026-10-25';
    let time = 1000000;

    // First reading initializes baseline
    const r1 = engine.processSensorReading(5000, day, time);
    expect(r1.todaySteps).toBe(0);
    expect(engine.getState().dayBaseline).toBe(5000);

    // User walks 50 steps
    time += 20000; // 20 seconds later
    const r2 = engine.processSensorReading(5050, day, time);
    expect(r2.todaySteps).toBe(50);
    expect(r2.eventType).toBe('NORMAL');

    // User walks another 50 steps
    time += 20000;
    const r3 = engine.processSensorReading(5100, day, time);
    expect(r3.todaySteps).toBe(100);
  });

  it('2. Same value twice: handles duplicate events idempotently without double-counting', () => {
    const day = '2026-10-25';
    let time = 1000000;

    engine.processSensorReading(1000, day, time);
    time += 10000;
    engine.processSensorReading(1030, day, time);
    expect(engine.getState().todaySteps).toBe(30);

    // Duplicate event arrives with same sensor reading
    time += 2000;
    const dupResult = engine.processSensorReading(1030, day, time);
    expect(dupResult.todaySteps).toBe(30);
    expect(dupResult.eventType).toBe('DUPLICATE');
    expect(engine.getState().todaySteps).toBe(30);
  });

  it('3. Device Reboot: sensor resets to 0/low value; preserves steps counted prior to reboot', () => {
    const day = '2026-10-25';
    let time = 1000000;

    // Start with baseline 8000
    engine.processSensorReading(8000, day, time);

    // Walked 400 steps
    time += 120000;
    engine.processSensorReading(8400, day, time);
    expect(engine.getState().todaySteps).toBe(400);

    // Phone reboots! Hardware sensor resets from 8400 down to 15
    time += 300000;
    const rebootResult = engine.processSensorReading(15, day, time);
    expect(rebootResult.eventType).toBe('REBOOT');
    expect(rebootResult.todaySteps).toBe(400); // 400 steps preserved!
    expect(engine.getState().stepsBeforeReboot).toBe(400);
    expect(engine.getState().rebootDetected).toBe(true);

    // Walking continues post-reboot: sensor goes to 65 (50 steps taken)
    time += 20000;
    const postRebootResult = engine.processSensorReading(65, day, time);
    expect(postRebootResult.todaySteps).toBe(450); // 400 + 50 = 450!
  });

  it('4. Midnight Rollover: resets todaySteps to 0 and establishes new daily baseline', () => {
    let time = 1000000;

    // Day 1: Oct 25
    engine.processSensorReading(10000, '2026-10-25', time);
    time += 60000;
    engine.processSensorReading(12500, '2026-10-25', time);
    expect(engine.getState().todaySteps).toBe(2500);

    // Day 2: Midnight strikes, new day 2026-10-26
    time += 60000;
    const rolloverResult = engine.processSensorReading(12510, '2026-10-26', time);
    expect(rolloverResult.eventType).toBe('MIDNIGHT_ROLLOVER');
    expect(rolloverResult.todaySteps).toBe(0);
    expect(engine.getState().dayBaseline).toBe(12510);
    expect(engine.getState().lastSavedDate).toBe('2026-10-26');

    // Walk on the new day
    time += 30000;
    const newDayWalk = engine.processSensorReading(12550, '2026-10-26', time);
    expect(newDayWalk.todaySteps).toBe(40);
  });

  it('5. Out-of-Order Event: ignores slight negative sensor jitter without corrupting state', () => {
    const day = '2026-10-25';
    let time = 1000000;

    engine.processSensorReading(3000, day, time);
    time += 15000;
    engine.processSensorReading(3050, day, time);
    expect(engine.getState().todaySteps).toBe(50);

    // Slight out-of-order reading (e.g. 3049 due to concurrent thread race)
    time += 500;
    const oooResult = engine.processSensorReading(3049, day, time);
    expect(oooResult.eventType).toBe('OUT_OF_ORDER');
    expect(oooResult.todaySteps).toBe(50);
  });

  it('6. Big Jump Clamping: clamps unrealistic jumps (> 5 steps/sec)', () => {
    const day = '2026-10-25';
    let time = 1000000;

    engine.processSensorReading(1000, day, time);

    // 2 seconds later, an anomalous spike of 500 steps arrives (> 5 steps/sec)
    time += 2000;
    const jumpResult = engine.processSensorReading(1500, day, time);
    expect(jumpResult.eventType).toBe('CLAMPED');
    // For 2 seconds, max allowed is 2 * 5 = 10 steps
    expect(jumpResult.todaySteps).toBeLessThanOrEqual(10);
  });
});
