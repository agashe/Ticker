export interface ClockConfig {
  x?: number;
  y?: number;
  alwaysOnTop: boolean;
  theme: 'light' | 'dark';
}

export interface ElectronAPI {
  closeApp: () => void;
  startDrag: (coords: { screenX: number; screenY: number }) => void;
  drag: (coords: { screenX: number; screenY: number }) => void;
  stopDrag: () => void;
  showContextMenu: () => void;
  getConfig: () => Promise<ClockConfig>;
  onConfigUpdated: (callback: (config: ClockConfig) => void) => () => void;
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}
