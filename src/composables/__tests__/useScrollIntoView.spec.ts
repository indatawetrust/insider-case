import { describe, expect, it, vi } from 'vitest'
import { nextTick, ref } from 'vue'
import { useScrollIntoView } from '../useScrollIntoView'

describe('useScrollIntoView composable', () => {
  it('scrolls the matched element into view when watched source updates', async () => {
    const scrollIntoViewMock = vi.fn<() => void>()
    const targetElement = document.createElement('div')
    targetElement.className = 'target'
    targetElement.scrollIntoView = scrollIntoViewMock

    const containerEl = document.createElement('div')
    containerEl.appendChild(targetElement)

    const containerRef = ref<HTMLElement | null>(containerEl)
    const sourceRef = ref(1)

    useScrollIntoView(containerRef, sourceRef, () => '.target')

    sourceRef.value = 2
    await nextTick()
    await nextTick()

    expect(scrollIntoViewMock).toHaveBeenCalledWith({
      behavior: 'smooth',
      block: 'nearest',
    })
  })

  it('safely handles missing container or unmatching selector', async () => {
    const containerRef = ref<HTMLElement | null>(null)
    const sourceRef = ref(1)

    useScrollIntoView(containerRef, sourceRef, () => '.non-existent')

    sourceRef.value = 2
    await nextTick()
    await nextTick()

    // Container exists now but selector has no match
    const emptyContainer = document.createElement('div')
    containerRef.value = emptyContainer

    sourceRef.value = 3
    await nextTick()
    await nextTick()
    expect(true).toBe(true)
  })
})
