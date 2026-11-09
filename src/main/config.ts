import { app, screen } from 'electron';
import * as fs from 'fs';
import * as path from 'path';

export interface AppConfig {
  x?: number;
  y?: number;
  alwaysOnTop: boolean;
  theme: 'light' | 'dark';
}

const DEFAULT_CONFIG: AppConfig = {
  alwaysOnTop: true,
  theme: 'light'
};

function getConfigPath(): string {
  return path.join(app.getPath('userData'), 'ticker-config.json');
}

export function loadConfig(): AppConfig {
  try {
    const configPath = getConfigPath();
    if (fs.existsSync(configPath)) {
      const data = fs.readFileSync(configPath, 'utf-8');
      const parsed = JSON.parse(data);
      const config: AppConfig = { ...DEFAULT_CONFIG, ...parsed };

      // Validate coordinates if present
      if (typeof config.x === 'number' && typeof config.y === 'number') {
        const displays = screen.getAllDisplays();
        const isVisible = displays.some((d) => {
          const { x, y, width, height } = d.bounds;
          return (
            (config.x as number) >= x - 50 &&
            (config.x as number) <= x + width - 50 &&
            (config.y as number) >= y - 50 &&
            (config.y as number) <= y + height - 50
          );
        });

        if (!isVisible) {
          delete config.x;
          delete config.y;
        }
      }

      return config;
    }
  } catch (err) {
    console.error('Failed to load config, using defaults:', err);
  }
  return { ...DEFAULT_CONFIG };
}

export function saveConfig(config: AppConfig): void {
  try {
    const configPath = getConfigPath();
    const dir = path.dirname(configPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to save config:', err);
  }
}
