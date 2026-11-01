<script setup lang="ts">
import { computed, ref } from 'vue'
import { useScrollIntoView } from '@/composables/useScrollIntoView'
import { useHorsesStore } from '@/stores/horses'
import { useRaceStore } from '@/stores/race'
import { formatRaceTime } from '@/utils/format'
import BasePanel from './BasePanel.vue'
import LapTable, { type LapRow } from './LapTable.vue'

const horsesStore = useHorsesStore()
const race = useRaceStore()
const body = ref<HTMLElement | null>(null)

const results = computed(() =>
  race.results.map((result) => ({
    ...result,
    rows: result.placements.flatMap<LapRow>((placement) => {
      const horse = horsesStore.horseById(placement.horseId)
      return horse
        ? [{ position: placement.position, horse, time: formatRaceTime(placement.raceTimeMs) }]
        : []
    }),
  })),
)

useScrollIntoView(
  body,
  () => race.results.length,
  () => `[data-lap="${race.results.length}"]`,
)
</script>

<template>
  <BasePanel title="Results" accent="var(--color-results)" data-testid="results">
    <div ref="body">
      <p v-if="!results.length" class="empty">Results appear here as each lap finishes.</p>
      <TransitionGroup name="result" tag="div">
        <LapTable
          v-for="result in results"
          :key="result.lapNumber"
          :lap-number="result.lapNumber"
          :distance="result.distance"
          :rows="result.rows"
          podium
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

.result-enter-active {
  transition:
    opacity 0.5s var(--ease-out),
    transform 0.5s var(--ease-spring);
}

.result-enter-from {
  opacity: 0;
  transform: translateX(24px) scale(0.96);
}

/* Rows of a freshly added result drop in one by one. */
.result-enter-active :deep(tbody tr) {
  animation: row-in 0.4s var(--ease-out) both;
  animation-delay: calc(var(--i, 0) * 45ms + 150ms);
}

@keyframes row-in {
  from {
    opacity: 0;
    transform: translateY(-6px);
  }
}
</style>
