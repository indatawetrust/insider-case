export interface HorseColor {
  name: string
  hex: string
}

export type ConditionLevel = 'low' | 'mid' | 'high'

export interface Horse {
  id: number
  name: string
  /** 1–100. Higher condition means a faster base speed. */
  condition: number
  color: HorseColor
}

/** Overall performance statistics across rounds. */
export interface HorseStanding {
  horse: Horse
  totalPoints: number
  wins: number
  podiums: number
  averagePlacement: number
}
