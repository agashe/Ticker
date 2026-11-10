# Changelog

All notable user-facing feature additions, enhancements, and changes to **Ticker** are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]

### Planned Features
- Scale slider or keyboard-based resize controls to adjust clock size.
- Subtle analog tick sound effect toggle.
- Digital time display and multi-timezone support.
- System tray icon with quick toggle menu.

---

## [0.1.0] - 2026-11-10

### Initial Release

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
  - *Center Clock* to quickly reset position
  - *Close Ticker*
- **Hover Close Button**: A subtle `×` button appears when hovering near the top-right of the dial for quick mouse exits.
- **Keyboard Shortcuts**: Exit immediately at any time by pressing `Escape`, `Ctrl + Q`, or `Ctrl + W` (and `Cmd + Q` / `Cmd + W` on macOS).
