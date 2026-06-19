/**
 * Dev script for the desktop app.
 * 1. Builds everything with esbuild (development mode)
 * 2. Launches Electron with the built output
 */

import { spawn } from 'child_process'
import * as path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DIST = path.resolve(__dirname, '..', 'dist')

// First build
console.log('🔨 Building desktop app (dev)...')
const buildProc = spawn('node', [path.resolve(__dirname, 'build.mjs'), '--dev'], {
  stdio: 'inherit',
  shell: true,
  cwd: path.resolve(__dirname, '..'),
})

buildProc.on('close', (code) => {
  if (code !== 0) {
    console.error('❌ Build failed')
    process.exit(1)
  }

  console.log('🚀 Launching Electron...')
  const electronPath = path.resolve(__dirname, '..', 'node_modules', '.bin', 'electron')
  const electron = spawn(
    electronPath,
    [DIST],
    {
      stdio: 'inherit',
      shell: true,
      cwd: path.resolve(__dirname, '..'),
      env: {
        ...process.env,
        NODE_ENV: 'development',
      },
    }
  )

  electron.on('close', (exitCode) => {
    process.exit(exitCode ?? 0)
  })

  electron.on('error', (err) => {
    console.error('❌ Failed to launch Electron:', err.message)
    process.exit(1)
  })
})