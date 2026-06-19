import React, { useState, useEffect } from 'react'
import { useLocale } from '../hooks/useLocale.tsx'
import type { Locale } from 'shared'

type Theme = 'light' | 'dark'

const THEME_KEY = 'short_drama_theme'

export default function SettingsPage() {
  const { t, locale, setLocale } = useLocale()
  const [theme, setThemeState] = useState<Theme>('light')
  const [appVersion, setAppVersion] = useState<string>('')

  useEffect(() => {
    // Load theme
    const stored = localStorage.getItem(THEME_KEY) as Theme | null
    if (stored === 'dark' || stored === 'light') {
      setThemeState(stored)
      document.documentElement.setAttribute('data-theme', stored)
    }

    // Get app version from Electron
    if (window.electronAPI) {
      window.electronAPI.getAppVersion().then(setAppVersion).catch(() => {})
    }
  }, [])

  const handleThemeToggle = () => {
    const next: Theme = theme === 'light' ? 'dark' : 'light'
    setThemeState(next)
    try {
      localStorage.setItem(THEME_KEY, next)
    } catch {
      /* ignore */
    }
    document.documentElement.setAttribute('data-theme', next)
  }

  const handleLocaleChange = (l: Locale) => {
    setLocale(l)
  }

  return (
    <div className="settings-page">
      <h2>{t('common.switchLanguage')}</h2>

      {/* Language */}
      <section className="settings-section">
        <h3>{t('common.switchLanguage')}</h3>
        <div className="settings-options">
          <button
            className={`option-pill ${locale === 'en' ? 'selected' : ''}`}
            onClick={() => handleLocaleChange('en')}
          >
            🇬🇧 English
          </button>
          <button
            className={`option-pill ${locale === 'zh-CN' ? 'selected' : ''}`}
            onClick={() => handleLocaleChange('zh-CN')}
          >
            🇨🇳 中文
          </button>
        </div>
      </section>

      {/* Theme */}
      <section className="settings-section">
        <h3>{theme === 'light' ? t('common.darkMode') : t('common.lightMode')}</h3>
        <div className="settings-options">
          <button className="option-pill" onClick={handleThemeToggle}>
            {theme === 'light' ? '🌙 ' + t('common.darkMode') : '☀️ ' + t('common.lightMode')}
          </button>
        </div>
      </section>

      {/* About */}
      <section className="settings-section about-section">
        <h3>{locale === 'zh-CN' ? '关于' : 'About'}</h3>
        <div className="about-info">
          <p><strong>Short Drama Studio</strong></p>
          {appVersion && <p>v{appVersion}</p>}
          <p>{t('common.tagline')}</p>
          <p className="about-copyright">&copy; {new Date().getFullYear()} {t('common.allRights')}</p>
        </div>
      </section>

      {/* Offline notice */}
      <section className="settings-section">
        <h3>{locale === 'zh-CN' ? '模式' : 'Mode'}</h3>
        <p className="mode-notice">
          {locale === 'zh-CN'
            ? '当前为离线模式，所有功能本地运行。'
            : 'Currently in offline mode. All features run locally.'}
        </p>
      </section>
    </div>
  )
}