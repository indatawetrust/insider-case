import type { Horse } from './horse'

export type LapState = 'upcoming' | 'active' | 'done'

export interface LapRow {
  position: number
  horse: Horse
  time?: string
}

export interface HorseIconProps {
  color: string
  size?: number | string
  width?: number | string
  height?: number | string
  galloping?: boolean
}
