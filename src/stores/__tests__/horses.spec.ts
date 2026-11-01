import { beforeEach, describe, expect, it } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { createRandom } from '@/utils/random'
import { STORAGE_KEYS } from '@/utils/storage'
import { useHorsesStore } from '../horses'

describe('horses store', () => {
  beforeEach(() => {
    localStorage.clear()
    setActivePinia(createPinia())
  })

  it('creates the stable of 20 horses on first use', () => {
    expect(useHorsesStore().horses).toHaveLength(20)
  })

  it('looks horses up by id', () => {
    const store = useHorsesStore()
    store.generate(createRandom(1))
    const horse = store.horses[4]!
    expect(store.horseById(horse.id)).toEqual(horse)
    expect(store.horseById(999)).toBeUndefined()
  })

  it('persists stable in localStorage and rehydrates on new store instance', () => {
    const store = useHorsesStore()
    const originalNames = store.horses.map((h) => h.name)
    expect(localStorage.getItem(STORAGE_KEYS.HORSES)).toBeTruthy()

    setActivePinia(createPinia())
    const rehydratedStore = useHorsesStore()
    expect(rehydratedStore.horses.map((h) => h.name)).toEqual(originalNames)
  })

  it('clears persisted race state when stable is regenerated', () => {
    localStorage.setItem(STORAGE_KEYS.RACE, JSON.stringify({ laps: [] }))
    const store = useHorsesStore()
    store.generate(createRandom(2))
    expect(localStorage.getItem(STORAGE_KEYS.RACE)).toBeNull()
  })
})
