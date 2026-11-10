import { Clock } from './clock';
import { ClockConfig } from '../types/electron';
import {
  getThemeClass,
  isCloseShortcut,
  shouldInitiateDrag
} from './event-helpers';

document.addEventListener('DOMContentLoaded', async () => {
  const container = document.getElementById('clock-container');
  const closeBtn = document.getElementById('close-btn');

  if (!container) return;

  // Initialize and start analog clock
  const clock = new Clock(container);
  clock.start();

  // Apply theme
  const applyTheme = (theme: 'light' | 'dark') => {
    const themeClass = getThemeClass(theme);
    document.body.classList.remove('theme-light', 'theme-dark');
    document.body.classList.add(themeClass);
  };

  // Fetch initial config
  if (window.electronAPI) {
    try {
      const config = await window.electronAPI.getConfig();
      if (config && config.theme) {
        applyTheme(config.theme);
      }
    } catch (err) {
      console.error('Failed to load initial config:', err);
    }

    // Subscribe to config changes
    window.electronAPI.onConfigUpdated((config: ClockConfig) => {
      if (config.theme) {
        applyTheme(config.theme);
      }
    });
  }

  // Smooth Drag Implementation
  let isDragging = false;

  container.addEventListener('mousedown', (e: MouseEvent) => {
    if (!shouldInitiateDrag(e.button, e.target as HTMLElement)) {
      return;
    }
    isDragging = true;
    window.electronAPI?.startDrag({
      screenX: e.screenX,
      screenY: e.screenY
    });
  });

  window.addEventListener('mousemove', (e: MouseEvent) => {
    if (isDragging) {
      window.electronAPI?.drag({
        screenX: e.screenX,
        screenY: e.screenY
      });
    }
  });

  window.addEventListener('mouseup', () => {
    if (isDragging) {
      isDragging = false;
      window.electronAPI?.stopDrag();
    }
  });

  // Right-click Native Context Menu
  window.addEventListener('contextmenu', (e: MouseEvent) => {
    e.preventDefault();
    window.electronAPI?.showContextMenu();
  });

  // Close Button
  closeBtn?.addEventListener('click', (e: MouseEvent) => {
    e.stopPropagation();
    window.electronAPI?.closeApp();
  });

  // Keyboard Shortcuts
  window.addEventListener('keydown', (e: KeyboardEvent) => {
    if (isCloseShortcut(e)) {
      window.electronAPI?.closeApp();
    }
  });
});
