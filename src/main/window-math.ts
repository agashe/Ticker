export interface Rectangle {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface DisplayLike {
  bounds: Rectangle;
}

export interface AppConfig {
  x?: number;
  y?: number;
  alwaysOnTop: boolean;
  theme: 'light' | 'dark';
  /** Use host system time & timezone (default true). */
  useSystemTime?: boolean;
  /** Epoch ms for manual clock time (used when useSystemTime is false). */
  manualTime?: number;
  /** Offset in minutes from UTC (positive = east). Used for timezone override. */
  timezoneOffsetMinutes?: number;
  /** When true, dragging is disabled and position is locked. */
  lockedPosition?: boolean;
  /** Clock window width in pixels. */
  width?: number;
  /** Clock window height in pixels. */
  height?: number;
  /** If true, attempt frameless transparent window; fallback to framed if unsupported. */
  frameless?: boolean;
}

/** Minimum clock size in pixels (keeps the dial usable). */
export const MIN_CLOCK_SIZE = 80;
/** Maximum clock size in pixels. */
export const MAX_CLOCK_SIZE = 800;

export const DEFAULT_CONFIG: AppConfig = {
  alwaysOnTop: true,
  theme: 'light',
  useSystemTime: true,
  lockedPosition: false,
  width: 240,
  height: 240,
  frameless: true
};

/**
 * Checks if a given (x, y) coordinate falls within visible bounds of any active display.
 * Includes a margin check (default 50px) to ensure the gadget is not stranded off-screen.
 */
export function isCoordinateVisible(
  coords: { x?: number; y?: number },
  displays: DisplayLike[],
  margin = 50
): boolean {
  if (typeof coords.x !== 'number' || typeof coords.y !== 'number') {
    return false;
  }
  if (!displays || displays.length === 0) {
    return false;
  }

  const { x, y } = coords;
  return displays.some((d) => {
    const b = d.bounds;
    return (
      x >= b.x - margin &&
      x <= b.x + b.width - margin &&
      y >= b.y - margin &&
      y <= b.y + b.height - margin
    );
  });
}

/**
 * Validates and normalizes raw config data, applying defaults and checking coordinates.
 */
export function validateAndNormalizeConfig(
  raw: unknown,
  displays?: DisplayLike[]
): AppConfig {
  if (!raw || typeof raw !== 'object') {
    return { ...DEFAULT_CONFIG };
  }

  const input = raw as Partial<AppConfig>;

  const alwaysOnTop = typeof input.alwaysOnTop === 'boolean'
    ? input.alwaysOnTop
    : DEFAULT_CONFIG.alwaysOnTop;

  const theme: 'light' | 'dark' =
    input.theme === 'dark' || input.theme === 'light'
      ? input.theme
      : DEFAULT_CONFIG.theme;

  const useSystemTime = typeof input.useSystemTime === 'boolean'
    ? input.useSystemTime
    : DEFAULT_CONFIG.useSystemTime;

  const lockedPosition = typeof input.lockedPosition === 'boolean'
    ? input.lockedPosition
    : DEFAULT_CONFIG.lockedPosition;

  const frameless = typeof input.frameless === 'boolean'
    ? input.frameless
    : DEFAULT_CONFIG.frameless;

  const width = typeof input.width === 'number' && input.width >= MIN_CLOCK_SIZE && input.width <= MAX_CLOCK_SIZE
    ? input.width
    : DEFAULT_CONFIG.width;

  const height = typeof input.height === 'number' && input.height >= MIN_CLOCK_SIZE && input.height <= MAX_CLOCK_SIZE
    ? input.height
    : DEFAULT_CONFIG.height;

  const timezoneOffsetMinutes = typeof input.timezoneOffsetMinutes === 'number'
    ? input.timezoneOffsetMinutes
    : undefined;

  const manualTime = typeof input.manualTime === 'number'
    ? input.manualTime
    : undefined;

  const config: AppConfig = {
    alwaysOnTop,
    theme,
    useSystemTime,
    lockedPosition,
    frameless,
    width,
    height,
    timezoneOffsetMinutes,
    manualTime
  };

  if (typeof input.x === 'number' && typeof input.y === 'number') {
    if (displays && displays.length > 0) {
      if (isCoordinateVisible({ x: input.x, y: input.y }, displays)) {
        config.x = input.x;
        config.y = input.y;
      }
    } else {
      config.x = input.x;
      config.y = input.y;
    }
  }

  return config;
}

/**
 * Calculates new window position during a drag gesture.
 */
export function calculateDraggedPosition(
  initialWindow: { x: number; y: number },
  dragOrigin: { screenX: number; screenY: number },
  currentScreen: { screenX: number; screenY: number }
): { x: number; y: number } {
  const deltaX = currentScreen.screenX - dragOrigin.screenX;
  const deltaY = currentScreen.screenY - dragOrigin.screenY;
  return {
    x: Math.round(initialWindow.x + deltaX),
    y: Math.round(initialWindow.y + deltaY)
  };
}
