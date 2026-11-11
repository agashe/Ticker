import { describe, it, expect } from 'vitest';
import {
  isCoordinateVisible,
  validateAndNormalizeConfig,
  calculateDraggedPosition,
  DEFAULT_CONFIG,
  MIN_CLOCK_SIZE,
  MAX_CLOCK_SIZE,
  DisplayLike
} from '../src/main/window-math';

describe('Window Math - isCoordinateVisible', () => {
  const singleDisplay: DisplayLike[] = [
    { bounds: { x: 0, y: 0, width: 1920, height: 1080 } }
  ];

  it('returns true when coordinates are comfortably within screen bounds', () => {
    expect(isCoordinateVisible({ x: 500, y: 300 }, singleDisplay)).toBe(true);
    expect(isCoordinateVisible({ x: 0, y: 0 }, singleDisplay)).toBe(true);
  });

  it('allows positioning within margin boundaries (-50px margin by default)', () => {
    expect(isCoordinateVisible({ x: -40, y: -40 }, singleDisplay)).toBe(true);
    expect(isCoordinateVisible({ x: 1920 - 50, y: 1080 - 50 }, singleDisplay)).toBe(true);

    expect(isCoordinateVisible({ x: -60, y: 100 }, singleDisplay)).toBe(false);
    expect(isCoordinateVisible({ x: 100, y: -60 }, singleDisplay)).toBe(false);
    expect(isCoordinateVisible({ x: 2000, y: 500 }, singleDisplay)).toBe(false);
  });

  it('handles multi-monitor configurations correctly', () => {
    const dualDisplays: DisplayLike[] = [
      { bounds: { x: 0, y: 0, width: 1920, height: 1080 } },
      { bounds: { x: 1920, y: 0, width: 2560, height: 1440 } }
    ];

    expect(isCoordinateVisible({ x: 100, y: 100 }, dualDisplays)).toBe(true);
    expect(isCoordinateVisible({ x: 2500, y: 800 }, dualDisplays)).toBe(true);
    expect(isCoordinateVisible({ x: 5000, y: 500 }, dualDisplays)).toBe(false);
  });

  it('returns false when coordinates or displays are missing / invalid', () => {
    expect(isCoordinateVisible({}, singleDisplay)).toBe(false);
    expect(isCoordinateVisible({ x: 100 }, singleDisplay)).toBe(false);
    expect(isCoordinateVisible({ y: 100 }, singleDisplay)).toBe(false);
    expect(isCoordinateVisible({ x: 100, y: 100 }, [])).toBe(false);
  });
});

