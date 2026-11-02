import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { loadFromStorage, removeFromStorage, saveToStorage, STORAGE_KEYS } from '../storage'

describe('storage utils', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.restoreAllMocks()
  })

  afterEach(() => {
    localStorage.clear()
    vi.restoreAllMocks()
  })

  it('saves and loads data from localStorage', () => {
    const data = { id: 1, name: 'Ada' }
    const saved = saveToStorage(STORAGE_KEYS.HORSES, data)
    expect(saved).toBe(true)

    const loaded = loadFromStorage(STORAGE_KEYS.HORSES, null)
    expect(loaded).toEqual(data)
  })

  it('returns fallback when key is not found', () => {
    const loaded = loadFromStorage('nonexistent_key', 'fallback_value')
    expect(loaded).toBe('fallback_value')
  })

  it('returns fallback when json is malformed', () => {
    localStorage.setItem('corrupted_key', '{not-valid-json}')
    const loaded = loadFromStorage('corrupted_key', { fallback: true })
    expect(loaded).toEqual({ fallback: true })
  })

  it('removes item from storage', () => {
    saveToStorage('test_key', 'test_value')
    expect(loadFromStorage('test_key', null)).toBe('test_value')

    removeFromStorage('test_key')
    expect(loadFromStorage('test_key', null)).toBeNull()
  })

  it('returns false when saveToStorage fails (e.g. QuotaExceededError)', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('QuotaExceededError')
    })

    const result = saveToStorage('overflow_key', { data: 'test' })
    expect(result).toBe(false)
  })

  it('handles inaccessible localStorage gracefully', () => {
    const originalLocalStorage = window.localStorage
    Object.defineProperty(window, 'localStorage', {
      get() {
        throw new Error('SecurityError: Access is denied')
      },
      configurable: true,
    })

    expect(loadFromStorage('any_key', 'fallback')).toBe('fallback')
    expect(saveToStorage('any_key', 'value')).toBe(false)
    expect(() => removeFromStorage('any_key')).not.toThrow()

    Object.defineProperty(window, 'localStorage', {
      value: originalLocalStorage,
      configurable: true,
    })
  })

  it('handles removeItem errors gracefully', () => {
    vi.spyOn(Storage.prototype, 'removeItem').mockImplementation(() => {
      throw new Error('Failed to remove')
    })

    expect(() => removeFromStorage('any_key')).not.toThrow()
  })
})
