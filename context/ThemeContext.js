import { createContext, useContext, useEffect, useState, useCallback } from 'react'

/**
 * Theme preference: 'system' (default), 'light' or 'dark'.
 *
 * The class is applied before paint by the bootstrap script in _document.js —
 * this context only keeps React in sync with it and handles changes. Keep the
 * storage key and the resolution rules identical in both places or the page
 * will flash on load.
 */

const STORAGE_KEY = 'theme'
const ThemeContext = createContext({ theme: 'system', resolvedTheme: 'light', setTheme: () => {} })

const prefersDark = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches

const resolve = (theme) => (theme === 'system' ? (prefersDark() ? 'dark' : 'light') : theme)

function applyTheme(resolved) {
  if (typeof document === 'undefined') return
  document.documentElement.classList.toggle('dark', resolved === 'dark')
  document.documentElement.style.colorScheme = resolved
}

export function ThemeProvider({ children }) {
  // Start at 'system' on both server and client so hydration matches; the real
  // preference is read in the effect below.
  const [theme, setThemeState] = useState('system')
  const [resolvedTheme, setResolvedTheme] = useState('light')

  useEffect(() => {
    let stored = 'system'
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw === 'light' || raw === 'dark' || raw === 'system') stored = raw
    } catch {
      /* private mode */
    }
    setThemeState(stored)
    const next = resolve(stored)
    setResolvedTheme(next)
    applyTheme(next)
  }, [])

  // Follow the OS while the preference is 'system'.
  useEffect(() => {
    if (theme !== 'system' || typeof window === 'undefined') return
    const media = window.matchMedia('(prefers-color-scheme: dark)')
    const handleChange = () => {
      const next = media.matches ? 'dark' : 'light'
      setResolvedTheme(next)
      applyTheme(next)
    }
    media.addEventListener('change', handleChange)
    return () => media.removeEventListener('change', handleChange)
  }, [theme])

  const setTheme = useCallback((next) => {
    setThemeState(next)
    try {
      localStorage.setItem(STORAGE_KEY, next)
    } catch {
      /* private mode */
    }
    const resolvedNext = resolve(next)
    setResolvedTheme(resolvedNext)
    applyTheme(resolvedNext)
  }, [])

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => useContext(ThemeContext)
