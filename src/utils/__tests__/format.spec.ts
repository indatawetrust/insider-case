import { describe, expect, it } from 'vitest'
import { formatRaceTime, ordinal } from '../format'

describe('formatRaceTime', () => {
  it.each([
    [72734, '1:12.73'],
    [59999, '1:00.00'],
    [5050, '0:05.05'],
  ])('%i ms → %s', (ms, text) => {
    expect(formatRaceTime(ms)).toBe(text)
  })
})

describe('ordinal', () => {
  it.each([
    [1, '1st'],
    [2, '2nd'],
    [3, '3rd'],
    [4, '4th'],
    [11, '11th'],
    [12, '12th'],
    [21, '21st'],
  ])('%i → %s', (n, text) => {
    expect(ordinal(n)).toBe(text)
  })
})
