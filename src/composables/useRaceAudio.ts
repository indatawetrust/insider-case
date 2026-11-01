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

export function useRaceAudio() {
  const race = useRaceStore()
  const muted = ref(isSoundMuted())

  function toggle() {
    muted.value = toggleSound()
  }

  function setMuted(val: boolean) {
    muted.value = val
    setSoundMuted(val)
  }

  // Watch countdown steps
  watch(
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
        startGalloping()
      }
    },
  )

  // Watch running state for galloping soundscape
  watch(
    () => race.status,
    (status) => {
      if (status === RaceStatus.Running && race.countdown === 0) {
        startGalloping()
      } else {
        stopGalloping()
      }
    },
  )

  // Watch lap completions for fanfare
  watch(
    () => race.results.length,
    (newCount, oldCount) => {
      if (newCount > (oldCount ?? 0)) {
        stopGalloping()
        playFinishFanfare()
      }
    },
  )

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
