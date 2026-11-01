import { beforeEach, describe, expect, it } from 'vitest'
import {
  isSoundMuted,
  playCountdownTick,
  playFinishFanfare,
  playStartBell,
  setSoundMuted,
  startGalloping,
  stopGalloping,
  toggleSound,
} from '../audio'
import { STORAGE_KEYS } from '../storage'

describe('audio synthesis utilities', () => {
  beforeEach(() => {
    localStorage.clear()
    setSoundMuted(false)
    stopGalloping()
  })

  it('manages sound mute state and persists to storage', () => {
    expect(isSoundMuted()).toBe(false)

    setSoundMuted(true)
    expect(isSoundMuted()).toBe(true)
    expect(localStorage.getItem(STORAGE_KEYS.SOUND)).toBe('true')

    const toggled = toggleSound()
    expect(toggled).toBe(false)
    expect(isSoundMuted()).toBe(false)
    expect(localStorage.getItem(STORAGE_KEYS.SOUND)).toBe('false')
  })

  it('safely executes audio cue methods without throwing even when AudioContext is unavailable in jsdom', () => {
    expect(() => {
      playCountdownTick(3)
      playCountdownTick(1)
      playStartBell()
      startGalloping()
      stopGalloping()
      playFinishFanfare()
    }).not.toThrow()
  })

  it('stops galloping when muted', () => {
    startGalloping()
    setSoundMuted(true)
    expect(isSoundMuted()).toBe(true)
  })
})
