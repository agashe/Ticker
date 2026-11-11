import { contextBridge, ipcRenderer } from 'electron';
import { ClockConfig } from '../types/electron';

contextBridge.exposeInMainWorld('electronAPI', {
  closeApp: () => {
    ipcRenderer.send('close-app');
  },
  startDrag: (coords: { screenX: number; screenY: number }) => {
    ipcRenderer.send('start-drag', coords);
  },
  drag: (coords: { screenX: number; screenY: number }) => {
    ipcRenderer.send('drag', coords);
  },
  stopDrag: () => {
    ipcRenderer.send('stop-drag');
  },
  showContextMenu: () => {
    ipcRenderer.send('show-context-menu');
  },
  getConfig: (): Promise<ClockConfig> => {
    return ipcRenderer.invoke('get-config');
  },
  updateConfig: (partial: Partial<ClockConfig>): Promise<ClockConfig> => {
    return ipcRenderer.invoke('update-config', partial);
  },
  openSettings: () => {
    ipcRenderer.send('open-settings');
  },
  onConfigUpdated: (callback: (config: ClockConfig) => void) => {
    const handler = (_event: Electron.IpcRendererEvent, config: ClockConfig) => {
      callback(config);
    };
    ipcRenderer.on('config-updated', handler);
    return () => {
      ipcRenderer.removeListener('config-updated', handler);
    };
  }
});
