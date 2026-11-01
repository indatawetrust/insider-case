export interface HorseColor {
  name: string
  hex: string
}

export interface Horse {
  id: number
  name: string
  /** 1–100. Higher condition means a faster base speed. */
  condition: number
  color: HorseColor
}
