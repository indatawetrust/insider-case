import { describe, expect, it } from 'vitest'
import { createRandom, randomInt, sample, shuffle } from '../random'

describe('createRandom', () => {
  it('repeats the same sequence for the same seed', () => {
    const a = createRandom(42)
    const b = createRandom(42)
    expect([a(), a(), a()]).toEqual([b(), b(), b()])
  })

  it('stays within [0, 1)', () => {
    const random = createRandom(1)
    for (let i = 0; i < 1000; i++) {
      const value = random()
      expect(value).toBeGreaterThanOrEqual(0)
      expect(value).toBeLessThan(1)
    }
  })
})

describe('randomInt', () => {
  it('includes both bounds', () => {
    expect(randomInt(1, 100, () => 0)).toBe(1)
    expect(randomInt(1, 100, () => 0.9999)).toBe(100)
  })
})

describe('shuffle', () => {
  it('keeps every item and leaves the input untouched', () => {
    const input = [1, 2, 3, 4, 5]
    const result = shuffle(input, createRandom(7))
    expect([...result].sort()).toEqual(input)
    expect(input).toEqual([1, 2, 3, 4, 5])
  })
})

describe('sample', () => {
  it('returns distinct items', () => {
    const result = sample([...Array(20).keys()], 10, createRandom(3))
    expect(result).toHaveLength(10)
    expect(new Set(result).size).toBe(10)
  })

  it('throws when asked for more items than exist', () => {
    expect(() => sample([1, 2], 3)).toThrow(RangeError)
  })
})
