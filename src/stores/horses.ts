import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { HORSE_COUNT } from '@/constants/game'
import { HORSE_COLORS } from '@/data/horses'
import type { Horse } from '@/types/horse'
import { generateHorses } from '@/utils/horses'
import type { RandomFn } from '@/utils/random'
import { loadFromStorage, removeFromStorage, saveToStorage, STORAGE_KEYS } from '@/utils/storage'

export const useHorsesStore = defineStore('horses', () => {
  const horses = ref<Horse[]>([])

  const byId = computed(() => new Map(horses.value.map((horse) => [horse.id, horse])))

  function generate(random: RandomFn = Math.random) {
    horses.value = generateHorses(HORSE_COUNT, random)
    saveToStorage(STORAGE_KEYS.HORSES, horses.value)
    removeFromStorage(STORAGE_KEYS.RACE)
  }

  function horseById(id: number): Horse | undefined {
    return byId.value.get(id)
  }

  const validHexes = new Set(HORSE_COLORS.map((c) => c.hex))
  const cached = loadFromStorage<Horse[] | null>(STORAGE_KEYS.HORSES, null)
  if (
    Array.isArray(cached) &&
    cached.length === HORSE_COUNT &&
    cached.every((h) => validHexes.has(h.color.hex))
  ) {
    horses.value = cached
  } else {
    generate()
  }

  return { horses, generate, horseById }
})
