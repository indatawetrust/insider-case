import type { Horse } from './horse'

export type LapState = 'upcoming' | 'active' | 'done'

export interface LapRow {
  position: number
  horse: Horse
  time?: string
}

export interface LapTableProps {
  lapNumber: number
  distance: number
  rows: LapRow[]
  state?: LapState
  /** Highlights the podium (results view). */
  podium?: boolean
}

export interface BasePanelProps {
  title: string
  accent: string
}

export interface HorseIconProps {
  color: string
  size?: number | string
  width?: number | string
  height?: number | string
  galloping?: boolean
}
