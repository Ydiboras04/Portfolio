'use client'

import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react'
import { useReducedMotion } from '@/lib/hooks/useReducedMotion'
import type { GithubProject } from '@/lib/content/github'

// Flips false -> true once on the client, with no setState-in-effect: the
// server snapshot is false (so the <ul> renders as a plain, crawlable list and
// no <canvas> is emitted), the client snapshot true (canvas + positioned
// labels). Mirrors the useSyncExternalStore approach of useReducedMotion.
const neverChanges = () => () => {}

// A rotating 4D hypercube (tesseract) rendered to a 2D canvas, with each public
// repo pinned to a vertex. The 16 vertices are every sign combination of four
// coordinates; the figure is rotated in two 4D planes, projected 4D -> 3D (a
// perspective divide by the w axis, which produces the signature "cube inside a
// cube"), then 3D -> 2D. Repo labels are real <a> links positioned over the
// projected vertices each frame, so the feature is keyboard-navigable and works
// (as a plain list) without JavaScript.
//
// Conventions honoured: rotation stops under prefers-reduced-motion (a still
// tesseract, drawn once); no `will-change` class (the cursor reticle is the only
// one on the site); the wrapper clips, so a projected vertex can never add
// horizontal page scroll.

// 16 vertices: coord c ∈ {-1,+1} from bit c of the index (bit 3 is the w axis).
const VERTS: number[][] = Array.from({ length: 16 }, (_, i) => [
  i & 1 ? 1 : -1,
  i & 2 ? 1 : -1,
  i & 4 ? 1 : -1,
  i & 8 ? 1 : -1,
])

// 32 edges: every pair of vertices differing in exactly one coordinate. `w` marks
// the 8 edges along the 4th axis (the differing bit is the w bit) -- the struts
// joining the inner and outer cube, tinted so the 4D structure stays legible.
const EDGES: { a: number; b: number; w: boolean }[] = []
for (let i = 0; i < 16; i++) {
  for (let b = 0; b < 4; b++) {
    const j = i ^ (1 << b)
    if (j > i) EDGES.push({ a: i, b: j, w: b === 3 })
  }
}

const DIST_4D = 2.6 // viewer distance along w; controls the inner/outer cube gap
const DIST_3D = 4.2 // viewer distance along z; controls overall perspective

// Rotate a 4D point in the (a, b) plane, in place.
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
  depth: number // rotated z, for depth fading and hit-testing front vs back
}

