export interface KeyboardShortcutEvent {
  key: string;
  ctrlKey?: boolean;
  metaKey?: boolean;
}

/**
 * Determines whether a keyboard event matches the application close shortcuts.
 * Supports: Escape, Ctrl+Q, Ctrl+W, Cmd+Q, Cmd+W.
 */
export function isCloseShortcut(event: KeyboardShortcutEvent): boolean {
  if (event.key === 'Escape' || event.key === 'Esc') {
    return true;
  }
  const isModifier = Boolean(event.ctrlKey || event.metaKey);
  const keyLower = event.key.toLowerCase();
  return isModifier && (keyLower === 'q' || keyLower === 'w');
}

/**
 * Returns the CSS class corresponding to the active theme.
 */
export function getThemeClass(theme?: 'light' | 'dark'): 'theme-light' | 'theme-dark' {
  return theme === 'dark' ? 'theme-dark' : 'theme-light';
}

/**
 * Determines whether a mouse down event should initiate window dragging.
 * Allows left-click (button === 0) only, excluding interactions on the close button.
 */
export function shouldInitiateDrag(
  button: number,
  target: { closest?: (selector: string) => unknown } | null
): boolean {
  if (button !== 0) {
    return false;
  }
  if (target && typeof target.closest === 'function' && target.closest('#close-btn')) {
    return false;
  }
  return true;
}
