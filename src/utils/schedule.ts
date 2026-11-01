import { HORSES_PER_LAP, LAP_DISTANCES } from '@/constants/game'
import type { Horse } from '@/types/horse'
import type { Lap } from '@/types/race'
import { planRunners } from './race'
import { sample, type RandomFn } from './random'

/** Builds the full program: one lap per distance, each with its own random field of horses. */
export function generateSchedule(horses: readonly Horse[], random: RandomFn = Math.random): Lap[] {
  return LAP_DISTANCES.map((distance, index) => {
    const field = sample(horses, HORSES_PER_LAP, random)
    return {
      number: index + 1,
      distance,
      runners: planRunners(field, distance, random),
    }
  })
}
