import { beforeEach, describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia, type Pinia } from 'pinia'
import { useRaceStore } from '@/stores/race'
import AppHeader from '../AppHeader.vue'

describe('AppHeader', () => {
  let pinia: Pinia

  beforeEach(() => {
    pinia = createPinia()
    setActivePinia(pinia)
  })

  const mountHeader = () => mount(AppHeader, { global: { plugins: [pinia] } })
  const buttons = (wrapper: ReturnType<typeof mountHeader>) => {
    const [generate, toggle] = wrapper.findAll('button')
    return { generate: generate!, toggle: toggle! }
  }

  it('only allows generating before a program exists', () => {
    const { generate, toggle } = buttons(mountHeader())
    expect(generate.attributes('disabled')).toBeUndefined()
    expect(toggle.attributes('disabled')).toBeDefined()
    expect(toggle.text()).toBe('Start')
  })

  it('walks through Start → Pause → Resume', async () => {
    const wrapper = mountHeader()
    const { generate, toggle } = buttons(wrapper)

    await generate.trigger('click')
    expect(wrapper.text()).toContain('Program ready')

    await toggle.trigger('click')
    expect(toggle.text()).toBe('Pause')
    expect(generate.attributes('disabled')).toBeDefined()
    expect(wrapper.text()).toContain('Lap 1 of 6 · 1200m')

    await toggle.trigger('click')
    expect(toggle.text()).toBe('Resume')
    expect(useRaceStore().status).toBe('paused')
  })
})
