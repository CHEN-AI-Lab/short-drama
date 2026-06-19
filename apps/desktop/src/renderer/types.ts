/**
 * Type declarations for the Electron preload bridge exposed via contextBridge.
 */
export interface ElectronAPI {
  getMode: () => Promise<'online' | 'offline'>
  getWebUrl: () => Promise<string>
  getAppVersion: () => Promise<string>
  openExternal: (url: string) => Promise<void>
  getLocale: () => Promise<string>
}

declare global {
  interface Window {
    electronAPI?: ElectronAPI
  }
}