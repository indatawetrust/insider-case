<script setup lang="ts">
import AppHeader from './components/AppHeader.vue'
import HorseList from './components/HorseList.vue'
import ProgramPanel from './components/ProgramPanel.vue'
import RaceTrack from './components/RaceTrack.vue'
import ResultsPanel from './components/ResultsPanel.vue'
import { useRaceAudio } from './composables/useRaceAudio'
import { useRaceLoop } from './composables/useRaceLoop'
import { useTheme } from './composables/useTheme'

useTheme()
useRaceLoop()
useRaceAudio()
</script>

<template>
  <AppHeader />

  <main class="layout">
    <HorseList class="area-list" />
    <RaceTrack class="area-track" />
    <div class="area-board">
      <ProgramPanel />
      <ResultsPanel />
    </div>
  </main>
</template>

<style scoped>
.layout {
  display: grid;
  grid-template-areas:
    'track'
    'board'
    'list';
  gap: 1rem;
  padding: 1rem;
}

.area-list {
  grid-area: list;
}

.area-track {
  grid-area: track;
}

.area-board {
  display: grid;
  grid-area: board;
  gap: 1rem;
  min-height: 0;
}

/* Below the wide layout, long Program/Results panels scroll instead of stretching the page. */
.area-board > * {
  max-height: min(640px, 75dvh);
}

.area-track {
  min-height: 520px;
}

@media (min-width: 720px) {
  .area-board {
    grid-template-columns: 1fr 1fr;
  }
}

@media (min-width: 1100px) {
  .layout {
    grid-template-columns: minmax(360px, 1fr) minmax(0, 2.2fr);
    grid-template-areas:
      'list track'
      'list board';
    grid-template-rows: 560px minmax(0, 1fr);
  }
}

/* Wide screens: the full board fits in one viewport, each panel scrolls on its own. */
@media (min-width: 1440px) {
  .layout {
    grid-template-columns: minmax(360px, 1fr) minmax(0, 1.6fr) minmax(480px, 1.4fr);
    grid-template-areas: 'list track board';
    grid-template-rows: 1fr;
    height: calc(100dvh - var(--header-height));
  }

  .area-list,
  .area-board,
  .area-board > * {
    max-height: 100%;
  }

  .area-track {
    min-height: 0;
  }
}

@media (min-width: 1100px) and (max-width: 1439px) {
  .area-list {
    max-height: calc(100dvh - var(--header-height) - 2rem);
    position: sticky;
    top: calc(var(--header-height) + 1rem);
  }
}
</style>
