import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import {
  isGalloping,
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

class MockAudioContext {
  currentTime = 0
  state = 'running'
  createOscillator() {
    return {
      type: 'sine',
      frequency: { setValueAtTime: () => {}, exponentialRampToValueAtTime: () => {} },
      connect: () => {},
      start: () => {},
      stop: () => {},
    }
  }
  createGain() {
    return {
      gain: { setValueAtTime: () => {}, exponentialRampToValueAtTime: () => {} },
      connect: () => {},
    }
  }
  resume() {
    return Promise.resolve()
  }
  destination = {}
}

describe('audio synthesis utilities', () => {
  beforeEach(() => {
    localStorage.clear()
    setSoundMuted(false)
    stopGalloping()
  })

  afterEach(() => {
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

  it('starts and stops galloping sound loop with AudioContext', () => {
    // Provide Mock AudioContext on window
    const originalAudioContext = window.AudioContext
    window.AudioContext = MockAudioContext as unknown as typeof AudioContext

    try {
      expect(isGalloping()).toBe(false)
      startGalloping()
      expect(isGalloping()).toBe(true)

      // Muting stops galloping immediately
      setSoundMuted(true)
      expect(isGalloping()).toBe(false)

      // When unmuting, galloping can be restarted
      setSoundMuted(false)
      startGalloping()
      expect(isGalloping()).toBe(true)

      stopGalloping()
      expect(isGalloping()).toBe(false)
    } finally {
      window.AudioContext = originalAudioContext
    }
  })
})
