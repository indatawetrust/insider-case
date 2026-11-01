<script setup lang="ts">
import { computed } from 'vue'
import { LAP_DISTANCES } from '@/constants/game'
import { useRaceStore } from '@/stores/race'
import { formatRaceTime, ordinal } from '@/utils/format'
import HorseIcon from './HorseIcon.vue'

const race = useRaceStore()

const MARKERS = [0.25, 0.5, 0.75]
/** How long "GO!" stays on screen after the gates open. */
const GO_MS = 600

const lap = computed(() => race.currentLap)
const racing = computed(() => race.status === 'running' && race.countdown === 0)
const showGo = computed(
  () =>
    ['running', 'paused'].includes(race.status) && race.elapsedMs >= 0 && race.elapsedMs < GO_MS,
)
const markers = computed(() =>
  lap.value ? MARKERS.map((share) => ({ share, meters: lap.value!.distance * share })) : [],
)

const winner = computed(() => {
  const latest = race.results.at(-1)
  if (!race.lapComplete || !latest || latest.lapNumber !== lap.value?.number) return null
  const first = latest.placements[0]
  const lane = race.lanes.find((l) => l.horse.id === first?.horseId)
  return lane && first ? { horse: lane.horse, time: formatRaceTime(first.raceTimeMs) } : null
})

const CONFETTI = Array.from({ length: 36 }, (_, i) => ({
  left: `${(i * 37) % 100}%`,
  delay: `${(i % 9) * 0.12}s`,
  duration: `${2.2 + (i % 5) * 0.35}s`,
  rotate: `${(i * 47) % 360}deg`,
}))
</script>

<template>
  <section class="track-panel" data-testid="track" aria-label="Race track">
    <header class="track-header">
      <template v-if="lap">
        <span class="lap-title">
          {{ ordinal(lap.number) }} Lap <span class="distance">{{ lap.distance }}m</span>
        </span>
        <span class="lap-count">{{ lap.number }} / {{ LAP_DISTANCES.length }}</span>
        <Transition name="fade" mode="out-in">
          <span v-if="race.leader && race.elapsedMs > 0" :key="race.leader.horse.id" class="leader">
            <span class="leader-label">{{ race.lapComplete ? 'Winner' : 'Leader' }}</span>
            <HorseIcon :color="race.leader.horse.color.hex" :size="22" />
            {{ race.leader.horse.name }}
          </span>
        </Transition>
      </template>
      <span v-else class="lap-title">Track</span>
    </header>

    <div class="track" :class="{ racing, paused: race.status === 'paused' }">
      <Transition name="lap-swap" mode="out-in">
        <div v-if="lap" :key="`${race.programId}-${lap.number}`" class="lanes">
          <div class="markers" aria-hidden="true">
            <span
              v-for="marker in markers"
              :key="marker.share"
              class="marker"
              :style="{
                left: `calc(var(--gate-width) + (100% - var(--gate-width)) * ${marker.share})`,
              }"
            >
              {{ marker.meters }}m
            </span>
          </div>

          <div
            v-for="lane in race.lanes"
            :key="lane.horse.id"
            class="lane"
            :style="{ '--i': lane.lane }"
            :aria-label="`Lane ${lane.lane}: ${lane.horse.name}`"
          >
            <span class="gate">{{ lane.lane }}</span>
            <div class="lane-track">
              <div
                class="runner"
                :class="{
                  finished: lane.position !== null,
                  'show-tag': lane.progress > 0.2 && lane.position === null,
                }"
                :style="{ '--p': lane.progress }"
                :data-progress="lane.progress.toFixed(4)"
              >
                <span class="name-tag">{{ lane.horse.name }}</span>
                <span class="horse-wrap">
                  <HorseIcon
                    :color="lane.horse.color.hex"
                    :galloping="racing && lane.position === null"
                  />
                </span>
              </div>
              <Transition name="pop">
                <span
                  v-if="lane.position !== null"
                  class="place"
                  :class="lane.position <= 3 ? `place-${lane.position}` : undefined"
                >
                  {{ lane.position }}
                </span>
              </Transition>
            </div>
          </div>
        </div>

        <div v-else class="empty">
          <div class="empty-horse"><HorseIcon color="#ffffff" galloping /></div>
          <p>Generate a program to bring the horses to the gate.</p>
        </div>
      </Transition>

      <div v-if="lap" class="finish-line" aria-hidden="true"></div>

      <Transition name="count" mode="out-in">
        <div v-if="race.countdown" :key="race.countdown" class="overlay count">
          {{ race.countdown }}
        </div>
        <div v-else-if="showGo" class="overlay go">GO!</div>
      </Transition>

      <Transition name="banner">
        <div v-if="winner" class="banner" role="status">
          <span class="trophy" aria-hidden="true">🏆</span>
          <span>
            <strong>{{ winner.horse.name }}</strong> wins the {{ ordinal(lap!.number) }} lap
          </span>
          <span class="banner-time">{{ winner.time }}</span>
        </div>
      </Transition>

      <div v-if="race.status === 'finished'" class="confetti" aria-hidden="true">
        <span
          v-for="(piece, i) in CONFETTI"
          :key="i"
          :style="{
            left: piece.left,
            animationDelay: piece.delay,
            animationDuration: piece.duration,
            rotate: piece.rotate,
            backgroundColor: race.lanes[i % race.lanes.length]?.horse.color.hex,
          }"
        ></span>
      </div>
    </div>

    <footer v-if="lap" class="track-footer">
      <span>{{ ordinal(lap.number) }} Lap {{ lap.distance }}m</span>
      <span class="finish-label">Finish</span>
    </footer>
  </section>
