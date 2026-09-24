// theme.js — theme preference (system/light/dark) management, persisted in localStorage.
// Applies data-theme on the <html> element; the CSS in css/index.css reads that attribute
// to resolve the --bg/--text/etc. variables. No native runtime dependency (pure web).

const STORAGE_KEY = 'vlt-theme'
const THEMES = new Set(['system', 'light', 'dark'])

const normalizeTheme = value => (value === 'dark' || value === 'light' ? value : null)

export function getSystemTheme() {
  if (typeof window === 'undefined' || !window.matchMedia) return 'dark'
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export function getThemePreference() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (THEMES.has(saved)) return saved
  } catch {
    // localStorage unavailable (privacy mode, etc.): fall back to system.
  }
  return 'system'
}

export function resolveTheme(preference = getThemePreference()) {
  return normalizeTheme(preference) ?? getSystemTheme()
}

export function applyTheme(preference = getThemePreference()) {
  const normalized = THEMES.has(preference) ? preference : 'system'
  const resolved = normalizeTheme(normalized) ?? getSystemTheme()
  const root = document.documentElement
  root.dataset.theme = resolved
  root.dataset.themePreference = normalized
  root.style.colorScheme = resolved
  return { preference: normalized, theme: resolved }
}

export function setThemePreference(preference) {
  const normalized = THEMES.has(preference) ? preference : 'system'
  try {
    localStorage.setItem(STORAGE_KEY, normalized)
  } catch {
    // The attribute on the document is still updated below regardless.
  }
  return applyTheme(normalized)
}

export function toggleTheme(current = getThemePreference()) {
  const resolved = resolveTheme(current)
  return setThemePreference(resolved === 'dark' ? 'light' : 'dark')
}

export function watchSystemTheme(callback) {
  if (typeof window === 'undefined' || !window.matchMedia) return () => {}
  const query = window.matchMedia('(prefers-color-scheme: dark)')
  const listener = () => callback(getSystemTheme())
  if (query.addEventListener) {
    query.addEventListener('change', listener)
  } else {
    query.addListener?.(listener)
  }
  return () => {
    if (query.removeEventListener) {
      query.removeEventListener('change', listener)
    } else {
      query.removeListener?.(listener)
    }
  }
}
