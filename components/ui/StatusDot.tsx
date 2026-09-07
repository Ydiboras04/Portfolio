export function StatusDot() {
  return (
    <span
      aria-hidden="true"
      className="block h-[5px] w-[5px] rounded-full bg-amber shadow-[0_0_8px_var(--color-amber)]
                 motion-safe:animate-[pulse-dot_2.4s_ease-in-out_infinite]"
    />
  )
}
