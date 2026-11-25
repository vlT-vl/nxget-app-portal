import React from 'react'
import ReactDOM from 'react-dom/client'
import './css/fonts.css'
import './css/index.css'
import App from './components/App.jsx'
import { DataProvider } from './components/DataContext.jsx'
import { applyTheme, getThemePreference, watchSystemTheme } from './lib/theme.js'
import { LanguageProvider } from './lib/uiText.js'
import './css/motion.css'

applyTheme()
watchSystemTheme(() => {
  if (getThemePreference() === 'system') applyTheme('system')
})

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <DataProvider>
      <LanguageProvider>
        <App />
      </LanguageProvider>
    </DataProvider>
  </React.StrictMode>
)
