import { describe, expect, it } from 'vitest'
import { generateHorses } from '../horses'
import { createRandom } from '../random'
import { generateSchedule } from '../schedule'

describe('generateSchedule', () => {
  const random = createRandom(5)
  const horses = generateHorses(20, random)
  const laps = generateSchedule(horses, random)

  it('creates 6 laps with increasing distances', () => {
    expect(laps.map((lap) => lap.number)).toEqual([1, 2, 3, 4, 5, 6])
    expect(laps.map((lap) => lap.distance)).toEqual([1200, 1400, 1600, 1800, 2000, 2200])
  })

  it('puts 10 distinct horses from the stable in every lap', () => {
    const stable = new Set(horses.map((h) => h.id))
    for (const lap of laps) {
      const ids = lap.runners.map((r) => r.horseId)
      expect(ids).toHaveLength(10)
      expect(new Set(ids).size).toBe(10)
      expect(ids.every((id) => stable.has(id))).toBe(true)
    }
  })

  it('draws a different field for each lap', () => {
    const fields = laps.map((lap) => lap.runners.map((r) => r.horseId).join(','))
    expect(new Set(fields).size).toBeGreaterThan(1)
  })
})
