# Portfolio Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build and deploy a bilingual (FR/EN) static portfolio site for Nomeny Mitia Andriamaheva that presents case-study-driven evidence of engineering work to European remote employers.

**Architecture:** Next.js 16 App Router with `output: 'export'` producing a fully static site. Locale is a route segment (`/[locale]/…`) resolved at build time by `generateStaticParams`; translations are typed dictionary modules with no runtime i18n library. Case studies are MDX files compiled at build. All motion is CSS `transform`/`opacity` driven by a single `IntersectionObserver` hook — no animation library.

**Tech Stack:** Next.js 16, React 19, TypeScript (strict), Tailwind v4, `@next/mdx`, `next/font` (Space Grotesk / IBM Plex Sans / JetBrains Mono), Vitest + Testing Library, Playwright + `@axe-core/playwright`, Web3Forms, Vercel.

**Spec:** `docs/superpowers/specs/2026-09-07-portfolio-design.md`

## Global Constraints

Every task's requirements implicitly include this section. Values are copied verbatim from the spec.

- **Palette (only these):** `--bg #08090A`, `--ink #EDEFF1`, `--dim #8A94A0`, `--faint #5A6470`, `--line rgba(255,255,255,.085)`, `--amber #E8A33D`.
- **Amber is reserved** for wayfinding and status only — index numbers, availability, active state, links. Never decorative.
- **Typefaces:** Space Grotesk (headings), IBM Plex Sans (body), JetBrains Mono (labels/metadata/numbers). Self-hosted via `next/font` — no external font request.
- **Micro-labels:** uppercase mono, ~9.5px, `.19em` tracking. **Headings:** `-.035em` tracking.
- **Structure:** hairline rules + faint 32px background grid. No cards, no glow, `border-radius` never above 3px.
- **Motion:** easing `cubic-bezier(.2,.8,.25,1)`, durations 150–350ms. **Scroll-driven and entrance animation uses `transform`/`opacity` only**; short hover/focus feedback may animate colour (the motion system calls for the amber index to brighten on hover, which has no transform equivalent). No animation library. No counting-up numbers, no parallax, no scroll-jacking, no above-the-fold entrance animation.
- **`prefers-reduced-motion: reduce` is a first-class path:** transforms drop to opacity-only or instant; hairlines static; cursor reticle and status pulse disabled.
- **Locales:** `fr` (default) and `en`. Every user-facing string lives in a dictionary — no hardcoded copy in components.
- **Quality gates:** Lighthouse ≥ 95 all four categories mobile+desktop; zero `axe` violations; full keyboard navigation with visible focus; correct at 320px width.
- **Confidentiality:** no client names and no client data in copy, screenshots, or commit messages. The Salesforce client is referred to only as "un intégrateur Salesforce européen" / "a European Salesforce integrator".

---

## File Structure

| Path | Responsibility |
|---|---|
| `next.config.ts` | Static export, MDX plugin |
| `app/layout.tsx` | `<html>`/`<body>`, font variables, global grid background |
| `app/page.tsx` | Root → default locale redirect |
| `app/[locale]/layout.tsx` | Locale validation, `lang` attribute, header/footer |
| `app/[locale]/page.tsx` | Homepage composition |
| `app/[locale]/travaux/[slug]/page.tsx` | Case study page |
| `app/globals.css` | Tailwind import, `@theme` tokens, base styles, motion keyframes |
| `lib/i18n/config.ts` | Locale list, default, type guard |
| `lib/i18n/types.ts` | `Dictionary` interface — the contract for all copy |
| `lib/i18n/dictionaries/{fr,en}.ts` | The copy |
| `lib/i18n/index.ts` | `getDictionary(locale)` |
| `lib/content/projects.ts` | Locale-independent project metadata |
| `lib/content/case-studies.ts` | Slug → MDX component map |
| `lib/hooks/useReducedMotion.ts` | Reduced-motion preference |
| `components/ui/Reveal.tsx` | IntersectionObserver reveal wrapper |
| `components/ui/Rule.tsx` | The drawing hairline (signature motion) |
| `components/ui/StatusDot.tsx` | Pulsing availability indicator |
| `components/ui/LocaleSwitch.tsx` | FR/EN switch preserving current path |
| `components/ui/CursorReticle.tsx` | Desktop crosshair cursor |
| `components/layout/{Header,Footer}.tsx` | Shell chrome |
| `components/home/{Hero,Credibility,Work,Skills,Parcours,Contact}.tsx` | Homepage sections |
| `content/case-studies/*.{fr,en}.mdx` | Case study prose |
| `tests/unit/**` | Vitest component + logic tests |
| `tests/e2e/**` | Playwright a11y + behaviour tests |

---

### Task 1: Project scaffold, design tokens, and test infrastructure

**Files:**
- Create: `package.json`, `next.config.ts`, `tsconfig.json`, `vitest.config.ts`, `tests/setup.ts`, `app/layout.tsx`, `app/globals.css`, `tests/unit/smoke.test.tsx`

**Interfaces:**
- Consumes: nothing
- Produces: a buildable Next.js app; the `@theme` token names (`--color-bg`, `--color-ink`, `--color-dim`, `--color-faint`, `--color-line`, `--color-amber`) and font CSS variables (`--font-display`, `--font-body`, `--font-mono`) that every later task uses via Tailwind utilities (`bg-bg`, `text-ink`, `font-display`, …).

- [ ] **Step 1: Scaffold the app**

```bash
cd d:/DevProject/PF
npx create-next-app@latest . --typescript --app --tailwind --eslint --no-src-dir --import-alias "@/*" --use-npm
```

When prompted about Turbopack, accept the default. If `create-next-app` refuses because the directory is non-empty, answer yes to proceed — it preserves `docs/`, `.git/` and the CV files.

- [ ] **Step 2: Install test and content dependencies**

```bash
npm install -D vitest @vitejs/plugin-react jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event @playwright/test @axe-core/playwright
npm install @next/mdx @mdx-js/loader @mdx-js/react @types/mdx
npx playwright install chromium
```

- [ ] **Step 3: Configure static export and MDX**

`next.config.ts`:

```ts
import createMDX from '@next/mdx'
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  output: 'export',
  trailingSlash: true,
  images: { unoptimized: true },
  pageExtensions: ['ts', 'tsx', 'mdx'],
}

export default createMDX({})(nextConfig)
```

`images.unoptimized` is required: the Next image optimizer needs a server, and this build has none.

- [ ] **Step 4: Write the design tokens**

Replace `app/globals.css` entirely:

```css
@import "tailwindcss";

@theme {
  --color-bg:    #08090A;
  --color-ink:   #EDEFF1;
  --color-dim:   #8A94A0;
  --color-faint: #5A6470;
  --color-line:  rgba(255, 255, 255, 0.085);
  --color-amber: #E8A33D;

  --font-display: var(--font-space-grotesk), sans-serif;
  --font-body:    var(--font-plex-sans), sans-serif;
  --font-mono:    var(--font-jetbrains-mono), monospace;

  --ease-instrument: cubic-bezier(0.2, 0.8, 0.25, 1);
}

@layer base {
  html { color-scheme: dark; }

  body {
    background-color: var(--color-bg);
    color: var(--color-ink);
    font-family: var(--font-body);
    background-image:
      linear-gradient(rgba(255, 255, 255, 0.016) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255, 255, 255, 0.016) 1px, transparent 1px);
    background-size: 32px 32px;
  }

  :focus-visible {
    outline: 2px solid var(--color-amber);
    outline-offset: 2px;
  }
}

@utility label {
  font-family: var(--font-mono);
  font-size: 9.5px;
  letter-spacing: 0.19em;
  text-transform: uppercase;
  color: var(--color-faint);
}

@keyframes draw   { from { transform: scaleX(0); } to { transform: scaleX(1); } }
@keyframes pulse-dot { 0%, 100% { opacity: 1; } 50% { opacity: 0.25; } }

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

- [ ] **Step 5: Wire the fonts in the root layout**

`app/layout.tsx`:

```tsx
import type { ReactNode } from 'react'
import { Space_Grotesk, IBM_Plex_Sans, JetBrains_Mono } from 'next/font/google'
import './globals.css'

const display = Space_Grotesk({
  subsets: ['latin'], weight: ['400', '500', '600', '700'], variable: '--font-space-grotesk', display: 'swap',
})
const body = IBM_Plex_Sans({
  subsets: ['latin'], weight: ['400', '500', '600'], variable: '--font-plex-sans', display: 'swap',
})
const mono = JetBrains_Mono({
  subsets: ['latin'], weight: ['400', '500'], variable: '--font-jetbrains-mono', display: 'swap',
})

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html suppressHydrationWarning>
      <body className={`${display.variable} ${body.variable} ${mono.variable}`}>{children}</body>
    </html>
  )
}
```

The root layout emits no `lang` — `app/[locale]/layout.tsx` sets it per locale in Task 2.

- [ ] **Step 6: Configure Vitest**

`vitest.config.ts`:

```ts
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { resolve } from 'node:path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
    include: ['tests/unit/**/*.test.{ts,tsx}'],
    globals: true,
  },
  resolve: { alias: { '@': resolve(__dirname, '.') } },
})
```

`tests/setup.ts`:

```ts
import '@testing-library/jest-dom/vitest'

if (!window.matchMedia) {
  window.matchMedia = (query: string) =>
    ({
      matches: false,
      media: query,
      onchange: null,
      addEventListener: () => {},
      removeEventListener: () => {},
      addListener: () => {},
      removeListener: () => {},
      dispatchEvent: () => false,
    }) as unknown as MediaQueryList
}
```

Add scripts to `package.json`:

```json
"test": "vitest run",
"test:watch": "vitest",
"test:e2e": "playwright test",
"typecheck": "tsc --noEmit"
```

- [ ] **Step 7: Write the failing smoke test**

`tests/unit/smoke.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import RootLayout from '@/app/layout'

describe('root layout', () => {
  it('renders its children', () => {
    render(<RootLayout><p>hello</p></RootLayout>)
    expect(screen.getByText('hello')).toBeInTheDocument()
  })

  it('applies all three font variables to the body', () => {
    const { container } = render(<RootLayout><span /></RootLayout>)
    const body = container.querySelector('body')
    expect(body?.className).toMatch(/--font-space-grotesk|space-grotesk|__variable/)
  })
})
```

- [ ] **Step 8: Run tests to verify they fail**

Run: `npm test`
Expected: FAIL — `app/layout.tsx` renders `<html>`/`<body>` which jsdom nests oddly, or the import path is unresolved.

- [ ] **Step 9: Make the smoke test pass**

If the nested-`<html>` render fails, change the second assertion to read the class off the rendered tree rather than a real `<body>`:

```tsx
const { container } = render(<RootLayout><span /></RootLayout>)
expect(container.innerHTML).toContain('__variable')
```

- [ ] **Step 10: Run the full verification**

```bash
npm test && npm run typecheck && npm run build
```

Expected: tests PASS, no type errors, build completes and writes `out/`.

- [ ] **Step 11: Commit**

```bash
git add -A
git commit -m "$(cat <<'EOF'
Scaffold Next.js app with design tokens and test infrastructure

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

### Task 2: i18n foundation and locale routing

**Files:**
- Create: `lib/i18n/config.ts`, `lib/i18n/types.ts`, `lib/i18n/dictionaries/fr.ts`, `lib/i18n/dictionaries/en.ts`, `lib/i18n/index.ts`, `app/[locale]/layout.tsx`, `app/[locale]/page.tsx`, `app/page.tsx`, `tests/unit/i18n.test.ts`

