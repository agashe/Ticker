import { describe, it, expect } from 'vitest';
import {
  isCloseShortcut,
  getThemeClass,
  shouldInitiateDrag
} from '../src/renderer/event-helpers';

describe('Event Helpers - isCloseShortcut', () => {
  it('identifies Escape and Esc keys', () => {
    expect(isCloseShortcut({ key: 'Escape' })).toBe(true);
    expect(isCloseShortcut({ key: 'Esc' })).toBe(true);
  });

  it('identifies Ctrl+Q and Ctrl+W (case-insensitive)', () => {
    expect(isCloseShortcut({ key: 'q', ctrlKey: true })).toBe(true);
    expect(isCloseShortcut({ key: 'Q', ctrlKey: true })).toBe(true);
    expect(isCloseShortcut({ key: 'w', ctrlKey: true })).toBe(true);
    expect(isCloseShortcut({ key: 'W', ctrlKey: true })).toBe(true);
  });

  it('identifies Cmd+Q and Cmd+W on macOS (metaKey)', () => {
    expect(isCloseShortcut({ key: 'q', metaKey: true })).toBe(true);
    expect(isCloseShortcut({ key: 'w', metaKey: true })).toBe(true);
  });

  it('rejects keys without modifier flags', () => {
    expect(isCloseShortcut({ key: 'q' })).toBe(false);
    expect(isCloseShortcut({ key: 'w' })).toBe(false);
    expect(isCloseShortcut({ key: 'Enter' })).toBe(false);
    expect(isCloseShortcut({ key: 'Space' })).toBe(false);
  });

  it('rejects other shortcuts like Ctrl+C or Ctrl+R', () => {
    expect(isCloseShortcut({ key: 'c', ctrlKey: true })).toBe(false);
    expect(isCloseShortcut({ key: 'r', ctrlKey: true })).toBe(false);
  });
});

describe('Event Helpers - getThemeClass', () => {
  it('maps theme names to corresponding CSS classes', () => {
    expect(getThemeClass('light')).toBe('theme-light');
    expect(getThemeClass('dark')).toBe('theme-dark');
  });

  it('defaults to theme-light if undefined', () => {
    expect(getThemeClass(undefined)).toBe('theme-light');
  });
});

describe('Event Helpers - shouldInitiateDrag', () => {
  it('returns true on left click (button 0) on dial surface', () => {
    const target = { closest: () => null };
    expect(shouldInitiateDrag(0, target)).toBe(true);
  });

  it('returns false for non-primary mouse buttons (middle or right click)', () => {
    const target = { closest: () => null };
    expect(shouldInitiateDrag(1, target)).toBe(false); // middle click
    expect(shouldInitiateDrag(2, target)).toBe(false); // right click
  });

  it('returns false when clicking on or inside the close button (#close-btn)', () => {
    const closeBtnElement = {};
    const target = {
      closest: (selector: string) => (selector === '#close-btn' ? closeBtnElement : null)
    };
    expect(shouldInitiateDrag(0, target)).toBe(false);
  });
});
