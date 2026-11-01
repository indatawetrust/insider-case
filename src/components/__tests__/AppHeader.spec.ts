import { beforeEach, describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia, type Pinia } from 'pinia'
import { useRaceStore } from '@/stores/race'
import { RaceStatus } from '@/types'
import AppHeader from '../AppHeader.vue'

describe('AppHeader', () => {
  let pinia: Pinia

  beforeEach(() => {
    pinia = createPinia()
    setActivePinia(pinia)
  })

  const mountHeader = () => mount(AppHeader, { global: { plugins: [pinia] } })
  const buttons = (wrapper: ReturnType<typeof mountHeader>) => {
    const audio = wrapper.find('[data-testid="audio-toggle"]')
    const theme = wrapper.find('[data-testid="theme-toggle"]')
    const generate = wrapper.findAll('button').find((b) => b.text().includes('Generate Program'))!
    const toggle = wrapper.find('button.toggle')
    return { audio, theme, generate, toggle }
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
    expect(useRaceStore().status).toBe(RaceStatus.Paused)
  })

  it('toggles audio and theme via header action buttons', async () => {
    const wrapper = mountHeader()
    const { audio, theme } = buttons(wrapper)

    expect(audio.exists()).toBe(true)
    expect(theme.exists()).toBe(true)

    await audio.trigger('click')
    expect(audio.attributes('aria-label')).toBe('Unmute sounds')

    await theme.trigger('click')
    expect(document.documentElement.classList.contains('dark')).toBe(true)
  })
})
