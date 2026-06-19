import { contextBridge, ipcRenderer } from 'electron'

/**
 * Preload script — exposes a safe `electronAPI` bridge to the renderer.
 * No Node.js or Electron APIs are leaked directly to the renderer process.
 */

contextBridge.exposeInMainWorld('electronAPI', {
  /** Returns 'online' or 'offline' based on the app mode */
  getMode: (): Promise<'online' | 'offline'> =>
    ipcRenderer.invoke('get-mode'),

  /** Returns the web app URL configured for online mode */
  getWebUrl: (): Promise<string> => ipcRenderer.invoke('get-web-url'),

  /** Returns the app version string */
  getAppVersion: (): Promise<string> =>
    ipcRenderer.invoke('get-app-version'),

  /** Opens a URL in the system's default external browser */
  openExternal: (url: string): Promise<void> =>
    ipcRenderer.invoke('open-external', url),

  /** Returns the system locale (e.g. 'zh-CN', 'en-US') */
  getLocale: (): Promise<string> => ipcRenderer.invoke('get-locale'),
})