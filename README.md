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
npm run lint       # ESLint
npm run build     # static export to out/
npx playwright test  # a11y, reduced-motion, responsive gates
```

`npx playwright test` serves the static export itself (`npx serve out`) on
**port 4173**, not 3000, and always starts its own server
(`reuseExistingServer: false`) rather than adopting one that happens to
already be listening. A stray `next dev` server left running on 3000 once
caused the whole quality suite — Playwright and both Lighthouse runs — to
silently measure a development build instead of the static export, with no
test failure to flag it. If you run Lighthouse by hand, point it at 4173 too
(`npx serve out -l 4173`, then `http://localhost:4173/fr/`).

## Adding a case study

1. Write `content/case-studies/<slug>.fr.mdx` and `<slug>.en.mdx` using the
   six headings: Contexte, Contraintes, Stack, Décisions & arbitrages,
   Ce qui n'a pas marché, Résultat.
2. Add a loader entry in `lib/content/case-studies.ts` and the slug to
   `caseStudySlugs`.
3. Flip `hasCaseStudy` to `true` for that project in `lib/content/projects.ts`.

The test suite fails if those three fall out of sync.

## Deployment

Deployment is a manual step the site owner runs himself — it is not part of
this repository's automation.

```bash
npx vercel --prod
```

Run from the project root. Then, in the Vercel project's environment
variables, set:

- `NEXT_PUBLIC_WEB3FORMS_KEY`
- `NEXT_PUBLIC_SITE_URL`

Both are `NEXT_PUBLIC_` variables, so they are baked into the static build at
build time rather than read at request time — setting them alone has no
effect on the already-deployed output. **Redeploy after setting or changing
either one** for the new value to take effect.

Two things about that redeploy, both of which have already caused a live site
with a dead contact form:

- **Enable each variable for every environment**, not Production alone. A
  branch deploy builds as *Preview* and inlines an empty string for anything
  scoped to Production only. Neither variable is a secret — `NEXT_PUBLIC_`
  values ship to every visitor in the JS bundle by design, which is how a
  static form works with no server — so there is nothing to protect by
  withholding them from Preview.
- **Uncheck "Use existing Build Cache"** when redeploying after a change. The
  value lives inside an already-compiled chunk; a cached build restores that
  chunk and ignores the new variable entirely.

`next build` refuses to run at all when `NEXT_PUBLIC_WEB3FORMS_KEY` is empty
(see `lib/env.ts`), so a misconfigured deploy fails on the build host with an
explanation rather than shipping a form that rejects every message silently.

After deploying, check by hand on the live URL:

- `/` redirects to `/fr/`
- the FR↔EN switch preserves the current path
- the CV downloads in both locales
- the contact form delivers a real email
- both case studies render

## Known placeholders

- **English CV.** `public/cv/nomeny-mitia-andriamaheva-en.pdf` is currently a
  byte-identical copy of the French CV. This is a deliberate placeholder so
  the download link is never broken, not a translation — the English CV is
  in French.
- **School name mismatch.** The CV PDF names the school as "École Supérieure
  de Management et Informatique Appliqué – Mahamasina", while the site's
  dictionaries (`lib/i18n/dictionaries/fr.ts`, `lib/i18n/dictionaries/en.ts`)
  say "ESMIA Innovation". The two disagree, and a visitor can open both from
  the same page (the Parcours section and the CV download).

## Constraint

No client names or client data in copy, screenshots, or commit messages.
