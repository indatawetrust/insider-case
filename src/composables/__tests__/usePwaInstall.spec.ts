import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { defineComponent } from 'vue'
import { usePwaInstall } from '../usePwaInstall'

const TestComponent = defineComponent({
  setup() {
    return usePwaInstall()
  },
  template: '<div />',
})

describe('usePwaInstall', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('initializes with canInstall as false and isInstalled as false', () => {
    const wrapper = mount(TestComponent)
    expect(wrapper.vm.canInstall).toBe(false)
    expect(wrapper.vm.isInstalled).toBe(false)
    wrapper.unmount()
  })

  it('returns false when install is called without an active prompt', async () => {
    const wrapper = mount(TestComponent)
    const result = await wrapper.vm.install()
    expect(result).toBe(false)
    wrapper.unmount()
  })

  it('updates canInstall when beforeinstallprompt is fired', async () => {
    const wrapper = mount(TestComponent)
    const promptEvent = new Event('beforeinstallprompt') as Event & {
      prompt: () => Promise<void>
      userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>
    }
    promptEvent.prompt = vi.fn<() => Promise<void>>().mockResolvedValue(undefined)
    promptEvent.userChoice = Promise.resolve({ outcome: 'accepted', platform: 'web' })

    window.dispatchEvent(promptEvent)
    await wrapper.vm.$nextTick()

    expect(wrapper.vm.canInstall).toBe(true)
    wrapper.unmount()
  })

  it('prompts the user when install is called', async () => {
    const wrapper = mount(TestComponent)
    const mockPrompt = vi.fn<() => Promise<void>>().mockResolvedValue(undefined)
    const promptEvent = new Event('beforeinstallprompt') as Event & {
      prompt: () => Promise<void>
      userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>
    }
    promptEvent.prompt = mockPrompt
    promptEvent.userChoice = Promise.resolve({ outcome: 'accepted', platform: 'web' })

    window.dispatchEvent(promptEvent)
    await wrapper.vm.$nextTick()

    const outcome = await wrapper.vm.install()
    expect(mockPrompt).toHaveBeenCalledTimes(1)
    expect(outcome).toBe(true)
    expect(wrapper.vm.canInstall).toBe(false)
    wrapper.unmount()
  })

  it('handles appinstalled event', async () => {
    const wrapper = mount(TestComponent)
    window.dispatchEvent(new Event('appinstalled'))
    await wrapper.vm.$nextTick()

    expect(wrapper.vm.isInstalled).toBe(true)
    expect(wrapper.vm.canInstall).toBe(false)
    wrapper.unmount()
  })
})