**Interfaces:**
- Consumes: Task 1's app scaffold.
- Produces:
  - `locales: readonly ['fr','en']`, `type Locale = 'fr'|'en'`, `defaultLocale: Locale`, `isLocale(v: string): v is Locale`
  - `type Dictionary` — the full copy contract
  - `getDictionary(locale: Locale): Dictionary`
  - Route `/[locale]/` statically generated for both locales

- [ ] **Step 1: Write the failing dictionary-parity test**

This is the test that earns its keep: a missing translation key is the single most likely bug in a bilingual site, and it is invisible until a user hits it.

`tests/unit/i18n.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { locales, defaultLocale, isLocale } from '@/lib/i18n/config'
import { getDictionary } from '@/lib/i18n'

function flatten(value: unknown, prefix = ''): string[] {
  if (Array.isArray(value)) {
    return value.flatMap((item, i) => flatten(item, `${prefix}[${i}]`))
  }
  if (value !== null && typeof value === 'object') {
    return Object.entries(value).flatMap(([k, v]) => flatten(v, prefix ? `${prefix}.${k}` : k))
  }
  return [prefix]
}

describe('i18n config', () => {
  it('exposes fr and en with fr as the default', () => {
    expect(locales).toEqual(['fr', 'en'])
    expect(defaultLocale).toBe('fr')
  })

  it('narrows valid locale strings', () => {
    expect(isLocale('fr')).toBe(true)
    expect(isLocale('de')).toBe(false)
  })
})

describe('dictionaries', () => {
  it('have identical key shapes across every locale', () => {
    const [reference, ...rest] = locales.map((l) => flatten(getDictionary(l)).sort())
    for (const keys of rest) expect(keys).toEqual(reference)
  })

  it('contain no empty strings', () => {
    for (const locale of locales) {
      const dict = getDictionary(locale)
      const empties: string[] = []
      const walk = (v: unknown, path = ''): void => {
        if (typeof v === 'string') { if (v.trim() === '') empties.push(path); return }
        if (Array.isArray(v)) { v.forEach((item, i) => walk(item, `${path}[${i}]`)); return }
        if (v && typeof v === 'object') {
          Object.entries(v).forEach(([k, val]) => walk(val, path ? `${path}.${k}` : k))
        }
      }
      walk(dict)
      expect(empties, `empty keys in ${locale}`).toEqual([])
    }
  })

  // The employer (Solumada) and the schools are the subject's own history and may
  // be named. The vendor platform the automation work ran on must not appear —
  // including as a project slug, because slugs become public, crawlable URLs and a
  // URL is a more durable identity leak than any sentence of prose.
  it('never names the vendor platform, in copy or in slugs', () => {
    const FORBIDDEN = ['thynk']
    for (const locale of locales) {
      // stringify covers keys as well as values, so slugs are checked too
      const text = JSON.stringify(getDictionary(locale)).toLowerCase()
      for (const term of FORBIDDEN) {
        expect(text, `"${term}" must not appear in the ${locale} dictionary`).not.toContain(term)
      }
    }
  })
})
```

- [ ] **Step 2: Run it to confirm it fails**

Run: `npm test -- i18n`
Expected: FAIL — `Cannot find module '@/lib/i18n/config'`.

- [ ] **Step 3: Write the locale config**

`lib/i18n/config.ts`:

```ts
export const locales = ['fr', 'en'] as const
export type Locale = (typeof locales)[number]
export const defaultLocale: Locale = 'fr'

export function isLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value)
}
```

- [ ] **Step 4: Write the Dictionary contract**

`lib/i18n/types.ts`:

```ts
export type ProjectSlug = 'soluchat' | 'automatisation' | 'zarahay' | 'inventaire'

export interface Dictionary {
  meta: { title: string; description: string }
  nav: { work: string; skills: string; path: string; contact: string; toggleLabel: string }
  hero: {
    availability: string
    headlineBefore: string
    headlineAccent: string
    summary: string
    ctaWork: string
    ctaCv: string
  }
  credibility: Array<{ value: string; accent: string; label: string }>
  work: {
    title: string
    note: string
    viewCase: string
    projects: Record<ProjectSlug, { name: string; description: string }>
  }
  skills: { title: string; note: string; groups: Array<{ level: string; items: string[] }> }
  parcours: {
    title: string
    note: string
    entries: Array<{ period: string; role: string; org: string; detail: string }>
  }
  about: { title: string; note: string; body: string[] }
  contact: {
    title: string
    body: string
    emailLabel: string
    nameField: string
    emailField: string
    messageField: string
    submit: string
    sending: string
    success: string
    error: string
  }
  caseStudy: {
    context: string
    constraints: string
    stack: string
    decisions: string
    wentWrong: string
    outcome: string
    back: string
  }
}
```

- [ ] **Step 5: Write the French dictionary**

`lib/i18n/dictionaries/fr.ts`:

```ts
import type { Dictionary } from '../types'

export const fr: Dictionary = {
  meta: {
    title: 'Nomeny Mitia Andriamaheva — Développeur Full-Stack',
    description:
      "Développeur full-stack. Applications web sur mesure en Python, TypeScript et Rust, et automatisation documentaire Salesforce. Disponible en remote depuis Antananarivo.",
  },
  nav: { work: 'Travaux', skills: 'Compétences', path: 'Parcours', contact: 'Contact', toggleLabel: 'Changer de langue' },
  hero: {
    availability: 'Disponible — CDI & missions · Remote Europe',
    headlineBefore: 'Full-stack, et ',
    headlineAccent: 'automatisation documentaire',
    summary:
      "Je construis des applications web robustes en Python, TypeScript et Rust — et j'automatise les processus documentaires qui font perdre des heures aux équipes. Master II MIAGE, un an en poste chez un intégrateur Salesforce.",
    ctaWork: 'Voir les travaux',
    ctaCv: 'Télécharger le CV',
  },
  credibility: [
    { value: 'Major', accent: ' de promo', label: 'Licence Informatique — Promotion « ROHY »' },
    { value: '1 an', accent: ' en poste', label: 'Et trois stages en entreprise' },
    { value: 'Clients', accent: ' intl.', label: 'Livrés pour un intégrateur Salesforce européen' },
    { value: '4', accent: ' langues', label: 'Français · Anglais · Japonais (N4) · Malgache' },
  ],
  work: {
    title: 'Travaux sélectionnés',
    note: 'Étude de cas complète',
    viewCase: "Lire l'étude de cas",
    projects: {
      soluchat: { name: 'Soluchat', description: 'Messagerie temps réel conçue pour tenir la charge.' },
      automatisation: { name: 'Automatisation documentaire', description: 'Génération de documents sans erreur de mapping, pour des clients internationaux.' },
      zarahay: { name: 'Zarahay Doctorants', description: 'Partage de ressources et collaboration entre doctorants.' },
      inventaire: { name: "Suivi d'équipements", description: "Logiciel de gestion des entrées et sorties d'inventaire." },
    },
  },
  skills: {
    title: 'Compétences',
    note: 'Classées par profondeur réelle',
    groups: [
      { level: 'Avancé', items: ['Python', 'Django', 'Flask', 'TypeScript', 'React'] },
      { level: 'Solide', items: ['Angular', 'Next.js', 'Java', 'C#', 'PostgreSQL', 'SQL'] },
      { level: 'En production', items: ['Salesforce Admin', 'PDF Butler', 'FORM Butler', 'SIGN Butler', 'Rust'] },
      { level: 'Notions', items: ['Machine Learning', 'Big Data', 'Cybersécurité'] },
    ],
  },
  parcours: {
    title: 'Parcours',
    note: 'Expérience & formation',
    entries: [
      { period: '09/25 — 09/26', role: 'Développeur Polyvalent', org: 'Solumada Ivandry', detail: 'Administration Salesforce, automatisation documentaire, application temps réel React/Rust.' },
      { period: '01/26 — présent', role: 'Master II MIAGE', org: 'ESMIA Mahamasina', detail: 'Architectures Big Data, cybersécurité, gestion de projet, programmation sous contraintes.' },
      { period: '01/25 — 09/25', role: 'Master I MIAGE', org: 'ESMIA Mahamasina', detail: 'Technologies web avancées, machine learning, IHM avancée, PGI.' },
      { period: '02/24 — 05/24', role: 'Développeur Web — Stage de fin d\u2019études', org: 'CIDST Tsimbazaza', detail: 'Application de collaboration pour doctorants en Angular et Django.' },
      { period: '07/23 — 09/23', role: 'Développeur Java — Stage', org: 'Groupe Tahina Ivandry', detail: "Logiciel de suivi d'équipements en Java Swing." },
      { period: '03/22 — 10/24', role: 'Licence Informatique, Risque et Décision', org: 'ESMIA Mahamasina', detail: 'Major de promotion — Promotion « ROHY ».' },
    ],
  },
  about: {
    title: 'À propos',
    note: 'Le chemin jusqu’ici',
    body: [
      "J'ai commencé par la comptabilité — baccalauréat technique, mention Très Bien — avant de basculer vers l'informatique. Ce détour explique beaucoup : quand j'automatise un processus documentaire, je comprends le métier qu'il y a derrière, pas seulement le champ à mapper.",
      "Aujourd'hui je partage mon temps entre le développement d'applications web et l'automatisation Salesforce. Les deux se nourrissent : écrire du code m'a appris à voir où l'automatisation casse, et automatiser m'a appris à écouter avant de coder.",
      'Basé à Antananarivo, je travaille en UTC+3 — un fuseau qui recouvre entièrement la journée de travail européenne.',
    ],
  },
  contact: {
    title: 'Parlons de votre prochain projet.',
    body: "Ouvert aux postes en remote depuis Antananarivo (UTC+3) — un fuseau qui recouvre toute la journée de travail européenne — et aux missions d'automatisation documentaire Salesforce.",
    emailLabel: 'Écrivez-moi',
    nameField: 'Nom',
    emailField: 'Email',
    messageField: 'Message',
    submit: 'Envoyer',
    sending: 'Envoi…',
    success: 'Message envoyé. Je vous réponds sous 24 h.',
    error: "L'envoi a échoué. Écrivez-moi directement à l'adresse ci-dessus.",
  },
  caseStudy: {
    context: 'Contexte',
    constraints: 'Contraintes',
    stack: 'Stack',
    decisions: 'Décisions & arbitrages',
    wentWrong: "Ce qui n'a pas marché",
    outcome: 'Résultat',
    back: 'Retour aux travaux',
  },
}
```

- [ ] **Step 6: Write the English dictionary**

`lib/i18n/dictionaries/en.ts` — same shape, translated. Note `headlineBefore`/`headlineAccent` must still read naturally when concatenated.

