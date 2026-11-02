import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import {
  _resetAudioContext,
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

class SuspendedAudioContext extends MockAudioContext {
  override state = 'suspended'
}

describe('audio synthesis utilities', () => {
  let originalAudioContext: typeof window.AudioContext

  beforeEach(() => {
    localStorage.clear()
    setSoundMuted(false)
    stopGalloping()
    _resetAudioContext()
    originalAudioContext = window.AudioContext
  })

  afterEach(() => {
    stopGalloping()
    _resetAudioContext()
    window.AudioContext = originalAudioContext
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

  it('plays sounds and fanfares when AudioContext is available', () => {
    window.AudioContext = MockAudioContext as unknown as typeof AudioContext

    expect(() => {
      playCountdownTick(3)
      playCountdownTick(1)
      playStartBell()
      playFinishFanfare()
    }).not.toThrow()
  })

  it('resumes suspended audio context', () => {
    _resetAudioContext()
    window.AudioContext = SuspendedAudioContext as unknown as typeof AudioContext

    expect(() => {
      playCountdownTick(3)
    }).not.toThrow()
  })

  it('handles AudioContext constructor error safely', () => {
    _resetAudioContext()
    class FailingAudioContext {
      constructor() {
        throw new Error('AudioContext blocked by autoplay policy')
      }
    }
    window.AudioContext = FailingAudioContext as unknown as typeof AudioContext

    expect(() => {
      playCountdownTick(3)
      playFinishFanfare()
    }).not.toThrow()
  })

  it('starts and stops galloping sound loop with AudioContext', () => {
    window.AudioContext = MockAudioContext as unknown as typeof AudioContext

    expect(isGalloping()).toBe(false)
    startGalloping()
    expect(isGalloping()).toBe(true)

    // Calling startGalloping again when already galloping is a no-op
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
  })
})
