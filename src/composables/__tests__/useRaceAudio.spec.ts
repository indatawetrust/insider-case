import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { defineComponent } from 'vue'
import { COUNTDOWN_MS } from '@/constants/game'
import { useRaceStore } from '@/stores/race'
import { isGalloping, stopGalloping } from '@/utils/audio'
import { createRandom } from '@/utils/random'
import { useRaceAudio } from '../useRaceAudio'

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

const AudioComponent = defineComponent({
  setup() {
    return useRaceAudio()
  },
  template: '<div />',
})

describe('useRaceAudio composable', () => {
  let originalAudioContext: typeof window.AudioContext

  beforeEach(() => {
    localStorage.clear()
    setActivePinia(createPinia())
    originalAudioContext = window.AudioContext
    window.AudioContext = MockAudioContext as unknown as typeof AudioContext
    stopGalloping()
  })

  afterEach(() => {
    stopGalloping()
    window.AudioContext = originalAudioContext
  })

  it('manages mute state and handles race state changes cleanly', () => {
    const audio = useRaceAudio()
    const race = useRaceStore()

    expect(audio.muted.value).toBe(false)
    audio.toggle()
    expect(audio.muted.value).toBe(true)

    audio.setMuted(false)
    expect(audio.muted.value).toBe(false)

    race.generateProgram(createRandom(1))
    race.start()
    expect(race.countdown).toBe(3)
  })

  it('resumes galloping sound when sound is toggled mute -> unmute during a running race', async () => {
    const audio = useRaceAudio()
    const race = useRaceStore()

    race.generateProgram(createRandom(1))
    race.start()

    // Fast-forward countdown
    race.tick(COUNTDOWN_MS + 100)
    expect(race.countdown).toBe(0)
    expect(isGalloping()).toBe(true)

    // User mutes mid-race
    audio.toggle()
    expect(audio.muted.value).toBe(true)
    expect(isGalloping()).toBe(false)

    // User un-mutes mid-race -> galloping should immediately resume!
    audio.toggle()
    expect(audio.muted.value).toBe(false)
    expect(isGalloping()).toBe(true)

    // Pause race -> galloping should stop
    race.pause()
    expect(isGalloping()).toBe(false)
  })

  it('plays finish fanfare when race results count increases', () => {
    useRaceAudio()
    const race = useRaceStore()

    race.results.push({
      lapNumber: 1,
      distance: 1200,
      placements: [],
    })
    expect(race.results.length).toBe(1)
  })

  it('cleans up galloping on component unmount', () => {
    const wrapper = mount(AudioComponent)
    wrapper.unmount()
    expect(isGalloping()).toBe(false)
  })
})
