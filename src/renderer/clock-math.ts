export interface HandAngles {
  hour: number;
  minute: number;
  second: number;
}

export interface TickMark {
  index: number;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  isHour: boolean;
  strokeWidth: number;
  className: string;
}

export interface TickOptions {
  cx?: number;
  cy?: number;
  radius?: number;
  hourTickLength?: number;
  minuteTickLength?: number;
  hourStrokeWidth?: number;
  minuteStrokeWidth?: number;
}

/**
 * Calculates smooth, continuous angles in degrees (0 - 360) for hour, minute, and second hands.
 */
export function calculateHandAngles(date: Date): HandAngles {
  const ms = date.getMilliseconds();
  const sec = date.getSeconds() + ms / 1000;
  const min = date.getMinutes() + sec / 60;
  const hr = (date.getHours() % 12) + min / 60;

  const second = (sec * 6) % 360;
  const minute = (min * 6) % 360;
  const hour = (hr * 30) % 360;

  return { hour, minute, second };
}

/**
 * Generates the SVG rotation transform string for a given angle around a pivot center.
 */
export function getRotationTransform(angle: number, cx = 100, cy = 100): string {
  return `rotate(${angle} ${cx} ${cy})`;
}

/**
 * Calculates geometry for a single tick mark at a 0-59 index.
 */
export function calculateTickGeometry(index: number, options: TickOptions = {}): TickMark {
  const cx = options.cx ?? 100;
  const cy = options.cy ?? 100;
  const radius = options.radius ?? 94;
  const hourTickLength = options.hourTickLength ?? 9;
  const minuteTickLength = options.minuteTickLength ?? 4.5;
  const hourStrokeWidth = options.hourStrokeWidth ?? 2.5;
  const minuteStrokeWidth = options.minuteStrokeWidth ?? 1;

  const isHour = index % 5 === 0;
  const tickLength = isHour ? hourTickLength : minuteTickLength;
  const strokeWidth = isHour ? hourStrokeWidth : minuteStrokeWidth;

  const angle = (index * 6 * Math.PI) / 180;
  const rOuter = radius - 5;
  const rInner = rOuter - tickLength;

  const x1 = Number((cx + rOuter * Math.sin(angle)).toFixed(2));
  const y1 = Number((cy - rOuter * Math.cos(angle)).toFixed(2));
  const x2 = Number((cx + rInner * Math.sin(angle)).toFixed(2));
  const y2 = Number((cy - rInner * Math.cos(angle)).toFixed(2));

  return {
    index,
    x1,
    y1,
    x2,
    y2,
    isHour,
    strokeWidth,
    className: isHour ? 'tick-hour' : 'tick-minute'
  };
}

/**
 * Calculates geometry for all 60 tick marks around the clock dial.
 */
export function calculateAllTicks(options: TickOptions = {}): TickMark[] {
  const ticks: TickMark[] = [];
  for (let i = 0; i < 60; i++) {
    ticks.push(calculateTickGeometry(i, options));
  }
  return ticks;
}
