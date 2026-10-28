// A galaxy / "infinity" backdrop behind the whole page. Like Aurora, a
// negative-z fixed child of <body>: it paints above the body's grid but below
// all content, and is decorative and inert (aria-hidden, pointer-events-none).
//
// Three parallax star layers drift endlessly over a slowly swirling nebula.
// Each layer's drift moves the background by exactly one tile, so the repeating
// starfield loops with no seam -- a continuous fall through space. Running the
// layers at different speeds gives the depth that sells the "infinity" feel.
// All motion is disabled under prefers-reduced-motion by the global rule in
// globals.css, which leaves a still starfield (not a blank one).

// Deterministic PRNG (mulberry32). Star positions must be identical on the
// server and the client or React reports a hydration mismatch, so this is
// seeded, never Math.random().
function prng(seed: number) {
  let s = seed >>> 0
  return () => {
    s = (s + 0x6d2b79f5) | 0
    let t = Math.imul(s ^ (s >>> 15), 1 | s)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

// Build a `background-image` of `count` star dots scattered across a `tile`×`tile`
// square. background-size then tiles it across the viewport, and drifting by one
// tile height loops seamlessly. `color` may be a list, cycled through, so a layer
// can mix white with a few amber/blue stars.
function starfield(count: number, tile: number, maxSize: number, colors: string[], seed: number) {
  const rand = prng(seed)
  const dots: string[] = []
  for (let i = 0; i < count; i++) {
    const x = (rand() * tile).toFixed(1)
    const y = (rand() * tile).toFixed(1)
    const r = (0.4 + rand() * maxSize).toFixed(2)
    const color = colors[Math.floor(rand() * colors.length)]
    dots.push(`radial-gradient(${r}px ${r}px at ${x}px ${y}px, ${color}, transparent)`)
  }
  return dots.join(', ')
}

const WHITE_FAINT = 'rgba(255,255,255,0.4)'
const WHITE = 'rgba(255,255,255,0.7)'
const WHITE_BRIGHT = 'rgba(255,255,255,0.95)'
const AMBER = 'rgba(232,163,61,0.85)'
const BLUE = 'rgba(150,190,230,0.8)'

// Far → near. The nearest layer is brightest, biggest, fastest and twinkles;
// the farthest is a dim, slow dust. Seeds are fixed so the sky never shifts.
const LAYERS = [
  { tile: 300, image: starfield(55, 300, 1.0, [WHITE_FAINT], 1), speed: 260, maxO: 0.55 },
  { tile: 420, image: starfield(42, 420, 1.5, [WHITE, WHITE_FAINT], 2), speed: 170, maxO: 0.8, twk: 7 },
  { tile: 560, image: starfield(26, 560, 2.3, [WHITE_BRIGHT, WHITE, AMBER, BLUE], 3), speed: 95, maxO: 1, twk: 5 },
] as const

export function Galaxy() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div
        className="galaxy-nebula"
        style={{
          ['--speed' as string]: '220s',
          background:
            'radial-gradient(42% 55% at 32% 38%, rgba(232,163,61,0.08), transparent 70%),' +
            'radial-gradient(45% 48% at 70% 64%, rgba(95,168,211,0.07), transparent 70%),' +
            'radial-gradient(35% 40% at 58% 24%, rgba(140,120,200,0.05), transparent 70%)',
        }}
      />
      {LAYERS.map((l, i) => (
        <div
          key={i}
          className={`galaxy-layer${'twk' in l ? ' twinkle' : ''}`}
          style={{
            backgroundImage: l.image,
            backgroundSize: `${l.tile}px ${l.tile}px`,
            ['--tile' as string]: `${l.tile}px`,
            ['--speed' as string]: `${l.speed}s`,
            ['--max-o' as string]: String(l.maxO),
            ...('twk' in l ? { ['--twk' as string]: `${l.twk}s` } : null),
            opacity: l.maxO,
          }}
        />
      ))}
    </div>
  )
}
