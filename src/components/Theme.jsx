import { useEffect, useState } from 'react'
import { FiSun, FiMoon } from 'react-icons/fi'
import { getThemePreference, resolveTheme, toggleTheme, watchSystemTheme } from '../lib/theme.js'
import { useLang } from '../lib/uiText.js'
import '../css/theme.css'

const Theme = ({ className = '' }) => {
  const { t } = useLang()
  const [theme, setTheme] = useState(() => resolveTheme(getThemePreference()))

  useEffect(() => {
    return watchSystemTheme(systemTheme => {
      if (getThemePreference() === 'system') setTheme(systemTheme)
    })
  }, [])

  const handleToggle = () => {
    const { theme: resolved } = toggleTheme(getThemePreference())
    setTheme(resolved)
  }

  return (
    <button
      className={`theme-toggle${className ? ` ${className}` : ''}`}
      onClick={handleToggle}
      aria-label={theme === 'dark' ? t('theme.switchToLight') : t('theme.switchToDark')}
      title={theme === 'dark' ? t('theme.light') : t('theme.dark')}
    >
      {theme === 'dark' ? <FiSun /> : <FiMoon />}
    </button>
  )
}

export default Theme
