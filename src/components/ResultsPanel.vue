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
function printResults() {
  window.print()
}
</script>

<template>
  <BasePanel title="Results" accent="var(--color-results)" data-testid="results">
    <template #meta>
      <button
        v-if="results.length > 0"
        type="button"
        class="print-btn"
        title="Print race results"
        aria-label="Print race results"
        data-testid="print-results"
        @click="printResults"
      >
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path
            d="M19 8H5c-1.66 0-3 1.34-3 3v6h4v4h12v-4h4v-6c0-1.66-1.34-3-3-3zm-3 11H8v-5h8v5zm3-7c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm-1-9H6v4h12V3z"
            fill="currentColor"
          />
        </svg>
        <span>Print</span>
      </button>
    </template>
    <div ref="body">
      <div v-if="results.length > 0" class="print-document-header" aria-hidden="true">
        <div class="print-doc-title">HORSE RACING SIMULATOR</div>
        <div class="print-doc-subtitle">
          Official Race Results · {{ results.length }} of 6 Laps Completed
        </div>
      </div>
      <p v-if="!results.length" class="empty">Results appear here as each lap finishes.</p>
      <TransitionGroup name="result" tag="div" class="results-grid">
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
.print-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.2rem 0.55rem;
  border: 1px solid var(--color-border);
  border-radius: 6px;
  background: var(--color-surface);
  color: var(--color-text);
  font-size: 0.78rem;
  font-weight: 600;
  text-decoration: none;
  cursor: pointer;
  transition:
    background-color 0.15s,
    border-color 0.15s,
    transform 0.15s;
}

.print-btn:hover {
  background: var(--color-surface-muted);
  border-color: var(--color-results);
  transform: translateY(-1px);
}

.print-btn svg {
  width: 14px;
  height: 14px;
}

.print-document-header {
  display: none;
}

@media print {
  .print-document-header {
    display: block;
    margin-bottom: 2.5mm;
    padding-bottom: 1.5mm;
    border-bottom: 1.5px solid #111;
  }

  .print-doc-title {
    font-family: var(--font-display, sans-serif);
    font-size: 11pt;
    font-weight: 800;
    letter-spacing: 0.04em;
    color: #000;
    line-height: 1;
    text-transform: uppercase;
  }

  .print-doc-subtitle {
    margin-top: 1.5px;
    font-size: 6.8pt;
    color: #444;
  }
}

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
