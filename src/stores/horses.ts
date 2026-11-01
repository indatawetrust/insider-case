import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { HORSE_COUNT } from '@/constants/game'
import type { Horse } from '@/types/horse'
import { generateHorses } from '@/utils/horses'
import type { RandomFn } from '@/utils/random'

export const useHorsesStore = defineStore('horses', () => {
  const horses = ref<Horse[]>([])

  const byId = computed(() => new Map(horses.value.map((horse) => [horse.id, horse])))

  function generate(random: RandomFn = Math.random) {
    horses.value = generateHorses(HORSE_COUNT, random)
  }

  function horseById(id: number): Horse | undefined {
    return byId.value.get(id)
  }

  // The stable exists from the first render; the program is what the user generates.
  generate()

  return { horses, generate, horseById }
})
