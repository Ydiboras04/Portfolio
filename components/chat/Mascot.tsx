// Ydiboras — an original floating "sprite companion" mascot (a boy). Inspired by
// the genre's floating-helper archetype, drawn from scratch: no third-party
// character assets. Pure inline SVG so it stays crisp at any size and themes
// with the site's amber. `animate` adds an eye-blink; the floating bob is driven
// by the parent via the `.ydi-float` class so it can respect reduced motion.

export function Mascot({ size = 40, animate = true }: { size?: number; animate?: boolean }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 68"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Ydiboras mascot"
    >
      {/* floating star companion */}
      <g className={animate ? 'ydi-twinkle' : undefined} style={{ transformOrigin: '52px 12px' }}>
        <path
          d="M52 5l1.7 3.8L58 10.5l-4.3 1.7L52 16l-1.7-3.8L46 10.5l4.3-1.7L52 5z"
          fill="var(--color-amber)"
        />
      </g>

      {/* soft glow behind the body */}
      <ellipse cx="32" cy="36" rx="20" ry="21" fill="var(--color-amber)" opacity="0.08" />

      {/* cape / robe */}
      <path
        d="M18 40c0-2 1.5-3 3-3h22c1.5 0 3 1 3 3 0 7-2 14-5 18-2 2.6-4 3-11 3s-9-.4-11-3c-3-4-5-11-5-18z"
        fill="#E8EDF2"
      />
      <path
        d="M18 41c0-2 1.5-4 3-4 1 6 3 10 11 10s10-4 11-10c1.5 0 3 2 3 4 0 7-2 13-5 17-2 2.6-4 3-9 3s-7-.4-9-3c-3-4-5-10-5-17z"
        fill="#D7DEE6"
        opacity="0.6"
      />
      {/* amber collar trim */}
      <path d="M22 37c2.5 3 6 4.5 10 4.5S39.5 40 42 37c-2-1-4.5-1.6-10-1.6S24 36 22 37z" fill="var(--color-amber)" opacity="0.9" />

      {/* arms */}
      <circle cx="17" cy="44" r="3.4" fill="#E8EDF2" />
      <circle cx="47" cy="44" r="3.4" fill="#E8EDF2" />

      {/* head */}
      <circle cx="32" cy="24" r="16" fill="#F3D9B8" />
      {/* hair — short, boyish, with a tuft */}
      <path
        d="M16.4 23c-.4-8 6-15 15.6-15s16 7 15.6 15c-1.2-1.2-3-2.2-4.8-2.6.4-1.6-.2-2.8-1-3.6-.6 2-2.2 3-4 3.3-2 .4-3.2-.6-3.8-2-1 1.8-3 2.8-5.4 2.8-1.9 0-3.3-.6-4.2-1.7-.5 1.3-1.6 2.2-3.2 2.5-1.3.26-2.4 0-3.2-.7-.5 1-.7 2.1-.5 3.1-1.3.4-2.6 1.1-3.5 2.2z"
        fill="#2B3A55"
      />
      <path d="M31 8.2c.3 0 .7 0 1 .02-4 1-6.4 3.6-7.2 6.3-1.2-.1-2.3.1-3.2.6C23 11 26.3 8.4 31 8.2z" fill="#3A4D70" opacity="0.8" />
      {/* short swept cowlick — a boyish top tuft */}
      <path d="M33.5 8.6c2.2-3 5.4-3.4 7.6-1.6-1.9.1-3.4 1.1-4.3 2.9-.9-.8-2-1.2-3.3-1.3z" fill="#34456440" />
      <path d="M33.8 8.8c1.9-2.3 4.4-2.7 6.4-1.4-1.6.2-2.9 1-3.7 2.4-.8-.6-1.8-.9-2.7-1z" fill="#2B3A55" />

      {/* eyes */}
      <g className={animate ? 'ydi-blink' : undefined} style={{ transformOrigin: '32px 26px' }}>
        <ellipse cx="25.5" cy="26" rx="2.6" ry="3.3" fill="#2B3A55" />
        <ellipse cx="38.5" cy="26" rx="2.6" ry="3.3" fill="#2B3A55" />
        <circle cx="26.4" cy="24.8" r="0.9" fill="#fff" />
        <circle cx="39.4" cy="24.8" r="0.9" fill="#fff" />
      </g>

      {/* blush */}
      <ellipse cx="22" cy="30" rx="2.4" ry="1.4" fill="var(--color-amber)" opacity="0.35" />
      <ellipse cx="42" cy="30" rx="2.4" ry="1.4" fill="var(--color-amber)" opacity="0.35" />

      {/* smile */}
      <path d="M29 31.4c1 1.2 2 1.7 3 1.7s2-.5 3-1.7" stroke="#2B3A55" strokeWidth="1.3" strokeLinecap="round" fill="none" />
    </svg>
  )
}
