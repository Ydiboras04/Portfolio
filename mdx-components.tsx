import type { MDXComponents } from 'mdx/types'

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    h2: ({ children }) => (
      <h2 className="mb-3 mt-10 font-display text-[19px] font-semibold tracking-[-0.02em]">{children}</h2>
    ),
    h3: ({ children }) => (
      <h3 className="mb-2 mt-7 font-display text-[15px] font-medium tracking-[-0.015em]">{children}</h3>
    ),
    p: ({ children }) => <p className="mb-4 text-[14px] leading-[1.75] text-dim">{children}</p>,
    ul: ({ children }) => <ul className="mb-4 list-disc space-y-2 pl-5 text-[14px] leading-[1.7] text-dim">{children}</ul>,
    li: ({ children }) => <li>{children}</li>,
    strong: ({ children }) => <strong className="font-medium text-ink">{children}</strong>,
    code: ({ children }) => (
      <code className="rounded-[3px] border border-line px-1.5 py-0.5 font-mono text-[12px] text-ink">{children}</code>
    ),
    ...components,
  }
}