export function Tesseract({ projects, hint }: { projects: GithubProject[]; hint: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const wrapRef = useRef<HTMLDivElement>(null)
  const labelRefs = useRef<(HTMLLIElement | null)[]>([])
  const reduced = useReducedMotion()

  // Hover is React state (changes rarely) for the info bar; the draw loop reads
  // the ref to avoid re-rendering every frame.
  const [hovered, setHovered] = useState<number | null>(null)
  const hoveredRef = useRef<number | null>(null)
  const mounted = useSyncExternalStore(neverChanges, () => true, () => false)

  // Which vertex carries each project's label, and which project (if any) owns
  // each vertex -- used to highlight a project's vertices and its connecting
  // "pillar" edge on hover. With <=8 projects, each takes a cube corner (x,y,z)
  // and owns both of its w copies (indices j and j|8); the label sits on the
  // outer (w=+1) copy. With 9..16, each project simply takes one whole vertex.
  const n = Math.min(projects.length, 16)
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
    // Projected label-vertex positions in CSS pixels, refreshed each draw so the
    // pointer handler can hit-test without recomputing the projection.
    const labelPos: Projected[] = []

    function resize() {
      const rect = wrap!.getBoundingClientRect()
      size.w = rect.width
      size.h = rect.height
      size.dpr = Math.min(window.devicePixelRatio || 1, 2)
      canvas!.width = Math.round(size.w * size.dpr)
      canvas!.height = Math.round(size.h * size.dpr)
    }

    function draw(t: number) {
      const { w, h, dpr } = size
      if (w === 0 || h === 0) return
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx!.clearRect(0, 0, w, h)

      const cx = w / 2
      const cy = h / 2
      // The 4D->3D->2D perspective divides shrink the figure to a small
      // fraction of unit coordinates (the farthest vertex projects to radius
      // ~0.25), so scale is large. 1.7x keeps the outer cube at ~0.42·min-dim
      // from centre -- big and dramatic, but always clear of the rim.
      const scale = Math.min(w, h) * 1.7

      // Rotate + project all 16 vertices. Two w-planes give a lively 4D tumble;
      // a slow in-space spin keeps it from looking like a flat pulsing.
      const pts: Projected[] = VERTS.map((v) => {
        const p = v.slice()
        rotate(p, 0, 3, t * 0.23)
        rotate(p, 1, 2, t * 0.17)
        rotate(p, 0, 1, t * 0.07)
        const s4 = 1 / (DIST_4D - p[3])
        const x3 = p[0] * s4
        const y3 = p[1] * s4
        const z3 = p[2] * s4
        const s3 = 1 / (DIST_3D - z3)
        return { x: cx + x3 * s3 * scale, y: cy - y3 * s3 * scale, depth: z3 }
      })

      const h0 = hoveredRef.current
      const po = projectOf

      // Edges, back to front, faded by depth. An edge is emphasised when it
      // touches the hovered project (fully, for its w-pillar; partly otherwise).
      const order = EDGES.map((e) => ({ ...e, z: (pts[e.a].depth + pts[e.b].depth) / 2 }))
      order.sort((e1, e2) => e1.z - e2.z)
      for (const { a, b, w: isW } of order) {
        const pa = pts[a]
        const pb = pts[b]
        const fade = 0.45 + 0.55 * depthNorm((pa.depth + pb.depth) / 2)
        let own = 0
        if (h0 != null) own = (po[a] === h0 ? 1 : 0) + (po[b] === h0 ? 1 : 0)
        ctx!.lineWidth = own === 2 ? 1.8 : own === 1 ? 1.1 : isW ? 0.9 : 0.8
        ctx!.strokeStyle =
          own >= 1
            ? `rgba(232,163,61,${(own === 2 ? 0.95 : 0.6) * fade})`
            : isW
              ? `rgba(232,163,61,${0.22 * fade})`
              : `rgba(220,228,236,${0.2 * fade})`
        ctx!.beginPath()
        ctx!.moveTo(pa.x, pa.y)
        ctx!.lineTo(pb.x, pb.y)
        ctx!.stroke()
      }

      // Vertex nodes. Labelled vertices are amber; the hovered project's glow.
      for (let i = 0; i < 16; i++) {
        const p = pts[i]
        const owner = po[i]
        const isHot = h0 != null && owner === h0
        const labelled = owner != null
        const fade = 0.5 + 0.5 * depthNorm(p.depth)
        const r = (isHot ? 3.4 : labelled ? 2.3 : 1.4) * (0.85 + 0.3 * depthNorm(p.depth))
        if (isHot) {
          ctx!.shadowColor = 'rgba(232,163,61,0.9)'
          ctx!.shadowBlur = 12
        }
        ctx!.beginPath()
        ctx!.arc(p.x, p.y, r, 0, Math.PI * 2)
        ctx!.fillStyle = labelled
          ? `rgba(232,163,61,${(isHot ? 1 : 0.85) * fade})`
          : `rgba(220,228,236,${0.5 * fade})`
        ctx!.fill()
        ctx!.shadowBlur = 0
      }

      // Position the label links over their vertices.
      const lv = labelVertex
      for (let j = 0; j < n; j++) {
        const el = labelRefs.current[j]
        if (!el) continue
        const p = pts[lv[j]]
        labelPos[j] = p
        const front = depthNorm(p.depth) // 0 (back) .. 1 (front)
        el.style.transform = `translate(-50%,-50%) translate(${p.x}px,${p.y}px)`
        el.style.opacity = String(0.32 + 0.68 * front)
        el.style.zIndex = String(10 + Math.round(front * 20) + (h0 === j ? 40 : 0))
        // Only front-facing labels take the pointer, so a back label behind the
        // cube never steals a hover meant for the one in front.
        el.style.pointerEvents = front > 0.42 ? 'auto' : 'none'
      }
    }

    function depthNorm(z: number) {
      // Rotated z lands roughly within [-0.65, 0.65]; map to [0, 1].
      return Math.max(0, Math.min(1, (z + 0.65) / 1.3))
    }

    function onMove(e: PointerEvent) {
      const rect = canvas!.getBoundingClientRect()
      const mx = e.clientX - rect.left
      const my = e.clientY - rect.top
      let best: number | null = null
      let bestD = 26 * 26
      for (let j = 0; j < n; j++) {
        const p = labelPos[j]
        if (!p || depthNorm(p.depth) <= 0.42) continue
        const dx = p.x - mx
        const dy = p.y - my
        const d = dx * dx + dy * dy
        if (d < bestD) {
          bestD = d
          best = j
        }
      }
      if (best !== hoveredRef.current) {
        hoveredRef.current = best
        setHovered(best)
        if (reduced) draw(FROZEN_T) // no loop running; refresh the highlight
      }
    }

    function onLeave() {
      if (hoveredRef.current != null) {
        hoveredRef.current = null
        setHovered(null)
        if (reduced) draw(FROZEN_T)
      }
    }

    function onClick() {
      const h0 = hoveredRef.current
      if (h0 == null) return
      // Defensive: only ever open a github.com https URL, never whatever string
      // happened to arrive in the data.
      const url = projects[h0].url
      if (/^https:\/\/(www\.)?github\.com\//.test(url)) {
        window.open(url, '_blank', 'noopener,noreferrer')
      }
    }

    const FROZEN_T = 3.3 // a flattering static pose for the reduced-motion case

    resize()
    const ro = new ResizeObserver(() => {
      resize()
      if (reduced) draw(FROZEN_T)
    })
    ro.observe(wrap)

    wrap.addEventListener('pointermove', onMove)
    wrap.addEventListener('pointerleave', onLeave)
    wrap.addEventListener('click', onClick)

    // Only animate while the tesseract is actually on screen. Off-screen, a
    // per-frame canvas redraw is pure wasted main-thread work -- it also starves
    // the page's native smooth-scroll and keyboard handling while the reader is
    // up in the header, far from this section.
    let raf = 0
    let start = 0
    function tick(now: number) {
      draw((now - start) / 1000)
      raf = requestAnimationFrame(tick)
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          if (reduced) {
            draw(FROZEN_T)
          } else if (!raf) {
            start = performance.now()
            raf = requestAnimationFrame(tick)
          }
        } else if (raf) {
          cancelAnimationFrame(raf)
          raf = 0
        }
      },
      { rootMargin: '150px' },
    )
    io.observe(wrap)

    return () => {
      ro.disconnect()
      io.disconnect()
      wrap.removeEventListener('pointermove', onMove)
      wrap.removeEventListener('pointerleave', onLeave)
      wrap.removeEventListener('click', onClick)
      if (raf) cancelAnimationFrame(raf)
    }
    // labelVertex/projectOf are memoised from n, so stable for a given projects prop.
  }, [mounted, reduced, projects, n, labelVertex, projectOf])

  const active = hovered != null ? projects[hovered] : null

  return (
    <div>
      <div
        ref={wrapRef}
        className={
          'relative overflow-hidden ' +
          (mounted ? 'h-[420px] cursor-pointer sm:h-[520px]' : '')
        }
      >
        {mounted && <canvas ref={canvasRef} aria-hidden className="block h-full w-full" />}

        {/* Real links: the accessible, no-JS, crawlable representation of the
            projects. Before mount (and without JS) they lay out as a simple
            wrapping list; once mounted they are positioned over the vertices. */}
        <ul
          role="list"
          className={mounted ? 'absolute inset-0' : 'flex flex-wrap gap-x-5 gap-y-2'}
        >
          {projects.map((p, j) => (
            <li
              key={p.name}
              ref={(el) => {
                labelRefs.current[j] = el
              }}
              className={mounted ? 'absolute left-0 top-0' : ''}
            >
              <a
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
                  (hovered === j
                    ? 'bg-amber/10 text-amber'
                    : 'text-dim hover:text-amber')
                }
              >
                {p.label}
              </a>
            </li>
          ))}
        </ul>
      </div>

      {/* Info bar: details of the focused project, or the interaction hint. */}
      <p className="mt-3 min-h-[2.4em] text-[12.5px] leading-[1.5] text-dim" aria-live="polite">
        {active ? (
          <>
            <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-amber">
              {active.language || 'repo'} · ★ {active.stars}
            </span>
            {active.description ? <span className="ml-2">{active.description}</span> : null}
          </>
        ) : (
          <span className="label">{hint}</span>
        )}
      </p>
    </div>
  )
}
