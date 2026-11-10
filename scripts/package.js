const { packager } = require('@electron/packager');
const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');

const rootDir = path.resolve(__dirname, '..');
const pkg = JSON.parse(fs.readFileSync(path.join(rootDir, 'package.json'), 'utf8'));
const outDir = path.join(rootDir, 'release-builds');

const tagInput = process.argv[2] || process.env.GITHUB_REF_NAME || '';
const version = tagInput.replace(/^v/, '').trim() || pkg.version;

async function packageApp() {
  console.log('[package] Building fresh distribution bundle...');
  execSync('node scripts/build.js', { stdio: 'inherit', cwd: rootDir });

  console.log(`[package] Packaging Ticker v${version} for Linux x64 (AMD64 ELF)...`);
  const appPaths = await packager({
    dir: rootDir,
    out: outDir,
    name: 'ticker',
    executableName: 'ticker',
    platform: 'linux',
    arch: 'x64',
    asar: true,
    overwrite: true,
    prune: true,
    ignore: [
      /^\/\.git($|\/)/,
      /^\/\.github($|\/)/,
      /^\/tests($|\/)/,
      /^\/coverage($|\/)/,
      /^\/release-builds($|\/)/,
      /^\/vitest\.config/,
      /^\/tsconfig.*\.json$/,
    ],
  });

  const packagedDir = appPaths[0];
  const elfBinary = path.join(packagedDir, 'ticker');
  if (!fs.existsSync(elfBinary)) {
    throw new Error(`ELF binary not found at ${elfBinary}`);
  }
  // Ensure executable permissions on the ELF binary
  fs.chmodSync(elfBinary, 0o755);

  console.log(`[package] Packaged successfully at: ${packagedDir}`);
  console.log(`[package] Executable ELF binary verified: ${elfBinary}`);

  const folderName = path.basename(packagedDir);
  const tarVersion = `ticker-v${version}-linux-x64.tar.gz`;
  const tarGeneric = `ticker-linux-x64.tar.gz`;

  console.log(`[package] Creating release archive: ${tarVersion}`);
  execSync(`tar -czf "${path.join(outDir, tarVersion)}" -C "${outDir}" "${folderName}"`, { stdio: 'inherit' });

  console.log(`[package] Copying to generic release archive: ${tarGeneric}`);
  fs.copyFileSync(path.join(outDir, tarVersion), path.join(outDir, tarGeneric));

  console.log(`[package] Packaging complete!`);
}

packageApp().catch((err) => {
  console.error('[package] Packaging failed:', err);
  process.exit(1);
});
