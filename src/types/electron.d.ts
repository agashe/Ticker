export interface ClockConfig {
  x?: number;
  y?: number;
  alwaysOnTop: boolean;
  theme: 'light' | 'dark';
  useSystemTime?: boolean;
  manualTime?: number;
  timezoneOffsetMinutes?: number;
  lockedPosition?: boolean;
  width?: number;
  height?: number;
  frameless?: boolean;
}

export interface ElectronAPI {
  closeApp: () => void;
  startDrag: (coords: { screenX: number; screenY: number }) => void;
  drag: (coords: { screenX: number; screenY: number }) => void;
  stopDrag: () => void;
  showContextMenu: () => void;
  getConfig: () => Promise<ClockConfig>;
  updateConfig: (partial: Partial<ClockConfig>) => Promise<ClockConfig>;
  openSettings: () => void;
  onConfigUpdated: (callback: (config: ClockConfig) => void) => () => void;
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}
