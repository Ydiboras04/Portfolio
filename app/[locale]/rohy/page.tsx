import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { locales, isLocale, type Locale } from '@/lib/i18n/config'
import { getDictionary } from '@/lib/i18n'

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }))
}

type Section = { heading: string; paras?: string[]; bullets?: string[] }
type Source = { label: string; url: string }
type Photo = { src: string; alt: string; caption: string }
type PageContent = {
  tag: string
  title: string
  lead: string
  meta: string
  photos: Photo[]
  sections: Section[]
  sourcesHeading: string
  sources: Source[]
  accessed: string
}

// The verified facts below come from BASAN's own announcement of the
// ESMIA × BASAN partnership (linked under "Sources"), cross-checked against
// Malagasy press coverage. The ranking first in the promotion is a personal
// distinction the public article does not itself name; it is stated here as
// the site owner's own record, kept visibly separate from the sourced facts.
const CONTENT: Record<Locale, PageContent> = {
  en: {
    tag: 'Distinction',
    title: 'Top of the ROHY promotion',
    lead:
      'Nomeny Mitia Andriamaheva graduated top of class — major de promotion — of the “ROHY” promotion of the BSc in Computer Science, Risk and Decision at ESMIA Innovation in Antananarivo: the cohort marked by ESMIA’s landmark partnership with Groupe BASAN.',
    meta: 'ESMIA Innovation · Promotion ROHY · Antananarivo, Madagascar',
    photos: [
      {
        src: '/screenshots/sortie_3.png',
        alt: 'A packed auditorium of graduates in caps and gowns at the ROHY graduation ceremony',
        caption: 'The ROHY promotion gathered for the ceremony — part of the 270-graduate cohort.',
      },
      {
        src: '/screenshots/sortie_2.png',
        alt: 'Top students of the ROHY promotion on stage receiving their certificates, beside a "Major de promotion" banner',
        caption: 'Top students of the promotion receiving their certificates — the “Major de promotion” distinction among them.',
      },
      {
        src: '/screenshots/sortie_1.png',
        alt: 'Guests of honour standing on stage during the ROHY graduation ceremony',
        caption: 'On stage during the ceremony, held under the patronage of BASAN.',
      },
    ],
    sections: [
      {
        heading: 'The ROHY promotion',
        paras: [
          'In April 2025, ESMIA Innovation’s “ROHY” promotion graduated officially, with 270 graduates across the cohort.',
          'The graduation ceremony was placed under the patronage of Frédéric Andriamaharo, Secretary General of BASAN — a signal of how much strategic weight the two institutions attached to their collaboration.',
        ],
      },
      {
        heading: 'The ESMIA × BASAN partnership',
        paras: [
          'In December 2024, ESMIA Innovation and Groupe BASAN signed a partnership agreement laying the foundations for a lasting collaboration between a school and an industrial group. It was built around three commitments:',
        ],
        bullets: [
          'Educational innovation — keeping the curriculum aligned with the real needs of industry.',
          'Internships — opening genuine placements inside BASAN’s operations.',
          'An expanded professional network — connecting graduates to the industrial, agricultural and distribution sectors BASAN works in.',
        ],
      },
      {
        heading: 'Why it matters',
        paras: [
          'The stated aim of the partnership is to strengthen graduates’ employability by bringing the academic and professional worlds closer together — training that leads somewhere, rather than ending at the diploma.',
          'In the French academic tradition ESMIA follows, the major de promotion is the student ranked first across the whole degree, not a single exam. For the ROHY promotion, that standing is mine.',
        ],
      },
    ],
    sourcesHeading: 'Sources',
    sources: [
      {
        label: 'BASAN — “ESMIA and BASAN: an exceptional partnership for the industry of tomorrow” (English)',
        url: 'https://www.basan.mg/en/esmia-and-basan-an-exceptional-partnership-for-the-industry-of-tomorrow/',
      },
      {
        label: 'BASAN — « ESMIA et BASAN : un partenariat d’exception pour l’industrie de demain » (French)',
        url: 'https://www.basan.mg/esmia-et-basan-un-partenariat-dexception-pour-lindustrie-de-demain/',
      },
    ],
    accessed: 'Sources consulted October 2026.',
  },
  fr: {
    tag: 'Distinction',
    title: 'Major de la promotion ROHY',
    lead:
      'Nomeny Mitia Andriamaheva est sorti major de promotion de la promotion « ROHY » de la Licence Informatique, Risque et Décision à ESMIA Innovation, à Antananarivo : la promotion marquée par le partenariat d’exception entre ESMIA et le Groupe BASAN.',
    meta: 'ESMIA Innovation · Promotion ROHY · Antananarivo, Madagascar',
    photos: [
      {
        src: '/screenshots/sortie_3.png',
        alt: 'Un amphithéâtre comble de diplômés en toge et toque lors de la cérémonie de remise des diplômes de la promotion ROHY',
        caption: 'La promotion ROHY réunie pour la cérémonie — une partie des 270 lauréats.',
      },
      {
        src: '/screenshots/sortie_2.png',
        alt: 'Les majors de la promotion ROHY sur scène recevant leurs attestations, près d’une bannière « Major de promotion »',
        caption: 'Les majors de la promotion recevant leurs attestations — dont la distinction « Major de promotion ».',
      },
      {
        src: '/screenshots/sortie_1.png',
        alt: 'Les invités d’honneur sur scène lors de la cérémonie de remise des diplômes de la promotion ROHY',
        caption: 'Sur scène pendant la cérémonie, placée sous le patronage de BASAN.',
      },
    ],
    sections: [
      {
        heading: 'La promotion ROHY',
        paras: [
          'En avril 2025, la promotion « ROHY » d’ESMIA Innovation a été officiellement diplômée, avec 270 lauréats.',
          'La cérémonie de remise des diplômes a été placée sous le patronage de Frédéric Andriamaharo, Secrétaire Général de BASAN — un signe du poids stratégique que les deux institutions accordaient à leur collaboration.',
        ],
      },
      {
        heading: 'Le partenariat ESMIA × BASAN',
        paras: [
          'En décembre 2024, ESMIA Innovation et le Groupe BASAN ont signé un accord de partenariat posant les bases d’une collaboration durable entre une école et un groupe industriel. Il s’articule autour de trois engagements :',
        ],
        bullets: [
          'L’innovation pédagogique — garder le cursus aligné sur les besoins réels de l’industrie.',
          'Les stages — ouvrir de véritables immersions au sein des activités de BASAN.',
          'Un réseau professionnel élargi — relier les diplômés aux secteurs de l’industrie, de l’agriculture et de la distribution où opère BASAN.',
        ],
      },
      {
        heading: 'Ce que cela signifie',
        paras: [
          'L’objectif affiché du partenariat est de renforcer l’employabilité des diplômés en rapprochant le monde académique du monde professionnel — une formation qui débouche, plutôt qu’une formation qui s’arrête au diplôme.',
          'Dans la tradition académique française que suit ESMIA, le major de promotion est l’étudiant classé premier sur l’ensemble du cursus, et non sur un seul examen. Pour la promotion ROHY, ce rang est le mien.',
        ],
      },
    ],
    sourcesHeading: 'Sources',
    sources: [
      {
        label: 'BASAN — « ESMIA et BASAN : un partenariat d’exception pour l’industrie de demain » (français)',
        url: 'https://www.basan.mg/esmia-et-basan-un-partenariat-dexception-pour-lindustrie-de-demain/',
      },
      {
        label: 'BASAN — “ESMIA and BASAN: an exceptional partnership for the industry of tomorrow” (anglais)',
        url: 'https://www.basan.mg/en/esmia-and-basan-an-exceptional-partnership-for-the-industry-of-tomorrow/',
      },
    ],
    accessed: 'Sources consultées en octobre 2026.',
  },
}

