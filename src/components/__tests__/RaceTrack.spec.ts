import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia, type Pinia } from 'pinia'
import { nextTick } from 'vue'
import { useRaceStore } from '@/stores/race'
import { RaceStatus } from '@/types'
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
})
