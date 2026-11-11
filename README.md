# Ticker

A minimalist, transparent desktop clock gadget built with **TypeScript** and **Electron**. Ticker floats cleanly on your desktop with no window frame or rectangular background — just a crisp circular analog clock with smooth, real-time 3-hand movement.



## Features

- **Frameless Circular Gadget**: Seamlessly transparent window — only the circular clock dial floats on your desktop. Falls back to a standard framed window on DEs/WMs that do not support transparency.
- **Classic 3-Hand Movement**: Hour hand, minute hand, and a continuous 60fps sweep second hand.
- **Monochrome Design**: High-contrast, clean black and white aesthetic.
  - **Light Mode** (default): Crisp white dial with dark tick marks and hands.
  - **Dark Mode**: Deep black dial with bright white tick marks and hands.
- **Desktop Friendly**:
  - **Draggable**: Click and drag from anywhere on the clock to position it.
  - **Position Memory**: Remembers its screen location across restarts.
  - **Default Position**: Placed in the top-right corner of your primary display on first launch.
  - **Always on Top**: Kept in view while you work (toggleable via menu).
- **Settings Panel** (right-click → Settings…):
  - **Automatic Time & Timezone**: Syncs to your host machine's clock and timezone by default.
  - **Manual Time**: Freeze the clock at any custom date and time.
  - **Timezone Override**: Pin the clock to any UTC offset (e.g. `+240` for UTC+4).
  - **Custom Size**: Resize the clock window from 80 px to 800 px.
  - **Lock Position**: Disable drag-and-drop to anchor the clock in place.
- **Multiple Ways to Close & Control**:
  - **Right-Click Context Menu**: Toggle *Always on Top*, switch *Theme*, open *Settings*, or *Close*.
  - **Hover Close Button**: A subtle `×` button appears when hovering over the top of the clock.
  - **Keyboard Shortcuts**: Press `Esc`, `Ctrl+Q`, or `Ctrl+W` anytime to exit.



## Prerequisites

- **Node.js**: `v18.0.0` or newer.
- **Linux**: X11 or Wayland with compositing enabled (e.g. GNOME, KDE, XFCE + Picom) for transparent window rendering.



## Getting Started

### 1. Download Pre-built Binary (Linux AMD64)

For users who want to run Ticker without building from source or installing Node.js:

1. Download the latest release archive (`ticker-v*-linux-x64.tar.gz`) from [Releases](https://github.com/agashe/Ticker/releases).
2. Extract the archive:
   ```bash
   tar -xzf ticker-*-linux-x64.tar.gz
   cd ticker-linux-x64
   ```
3. Run the executable ELF binary directly:
   ```bash
   ./ticker
   ```

> [!NOTE]
> **Platform Availability**: Pre-compiled standalone executable ELF binaries are primarily provided for **Linux AMD64 (x86_64)**. Support and packages for other platforms and operating systems (macOS, Windows, and Linux ARM64) will be added in upcoming releases.

### 2. Quick Start from Source

To clone, build, and run Ticker directly:

```bash
git clone https://github.com/agashe/Ticker.git
cd Ticker
npm install
npm run build
npm start
```

For live development with hot rebuilds:

```bash
npm run dev
```

### 3. Manual Installation on Linux

To install Ticker permanently under your user's home directory and launch it from anywhere via your terminal:

#### Step 1: Install to `~/.local/share/ticker`

```bash
mkdir -p ~/.local/share
git clone https://github.com/agashe/Ticker.git ~/.local/share/ticker
cd ~/.local/share/ticker
npm install
npm run build
```

#### Step 2: Configure your Shell

Choose your active shell below to add the `ticker` command:

##### Bash (`~/.bashrc`)

```bash
echo 'alias ticker="cd ~/.local/share/ticker && npm start --silent &"' >> ~/.bashrc
source ~/.bashrc
```

##### Zsh (`~/.zshrc`)

```zsh
echo 'alias ticker="cd ~/.local/share/ticker && npm start --silent &"' >> ~/.zshrc
source ~/.zshrc
```

##### Fish Shell (`~/.config/fish/config.fish`)

```fish
# Option A: Save persistent alias
alias -s ticker="cd ~/.local/share/ticker; and npm start --silent &"

# Option B: Or create a fish function in ~/.config/fish/functions/ticker.fish
function ticker --description 'Launch Ticker clock gadget'
    builtin cd ~/.local/share/ticker; and npm start --silent &
end
```

##### Universal Launcher Script (`~/.local/bin/ticker`)

```bash
mkdir -p ~/.local/bin
cat << 'EOF' > ~/.local/bin/ticker
#!/usr/bin/env bash
cd "$HOME/.local/share/ticker" && npm start --silent "$@" &
EOF
chmod +x ~/.local/bin/ticker
```

If `~/.local/bin` is not yet in your PATH, add:
- **Bash / Zsh**: `export PATH="$HOME/.local/bin:$PATH"`
- **Fish**: `fish_add_path ~/.local/bin`

### 4. Available Scripts

| Command | Description |
| :--- | :--- |
| `npm run build` | Compiles TypeScript and packages assets to `dist/` |
| `npm run watch` | Watches for file changes and rebuilds on save |
| `npm start` | Launches the compiled Electron application |
| `npm run dev` | Runs the build in watch mode and launches Electron |
| `npm run package:linux` | Packages the standalone Linux ELF executable (AMD64) into `release-builds/` |
| `npm run typecheck` | Type-checks all TypeScript files (`tsc -p tsconfig.test.json --noEmit`) |
| `npm test` | Runs the full Vitest unit test suite |
| `npm run test:watch` | Runs Vitest in interactive watch mode |
| `npm run test:coverage` | Runs Vitest with v8 code coverage reporting |



## Controls & Shortcuts

| Action | Control |
| :--- | :--- |
| **Move Clock** | Click & drag anywhere on the clock (unless position is locked) |
| **Open Menu** | Right-click anywhere on the clock |
| **Open Settings** | Right-click → *Settings…* |
| **Quick Close** | Press `Esc`, `Ctrl + Q`, or `Ctrl + W` |
| **Hover Close** | Hover near the top-right of the clock to reveal the `×` button |
| **Toggle Always on Top** | Right-click → check/uncheck *Always on Top* |
| **Switch Theme** | Right-click → *Theme* → *Light* or *Dark* |



## Settings

Open the Settings panel via right-click → **Settings…**

| Setting | Description |
| :--- | :--- |
| **Use system time & timezone** | When checked (default), the clock automatically syncs to your machine's current time and timezone. |
| **Manual time** | Visible when system time is off. Set a custom date & time to freeze the clock. |
| **Timezone offset (minutes)** | Override the timezone by entering a UTC offset in minutes. Leave blank to use the system timezone. E.g. `+240` for UTC+4, `-300` for UTC-5. |
| **Width / Height (px)** | Resize the clock window. Valid range: 80 – 800 px. Default: 240 × 240 px. |
| **Lock position** | When checked, drag-and-drop is disabled and the clock stays exactly where it is. |



## License

Ticker is licensed under the MIT License.
