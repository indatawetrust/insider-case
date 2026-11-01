import { beforeEach, describe, expect, it } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { createRandom } from '@/utils/random'
import { useHorsesStore } from '../horses'

describe('horses store', () => {
  beforeEach(() => {
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
})
