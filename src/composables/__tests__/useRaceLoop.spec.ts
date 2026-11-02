import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { defineComponent } from 'vue'
import { useRaceStore } from '@/stores/race'
import { RaceStatus } from '@/types'
import { useRaceLoop } from '../useRaceLoop'

const TestComponent = defineComponent({
  setup() {
    return useRaceLoop()
  },
  template: '<div />',
})

describe('useRaceLoop', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.restoreAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('drives animation frames with requestAnimationFrame when running', async () => {
    let rafCallback: FrameRequestCallback | null = null
    let rafId = 0
    vi.spyOn(window, 'requestAnimationFrame').mockImplementation((cb) => {
      rafCallback = cb
      return ++rafId
    })
    const cancelRafSpy = vi.spyOn(window, 'cancelAnimationFrame').mockImplementation(() => {})

    const race = useRaceStore()
    const tickSpy = vi.spyOn(race, 'tick')

    const wrapper = mount(TestComponent)

    // Trigger running state
    race.status = RaceStatus.Running
    await wrapper.vm.$nextTick()

    expect(rafCallback).toBeDefined()

    // Step 1: lastTime is null, tick is not called yet
    rafCallback!(1000)
    expect(tickSpy).not.toHaveBeenCalled()

    // Step 2: lastTime is 1000, now tick is called with delta
    rafCallback!(1016)
    expect(tickSpy).toHaveBeenCalledWith(16)

    // Pause stops the loop
    race.status = RaceStatus.Paused
    await wrapper.vm.$nextTick()
    expect(cancelRafSpy).toHaveBeenCalled()

    wrapper.unmount()
  })

  it('pauses the running race when tab becomes hidden (visibilitychange)', async () => {
    const race = useRaceStore()
    const pauseSpy = vi.spyOn(race, 'pause')
    race.status = RaceStatus.Running

    const wrapper = mount(TestComponent)

    Object.defineProperty(document, 'hidden', { value: true, configurable: true })
    document.dispatchEvent(new Event('visibilitychange'))

    expect(pauseSpy).toHaveBeenCalledTimes(1)
    wrapper.unmount()
  })

  it('does not pause if race is not running when tab becomes hidden', async () => {
    const race = useRaceStore()
    const pauseSpy = vi.spyOn(race, 'pause')
    race.status = RaceStatus.Paused

    const wrapper = mount(TestComponent)

    Object.defineProperty(document, 'hidden', { value: true, configurable: true })
    document.dispatchEvent(new Event('visibilitychange'))

    expect(pauseSpy).not.toHaveBeenCalled()
    wrapper.unmount()
  })

  it('does not pause if tab becomes visible (hidden is false)', async () => {
    const race = useRaceStore()
    const pauseSpy = vi.spyOn(race, 'pause')
    race.status = RaceStatus.Running

    const wrapper = mount(TestComponent)

    Object.defineProperty(document, 'hidden', { value: false, configurable: true })
    document.dispatchEvent(new Event('visibilitychange'))

    expect(pauseSpy).not.toHaveBeenCalled()
    wrapper.unmount()
  })

  it('removes visibilitychange listener on unmount', async () => {
    const removeListenerSpy = vi.spyOn(document, 'removeEventListener')
    const wrapper = mount(TestComponent)

    wrapper.unmount()

    expect(removeListenerSpy).toHaveBeenCalledWith('visibilitychange', expect.any(Function))
  })
})
