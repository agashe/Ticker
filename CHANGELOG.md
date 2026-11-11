# Changelog

All notable user-facing feature additions, enhancements, and changes to **Ticker** are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]

### Planned Features
- Pre-compiled standalone executable binaries and packages for additional platforms and operating systems (macOS, Windows, and Linux ARM64).
- Scale slider or keyboard-based resize controls to adjust clock size.
- Subtle analog tick sound effect toggle.
- Digital time display and multi-timezone support.
- System tray icon with quick toggle menu.

---

## [0.2.0] - 2026-11-11

### Settings Window

A new **Settings** panel is now accessible via right-click → **Settings…** This replaces the previously removed *Center Clock* menu entry and provides a dedicated, persistent settings interface.

#### Time Configuration
- **Automatic system time** (default): The clock automatically syncs to the host machine's current time and timezone — no configuration required.
- **Manual time**: Uncheck *Use system time* to freeze the clock at a custom date and time of your choice.
- **Timezone override**: Optionally enter a UTC offset in minutes (e.g. `+240` for UTC+4, `−300` for UTC−5) to display a foreign timezone while keeping the clock running live. Leave blank to use the system timezone.

#### Window Configuration
- **Custom size**: Set the clock window width and height anywhere from **80 px to 800 px**. The default is 240 × 240 px.
- **Lock position**: Enable to disable drag-and-drop, keeping the clock anchored in place.

### Context Menu Changes
- Added **Settings…** entry to the right-click context menu.
- Removed **Center Clock** entry.

### Default Position
- When no saved position exists (e.g. first launch or display configuration change), the clock now defaults to the **top-right corner** of the primary display's work area instead of the screen center.

### Position Lock
- When *Lock position* is enabled in Settings, clicking and dragging on the clock face is completely disabled.

---

## [0.1.0] - 2026-11-10

### Initial Release

#### Packaging & Platform Distribution
- **Standalone Executable Linux Package (ELF AMD64)**: Packaged distribution archive (`ticker-*-linux-x64.tar.gz`) containing the native ELF 64-bit executable binary (`ticker`), allowing users to run Ticker out-of-the-box without requiring Node.js or npm.
- **Platform Scope**: Initial release targets 64-bit Linux AMD64 (x86_64). Support for other platforms and operating systems (macOS, Windows, and Linux ARM64) is scheduled for future releases.

#### Gadget Form & Aesthetics
- **Frameless Circular Form Factor**: Seamless transparent window where only the circular clock dial floats directly on your desktop.
- **Classic 3-Hand Analog Movement**: Distinct hour, minute, and second hands.
- **Smooth 60fps Sweep Second Hand**: Continuous needle sweep movement driven by high-frequency animation frames.
- **High-Contrast Monochrome Themes**:
  - **Light Mode** (default): Crisp white dial with sharp black markers and hands.
  - **Dark Mode**: Deep black dial with bright white markers and hands.
- **Vector Dial**: Pin-sharp vector SVG rendering that stays crisp across all display scale factors and HiDPI monitors.

#### Desktop Integration & Controls
- **Freehand Dragging**: Click and drag from anywhere on the clock surface to reposition it freely on your screen.
- **Position Persistence**: Automatically remembers and restores window coordinates across application restarts.
- **Display Boundary Safety**: Automatically detects disconnected displays or resolution changes on launch, centering the gadget if previously saved coordinates fall outside visible screen boundaries.
- **Always on Top**: Keeps the clock floating above open applications, toggleable on demand.
- **Native Context Menu**: Right-click anywhere on the clock to access controls:
  - Toggle *Always on Top*
  - Switch between *Light* and *Dark* themes
  - *Close Ticker*
- **Hover Close Button**: A subtle `×` button appears when hovering near the top-right of the dial for quick mouse exits.
- **Keyboard Shortcuts**: Exit immediately at any time by pressing `Escape`, `Ctrl + Q`, or `Ctrl + W` (and `Cmd + Q` / `Cmd + W` on macOS).
