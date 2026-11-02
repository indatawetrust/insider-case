import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import HorseIcon from '../HorseIcon.vue'

describe('HorseIcon', () => {
  it('renders SVG with the given coat color and default size styles', () => {
    const wrapper = mount(HorseIcon, {
      props: { color: '#E53935' },
    })

    const svg = wrapper.find('svg')
    expect(svg.exists()).toBe(true)
    expect(svg.attributes('style')).toContain('--coat: #E53935')
    expect(svg.attributes('style')).toContain('width: 100%')
    expect(svg.attributes('style')).toContain('height: auto')
    expect(svg.classes()).toContain('horse-icon')
    expect(svg.classes()).not.toContain('galloping')
  })

  it('toggles the galloping class and switches to the 10-frame sprite strip when galloping is true', () => {
    const idleWrapper = mount(HorseIcon, {
      props: { color: '#000000', galloping: false },
    })
    const gallopingWrapper = mount(HorseIcon, {
      props: { color: '#000000', galloping: true },
    })

    expect(gallopingWrapper.find('svg').classes()).toContain('galloping')
    expect(gallopingWrapper.find('.sprite-strip').exists()).toBe(true)

    const idlePath = idleWrapper.find('path.silhouette').attributes('d') ?? ''
    const spritePath = gallopingWrapper.find('path.silhouette').attributes('d') ?? ''
    expect(spritePath.length).toBeGreaterThan(idlePath.length * 5)
  })

  it('applies custom size via props (both number and string)', () => {
    const numWrapper = mount(HorseIcon, {
      props: { color: '#ffffff', size: 24 },
    })
    expect(numWrapper.find('svg').attributes('style')).toContain('width: 24px')

    const strWrapper = mount(HorseIcon, {
      props: { color: '#ffffff', size: '2.5rem' },
    })
    expect(strWrapper.find('svg').attributes('style')).toContain('width: 2.5rem')
  })

  it('supports explicit width and height props (both number and string)', () => {
    const numWrapper = mount(HorseIcon, {
      props: { color: '#123456', width: 40, height: 30 },
    })
    const numStyle = numWrapper.find('svg').attributes('style')
    expect(numStyle).toContain('width: 40px')
    expect(numStyle).toContain('height: 30px')

    const strWrapper = mount(HorseIcon, {
      props: { color: '#123456', width: '50px', height: '40px' },
    })
    const strStyle = strWrapper.find('svg').attributes('style')
    expect(strStyle).toContain('width: 50px')
    expect(strStyle).toContain('height: 40px')
  })
})