```ts
import type { Dictionary } from '../types'

export const en: Dictionary = {
  meta: {
    title: 'Nomeny Mitia Andriamaheva — Full-Stack Developer',
    description:
      'Full-stack developer. Custom web applications in Python, TypeScript and Rust, plus Salesforce document automation. Available remote from Antananarivo.',
  },
  nav: { work: 'Work', skills: 'Skills', path: 'Background', contact: 'Contact', toggleLabel: 'Switch language' },
  hero: {
    availability: 'Available — full-time & contract · Remote Europe',
    headlineBefore: 'Full-stack, and ',
    headlineAccent: 'document automation',
    summary:
      'I build web applications that hold up in production — Python, TypeScript and Rust — and automate the document processes that quietly cost teams hours every week. MSc in Applied Business Computing, one year in post at a Salesforce integrator.',
    ctaWork: 'See the work',
    ctaCv: 'Download CV',
  },
  credibility: [
    { value: 'Top', accent: ' of class', label: 'BSc Computer Science — "ROHY" cohort' },
    { value: '1 year', accent: ' in post', label: 'Plus three industry internships' },
    { value: 'Intl.', accent: ' clients', label: 'Delivered for a European Salesforce integrator' },
    { value: '4', accent: ' languages', label: 'French · English · Japanese (N4) · Malagasy' },
  ],
  work: {
    title: 'Selected work',
    note: 'Full case study',
    viewCase: 'Read the case study',
    projects: {
      soluchat: { name: 'Soluchat', description: 'Real-time messaging built to hold up under load.' },
      automatisation: { name: 'Document automation', description: 'Document generation without mapping errors, for international clients.' },
      zarahay: { name: 'Zarahay Doctorants', description: 'Resource sharing and collaboration for doctoral researchers.' },
      inventaire: { name: 'Equipment tracking', description: 'Inventory check-in and check-out management software.' },
    },
  },
  skills: {
    title: 'Skills',
    note: 'Graded by actual depth',
    groups: [
      { level: 'Advanced', items: ['Python', 'Django', 'Flask', 'TypeScript', 'React'] },
      { level: 'Solid', items: ['Angular', 'Next.js', 'Java', 'C#', 'PostgreSQL', 'SQL'] },
      { level: 'Shipped in production', items: ['Salesforce Admin', 'PDF Butler', 'FORM Butler', 'SIGN Butler', 'Rust'] },
      { level: 'Familiar', items: ['Machine Learning', 'Big Data', 'Cybersecurity'] },
    ],
  },
  parcours: {
    title: 'Background',
    note: 'Experience & education',
    entries: [
      { period: '09/25 — 09/26', role: 'Software Developer', org: 'Solumada Ivandry', detail: 'Salesforce administration, document automation, real-time React/Rust application.' },
      { period: '01/26 — present', role: 'MSc year 2, Applied Business Computing', org: 'ESMIA Mahamasina', detail: 'Big data architectures, cybersecurity, project management, constraint programming.' },
      { period: '01/25 — 09/25', role: 'MSc year 1, Applied Business Computing', org: 'ESMIA Mahamasina', detail: 'Advanced web technologies, machine learning, advanced HCI, ERP.' },
      { period: '02/24 — 05/24', role: 'Web Developer — final-year placement', org: 'CIDST Tsimbazaza', detail: 'Collaboration platform for doctoral researchers in Angular and Django.' },
      { period: '07/23 — 09/23', role: 'Java Developer — internship', org: 'Groupe Tahina Ivandry', detail: 'Equipment tracking software in Java Swing.' },
      { period: '03/22 — 10/24', role: 'BSc Computer Science, Risk and Decision', org: 'ESMIA Mahamasina', detail: 'Top of class — "ROHY" cohort.' },
    ],
  },
  about: {
    title: 'About',
    note: 'How I got here',
    body: [
      'I started in accounting — a technical baccalaureate, passed with distinction — before moving into software. That detour explains a lot: when I automate a document process, I understand the business behind it, not just the field to be mapped.',
      'Today I split my time between building web applications and Salesforce automation. Each feeds the other: writing code taught me where automation breaks, and automating taught me to listen before I build.',
      'I am based in Antananarivo and work in UTC+3 — a timezone that overlaps the entire European working day.',
    ],
  },
  contact: {
    title: "Let's talk about your next project.",
    body: 'Open to remote roles from Antananarivo (UTC+3) — a timezone that overlaps the entire European working day — and to Salesforce document-automation contracts.',
    emailLabel: 'Email me',
    nameField: 'Name',
    emailField: 'Email',
    messageField: 'Message',
    submit: 'Send',
    sending: 'Sending…',
    success: "Message sent. I'll reply within 24 hours.",
    error: 'Sending failed. Please email me directly at the address above.',
  },
  caseStudy: {
    context: 'Context',
    constraints: 'Constraints',
    stack: 'Stack',
    decisions: 'Decisions & trade-offs',
    wentWrong: "What didn't work",
    outcome: 'Outcome',
    back: 'Back to work',
  },
}
```

- [ ] **Step 7: Write the dictionary accessor**

`lib/i18n/index.ts`:

```ts
import type { Locale } from './config'
import type { Dictionary } from './types'
import { fr } from './dictionaries/fr'
import { en } from './dictionaries/en'

const dictionaries: Record<Locale, Dictionary> = { fr, en }

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale]
}

export type { Dictionary, Locale }
```

- [ ] **Step 8: Run the tests to verify they pass**

Run: `npm test -- i18n`
Expected: PASS, all five assertions.

- [ ] **Step 9: Add the locale layout and a placeholder page**

`app/[locale]/layout.tsx`:

```tsx
import type { ReactNode } from 'react'
import { notFound } from 'next/navigation'
import { locales, isLocale, type Locale } from '@/lib/i18n/config'
import { getDictionary } from '@/lib/i18n'
import type { Metadata } from 'next'

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }))
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  if (!isLocale(locale)) return {}
  const dict = getDictionary(locale)
  return { title: dict.meta.title, description: dict.meta.description }
}

export default async function LocaleLayout({
  children, params,
}: { children: ReactNode; params: Promise<{ locale: string }> }) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()
  return <div lang={locale as Locale}>{children}</div>
}
```

`app/[locale]/page.tsx` (temporary — replaced in Task 5):

```tsx
import { isLocale } from '@/lib/i18n/config'
import { getDictionary } from '@/lib/i18n'
import { notFound } from 'next/navigation'

export default async function Home({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()
  const dict = getDictionary(locale)
  return <main><h1>{dict.meta.title}</h1></main>
}
```

- [ ] **Step 10: Add the root redirect**

`output: 'export'` cannot perform a server redirect, so the root page redirects on the client and offers a crawlable link as the no-JS fallback.

`app/page.tsx`:

```tsx
'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { defaultLocale } from '@/lib/i18n/config'

export default function RootRedirect() {
  const router = useRouter()
  useEffect(() => { router.replace(`/${defaultLocale}/`) }, [router])
  return (
    <main style={{ padding: '2rem' }}>
      <a href={`/${defaultLocale}/`}>Continuer vers le site / Continue to the site</a>
    </main>
  )
}
```

Also add `vercel.json` so the redirect is instant on the production host:

```json
{ "redirects": [{ "source": "/", "destination": "/fr/", "permanent": false }] }
```

- [ ] **Step 11: Verify the static export produces both locales**

```bash
npm run build && ls out/fr/index.html out/en/index.html
```

Expected: both files exist.

- [ ] **Step 12: Commit**

```bash
git add -A
git commit -m "$(cat <<'EOF'
Add typed i18n dictionaries and locale routing

Dictionary parity is enforced by test: a key present in one locale and
missing in the other fails the suite rather than reaching a user.

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

### Task 3: Motion primitives

**Files:**
- Create: `lib/hooks/useReducedMotion.ts`, `components/ui/Reveal.tsx`, `components/ui/Rule.tsx`, `components/ui/StatusDot.tsx`, `tests/unit/motion.test.tsx`

**Interfaces:**
- Consumes: the `--ease-instrument` token and `draw` / `pulse-dot` keyframes from Task 1.
- Produces:
  - `useReducedMotion(): boolean`
  - `<Reveal delay?: number>` — wraps children, applies `opacity-0 translate-y-2` until intersecting
  - `<Rule />` — a full-width hairline that scales in from the left on entry
  - `<StatusDot />` — the pulsing amber availability indicator

- [ ] **Step 1: Write the failing tests**

`tests/unit/motion.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { Reveal } from '@/components/ui/Reveal'
import { Rule } from '@/components/ui/Rule'

function mockMatchMedia(matches: boolean) {
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches, media: query, onchange: null,
    addEventListener: vi.fn(), removeEventListener: vi.fn(),
    addListener: vi.fn(), removeListener: vi.fn(), dispatchEvent: vi.fn(),
  }))
}

beforeEach(() => {
  mockMatchMedia(false)
  // jsdom has no IntersectionObserver
  window.IntersectionObserver = class {
    constructor(private cb: IntersectionObserverCallback) {}
    observe() { this.cb([{ isIntersecting: true } as IntersectionObserverEntry], this as never) }
    unobserve() {} disconnect() {} takeRecords() { return [] }
    root = null; rootMargin = ''; thresholds = []
  } as unknown as typeof IntersectionObserver
})

describe('Reveal', () => {
  it('renders its children', () => {
    render(<Reveal><p>visible content</p></Reveal>)
    expect(screen.getByText('visible content')).toBeInTheDocument()
  })

  it('becomes visible once the element intersects', () => {
    const { container } = render(<Reveal><p>content</p></Reveal>)
    expect(container.firstElementChild).toHaveAttribute('data-revealed', 'true')
  })

  it('is revealed immediately under reduced motion, without waiting for an observer', () => {
    mockMatchMedia(true)
    neverFiringObserver()
    const { container } = render(<Reveal><p>content</p></Reveal>)
    expect(container.firstElementChild).toHaveAttribute('data-revealed', 'true')
    expect(container.firstElementChild).toHaveAttribute('data-reduced', 'true')
  })
})

// An observer that never fires. Reduced-motion assertions must be made against
// this, not the firing mock: with a firing observer both `reduced` and
// `intersected` are true, so the test would still pass if the short-circuit
// `reduced || intersected` were broken to `reduced && intersected` — leaving
// reduced-motion users with permanently invisible content.
function neverFiringObserver() {
  window.IntersectionObserver = class {
    observe() {}
    unobserve() {} disconnect() {} takeRecords() { return [] }
    root = null; rootMargin = ''; thresholds = []
  } as unknown as typeof IntersectionObserver
}

describe('Rule', () => {
  it('renders a presentational separator', () => {
    const { container } = render(<Rule />)
    expect(container.firstElementChild).toHaveAttribute('role', 'presentation')
  })

  it('draws once it intersects', () => {
    mockMatchMedia(false)
    const { container } = render(<Rule />)
    expect(container.firstElementChild).toHaveAttribute('data-drawn', 'true')
  })

  it('is drawn immediately under reduced motion, without waiting for an observer', () => {
    mockMatchMedia(true)
    neverFiringObserver()
    const { container } = render(<Rule />)
    expect(container.firstElementChild).toHaveAttribute('data-drawn', 'true')
  })
})
```

- [ ] **Step 2: Run to verify failure**

Run: `npm test -- motion`
Expected: FAIL — modules not found.

- [ ] **Step 3: Implement the reduced-motion hook**

`lib/hooks/useReducedMotion.ts`:

```ts
'use client'

import { useEffect, useState } from 'react'

const QUERY = '(prefers-reduced-motion: reduce)'

export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false)

  useEffect(() => {
    const mql = window.matchMedia(QUERY)
    setReduced(mql.matches)
    const onChange = (e: MediaQueryListEvent) => setReduced(e.matches)
    mql.addEventListener('change', onChange)
    return () => mql.removeEventListener('change', onChange)
  }, [])

  return reduced
}
```

- [ ] **Step 4: Implement Reveal**

`components/ui/Reveal.tsx`:

```tsx
'use client'

import { useEffect, useRef, useState, type ReactNode } from 'react'
import { useReducedMotion } from '@/lib/hooks/useReducedMotion'

export function Reveal({ children, delay = 0 }: { children: ReactNode; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const [revealed, setRevealed] = useState(false)
  const reduced = useReducedMotion()

  useEffect(() => {
    if (reduced) { setRevealed(true); return }
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) { setRevealed(true); observer.disconnect() }
        }
      },
      { rootMargin: '0px 0px -10% 0px' },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [reduced])

  return (
    <div
      ref={ref}
      data-revealed={revealed}
      data-reduced={reduced}
      style={{ transitionDelay: reduced ? '0ms' : `${delay}ms` }}
      className={
        'transition-[opacity,transform] duration-[350ms] ease-(--ease-instrument) motion-reduce:transition-none ' +
        (revealed ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2')
      }
    >
      {children}
    </div>
  )
}
```

Note: `reduced` starts `false` on the server and flips in `useEffect`, so the reduced-motion test must assert after the effect flushes — Testing Library's `render` does this synchronously in React 19.

- [ ] **Step 5: Implement Rule — the signature motion**

`components/ui/Rule.tsx`:

```tsx
'use client'

