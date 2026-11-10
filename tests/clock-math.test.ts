import { describe, it, expect } from 'vitest';
import {
  calculateHandAngles,
  getRotationTransform,
  calculateTickGeometry,
  calculateAllTicks
} from '../src/renderer/clock-math';

describe('Clock Math - calculateHandAngles', () => {
  it('calculates exact 0 degree angles for 12:00:00.000 (midnight / noon)', () => {
    // 00:00:00
    const midnight = new Date(2026, 0, 1, 0, 0, 0, 0);
    const midnightAngles = calculateHandAngles(midnight);
    expect(midnightAngles.hour).toBeCloseTo(0, 5);
    expect(midnightAngles.minute).toBeCloseTo(0, 5);
    expect(midnightAngles.second).toBeCloseTo(0, 5);

    // 12:00:00
    const noon = new Date(2026, 0, 1, 12, 0, 0, 0);
    const noonAngles = calculateHandAngles(noon);
    expect(noonAngles.hour).toBeCloseTo(0, 5);
    expect(noonAngles.minute).toBeCloseTo(0, 5);
    expect(noonAngles.second).toBeCloseTo(0, 5);
  });

  it('calculates cardinal hour positions accurately on the hour', () => {
    // 3:00:00 -> 90 degrees
    const three = new Date(2026, 0, 1, 3, 0, 0, 0);
    const threeAngles = calculateHandAngles(three);
    expect(threeAngles.hour).toBeCloseTo(90, 5);
    expect(threeAngles.minute).toBeCloseTo(0, 5);
    expect(threeAngles.second).toBeCloseTo(0, 5);

    // 6:00:00 -> 180 degrees
    const six = new Date(2026, 0, 1, 6, 0, 0, 0);
    const sixAngles = calculateHandAngles(six);
    expect(sixAngles.hour).toBeCloseTo(180, 5);
    expect(sixAngles.minute).toBeCloseTo(0, 5);
    expect(sixAngles.second).toBeCloseTo(0, 5);

    // 9:00:00 -> 270 degrees
    const nine = new Date(2026, 0, 1, 9, 0, 0, 0);
    const nineAngles = calculateHandAngles(nine);
    expect(nineAngles.hour).toBeCloseTo(270, 5);
    expect(nineAngles.minute).toBeCloseTo(0, 5);
    expect(nineAngles.second).toBeCloseTo(0, 5);
  });

  it('calculates smooth fractional hand progression halfway through an hour', () => {
    // At 6:30:00.000:
    // second = 0 deg
    // minute = 30 * 6 = 180 deg
    // hour = (6 + 0.5) * 30 = 195 deg
    const date = new Date(2026, 0, 1, 6, 30, 0, 0);
    const angles = calculateHandAngles(date);
    expect(angles.second).toBeCloseTo(0, 5);
    expect(angles.minute).toBeCloseTo(180, 5);
    expect(angles.hour).toBeCloseTo(195, 5);
  });

  it('smoothly incorporates milliseconds into second and minute hands', () => {
    // At 0:00:15.500:
    // second = (15 + 0.5) * 6 = 93 deg
    const date = new Date(2026, 0, 1, 0, 0, 15, 500);
    const angles = calculateHandAngles(date);
    expect(angles.second).toBeCloseTo(93, 5);
    expect(angles.minute).toBeCloseTo((15.5 / 60) * 6, 5);
  });

  it('handles 23:59:59.999 boundary cleanly without overflow or NaN', () => {
    const endOfDay = new Date(2026, 0, 1, 23, 59, 59, 999);
    const angles = calculateHandAngles(endOfDay);
    expect(angles.hour).toBeGreaterThan(359);
    expect(angles.hour).toBeLessThan(360);
    expect(angles.minute).toBeGreaterThan(359);
    expect(angles.minute).toBeLessThan(360);
    expect(angles.second).toBeGreaterThan(359);
    expect(angles.second).toBeLessThan(360);
    expect(Number.isNaN(angles.hour)).toBe(false);
    expect(Number.isNaN(angles.minute)).toBe(false);
    expect(Number.isNaN(angles.second)).toBe(false);
  });
});

describe('Clock Math - getRotationTransform', () => {
  it('formats SVG rotate attribute with default center pivot (100, 100)', () => {
    expect(getRotationTransform(45)).toBe('rotate(45 100 100)');
    expect(getRotationTransform(0)).toBe('rotate(0 100 100)');
    expect(getRotationTransform(180.5)).toBe('rotate(180.5 100 100)');
  });

  it('formats SVG rotate attribute with custom center coordinates', () => {
    expect(getRotationTransform(90, 50, 75)).toBe('rotate(90 50 75)');
  });
});

