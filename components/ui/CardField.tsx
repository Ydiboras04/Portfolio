// Ambient field of translucent "cards" drifting slowly behind the whole page.
// Like Aurora, a negative-z fixed child of <body>: it paints above the body's
// grid background but below all content, and is decorative and inert
// (aria-hidden, pointer-events-none). The drift is disabled under
// prefers-reduced-motion by the global rule in globals.css, which leaves the
// tiles as a static lattice rather than hiding them.
//
// The tile set is a fixed literal, not randomised, so server and client render
// identical markup (no hydration mismatch). `rot` is the tile's resting
// rotation, `dur` its drift period, and `delay` desynchronises the field.
// `glowDur`/`glowDelay` drive the ambient breathing halo, kept on cycles that
// differ from the drift so the light and the motion never beat together.
const TILES = [
  { top: '8%', left: '6%', w: 150, h: 96, kw: 'drift-a', rot: -8, dur: 26, delay: -4, opacity: 0.5, glowDur: 11, glowDelay: -2 },
  { top: '18%', left: '72%', w: 190, h: 120, kw: 'drift-b', rot: 6, dur: 31, delay: -11, opacity: 0.45, glowDur: 8, glowDelay: -5 },
  { top: '46%', left: '14%', w: 120, h: 150, kw: 'drift-b', rot: 10, dur: 29, delay: -7, opacity: 0.4, glowDur: 13, glowDelay: -9 },
  { top: '58%', left: '82%', w: 110, h: 110, kw: 'drift-a', rot: -5, dur: 34, delay: -2, opacity: 0.5, glowDur: 9, glowDelay: -1 },
  { top: '74%', left: '30%', w: 200, h: 112, kw: 'drift-a', rot: 4, dur: 24, delay: -15, opacity: 0.42, glowDur: 12, glowDelay: -7 },
  { top: '34%', left: '44%', w: 96, h: 96, kw: 'drift-b', rot: -12, dur: 33, delay: -9, opacity: 0.35, glowDur: 10, glowDelay: -4 },
  { top: '84%', left: '60%', w: 140, h: 90, kw: 'drift-b', rot: 8, dur: 27, delay: -5, opacity: 0.45, glowDur: 14, glowDelay: -11 },
  { top: '4%', left: '40%', w: 130, h: 82, kw: 'drift-a', rot: 11, dur: 30, delay: -18, opacity: 0.3, glowDur: 9, glowDelay: -6 },
] as const

export function CardField() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      {TILES.map((t, i) => (
        <div
          key={i}
          className={`card-tile ${t.kw}`}
          style={{
            top: t.top,
            left: t.left,
            width: t.w,
            height: t.h,
            opacity: t.opacity,
            // Custom properties consumed by the card-drift / card-glow keyframes.
            ['--r' as string]: `${t.rot}deg`,
            ['--dur' as string]: `${t.dur}s`,
            ['--glow-dur' as string]: `${t.glowDur}s`,
            ['--glow-delay' as string]: `${t.glowDelay}s`,
            animationDelay: `${t.delay}s`,
          }}
        />
      ))}
    </div>
  )
}
