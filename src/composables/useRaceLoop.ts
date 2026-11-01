import { onBeforeUnmount, watch } from 'vue'
import { MAX_FRAME_MS } from '@/constants/game'
import { useRaceStore } from '@/stores/race'

/**
 * Drives the race clock with requestAnimationFrame while the race is running.
 * All race logic lives in the store; this only turns frames into `tick(delta)` calls.
 */
export function useRaceLoop() {
  const race = useRaceStore()
  let frame = 0
  let lastTime: number | null = null

  function step(time: number) {
    if (lastTime !== null) race.tick(Math.min(time - lastTime, MAX_FRAME_MS))
    lastTime = time
    frame = requestAnimationFrame(step)
  }

  function stop() {
    cancelAnimationFrame(frame)
    lastTime = null
  }

  watch(
    () => race.status === 'running',
    (running) => {
      stop()
      if (running) frame = requestAnimationFrame(step)
    },
    { immediate: true },
  )

  onBeforeUnmount(stop)
}
