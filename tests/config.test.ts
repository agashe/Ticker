import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as fs from 'fs';
import { loadConfig, saveConfig, DEFAULT_CONFIG } from '../src/main/config';

// Mock electron
vi.mock('electron', () => ({
  app: {
    getPath: vi.fn().mockReturnValue('/mock/userdata')
  },
  screen: {
    getAllDisplays: vi.fn().mockReturnValue([
      { bounds: { x: 0, y: 0, width: 1920, height: 1080 } }
    ])
  }
}));

// Mock fs
vi.mock('fs', () => ({
  existsSync: vi.fn(),
  readFileSync: vi.fn(),
  writeFileSync: vi.fn(),
  mkdirSync: vi.fn()
}));

describe('Config Persistence - loadConfig & saveConfig', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('loadConfig', () => {
    it('returns DEFAULT_CONFIG when configuration file does not exist', () => {
      vi.mocked(fs.existsSync).mockReturnValue(false);

      const config = loadConfig();
      expect(config).toEqual(DEFAULT_CONFIG);
      expect(fs.readFileSync).not.toHaveBeenCalled();
    });

    it('loads and validates configuration from disk when file exists', () => {
      vi.mocked(fs.existsSync).mockReturnValue(true);
      vi.mocked(fs.readFileSync).mockReturnValue(
        JSON.stringify({
          x: 400,
          y: 200,
          alwaysOnTop: false,
          theme: 'dark'
        })
      );

      const config = loadConfig();
      expect(config).toEqual({
        x: 400,
        y: 200,
        alwaysOnTop: false,
        theme: 'dark'
      });
    });

    it('gracefully returns DEFAULT_CONFIG when file content is invalid JSON', () => {
      vi.mocked(fs.existsSync).mockReturnValue(true);
      vi.mocked(fs.readFileSync).mockReturnValue('invalid {json');

      const config = loadConfig();
      expect(config).toEqual(DEFAULT_CONFIG);
    });

    it('strips coordinates when coordinates stored in config are off-screen', () => {
      vi.mocked(fs.existsSync).mockReturnValue(true);
      vi.mocked(fs.readFileSync).mockReturnValue(
        JSON.stringify({
          x: 99999,
          y: 99999,
          alwaysOnTop: true,
          theme: 'light'
        })
      );

      const config = loadConfig();
      expect(config.x).toBeUndefined();
      expect(config.y).toBeUndefined();
      expect(config.alwaysOnTop).toBe(true);
      expect(config.theme).toBe('light');
    });
  });

  describe('saveConfig', () => {
    it('writes formatted JSON config to the user data path', () => {
      vi.mocked(fs.existsSync).mockReturnValue(true);

      const configToSave = {
        x: 100,
        y: 100,
        alwaysOnTop: true,
        theme: 'light' as const
      };

      saveConfig(configToSave);

      expect(fs.writeFileSync).toHaveBeenCalledWith(
        '/mock/userdata/ticker-config.json',
        JSON.stringify(configToSave, null, 2),
        'utf-8'
      );
    });

    it('creates directory if it does not exist before writing file', () => {
      vi.mocked(fs.existsSync).mockReturnValue(false);

      saveConfig(DEFAULT_CONFIG);

      expect(fs.mkdirSync).toHaveBeenCalledWith('/mock/userdata', { recursive: true });
      expect(fs.writeFileSync).toHaveBeenCalled();
    });

    it('handles write errors gracefully without throwing', () => {
      vi.mocked(fs.existsSync).mockReturnValue(true);
      vi.mocked(fs.writeFileSync).mockImplementation(() => {
        throw new Error('Disk full');
      });

      expect(() => saveConfig(DEFAULT_CONFIG)).not.toThrow();
    });
  });
});
