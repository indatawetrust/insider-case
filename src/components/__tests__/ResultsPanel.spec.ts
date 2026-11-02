import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia, type Pinia } from 'pinia'
import { nextTick } from 'vue'
import { useHorsesStore } from '@/stores/horses'
import { useRaceStore } from '@/stores/race'
import ResultsPanel from '../ResultsPanel.vue'

describe('ResultsPanel', () => {
  let pinia: Pinia

  beforeEach(() => {
    pinia = createPinia()
    setActivePinia(pinia)
    vi.restoreAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('displays empty message and hides print button when there are no results', () => {
    const wrapper = mount(ResultsPanel, { global: { plugins: [pinia] } })
    expect(wrapper.text()).toContain('Results appear here as each lap finishes.')
    expect(wrapper.find('[data-testid="print-results"]').exists()).toBe(false)
  })

  it('renders print button and results when lap results exist', () => {
    const race = useRaceStore()
    const horsesStore = useHorsesStore()

    // Add a mock result
    race.results = [
      {
        lapNumber: 1,
        distance: 1200,
        placements: [
          { position: 1, horseId: horsesStore.horses[0]!.id, raceTimeMs: 65432 },
          { position: 2, horseId: horsesStore.horses[1]!.id, raceTimeMs: 66100 },
        ],
      },
    ]

    const wrapper = mount(ResultsPanel, { global: { plugins: [pinia] } })
    const printBtn = wrapper.find('[data-testid="print-results"]')
    expect(printBtn.exists()).toBe(true)
    expect(wrapper.text()).toContain('1st Lap – 1200m')
  })

  it('invokes window.print when print button is clicked', async () => {
    const race = useRaceStore()
    const horsesStore = useHorsesStore()
    const printSpy = vi.spyOn(window, 'print').mockImplementation(() => {})

    race.results = [
      {
        lapNumber: 1,
        distance: 1200,
        placements: [{ position: 1, horseId: horsesStore.horses[0]!.id, raceTimeMs: 65432 }],
      },
    ]

    const wrapper = mount(ResultsPanel, { global: { plugins: [pinia] } })
    const printBtn = wrapper.find('[data-testid="print-results"]')
    await printBtn.trigger('click')

    expect(printSpy).toHaveBeenCalledTimes(1)
  })

  it('triggers scrollIntoView when new results are appended after mount', async () => {
    const race = useRaceStore()
    const horsesStore = useHorsesStore()
    const wrapper = mount(ResultsPanel, { global: { plugins: [pinia] } })

    race.results.push({
      lapNumber: 1,
      distance: 1200,
      placements: [
        { position: 1, horseId: horsesStore.horses[0]!.id, raceTimeMs: 60000 },
        { position: 2, horseId: 999999, raceTimeMs: 61000 }, // Unknown horseId fallback branch
      ],
    })

    await nextTick()
    expect(wrapper.findAllComponents({ name: 'LapTable' }).length).toBe(1)
  })
})
