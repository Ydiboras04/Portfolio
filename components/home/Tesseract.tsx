'use client'

import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react'
import { useReducedMotion } from '@/lib/hooks/useReducedMotion'
import type { GithubProject } from '@/lib/content/github'

// A tesseract (4D hypercube) rendered to a 2D canvas, with each public repo
// pinned to a vertex. The 16 vertices are every sign combination of four
// coordinates; the figure is rotated in several 4D planes, projected 4D -> 3D
// (a perspective divide by the w axis -- the signature "cube inside a cube")
// then 3D -> 2D. Repo labels are real <a> links positioned over the projected
// vertices, so the feature is keyboard-navigable and works (as a plain list)
// without JavaScript.
//
// Interaction: it auto-rotates gently, but eases to a stop whenever the pointer
// is over it or a project is focused, so labels can be read and clicked. Drag
// to spin it by hand in 4D; arrow keys rove between projects; tap (touch) to
// focus then tap again to open. A focus panel with a leader line shows the
// focused repo's details.
//
// Invariants: rotation never runs under prefers-reduced-motion (static, still
// draggable); the draw loop idle-stops so it never burns the main thread when
// nothing is moving, and pauses entirely off-screen; no `will-change` class
// (reserved for the cursor reticle); the wrapper clips, so nothing can add
// horizontal page scroll.

// 16 vertices: coord c in {-1,+1} from bit c of the index (bit 3 is the w axis).
const VERTS: number[][] = Array.from({ length: 16 }, (_, i) => [
  i & 1 ? 1 : -1,
  i & 2 ? 1 : -1,
  i & 4 ? 1 : -1,
  i & 8 ? 1 : -1,
])

// 32 edges: every pair of vertices differing in exactly one coordinate. `w` marks
// the 8 edges along the 4th axis -- the struts joining the inner and outer cube.
const EDGES: { a: number; b: number; w: boolean }[] = []
for (let i = 0; i < 16; i++) {
  for (let b = 0; b < 4; b++) {
    const j = i ^ (1 << b)
    if (j > i) EDGES.push({ a: i, b: j, w: b === 3 })
  }
}

const DIST_4D = 2.6
const DIST_3D = 4.2

// Gentle idle rotation rates (radians/sec) per plane: XW, YW, YZ.
const RATE_XW = 0.12
const RATE_YW = 0.045
const RATE_YZ = 0.08
const DRAG_K = 0.007 // radians per pixel dragged

// GitHub-style language colours; anything unlisted falls back to brand amber.
const LANG_COLORS: Record<string, string> = {
  TypeScript: '#3178c6',
  JavaScript: '#f1e05a',
  Python: '#3572A5',
  'Jupyter Notebook': '#DA5B0B',
  CSS: '#8a63d2',
  HTML: '#e34c26',
  Java: '#b07219',
  'C#': '#178600',
  'C++': '#f34b7d',
  C: '#8a94a0',
  Go: '#00ADD8',
  Rust: '#dea584',
  Ruby: '#701516',
  PHP: '#8c93c6',
  Shell: '#89e051',
  Dart: '#00B4AB',
  Kotlin: '#A97BFF',
  Swift: '#F05138',
  Vue: '#41b883',
}
const AMBER = '#E8A33D'
function langColor(lang: string): string {
  return LANG_COLORS[lang] ?? AMBER
}
// Parse "#rrggbb" to an "r,g,b" string for rgba() interpolation.
function rgb(hex: string): string {
  const n = parseInt(hex.slice(1), 16)
  return `${(n >> 16) & 255},${(n >> 8) & 255},${n & 255}`
}

function rotate(p: number[], a: number, b: number, angle: number) {
  const c = Math.cos(angle)
  const s = Math.sin(angle)
  const pa = p[a]
  const pb = p[b]
  p[a] = pa * c - pb * s
  p[b] = pa * s + pb * c
}

interface Projected {
  x: number
  y: number
  depth: number
}

const neverChanges = () => () => {}

