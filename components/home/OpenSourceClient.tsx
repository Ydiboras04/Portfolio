'use client'

import { useEffect, useRef, useState } from 'react'
import { fetchGithubProjectsBrowser, type GithubProject } from '@/lib/content/github'
import { Tesseract } from './Tesseract'

// Live-refresh wrapper around the (prop-driven) Tesseract. It renders the
// build-time snapshot immediately -- instant paint, SEO, and a guaranteed
// fallback -- then, on the client, fetches the current list from GitHub and
// swaps it in if it differs. So a newly-created public repo appears on the next
// page load with no redeploy and no code change. Best-effort: any failure (rate
// limit, offline) leaves the baked list in place.

const CACHE_KEY = 'gh-projects'
const CACHE_TTL = 10 * 60 * 1000 // 10 min: don't refetch on every mount in a session

// Identity by the ordered list of repo names -- enough to know the set or its
// order changed, which is all that affects what we render.
function signature(list: GithubProject[]): string {
  return list.map((p) => p.name).join('|')
}

function readCache(): GithubProject[] | null {
  try {
    const raw = sessionStorage.getItem(CACHE_KEY)
    if (!raw) return null
    const { at, list } = JSON.parse(raw) as { at: number; list: GithubProject[] }
    if (Date.now() - at > CACHE_TTL) return null
    return list
  } catch {
    return null
  }
}

function writeCache(list: GithubProject[]) {
  try {
    sessionStorage.setItem(CACHE_KEY, JSON.stringify({ at: Date.now(), list }))
  } catch {
    // Private mode / blocked storage: the live list still renders this session.
  }
}

export function OpenSourceClient({
  initial,
  hint,
  viewLabel,
}: {
  initial: GithubProject[]
  hint: string
  viewLabel: string
}) {
  const [projects, setProjects] = useState(initial)
  const rootRef = useRef<HTMLDivElement>(null)

  // Only refresh once the section nears the viewport: no GitHub request for
  // visitors who never scroll this far, and it stays clear of interactions up
  // in the header.
  useEffect(() => {
    const el = rootRef.current
    if (!el) return
    let cancelled = false
    let done = false
    const apply = (live: GithubProject[] | null) => {
      if (cancelled || !live) return
      setProjects((current) => (signature(live) === signature(current) ? current : live))
    }

    const refresh = () => {
      if (done) return
      done = true
      const cached = readCache()
      if (cached) {
        apply(cached)
        return
      }
      fetchGithubProjectsBrowser().then((live) => {
        if (live) writeCache(live)
        apply(live)
      })
    }

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          refresh()
          io.disconnect()
        }
      },
      { rootMargin: '400px' },
    )
    io.observe(el)
    return () => {
      cancelled = true
      io.disconnect()
    }
  }, [])

  return (
    <div ref={rootRef}>
      <Tesseract projects={projects} hint={hint} viewLabel={viewLabel} />
    </div>
  )
}
