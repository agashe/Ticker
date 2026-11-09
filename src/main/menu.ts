import { Menu, BrowserWindow, MenuItemConstructorOptions } from 'electron';
import { AppConfig, saveConfig } from './config';

export function createContextMenu(
  win: BrowserWindow,
  config: AppConfig,
  onConfigChange: (updated: AppConfig) => void
): Menu {
  const template: MenuItemConstructorOptions[] = [
    {
      label: 'Always on Top',
      type: 'checkbox',
      checked: win.isAlwaysOnTop(),
      click: (item) => {
        const nextValue = item.checked;
        win.setAlwaysOnTop(nextValue);
        config.alwaysOnTop = nextValue;
        saveConfig(config);
        onConfigChange(config);
      }
    },
    {
      label: 'Theme',
      submenu: [
        {
          label: 'Light (White Dial)',
          type: 'radio',
          checked: config.theme === 'light',
          click: () => {
            config.theme = 'light';
            saveConfig(config);
            onConfigChange(config);
          }
        },
        {
          label: 'Dark (Black Dial)',
          type: 'radio',
          checked: config.theme === 'dark',
          click: () => {
            config.theme = 'dark';
            saveConfig(config);
            onConfigChange(config);
          }
        }
      ]
    },
    {
      label: 'Center Clock',
      click: () => {
        win.center();
        const [x, y] = win.getPosition();
        config.x = x;
        config.y = y;
        saveConfig(config);
      }
    },
    { type: 'separator' },
    {
      label: 'Close Ticker',
      accelerator: 'CmdOrCtrl+Q',
      click: () => {
        win.close();
      }
    }
  ];

  return Menu.buildFromTemplate(template);
}
