import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { scrollToTop } from '../scroll'

function createMockMediaQueryList(matches: boolean): MediaQueryList {
  return {
    matches,
    media: '',
    onchange: null,
    addListener: vi.fn<() => void>(),
    removeListener: vi.fn<() => void>(),
    addEventListener: vi.fn<() => void>(),
    removeEventListener: vi.fn<() => void>(),
    dispatchEvent: vi.fn<() => boolean>().mockReturnValue(true),
  }
}

describe('scrollToTop', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('scrolls to top with smooth behavior by default when scrolled down', () => {
    const scrollToSpy = vi.spyOn(window, 'scrollTo').mockImplementation(() => {})
    Object.defineProperty(window, 'scrollY', { value: 200, writable: true })

    window.matchMedia = vi
      .fn<typeof window.matchMedia>()
      .mockImplementation(() => createMockMediaQueryList(false))

    scrollToTop()

    expect(scrollToSpy).toHaveBeenCalledWith({
      top: 0,
      behavior: 'smooth',
    })
  })

  it('does nothing when already at top', () => {
    const scrollToSpy = vi.spyOn(window, 'scrollTo').mockImplementation(() => {})
    Object.defineProperty(window, 'scrollY', { value: 0, writable: true })

    scrollToTop()

    expect(scrollToSpy).not.toHaveBeenCalled()
  })

  it('respects prefers-reduced-motion: reduce', () => {
    const scrollToSpy = vi.spyOn(window, 'scrollTo').mockImplementation(() => {})
    Object.defineProperty(window, 'scrollY', { value: 200, writable: true })

    window.matchMedia = vi
      .fn<typeof window.matchMedia>()
      .mockImplementation((query: string) =>
        createMockMediaQueryList(query === '(prefers-reduced-motion: reduce)'),
      )

    scrollToTop()

    expect(scrollToSpy).toHaveBeenCalledWith({
      top: 0,
      behavior: 'auto',
    })
  })
})
