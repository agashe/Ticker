import { app, BrowserWindow, ipcMain } from 'electron';
import * as path from 'path';
import { loadConfig, saveConfig, AppConfig } from './config';
import { calculateDraggedPosition } from './window-math';
import { createContextMenu } from './menu';

// Set application name
app.setName('ticker');

// Disable hardware acceleration to eliminate Linux GPU/VA-API driver errors (e.g. iHD_drv_video.so)
// and guarantee flawless transparent window rendering across all Linux compositors.
app.disableHardwareAcceleration();

// Linux transparency support flag
app.commandLine.appendSwitch('enable-transparent-visuals');

let mainWindow: BrowserWindow | null = null;
let config: AppConfig;

// Window dragging state
let isDragging = false;
let initialWinX = 0;
let initialWinY = 0;
let dragOriginX = 0;
let dragOriginY = 0;

function createWindow(): BrowserWindow {
  config = loadConfig();

  const windowOptions: Electron.BrowserWindowConstructorOptions = {
    width: 240,
    height: 240,
    frame: false,
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

  if (typeof config.x === 'number' && typeof config.y === 'number') {
    windowOptions.x = config.x;
    windowOptions.y = config.y;
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
}

app.whenReady().then(() => {
  mainWindow = createWindow();

  // IPC: Window Dragging
  ipcMain.on('start-drag', (event, { screenX, screenY }) => {
    if (!mainWindow || mainWindow.isDestroyed()) return;
    isDragging = true;
    const [x, y] = mainWindow.getPosition();
    initialWinX = x;
    initialWinY = y;
    dragOriginX = screenX;
    dragOriginY = screenY;
  });

  ipcMain.on('drag', (event, { screenX, screenY }) => {
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
    });
    menu.popup({ window: mainWindow });
  });

  // IPC: Close App
  ipcMain.on('close-app', () => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.close();
    }
  });

  // IPC: Config getters/setters
  ipcMain.handle('get-config', () => {
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
