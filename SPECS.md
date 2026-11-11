# Ticker - Project Context & Architecture Specifications

## 1. Project Overview
**Ticker** is a minimalist desktop clock gadget built with TypeScript and Electron. It sits directly on your desktop workspace as a transparent, frameless circular widget without a standard window frame or background box.

## 2. Core Philosophy & Requirements
- **Simplicity & Aesthetics**: Clean, modern monochrome design (black and white).
- **Frameless Circular Form**: The OS window background is completely transparent; only the circular clock gadget is visible. Falls back to a framed window automatically on DEs/WMs that do not support transparency.
- **Classic 3-Hand Analog Movement**: Hour hand, minute hand, and second hand with smooth 60fps sweep.
- **Desktop Gadget Behaviors**:
  - Freely draggable across the screen.
  - Position memory (remembers where it was placed between sessions).
  - Default position: top-right corner of the primary display's work area when no saved position exists.
  - "Always on Top" toggleable behavior.
  - Non-intrusive (no taskbar clutter option / minimal footprint).
- **Control & Exit Mechanisms**:
  - Right-click native context menu with controls (Always on Top toggle, Theme toggle, Settings, Quit/Close).
  - Hover close button (sleek `×` icon appears when hovering near the top).
  - Keyboard shortcuts (`Escape`, `Ctrl+Q`, `Ctrl+W`) when focused.
- **Settings Window**: A dedicated settings panel (accessible via right-click → Settings…) for configuring:
  - **Time source**: automatic system clock + timezone, or manual frozen time.
  - **Timezone override**: explicit UTC offset in minutes (applies on top of either time source).
  - **Window size**: width and height from 80 px to 800 px.
  - **Position lock**: disables drag-and-drop.
- **Primary Target**: Linux desktop environments (X11 and Wayland compositors), with cross-platform compatibility (macOS, Windows) kept in mind.

## 3. Tech Stack
- **Framework**: Electron (Main, Preload, and Renderer processes).
- **Language**: TypeScript (`strict: true`).
- **Bundler & Tooling**: `esbuild` for sub-second builds, `tsc` for type-checking.
- **Rendering**: Vector SVG + CSS for pin-sharp rendering at all display scale factors / HiDPI screens.
- **Inter-Process Communication (IPC)**: Strictly typed `contextBridge` / `ipcRenderer` channel layer.

## 4. Architecture & Directory Structure
```
Ticker/
├── .github/
│   └── workflows/
│       ├── test.yml          # CI: Typecheck, Vitest coverage, and build on push/PR
│       └── release.yml       # Release: Builds and publishes GitHub Release on v* tags
├── .editorconfig
├── .gitignore
├── LICENSE
├── README.md             # End-user and developer documentation
├── CHANGELOG.md          # User-facing application feature release log
├── SPECS.md              # Project context, technical decisions, and roadmap (this file)
├── package.json
├── tsconfig.json
├── tsconfig.test.json
├── vitest.config.mts     # Vitest unit test configuration with v8 coverage
├── scripts/
│   ├── build.js          # Fast esbuild build pipeline for main, preload, renderer, and settings
│   ├── dev.js            # Development script with watcher and auto-launch
│   ├── package.js        # Standalone Linux AMD64 ELF binary and tarball packager
│   └── extract-changelog.js # Extracts tag-specific release notes from CHANGELOG.md
├── src/
│   ├── types/
│   │   └── electron.d.ts # TypeScript declarations for window.electronAPI, IPC payloads, and ClockConfig
│   ├── main/
│   │   ├── main.ts       # Electron lifecycle, BrowserWindow setup, IPC handlers, settings window
│   │   ├── window-math.ts# Display bounds checking, drag math, config normalization, size constants
│   │   ├── config.ts     # Persistent user settings (position, theme, alwaysOnTop, time, size, lock)
│   │   └── menu.ts       # Native context menu construction and template builder
│   ├── preload/
│   │   └── preload.ts    # Secure contextBridge API: drag, window control, config get/update, settings open
│   └── renderer/
│       ├── index.html    # Clean DOM host for the circular clock
│       ├── styles.css    # Gadget layout, transparent body, animations, monochrome themes
│       ├── clock-math.ts # Pure angle math, continuous sweep logic & dial geometry
│       ├── clock.ts      # Vector dial generator & 60fps tick loop
│       ├── event-helpers.ts # Pure shortcut detection, theme classes & drag guards
│       ├── renderer.ts   # UI event listeners, drag handling, shortcut bindings, time computation
│       ├── settings.html # Settings window UI (time, window size, position lock)
│       └── settings.ts   # Settings window logic: form populate, collect, save via IPC
└── tests/
    ├── clock-math.test.ts   # Unit tests for clock angles, sweep & tick trigonometry
    ├── window-math.test.ts  # Unit tests: multi-display bounds, normalization, drag, size constants
    ├── event-helpers.test.ts# Unit tests for shortcuts, theme resolution & drag triggers
    ├── menu.test.ts         # Unit tests for context menu template & BrowserWindow integration
    └── config.test.ts       # Unit tests for config loading, fallback defaults & save
```

