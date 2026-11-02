import { getCurrentInstance, onBeforeUnmount, watch } from 'vue'
import { MAX_FRAME_MS } from '@/constants/game'
import { useRaceStore } from '@/stores/race'
import { RaceStatus } from '@/types'

/**
 * Drives the race clock with requestAnimationFrame while the race is running.
 * All race logic lives in the store; this only turns frames into `tick(delta)` calls.
 * Automatically pauses the race when the user leaves the tab (visibilitychange hidden).
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

  function handleVisibilityChange() {
    if (typeof document !== 'undefined' && document.hidden) {
      if (race.status === RaceStatus.Running) {
        race.pause()
      }
    }
  }

  watch(
    () => race.status === RaceStatus.Running,
    (running) => {
      stop()
      if (running) frame = requestAnimationFrame(step)
    },
    { immediate: true },
  )

  if (typeof document !== 'undefined') {
    document.addEventListener('visibilitychange', handleVisibilityChange)
  }

  if (getCurrentInstance()) {
    onBeforeUnmount(() => {
      stop()
      if (typeof document !== 'undefined') {
        document.removeEventListener('visibilitychange', handleVisibilityChange)
      }
    })
  }

  return {
    handleVisibilityChange,
    stop,
  }
}
