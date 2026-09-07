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
  root: { continueToSite: string }
}
