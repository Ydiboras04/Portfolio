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
