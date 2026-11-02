import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import type { Horse } from '@/types/horse'
import LapTable from '../LapTable.vue'

const horse = (id: number, name: string): Horse => ({
  id,
  name,
  condition: 50,
  color: { name: 'Red', hex: '#E53935' },
})

describe('LapTable', () => {
  it('shows the lap title and one row per horse', () => {
    const wrapper = mount(LapTable, {
      props: {
        lapNumber: 2,
        distance: 1400,
        rows: [
          { position: 1, horse: horse(1, 'Ada Lovelace') },
          { position: 2, horse: horse(2, 'Grace Hopper') },
        ],
      },
    })

    expect(wrapper.find('.lap-header').text()).toContain('2nd Lap – 1400m')
    expect(wrapper.findAll('tbody tr').map((tr) => tr.text())).toEqual([
      '1 Ada Lovelace',
      '2 Grace Hopper',
    ])
  })

  it('adds a time column only when rows have times', () => {
    const rows = [{ position: 1, horse: horse(1, 'Ada Lovelace') }]
    expect(
      mount(LapTable, { props: { lapNumber: 1, distance: 1200, rows } })
        .find('.time')
        .exists(),
    ).toBe(false)

    const timed = [{ ...rows[0]!, time: '1:12.73' }]
    const wrapper = mount(LapTable, { props: { lapNumber: 1, distance: 1200, rows: timed } })
    expect(wrapper.find('td.time').text()).toBe('1:12.73')
  })

  it('marks the podium in results', () => {
    const rows = [1, 2, 3, 4].map((position) => ({
      position,
      horse: horse(position, `H${position}`),
    }))
    const wrapper = mount(LapTable, { props: { lapNumber: 1, distance: 1200, rows, podium: true } })
    expect(wrapper.findAll('tbody tr').map((tr) => tr.classes())).toEqual([
      ['place-1'],
      ['place-2'],
      ['place-3'],
      [],
    ])
  })

  it('flags the live lap', () => {
    const wrapper = mount(LapTable, {
      props: { lapNumber: 1, distance: 1200, rows: [], state: 'active' },
    })
    expect(wrapper.find('.live').exists()).toBe(true)
  })

  it('flags the done lap with completed checkmark', () => {
    const wrapper = mount(LapTable, {
      props: { lapNumber: 1, distance: 1200, rows: [], state: 'done' },
    })
    const doneMark = wrapper.find('.done-mark')
    expect(doneMark.exists()).toBe(true)
    expect(doneMark.text()).toBe('✓')
  })
})
