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
