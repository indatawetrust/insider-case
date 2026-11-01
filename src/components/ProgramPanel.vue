<script setup lang="ts">
import { computed, ref } from 'vue'
import { useScrollIntoView } from '@/composables/useScrollIntoView'
import { useHorsesStore } from '@/stores/horses'
import { useRaceStore } from '@/stores/race'
import { RaceStatus, type Lap, type LapRow, type LapState } from '@/types'
import BasePanel from './BasePanel.vue'
import LapTable from './LapTable.vue'

const horsesStore = useHorsesStore()
const race = useRaceStore()
const body = ref<HTMLElement | null>(null)

function lapState(index: number): LapState {
  if (index < race.results.length) return 'done'
  if (index === race.lapIndex && [RaceStatus.Running, RaceStatus.Paused].includes(race.status)) {
    return 'active'
  }
  return 'upcoming'
}

/** Gate order: the position column is the lane the horse starts from. */
function rowsFor(lap: Lap): LapRow[] {
  return lap.runners.flatMap((runner, index) => {
    const horse = horsesStore.horseById(runner.horseId)
    return horse ? [{ position: index + 1, horse }] : []
  })
}

const laps = computed(() => race.laps.map((lap, index) => ({ lap, rows: rowsFor(lap), index })))

useScrollIntoView(
  body,
  () => race.lapIndex,
  () => `[data-lap="${race.lapIndex + 1}"]`,
)
</script>

<template>
  <BasePanel title="Program" accent="var(--color-program)" data-testid="program">
    <div ref="body">
      <p v-if="!laps.length" class="empty">
        Press <strong>Generate Program</strong> to draw 6 laps.
      </p>
      <TransitionGroup v-else :key="race.programId" name="lap" tag="div" appear>
        <LapTable
          v-for="{ lap, rows, index } in laps"
          :key="lap.number"
          :lap-number="lap.number"
          :distance="lap.distance"
          :rows="rows"
          :state="lapState(index)"
          :style="{ '--i': index }"
        />
      </TransitionGroup>
    </div>
  </BasePanel>
</template>

<style scoped>
.empty {
  padding: 2rem 1rem;
  color: var(--color-text-muted);
  text-align: center;
}

.lap-enter-active {
  transition:
    opacity 0.45s var(--ease-out),
    transform 0.45s var(--ease-out);
  transition-delay: calc(var(--i, 0) * 70ms);
}

.lap-enter-from {
  opacity: 0;
  transform: translateY(14px) scale(0.98);
}
</style>
