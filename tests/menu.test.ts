import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Menu } from 'electron';
import {
  buildContextMenuTemplate,
  createContextMenu,
  MenuActions,
  MenuState
} from '../src/main/menu';
import * as configModule from '../src/main/config';

// Mock electron Menu
vi.mock('electron', () => ({
  Menu: {
    buildFromTemplate: vi.fn((template) => ({ template, popup: vi.fn() }))
  }
}));

// Mock saveConfig
vi.mock('../src/main/config', async (importOriginal) => {
  const actual = await importOriginal<typeof configModule>();
  return {
    ...actual,
    saveConfig: vi.fn()
  };
});

describe('Context Menu - buildContextMenuTemplate', () => {
  const createMockActions = (): MenuActions => ({
    onToggleAlwaysOnTop: vi.fn(),
    onThemeChange: vi.fn(),
    onCenter: vi.fn(),
    onClose: vi.fn()
  });

  const baseState: MenuState = {
    isAlwaysOnTop: true,
    theme: 'light'
  };

  it('constructs all standard menu items and separators', () => {
    const actions = createMockActions();
    const template = buildContextMenuTemplate(actions, baseState);

    expect(template).toHaveLength(5);
    expect(template[0].label).toBe('Always on Top');
    expect(template[1].label).toBe('Theme');
    expect(template[2].label).toBe('Center Clock');
    expect(template[3].type).toBe('separator');
    expect(template[4].label).toBe('Close Ticker');
  });

  it('reflects and toggles "Always on Top" checkbox state', () => {
    const actions = createMockActions();
    const templateOn = buildContextMenuTemplate(actions, { ...baseState, isAlwaysOnTop: true });
    expect(templateOn[0].type).toBe('checkbox');
    expect(templateOn[0].checked).toBe(true);

    // Click with item checked = false
    templateOn[0].click?.({ checked: false } as any, undefined as any, undefined as any);
    expect(actions.onToggleAlwaysOnTop).toHaveBeenCalledWith(false);

    const templateOff = buildContextMenuTemplate(actions, { ...baseState, isAlwaysOnTop: false });
    expect(templateOff[0].checked).toBe(false);
  });

  it('provides Theme submenu with radio options that trigger onThemeChange', () => {
    const actions = createMockActions();
    const template = buildContextMenuTemplate(actions, { ...baseState, theme: 'dark' });

    const themeItem = template[1];
    expect(Array.isArray(themeItem.submenu)).toBe(true);

    const submenu = themeItem.submenu as any[];
    expect(submenu).toHaveLength(2);

    const lightOption = submenu[0];
    const darkOption = submenu[1];

    expect(lightOption.label).toBe('Light (White Dial)');
    expect(lightOption.type).toBe('radio');
    expect(lightOption.checked).toBe(false);

    expect(darkOption.label).toBe('Dark (Black Dial)');
    expect(darkOption.type).toBe('radio');
    expect(darkOption.checked).toBe(true);

    // Clicking light option triggers onThemeChange('light')
    lightOption.click();
    expect(actions.onThemeChange).toHaveBeenCalledWith('light');

    // Clicking dark option triggers onThemeChange('dark')
    darkOption.click();
    expect(actions.onThemeChange).toHaveBeenCalledWith('dark');
  });

  it('triggers onCenter when "Center Clock" is clicked', () => {
    const actions = createMockActions();
    const template = buildContextMenuTemplate(actions, baseState);
    const centerItem = template[2];

    centerItem.click?.({} as any, undefined as any, undefined as any);
    expect(actions.onCenter).toHaveBeenCalledTimes(1);
  });

  it('configures "Close Ticker" with CmdOrCtrl+Q accelerator and triggers onClose', () => {
    const actions = createMockActions();
    const template = buildContextMenuTemplate(actions, baseState);
    const closeItem = template[4];

    expect(closeItem.accelerator).toBe('CmdOrCtrl+Q');
    closeItem.click?.({} as any, undefined as any, undefined as any);
    expect(actions.onClose).toHaveBeenCalledTimes(1);
  });
});

describe('Context Menu - createContextMenu integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('binds BrowserWindow actions and config persistence properly', () => {
    const mockWin: any = {
      isAlwaysOnTop: vi.fn().mockReturnValue(true),
      setAlwaysOnTop: vi.fn(),
      center: vi.fn(),
      getPosition: vi.fn().mockReturnValue([500, 300]),
      close: vi.fn()
    };

    const initialConfig: configModule.AppConfig = {
      alwaysOnTop: true,
      theme: 'light'
    };

    const onConfigChange = vi.fn();

    createContextMenu(mockWin, initialConfig, onConfigChange);

    expect(Menu.buildFromTemplate).toHaveBeenCalledTimes(1);
    const template = vi.mocked(Menu.buildFromTemplate).mock.calls[0][0] as any[];

    // 1. Test toggling Always on Top
    const alwaysOnTopItem = template[0];
    alwaysOnTopItem.click({ checked: false });
    expect(mockWin.setAlwaysOnTop).toHaveBeenCalledWith(false);
    expect(initialConfig.alwaysOnTop).toBe(false);
    expect(configModule.saveConfig).toHaveBeenCalledWith(initialConfig);
    expect(onConfigChange).toHaveBeenCalledWith(initialConfig);

    // 2. Test switching Theme
    const themeSubmenu = template[1].submenu;
    themeSubmenu[1].click(); // Click Dark
    expect(initialConfig.theme).toBe('dark');
    expect(configModule.saveConfig).toHaveBeenCalledWith(initialConfig);
    expect(onConfigChange).toHaveBeenCalledWith(initialConfig);

    // 3. Test Center Clock
    const centerItem = template[2];
    centerItem.click();
    expect(mockWin.center).toHaveBeenCalled();
    expect(initialConfig.x).toBe(500);
    expect(initialConfig.y).toBe(300);
    expect(configModule.saveConfig).toHaveBeenCalledWith(initialConfig);

    // 4. Test Close Ticker
    const closeItem = template[4];
    closeItem.click();
    expect(mockWin.close).toHaveBeenCalled();
  });
});
