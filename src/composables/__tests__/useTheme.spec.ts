import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { defineComponent } from 'vue'
import { STORAGE_KEYS } from '@/utils/storage'
import { _resetTheme, useTheme } from '../useTheme'

const ThemeTestComponent = defineComponent({
  setup() {
    return useTheme()
  },
  template: '<div />',
})

describe('useTheme composable', () => {
  let originalMatchMedia: typeof window.matchMedia

  beforeEach(() => {
    localStorage.clear()
    document.documentElement.classList.remove('dark')
    document.documentElement.removeAttribute('data-theme')
    _resetTheme()
    originalMatchMedia = window.matchMedia
  })

  afterEach(() => {
    window.matchMedia = originalMatchMedia
    vi.restoreAllMocks()
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

  it('restores stored dark theme mode on initialization', () => {
    localStorage.setItem(STORAGE_KEYS.THEME, '"dark"')
    const { themeMode, isDark } = useTheme()
    expect(themeMode.value).toBe('dark')
    expect(isDark.value).toBe(true)
    expect(document.documentElement.classList.contains('dark')).toBe(true)
  })

  it('detects system dark mode via matchMedia and handles media query changes', () => {
    let changeListener: ((e: MediaQueryListEvent) => void) | null = null
    const mockMql = {
      matches: true,
      media: '(prefers-color-scheme: dark)',
      onchange: null,
      addListener: vi.fn<() => void>(),
      removeListener: vi.fn<() => void>(),
      addEventListener: vi.fn<(event: string, cb: (e: MediaQueryListEvent) => void) => void>(
        (event, cb) => {
          if (event === 'change') changeListener = cb
        },
      ),
      removeEventListener: vi.fn<() => void>(),
      dispatchEvent: vi.fn<() => boolean>(),
    }
    window.matchMedia = vi
      .fn<typeof window.matchMedia>()
      .mockReturnValue(mockMql as unknown as MediaQueryList)

    const { themeMode, isDark } = useTheme()
    expect(themeMode.value).toBe('system')
    expect(isDark.value).toBe(true)
    expect(document.documentElement.classList.contains('dark')).toBe(true)

    expect(changeListener).not.toBeNull()
    changeListener!({ matches: false } as MediaQueryListEvent)
    expect(isDark.value).toBe(false)
    expect(document.documentElement.classList.contains('dark')).toBe(false)
  })

  it('runs initialization in component lifecycle via onMounted', () => {
    const wrapper = mount(ThemeTestComponent)
    expect(wrapper.vm.themeMode).toBe('system')
    wrapper.unmount()
  })
})
