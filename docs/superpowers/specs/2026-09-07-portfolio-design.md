# Portfolio — Nomeny Mitia Andriamaheva

**Date:** 2026-09-07
**Status:** Design approved, ready for implementation planning

---

## 1. Goal

A personal portfolio site whose primary job is to land a **remote software engineering role with a European (France-first) employer**, and whose secondary job is to attract **freelance Salesforce document-automation clients**.

Timing matters: the Solumada contract ran 09/2025–09/2026 and has just ended, and the Master II MIAGE is in progress. The site needs to be live and credible in weeks, not months.

## 2. Audience

| Reader | Time on site | What they need |
|---|---|---|
| **Recruiter** (first pass, primary) | 30–60s | Who, what stack, what shipped, is he available, how to contact |
| **Tech lead / hiring manager** (decides) | 5–15 min | Evidence of engineering judgment; depth behind the claims |
| **Freelance client** (secondary) | 2–5 min | Can he solve my document-automation problem, and will he deliver |

The homepage leads with the employer. The freelance path is a visible side door in the contact section, not a second navigation track.

## 3. The core constraint, and the strategy that follows

**There are no public repositories and no live demos.** Employer and client work is confidential; some projects have screenshots, some are describable in words only.

For EU hiring — where reviewers routinely read candidate code — this is a real gap. Three moves compensate:

1. **Case studies carry the argument.** Not "I used React" but: the problem, the constraint, the decision, the trade-off accepted, the outcome. This is what experienced reviewers screen for anyway, and it is the one form of evidence confidentiality does not block.
2. **The site is the code sample.** It is the single artifact a reviewer can open, inspect, resize, and run Lighthouse against. Its execution quality is therefore a functional requirement, not polish.
3. **Skills are attached to evidence, never listed as bare claims.** No logo wall, no percentage bars.

**Confidentiality guard-rail:** client names and client document contents from the Solumada/Thynk work must not be published without written permission. Case studies describe the *problem class* and the *solution*, with the client anonymised (e.g. "un intégrateur Salesforce européen"). Screenshots must be checked for client data before use — this includes names in test records.

## 4. Positioning

The differentiator is the pairing: **custom full-stack engineering + Salesforce document automation with real international delivery.** "Full-stack developer" is a crowded category in Europe; "developer who also automates Salesforce document generation for international clients" is nearly empty.

This is expressed in the hero copy and inside the case studies. It is *not* expressed as a fork in the navigation — a split site reads as unfocused to a recruiter filtering for a single role.

## 5. Information architecture

**Homepage** (single scroll, everything reachable without a click):

1. Sticky header — name, section nav, FR/EN switch, availability
2. Hero — positioning line, one-paragraph summary, two CTAs (view work / download CV)
3. Credibility strip — four hard facts in a ruled row
4. Selected work — four rows, each linking to a full case study
5. Skills — graded by honest depth
6. Parcours — experience and education, interleaved chronologically
7. About — short and human; the accounting-to-engineering path, and why the automation work is not accidental
8. Contact — remote roles first, freelance missions named second, timezone stated

**Case study pages** — same template throughout: Context → Constraints → Stack → Decisions & trade-offs → What went wrong → Outcome. Screenshots where available; prose where not. Two are written for launch (Soluchat, Thynk Automation); the remaining two ship as short summaries and are promoted later — see §9.

**CV** — downloadable PDF, FR and EN.

**Deliberately excluded:** blog, CMS, light/dark toggle (the site is committed to dark), testimonials (none exist yet), JP locale, interactive live demos. Each can be added later; none earn their place in v1.

## 6. Visual system — "Blueprint / Instrument"

Dark, technical, dense — but readable. The reference is a precision instrument panel or a technical drawing, not a landing page and not a retro terminal.

**Palette**

| Token | Value | Use |
|---|---|---|
| `--bg` | `#08090A` | Canvas |
| `--ink` | `#EDEFF1` | Primary text |
| `--dim` | `#8A94A0` | Body / secondary |
| `--faint` | `#5A6470` | Labels, metadata |
| `--line` | `rgba(255,255,255,.085)` | Hairlines — the primary structural device |
| `--amber` | `#E8A33D` | The single accent |

Amber is deliberate: neon violet, cyan and emerald are the defaults across dev portfolios right now. A warm accent against cold near-black reads as instrumentation and is markedly rarer. Amber is reserved for wayfinding and status — index numbers, availability, active state, links. It is never decorative.

**Typography**

- **Space Grotesk** — headings. Technical character without novelty.
- **IBM Plex Sans** — body. Drawn for an engineering company; holds up across long case studies.
- **JetBrains Mono** — labels, metadata, stack names, numbers.

Micro-labels are uppercase mono at ~9.5px with `.19em` tracking. Headings run tight (`-.035em`). Self-hosted via `next/font` — no render-blocking external request, no layout shift.

