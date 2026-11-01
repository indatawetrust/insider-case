/** Returns a number in [0, 1), like Math.random. Injected everywhere so tests can be deterministic. */
export type RandomFn = () => number

/** Small seeded PRNG (mulberry32). Same seed, same sequence. */
export function createRandom(seed: number): RandomFn {
  let state = seed >>> 0
  return () => {
    state = (state + 0x6d2b79f5) >>> 0
    let t = state
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** Inclusive on both ends. */
export function randomInt(min: number, max: number, random: RandomFn = Math.random): number {
  return Math.floor(random() * (max - min + 1)) + min
}

/** Returns a shuffled copy (Fisher–Yates). */
export function shuffle<T>(items: readonly T[], random: RandomFn = Math.random): T[] {
  const result = [...items]
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1))
    ;[result[i], result[j]] = [result[j]!, result[i]!]
  }
  return result
}

/** Picks `count` distinct items in random order. */
export function sample<T>(items: readonly T[], count: number, random: RandomFn = Math.random): T[] {
  if (count > items.length) {
    throw new RangeError(`Cannot sample ${count} items from ${items.length}`)
  }
  return shuffle(items, random).slice(0, count)
}
