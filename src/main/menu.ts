import { Menu, BrowserWindow, MenuItemConstructorOptions } from 'electron';
import { AppConfig, saveConfig } from './config';

export interface MenuActions {
  onToggleAlwaysOnTop: (checked: boolean) => void;
  onThemeChange: (theme: 'light' | 'dark') => void;
  onClose: () => void;
  onOpenSettings: () => void;
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
    { type: 'separator' },
    {
      label: 'Settings…',
      click: () => {
        actions.onOpenSettings();
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
  onConfigChange: (updated: AppConfig) => void,
  onOpenSettings: () => void
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
      onClose: () => {
        win.close();
      },
      onOpenSettings: () => {
        onOpenSettings();
      }
    },
    {
      isAlwaysOnTop: win.isAlwaysOnTop(),
      theme: config.theme
    }
  );

  return Menu.buildFromTemplate(template);
}