**Structure**

Hairline rules and a faint 32px background grid carry the layout. No floating cards, no glow, no border-radius above 3px. Density is a feature: a recruiter should see four projects, the stack and the timeline before scrolling twice.

## 7. Motion system

Character: **precise and mechanical** — an instrument needle settling, never a balloon floating. Fast, short, no bounce, no spring overshoot.

- **Easing** `cubic-bezier(.2,.8,.25,1)`; durations 150–350ms
- **Signature move — hairlines draw.** Section rules animate width 0→100% on entry. It reads literally as a blueprint being drawn, costs almost nothing, and is the motif that makes the site distinctive.
- **Scroll reveals** — `translateY(8px)` + opacity, 40ms stagger down list rows. Driven by `IntersectionObserver`, never scroll listeners.
- **Row hover** — amber index brightens, background lifts a few percent, arrow slides in. 150ms.
- **Status light** — the amber availability dot pulses slowly and continuously. It is a state indicator, not decoration.
- **Page transitions** — 250ms crossfade with slight scale between home and case studies.
- **Cursor reticle** (desktop only) — a small crosshair that snaps to interactive elements. The one flourish, and it fits the instrument metaphor. Disabled on touch.
- **Explicitly rejected:** counting-up number animations (they delay comprehension and are overused), parallax, scroll-jacking, entrance animations on above-the-fold content.

**`prefers-reduced-motion: reduce` is a first-class path, not a fallback.** All transforms drop to opacity-only or instant; hairlines render static; the reticle and the pulse are disabled. The European Accessibility Act has been in force since June 2025 — an animation-rich site that degrades correctly is a competence signal to exactly the employers being targeted.

All animation runs on `transform` and `opacity` only.

## 8. Technical design

- **Next.js 16** (App Router) + **TypeScript**, `output: 'export'` — fully static, deployable anywhere, nothing to keep running.
- **Tailwind v4**, with the palette and type scale defined as CSS custom properties in a single token layer. Market-standard, and the tokens stay real CSS.
- **i18n:** `/[locale]/` route segment with `generateStaticParams` for `fr` and `en`. Translations as typed dictionary modules — no runtime library, no dependency, fully static, and type errors catch a missing key at build time. `fr` is the default; `<html lang>` and `hreflang` set per locale.
- **Case studies in MDX** — one file per study per locale. Content stays reviewable as text, and adding a fifth study is a file, not a code change.
- **Contact:** real form via **Web3Forms** (free tier, no account needed for the recipient, works with a static export), with the email address visible as a fallback so a recruiter is never blocked by a broken form.
- **Analytics:** **Vercel Analytics** — cookieless and GDPR-clean, and already integrated with the host, so it adds no third-party request.
- **Hosting:** Vercel free tier, custom domain.
- **No animation library.** CSS plus a small `IntersectionObserver` hook covers the whole motion system; a bundle kept small is itself part of the code sample.

**Quality gates (functional requirements, since the site is the portfolio piece):**

- Lighthouse ≥ 95 on all four categories, mobile and desktop
- Zero `axe` violations
- Fully keyboard navigable, with visible focus states
- Correct behaviour under `prefers-reduced-motion`
- Works at 320px width

## 9. Content required from Nomeny

The build is blocked on writing, not code. In priority order:

1. **Two deep case studies for launch — Soluchat and the document-automation project.** All four projects appear as rows on the homepage, but only these two need full case-study pages to go live; the other two link to a short summary until written. Two deep studies beat four thin ones, and this keeps the launch unblocked.
2. **Zarahay Doctorants and Suivi d'équipements** promoted to full case studies after launch.
3. **Screenshots**, cleared for confidentiality and stripped of client data.
4. **English CV** (the French one exists).
5. **Both language versions** of all site copy.

## 10. Decisions open

These have working defaults and do not block planning:

1. **"4 ans d'expérience"** in the credibility strip. Counting from the 2022 discovery internship is defensible but soft, and a recruiter may challenge it. *Default: replace with "1 an en poste + 3 stages" — smaller, unchallengeable.*
2. **Domain name.** *Default: register a `.dev` on the personal name; roughly €12/year and materially better than a `vercel.app` subdomain.*
3. **Photograph.** Normal and expected in French applications, less so in pan-EU remote. *Default: include one, small, in the About block.*
4. **The fourth project.** The Java Swing inventory tool is the weakest of the four. *Default: ship it for v1, and replace it later with a personal project that has a public repository — which would also close the no-public-code gap.*

## 11. Not in scope

Blog, CMS, light theme, testimonials, Japanese locale, interactive live demos, and the game-tutorial interaction layer explored and set aside during design. The site is guided and animated, but conventionally scannable throughout — nothing is gated behind an interaction.
