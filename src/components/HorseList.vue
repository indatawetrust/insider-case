<script setup lang="ts">
import { computed } from 'vue'
import { useHorsesStore } from '@/stores/horses'
import { useRaceStore } from '@/stores/race'
import { conditionLevel } from '@/utils/horses'
import BasePanel from './BasePanel.vue'
import HorseIcon from './HorseIcon.vue'

const horsesStore = useHorsesStore()
const race = useRaceStore()

/** Horses in the current lap's field. Empty when no lap is on track. */
const inField = computed(
  () => new Set(race.currentLap?.runners.map((runner) => runner.horseId) ?? []),
)
</script>

<template>
  <BasePanel title="Horse List" accent="var(--color-list)" data-testid="horse-list">
    <template #meta>
      <span class="meta">1–{{ horsesStore.horses.length }}</span>
    </template>

    <table>
      <thead>
        <tr>
          <th scope="col" class="num">#</th>
          <th scope="col">Name</th>
          <th scope="col">Condition</th>
          <th scope="col">Color</th>
        </tr>
      </thead>
      <TransitionGroup tag="tbody" name="row" appear>
        <tr
          v-for="(horse, index) in horsesStore.horses"
          :key="horse.id"
          :class="{ benched: inField.size > 0 && !inField.has(horse.id) }"
          :style="{ '--i': index }"
        >
          <td class="num">{{ horse.id }}</td>
          <td class="name">{{ horse.name }}</td>
          <td>
            <div class="condition">
              <span class="value">{{ horse.condition }}</span>
              <span class="bar">
                <span
                  class="fill"
                  :class="conditionLevel(horse.condition)"
                  :style="{ width: `${horse.condition}%` }"
                ></span>
              </span>
            </div>
          </td>
          <td>
            <span class="color">
              <HorseIcon :color="horse.color.hex" :size="20" />
              {{ horse.color.name }}
            </span>
          </td>
        </tr>
      </TransitionGroup>
    </table>
  </BasePanel>
</template>

<style scoped>
.meta {
  color: var(--color-text);
  opacity: 0.85;
  font-weight: 700;
  font-size: 0.8rem;
}

table {
  width: 100%;
}

th {
  position: sticky;
  top: 0;
  z-index: 1;
  padding: 0.5rem 0.45rem;
  background: var(--color-surface-muted);
  color: var(--color-text-muted);
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-align: left;
  text-transform: uppercase;
}

td {
  padding: 0.42rem 0.45rem;
  border-bottom: 1px solid var(--color-border);
  white-space: nowrap;
}

tr {
  transition: opacity 0.3s;
}

tr.benched {
  opacity: 0.4;
}

.num {
  width: 2.2rem;
  color: var(--color-text-muted);
  font-variant-numeric: tabular-nums;
  text-align: right;
}

.name {
  font-weight: 600;
}

.condition {
  display: flex;
  align-items: center;
  gap: 0.45rem;
}

.value {
  width: 3ch;
  font-variant-numeric: tabular-nums;
  text-align: right;
}

.bar {
  width: 38px;
  height: 6px;
  overflow: hidden;
  border-radius: 3px;
  background: var(--color-border);
}

.fill {
  display: block;
  height: 100%;
  border-radius: inherit;
  transform-origin: left;
  /* --i comes from the row, so bars fill in the same order the rows appear. */
  animation: fill 0.9s var(--ease-out) both;
  animation-delay: calc(var(--i, 0) * 35ms + 250ms);
}

.fill.low {
  background: #e26d5c;
}

.fill.mid {
  background: #ebb340;
}

.fill.high {
  background: #45ab6d;
}

@keyframes fill {
  from {
    transform: scaleX(0);
  }
}

.color {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
}

.row-enter-active {
  transition:
    opacity 0.4s var(--ease-out),
    transform 0.4s var(--ease-out);
  transition-delay: calc(var(--i, 0) * 35ms);
}

.row-enter-from {
  opacity: 0;
  transform: translateX(-12px);
}
</style>
