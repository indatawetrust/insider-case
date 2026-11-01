<script setup lang="ts">
import { computed } from 'vue'
import { LAP_DISTANCES } from '@/constants/game'
import { useRaceStore } from '@/stores/race'
import { RaceStatus } from '@/types'
import HorseIcon from './HorseIcon.vue'

const race = useRaceStore()

const toggleLabel = computed(() => {
  if (race.status === RaceStatus.Running) return 'Pause'
  if (race.status === RaceStatus.Paused) return 'Resume'
  return 'Start'
})

const statusText = computed(() => {
  const lap = race.currentLap
  switch (race.status) {
    case RaceStatus.Idle:
      return 'Generate a program to begin'
    case RaceStatus.Ready:
      return `Program ready · ${LAP_DISTANCES.length} laps`
    case RaceStatus.Finished:
      return 'All laps complete'
    default:
      return lap ? `Lap ${lap.number} of ${LAP_DISTANCES.length} · ${lap.distance}m` : ''
  }
})

/** Fill level (0–1) for each lap segment of the progress meter. */
const segments = computed(() =>
  LAP_DISTANCES.map((_, index) => {
    if (index < race.results.length) return 1
    if (index === race.lapIndex && [RaceStatus.Running, RaceStatus.Paused].includes(race.status)) {
      return race.lapProgress
    }
    return 0
  }),
)
</script>

<template>
  <header class="app-header">
    <div class="brand">
      <span class="logo"><HorseIcon color="#fff" /></span>
      <h1>Horse Racing</h1>
    </div>

    <div class="status">
      <span class="status-text" aria-live="polite">
        <span v-if="race.status === RaceStatus.Paused" class="paused-dot" aria-hidden="true"></span>
        {{ statusText }}
      </span>
      <div class="meter" aria-hidden="true">
        <span v-for="(fill, index) in segments" :key="index" class="segment">
          <span class="segment-fill" :style="{ transform: `scaleX(${fill})` }"></span>
        </span>
      </div>
    </div>

    <div class="actions">
      <button
        type="button"
        class="btn"
        :disabled="!race.canGenerate"
        @click="race.generateProgram()"
      >
        Generate Program
      </button>
      <button
        type="button"
        class="btn btn-primary toggle"
        :disabled="!race.canToggle"
        @click="race.toggle()"
      >
        <span class="toggle-icon" :class="race.status === RaceStatus.Running ? 'pause' : 'play'">
          <span></span><span></span>
        </span>
        {{ toggleLabel }}
      </button>
    </div>
  </header>
</template>

<style scoped>
.app-header {
  position: sticky;
  top: 0;
  z-index: 10;
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  gap: 1.5rem;
  min-height: var(--header-height);
  padding: 0.75rem 1.25rem;
  background: var(--color-brand);
  color: #fff;
  box-shadow: 0 2px 12px rgb(0 0 0 / 15%);
}

.brand {
  display: flex;
  align-items: center;
  gap: 0.7rem;
}

.logo {
  display: grid;
  place-items: center;
  width: 44px;
  height: 44px;
  padding: 6px;
  border-radius: 12px;
  background: rgb(0 0 0 / 15%);
}

h1 {
  font-family: var(--font-display);
  font-size: 2.1rem;
  font-weight: 400;
  letter-spacing: 0.05em;
  line-height: 1;
  white-space: nowrap;
}

.status {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  max-width: 420px;
  justify-self: center;
  width: 100%;
}

.status-text {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-weight: 600;
  font-size: 0.85rem;
}

.paused-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #fff;
  animation: blink 1s steps(2, start) infinite;
}

@keyframes blink {
  to {
    visibility: hidden;
  }
}

.meter {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 4px;
}

.segment {
  height: 6px;
  overflow: hidden;
  border-radius: 3px;
  background: rgb(255 255 255 / 30%);
}

.segment-fill {
  display: block;
  height: 100%;
  background: #fff;
  transform-origin: left;
}

.actions {
  display: flex;
  gap: 0.6rem;
}

.toggle {
  min-width: 118px;
  justify-content: center;
}

/* The icon is split into two halves. Each half morphs between a pause bar and half of the
   play triangle; both shapes have four points, so clip-path can animate between them. */
.toggle-icon {
  display: flex;
  width: 11px;
  height: 12px;
}

.toggle-icon span {
  flex: 1;
  background: currentColor;
  transition: clip-path 0.25s var(--ease-out);
}

.play span:first-child {
  clip-path: polygon(0 0, 100% 25%, 100% 75%, 0 100%);
}

.play span:last-child {
  clip-path: polygon(0 25%, 100% 50%, 100% 50%, 0 75%);
}

.pause span:first-child {
  clip-path: polygon(0 0, 70% 0, 70% 100%, 0 100%);
}

.pause span:last-child {
  clip-path: polygon(30% 0, 100% 0, 100% 100%, 30% 100%);
}

@media (max-width: 860px) {
  .app-header {
    grid-template-columns: 1fr auto;
    gap: 0.75rem 1rem;
  }

  .status {
    grid-column: 1 / -1;
    grid-row: 2;
    max-width: none;
  }
}

@media (max-width: 520px) {
  .app-header {
    grid-template-columns: 1fr;
  }

  h1 {
    font-size: 1.7rem;
  }

  .actions .btn {
    flex: 1;
    justify-content: center;
  }
}
</style>
