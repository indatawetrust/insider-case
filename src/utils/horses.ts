import { CONDITION_MAX, CONDITION_MIN, HORSE_COUNT } from '@/constants/game'
import { HORSE_COLORS, HORSE_NAMES } from '@/data/horses'
import type { Horse } from '@/types/horse'
import { randomInt, sample, type RandomFn } from './random'

export function generateHorses(count = HORSE_COUNT, random: RandomFn = Math.random): Horse[] {
  const names = sample(HORSE_NAMES, count, random)
  const colors = sample(HORSE_COLORS, count, random)

  return names.map((name, index) => ({
    id: index + 1,
    name,
    condition: randomInt(CONDITION_MIN, CONDITION_MAX, random),
    color: colors[index]!,
  }))
}

export type ConditionLevel = 'low' | 'mid' | 'high'

export function conditionLevel(condition: number): ConditionLevel {
  if (condition < 34) return 'low'
  if (condition < 67) return 'mid'
  return 'high'
}
