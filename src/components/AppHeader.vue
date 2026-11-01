<script setup lang="ts">
import { computed } from 'vue'
import { LAP_DISTANCES } from '@/constants/game'
import { usePwaInstall } from '@/composables/usePwaInstall'
import { useRaceAudio } from '@/composables/useRaceAudio'
import { useTheme } from '@/composables/useTheme'
import { useRaceStore } from '@/stores/race'
import { RaceStatus } from '@/types'
import HorseIcon from './HorseIcon.vue'

const race = useRaceStore()
const { isDark, toggleTheme } = useTheme()
const { muted: isMuted, toggle: toggleAudio } = useRaceAudio()
const { canInstall, install: installPwa } = usePwaInstall()

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

    <div class="utilities">
      <button
        v-if="canInstall"
        type="button"
        class="icon-btn"
        title="Install app"
        aria-label="Install app"
        data-testid="pwa-install"
        @click="installPwa"
      >
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path
            d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM17 13l-5 5-5-5h3V9h4v4h3z"
            fill="currentColor"
          />
        </svg>
      </button>

      <button
        type="button"
        class="icon-btn"
        :title="isMuted ? 'Unmute sounds' : 'Mute sounds'"
        :aria-label="isMuted ? 'Unmute sounds' : 'Mute sounds'"
        data-testid="audio-toggle"
        @click="toggleAudio"
      >
        <svg v-if="isMuted" viewBox="0 0 24 24" aria-hidden="true">
          <path
            d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27l4.73 4.73H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"
            fill="currentColor"
          />
        </svg>
        <svg v-else viewBox="0 0 24 24" aria-hidden="true">
          <path
            d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"
            fill="currentColor"
          />
        </svg>
      </button>

      <button
        type="button"
        class="icon-btn"
        :title="isDark ? 'Switch to light mode' : 'Switch to dark mode'"
        :aria-label="isDark ? 'Switch to light mode' : 'Switch to dark mode'"
        data-testid="theme-toggle"
        @click="toggleTheme"
      >
        <svg v-if="isDark" viewBox="0 0 24 24" aria-hidden="true">
          <path
            d="M12 7c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zM2 13h2c.55 0 1-.45 1-1s-.45-1-1-1H2c-.55 0-1 .45-1 1s.45 1 1 1zm18 0h2c.55 0 1-.45 1-1s-.45-1-1-1h-2c-.55 0-1 .45-1 1s.45 1 1 1zM11 2v2c0 .55.45 1 1 1s1-.45 1-1V2c0-.55-.45-1-1-1s-1 .45-1 1zm0 18v2c0 .55.45 1 1 1s1-.45 1-1v-2c0-.55-.45-1-1-1s-1 .45-1 1zM5.99 4.58c-.39-.39-1.03-.39-1.41 0s-.39 1.03 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0s.39-1.03 0-1.41L5.99 4.58zm12.37 12.37c-.39-.39-1.03-.39-1.41 0s-.39 1.03 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0s.39-1.03 0-1.41l-1.06-1.06zm1.06-10.96c.39-.39.39-1.03 0-1.41s-1.03-.39-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06zM7.05 18.36c.39-.39.39-1.03 0-1.41s-1.03-.39-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06z"
            fill="currentColor"
          />
        </svg>
        <svg v-else viewBox="0 0 24 24" aria-hidden="true">
          <path
            d="M12.3 2a10 10 0 0 0-1.9 19.8 10 10 0 0 0 10.5-12.7 8 8 0 0 1-8.6-7.1z"
            fill="currentColor"
          />
        </svg>
      </button>
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
  grid-template-columns: auto 1fr auto auto;
  align-items: center;
  gap: 1.25rem;
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

.utilities {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.actions {
  display: flex;
  align-items: center;
  gap: 0.6rem;
}

.icon-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  padding: 0;
  border: 1px solid rgb(255 255 255 / 25%);
  border-radius: 50%;
  background: rgb(0 0 0 / 15%);
  color: #fff;
  cursor: pointer;
  transition:
    transform 0.15s var(--ease-out),
    background-color 0.15s,
    border-color 0.15s;
}

.icon-btn:hover {
  transform: translateY(-1px);
  background: rgb(0 0 0 / 25%);
  border-color: rgb(255 255 255 / 45%);
}

.icon-btn:active {
  transform: translateY(0) scale(0.95);
}

.icon-btn:focus-visible {
  outline: 3px solid #fff;
  outline-offset: 2px;
}

.icon-btn svg {
  width: 19px;
  height: 19px;
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

@media (max-width: 960px) {
  .app-header {
    grid-template-columns: auto 1fr auto;
    gap: 0.75rem 1rem;
  }

  .status {
    grid-column: 1 / -1;
    grid-row: 2;
    max-width: none;
  }

  .utilities {
    grid-column: 2;
    grid-row: 1;
    justify-self: end;
  }

  .actions {
    grid-column: 3;
    grid-row: 1;
  }
}

@media (max-width: 580px) {
  .app-header {
    grid-template-columns: 1fr auto;
    gap: 0.75rem;
  }

  .brand {
    grid-column: 1;
    grid-row: 1;
  }

  .utilities {
    grid-column: 2;
    grid-row: 1;
    justify-self: end;
  }

  .status {
    grid-column: 1 / -1;
    grid-row: 2;
  }

  .actions {
    grid-column: 1 / -1;
    grid-row: 3;
    display: flex;
    gap: 0.6rem;
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
