import { beforeEach, describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia, type Pinia } from 'pinia'
import { useHorsesStore } from '@/stores/horses'
import { useRaceStore } from '@/stores/race'
import { createRandom } from '@/utils/random'
import HorseList from '../HorseList.vue'

describe('HorseList component', () => {
  let pinia: Pinia

  beforeEach(() => {
    localStorage.clear()
    pinia = createPinia()
    setActivePinia(pinia)
  })

  it('renders all horses with condition bars and colors', () => {
    const horsesStore = useHorsesStore()
    const wrapper = mount(HorseList, {
      global: { plugins: [pinia] },
    })

    expect(wrapper.text()).toContain('Horse List')
    expect(wrapper.find('.meta').text()).toBe(`1–${horsesStore.horses.length}`)

    const rows = wrapper.findAll('transition-group-stub tr, tbody tr')
    expect(rows.length).toBe(horsesStore.horses.length)

    const firstHorse = horsesStore.horses[0]!
    expect(rows[0]!.text()).toContain(firstHorse.name)
    expect(rows[0]!.text()).toContain(String(firstHorse.condition))
    expect(rows[0]!.text()).toContain(firstHorse.color.name)
  })

  it('marks benched horses when a lap is active on track', () => {
    const race = useRaceStore()
    race.generateProgram(createRandom(10))

    const wrapper = mount(HorseList, {
      global: { plugins: [pinia] },
    })

    const activeHorseIds = new Set(race.currentLap!.runners.map((r) => r.horseId))
    const rows = wrapper.findAll('transition-group-stub tr, tbody tr')
    expect(rows.length).toBe(20)

    const benchedStatuses = rows.map((row) => row.classes().includes('benched'))
    const expectedStatuses = useHorsesStore().horses.map((h) => !activeHorseIds.has(h.id))
    expect(benchedStatuses).toEqual(expectedStatuses)
  })
})
