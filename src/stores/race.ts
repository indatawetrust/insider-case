import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { COUNTDOWN_MS, LAP_GAP_MS } from '@/constants/game'
import { RaceStatus, type LaneState, type Lap, type LapResult } from '@/types'
import { lapDuration, progressAt, rankRunners } from '@/utils/race'
import type { RandomFn } from '@/utils/random'
import { generateSchedule } from '@/utils/schedule'
import { useHorsesStore } from './horses'

export type { LaneState }

const COUNTDOWN_STEPS = 3

export const useRaceStore = defineStore('race', () => {
  const horsesStore = useHorsesStore()

  const laps = ref<Lap[]>([])
  const results = ref<LapResult[]>([])
  const status = ref<RaceStatus>(RaceStatus.Idle)
  const lapIndex = ref(0)
  /** Bumped on every new program, so views can replay their entrance animations. */
  const programId = ref(0)
  /** Time since the current lap's gates opened. Negative while the countdown runs. */
  const elapsedMs = ref(0)

  const currentLap = computed<Lap | null>(() =>
    status.value === RaceStatus.Idle ? null : (laps.value[lapIndex.value] ?? null),
  )

  const currentLapDuration = computed(() =>
    currentLap.value ? lapDuration(currentLap.value.runners) : 0,
  )

  /** 3, 2, 1 during the countdown, 0 once the gates are open. */
  const countdown = computed(() =>
    elapsedMs.value < 0 ? Math.ceil((-elapsedMs.value / COUNTDOWN_MS) * COUNTDOWN_STEPS) : 0,
  )

  const lapProgress = computed(() => {
    if (!currentLapDuration.value) return 0
    return Math.min(Math.max(elapsedMs.value / currentLapDuration.value, 0), 1)
  })

  // Only depends on the lap, so it is not recalculated on every frame.
  const standings = computed(
    () =>
      new Map(
        rankRunners(currentLap.value?.runners ?? []).map((p) => [p.horseId, p.position] as const),
      ),
  )

  const lanes = computed<LaneState[]>(() =>
    (currentLap.value?.runners ?? []).flatMap((runner, index) => {
      const horse = horsesStore.horseById(runner.horseId)
      if (!horse) return []
      return {
        lane: index + 1,
        horse,
        progress: progressAt(runner, elapsedMs.value),
        position:
          elapsedMs.value >= runner.durationMs
            ? (standings.value.get(runner.horseId) ?? null)
            : null,
      }
    }),
  )

  /** True from the moment the last horse crosses the line until the next lap starts. */
  const lapComplete = computed(
    () => currentLapDuration.value > 0 && elapsedMs.value >= currentLapDuration.value,
  )

  /** The winner once someone has finished, otherwise whoever is furthest ahead. */
  const leader = computed<LaneState | null>(() => {
    let best: LaneState | null = null
    for (const lane of lanes.value) {
      if (lane.position === 1) return lane
      if (!best || lane.progress > best.progress) best = lane
    }
    return best
  })

  const canGenerate = computed(() => status.value !== RaceStatus.Running)
  const canToggle = computed(() =>
    [RaceStatus.Ready, RaceStatus.Running, RaceStatus.Paused].includes(status.value),
  )

  function generateProgram(random: RandomFn = Math.random) {
    if (!canGenerate.value) return
    laps.value = generateSchedule(horsesStore.horses, random)
    results.value = []
    lapIndex.value = 0
    elapsedMs.value = 0
    programId.value++
    status.value = RaceStatus.Ready
  }

  function start() {
    if (status.value === RaceStatus.Ready) {
      elapsedMs.value = -COUNTDOWN_MS
      status.value = RaceStatus.Running
    } else if (status.value === RaceStatus.Paused) {
      status.value = RaceStatus.Running
    }
  }

  function pause() {
    if (status.value === RaceStatus.Running) status.value = RaceStatus.Paused
  }

  function toggle() {
    if (status.value === RaceStatus.Running) pause()
    else start()
  }

  /** Advances the race clock. Called once per animation frame while running. */
  function tick(deltaMs: number) {
    const lap = currentLap.value
    if (status.value !== RaceStatus.Running || !lap) return

    elapsedMs.value += deltaMs
    const duration = currentLapDuration.value

    if (elapsedMs.value >= duration && results.value.length === lapIndex.value) {
      results.value.push({
        lapNumber: lap.number,
        distance: lap.distance,
        placements: rankRunners(lap.runners),
      })
    }

    if (elapsedMs.value >= duration + LAP_GAP_MS) {
      if (lapIndex.value < laps.value.length - 1) {
        lapIndex.value++
        elapsedMs.value = -COUNTDOWN_MS
      } else {
        status.value = RaceStatus.Finished
      }
    }
  }

  return {
    laps,
    results,
    status,
    lapIndex,
    programId,
    elapsedMs,
    currentLap,
    countdown,
    lapProgress,
    lanes,
    lapComplete,
    leader,
    canGenerate,
    canToggle,
    generateProgram,
    start,
    pause,
    toggle,
    tick,
  }
})
