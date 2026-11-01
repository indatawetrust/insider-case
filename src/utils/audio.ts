import { loadFromStorage, saveToStorage, STORAGE_KEYS } from './storage'

let audioCtx: AudioContext | null = null
let isMuted = loadFromStorage<boolean>(STORAGE_KEYS.SOUND, false)
let gallopTimer: ReturnType<typeof setInterval> | null = null

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null
  const AudioContextClass =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
  if (!AudioContextClass) return null

  if (!audioCtx) {
    try {
      audioCtx = new AudioContextClass()
    } catch {
      return null
    }
  }

  if (audioCtx.state === 'suspended') {
    void audioCtx.resume()
  }

  return audioCtx
}

export function isSoundMuted(): boolean {
  return isMuted
}

export function setSoundMuted(muted: boolean): void {
  isMuted = muted
  saveToStorage(STORAGE_KEYS.SOUND, muted)
  if (muted) {
    stopGalloping()
  }
}

export function toggleSound(): boolean {
  setSoundMuted(!isMuted)
  return isMuted
}

/** Plays a countdown tick (3, 2, 1). */
export function playCountdownTick(step: number): void {
  if (isMuted) return
  const ctx = getAudioContext()
  if (!ctx) return

  const now = ctx.currentTime
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()

  osc.type = 'sine'
  osc.frequency.setValueAtTime(step === 1 ? 784 : 523.25, now)

  gain.gain.setValueAtTime(0.2, now)
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08)

  osc.connect(gain)
  gain.connect(ctx.destination)

  osc.start(now)
  osc.stop(now + 0.08)
}

/** Plays the racecourse start brass bell when the gates open. */
export function playStartBell(): void {
  if (isMuted) return
  const ctx = getAudioContext()
  if (!ctx) return

  const now = ctx.currentTime
  const frequencies = [587.33, 880, 1174.66]
  const weights = [0.25, 0.15, 0.08]

  frequencies.forEach((freq, idx) => {
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()

    osc.type = 'sine'
    osc.frequency.setValueAtTime(freq, now)

    const initialGain = weights[idx] ?? 0.1
    gain.gain.setValueAtTime(initialGain, now)
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.2)

    osc.connect(gain)
    gain.connect(ctx.destination)

    osc.start(now)
    osc.stop(now + 1.2)
  })
}

/** Plays a single hoof-beat strike. */
function playHoofBeat(ctx: AudioContext, time: number, pitch = 140): void {
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()

  osc.type = 'triangle'
  osc.frequency.setValueAtTime(pitch, time)
  osc.frequency.exponentialRampToValueAtTime(50, time + 0.035)

  gain.gain.setValueAtTime(0.12, time)
  gain.gain.exponentialRampToValueAtTime(0.001, time + 0.035)

  osc.connect(gain)
  gain.connect(ctx.destination)

  osc.start(time)
  osc.stop(time + 0.035)
}

/** Starts rhythmic horse galloping soundscape. */
export function startGalloping(): void {
  if (isMuted || gallopTimer) return
  const ctx = getAudioContext()
  if (!ctx) return

  const triggerPaces = () => {
    if (isMuted || !audioCtx) return
    const now = audioCtx.currentTime
    // 2-beat cadence (clip-clop)
    playHoofBeat(audioCtx, now, 150)
    playHoofBeat(audioCtx, now + 0.07, 130)
  }

  triggerPaces()
  gallopTimer = setInterval(triggerPaces, 320)
}

/** Stops galloping soundscape. */
export function stopGalloping(): void {
  if (gallopTimer) {
    clearInterval(gallopTimer)
    gallopTimer = null
  }
}

/** Plays a victorious chime when a lap/race finishes. */
export function playFinishFanfare(): void {
  if (isMuted) return
  const ctx = getAudioContext()
  if (!ctx) return

  const notes = [523.25, 659.25, 783.99, 1046.5] // C5, E5, G5, C6
  const startAt = ctx.currentTime

  notes.forEach((freq, i) => {
    const noteTime = startAt + i * 0.09
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()

    osc.type = 'sine'
    osc.frequency.setValueAtTime(freq, noteTime)

    gain.gain.setValueAtTime(0.2, noteTime)
    gain.gain.exponentialRampToValueAtTime(0.001, noteTime + 0.7)

    osc.connect(gain)
    gain.connect(ctx.destination)

    osc.start(noteTime)
    osc.stop(noteTime + 0.7)
  })
}
