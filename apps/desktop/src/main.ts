import {
  app,
  BrowserWindow,
  Menu,
  Tray,
  shell,
  ipcMain,
  nativeImage,
} from 'electron'
import * as path from 'path'
import { autoUpdater } from 'electron-updater'

// ─── Config ────────────────────────────────────────────────
const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged
const WEB_URL =
  process.env.ELECTRON_WEB_URL || 'http://localhost:3000'
const OFFLINE_MODE = process.env.ELECTRON_OFFLINE === 'true'

let mainWindow: BrowserWindow | null = null
let tray: Tray | null = null

// ─── Auto-updater ──────────────────────────────────────────
function setupAutoUpdater() {
  if (isDev) return // skip in dev
  autoUpdater.checkForUpdatesAndNotify()
  setInterval(() => {
    autoUpdater.checkForUpdatesAndNotify()
  }, 1000 * 60 * 60 * 6) // check every 6 hours
}

// ─── App icon (inline 16x16 PNG fallback) ──────────────────
function createAppIcon(): Electron.NativeImage {
  // Minimal 16x16 icon as a fallback; real icon goes in assets/
  const size = 16
  const buf = Buffer.alloc(size * size * 4, 0)
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const idx = (y * size + x) * 4
      const cx = x - size / 2
      const cy = y - size / 2
      const dist = Math.sqrt(cx * cx + cy * cy)
      if (dist < size / 2 - 1) {
        buf[idx] = 99      // R
        buf[idx + 1] = 179 // G
        buf[idx + 2] = 237 // B (light blue tint)
        buf[idx + 3] = 255 // A
      }
    }
  }
  return nativeImage.createFromBuffer(buf, { width: size, height: size })
}

// ─── Window menu ───────────────────────────────────────────
function buildAppMenu() {
  const isMac = process.platform === 'darwin'
  const template: Electron.MenuItemConstructorOptions[] = [
    ...(isMac
      ? [
          {
            label: app.name,
            submenu: [
              { role: 'about' as const },
              { type: 'separator' as const },
              { role: 'services' as const },
              { type: 'separator' as const },
              { role: 'hide' as const },
              { role: 'hideOthers' as const },
              { role: 'unhide' as const },
              { type: 'separator' as const },
              { role: 'quit' as const },
            ],
          } as Electron.MenuItemConstructorOptions,
        ]
      : []),
    {
      label: 'File',
      submenu: [
        {
          label: 'Reload',
          accelerator: 'CmdOrCtrl+R',
          click: () => mainWindow?.webContents.reload(),
        },
        {
          label: 'Toggle DevTools',
          accelerator: 'CmdOrCtrl+Shift+I',
          click: () => mainWindow?.webContents.toggleDevTools(),
        },
        { type: 'separator' },
        isMac ? { role: 'close' } : { role: 'quit' },
      ],
    },
    {
      label: 'Edit',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' },
        { role: 'selectAll' },
      ],
    },
    {
      label: 'View',
      submenu: [
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' },
      ],
    },
    {
      label: 'Window',
      submenu: [
        { role: 'minimize' },
        { role: 'zoom' },
        ...(isMac
          ? [
              { type: 'separator' },
              { role: 'front' },
              { type: 'separator' },
              { role: 'window' },
            ]
          : [{ role: 'close' }]),
      ],
    },
  ]
  const menu = Menu.buildFromTemplate(template)
  Menu.setApplicationMenu(menu)
}

// ─── System tray ───────────────────────────────────────────
function setupTray() {
  const icon = createAppIcon()
  tray = new Tray(icon)
  tray.setToolTip('Short Drama Studio')
  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Show Window',
      click: () => {
        mainWindow?.show()
        mainWindow?.focus()
      },
    },
    { type: 'separator' },
    {
      label: 'Quit',
      click: () => {
        app.isQuitting = true
        app.quit()
      },
    },
  ])
  tray.setContextMenu(contextMenu)
  tray.on('double-click', () => {
    mainWindow?.show()
    mainWindow?.focus()
  })
}

// ─── Create main window ────────────────────────────────────
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    title: 'Short Drama Studio',
    icon: path.join(__dirname, '..', 'assets', 'icon.png'),
    show: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
  })

  if (OFFLINE_MODE) {
    // Offline mode: load the bundled renderer
    const rendererPath = path.join(__dirname, 'renderer', 'index.html')
    mainWindow.loadFile(rendererPath)
  } else {
    // Online mode: load the web app URL (Next.js dev or production)
    mainWindow.loadURL(WEB_URL)
  }

  mainWindow.once('ready-to-show', () => {
    mainWindow?.show()
  })

  mainWindow.on('closed', () => {
    mainWindow = null
  })

  // Open external links in the default browser
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('http:') || url.startsWith('https:')) {
      shell.openExternal(url)
    }
    return { action: 'deny' }
  })

  mainWindow.webContents.on('will-navigate', (event, url) => {
    // Allow navigating within the web app URL only
    if (!OFFLINE_MODE && !url.startsWith(WEB_URL)) {
      event.preventDefault()
      shell.openExternal(url)
    }
  })
}

// ─── IPC handlers ──────────────────────────────────────────
function setupIPC() {
  ipcMain.handle('get-mode', () => (OFFLINE_MODE ? 'offline' : 'online'))
  ipcMain.handle('get-web-url', () => WEB_URL)
  ipcMain.handle('get-app-version', () => app.getVersion())
  ipcMain.handle('open-external', (_event, url: string) => {
    if (typeof url === 'string' && (url.startsWith('http:') || url.startsWith('https:'))) {
      shell.openExternal(url)
    }
  })
  ipcMain.handle('get-locale', () => app.getLocale())
}

// ─── App lifecycle ─────────────────────────────────────────
app.whenReady().then(() => {
  buildAppMenu()
  setupIPC()
  setupAutoUpdater()
  createWindow()

  // Only setup tray in production to avoid clutter in dev
  if (!isDev) {
    setupTray()
  }

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('before-quit', () => {
  app.isQuitting = true
})