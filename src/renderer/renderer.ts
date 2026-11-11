import { Clock } from './clock';
import { ClockConfig } from '../types/electron';
import {
  getThemeClass,
  isCloseShortcut,
  shouldInitiateDrag
} from './event-helpers';

/** Compute the Date to display, respecting manual time and timezone override.
 *
 * Logic:
 *  - useSystemTime true  → new Date() (host clock + host TZ). timezoneOffsetMinutes is
 *    still respected if set, so users can pin to a foreign TZ while keeping live time.
 *  - useSystemTime false → new Date(manualTime). Time is frozen at the saved epoch value.
 *
 * When timezoneOffsetMinutes is defined we convert the base time to UTC and
 * then apply the desired offset, producing a Date whose local-hour/minute/second
 * values are correct for that offset. When it is undefined the host TZ is used
 * naturally (no transformation needed).
 */
function computeDisplayDate(config: ClockConfig): Date {
  // Step 1 – choose base time
  const baseTime: Date =
    config.useSystemTime === false && typeof config.manualTime === 'number'
      ? new Date(config.manualTime)
      : new Date(); // system clock — already in host TZ

  // Step 2 – apply explicit TZ offset only when one has been configured
  if (typeof config.timezoneOffsetMinutes === 'number') {
    // Compute UTC epoch, then shift to the target offset.
    // getTimezoneOffset() returns minutes *west* of UTC, so we add it to get UTC.
    const utcMs = baseTime.getTime() + baseTime.getTimezoneOffset() * 60000;
    return new Date(utcMs + config.timezoneOffsetMinutes * 60000);
  }

  // No TZ override → return base time as-is (uses host TZ automatically)
  return baseTime;
}

document.addEventListener('DOMContentLoaded', async () => {
  const container = document.getElementById('clock-container');
  const closeBtn = document.getElementById('close-btn');

  if (!container) return;

  const clock = new Clock(container);

  // Apply theme class to body
  const applyTheme = (theme: 'light' | 'dark') => {
    const themeClass = getThemeClass(theme);
    document.body.classList.remove('theme-light', 'theme-dark');
    document.body.classList.add(themeClass);
  };

  // Load initial config and apply theme
  let currentConfig: ClockConfig = { alwaysOnTop: true, theme: 'light' };
  if (window.electronAPI) {
    try {
      const cfg = await window.electronAPI.getConfig();
      currentConfig = cfg;
      if (cfg?.theme) applyTheme(cfg.theme);
    } catch (err) {
      console.error('Failed to load initial config:', err);
    }

    // Live-update on config changes (from settings window or context menu)
    window.electronAPI.onConfigUpdated((cfg: ClockConfig) => {
      currentConfig = cfg;
      if (cfg.theme) applyTheme(cfg.theme);
    });
  }

  // Animation loop — uses computeDisplayDate so manual/timezone settings are respected
  const tick = () => {
    clock.updateHands(computeDisplayDate(currentConfig));
    requestAnimationFrame(tick);
  };
  tick();

  // Drag — disabled when lockedPosition is true
  let isDragging = false;

  container.addEventListener('mousedown', (e: MouseEvent) => {
    if (!shouldInitiateDrag(e.button, e.target as HTMLElement)) return;
    if (currentConfig.lockedPosition) return;
    isDragging = true;
    window.electronAPI?.startDrag({ screenX: e.screenX, screenY: e.screenY });
  });

  window.addEventListener('mousemove', (e: MouseEvent) => {
    if (isDragging) {
      window.electronAPI?.drag({ screenX: e.screenX, screenY: e.screenY });
    }
  });

  window.addEventListener('mouseup', () => {
    if (isDragging) {
      isDragging = false;
      window.electronAPI?.stopDrag();
    }
  });

  // Right-click context menu
  window.addEventListener('contextmenu', (e: MouseEvent) => {
    e.preventDefault();
    window.electronAPI?.showContextMenu();
  });

  // Hover close button
  closeBtn?.addEventListener('click', (e: MouseEvent) => {
    e.stopPropagation();
    window.electronAPI?.closeApp();
  });

  // Keyboard shortcuts
  window.addEventListener('keydown', (e: KeyboardEvent) => {
    if (isCloseShortcut(e)) {
      window.electronAPI?.closeApp();
    }
  });
});
