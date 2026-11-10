import { Menu, BrowserWindow, MenuItemConstructorOptions } from 'electron';
import { AppConfig, saveConfig } from './config';

export interface MenuActions {
  onToggleAlwaysOnTop: (checked: boolean) => void;
  onThemeChange: (theme: 'light' | 'dark') => void;
  onCenter: () => void;
  onClose: () => void;
}

export interface MenuState {
  isAlwaysOnTop: boolean;
  theme: 'light' | 'dark';
}

export function buildContextMenuTemplate(
  actions: MenuActions,
  state: MenuState
): MenuItemConstructorOptions[] {
  return [
    {
      label: 'Always on Top',
      type: 'checkbox',
      checked: state.isAlwaysOnTop,
      click: (item) => {
        actions.onToggleAlwaysOnTop(Boolean(item.checked));
      }
    },
    {
      label: 'Theme',
      submenu: [
        {
          label: 'Light (White Dial)',
          type: 'radio',
          checked: state.theme === 'light',
          click: () => {
            actions.onThemeChange('light');
          }
        },
        {
          label: 'Dark (Black Dial)',
          type: 'radio',
          checked: state.theme === 'dark',
          click: () => {
            actions.onThemeChange('dark');
          }
        }
      ]
    },
    {
      label: 'Center Clock',
      click: () => {
        actions.onCenter();
      }
    },
    { type: 'separator' },
    {
      label: 'Close Ticker',
      accelerator: 'CmdOrCtrl+Q',
      click: () => {
        actions.onClose();
      }
    }
  ];
}

export function createContextMenu(
  win: BrowserWindow,
  config: AppConfig,
  onConfigChange: (updated: AppConfig) => void
): Menu {
  const template = buildContextMenuTemplate(
    {
      onToggleAlwaysOnTop: (checked) => {
        win.setAlwaysOnTop(checked);
        config.alwaysOnTop = checked;
        saveConfig(config);
        onConfigChange(config);
      },
      onThemeChange: (theme) => {
        config.theme = theme;
        saveConfig(config);
        onConfigChange(config);
      },
      onCenter: () => {
        win.center();
        const [x, y] = win.getPosition();
        config.x = x;
        config.y = y;
        saveConfig(config);
      },
      onClose: () => {
        win.close();
      }
    },
    {
      isAlwaysOnTop: win.isAlwaysOnTop(),
      theme: config.theme
    }
  );

  return Menu.buildFromTemplate(template);
}
