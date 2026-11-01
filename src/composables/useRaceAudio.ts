import { getCurrentInstance, onBeforeUnmount, ref, watch } from 'vue'
import { useRaceStore } from '@/stores/race'
import { RaceStatus } from '@/types'
import {
  isSoundMuted,
  playCountdownTick,
  playFinishFanfare,
  playStartBell,
  setSoundMuted,
  startGalloping,
  stopGalloping,
  toggleSound,
} from '@/utils/audio'

// Shared module-scoped reactive state so all components stay in sync
const muted = ref(isSoundMuted())
let currentRaceStore: ReturnType<typeof useRaceStore> | null = null
let stopWatchers: (() => void) | null = null

function initAudioWatchers(race: ReturnType<typeof useRaceStore>) {
  if (currentRaceStore === race) return
  if (stopWatchers) {
    stopWatchers()
    stopWatchers = null
  }
  currentRaceStore = race

  // Continuous galloping soundscape:
  // Re-evaluates whenever mute status, race status, countdown, or lap completion changes.
  // This ensures that unmuting while a race is running immediately resumes the galloping sound!
  const unwatchLoop = watch(
    () => [muted.value, race.status, race.countdown, race.lapComplete] as const,
    ([isMutedVal, status, countdown, lapComplete]) => {
      if (!isMutedVal && status === RaceStatus.Running && countdown === 0 && !lapComplete) {
        startGalloping()
      } else {
        stopGalloping()
      }
    },
    { immediate: true, flush: 'sync' },
  )

  // One-off countdown ticks & start bell
  const unwatchCountdown = watch(
    () => race.countdown,
    (val, oldVal) => {
      if (val > 0 && val !== oldVal) {
        playCountdownTick(val)
      } else if (
        val === 0 &&
        oldVal !== undefined &&
        oldVal > 0 &&
        race.status === RaceStatus.Running
      ) {
        playStartBell()
      }
    },
    { flush: 'sync' },
  )

  // One-off lap completion fanfare
  const unwatchResults = watch(
    () => race.results.length,
    (newCount, oldCount) => {
      if (newCount > (oldCount ?? 0)) {
        playFinishFanfare()
      }
    },
    { flush: 'sync' },
  )

  stopWatchers = () => {
    unwatchLoop()
    unwatchCountdown()
    unwatchResults()
  }
}

export function useRaceAudio() {
  const race = useRaceStore()

  initAudioWatchers(race)

  function toggle() {
    muted.value = toggleSound()
  }

  function setMuted(val: boolean) {
    muted.value = val
    setSoundMuted(val)
  }

  if (getCurrentInstance()) {
    onBeforeUnmount(() => {
      stopGalloping()
    })
  }

  return {
    muted,
    toggle,
    setMuted,
  }
}
