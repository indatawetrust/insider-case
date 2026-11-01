import { beforeEach, describe, expect, it } from 'vitest'
import { STORAGE_KEYS } from '@/utils/storage'
import { useTheme } from '../useTheme'

describe('useTheme composable', () => {
  beforeEach(() => {
    localStorage.clear()
    document.documentElement.classList.remove('dark')
    document.documentElement.removeAttribute('data-theme')
  })

  it('defaults to system mode and updates when setTheme is called', () => {
    const { themeMode, setTheme, isDark } = useTheme()
    expect(themeMode.value).toBe('system')

    setTheme('dark')
    expect(themeMode.value).toBe('dark')
    expect(isDark.value).toBe(true)
    expect(document.documentElement.classList.contains('dark')).toBe(true)
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark')
    expect(localStorage.getItem(STORAGE_KEYS.THEME)).toBe('"dark"')

    setTheme('light')
    expect(themeMode.value).toBe('light')
    expect(isDark.value).toBe(false)
    expect(document.documentElement.classList.contains('dark')).toBe(false)
    expect(document.documentElement.getAttribute('data-theme')).toBe('light')
    expect(localStorage.getItem(STORAGE_KEYS.THEME)).toBe('"light"')
  })

  it('toggles theme between dark and light', () => {
    const { setTheme, toggleTheme, isDark } = useTheme()
    setTheme('light')
    expect(isDark.value).toBe(false)

    toggleTheme()
    expect(isDark.value).toBe(true)
    expect(document.documentElement.classList.contains('dark')).toBe(true)

    toggleTheme()
    expect(isDark.value).toBe(false)
    expect(document.documentElement.classList.contains('dark')).toBe(false)
  })
})
