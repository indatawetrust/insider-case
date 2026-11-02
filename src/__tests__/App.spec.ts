import { beforeEach, describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import App from '../App.vue'
import AppHeader from '../components/AppHeader.vue'
import HorseList from '../components/HorseList.vue'
import ProgramPanel from '../components/ProgramPanel.vue'
import RaceTrack from '../components/RaceTrack.vue'
import ResultsPanel from '../components/ResultsPanel.vue'

describe('App root component', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('mounts the application shell with all panels and composables initialized', () => {
    const wrapper = mount(App, {
      global: {
        plugins: [createPinia()],
      },
    })

    expect(wrapper.findComponent(AppHeader).exists()).toBe(true)
    expect(wrapper.findComponent(HorseList).exists()).toBe(true)
    expect(wrapper.findComponent(RaceTrack).exists()).toBe(true)
    expect(wrapper.findComponent(ProgramPanel).exists()).toBe(true)
    expect(wrapper.findComponent(ResultsPanel).exists()).toBe(true)
  })
})