</template>

<style scoped>
.track-panel {
  --gate-width: 34px;
  --horse-width: 56px;

  display: flex;
  flex-direction: column;
  min-width: 0;
  min-height: 0;
  overflow: hidden;
  border-radius: var(--radius);
  background: var(--color-gate);
  box-shadow: var(--shadow);
}

.track-header,
.track-footer {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.5rem 0.9rem;
  color: #fff;
}

.track-header {
  min-height: 46px;
}

.lap-title {
  font-family: var(--font-display);
  font-size: 1.6rem;
  letter-spacing: 0.04em;
  line-height: 1;
}

.distance {
  color: #ffd166;
}

.lap-count {
  padding: 0.1rem 0.5rem;
  border-radius: 999px;
  background: rgb(255 255 255 / 15%);
  font-size: 0.75rem;
  font-weight: 700;
}

.leader {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  margin-left: auto;
  font-weight: 600;
  font-size: 0.85rem;
}

.leader-label {
  color: rgb(255 255 255 / 65%);
  font-size: 0.7rem;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.dot {
  width: 10px;
  height: 10px;
  border: 1px solid rgb(0 0 0 / 30%);
  border-radius: 50%;
}

.track-footer {
  justify-content: space-between;
  font-family: var(--font-display);
  font-size: 1.15rem;
  letter-spacing: 0.06em;
}

.finish-label {
  color: #ff8a7a;
}

.track {
  position: relative;
  flex: 1;
  min-height: 0;
  overflow: hidden;
}

.lanes {
  position: relative;
  display: flex;
  flex-direction: column;
  height: 100%;
}

.lane {
  position: relative;
  display: flex;
  flex: 1;
  min-height: 42px;
  border-bottom: 2px dashed rgb(255 255 255 / 35%);
  background: var(--color-turf);
}

.lane:nth-child(odd) {
  background: var(--color-turf-alt);
}

.gate {
  display: grid;
  flex: 0 0 var(--gate-width);
  place-items: center;
  border-right: 3px solid rgb(255 255 255 / 70%);
  background: var(--color-gate);
  color: #fff;
  font-family: var(--font-display);
  font-size: 1.25rem;
}

.lane-track {
  position: relative;
  flex: 1;
  /* Leaves room for the finish line, so the nose stops right at it. */
  margin-right: 10px;
  /* Lets the runner use cqw units: 100cqw is the width of this lane. */
  container-type: inline-size;
}

.runner {
  position: absolute;
  top: 50%;
  left: 0;
  display: flex;
  align-items: center;
  /* Progress 1 puts the horse's nose on the finish line. */
  z-index: 2;
  transform: translate(calc(var(--p) * (100cqw - var(--horse-width))), -50%);
  will-change: transform;
}

.horse-wrap {
  position: relative;
  width: var(--horse-width);
}

/* Dust kicked up behind a galloping horse. */
.racing .runner:not(.finished) .horse-wrap::before {
  position: absolute;
  bottom: -2px;
  left: 2px;
  width: 16px;
  height: 8px;
  border-radius: 50%;
  background: rgb(222 205 160 / 70%);
  content: '';
  filter: blur(2px);
  animation: dust 0.45s ease-out infinite;
}

@keyframes dust {
  from {
    opacity: 0.9;
    transform: translateX(0) scale(0.6);
  }
  to {
    opacity: 0;
    transform: translateX(-18px) scale(1.4);
  }
}

.name-tag {
  position: absolute;
  right: calc(100% + 4px);
  padding: 0.05rem 0.35rem;
  border-radius: 4px;
  background: rgb(0 0 0 / 35%);
  color: #fff;
  font-size: 0.68rem;
  font-weight: 600;
  white-space: nowrap;
  opacity: 0;
  transition: opacity 0.3s;
}

/* Name tags only appear once the horse has left enough room behind it. */
.runner.show-tag .name-tag {
  opacity: 1;
}

.place {
  position: absolute;
  top: 50%;
  right: 4px;
  z-index: 2;
  display: grid;
  place-items: center;
  width: 24px;
  height: 24px;
  margin-top: -12px;
  border-radius: 50%;
  background: #fff;
  color: var(--color-text);
  font-weight: 800;
  font-size: 0.75rem;
  box-shadow: 0 2px 6px rgb(0 0 0 / 30%);
  transform: translateX(calc(-1 * var(--horse-width)));
}

.place-1 {
  background: var(--color-gold);
}

.place-2 {
  background: var(--color-silver);
}

.place-3 {
  background: var(--color-bronze);
  color: #fff;
}

/* Drawn over the turf but under the runners (z-index 2). */
.markers {
  position: absolute;
  inset: 0;
  z-index: 1;
  pointer-events: none;
}

.marker {
  position: absolute;
  top: 0;
  bottom: 0;
  padding-left: 4px;
  border-left: 1px solid rgb(255 255 255 / 18%);
  color: rgb(255 255 255 / 55%);
  font-size: 0.65rem;
  font-weight: 700;
}

.finish-line {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  z-index: 2;
  width: 10px;
  background: repeating-conic-gradient(#111 0 25%, #fff 0 50%) 0 0 / 10px 10px;
  box-shadow: -2px 0 0 #d93b2b;
}

.empty {
  display: grid;
  place-content: center;
  justify-items: center;
  gap: 1rem;
  height: 100%;
  min-height: 300px;
  padding: 2rem;
  background: repeating-linear-gradient(
    180deg,
    var(--color-turf) 0 42px,
    var(--color-turf-alt) 42px 84px
  );
  color: #fff;
  text-align: center;
  font-weight: 600;
}

.empty-horse {
  width: 110px;
  opacity: 0.9;
  animation: trot 2.4s ease-in-out infinite alternate;
}

@keyframes trot {
  from {
    transform: translateX(-30px);
  }
  to {
    transform: translateX(30px);
  }
}

.overlay {
  position: absolute;
  inset: 0;
  z-index: 5;
  display: grid;
  place-items: center;
  color: #fff;
  font-family: var(--font-display);
  font-size: clamp(5rem, 14vw, 9rem);
  line-height: 1;
  text-shadow: 0 6px 30px rgb(0 0 0 / 45%);
  pointer-events: none;
}

.overlay.go {
  color: #ffd166;
}

.count-enter-active {
  animation: count-in 0.35s var(--ease-spring);
}

.count-leave-active {
  animation: count-out 0.15s ease-in forwards;
}

@keyframes count-in {
  from {
    opacity: 0;
    transform: scale(2.2);
  }
}

@keyframes count-out {
  to {
    opacity: 0;
    transform: scale(0.6);
  }
}

.banner {
  position: absolute;
  top: 50%;
  left: 50%;
  z-index: 6;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1.2rem;
  border-radius: 999px;
  background: rgb(255 255 255 / 96%);
  box-shadow: 0 10px 40px rgb(0 0 0 / 35%);
  white-space: nowrap;
  translate: -50% -50%;
}

.trophy {
  font-size: 1.6rem;
  animation: wiggle 0.6s ease-in-out 0.3s 2;
}

.banner-time {
  padding: 0.15rem 0.5rem;
  border-radius: 6px;
  background: var(--color-surface-muted);
  font-weight: 700;
  font-variant-numeric: tabular-nums;
}

@keyframes wiggle {
  25% {
    transform: rotate(-14deg);
  }
  75% {
    transform: rotate(14deg);
  }
}

.banner-enter-active {
  transition:
    opacity 0.3s,
    transform 0.45s var(--ease-spring);
}

.banner-leave-active {
  transition:
    opacity 0.2s,
    transform 0.2s;
}

.banner-enter-from,
.banner-leave-to {
  opacity: 0;
  transform: scale(0.6);
}

.confetti {
  position: absolute;
  inset: 0;
  z-index: 4;
  overflow: hidden;
  pointer-events: none;
}

.confetti span {
  position: absolute;
  top: -12px;
  width: 8px;
  height: 14px;
  border-radius: 2px;
  animation: fall linear infinite;
}

@keyframes fall {
  to {
    transform: translateY(110vh) rotate(720deg);
  }
}

.pop-enter-active {
  animation: pop 0.45s var(--ease-spring);
}

@keyframes pop {
  from {
    opacity: 0;
    transform: translateX(calc(-1 * var(--horse-width))) scale(0.2);
  }
}

.lap-swap-enter-active,
.lap-swap-leave-active {
  transition:
    opacity 0.35s,
    transform 0.35s var(--ease-out);
}

.lap-swap-enter-from {
  opacity: 0;
  transform: translateX(-24px);
}

.lap-swap-leave-to {
  opacity: 0;
  transform: translateX(24px);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Freeze decorative animations while paused. */
.paused :deep(*) {
  animation-play-state: paused !important;
}

@media (max-width: 600px) {
  .track-panel {
    --gate-width: 26px;
    --horse-width: 44px;
  }

  .lap-count,
  .leader-label {
    display: none;
  }

  .name-tag {
    display: none;
  }
}
</style>
