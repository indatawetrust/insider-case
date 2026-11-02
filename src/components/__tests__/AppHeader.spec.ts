import { beforeEach, describe, expect, it, vi } from 'vitest'
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

  it('walks through Start → Pause → Resume and scrolls to top on generate', async () => {
    const scrollToSpy = vi.spyOn(window, 'scrollTo').mockImplementation(() => {})
    Object.defineProperty(window, 'scrollY', { value: 200, writable: true })

    const wrapper = mountHeader()
    const { generate, toggle } = buttons(wrapper)

    await generate.trigger('click')
    expect(scrollToSpy).toHaveBeenCalledWith({ top: 0, behavior: 'smooth' })
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

  it('displays "All laps complete" when race status is finished', () => {
    const race = useRaceStore()
    race.status = RaceStatus.Finished
    const wrapper = mountHeader()
    expect(wrapper.text()).toContain('All laps complete')
  })

  it('handles PWA installation prompt trigger', async () => {
    const wrapper = mountHeader()
    const promptEvent = new Event('beforeinstallprompt') as Event & {
      prompt: () => Promise<void>
      userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>
    }
    const promptMock = vi.fn<() => Promise<void>>().mockResolvedValue(undefined)
    promptEvent.prompt = promptMock
    promptEvent.userChoice = Promise.resolve({ outcome: 'accepted', platform: 'web' })

    window.dispatchEvent(promptEvent)
    await wrapper.vm.$nextTick()

    const installBtn = wrapper.find('[data-testid="pwa-install"]')
    expect(installBtn.exists()).toBe(true)

    await installBtn.trigger('click')
    expect(promptMock).toHaveBeenCalledTimes(1)
  })
})