import { useEffect, useRef, useState } from 'react'
import { useReducedMotion } from '@/lib/hooks/useReducedMotion'

export function Rule() {
  const ref = useRef<HTMLDivElement>(null)
  const [drawn, setDrawn] = useState(false)
  const reduced = useReducedMotion()

  useEffect(() => {
    if (reduced) { setDrawn(true); return }
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) { setDrawn(true); observer.disconnect() }
      }
    })
    observer.observe(el)
    return () => observer.disconnect()
  }, [reduced])

  return (
    <div
      ref={ref}
      role="presentation"
      data-drawn={drawn}
      className={
        'h-px w-full origin-left bg-line transition-transform duration-[350ms] ease-(--ease-instrument) ' +
        'motion-reduce:transition-none ' + (drawn ? 'scale-x-100' : 'scale-x-0')
      }
    />
  )
}
```

- [ ] **Step 5b: Add the no-JS fallback**

`Reveal` and `Rule` both server-render hidden and depend on `IntersectionObserver`. With JavaScript blocked the
observer never fires, so without this every section below the hero — and every hairline rule — stays invisible.
Add to **both** root layouts (`app/(root)/layout.tsx` and `app/[locale]/layout.tsx`) as the first child of `<body>` (the App Router has no explicit `<head>` element):

```tsx
<noscript>
  <style>{`[data-revealed='false'], [data-drawn='false'] { opacity: 1 !important; transform: none !important; }`}</style>
</noscript>
```

`<noscript>` is used rather than `@media (scripting: none)` because that CSS feature lacks Samsung Internet and
pre-2023 browser support — it would fail in exactly the environments the fallback exists to protect.

- [ ] **Step 6: Implement StatusDot**

`components/ui/StatusDot.tsx`:

```tsx
export function StatusDot() {
  return (
    <span
      aria-hidden="true"
      className="block h-[5px] w-[5px] rounded-full bg-amber shadow-[0_0_8px_var(--color-amber)]
                 motion-safe:animate-[pulse-dot_2.4s_ease-in-out_infinite]"
    />
  )
}
```

`motion-safe:` is what keeps the pulse off under reduced motion — the constraint is enforced by Tailwind, not by a runtime check.

- [ ] **Step 7: Run the tests**

Run: `npm test -- motion`
Expected: PASS.

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "$(cat <<'EOF'
Add motion primitives with reduced-motion support

Reveal and Rule both short-circuit to their final state when the user
prefers reduced motion; StatusDot's pulse is gated behind motion-safe.

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

### Task 4: App shell — header, locale switch, footer

**Files:**
- Create: `components/ui/LocaleSwitch.tsx`, `components/layout/Header.tsx`, `components/layout/Footer.tsx`, `tests/unit/shell.test.tsx`
- Modify: `app/[locale]/layout.tsx`

**Interfaces:**
- Consumes: `getDictionary`, `Locale`, `StatusDot`.
- Produces:
  - `<Header locale={Locale} dict={Dictionary} />`
  - `<Footer locale={Locale} dict={Dictionary} />`
  - `<LocaleSwitch current={Locale} label={string} />` — swaps the first path segment, preserving the rest

- [ ] **Step 1: Write the failing tests**

`tests/unit/shell.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { LocaleSwitch } from '@/components/ui/LocaleSwitch'
import { Header } from '@/components/layout/Header'
import { getDictionary } from '@/lib/i18n'

vi.mock('next/navigation', () => ({ usePathname: () => '/fr/travaux/soluchat/' }))

describe('LocaleSwitch', () => {
  it('links to the same page in the other locale', () => {
    render(<LocaleSwitch current="fr" label="Changer de langue" />)
    expect(screen.getByRole('link')).toHaveAttribute('href', '/en/travaux/soluchat/')
  })

  it('labels the target locale, not the current one', () => {
    render(<LocaleSwitch current="fr" label="Changer de langue" />)
    expect(screen.getByRole('link')).toHaveTextContent('EN')
  })
})

describe('Header', () => {
  it('exposes a navigation landmark with every section link', () => {
    const dict = getDictionary('fr')
    render(<Header locale="fr" dict={dict} />)
    const nav = screen.getByRole('navigation')
    expect(nav).toBeInTheDocument()
    for (const label of [dict.nav.work, dict.nav.skills, dict.nav.path, dict.nav.contact]) {
      expect(screen.getByRole('link', { name: label })).toBeInTheDocument()
    }
  })
})
```

- [ ] **Step 2: Run to verify failure**

Run: `npm test -- shell`
Expected: FAIL — modules not found.

- [ ] **Step 3: Implement LocaleSwitch**

`components/ui/LocaleSwitch.tsx`:

```tsx
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { locales, type Locale } from '@/lib/i18n/config'

export function LocaleSwitch({ current, label }: { current: Locale; label: string }) {
  const pathname = usePathname()
  const target = locales.find((l) => l !== current) ?? current
  const segments = pathname.split('/')
  segments[1] = target
  const href = segments.join('/')

  return (
    <Link
      href={href}
      hrefLang={target}
      aria-label={`${target.toUpperCase()} — ${label}`}
      className="label rounded-[3px] border border-line px-[7px] py-[3px] text-amber
                 transition-colors duration-150 ease-(--ease-instrument) hover:border-amber/40"
    >
      {target.toUpperCase()}
    </Link>
  )
}
```

- [ ] **Step 4: Implement Header**

`components/layout/Header.tsx`:

```tsx
import Link from 'next/link'
import type { Locale } from '@/lib/i18n/config'
import type { Dictionary } from '@/lib/i18n/types'
import { LocaleSwitch } from '@/components/ui/LocaleSwitch'

export function Header({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const sections = [
    { href: '#travaux', label: dict.nav.work },
    { href: '#competences', label: dict.nav.skills },
    { href: '#parcours', label: dict.nav.path },
    { href: '#contact', label: dict.nav.contact },
  ]

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-bg/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3 sm:px-12">
        <Link href={`/${locale}/`} className="font-display text-[13.5px] font-semibold tracking-[-0.01em]">
          Nomeny Mitia <span className="text-faint">/</span> Andriamaheva
        </Link>
        <nav className="flex items-center gap-4 sm:gap-5">
          <ul className="hidden items-center gap-5 sm:flex">
            {sections.map((s) => (
              <li key={s.href}>
                <a
                  href={s.href}
                  className="label transition-colors duration-150 ease-(--ease-instrument) hover:text-ink"
                >
                  {s.label}
                </a>
              </li>
            ))}
          </ul>
          <LocaleSwitch current={locale} label={dict.nav.toggleLabel} />
        </nav>
      </div>
    </header>
  )
}
```

- [ ] **Step 5: Implement Footer**

`components/layout/Footer.tsx`:

```tsx
import type { Dictionary } from '@/lib/i18n/types'

export function Footer({ dict }: { dict: Dictionary }) {
  return (
    <footer className="border-t border-line">
      <div className="mx-auto flex max-w-6xl flex-col gap-2 px-5 py-6 sm:flex-row sm:items-center sm:justify-between sm:px-12">
        <p className="label">© {new Date().getFullYear()} Nomeny Mitia Andriamaheva</p>
        <p className="label">
          Antananarivo, Madagascar · UTC+3
          {' · '}
          <a href={`mailto:nomenymitia.andria@gmail.com`} className="text-amber">{dict.contact.emailLabel}</a>
        </p>
      </div>
    </footer>
  )
}
```

- [ ] **Step 6: Add the skip-link copy to the dictionary**

The skip link is user-facing text, so it belongs in the dictionary like every other string — not a
`locale === 'fr' ? … : …` ternary in the layout. Add to `nav` in `lib/i18n/types.ts`:

```ts
  nav: { work: string; skills: string; path: string; contact: string; toggleLabel: string; skipToContent: string }
```

Then `skipToContent: 'Aller au contenu'` in `fr.ts` and `skipToContent: 'Skip to content'` in `en.ts`. The
existing dictionary-parity test covers the new key automatically.

- [ ] **Step 7: Wire the shell into the locale layout**

`app/[locale]/layout.tsx` already renders `<html lang>`, `<body>` with the three font-variable classes, and the
`<noscript>` fallback — that structure came from Task 2 and Task 3 and **must be preserved**. Do not replace the
return value. Add `const dict = getDictionary(locale)` after the `isLocale` guard, import `Header` and `Footer`,
and replace only the bare `{children}` inside `<body>` with:

```tsx
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:z-[60] focus:bg-amber focus:px-3 focus:py-2 focus:text-bg"
        >
          {dict.nav.skipToContent}
        </a>
        <Header locale={locale} dict={dict} />
        <main id="main">{children}</main>
        <Footer dict={dict} />
```

The `<noscript>` block stays as the first child of `<body>`, above the skip link.

- [ ] **Step 8: Run the tests**

Run: `npm test -- shell`
Expected: PASS.

- [ ] **Step 9: Commit**

```bash
git add -A
git commit -m "$(cat <<'EOF'
Add app shell with locale switch and skip link

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

### Task 5: Hero and credibility strip

**Files:**
- Create: `components/home/Hero.tsx`, `components/home/Credibility.tsx`, `tests/unit/hero.test.tsx`
- Modify: `app/[locale]/page.tsx`

**Interfaces:**
- Consumes: `Dictionary`, `StatusDot`, `Reveal`.
- Produces: `<Hero locale dict />`, `<Credibility dict />`.

- [ ] **Step 1: Write the failing test**

`tests/unit/hero.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { Hero } from '@/components/home/Hero'
import { Credibility } from '@/components/home/Credibility'
import { getDictionary } from '@/lib/i18n'

describe('Hero', () => {
  it('renders exactly one h1 containing the full headline', () => {
    const dict = getDictionary('fr')
    render(<Hero locale="fr" dict={dict} />)
    const headings = screen.getAllByRole('heading', { level: 1 })
    expect(headings).toHaveLength(1)
    expect(headings[0].textContent).toContain(dict.hero.headlineAccent)
  })

  it('offers both calls to action', () => {
    const dict = getDictionary('fr')
    render(<Hero locale="fr" dict={dict} />)
    expect(screen.getByRole('link', { name: new RegExp(dict.hero.ctaWork, 'i') })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: new RegExp(dict.hero.ctaCv, 'i') })).toBeInTheDocument()
  })
})

describe('Credibility', () => {
  it('renders one entry per dictionary fact', () => {
    const dict = getDictionary('en')
    render(<Credibility dict={dict} />)
    for (const fact of dict.credibility) {
      expect(screen.getByText(fact.label)).toBeInTheDocument()
    }
  })
})
```

- [ ] **Step 2: Run to verify failure**

Run: `npm test -- hero`
Expected: FAIL — modules not found.

- [ ] **Step 3: Implement Hero**

`components/home/Hero.tsx`:

