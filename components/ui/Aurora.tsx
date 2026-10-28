// Ambient amber aurora behind the whole page. A negative-z child of <body>, so
// it paints above the body's grid background but below all content. Decorative
// and inert (aria-hidden, pointer-events-none); the drift animation is disabled
// under prefers-reduced-motion by the global rule in globals.css.
export function Aurora() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div
        className="aurora-blob aurora-a"
        style={{
          top: '-15%',
          left: '-10%',
          width: '60vw',
          height: '60vw',
          background: 'radial-gradient(circle, rgba(232,163,61,0.16), transparent 70%)',
        }}
      />
      <div
        className="aurora-blob aurora-b"
        style={{
          bottom: '-20%',
          right: '-15%',
          width: '55vw',
          height: '55vw',
          background: 'radial-gradient(circle, rgba(95,168,211,0.10), transparent 70%)',
        }}
      />
    </div>
  )
}
