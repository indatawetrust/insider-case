<script setup lang="ts">
import { computed } from 'vue'
import type { LapRow, LapState } from '@/types'
import { ordinal } from '@/utils/format'
import HorseIcon from './HorseIcon.vue'

export type { LapRow, LapState }

const props = defineProps<{
  lapNumber: number
  distance: number
  rows: LapRow[]
  state?: LapState
  /** Highlights the podium (results view). */
  podium?: boolean
}>()

const hasTime = computed(() => props.rows.some((row) => row.time))
</script>

<template>
  <article class="lap" :class="state" :data-lap="lapNumber">
    <header class="lap-header">
      <span>{{ ordinal(lapNumber) }} Lap – {{ distance }}m</span>
      <span v-if="state === 'active'" class="live">Live</span>
      <span v-else-if="state === 'done'" class="done-mark" aria-label="Completed">✓</span>
    </header>
    <table>
      <thead>
        <tr>
          <th class="pos">Position</th>
          <th>Name</th>
          <th v-if="hasTime" class="time">Time</th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="(row, index) in rows"
          :key="row.horse.id"
          :class="podium && row.position <= 3 ? `place-${row.position}` : undefined"
          :style="{ '--i': index }"
        >
          <td class="pos">
            <span class="pos-badge">{{ row.position }}</span>
          </td>
          <td>
            <span class="horse">
              <HorseIcon :color="row.horse.color.hex" :size="20" />
              {{ row.horse.name }}
            </span>
          </td>
          <td v-if="hasTime" class="time">{{ row.time }}</td>
        </tr>
      </tbody>
    </table>
  </article>
</template>

<style scoped>
.lap {
  margin: 0.6rem;
  overflow: hidden;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  background: var(--color-surface);
  transition:
    border-color 0.3s,
    box-shadow 0.3s,
    opacity 0.3s;
}

.lap.active {
  border-color: var(--color-brand);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--color-brand) 25%, transparent);
}

.lap.done {
  opacity: 0.75;
}

.lap-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.35rem 0.7rem;
  background: var(--color-lap);
  color: #fff;
  font-family: var(--font-display);
  font-size: 1.05rem;
  letter-spacing: 0.06em;
}

.live {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.85rem;
}

.live::before {
  content: '';
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #fff;
  animation: pulse 1.2s ease-out infinite;
}

@keyframes pulse {
  0% {
    box-shadow: 0 0 0 0 rgb(255 255 255 / 70%);
  }
  100% {
    box-shadow: 0 0 0 8px rgb(255 255 255 / 0%);
  }
}

table {
  width: 100%;
}

th {
  padding: 0.3rem 0.45rem;
  background: var(--color-surface-muted);
  color: var(--color-text-muted);
  font-size: 0.68rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-align: left;
  text-transform: uppercase;
}

td {
  padding: 0.28rem 0.45rem;
  border-top: 1px solid var(--color-border);
  white-space: nowrap;
}

.pos {
  width: 2.5rem;
}

.pos-badge {
  display: inline-grid;
  place-items: center;
  min-width: 22px;
  height: 22px;
  border-radius: 6px;
  background: var(--color-surface-muted);
  font-size: 0.75rem;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
}

.place-1 .pos-badge {
  background: var(--color-gold);
}

.place-2 .pos-badge {
  background: var(--color-silver);
}

.place-3 .pos-badge {
  background: var(--color-bronze);
  color: #fff;
}

.place-1 td {
  background: color-mix(in srgb, var(--color-gold) 12%, transparent);
  font-weight: 600;
}

.horse {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
}

.time {
  color: var(--color-text-muted);
  font-variant-numeric: tabular-nums;
  text-align: right;
}

.done-mark {
  font-family: var(--font-body);
  font-weight: 700;
}
</style>
