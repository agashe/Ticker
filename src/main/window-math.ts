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
}

export const DEFAULT_CONFIG: AppConfig = {
  alwaysOnTop: true,
  theme: 'light'
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

  const config: AppConfig = {
    alwaysOnTop,
    theme
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
