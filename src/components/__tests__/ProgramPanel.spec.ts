import { beforeEach, describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia, type Pinia } from 'pinia'
import { useRaceStore } from '@/stores/race'
import { RaceStatus } from '@/types'
import { createRandom } from '@/utils/random'
import LapTable from '../LapTable.vue'
import ProgramPanel from '../ProgramPanel.vue'

describe('ProgramPanel component', () => {
  let pinia: Pinia

  beforeEach(() => {
    localStorage.clear()
    pinia = createPinia()
    setActivePinia(pinia)
  })

  it('displays empty state prompt when no program exists', () => {
    const wrapper = mount(ProgramPanel, {
      global: { plugins: [pinia] },
    })

    expect(wrapper.text()).toContain('Program')
    expect(wrapper.text()).toContain('Press Generate Program to draw 6 laps.')
    expect(wrapper.findAllComponents(LapTable).length).toBe(0)
  })

  it('renders all 6 laps and reflects lap states (upcoming, active, done)', async () => {
    const race = useRaceStore()
    race.generateProgram(createRandom(10))

    const wrapper = mount(ProgramPanel, {
      global: { plugins: [pinia] },
    })

    const lapTables = wrapper.findAllComponents(LapTable)
    expect(lapTables.length).toBe(6)

    // Initial state: all laps upcoming (race is Ready)
    expect(lapTables[0]!.props('state')).toBe('upcoming')

    // Start race -> Lap 1 is active
    race.status = RaceStatus.Running
    race.lapIndex = 0
    await wrapper.vm.$nextTick()
    expect(lapTables[0]!.props('state')).toBe('active')
    expect(lapTables[1]!.props('state')).toBe('upcoming')

    // Lap 1 completes -> recorded into results
    race.results.push({
      lapNumber: 1,
      distance: 1200,
      placements: [],
    })
    race.lapIndex = 1
    await wrapper.vm.$nextTick()
    expect(lapTables[0]!.props('state')).toBe('done')
    expect(lapTables[1]!.props('state')).toBe('active')

    // Paused state preserves active for current lap
    race.status = RaceStatus.Paused
    await wrapper.vm.$nextTick()
    expect(lapTables[1]!.props('state')).toBe('active')
  })

  it('handles lap runners gracefully even if a runner horseId is not found', () => {
    const race = useRaceStore()
    race.laps = [
      {
        number: 1,
        distance: 1200,
        runners: [
          {
            horseId: 999999, // Non-existent horse id
            raceTimeMs: 60000,
            durationMs: 10000,
            surge: { amplitude: 0.1, phase: 0 },
          },
        ],
      },
    ]

    const wrapper = mount(ProgramPanel, {
      global: { plugins: [pinia] },
    })

    const lapTable = wrapper.findComponent(LapTable)
    expect(lapTable.exists()).toBe(true)
    expect(lapTable.props('rows')).toEqual([])
  })
})