describe('Window Math - validateAndNormalizeConfig', () => {
  const displays: DisplayLike[] = [
    { bounds: { x: 0, y: 0, width: 1920, height: 1080 } }
  ];

  it('falls back to DEFAULT_CONFIG when given null, undefined, or non-object', () => {
    expect(validateAndNormalizeConfig(null)).toEqual(DEFAULT_CONFIG);
    expect(validateAndNormalizeConfig(undefined)).toEqual(DEFAULT_CONFIG);
    expect(validateAndNormalizeConfig('string')).toEqual(DEFAULT_CONFIG);
    expect(validateAndNormalizeConfig(123)).toEqual(DEFAULT_CONFIG);
  });

  it('preserves valid core configuration values', () => {
    const valid = { x: 200, y: 300, alwaysOnTop: false, theme: 'dark' as const };
    const normalized = validateAndNormalizeConfig(valid, displays);
    expect(normalized.x).toBe(200);
    expect(normalized.y).toBe(300);
    expect(normalized.alwaysOnTop).toBe(false);
    expect(normalized.theme).toBe('dark');
  });

  it('sanitizes invalid theme and alwaysOnTop fields', () => {
    const invalidProps = { alwaysOnTop: 'yes', theme: 'blue' };
    const normalized = validateAndNormalizeConfig(invalidProps);
    expect(normalized.alwaysOnTop).toBe(DEFAULT_CONFIG.alwaysOnTop);
    expect(normalized.theme).toBe(DEFAULT_CONFIG.theme);
  });

  it('strips coordinates when they fall outside visible display areas', () => {
    const offscreen = { x: -9999, y: -9999, alwaysOnTop: true, theme: 'light' as const };
    const normalized = validateAndNormalizeConfig(offscreen, displays);
    expect(normalized.x).toBeUndefined();
    expect(normalized.y).toBeUndefined();
    expect(normalized.theme).toBe('light');
    expect(normalized.alwaysOnTop).toBe(true);
  });

  it('retains numeric coordinates if no displays list is provided for validation', () => {
    const configWithCoords = { x: 150, y: 250, alwaysOnTop: true, theme: 'light' as const };
    const normalized = validateAndNormalizeConfig(configWithCoords);
    expect(normalized.x).toBe(150);
    expect(normalized.y).toBe(250);
  });

  // --- New field validation ---

  it('accepts valid useSystemTime and lockedPosition booleans', () => {
    const cfg = { alwaysOnTop: true, theme: 'light' as const, useSystemTime: false, lockedPosition: true };
    const normalized = validateAndNormalizeConfig(cfg);
    expect(normalized.useSystemTime).toBe(false);
    expect(normalized.lockedPosition).toBe(true);
  });

  it('defaults useSystemTime to true and lockedPosition to false when absent', () => {
    const normalized = validateAndNormalizeConfig({ alwaysOnTop: true, theme: 'light' as const });
    expect(normalized.useSystemTime).toBe(true);
    expect(normalized.lockedPosition).toBe(false);
  });

  it('accepts width and height at the MIN_CLOCK_SIZE boundary', () => {
    const cfg = { alwaysOnTop: true, theme: 'light' as const, width: MIN_CLOCK_SIZE, height: MIN_CLOCK_SIZE };
    const normalized = validateAndNormalizeConfig(cfg);
    expect(normalized.width).toBe(MIN_CLOCK_SIZE);
    expect(normalized.height).toBe(MIN_CLOCK_SIZE);
  });

  it('accepts width and height at the MAX_CLOCK_SIZE boundary', () => {
    const cfg = { alwaysOnTop: true, theme: 'light' as const, width: MAX_CLOCK_SIZE, height: MAX_CLOCK_SIZE };
    const normalized = validateAndNormalizeConfig(cfg);
    expect(normalized.width).toBe(MAX_CLOCK_SIZE);
    expect(normalized.height).toBe(MAX_CLOCK_SIZE);
  });

  it('falls back to default width/height when values are out of [MIN, MAX] range', () => {
    const tooSmall = { alwaysOnTop: true, theme: 'light' as const, width: MIN_CLOCK_SIZE - 1, height: 50 };
    const normalizedSmall = validateAndNormalizeConfig(tooSmall);
    expect(normalizedSmall.width).toBe(DEFAULT_CONFIG.width);
    expect(normalizedSmall.height).toBe(DEFAULT_CONFIG.height);

    const tooBig = { alwaysOnTop: true, theme: 'light' as const, width: MAX_CLOCK_SIZE + 1, height: 900 };
    const normalizedBig = validateAndNormalizeConfig(tooBig);
    expect(normalizedBig.width).toBe(DEFAULT_CONFIG.width);
    expect(normalizedBig.height).toBe(DEFAULT_CONFIG.height);
  });

  it('preserves manualTime and timezoneOffsetMinutes when provided', () => {
    const ms = Date.now();
    const cfg = { alwaysOnTop: true, theme: 'light' as const, manualTime: ms, timezoneOffsetMinutes: 240 };
    const normalized = validateAndNormalizeConfig(cfg);
    expect(normalized.manualTime).toBe(ms);
    expect(normalized.timezoneOffsetMinutes).toBe(240);
  });

  it('leaves manualTime and timezoneOffsetMinutes undefined when absent', () => {
    const normalized = validateAndNormalizeConfig({ alwaysOnTop: true, theme: 'light' as const });
    expect(normalized.manualTime).toBeUndefined();
    expect(normalized.timezoneOffsetMinutes).toBeUndefined();
  });

  it('accepts frameless boolean and falls back to default when invalid', () => {
    const withFrameless = { alwaysOnTop: true, theme: 'light' as const, frameless: false };
    expect(validateAndNormalizeConfig(withFrameless).frameless).toBe(false);

    const withoutFrameless = { alwaysOnTop: true, theme: 'light' as const };
    expect(validateAndNormalizeConfig(withoutFrameless).frameless).toBe(DEFAULT_CONFIG.frameless);
  });
});

describe('Window Math - MIN_CLOCK_SIZE / MAX_CLOCK_SIZE constants', () => {
  it('MIN_CLOCK_SIZE is 80', () => {
    expect(MIN_CLOCK_SIZE).toBe(80);
  });

  it('MAX_CLOCK_SIZE is 800', () => {
    expect(MAX_CLOCK_SIZE).toBe(800);
  });
});

describe('Window Math - calculateDraggedPosition', () => {
  it('calculates the exact delta window displacement', () => {
    const newPos = calculateDraggedPosition(
      { x: 100, y: 200 },
      { screenX: 150, screenY: 250 },
      { screenX: 200, screenY: 280 }
    );
    expect(newPos).toEqual({ x: 150, y: 230 });
  });

  it('handles negative drag delta (moving up and left)', () => {
    const newPos = calculateDraggedPosition(
      { x: 300, y: 400 },
      { screenX: 350, screenY: 450 },
      { screenX: 300, screenY: 350 }
    );
    expect(newPos).toEqual({ x: 250, y: 300 });
  });

  it('rounds positions to whole integer pixels', () => {
    const newPos = calculateDraggedPosition(
      { x: 100, y: 100 },
      { screenX: 50.2, screenY: 50.4 },
      { screenX: 70.8, screenY: 80.9 }
    );
    expect(Number.isInteger(newPos.x)).toBe(true);
    expect(Number.isInteger(newPos.y)).toBe(true);
  });
});