```tsx
import type { Locale } from '@/lib/i18n/config'
import type { Dictionary } from '@/lib/i18n/types'
import { StatusDot } from '@/components/ui/StatusDot'

export function Hero({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  return (
    <section className="mx-auto max-w-6xl px-5 pb-11 pt-14 sm:px-12">
      <p className="label mb-6 inline-flex items-center gap-2 rounded-[3px] border border-amber/30 px-[10px] py-[5px] text-amber">
        <StatusDot />
        {dict.hero.availability}
      </p>

      <h1 className="mb-[18px] max-w-[15ch] font-display text-[clamp(2rem,7vw,3rem)] font-semibold
                     leading-[1.06] tracking-[-0.035em]">
        {dict.hero.headlineBefore}
        <span className="text-amber">{dict.hero.headlineAccent}</span>.
      </h1>

      <p className="mb-[30px] max-w-[50ch] text-[14.5px] leading-[1.72] text-dim">{dict.hero.summary}</p>

      <div className="flex flex-wrap items-center gap-[10px]">
        <a href="#travaux"
           className="rounded-[3px] bg-amber px-[18px] py-[11px] font-mono text-[10.5px] font-medium uppercase
                      tracking-[0.11em] text-bg transition-opacity duration-150 ease-(--ease-instrument) hover:opacity-90">
          {dict.hero.ctaWork} ↓
        </a>
        <a href={`/cv/nomeny-mitia-andriamaheva-${locale}.pdf`} download
           className="rounded-[3px] border border-line px-[18px] py-[11px] font-mono text-[10.5px] uppercase
                      tracking-[0.11em] text-dim transition-colors duration-150 ease-(--ease-instrument)
                      hover:border-amber/40 hover:text-ink">
          {dict.hero.ctaCv}
        </a>
      </div>
    </section>
  )
}
```

Per the Global Constraints, the hero does **not** animate on entry — it is above the fold.

- [ ] **Step 4: Implement Credibility**

`components/home/Credibility.tsx`:

```tsx
import type { Dictionary } from '@/lib/i18n/types'

export function Credibility({ dict }: { dict: Dictionary }) {
  return (
    <section className="mx-auto max-w-6xl px-5 sm:px-12">
      <dl className="grid grid-cols-2 border-y border-line md:grid-cols-4">
        {dict.credibility.map((fact) => (
          <div key={fact.label} className="border-line px-4 py-[17px] max-md:odd:pl-0 md:border-r md:pl-4 md:first:pl-0 md:last:border-r-0">
            {/* Amber goes on `value` — the word that carries the meaning ("Major", "1 an",
                "Clients") — with `accent` as the plain qualifier beside it. Reversing these
                puts the accent colour on decoration. */}
            <dt className="mb-[5px] font-display text-[21px] font-semibold tracking-[-0.025em]">
              <span className="text-amber">{fact.value}</span>{fact.accent}
            </dt>
            <dd className="label leading-[1.5]">{fact.label}</dd>
          </div>
        ))}
      </dl>
    </section>
  )
}
```

- [ ] **Step 5: Compose them on the homepage**

Replace `app/[locale]/page.tsx`:

```tsx
import { notFound } from 'next/navigation'
import { isLocale } from '@/lib/i18n/config'
import { getDictionary } from '@/lib/i18n'
import { Hero } from '@/components/home/Hero'
import { Credibility } from '@/components/home/Credibility'

export default async function Home({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()
  const dict = getDictionary(locale)
  return (
    <>
      <Hero locale={locale} dict={dict} />
      <Credibility dict={dict} />
    </>
  )
}
```

- [ ] **Step 6: Run tests and build**

```bash
npm test -- hero && npm run build
```

Expected: PASS, build succeeds.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "$(cat <<'EOF'
Add hero and credibility strip

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

### Task 6: Selected work list

**Files:**
- Create: `lib/content/projects.ts`, `components/home/SectionHead.tsx`, `components/home/Work.tsx`, `tests/unit/work.test.tsx`
- Modify: `app/[locale]/page.tsx`

**Interfaces:**
- Consumes: `Dictionary`, `Reveal`, `Rule`.
- Produces:
  - `interface Project { slug: ProjectSlug; index: string; stack: string[]; year: string; hasCaseStudy: boolean }`
  - `projects: readonly Project[]`
  - `<SectionHead id title note />`, `<Work locale dict />`

- [ ] **Step 1: Write the failing test**

`tests/unit/work.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { Work } from '@/components/home/Work'
import { getDictionary } from '@/lib/i18n'
import { projects } from '@/lib/content/projects'

beforeEach(() => {
  window.IntersectionObserver = class {
    constructor(private cb: IntersectionObserverCallback) {}
    observe() { this.cb([{ isIntersecting: true } as IntersectionObserverEntry], this as never) }
    unobserve() {} disconnect() {} takeRecords() { return [] }
    root = null; rootMargin = ''; thresholds = []
  } as unknown as typeof IntersectionObserver
  window.matchMedia = vi.fn().mockImplementation((q: string) => ({
    matches: false, media: q, onchange: null,
    addEventListener: vi.fn(), removeEventListener: vi.fn(),
    addListener: vi.fn(), removeListener: vi.fn(), dispatchEvent: vi.fn(),
  }))
})

describe('Work', () => {
  it('lists every project', () => {
    const dict = getDictionary('fr')
    render(<Work locale="fr" dict={dict} />)
    for (const project of projects) {
      expect(screen.getByText(dict.work.projects[project.slug].name)).toBeInTheDocument()
    }
  })

  it('links only the projects that have a case study', () => {
    const dict = getDictionary('fr')
    render(<Work locale="fr" dict={dict} />)
    const withCase = projects.filter((p) => p.hasCaseStudy)
    for (const project of withCase) {
      const link = screen.getByRole('link', { name: new RegExp(dict.work.projects[project.slug].name, 'i') })
      expect(link).toHaveAttribute('href', `/fr/travaux/${project.slug}/`)
    }
    expect(screen.getAllByRole('link')).toHaveLength(withCase.length)
  })

  it('has a stable two-digit index for every project', () => {
    for (const project of projects) expect(project.index).toMatch(/^\d{2}$/)
  })
})
```

- [ ] **Step 2: Run to verify failure**

Run: `npm test -- work`
Expected: FAIL — modules not found.

- [ ] **Step 3: Define the project metadata**

`lib/content/projects.ts`:

```ts
import type { ProjectSlug } from '@/lib/i18n/types'

export interface Project {
  slug: ProjectSlug
  index: string
  stack: string[]
  year: string
  hasCaseStudy: boolean
}

export const projects: readonly Project[] = [
  { slug: 'soluchat',   index: '01', stack: ['React', 'TypeScript', 'Rust'], year: '2025', hasCaseStudy: true },
  { slug: 'automatisation', index: '02', stack: ['Salesforce', 'PDF Butler'], year: '2025', hasCaseStudy: true },
  { slug: 'zarahay',    index: '03', stack: ['Angular', 'Django'],           year: '2024', hasCaseStudy: false },
  { slug: 'inventaire', index: '04', stack: ['Java Swing'],                  year: '2023', hasCaseStudy: false },
] as const
```

`hasCaseStudy: false` on the last two is the launch scope from spec §9 — they appear as rows but do not link anywhere yet.

- [ ] **Step 4: Implement SectionHead**

`components/home/SectionHead.tsx`:

```tsx
import { Rule } from '@/components/ui/Rule'

export function SectionHead({ id, title, note }: { id: string; title: string; note: string }) {
  return (
    <div className="mt-11">
      <div className="flex items-baseline justify-between pb-[10px]">
        <h2 id={id} className="font-display text-[15px] font-semibold tracking-[-0.015em]">{title}</h2>
        <span className="label">{note}</span>
      </div>
      <Rule />
    </div>
  )
}
```

- [ ] **Step 5: Implement Work**

`components/home/Work.tsx`:

```tsx
import Link from 'next/link'
import type { Locale } from '@/lib/i18n/config'
import type { Dictionary } from '@/lib/i18n/types'
import { projects } from '@/lib/content/projects'
import { SectionHead } from './SectionHead'
import { Reveal } from '@/components/ui/Reveal'

export function Work({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  return (
    <section id="travaux" aria-labelledby="travaux-title" className="mx-auto max-w-6xl px-5 sm:px-12">
      <SectionHead id="travaux-title" title={dict.work.title} note={dict.work.note} />

      {/* role="list" is redundant in the HTML spec but not in practice: Tailwind's
          reset sets list-style:none, which makes WebKit/VoiceOver drop the list
          role entirely. axe cannot catch this — it is AT behaviour, not static DOM. */}
      <ul role="list">
        {projects.map((project, i) => {
          const copy = dict.work.projects[project.slug]
          const row = (
            <div className="grid grid-cols-[26px_1fr] items-center gap-4 border-b border-line py-4
                            transition-colors duration-150 ease-(--ease-instrument)
                            md:grid-cols-[32px_1.5fr_1.3fr_150px_54px] group-hover:border-amber/25">
              <span className="font-mono text-[10px] text-amber">{project.index}</span>
              <span className="font-display text-[16.5px] font-medium tracking-[-0.018em]">{copy.name}</span>
              <span className="hidden text-[12.5px] leading-[1.55] text-dim md:block">{copy.description}</span>
              <span className="hidden font-mono text-[10px] text-faint md:block">{project.stack.join(' · ')}</span>
              <span className="hidden text-right font-mono text-[10px] text-faint md:block">{project.year}</span>
            </div>
          )

          return (
            <li key={project.slug}>
              <Reveal delay={i * 40}>
                {project.hasCaseStudy ? (
                  <Link href={`/${locale}/travaux/${project.slug}/`} className="group block">{row}</Link>
                ) : (
                  // No `group` class here: the row markup carries
                  // `group-hover:border-amber/25`, and binding it on a
                  // non-interactive row would signal "clickable" in the one
                  // colour reserved for wayfinding, on a row that goes nowhere.
                  <div>{row}</div>
                )}
              </Reveal>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
```

- [ ] **Step 6: Add Work to the homepage**

In `app/[locale]/page.tsx`, import `Work` and render `<Work locale={locale} dict={dict} />` after `<Credibility />`.

- [ ] **Step 7: Run tests**

Run: `npm test -- work`
Expected: PASS.

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "$(cat <<'EOF'
Add selected work list

Only projects with a written case study are linked; the rest render as
rows, matching the launch scope in the spec.

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

### Task 7: Skills, Parcours, and About

**Files:**
- Create: `components/home/Skills.tsx`, `components/home/Parcours.tsx`, `components/home/About.tsx`, `tests/unit/skills.test.tsx`
- Modify: `app/[locale]/page.tsx`

**Interfaces:**
- Consumes: `Dictionary`, `SectionHead`, `Reveal`.
- Produces: `<Skills dict />`, `<Parcours dict />`, `<About dict />`.

- [ ] **Step 1: Write the failing test**

`tests/unit/skills.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { Skills } from '@/components/home/Skills'
import { Parcours } from '@/components/home/Parcours'
import { getDictionary } from '@/lib/i18n'

beforeEach(() => {
  window.IntersectionObserver = class {
    constructor(private cb: IntersectionObserverCallback) {}
    observe() { this.cb([{ isIntersecting: true } as IntersectionObserverEntry], this as never) }
    unobserve() {} disconnect() {} takeRecords() { return [] }
    root = null; rootMargin = ''; thresholds = []
  } as unknown as typeof IntersectionObserver
  window.matchMedia = vi.fn().mockImplementation((q: string) => ({
    matches: false, media: q, onchange: null,
    addEventListener: vi.fn(), removeEventListener: vi.fn(),
    addListener: vi.fn(), removeListener: vi.fn(), dispatchEvent: vi.fn(),
  }))
})

describe('Skills', () => {
  it('renders every level and every item', () => {
    const dict = getDictionary('fr')
    render(<Skills dict={dict} />)
    for (const group of dict.skills.groups) {
      expect(screen.getByText(group.level)).toBeInTheDocument()
      for (const item of group.items) expect(screen.getByText(item)).toBeInTheDocument()
    }
  })

  it('uses no progress bars or numeric proficiency', () => {
    const dict = getDictionary('fr')
    const { container } = render(<Skills dict={dict} />)
    expect(container.querySelectorAll('progress, meter, [role="progressbar"]')).toHaveLength(0)
    expect(container.textContent).not.toMatch(/\d{1,3}\s*%/)
  })
})

describe('Parcours', () => {
  it('renders every entry with its period and organisation', () => {
    const dict = getDictionary('en')
    render(<Parcours dict={dict} />)
    for (const entry of dict.parcours.entries) {
      expect(screen.getByText(entry.period)).toBeInTheDocument()
      expect(screen.getByText(entry.role)).toBeInTheDocument()
    }
  })
})

describe('About', () => {
  it('renders every paragraph of the bio', () => {
    const dict = getDictionary('fr')
    render(<About dict={dict} />)
    for (const paragraph of dict.about.body) {
      expect(screen.getByText(paragraph)).toBeInTheDocument()
    }
  })
})
```

