import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia, type Pinia } from 'pinia'
import { nextTick } from 'vue'
import { COUNTDOWN_MS } from '@/constants/game'
import { useRaceStore } from '@/stores/race'
import { RaceStatus } from '@/types'
import { lapDuration } from '@/utils/race'
import { createRandom } from '@/utils/random'
import RaceTrack from '../RaceTrack.vue'

describe('RaceTrack', () => {
  let pinia: Pinia

  beforeEach(() => {
    pinia = createPinia()
    setActivePinia(pinia)
    vi.restoreAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('renders track shell in idle state', () => {
    const wrapper = mount(RaceTrack, { global: { plugins: [pinia] } })
    expect(wrapper.text()).toContain('Track')
    expect(wrapper.text()).toContain('Generate a program to bring the horses to the gate.')
  })

  it('triggers scrollToTop when showGo becomes true', async () => {
    const scrollToSpy = vi.spyOn(window, 'scrollTo').mockImplementation(() => {})
    Object.defineProperty(window, 'scrollY', { value: 200, writable: true })

    const race = useRaceStore()
    mount(RaceTrack, { global: { plugins: [pinia] } })

    // Simulate GO! phase (Running, elapsedMs = 0 < 600)
    race.status = RaceStatus.Running
    race.elapsedMs = 0
    await nextTick()

    expect(scrollToSpy).toHaveBeenCalledWith({ top: 0, behavior: 'smooth' })
  })

  it('displays the winner banner with details when a lap completes', async () => {
    const race = useRaceStore()
    const wrapper = mount(RaceTrack, { global: { plugins: [pinia] } })

    race.generateProgram(createRandom(42))
    race.start()

    const duration = lapDuration(race.currentLap!.runners)
    for (let left = COUNTDOWN_MS + duration + 1; left > 0; left -= 16) {
      race.tick(Math.min(16, left))
    }
    await nextTick()

    const banner = wrapper.find('.banner')
    expect(banner.exists()).toBe(true)
    expect(banner.find('.trophy').text()).toBe('🏆')
    expect(banner.text()).toContain('wins the 1st lap')
    expect(banner.find('.banner-time').exists()).toBe(true)
  })
})
