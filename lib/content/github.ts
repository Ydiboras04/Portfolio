// Public GitHub repositories, fetched once at build time (the site is a static
// export, so there is no request-time server to fetch from). The result is
// baked into the prerendered HTML; rebuild to refresh. Forks and the profile
// README repo (whose name equals the login) are dropped -- neither is a
// "project" -- leaving the real work to pin to the tesseract's vertices.

export interface GithubProject {
  name: string
  /** Display label: underscores/hyphens turned to spaces for legible vertex labels. */
  label: string
  description: string
  language: string
  stars: number
  url: string
}

interface RawRepo {
  name: string
  description: string
  language: string
  stars: number
  url: string
}

const GITHUB_USER = 'Ydiboras04'
const API = `https://api.github.com/users/${GITHUB_USER}/repos?per_page=100&sort=updated`

// Committed snapshot. The build falls back to this whenever the live fetch
// below fails -- GitHub unreachable, or the unauthenticated rate limit (60
// requests/hour per IP) exhausted -- so a static export never breaks on a
// transient network error. The live data supersedes it when the fetch works.
const FALLBACK: readonly RawRepo[] = [
  { name: 'miragestudio', description: "This is mirage studio 2D 's portfolio", language: 'CSS', stars: 4, url: 'https://github.com/Ydiboras04/miragestudio' },
  { name: 'Skylight', description: 'Skylight is a daily mood and weather tracking application', language: 'TypeScript', stars: 4, url: 'https://github.com/Ydiboras04/Skylight' },
  { name: 'Anomaly_Detection', description: 'Implement an Isolation Forest Algorithm built from scratch.', language: 'Python', stars: 3, url: 'https://github.com/Ydiboras04/Anomaly_Detection' },
  { name: 'Document_Digital_Signature', description: 'A secure, centralized document management and multi-signature verification system inspired by cryptographic chaining principles.', language: 'TypeScript', stars: 3, url: 'https://github.com/Ydiboras04/Document_Digital_Signature' },
  { name: 'Portfolio', description: 'My portfolio: bilingual FR/EN, Next.js 16 static export, Lighthouse 100, zero axe violations.', language: 'TypeScript', stars: 3, url: 'https://github.com/Ydiboras04/Portfolio' },
  { name: 'mlp-board-game-ai', description: 'Teaching TensorFlow MLPs to play tic-tac-toe and Connect 4, by imitating minimax and by self-play reinforcement learning (Deep Q-Learning).', language: 'Jupyter Notebook', stars: 2, url: 'https://github.com/Ydiboras04/mlp-board-game-ai' },
  { name: 'Extractive_Text_Summarizer', description: 'Implement TextRank in python from scratch for extraction text summarization in english language', language: 'Python', stars: 1, url: 'https://github.com/Ydiboras04/Extractive_Text_Summarizer' },
  { name: 'Stock_Manager_v2', description: '', language: 'Python', stars: 1, url: 'https://github.com/Ydiboras04/Stock_Manager_v2' },
]

interface GithubApiRepo {
  name: string
  description: string | null
  language: string | null
  stargazers_count: number
  html_url: string
  fork: boolean
}

async function fetchRepos(): Promise<RawRepo[]> {
  // A hung request must not stall the whole build; abort after 6s and fall back.
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), 6000)
  try {
    const res = await fetch(API, {
      // GitHub rejects requests with no User-Agent; this runs in Node at build
      // time, so the header is allowed (unlike a browser fetch).
      headers: { Accept: 'application/vnd.github+json', 'User-Agent': 'portfolio-build' },
      signal: controller.signal,
    })
    if (!res.ok) throw new Error(`GitHub API responded ${res.status}`)
    return rawFromApi((await res.json()) as GithubApiRepo[])
  } finally {
    clearTimeout(timer)
  }
}

// Drop forks and the profile README repo, and keep only the fields we render.
function rawFromApi(data: GithubApiRepo[]): RawRepo[] {
  return data
    .filter((r) => !r.fork && r.name !== GITHUB_USER)
    .map((r) => ({
      name: r.name,
      description: r.description ?? '',
      language: r.language ?? '',
      stars: r.stargazers_count,
      url: r.html_url,
    }))
}

function toProject(r: RawRepo): GithubProject {
  return { ...r, label: r.name.replace(/[-_]/g, ' ') }
}

// Brightest first, then alphabetical (stable, sensible vertex order); a
// tesseract has 16 vertices, so never pin more than that. Shared by the
// build-time and browser paths so both produce an identical ordering.
function normalize(repos: RawRepo[]): GithubProject[] {
  return [...repos]
    .sort((a, b) => b.stars - a.stars || a.name.localeCompare(b.name))
    .slice(0, 16)
    .map(toProject)
}

// Best-effort live refresh from the browser. No custom User-Agent (browsers
// forbid setting it and send their own); api.github.com returns permissive CORS
// headers. Returns null on any failure -- offline, or the unauthenticated rate
// limit (60/hour per IP) exhausted -- so the caller keeps the baked snapshot.
export async function fetchGithubProjectsBrowser(): Promise<GithubProject[] | null> {
  try {
    const res = await fetch(API, { headers: { Accept: 'application/vnd.github+json' } })
    if (!res.ok) return null
    const list = normalize(rawFromApi((await res.json()) as GithubApiRepo[]))
    return list.length ? list : null
  } catch {
    return null
  }
}

// Module-level memo so the fetch runs once even though both locale pages call
// it during the same build.
let cache: Promise<GithubProject[]> | null = null

export function getGithubProjects(): Promise<GithubProject[]> {
  if (!cache) {
    cache = (async () => {
      let repos: RawRepo[]
      try {
        repos = await fetchRepos()
        if (repos.length === 0) repos = [...FALLBACK]
      } catch {
        repos = [...FALLBACK]
      }
      return normalize(repos)
    })()
  }
  return cache
}