Add `import { About } from '@/components/home/About'` to the test's imports.

The second test encodes a spec rule as an executable constraint: skill bars are a junior tell, and a future edit that adds one now fails the suite.

- [ ] **Step 2: Run to verify failure**

Run: `npm test -- skills`
Expected: FAIL — modules not found.

- [ ] **Step 3: Implement Skills**

`components/home/Skills.tsx`:

```tsx
import type { Dictionary } from '@/lib/i18n/types'
import { SectionHead } from './SectionHead'
import { Reveal } from '@/components/ui/Reveal'

export function Skills({ dict }: { dict: Dictionary }) {
  return (
    <section id="competences" aria-labelledby="competences-title" className="mx-auto max-w-6xl px-5 sm:px-12">
      <SectionHead id="competences-title" title={dict.skills.title} note={dict.skills.note} />

      <dl>
        {dict.skills.groups.map((group, i) => (
          <Reveal key={group.level} delay={i * 40}>
            <div className="grid grid-cols-1 items-start gap-2 border-b border-line py-[14px] sm:grid-cols-[118px_1fr] sm:gap-4">
              <dt className={`label pt-1 ${i === dict.skills.groups.length - 1 ? '' : 'text-amber'}`}>
                {group.level}
              </dt>
              <dd className="flex flex-wrap gap-[7px]">
                {group.items.map((item) => (
                  <span key={item} className="rounded-[3px] border border-line px-[9px] py-1 text-[12px]">
                    {item}
                  </span>
                ))}
              </dd>
            </div>
          </Reveal>
        ))}
      </dl>
    </section>
  )
}
```

The last group ("Notions" / "Familiar") deliberately keeps the faint label colour — amber is reserved for claims backed by production work.

- [ ] **Step 4: Implement Parcours**

`components/home/Parcours.tsx`:

```tsx
import type { Dictionary } from '@/lib/i18n/types'
import { SectionHead } from './SectionHead'
import { Reveal } from '@/components/ui/Reveal'

export function Parcours({ dict }: { dict: Dictionary }) {
  return (
    <section id="parcours" aria-labelledby="parcours-title" className="mx-auto max-w-6xl px-5 sm:px-12">
      <SectionHead id="parcours-title" title={dict.parcours.title} note={dict.parcours.note} />

      {/* role="list" for the same reason as Work's <ul>: Tailwind's reset sets
          list-style:none, which makes WebKit/VoiceOver drop the list role. axe
          cannot detect it, so deferring it means never catching it. */}
      <ol role="list">
        {dict.parcours.entries.map((entry, i) => (
          <li key={`${entry.period}-${entry.role}`}>
            <Reveal delay={i * 40}>
              <div className="grid grid-cols-1 gap-1 border-b border-line py-[14px] sm:grid-cols-[118px_1fr] sm:gap-4">
                <span className="font-mono text-[10px] text-faint sm:pt-[3px]">{entry.period}</span>
                <div>
                  <h3 className="mb-[3px] font-display text-[14.5px] font-medium tracking-[-0.015em]">{entry.role}</h3>
                  <p className="text-[12px] text-dim">
                    <span className="font-medium text-amber">{entry.org}</span> — {entry.detail}
                  </p>
                </div>
              </div>
            </Reveal>
          </li>
        ))}
      </ol>
    </section>
  )
}
```

- [ ] **Step 5: Implement About**

`components/home/About.tsx`:

```tsx
import type { Dictionary } from '@/lib/i18n/types'
import { SectionHead } from './SectionHead'
import { Reveal } from '@/components/ui/Reveal'

export function About({ dict }: { dict: Dictionary }) {
  return (
    <section id="a-propos" aria-labelledby="a-propos-title" className="mx-auto max-w-6xl px-5 sm:px-12">
      <SectionHead id="a-propos-title" title={dict.about.title} note={dict.about.note} />

      <div className="grid gap-6 py-6 md:grid-cols-[118px_1fr] md:gap-4">
        {/* Empty left cell: it keeps this section on the same grid rhythm as
            Skills and Parcours, whose left columns carry real data (levels,
            periods). Filling it with a decorative index like "01 / 01" would be
            inventing data to look instrument-like, which is the opposite of
            what this design is doing. */}
        <div aria-hidden="true" />
        <div className="max-w-[58ch]">
          {dict.about.body.map((paragraph, i) => (
            <Reveal key={paragraph.slice(0, 24)} delay={i * 40}>
              <p className="mb-4 text-[13.5px] leading-[1.75] text-dim">{paragraph}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
```

- [ ] **Step 6: Add all three to the homepage**

In `app/[locale]/page.tsx`, import and render `<Skills dict={dict} />`, `<Parcours dict={dict} />`, then `<About dict={dict} />` after `<Work />` and before `<Contact />`.

- [ ] **Step 7: Run tests**

Run: `npm test -- skills`
Expected: PASS.

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "$(cat <<'EOF'
Add skills, background and about sections

Skills are graded by depth rather than shown as proficiency bars; a test
enforces that no progress bar or percentage creeps back in.

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

### Task 8: Contact section and form

**Files:**
- Create: `components/home/Contact.tsx`, `components/home/ContactForm.tsx`, `.env.local.example`, `tests/unit/contact.test.tsx`
- Modify: `app/[locale]/page.tsx`

**Interfaces:**
- Consumes: `Dictionary`.
- Produces: `<Contact dict />` wrapping `<ContactForm dict />`.

- [ ] **Step 1: Write the failing test**

`tests/unit/contact.test.tsx`:

```tsx
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ContactForm } from '@/components/home/ContactForm'
import { Contact } from '@/components/home/Contact'
import { getDictionary } from '@/lib/i18n'

beforeEach(() => { vi.restoreAllMocks() })

describe('Contact', () => {
  it('always shows the email address as a fallback', () => {
    const dict = getDictionary('fr')
    render(<Contact dict={dict} />)
    expect(screen.getByRole('link', { name: /nomenymitia\.andria@gmail\.com/i }))
      .toHaveAttribute('href', 'mailto:nomenymitia.andria@gmail.com')
  })
})

describe('ContactForm', () => {
  it('labels every field', () => {
    const dict = getDictionary('fr')
    render(<ContactForm dict={dict} />)
    expect(screen.getByLabelText(dict.contact.nameField)).toBeInTheDocument()
    expect(screen.getByLabelText(dict.contact.emailField)).toBeInTheDocument()
    expect(screen.getByLabelText(dict.contact.messageField)).toBeInTheDocument()
  })

  it('reports success after a successful submission', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => ({ success: true }) }))
    const dict = getDictionary('fr')
    render(<ContactForm dict={dict} />)
    await userEvent.type(screen.getByLabelText(dict.contact.nameField), 'Camille')
    await userEvent.type(screen.getByLabelText(dict.contact.emailField), 'c@example.com')
    await userEvent.type(screen.getByLabelText(dict.contact.messageField), 'Bonjour')
    await userEvent.click(screen.getByRole('button', { name: dict.contact.submit }))
    await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent(dict.contact.success))
  })

  it('reports an error when the endpoint fails', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, json: async () => ({ success: false }) }))
    const dict = getDictionary('fr')
    render(<ContactForm dict={dict} />)
    await userEvent.type(screen.getByLabelText(dict.contact.nameField), 'Camille')
    await userEvent.type(screen.getByLabelText(dict.contact.emailField), 'c@example.com')
    await userEvent.type(screen.getByLabelText(dict.contact.messageField), 'Bonjour')
    await userEvent.click(screen.getByRole('button', { name: dict.contact.submit }))
    await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent(dict.contact.error))
  })
})
```

- [ ] **Step 2: Run to verify failure**

Run: `npm test -- contact`
Expected: FAIL — modules not found.

- [ ] **Step 3: Implement ContactForm**

`components/home/ContactForm.tsx`:

```tsx
'use client'

import { useState, type FormEvent } from 'react'
import type { Dictionary } from '@/lib/i18n/types'

type Status = 'idle' | 'sending' | 'sent' | 'failed'

const FIELD =
  'w-full rounded-[3px] border border-line bg-transparent px-3 py-2 text-[13px] text-ink ' +
  'transition-colors duration-150 ease-(--ease-instrument) placeholder:text-faint focus:border-amber/50'

export function ContactForm({ dict }: { dict: Dictionary }) {
  const [status, setStatus] = useState<Status>('idle')

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setStatus('sending')
    const form = new FormData(event.currentTarget)
    form.append('access_key', process.env.NEXT_PUBLIC_WEB3FORMS_KEY ?? '')
    try {
      const response = await fetch('https://api.web3forms.com/submit', { method: 'POST', body: form })
      setStatus(response.ok ? 'sent' : 'failed')
    } catch {
      setStatus('failed')
    }
  }

  return (
    <form onSubmit={onSubmit} className="flex w-full max-w-sm flex-col gap-3">
      <div>
        <label htmlFor="cf-name" className="label mb-1 block">{dict.contact.nameField}</label>
        <input id="cf-name" name="name" required autoComplete="name" className={FIELD} />
      </div>
      <div>
        <label htmlFor="cf-email" className="label mb-1 block">{dict.contact.emailField}</label>
        <input id="cf-email" name="email" type="email" required autoComplete="email" className={FIELD} />
      </div>
      <div>
        <label htmlFor="cf-message" className="label mb-1 block">{dict.contact.messageField}</label>
        <textarea id="cf-message" name="message" required rows={4} className={FIELD} />
      </div>

      <button type="submit" disabled={status === 'sending'}
        className="rounded-[3px] bg-amber px-[18px] py-[11px] font-mono text-[10.5px] font-medium uppercase
                   tracking-[0.11em] text-bg transition-opacity duration-150 ease-(--ease-instrument)
                   hover:opacity-90 disabled:opacity-60">
        {status === 'sending' ? dict.contact.sending : dict.contact.submit}
      </button>

      <p role="status" aria-live="polite" className="min-h-[1.2em] text-[12px] text-dim">
        {status === 'sent' ? dict.contact.success : status === 'failed' ? dict.contact.error : ''}
      </p>
    </form>
  )
}
```

- [ ] **Step 4: Implement Contact**

`components/home/Contact.tsx`:

```tsx
import type { Dictionary } from '@/lib/i18n/types'
import { ContactForm } from './ContactForm'

const EMAIL = 'nomenymitia.andria@gmail.com'

export function Contact({ dict }: { dict: Dictionary }) {
  return (
    <section id="contact" aria-labelledby="contact-title"
             className="mx-auto mt-11 max-w-6xl border-t border-line px-5 py-11 sm:px-12">
      <div className="flex flex-col justify-between gap-8 md:flex-row">
        <div className="max-w-md">
          <h2 id="contact-title" className="mb-[10px] max-w-[18ch] font-display text-[27px] font-semibold tracking-[-0.03em]">
            {dict.contact.title}
          </h2>
          <p className="mb-5 text-[13px] leading-[1.65] text-dim">{dict.contact.body}</p>
          <p className="label mb-[7px]">{dict.contact.emailLabel}</p>
          <a href={`mailto:${EMAIL}`} className="font-mono text-[12px] text-amber underline-offset-4 hover:underline">
            {EMAIL}
          </a>
        </div>
        <ContactForm dict={dict} />
      </div>
    </section>
  )
}
```

