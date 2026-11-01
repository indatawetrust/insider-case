import { describe, expect, it } from 'vitest'
import { HORSE_COLORS, HORSE_NAMES } from '@/data/horses'
import { conditionLevel, generateHorses } from '../horses'
import { createRandom } from '../random'

describe('horse data', () => {
  it('has enough unique names and colors for a full field', () => {
    expect(new Set(HORSE_NAMES).size).toBeGreaterThanOrEqual(20)
    expect(new Set(HORSE_COLORS.map((c) => c.hex)).size).toBeGreaterThanOrEqual(20)
  })
})

describe('generateHorses', () => {
  const horses = generateHorses(20, createRandom(1))

  it('creates 20 horses numbered 1–20', () => {
    expect(horses.map((h) => h.id)).toEqual(Array.from({ length: 20 }, (_, i) => i + 1))
  })

  it('gives every horse a unique color and name', () => {
    expect(new Set(horses.map((h) => h.color.hex)).size).toBe(20)
    expect(new Set(horses.map((h) => h.name)).size).toBe(20)
  })

  it('keeps condition between 1 and 100', () => {
    for (const horse of horses) {
      expect(horse.condition).toBeGreaterThanOrEqual(1)
      expect(horse.condition).toBeLessThanOrEqual(100)
    }
  })

  it('is reproducible with the same seed', () => {
    expect(generateHorses(20, createRandom(1))).toEqual(horses)
  })
})

describe('conditionLevel', () => {
  it.each([
    [1, 'low'],
    [33, 'low'],
    [34, 'mid'],
    [66, 'mid'],
    [67, 'high'],
    [100, 'high'],
  ] as const)('%i → %s', (condition, level) => {
    expect(conditionLevel(condition)).toBe(level)
  })
})
