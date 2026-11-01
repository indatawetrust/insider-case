import { describe, expect, it } from 'vitest'
import { PLAYBACK_RATE } from '@/constants/game'
import type { Horse } from '@/types/horse'
import type { Runner } from '@/types/race'
import { horseSpeed, lapDuration, planRunners, progressAt, rankRunners } from '../race'
import { createRandom } from '../random'

const horse = (id: number, condition: number): Horse => ({
  id,
  name: `Horse ${id}`,
  condition,
  color: { name: 'Red', hex: '#f00' },
})

const runner = (horseId: number, durationMs: number, amplitude = 0.3, phase = 1): Runner => ({
  horseId,
  raceTimeMs: durationMs * PLAYBACK_RATE,
  durationMs,
  surge: { amplitude, phase },
})

describe('horseSpeed', () => {
  it('is faster for a better condition', () => {
    expect(horseSpeed(100)).toBeGreaterThan(horseSpeed(50))
    expect(horseSpeed(50)).toBeGreaterThan(horseSpeed(1))
  })

  it('scales with form', () => {
    expect(horseSpeed(50, 1.05)).toBeCloseTo(horseSpeed(50) * 1.05)
  })
})

describe('planRunners', () => {
  const horses = [horse(1, 90), horse(2, 10)]
  const runners = planRunners(horses, 1200, createRandom(2))

  it('keeps gate order', () => {
    expect(runners.map((r) => r.horseId)).toEqual([1, 2])
  })

  it('compresses race time by the playback rate', () => {
    for (const r of runners) {
      expect(r.durationMs).toBeCloseTo(r.raceTimeMs / PLAYBACK_RATE)
    }
  })

  it('takes longer over a longer distance', () => {
    const short = planRunners(horses, 1200, () => 0.5)
    const long = planRunners(horses, 2200, () => 0.5)
    expect(long[0]!.raceTimeMs).toBeGreaterThan(short[0]!.raceTimeMs)
  })

  it('lets form decide between horses of similar condition', () => {
    const close = [horse(1, 60), horse(2, 61)]
    const winners = new Set<number>()
    const random = createRandom(9)
    for (let i = 0; i < 50; i++) {
      winners.add(rankRunners(planRunners(close, 1200, random))[0]!.horseId)
    }
    expect(winners).toEqual(new Set([1, 2]))
  })
})

describe('progressAt', () => {
  const r = runner(1, 5000)

  it('starts at 0 and ends at 1', () => {
    expect(progressAt(r, 0)).toBeCloseTo(0)
    expect(progressAt(r, 5000)).toBeCloseTo(1)
  })

  it('clamps outside the lap', () => {
    expect(progressAt(r, -500)).toBeCloseTo(0)
    expect(progressAt(r, 9000)).toBeCloseTo(1)
  })

  it('never moves backwards, even with a strong surge', () => {
    const strong = runner(1, 5000, 0.99, 2)
    let previous = 0
    for (let ms = 0; ms <= 5000; ms += 50) {
      const p = progressAt(strong, ms)
      expect(p).toBeGreaterThanOrEqual(previous - 1e-9)
      previous = p
    }
  })
})

describe('lapDuration', () => {
  it('waits for the slowest horse', () => {
    expect(lapDuration([runner(1, 4000), runner(2, 6500), runner(3, 5000)])).toBe(6500)
  })
})

describe('rankRunners', () => {
  it('orders by race time and numbers positions from 1', () => {
    const placements = rankRunners([runner(1, 6000), runner(2, 4000), runner(3, 5000)])
    expect(placements.map((p) => [p.position, p.horseId])).toEqual([
      [1, 2],
      [2, 3],
      [3, 1],
    ])
  })
})