describe('Clock Math - calculateTickGeometry', () => {
  it('correctly calculates 12 o clock (index 0) hour tick geometry', () => {
    const tick = calculateTickGeometry(0, { cx: 100, cy: 100, radius: 94 });
    expect(tick.index).toBe(0);
    expect(tick.isHour).toBe(true);
    expect(tick.className).toBe('tick-hour');
    expect(tick.strokeWidth).toBe(2.5);

    // At angle 0 (top of clock): sin(0)=0, cos(0)=1
    // rOuter = 94 - 5 = 89 => x1 = 100, y1 = 100 - 89 = 11
    // rInner = 89 - 9 = 80 => x2 = 100, y2 = 100 - 80 = 20
    expect(tick.x1).toBeCloseTo(100, 2);
    expect(tick.y1).toBeCloseTo(11, 2);
    expect(tick.x2).toBeCloseTo(100, 2);
    expect(tick.y2).toBeCloseTo(20, 2);
  });

  it('correctly calculates 3 o clock (index 15) hour tick geometry', () => {
    const tick = calculateTickGeometry(15, { cx: 100, cy: 100, radius: 94 });
    expect(tick.isHour).toBe(true);
    // At angle 90 deg (right): sin(pi/2)=1, cos(pi/2)=0
    // x1 = 100 + 89 = 189, y1 = 100
    // x2 = 100 + 80 = 180, y2 = 100
    expect(tick.x1).toBeCloseTo(189, 2);
    expect(tick.y1).toBeCloseTo(100, 2);
    expect(tick.x2).toBeCloseTo(180, 2);
    expect(tick.y2).toBeCloseTo(100, 2);
  });

  it('correctly calculates 6 o clock (index 30) hour tick geometry', () => {
    const tick = calculateTickGeometry(30, { cx: 100, cy: 100, radius: 94 });
    expect(tick.isHour).toBe(true);
    // At angle 180 deg (bottom): sin(pi)=0, cos(pi)=-1
    // x1 = 100, y1 = 100 - (-89) = 189
    // x2 = 100, y2 = 100 - (-80) = 180
    expect(tick.x1).toBeCloseTo(100, 2);
    expect(tick.y1).toBeCloseTo(189, 2);
    expect(tick.x2).toBeCloseTo(100, 2);
    expect(tick.y2).toBeCloseTo(180, 2);
  });

  it('correctly calculates 9 o clock (index 45) hour tick geometry', () => {
    const tick = calculateTickGeometry(45, { cx: 100, cy: 100, radius: 94 });
    expect(tick.isHour).toBe(true);
    // At angle 270 deg (left): sin(3pi/2)=-1, cos(3pi/2)=0
    // x1 = 100 - 89 = 11, y1 = 100
    // x2 = 100 - 80 = 20, y2 = 100
    expect(tick.x1).toBeCloseTo(11, 2);
    expect(tick.y1).toBeCloseTo(100, 2);
    expect(tick.x2).toBeCloseTo(20, 2);
    expect(tick.y2).toBeCloseTo(100, 2);
  });

  it('identifies non-hour marks as minute ticks with smaller length and stroke', () => {
    const tick = calculateTickGeometry(1, { cx: 100, cy: 100, radius: 94 });
    expect(tick.index).toBe(1);
    expect(tick.isHour).toBe(false);
    expect(tick.className).toBe('tick-minute');
    expect(tick.strokeWidth).toBe(1);

    // Outer radius is 89, inner radius is 89 - 4.5 = 84.5
    const dx = tick.x1 - tick.x2;
    const dy = tick.y1 - tick.y2;
    const length = Math.sqrt(dx * dx + dy * dy);
    expect(length).toBeCloseTo(4.5, 1);
  });
});

describe('Clock Math - calculateAllTicks', () => {
  it('generates exactly 60 ticks with 12 hour ticks and 48 minute ticks', () => {
    const ticks = calculateAllTicks();
    expect(ticks).toHaveLength(60);

    const hourTicks = ticks.filter((t) => t.isHour);
    const minuteTicks = ticks.filter((t) => !t.isHour);

    expect(hourTicks).toHaveLength(12);
    expect(minuteTicks).toHaveLength(48);

    // Verify hour indices are 0, 5, 10, ..., 55
    hourTicks.forEach((t) => {
      expect(t.index % 5).toBe(0);
      expect(t.className).toBe('tick-hour');
      expect(t.strokeWidth).toBe(2.5);
    });

    minuteTicks.forEach((t) => {
      expect(t.index % 5).not.toBe(0);
      expect(t.className).toBe('tick-minute');
      expect(t.strokeWidth).toBe(1);
    });
  });
});
