import { app, BrowserWindow, ipcMain, screen } from 'electron';
import * as path from 'path';
import { loadConfig, saveConfig, AppConfig } from './config';
import {
  calculateDraggedPosition,
  isCoordinateVisible,
  validateAndNormalizeConfig
} from './window-math';
import { createContextMenu } from './menu';

// Set application name
app.setName('ticker');

// Disable hardware acceleration to eliminate Linux GPU/VA-API driver errors (e.g. iHD_drv_video.so)
// and guarantee flawless transparent window rendering across all Linux compositors.
app.disableHardwareAcceleration();

// Linux transparency support flag
app.commandLine.appendSwitch('enable-transparent-visuals');

let mainWindow: BrowserWindow | null = null;
let settingsWindow: BrowserWindow | null = null;
let config: AppConfig;

// Window dragging state
let isDragging = false;
let initialWinX = 0;
let initialWinY = 0;
let dragOriginX = 0;
let dragOriginY = 0;

function openSettingsWindow() {
  if (settingsWindow && !settingsWindow.isDestroyed()) {
    settingsWindow.focus();
    return;
  }

  const win = new BrowserWindow({
    width: 420,
    height: 560,
    title: 'Ticker Settings',
    resizable: false,
    frame: true,         // Always framed for settings — it needs a title bar
    transparent: false,
    webPreferences: {
      preload: path.join(__dirname, '../preload/preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false
    }
  });

  win.setMenuBarVisibility(false);
  win.loadFile(path.join(__dirname, '../renderer/settings.html'));
  win.once('closed', () => {
    settingsWindow = null;
  });
  settingsWindow = win;
}

function createWindow(): BrowserWindow {
  config = loadConfig();

  const width = config.width ?? 240;
  const height = config.height ?? 240;
  const frameless = config.frameless ?? true;

  const windowOptions: Electron.BrowserWindowConstructorOptions = {
    width,
    height,
    frame: !frameless,  // frame: false = frameless
    transparent: true,
    resizable: false,
    hasShadow: false,
    alwaysOnTop: config.alwaysOnTop,
    skipTaskbar: false,
    webPreferences: {
      preload: path.join(__dirname, '../preload/preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false
    }
  };

  // Position: use stored coords if visible, otherwise default to top-right corner.
  const displays = screen.getAllDisplays();
  if (typeof config.x === 'number' && typeof config.y === 'number') {
    if (isCoordinateVisible({ x: config.x, y: config.y }, displays)) {
      windowOptions.x = config.x;
      windowOptions.y = config.y;
    }
  }
  if (windowOptions.x === undefined || windowOptions.y === undefined) {
    const primary = screen.getPrimaryDisplay();
    const work = primary.workArea;
    windowOptions.x = work.x + work.width - width;
    windowOptions.y = work.y;
  }

  const win = new BrowserWindow(windowOptions);
  win.loadFile(path.join(__dirname, '../renderer/index.html'));

  win.on('moved', () => {
    if (!win.isDestroyed()) {
      const [x, y] = win.getPosition();
      config.x = x;
      config.y = y;
      saveConfig(config);
    }
  });

  return win;
}

function notifyConfigUpdated() {
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send('config-updated', config);
  }
  if (settingsWindow && !settingsWindow.isDestroyed()) {
    settingsWindow.webContents.send('config-updated', config);
  }
}

app.whenReady().then(() => {
  mainWindow = createWindow();

  // IPC: Window Dragging
  ipcMain.on('start-drag', (_event, { screenX, screenY }) => {
    if (!mainWindow || mainWindow.isDestroyed()) return;
    if (config.lockedPosition) return;
    isDragging = true;
    const [x, y] = mainWindow.getPosition();
    initialWinX = x;
    initialWinY = y;
    dragOriginX = screenX;
    dragOriginY = screenY;
  });

  ipcMain.on('drag', (_event, { screenX, screenY }) => {
    if (!isDragging || !mainWindow || mainWindow.isDestroyed()) return;
    const nextPos = calculateDraggedPosition(
      { x: initialWinX, y: initialWinY },
      { screenX: dragOriginX, screenY: dragOriginY },
      { screenX, screenY }
    );
    mainWindow.setPosition(nextPos.x, nextPos.y);
  });

  ipcMain.on('stop-drag', () => {
    isDragging = false;
    if (mainWindow && !mainWindow.isDestroyed()) {
      const [x, y] = mainWindow.getPosition();
      config.x = x;
      config.y = y;
      saveConfig(config);
    }
  });

  // IPC: Context Menu
  ipcMain.on('show-context-menu', () => {
    if (!mainWindow || mainWindow.isDestroyed()) return;
    const menu = createContextMenu(mainWindow, config, (updatedConfig) => {
      config = updatedConfig;
      notifyConfigUpdated();
    }, openSettingsWindow);
    menu.popup({ window: mainWindow });
  });

  // IPC: Close App
  ipcMain.on('close-app', () => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.close();
    }
  });

  // IPC: Open Settings
  ipcMain.on('open-settings', () => {
    openSettingsWindow();
  });

  // IPC: Get Config
  ipcMain.handle('get-config', () => {
    return config;
  });

  // IPC: Update Config (partial merge from settings window)
  ipcMain.handle('update-config', (_event, partial: Partial<AppConfig>) => {
    const merged = { ...config, ...partial } as AppConfig;
    const displays = screen.getAllDisplays();
    config = validateAndNormalizeConfig(merged, displays);
    saveConfig(config);
    notifyConfigUpdated();
    return config;
  });

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      mainWindow = createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
