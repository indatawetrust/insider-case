import { computed, getCurrentInstance, onMounted, ref } from 'vue'
import { loadFromStorage, saveToStorage, STORAGE_KEYS } from '@/utils/storage'

export type ThemeMode = 'light' | 'dark' | 'system'

const themeMode = ref<ThemeMode>('system')
const systemIsDark = ref(false)
let initialized = false

function checkSystemDark(): boolean {
  if (typeof window === 'undefined' || !window.matchMedia) return false
  return window.matchMedia('(prefers-color-scheme: dark)').matches
}

function applyTheme(dark: boolean) {
  if (typeof document === 'undefined') return
  document.documentElement.classList.toggle('dark', dark)
  document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light')
}

function initTheme(isDarkRef: { value: boolean }) {
  if (initialized) return
  initialized = true
  systemIsDark.value = checkSystemDark()
  const stored = loadFromStorage<ThemeMode | null>(STORAGE_KEYS.THEME, null)
  if (stored === 'light' || stored === 'dark' || stored === 'system') {
    themeMode.value = stored
  }
  applyTheme(isDarkRef.value)

  if (typeof window !== 'undefined' && window.matchMedia) {
    const media = window.matchMedia('(prefers-color-scheme: dark)')
    const listener = (e: MediaQueryListEvent) => {
      systemIsDark.value = e.matches
      if (themeMode.value === 'system') {
        applyTheme(isDarkRef.value)
      }
    }
    media.addEventListener('change', listener)
  }
}

export function useTheme() {
  const isDark = computed(() => {
    if (themeMode.value === 'dark') return true
    if (themeMode.value === 'light') return false
    return systemIsDark.value
  })

  function setTheme(mode: ThemeMode) {
    themeMode.value = mode
    saveToStorage(STORAGE_KEYS.THEME, mode)
    applyTheme(isDark.value)
  }

  function toggleTheme() {
    setTheme(isDark.value ? 'light' : 'dark')
  }

  if (getCurrentInstance()) {
    onMounted(() => initTheme(isDark))
  } else {
    initTheme(isDark)
  }

  return {
    themeMode,
    isDark,
    setTheme,
    toggleTheme,
  }
}

/** Internal reset helper for test isolation. */
export function _resetTheme(): void {
  initialized = false
  themeMode.value = 'system'
  systemIsDark.value = false
}
