export const STORAGE_KEYS = {
  HORSES: 'horse-racing:horses',
  RACE: 'horse-racing:race',
} as const

function getStorage(): Storage | null {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      return window.localStorage
    }
  } catch {
    // Storage access may throw in sandboxed environments or private browsing
  }
  return null
}

/**
 * Loads and parses JSON from localStorage safely. Returns `fallback` if key is missing
 * or if storage is inaccessible or invalid.
 */
export function loadFromStorage<T>(key: string, fallback: T): T {
  const storage = getStorage()
  if (!storage) return fallback
  try {
    const raw = storage.getItem(key)
    if (raw === null) return fallback
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

/**
 * Serializes and stores a value in localStorage. Returns true on success, false on failure.
 */
export function saveToStorage<T>(key: string, value: T): boolean {
  const storage = getStorage()
  if (!storage) return false
  try {
    storage.setItem(key, JSON.stringify(value))
    return true
  } catch {
    return false
  }
}

/**
 * Removes an item from localStorage safely.
 */
export function removeFromStorage(key: string): void {
  const storage = getStorage()
  if (!storage) return
  try {
    storage.removeItem(key)
  } catch {
    // ignore
  }
}