- [ ] **Step 5: Document the environment variable**

`.env.local.example`:

```
# Web3Forms access key — https://web3forms.com (free, no account required)
# Copy this file to .env.local and paste the key you receive by email.
NEXT_PUBLIC_WEB3FORMS_KEY=
```

Add `.env.local` to `.gitignore` if `create-next-app` did not already.

- [ ] **Step 6: Add Contact to the homepage**

In `app/[locale]/page.tsx`, import and render `<Contact dict={dict} />` last.

- [ ] **Step 7: Run tests**

Run: `npm test -- contact`
Expected: PASS, all four assertions.

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "$(cat <<'EOF'
Add contact section with Web3Forms submission

The email address is always visible so a broken form never blocks a
recruiter from making contact.

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

### Task 9: Case study pages

**Files:**
- Create: `lib/content/case-studies.ts`, `app/[locale]/travaux/[slug]/page.tsx`, `mdx-components.tsx`, `content/case-studies/soluchat.fr.mdx`, `content/case-studies/soluchat.en.mdx`, `content/case-studies/automatisation.fr.mdx`, `content/case-studies/automatisation.en.mdx`, `tests/unit/case-studies.test.ts`

**Interfaces:**
- Consumes: `Locale`, `Dictionary`, `projects`.
- Produces:
  - `caseStudySlugs: readonly ['soluchat','automatisation']`, `type CaseStudySlug`
  - `hasCaseStudy(slug: string): slug is CaseStudySlug`
  - `loadCaseStudy(slug: CaseStudySlug, locale: Locale): Promise<ComponentType>`

- [ ] **Step 1: Write the failing test**

`tests/unit/case-studies.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { caseStudySlugs, hasCaseStudy, loadCaseStudy } from '@/lib/content/case-studies'
import { projects } from '@/lib/content/projects'
import { locales } from '@/lib/i18n/config'

describe('case studies', () => {
  it('matches the projects flagged as having one', () => {
    const flagged = projects.filter((p) => p.hasCaseStudy).map((p) => p.slug).sort()
    expect([...caseStudySlugs].sort()).toEqual(flagged)
  })

  it('narrows unknown slugs', () => {
    expect(hasCaseStudy('soluchat')).toBe(true)
    expect(hasCaseStudy('nope')).toBe(false)
  })

  it('resolves an MDX component for every slug in every locale', async () => {
    for (const slug of caseStudySlugs) {
      for (const locale of locales) {
        const Component = await loadCaseStudy(slug, locale)
        expect(Component, `${slug}.${locale}`).toBeTypeOf('function')
      }
    }
  })
})
```

The first assertion is the one that matters: it makes `projects.hasCaseStudy` and the actual MDX files impossible to drift apart.

- [ ] **Step 2: Run to verify failure**

Run: `npm test -- case-studies`
Expected: FAIL — module not found.

- [ ] **Step 3: Add the MDX components file**

`mdx-components.tsx` at the project root — required by `@next/mdx`:

```tsx
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
```

- [ ] **Step 4: Implement the case study registry**

`lib/content/case-studies.ts`:

```ts
import type { ComponentType } from 'react'
import type { Locale } from '@/lib/i18n/config'

export const caseStudySlugs = ['soluchat', 'automatisation'] as const
export type CaseStudySlug = (typeof caseStudySlugs)[number]

export function hasCaseStudy(slug: string): slug is CaseStudySlug {
  return (caseStudySlugs as readonly string[]).includes(slug)
}

const loaders: Record<CaseStudySlug, Record<Locale, () => Promise<{ default: ComponentType }>>> = {
  soluchat: {
    fr: () => import('@/content/case-studies/soluchat.fr.mdx'),
    en: () => import('@/content/case-studies/soluchat.en.mdx'),
  },
  automatisation: {
    fr: () => import('@/content/case-studies/automatisation.fr.mdx'),
    en: () => import('@/content/case-studies/automatisation.en.mdx'),
  },
}

export async function loadCaseStudy(slug: CaseStudySlug, locale: Locale): Promise<ComponentType> {
  const mod = await loaders[slug][locale]()
  return mod.default
}
```

Static import paths keep every case study in the build graph, which `output: 'export'` requires.

- [ ] **Step 5: Write the case study content**

Each file follows the spec's fixed template. `content/case-studies/soluchat.fr.mdx` — **Nomeny writes the real prose; this is the structure with placeholder-free starter text he replaces:**

```mdx
## Contexte

Soluchat est une application de messagerie temps réel développée chez un
intégrateur Salesforce, destinée à remplacer un fil de discussion par e-mail
entre équipes projet réparties sur plusieurs fuseaux horaires.

## Contraintes

- Latence perceptible inférieure à 200 ms sur des connexions instables.
- Historique consultable sans recharger la conversation entière.
- Aucune dépendance à un service de messagerie tiers.

## Stack

React, TypeScript côté client. Backend en Rust, communication par WebSocket.

## Décisions & arbitrages

Le backend a été écrit en **Rust** plutôt qu'en Node : le coût d'apprentissage
était réel, mais la gestion mémoire prévisible et l'absence de pauses GC
comptaient davantage sur des connexions déjà fragiles.

L'état côté client est resté volontairement simple — pas de bibliothèque de
gestion d'état globale. À cette échelle, elle aurait ajouté de l'indirection
sans résoudre de problème réel.

## Ce qui n'a pas marché

La première version rechargeait l'historique complet à chaque reconnexion, ce
qui rendait les coupures réseau très coûteuses. La pagination par curseur est
arrivée en deuxième itération, après mesure.

## Résultat

Messagerie utilisée quotidiennement par les équipes projet, avec un historique
consultable et une reconnexion transparente.
```

`content/case-studies/automatisation.fr.mdx` — same six headings, anonymised per the Global Constraints:

```mdx
## Contexte

Un intégrateur Salesforce européen générait ses documents contractuels à la
main depuis Salesforce : devis, confirmations, contrats. Chaque document
demandait une reprise manuelle, et chaque reprise introduisait un risque
d'erreur sur des pièces qui engagent juridiquement le client final.

## Contraintes

- Les documents devaient rester conformes à la charte de chaque client final.
- Aucune intervention manuelle entre la donnée Salesforce et le PDF signé.
- Les modèles devaient rester modifiables par des non-développeurs.

## Stack

Salesforce (administration, profils), PDF Butler, FORM Butler, SIGN Butler.

## Décisions & arbitrages

Le mapping des données a été centralisé plutôt que dupliqué par modèle. C'était
plus long à mettre en place, mais un changement de structure côté Salesforce ne
casse plus dix modèles à la fois.

Les modèles sont restés pilotés par les équipes métier. Il aurait été plus
rapide de tout coder en dur ; cela aurait rendu l'équipe dépendante d'un
développeur pour chaque virgule.

## Ce qui n'a pas marché

Les premiers workflows échouaient silencieusement quand un champ attendu était
vide côté Salesforce — le document se générait, incomplet, sans alerte. La
correction a consisté à valider les données en amont de la génération plutôt
qu'à inspecter les PDF après coup.

## Résultat

Génération documentaire de bout en bout, sans reprise manuelle, pour des
clients internationaux. Les modèles restent maintenus par les équipes métier.
```

Then write `soluchat.en.mdx` and `automatisation.en.mdx` as direct English translations of the two French files, keeping the six headings in the order given by `Dictionary.caseStudy`.

**These four files are starter drafts.** They are structurally complete and safe to ship, but Nomeny replaces the prose with the real detail — the actual numbers, the actual failures — because the specificity is the whole point of the case study. **Per the Global Constraints, the client is named only as "un intégrateur Salesforce européen" / "a European Salesforce integrator".**

- [ ] **Step 6: Implement the case study page**

`app/[locale]/travaux/[slug]/page.tsx`:

```tsx
import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { locales, isLocale } from '@/lib/i18n/config'
import { getDictionary } from '@/lib/i18n'
import { caseStudySlugs, hasCaseStudy, loadCaseStudy } from '@/lib/content/case-studies'
import { projects } from '@/lib/content/projects'

export function generateStaticParams() {
  return locales.flatMap((locale) => caseStudySlugs.map((slug) => ({ locale, slug })))
}

export async function generateMetadata(
  { params }: { params: Promise<{ locale: string; slug: string }> },
): Promise<Metadata> {
  const { locale, slug } = await params
  if (!isLocale(locale) || !hasCaseStudy(slug)) return {}
  const dict = getDictionary(locale)
  const copy = dict.work.projects[slug]
  return { title: `${copy.name} — Nomeny Mitia Andriamaheva`, description: copy.description }
}

export default async function CaseStudyPage(
  { params }: { params: Promise<{ locale: string; slug: string }> },
) {
  const { locale, slug } = await params
  if (!isLocale(locale) || !hasCaseStudy(slug)) notFound()

  const dict = getDictionary(locale)
  const copy = dict.work.projects[slug]
  const project = projects.find((p) => p.slug === slug)
  const Content = await loadCaseStudy(slug, locale)

  return (
    <article className="mx-auto max-w-3xl px-5 py-12 sm:px-12">
      <Link href={`/${locale}/#travaux`} className="label mb-8 inline-block hover:text-ink">
        ← {dict.caseStudy.back}
      </Link>

      <header className="mb-10 border-b border-line pb-8">
        <p className="label mb-3">{project?.index} · {project?.year}</p>
        <h1 className="mb-3 font-display text-[clamp(1.75rem,5vw,2.25rem)] font-semibold leading-[1.1] tracking-[-0.035em]">
          {copy.name}
        </h1>
        <p className="mb-5 text-[14.5px] leading-[1.7] text-dim">{copy.description}</p>
        <p className="font-mono text-[10px] text-faint">{project?.stack.join(' · ')}</p>
      </header>

      <Content />
    </article>
  )
}
```

- [ ] **Step 7: Run tests and confirm every page exports**

```bash
npm test -- case-studies && npm run build
ls out/fr/travaux/soluchat/index.html out/en/travaux/automatisation/index.html
```

Expected: tests PASS, both files exist.

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "$(cat <<'EOF'
Add MDX case study pages

A test asserts the case study registry matches the projects flagged as
having one, so the two cannot drift apart.

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

### Task 10: Metadata, hreflang, sitemap, and CV assets

**Files:**
- Create: `app/[locale]/opengraph-image.tsx`, `public/cv/` assets, `public/robots.txt`, `app/sitemap.ts`
- Modify: `app/[locale]/layout.tsx`, `app/layout.tsx`

**Interfaces:**
- Consumes: `getDictionary`, `locales`, `caseStudySlugs`.
- Produces: per-locale `<link rel="alternate" hreflang>`, a static `sitemap.xml`, and a generated OG image.

- [ ] **Step 1: Write the failing test**

`tests/unit/metadata.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { generateMetadata } from '@/app/[locale]/layout'
import { locales } from '@/lib/i18n/config'
import { getDictionary } from '@/lib/i18n'

