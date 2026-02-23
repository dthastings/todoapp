import { describe, expect, it } from 'vitest';
import {
  computeBakeWindow,
  computeRipeDurationMs,
  computeStarterBuild,
  computeStarterReady
} from '../lib/calculations';

describe('computeRipeDurationMs', () => {
  it('uses 6 hours at 21C baseline', () => {
    expect(computeRipeDurationMs(21)).toBe(6 * 60 * 60 * 1000);
  });

  it('slows down at colder temperatures', () => {
    expect(computeRipeDurationMs(18)).toBe(7 * 60 * 60 * 1000);
  });

  it('speeds up at warmer temperatures', () => {
    expect(computeRipeDurationMs(24)).toBe(5 * 60 * 60 * 1000);
  });

  it('respects lower clamp', () => {
    expect(computeRipeDurationMs(40)).toBe(3.5 * 60 * 60 * 1000);
  });

  it('respects upper clamp', () => {
    expect(computeRipeDurationMs(-10)).toBe(12 * 60 * 60 * 1000);
  });
});

describe('computeStarterReady', () => {
  it('adds ripe duration to feed time', () => {
    const feed = new Date('2026-02-23T10:00:00');
    const ready = computeStarterReady(feed, 21);
    expect(ready.getTime()).toBe(feed.getTime() + 6 * 60 * 60 * 1000);
  });
});

describe('computeBakeWindow', () => {
  it('returns +8h for no cold proof', () => {
    const start = new Date('2026-02-23T09:00:00');
    const result = computeBakeWindow(start, 'none');
    expect(result.readyStart.getTime()).toBe(start.getTime() + 8 * 60 * 60 * 1000);
    expect(result.readyEnd).toBeUndefined();
  });

  it('returns +12h to +18h for cold proof', () => {
    const start = new Date('2026-02-23T09:00:00');
    const result = computeBakeWindow(start, 'cold');
    expect(result.readyStart.getTime()).toBe(start.getTime() + 12 * 60 * 60 * 1000);
    expect(result.readyEnd?.getTime()).toBe(start.getTime() + 18 * 60 * 60 * 1000);
  });
});

describe('computeStarterBuild', () => {
  it('adds a 50g reserve and applies 1:2:2 build ratio', () => {
    const result = computeStarterBuild(8);
    expect(result.totalTargetG).toBe(58);
    expect(result.inactiveStarterG).toBe(11.6);
    expect(result.flourG).toBe(23.2);
    expect(result.waterG).toBe(23.2);
  });

  it('clamps negative desired starter to 0', () => {
    const result = computeStarterBuild(-4);
    expect(result.desiredStarterG).toBe(0);
    expect(result.totalTargetG).toBe(50);
  });
});
