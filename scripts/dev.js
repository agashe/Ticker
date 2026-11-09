const { spawn } = require('child_process');
const path = require('path');

// Run build in watch mode
const buildProcess = spawn('node', [path.join(__dirname, 'build.js'), '--watch'], {
  stdio: 'inherit'
});

// Wait briefly for initial build, then start electron
setTimeout(() => {
  const electronBin = require('electron');
  const electronProcess = spawn(electronBin, ['.'], {
    stdio: 'inherit',
    cwd: path.join(__dirname, '..')
  });

  electronProcess.on('close', (code) => {
    buildProcess.kill();
    process.exit(code || 0);
  });
}, 800);