## 5. Configuration Model (`AppConfig`)

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `x` | `number?` | — | Saved window X position |
| `y` | `number?` | — | Saved window Y position |
| `alwaysOnTop` | `boolean` | `true` | Keep window above all others |
| `theme` | `'light'\|'dark'` | `'light'` | Monochrome dial theme |
| `useSystemTime` | `boolean?` | `true` | Use host clock & timezone automatically |
| `manualTime` | `number?` | — | Epoch ms frozen time (when `useSystemTime` is false) |
| `timezoneOffsetMinutes` | `number?` | — | UTC offset in minutes; overrides host TZ when set |
| `lockedPosition` | `boolean?` | `false` | Disable drag-and-drop |
| `width` | `number?` | `240` | Window width in px (`MIN_CLOCK_SIZE`–`MAX_CLOCK_SIZE`) |
| `height` | `number?` | `240` | Window height in px (`MIN_CLOCK_SIZE`–`MAX_CLOCK_SIZE`) |
| `frameless` | `boolean?` | `true` | Frameless transparent window; DE/WM fallback to framed |

**Size constants**: `MIN_CLOCK_SIZE = 80 px`, `MAX_CLOCK_SIZE = 800 px`.

## 6. Technical Decisions & Linux Caveats
1. **Window Transparency & Graphics on Linux**:
   - `transparent: true`, `frame: false`, and `hasShadow: false` are configured.
   - Electron transparency on Linux X11 requires a compositing window manager (e.g. Picom, Mutter, KWin).
   - `app.commandLine.appendSwitch('enable-transparent-visuals')` ensures alpha channel support on Linux compositors.
   - `app.disableHardwareAcceleration()` is enabled: this prevents Intel VA-API / GPU driver errors (such as `iHD_drv_video.so`), reduces CPU/GPU overhead for lightweight 2D clock rendering, and prevents transparent windows from rendering black square backgrounds on certain Linux GPU drivers.
   - **Fallback**: When `frameless: false` is set (or the DE/WM ignores the transparent flag), the settings window and optionally the clock window fall back to a standard framed window.
2. **Dragging vs. Context Menu Conflict**:
   - Electron's native CSS property `-webkit-app-region: drag` on Linux X11 intercepts all pointer events, swallowing `contextmenu` (right click) and hover events.
   - **Solution**: Dragging is implemented using pointer events with IPC-assisted delta window movement (`startDrag`, `drag`, `stopDrag`). This guarantees:
     - Full drag freedom from anywhere on the clock face.
     - 100% reliable right-click context menu.
     - Working hover states and subtle interactive controls.
   - When `lockedPosition` is `true`, the main process ignores `start-drag` IPC messages, and the renderer skips calling `startDrag` on mousedown.
3. **Position & State Persistence**:
   - Saved locally in the Electron user data directory (`ticker-config.json`).
   - Restores window coordinates `(x, y)` and preferences on launch.
   - Prevents spawning off-screen if display configuration changed (bounds validation against active displays with 50 px margin).
   - **Default position**: if no valid saved coordinates exist, the window is placed at the top-right corner of the primary display's work area.
4. **Time & Timezone Logic**:
   - When `useSystemTime: true` (default), `new Date()` is used directly — the host OS clock and timezone apply naturally with no transformation.
   - When `useSystemTime: false`, a frozen `manualTime` epoch value is used as the base.
   - If `timezoneOffsetMinutes` is set (not `undefined`), the base time is converted to UTC then shifted by the offset, overriding the host timezone. When absent, the host timezone applies.
5. **Settings Window**:
   - Created lazily (on first "Settings…" click) and re-focused if already open.
   - Always uses a framed window (`frame: true`) for usability — it needs a title bar / resize handle.
   - Sends a partial `AppConfig` to main via `update-config` IPC handle; main merges, validates, saves, and broadcasts `config-updated` to both the clock and settings renderers.

## 7. Current Milestones & Future Roadmap
- [x] Phase 1: Basic TypeScript + Electron scaffolding.
- [x] Phase 2: Transparent circular window setup for Linux.
- [x] Phase 3: High-precision 3-hand analog clock with monochrome black & white visuals.
- [x] Phase 4: Dragging, right-click context menu, and multiple close mechanisms.
- [x] Phase 5: Build scripts, README, and developer workflow.
- [x] Phase 6: Decouple logic from rendering & complete unit test suite with Vitest.
- [x] Phase 7: Standalone Linux AMD64 ELF binary packaging (`package.js` + GitHub Release automation).
- [x] Phase 8: Settings window — time source (auto/manual), timezone override, window size, position lock.
- [ ] Future Enhancements:
  - Additional platform & OS support (macOS, Windows, Linux ARM64).
  - Resizable gadget via pinch-to-zoom or size slider in settings.
  - Sound effects (subtle optional tick audio toggle).
  - Multiple time zones / digital time sub-display.
  - System tray icon support.
