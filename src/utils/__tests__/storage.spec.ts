import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { loadFromStorage, removeFromStorage, saveToStorage, STORAGE_KEYS } from '../storage'

describe('storage utils', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  afterEach(() => {
    localStorage.clear()
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
})
