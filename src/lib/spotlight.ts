import type { PointerEvent } from 'react'

export function updateSpotlightPosition(event: PointerEvent<HTMLElement>) {
  const rect = event.currentTarget.getBoundingClientRect()
  event.currentTarget.style.setProperty('--spotlight-x', `${event.clientX - rect.left}px`)
  event.currentTarget.style.setProperty('--spotlight-y', `${event.clientY - rect.top}px`)
}
