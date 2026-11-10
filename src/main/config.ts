import { app, screen } from 'electron';
import * as fs from 'fs';
import * as path from 'path';
import {
  AppConfig,
  DEFAULT_CONFIG,
  validateAndNormalizeConfig
} from './window-math';

export { AppConfig, DEFAULT_CONFIG };

function getConfigPath(): string {
  return path.join(app.getPath('userData'), 'ticker-config.json');
}

export function loadConfig(): AppConfig {
  try {
    const configPath = getConfigPath();
    if (fs.existsSync(configPath)) {
      const data = fs.readFileSync(configPath, 'utf-8');
      const parsed = JSON.parse(data);
      const displays = screen.getAllDisplays();
      return validateAndNormalizeConfig(parsed, displays);
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
