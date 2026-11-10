# Ticker

A minimalist, transparent desktop clock gadget built with **TypeScript** and **Electron**. Ticker floats cleanly on your desktop with no window frame or rectangular background—just a crisp circular analog clock with smooth, real-time 3-hand movement.



## Features

- **Frameless Circular Gadget**: Seamlessly transparent window—only the circular clock dial floats on your desktop.
- **Classic 3-Hand Movement**: Hour hand, minute hand, and a continuous 60fps sweep second hand.
- **Monochrome Design**: High-contrast, clean black and white aesthetic.
  - **Light Mode** (default): Crisp white dial with dark tick marks and hands.
  - **Dark Mode**: Deep black dial with bright white tick marks and hands.
- **Desktop Friendly**:
  - **Draggable**: Click and drag from anywhere on the clock to position it.
  - **Position Memory**: Remembers its screen location across restarts.
  - **Always on Top**: Kept in view while you work (toggleable via menu).
- **Multiple Ways to Close & Control**:
  - **Right-Click Context Menu**: Access options to toggle *Always on Top*, switch *Theme*, *Center Clock*, or *Close*.
  - **Hover Close Button**: A subtle `×` button appears when hovering over the top of the clock.
  - **Keyboard Shortcuts**: Press `Esc`, `Ctrl+Q`, or `Ctrl+W` anytime to exit.



## Prerequisites

- **Node.js**: `v18.0.0` or newer (tested on Node v24).
- **Linux**: X11 or Wayland with compositing enabled (e.g. GNOME, KDE, XFCE + Picom) for transparent window rendering.



## Getting Started

### 1. Installation

Clone the repository and install dependencies:

```bash
git clone https://github.com/agashe/Ticker.git
cd Ticker
npm install
```

### 2. Running the Clock

To build and launch the gadget:

```bash
# Build TypeScript and launch Electron
npm run build
npm start
```

Or run in development mode with hot rebuilds:

```bash
npm run dev
```

### 3. Available Scripts

| Command | Description |
| : | : |
| `npm run build` | Compiles TypeScript and packages assets to `dist/` |
| `npm run watch` | Watches for file changes and rebuilds on save |
| `npm start` | Launches the compiled Electron application |
| `npm run dev` | Runs the build in watch mode and launches Electron |
| `npm run typecheck` | Type-checks all TypeScript files (`tsc -p tsconfig.test.json --noEmit`) |
| `npm test` | Runs the full Vitest unit test suite |
| `npm run test:watch` | Runs Vitest in interactive watch mode |
| `npm run test:coverage` | Runs Vitest with v8 code coverage reporting |



## Controls & Shortcuts

| Action | Control |
| : | : |
| **Move Clock** | Click & drag anywhere on the clock |
| **Open Menu** | Right-click anywhere on the clock |
| **Quick Close** | Press `Esc`, `Ctrl + Q`, or `Ctrl + W` |
| **Hover Close** | Hover near the top-right of the clock to reveal the `×` button |
| **Toggle Always on Top** | Right-click → check/uncheck *Always on Top* |
| **Switch Theme** | Right-click → *Theme* → *Light* or *Dark* |
| **Reset Position** | Right-click → *Center Clock* |



## Project Structure

```text
Ticker/
├── scripts/
│   ├── build.js          # Fast esbuild compilation and asset synchronization
│   └── dev.js            # Live development runner
├── src/
│   ├── types/
│   │   └── electron.d.ts # TypeScript interfaces for IPC bridge and config
│   ├── main/
│   │   ├── main.ts       # Electron main process & transparent window lifecycle
│   │   ├── window-math.ts# Pure window bounds checking, display math & config normalization
│   │   ├── config.ts     # Settings persistence (position, theme, alwaysOnTop)
│   │   └── menu.ts       # Native right-click context menu and template builder
│   ├── preload/
│   │   └── preload.ts    # Secure contextBridge API for renderer
│   └── renderer/
│       ├── index.html    # Clock DOM mount point
│       ├── styles.css    # Transparent layout, monochrome themes, animations
│       ├── clock-math.ts # Pure angle math, continuous sweep logic & dial geometry
│       ├── clock.ts      # Vector SVG dial generation & animation frame loop
│       ├── event-helpers.ts # Pure shortcut detection, theme classes & drag guards
│       └── renderer.ts   # Mouse drag, context menu, and keyboard handling
├── tests/
│   ├── clock-math.test.ts   # Unit tests for clock angles, sweep & tick trigonometry
│   ├── window-math.test.ts  # Unit tests for multi-display bounds, normalization & drag
│   ├── event-helpers.test.ts# Unit tests for shortcuts, theme resolution & drag triggers
│   ├── menu.test.ts         # Unit tests for context menu template & BrowserWindow integration
│   └── config.test.ts       # Unit tests for config loading, fallback defaults & save
├── vitest.config.mts     # Vitest configuration with v8 coverage
├── CHANGELOG.md          # User-facing application feature release log
├── SPECS.md              # Technical specifications & architectural decisions
├── tsconfig.json
├── tsconfig.test.json
└── package.json
```



## License

Ticker is licensed under the MIT License.