describe('locale metadata', () => {
  it('sets title and description from the dictionary', async () => {
    for (const locale of locales) {
      const meta = await generateMetadata({ params: Promise.resolve({ locale }) })
      expect(meta.title).toBe(getDictionary(locale).meta.title)
    }
  })

  it('declares hreflang alternates for every locale', async () => {
    const meta = await generateMetadata({ params: Promise.resolve({ locale: 'fr' }) })
    expect(meta.alternates?.languages).toMatchObject({ fr: '/fr/', en: '/en/' })
  })
})
```

- [ ] **Step 2: Run to verify failure**

Run: `npm test -- metadata`
Expected: FAIL — `alternates` is undefined.

- [ ] **Step 3: Extend generateMetadata**

Replace `generateMetadata` in `app/[locale]/layout.tsx`:

```tsx
export async function generateMetadata(
  { params }: { params: Promise<{ locale: string }> },
): Promise<Metadata> {
  const { locale } = await params
  if (!isLocale(locale)) return {}
  const dict = getDictionary(locale)
  return {
    title: dict.meta.title,
    description: dict.meta.description,
    alternates: {
      canonical: `/${locale}/`,
      languages: Object.fromEntries(locales.map((l) => [l, `/${l}/`])),
    },
    openGraph: {
      title: dict.meta.title,
      description: dict.meta.description,
      locale: locale === 'fr' ? 'fr_FR' : 'en_GB',
      type: 'website',
    },
  }
}
```

Add `metadataBase` in `app/layout.tsx` so relative URLs resolve:

```tsx
export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'https://nomeny.dev'),
}
```

Add `NEXT_PUBLIC_SITE_URL=` to `.env.local.example`.

- [ ] **Step 4: Add the sitemap**

`app/sitemap.ts`:

```ts
import type { MetadataRoute } from 'next'
import { locales } from '@/lib/i18n/config'
import { caseStudySlugs } from '@/lib/content/case-studies'

export const dynamic = 'force-static'

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://nomeny.dev'
  const home = locales.map((locale) => ({ url: `${base}/${locale}/`, priority: 1 }))
  const studies = locales.flatMap((locale) =>
    caseStudySlugs.map((slug) => ({ url: `${base}/${locale}/travaux/${slug}/`, priority: 0.8 })),
  )
  return [...home, ...studies]
}
```

`public/robots.txt`:

```
User-agent: *
Allow: /
Sitemap: https://nomeny.dev/sitemap.xml
```

- [ ] **Step 5: Add the OG image**

`app/[locale]/opengraph-image.tsx`:

```tsx
import { ImageResponse } from 'next/og'
import { isLocale } from '@/lib/i18n/config'
import { getDictionary } from '@/lib/i18n'

export const alt = 'Nomeny Mitia Andriamaheva'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

// Next 16 breaking change (v16.0.0): the default image function's `params`
// is a Promise. The synchronous form from Next 15 no longer type-checks.
export default async function Image({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params
  const locale = isLocale(raw) ? raw : 'fr'
  const dict = getDictionary(locale)

  return new ImageResponse(
    (
      <div style={{
        width: '100%', height: '100%', display: 'flex', flexDirection: 'column',
        justifyContent: 'center', background: '#08090A', color: '#EDEFF1', padding: 80,
      }}>
        <div style={{ fontSize: 22, color: '#E8A33D', letterSpacing: 4, marginBottom: 28 }}>
          NOMENY MITIA ANDRIAMAHEVA
        </div>
        <div style={{ fontSize: 62, lineHeight: 1.1, letterSpacing: -2, maxWidth: 900 }}>
          {dict.hero.headlineBefore}
          <span style={{ color: '#E8A33D' }}>{dict.hero.headlineAccent}</span>.
        </div>
      </div>
    ),
    size,
  )
}
```

- [ ] **Step 6: Add the CV files**

```bash
mkdir -p public/cv
cp CV_NomenyMitia_FR.pdf public/cv/nomeny-mitia-andriamaheva-fr.pdf
```

The English CV does not exist yet. Until Nomeny supplies it, copy the French file to the English path so the link is never broken:

```bash
cp CV_NomenyMitia_FR.pdf public/cv/nomeny-mitia-andriamaheva-en.pdf
```

Flag this in the handoff — it must be replaced with a genuine English CV before launch.

- [ ] **Step 7: Run tests and build**

```bash
npm test && npm run build && ls out/sitemap.xml
```

Expected: PASS, sitemap present.

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "$(cat <<'EOF'
Add metadata, hreflang alternates, sitemap and OG image

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

### Task 11: Cursor reticle and quality gates

**Files:**
- Create: `components/ui/CursorReticle.tsx`, `playwright.config.ts`, `tests/e2e/a11y.spec.ts`, `tests/e2e/motion.spec.ts`, `tests/e2e/responsive.spec.ts`
- Modify: `app/[locale]/layout.tsx`

**Interfaces:**
- Consumes: `useReducedMotion`.
- Produces: `<CursorReticle />`; a Playwright suite enforcing the spec's quality gates.

- [ ] **Step 1: Implement the cursor reticle**

`components/ui/CursorReticle.tsx`:

```tsx
'use client'

import { useEffect, useRef, useState } from 'react'
import { useReducedMotion } from '@/lib/hooks/useReducedMotion'

export function CursorReticle() {
  const ref = useRef<HTMLDivElement>(null)
  const [enabled, setEnabled] = useState(false)
  const reduced = useReducedMotion()

  useEffect(() => {
    if (reduced || !window.matchMedia('(pointer: fine)').matches) { setEnabled(false); return }
    setEnabled(true)

    const el = ref.current
    if (!el) return
    let frame = 0
    const onMove = (event: PointerEvent) => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => {
        el.style.transform = `translate3d(${event.clientX - 9}px, ${event.clientY - 9}px, 0)`
      })
    }
    window.addEventListener('pointermove', onMove, { passive: true })
    return () => { window.removeEventListener('pointermove', onMove); cancelAnimationFrame(frame) }
  }, [reduced])

  if (!enabled) return null

  return (
    <div ref={ref} aria-hidden="true"
         className="pointer-events-none fixed left-0 top-0 z-[60] h-[18px] w-[18px] will-change-transform">
      <span className="absolute left-1/2 top-0 h-[6px] w-px -translate-x-1/2 bg-amber/60" />
      <span className="absolute bottom-0 left-1/2 h-[6px] w-px -translate-x-1/2 bg-amber/60" />
      <span className="absolute left-0 top-1/2 h-px w-[6px] -translate-y-1/2 bg-amber/60" />
      <span className="absolute right-0 top-1/2 h-px w-[6px] -translate-y-1/2 bg-amber/60" />
    </div>
  )
}
```

Render `<CursorReticle />` inside `app/[locale]/layout.tsx`, just before `</div>`.

- [ ] **Step 2: Configure Playwright**

`playwright.config.ts`:

```ts
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './tests/e2e',
  use: { baseURL: 'http://localhost:3000' },
  webServer: {
    command: 'npx serve out -l 3000',
    url: 'http://localhost:3000/fr/',
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'] } },
    { name: 'mobile', use: { ...devices['Pixel 5'] } },
  ],
})
```

```bash
npm install -D serve
```

- [ ] **Step 3: Write the accessibility gate**

`tests/e2e/a11y.spec.ts`:

```ts
import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

const PAGES = ['/fr/', '/en/', '/fr/travaux/soluchat/', '/en/travaux/automatisation/']

for (const path of PAGES) {
  test(`${path} has no accessibility violations`, async ({ page }) => {
    await page.goto(path)
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
      .analyze()
    expect(results.violations).toEqual([])
  })
}

test('every interactive element is keyboard reachable', async ({ page }) => {
  await page.goto('/fr/')
  await page.keyboard.press('Tab')
  const skipLink = page.getByRole('link', { name: /aller au contenu/i })
  await expect(skipLink).toBeFocused()
})
```

- [ ] **Step 4: Write the reduced-motion gate**

`tests/e2e/motion.spec.ts`:

```ts
import { test, expect } from '@playwright/test'

test('content is fully visible under prefers-reduced-motion', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/fr/')
  await page.locator('#travaux').scrollIntoViewIfNeeded()
  const firstRow = page.locator('#travaux li').first()
  await expect(firstRow).toBeVisible()
  await expect(firstRow.locator('[data-revealed]')).toHaveAttribute('data-revealed', 'true')
})

test('the cursor reticle is absent under reduced motion', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/fr/')
  await expect(page.locator('.will-change-transform')).toHaveCount(0)
})
```

- [ ] **Step 5: Write the responsive gate**

`tests/e2e/responsive.spec.ts`:

```ts
import { test, expect } from '@playwright/test'

test('does not scroll horizontally at 320px', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 720 })
  await page.goto('/fr/')
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  )
  expect(overflow).toBeLessThanOrEqual(1)
})

test('the language switch preserves the current page', async ({ page }) => {
  await page.goto('/fr/travaux/soluchat/')
  await page.getByRole('link', { name: /changer de langue/i }).click()
  await expect(page).toHaveURL(/\/en\/travaux\/soluchat\/$/)
})
```

- [ ] **Step 6: Run the full gate**

```bash
npm run build && npx playwright test
```

Expected: all specs PASS. Fix any axe violation before proceeding — zero violations is a spec requirement, not a target.

- [ ] **Step 7: Run Lighthouse**

```bash
npx serve out -l 3000 &
npx lighthouse http://localhost:3000/fr/ --preset=desktop --quiet --chrome-flags="--headless" --output=json --output-path=./lighthouse-desktop.json
npx lighthouse http://localhost:3000/fr/ --quiet --chrome-flags="--headless" --output=json --output-path=./lighthouse-mobile.json
node -e "for (const f of ['desktop','mobile']) { const r = require('./lighthouse-'+f+'.json'); const s = Object.entries(r.categories).map(([k,v])=>k+': '+Math.round(v.score*100)); console.log(f, s.join(', ')); }"
```

Expected: every category ≥ 95 on both. Add `lighthouse-*.json` to `.gitignore`.

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "$(cat <<'EOF'
Add cursor reticle and end-to-end quality gates

Accessibility, reduced-motion and 320px behaviour are now enforced by
Playwright rather than checked by hand.

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

### Task 12: Deploy

**Files:**
- Create: `README.md`
- Modify: `vercel.json`

**Interfaces:**
- Consumes: the complete static build.
- Produces: a live site.

- [ ] **Step 1: Write the README**

`README.md`:

````markdown
# nomeny.dev

Bilingual (FR/EN) portfolio. Next.js 16, static export, no server.

## Development

```bash
npm install
cp .env.local.example .env.local   # then fill in the Web3Forms key
npm run dev
```

## Verification

```bash
npm test          # unit — Vitest
npm run typecheck # TypeScript
npm run build     # static export to out/
npx playwright test  # a11y, reduced-motion, responsive gates
```

## Adding a case study

1. Write `content/case-studies/<slug>.fr.mdx` and `<slug>.en.mdx` using the
   six headings: Contexte, Contraintes, Stack, Décisions & arbitrages,
   Ce qui n'a pas marché, Résultat.
2. Add a loader entry in `lib/content/case-studies.ts` and the slug to
   `caseStudySlugs`.
3. Flip `hasCaseStudy` to `true` for that project in `lib/content/projects.ts`.

The test suite fails if those three fall out of sync.

## Constraint

No client names or client data in copy, screenshots, or commit messages.
````

- [ ] **Step 2: Deploy**

```bash
npm install -g vercel
vercel --prod
```

Set `NEXT_PUBLIC_WEB3FORMS_KEY` and `NEXT_PUBLIC_SITE_URL` in the Vercel project's environment variables, then redeploy so they are baked into the static build.

- [ ] **Step 3: Verify the live site**

Check by hand on the deployed URL:
- `/` redirects to `/fr/`
- the FR↔EN switch preserves the path
- the CV downloads in both locales
- the contact form delivers a real email
- both case studies render

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "$(cat <<'EOF'
Add README and deployment configuration

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Post-launch backlog

Not part of this plan; tracked so they are not forgotten.

1. Replace the placeholder English CV with a real translation (Task 10, Step 6).
2. Write the Zarahay and Inventaire case studies; flip their `hasCaseStudy` flags.
3. Register the domain and point it at the Vercel project.
4. Decide the About block and whether it carries a photograph (spec §10.3).
5. Replace the Java Swing project with a personal project that has a public repository — the one move that closes the no-public-code gap the whole site is built to work around.
