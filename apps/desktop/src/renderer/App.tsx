import React from 'react'
import { HashRouter, Routes, Route } from 'react-router-dom'
import NavBar from './components/NavBar'
import HomePage from './pages/HomePage'
import HistoryPage from './pages/HistoryPage'
import SettingsPage from './pages/SettingsPage'
import { LocaleProvider } from '../contexts/useLocale.tsx'

export default function App() {
  return (
    <LocaleProvider>
      <HashRouter>
        <div className="app-container">
          <NavBar />
          <main className="app-main">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/history" element={<HistoryPage />} />
              <Route path="/settings" element={<SettingsPage />} />
            </Routes>
          </main>
        </div>
      </HashRouter>
    </LocaleProvider>
  )
}