import { beforeEach, describe, expect, it } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useRaceStore } from '@/stores/race'
import { createRandom } from '@/utils/random'
import { useRaceAudio } from '../useRaceAudio'

describe('useRaceAudio composable', () => {
  beforeEach(() => {
    localStorage.clear()
    setActivePinia(createPinia())
  })

  it('manages mute state and handles race state changes cleanly', () => {
    const audio = useRaceAudio()
    const race = useRaceStore()

    expect(audio.muted.value).toBe(false)
    audio.toggle()
    expect(audio.muted.value).toBe(true)

    audio.setMuted(false)
    expect(audio.muted.value).toBe(false)

    // Verify triggering countdown and laps does not crash
    race.generateProgram(createRandom(1))
    race.start()
    expect(race.countdown).toBe(3)
  })
})
