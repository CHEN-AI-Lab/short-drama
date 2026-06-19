/**
 * Build script for the desktop app.
 * Uses esbuild to compile:
 *   1. Main process (src/main.ts -> dist/main.js)
 *   2. Preload script (src/preload.ts -> dist/preload.js)
 *   3. Renderer (src/renderer/index.tsx -> dist/renderer/index.js)
 *   4. Copy renderer HTML/CSS to dist/renderer/
 */

import * as esbuild from 'esbuild'
import * as fs from 'fs'
import * as path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const SRC = path.resolve(__dirname, '..', 'src')
const DIST = path.resolve(__dirname, '..', 'dist')
const isDev = process.argv.includes('--dev')

async function build() {
  // Ensure dist dirs exist
  fs.mkdirSync(path.join(DIST, 'renderer'), { recursive: true })

  // 1. Build main process
  await esbuild.build({
    entryPoints: [path.join(SRC, 'main.ts')],
    outfile: path.join(DIST, 'main.js'),
    bundle: true,
    platform: 'node',
    target: 'node20',
    format: 'cjs',
    external: ['electron', 'electron-updater'],
    minify: !isDev,
    sourcemap: isDev,
  })

  // 2. Build preload script
  await esbuild.build({
    entryPoints: [path.join(SRC, 'preload.ts')],
    outfile: path.join(DIST, 'preload.js'),
    bundle: true,
    platform: 'node',
    target: 'node20',
    format: 'cjs',
    external: ['electron'],
    minify: !isDev,
    sourcemap: isDev,
  })

  // 3. Build renderer (React app)
  await esbuild.build({
    entryPoints: [path.join(SRC, 'renderer', 'index.tsx')],
    outfile: path.join(DIST, 'renderer', 'index.js'),
    bundle: true,
    platform: 'browser',
    target: 'es2020',
    format: 'iife',
    jsx: 'automatic',
    loader: {
      '.tsx': 'tsx',
      '.ts': 'ts',
      '.json': 'json',
    },
    minify: !isDev,
    sourcemap: isDev,
    define: {
      'process.env.NODE_ENV': isDev ? '"development"' : '"production"',
    },
  })

  // 4. Copy HTML and CSS to dist/renderer/
  const htmlSrc = path.join(SRC, 'renderer', 'index.html')
  const htmlDst = path.join(DIST, 'renderer', 'index.html')
  fs.copyFileSync(htmlSrc, htmlDst)

  const cssSrc = path.join(SRC, 'renderer', 'App.css')
  const cssDst = path.join(DIST, 'renderer', 'App.css')
  if (fs.existsSync(cssSrc)) {
    fs.copyFileSync(cssSrc, cssDst)
  }

  console.log(`✓ Build complete -> ${DIST}`)
  console.log(`  main.js:     ${fs.statSync(path.join(DIST, 'main.js')).size} bytes`)
  console.log(`  preload.js:  ${fs.statSync(path.join(DIST, 'preload.js')).size} bytes`)
  console.log(`  renderer/:   ${fs.statSync(path.join(DIST, 'renderer', 'index.js')).size} bytes`)
}

build().catch((err) => {
  console.error('Build failed:', err)
  process.exit(1)
})