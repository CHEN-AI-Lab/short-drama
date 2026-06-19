import React from 'react'
import { useLocale } from '../hooks/useLocale.tsx'
import { NavLink } from 'react-router-dom'
import type { Locale } from 'shared'

export default function NavBar() {
  const { t, locale, setLocale } = useLocale()

  const toggleLocale = () => {
    setLocale(locale === 'en' ? 'zh-CN' : 'en')
  }

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <span className="navbar-brand">Short Drama Studio</span>
        <div className="navbar-links">
          <NavLink to="/" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
            {t('common.navGenerate')}
          </NavLink>
          <NavLink to="/history" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
            {t('common.navHistory')}
          </NavLink>
        </div>
      </div>
      <div className="navbar-right">
        <NavLink to="/settings" className="nav-icon-btn" title={t('common.switchLanguage')}>
          <span role="img" aria-label="settings">⚙️</span>
        </NavLink>
        <button className="nav-icon-btn locale-toggle" onClick={toggleLocale} title={t('common.switchLanguage')}>
          {locale === 'en' ? 'EN' : '中文'}
        </button>
      </div>
    </nav>
  )
}