export async function generateMetadata(
  { params }: { params: Promise<{ locale: string }> },
): Promise<Metadata> {
  const { locale } = await params
  if (!isLocale(locale)) return {}
  const c = CONTENT[locale]
  return {
    title: `${c.title} — Nomeny Mitia Andriamaheva`,
    description: c.lead,
    alternates: {
      canonical: `/${locale}/rohy/`,
      languages: Object.fromEntries(locales.map((l) => [l, `/${l}/rohy/`])),
    },
    // Same reason the case study page sets this explicitly: without its own
    // openGraph, Next's mergeMetadata would fill the gap with the layout's
    // homepage card, so this page's link preview would show the homepage.
    openGraph: {
      title: `${c.title} — Nomeny Mitia Andriamaheva`,
      description: c.lead,
      type: 'article',
      locale: locale === 'fr' ? 'fr_FR' : 'en_GB',
    },
  }
}

export default async function RohyPage(
  { params }: { params: Promise<{ locale: string }> },
) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()

  const dict = getDictionary(locale)
  const c = CONTENT[locale]

  return (
    <article className="mx-auto max-w-3xl px-5 py-12 sm:px-12">
      <Link href={`/${locale}/#parcours`} className="label mb-8 inline-block hover:text-ink">
        ← {dict.caseStudy.back}
      </Link>

      <header className="mb-10 border-b border-line pb-8">
        <p className="label mb-3">{c.tag}</p>
        <h1 className="mb-4 font-display text-[clamp(1.75rem,5vw,2.25rem)] font-semibold leading-[1.1] tracking-[-0.035em]">
          {c.title}
        </h1>
        <p className="mb-5 text-[14.5px] leading-[1.7] text-dim">{c.lead}</p>
        <p className="font-mono text-[10px] text-faint">{c.meta}</p>
      </header>

      {/* Photo gallery: the first image leads full-width, the rest sit in a grid
          below. Plain <img> because the site exports statically with images
          unoptimized, so next/image would add no value here. */}
      <div className="mb-4 grid gap-4 sm:grid-cols-2">
        {c.photos.map((photo, i) => (
          <figure
            key={photo.src}
            className={`overflow-hidden rounded-[6px] border border-line bg-bg/40 ${i === 0 ? 'sm:col-span-2' : ''}`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element -- static export, images unoptimized. */}
            <img src={photo.src} alt={photo.alt} className="block h-auto w-full" loading="lazy" />
            <figcaption className="border-t border-line px-4 py-2.5 text-[11.5px] leading-[1.5] text-faint">
              {photo.caption}
            </figcaption>
          </figure>
        ))}
      </div>

      {c.sections.map((section) => (
        <section key={section.heading}>
          <h2 className="mb-3 mt-10 font-display text-[19px] font-semibold tracking-[-0.02em]">{section.heading}</h2>
          {section.paras?.map((p, i) => (
            <p key={i} className="mb-4 text-[14px] leading-[1.75] text-dim">{p}</p>
          ))}
          {section.bullets && (
            <ul className="mb-4 list-disc space-y-2 pl-5 text-[14px] leading-[1.7] text-dim">
              {section.bullets.map((b, i) => (
                <li key={i}>{b}</li>
              ))}
            </ul>
          )}
        </section>
      ))}

      <footer className="mt-12 border-t border-line pt-6">
        <h2 className="label mb-3">{c.sourcesHeading}</h2>
        <ul className="space-y-2">
          {c.sources.map((s) => (
            <li key={s.url} className="text-[13px] leading-[1.6]">
              <a
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-dim underline decoration-line underline-offset-2 transition-colors duration-150 ease-instrument hover:text-amber hover:decoration-amber/50"
              >
                {s.label}
              </a>
            </li>
          ))}
        </ul>
        <p className="mt-4 font-mono text-[10px] text-faint">{c.accessed}</p>
      </footer>
    </article>
  )
}