export function Tesseract({
  projects,
  hint,
  viewLabel,
}: {
  projects: GithubProject[]
  hint: string
  viewLabel: string
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const wrapRef = useRef<HTMLDivElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const labelRefs = useRef<(HTMLLIElement | null)[]>([])
  const linkRefs = useRef<(HTMLAnchorElement | null)[]>([])
  const reduced = useReducedMotion()
  const mounted = useSyncExternalStore(neverChanges, () => true, () => false)

  const [hovered, setHovered] = useState<number | null>(null)
  const hoveredRef = useRef<number | null>(null)

  const n = Math.min(projects.length, 16)
  // Each project owns a vertex (and, with <=8 projects, both of its w copies);
  // the label sits on the outer (w=+1) copy. `projectOf` maps every vertex to
  // its project, so hovering either cube's corner focuses the same project and
  // every node can be coloured by language.
  const { labelVertex, projectOf } = useMemo(() => {
    const compact = n <= 8
    const lv: number[] = []
    const po: (number | null)[] = Array(16).fill(null)
    for (let j = 0; j < n; j++) {
      if (compact) {
        lv[j] = j | 8
        po[j] = j
        po[j | 8] = j
      } else {
        lv[j] = j
        po[j] = j
      }
    }
    return { labelVertex: lv, projectOf: po }
  }, [n])

  useEffect(() => {
    hoveredRef.current = hovered
  }, [hovered])

  useEffect(() => {
    if (!mounted) return
    const canvas = canvasRef.current
    const wrap = wrapRef.current
    if (!canvas || !wrap) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const size = { w: 0, h: 0, dpr: 1 }
    // A flattering starting pose (used as-is under reduced motion).
    const ang = { xw: 0.5, yw: 0.3, yz: 0.22 }
    const nodePos: Projected[] = Array.from({ length: 16 }, () => ({ x: 0, y: 0, depth: 0 }))

    // Rotation runs at `speed` (0..1), eased toward `target`. target is 0 while
    // the pointer/focus is in the figure (so it holds still to be read) or under
    // reduced motion, else 1.
    let speed = reduced ? 0 : 1
    let target = reduced ? 0 : 1
    let pointerInside = false
    let dragging = false
    let dragArmed = false
    let activePointer: number | null = null
    let lastX = 0
    let lastY = 0

    function recomputeTarget() {
      target = reduced || pointerInside || dragging || hoveredRef.current != null ? 0 : 1
    }

    function depthNorm(z: number) {
      return Math.max(0, Math.min(1, (z + 0.65) / 1.3))
    }

    function resize() {
      const rect = wrap!.getBoundingClientRect()
      size.w = rect.width
      size.h = rect.height
      size.dpr = Math.min(window.devicePixelRatio || 1, 2)
      canvas!.width = Math.round(size.w * size.dpr)
      canvas!.height = Math.round(size.h * size.dpr)
    }

    function draw() {
      const { w, h, dpr } = size
      if (w === 0 || h === 0) return
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx!.clearRect(0, 0, w, h)
      const cx = w / 2
      const cy = h / 2
      const scale = Math.min(w, h) * 1.7

      for (let i = 0; i < 16; i++) {
        const p = VERTS[i].slice()
        rotate(p, 0, 3, ang.xw)
        rotate(p, 1, 3, ang.yw)
        rotate(p, 1, 2, ang.yz)
        const s4 = 1 / (DIST_4D - p[3])
        const x3 = p[0] * s4
        const y3 = p[1] * s4
        const z3 = p[2] * s4
        const s3 = 1 / (DIST_3D - z3)
        nodePos[i].x = cx + x3 * s3 * scale
        nodePos[i].y = cy - y3 * s3 * scale
        nodePos[i].depth = z3
      }

      const h0 = hoveredRef.current

      // Edges, back to front, faded by depth; the hovered project's edges glow.
      const order = EDGES.map((e) => ({ ...e, z: (nodePos[e.a].depth + nodePos[e.b].depth) / 2 }))
      order.sort((e1, e2) => e1.z - e2.z)
      for (const { a, b, w: isW } of order) {
        const pa = nodePos[a]
        const pb = nodePos[b]
        const fade = 0.45 + 0.55 * depthNorm((pa.depth + pb.depth) / 2)
        let own = 0
        if (h0 != null) own = (projectOf[a] === h0 ? 1 : 0) + (projectOf[b] === h0 ? 1 : 0)
        ctx!.lineWidth = own === 2 ? 1.8 : own === 1 ? 1.1 : isW ? 0.9 : 0.8
        ctx!.strokeStyle =
          own >= 1
            ? `rgba(232,163,61,${(own === 2 ? 0.95 : 0.6) * fade})`
            : isW
              ? `rgba(232,163,61,${0.2 * fade})`
              : `rgba(220,228,236,${0.18 * fade})`
        ctx!.beginPath()
        ctx!.moveTo(pa.x, pa.y)
        ctx!.lineTo(pb.x, pb.y)
        ctx!.stroke()
      }

      // Leader line from the focused vertex to the panel.
      if (h0 != null && panelRef.current) {
        const node = nodePos[labelVertex[h0]]
        const pr = panelRef.current.getBoundingClientRect()
        const cr = canvas!.getBoundingClientRect()
        const ax = pr.left - cr.left + pr.width / 2
        const ay = pr.top - cr.top
        ctx!.strokeStyle = 'rgba(232,163,61,0.35)'
        ctx!.lineWidth = 0.8
        ctx!.beginPath()
        ctx!.moveTo(node.x, node.y)
        ctx!.lineTo(ax, ay)
        ctx!.stroke()
        ctx!.beginPath()
        ctx!.arc(ax, ay, 1.6, 0, Math.PI * 2)
        ctx!.fillStyle = 'rgba(232,163,61,0.8)'
        ctx!.fill()
      }

      // Vertex nodes, coloured by language; the focused project's nodes glow.
      for (let i = 0; i < 16; i++) {
        const p = nodePos[i]
        const owner = projectOf[i]
        const isHot = h0 != null && owner === h0
        const fade = 0.5 + 0.5 * depthNorm(p.depth)
        const dscale = 0.85 + 0.3 * depthNorm(p.depth)
        const r = (isHot ? 3.6 : owner != null ? 2.3 : 1.4) * dscale
        let fill: string
        if (owner != null) {
          const col = rgb(langColor(projects[owner].language))
          fill = `rgba(${col},${(isHot ? 1 : 0.8) * fade})`
          if (isHot) {
            ctx!.shadowColor = `rgba(${col},0.9)`
            ctx!.shadowBlur = 12
          }
        } else {
          fill = `rgba(220,228,236,${0.5 * fade})`
        }
        ctx!.beginPath()
        ctx!.arc(p.x, p.y, r, 0, Math.PI * 2)
        ctx!.fillStyle = fill
        ctx!.fill()
        ctx!.shadowBlur = 0
      }

      // Position label links over their vertices; front labels take the pointer.
      for (let j = 0; j < n; j++) {
        const el = labelRefs.current[j]
        if (!el) continue
        const p = nodePos[labelVertex[j]]
        const front = depthNorm(p.depth)
        el.style.transform = `translate(-50%,-50%) translate(${p.x}px,${p.y}px)`
        el.style.opacity = String(0.28 + 0.72 * front)
        el.style.zIndex = String(10 + Math.round(front * 20) + (h0 === j ? 40 : 0))
        el.style.pointerEvents = front > 0.42 ? 'auto' : 'none'
      }
    }

    // ---- The idle-stopping animation loop ------------------------------------
    let raf = 0
    let last = 0
    let onScreen = false

    function atRest() {
      return !dragging && speed < 0.002 && Math.abs(target - speed) < 0.002
    }

    function frame(now: number) {
      const dt = Math.min(0.05, (now - last) / 1000)
      last = now
      speed += (target - speed) * Math.min(1, dt * 4)
      if (!reduced && !dragging) {
        ang.xw += RATE_XW * speed * dt
        ang.yw += RATE_YW * speed * dt
        ang.yz += RATE_YZ * speed * dt
      }
      draw()
      if (atRest()) {
        raf = 0
      } else {
        raf = requestAnimationFrame(frame)
      }
    }

    function ensureRunning() {
      if (!onScreen || raf) return
      last = performance.now()
      raf = requestAnimationFrame(frame)
    }

    // ---- Interaction ---------------------------------------------------------
    function hitTest(mx: number, my: number): number | null {
      let best: number | null = null
      let bestD = 28 * 28
      for (let i = 0; i < 16; i++) {
        const owner = projectOf[i]
        if (owner == null) continue
        const p = nodePos[i]
        if (depthNorm(p.depth) <= 0.42) continue
        const dx = p.x - mx
        const dy = p.y - my
        const d = dx * dx + dy * dy
        if (d < bestD) {
          bestD = d
          best = owner
        }
      }
      return best
    }

    function setHover(idx: number | null) {
      if (idx === hoveredRef.current) return
      hoveredRef.current = idx
      setHovered(idx)
      recomputeTarget()
      ensureRunning()
    }

    function openProject(idx: number) {
      const url = projects[idx].url
      if (/^https:\/\/(www\.)?github\.com\//.test(url)) {
        window.open(url, '_blank', 'noopener,noreferrer')
      }
    }

    function localPoint(e: PointerEvent) {
      const rect = canvas!.getBoundingClientRect()
      return { x: e.clientX - rect.left, y: e.clientY - rect.top }
    }

    function onPointerDown(e: PointerEvent) {
      // Taps/clicks on a label link are handled natively (open / focus).
      if ((e.target as HTMLElement).closest('a')) return
      activePointer = e.pointerId
      dragArmed = true
      dragging = false
      lastX = e.clientX
      lastY = e.clientY
      wrap!.setPointerCapture(e.pointerId)
    }

    function onPointerMove(e: PointerEvent) {
      pointerInside = true
      if (dragArmed && e.pointerId === activePointer) {
        const dx = e.clientX - lastX
        const dy = e.clientY - lastY
        if (!dragging && Math.hypot(dx, dy) > 5) dragging = true
        if (dragging) {
          ang.xw += dx * DRAG_K
          ang.yw += dy * DRAG_K
          lastX = e.clientX
          lastY = e.clientY
          recomputeTarget()
          ensureRunning()
          return
        }
      }
      // Hover hit-test (mouse). Skipped mid-drag above.
      const { x, y } = localPoint(e)
      setHover(hitTest(x, y))
      recomputeTarget()
      ensureRunning()
    }

    function onPointerUp(e: PointerEvent) {
      if (e.pointerId === activePointer) {
        if (wrap!.hasPointerCapture(e.pointerId)) wrap!.releasePointerCapture(e.pointerId)
        activePointer = null
      }
      // Touch has no persistent hover, so the finger lifting ends "inside";
      // otherwise the figure would stay paused forever after one tap.
      if (e.pointerType !== 'mouse') pointerInside = false
      if (dragging) {
        dragging = false
        dragArmed = false
        recomputeTarget()
        ensureRunning()
        return
      }
      dragArmed = false
      if ((e.target as HTMLElement).closest('a')) return
      // A tap/click on the body: focus the nearest project, or open it if it is
      // already the focused one (so touch is focus-then-open, mouse is click-open).
      const { x, y } = localPoint(e)
      const hit = hitTest(x, y)
      if (hit != null && hit === hoveredRef.current) openProject(hit)
      else setHover(hit)
      recomputeTarget()
      ensureRunning()
    }

    function onPointerLeave() {
      pointerInside = false
      // Keep the focus while mid-drag (the pointer is captured and may stray
      // outside the box); otherwise a mouse leaving clears the hover.
      if (!dragging) setHover(null)
      recomputeTarget()
      ensureRunning()
    }

    // Arrow keys rove between projects (focus moves the real <a>, which sets hover).
    function onKeyDown(e: KeyboardEvent) {
      if (!['ArrowRight', 'ArrowLeft', 'ArrowUp', 'ArrowDown'].includes(e.key)) return
      e.preventDefault()
      const cur = hoveredRef.current ?? -1
      const dir = e.key === 'ArrowRight' || e.key === 'ArrowDown' ? 1 : -1
      const next = (cur + dir + n) % n
      linkRefs.current[next]?.focus()
    }

    resize()
    const ro = new ResizeObserver(() => {
      resize()
      ensureRunning()
    })
    ro.observe(wrap)

    const io = new IntersectionObserver(
      ([entry]) => {
        onScreen = entry.isIntersecting
        if (onScreen) ensureRunning()
        else if (raf) {
          cancelAnimationFrame(raf)
          raf = 0
        }
      },
      { rootMargin: '150px' },
    )
    io.observe(wrap)

    wrap.addEventListener('pointerdown', onPointerDown)
    wrap.addEventListener('pointermove', onPointerMove)
    wrap.addEventListener('pointerup', onPointerUp)
    wrap.addEventListener('pointerleave', onPointerLeave)
    wrap.addEventListener('keydown', onKeyDown)

    return () => {
      ro.disconnect()
      io.disconnect()
      wrap.removeEventListener('pointerdown', onPointerDown)
      wrap.removeEventListener('pointermove', onPointerMove)
      wrap.removeEventListener('pointerup', onPointerUp)
      wrap.removeEventListener('pointerleave', onPointerLeave)
      wrap.removeEventListener('keydown', onKeyDown)
      if (raf) cancelAnimationFrame(raf)
    }
  }, [mounted, reduced, projects, n, labelVertex, projectOf])

  const active = hovered != null ? projects[hovered] : null
  const activeColor = active ? langColor(active.language) : AMBER

  return (
    <div
      ref={wrapRef}
      className={
        'relative overflow-hidden ' +
        (mounted ? 'h-[440px] touch-none select-none sm:h-[560px]' : '')
      }
    >
      {mounted && <canvas ref={canvasRef} aria-hidden className="block h-full w-full" />}

      {/* Real links: the accessible, no-JS, crawlable representation. Before
          mount they lay out as a simple wrapping list; once mounted they are
          positioned over the vertices and roved with the arrow keys. */}
      <ul role="list" className={mounted ? 'absolute inset-0' : 'flex flex-wrap gap-x-5 gap-y-2'}>
        {projects.map((p, j) => (
          <li
            key={p.name}
            ref={(el) => {
              labelRefs.current[j] = el
            }}
            className={mounted ? 'absolute left-0 top-0' : ''}
          >
            <a
              ref={(el) => {
                linkRefs.current[j] = el
              }}
              href={p.url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${p.label}${p.description ? ` — ${p.description}` : ''} (GitHub)`}
              onFocus={() => setHovered(j)}
              onBlur={() => setHovered(null)}
              onPointerEnter={() => setHovered(j)}
              className={
                'block max-w-[108px] rounded-[3px] px-1 py-0.5 text-center font-mono text-[9.5px] ' +
                'leading-[1.25] tracking-[0.01em] transition-colors duration-150 ease-instrument ' +
                'focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber ' +
                (hovered === j ? 'bg-amber/10 text-amber' : 'text-dim hover:text-amber')
              }
            >
              {p.label}
            </a>
          </li>
        ))}
      </ul>

      {/* Focus panel: details of the focused project, or the interaction hint. */}
      {mounted && (
        <div
          ref={panelRef}
          className="pointer-events-none absolute bottom-3 left-3 right-3 max-w-[280px] rounded-[4px]
                     border border-line bg-bg/70 px-3 py-2.5 backdrop-blur-sm"
          aria-live="polite"
        >
          {active ? (
            <>
              <div className="mb-1 flex items-center gap-2">
                <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: activeColor }} aria-hidden />
                <span className="truncate font-display text-[13px] font-semibold tracking-[-0.01em] text-ink">
                  {active.label}
                </span>
              </div>
              <div className="mb-1.5 font-mono text-[9.5px] uppercase tracking-[0.14em] text-faint">
                {active.language || 'repo'} · ★ {active.stars}
              </div>
              {active.description ? (
                <p className="mb-2 line-clamp-2 text-[11.5px] leading-[1.5] text-dim">{active.description}</p>
              ) : null}
              <a
                href={active.url}
                target="_blank"
                rel="noopener noreferrer"
                className="pointer-events-auto inline-flex items-center gap-1 font-mono text-[10px] uppercase
                           tracking-[0.11em] text-amber transition-colors duration-150 ease-instrument hover:text-amber-bright"
              >
                {viewLabel} <span aria-hidden>↗</span>
              </a>
            </>
          ) : (
            <span className="label">{hint}</span>
          )}
        </div>
      )}
    </div>
  )
}
