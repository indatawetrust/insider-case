/**
 * Smoothly scrolls the window to the top (race track view),
 * respecting the user's reduced motion preferences.
 */
export function scrollToTop(): void {
  if (typeof window === 'undefined' || typeof window.scrollTo !== 'function') return

  const scrollY = window.scrollY ?? document.documentElement.scrollTop ?? 0
  if (scrollY === 0) return

  const prefersReduced =
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches

  window.scrollTo({
    top: 0,
    behavior: prefersReduced ? 'auto' : 'smooth',
  })
}
