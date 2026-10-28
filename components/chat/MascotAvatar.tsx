'use client'

import { Component, Suspense, lazy, type ReactNode } from 'react'
import { Mascot } from './Mascot'

// Loads the WebGL mascot only in the browser (three.js is heavy and client-only).
// The flat SVG Mascot is the fallback at three points: during SSR, while the 3D
// chunk is still downloading, and if WebGL fails to initialise on the device.
//
// `enable3D` gates whether the WebGL canvas mounts at all. The always-on-screen
// launcher keeps it false while idle — showing the lightweight SVG — and flips
// it true on hover/focus, so no WebGL context is created (nor three.js loaded)
// until the viewer actually engages. That keeps first load light and the page
// responsive; the 3D is reserved for the moment of interaction.
const Mascot3D = lazy(() => import('./Mascot3D'))

class WebGLBoundary extends Component<{ fallback: ReactNode; children: ReactNode }, { failed: boolean }> {
  state = { failed: false }
  static getDerivedStateFromError() {
    return { failed: true }
  }
  render() {
    return this.state.failed ? this.props.fallback : this.props.children
  }
}

export function MascotAvatar({
  size = 40,
  animate = true,
  enable3D = true,
  fallback,
}: { size?: number; animate?: boolean; enable3D?: boolean; fallback?: ReactNode }) {
  // The fallback shows during SSR, while the 3D chunk loads, and if WebGL fails.
  // Callers that already paint a matching still underneath (the launcher) pass
  // `fallback={null}` so a flat SVG never flashes over their 3D-looking still.
  const flat = fallback === undefined ? <Mascot size={size} animate={animate} /> : fallback
  if (!enable3D) return flat
  return (
    <WebGLBoundary fallback={flat}>
      <Suspense fallback={flat}>
        <Mascot3D size={size} animate={animate} />
      </Suspense>
    </WebGLBoundary>
  )
}
