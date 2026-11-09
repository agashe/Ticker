const esbuild = require('esbuild');
const fs = require('fs');
const path = require('path');

const isWatch = process.argv.includes('--watch');

function copyStaticFiles() {
  const distRenderer = path.join(__dirname, '../dist/renderer');
  if (!fs.existsSync(distRenderer)) {
    fs.mkdirSync(distRenderer, { recursive: true });
  }

  const files = ['index.html', 'styles.css'];
  for (const file of files) {
    const srcPath = path.join(__dirname, '../src/renderer', file);
    const destPath = path.join(distRenderer, file);
    if (fs.existsSync(srcPath)) {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

async function runBuild() {
  try {
    copyStaticFiles();

    const mainOptions = {
      entryPoints: [path.join(__dirname, '../src/main/main.ts')],
      outfile: path.join(__dirname, '../dist/main/main.js'),
      bundle: true,
      platform: 'node',
      target: 'node20',
      external: ['electron'],
      sourcemap: true
    };

    const preloadOptions = {
      entryPoints: [path.join(__dirname, '../src/preload/preload.ts')],
      outfile: path.join(__dirname, '../dist/preload/preload.js'),
      bundle: true,
      platform: 'node',
      target: 'node20',
      external: ['electron'],
      sourcemap: true
    };

    const rendererOptions = {
      entryPoints: [path.join(__dirname, '../src/renderer/renderer.ts')],
      outfile: path.join(__dirname, '../dist/renderer/renderer.js'),
      bundle: true,
      platform: 'browser',
      target: 'es2022',
      sourcemap: true
    };

    if (isWatch) {
      const [ctxMain, ctxPreload, ctxRenderer] = await Promise.all([
        esbuild.context(mainOptions),
        esbuild.context(preloadOptions),
        esbuild.context(rendererOptions)
      ]);

      await Promise.all([
        ctxMain.watch(),
        ctxPreload.watch(),
        ctxRenderer.watch()
      ]);

      // Watch static assets
      fs.watch(path.join(__dirname, '../src/renderer'), (eventType, filename) => {
        if (filename === 'index.html' || filename === 'styles.css') {
          copyStaticFiles();
          console.log(`[static] updated ${filename}`);
        }
      });

      console.log('[build] Watching for changes...');
    } else {
      await Promise.all([
        esbuild.build(mainOptions),
        esbuild.build(preloadOptions),
        esbuild.build(rendererOptions)
      ]);
      console.log('[build] Build completed successfully.');
    }
  } catch (err) {
    console.error('[build] Build failed:', err);
    process.exit(1);
  }
}

runBuild();
