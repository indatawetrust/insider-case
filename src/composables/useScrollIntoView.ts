import { nextTick, watch, type Ref, type WatchSource } from 'vue'

/**
 * Keeps the element matching `selector` (inside `container`) in view whenever `source` changes.
 * Used to follow the live lap in the Program and the newest result in Results.
 */
export function useScrollIntoView(
  container: Ref<HTMLElement | null>,
  source: WatchSource<unknown>,
  selector: () => string,
) {
  watch(source, async () => {
    await nextTick()
    container.value
      ?.querySelector(selector())
      ?.scrollIntoView?.({ behavior: 'smooth', block: 'nearest' })
  })
}
