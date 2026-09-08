export type ProjectSlug = 'soluchat' | 'automatisation' | 'zarahay' | 'inventaire'

export interface Dictionary {
  meta: { title: string; description: string }
  nav: { work: string; skills: string; path: string; services: string; contact: string; toggleLabel: string; skipToContent: string }
  hero: {
    availability: string
    headlineBefore: string
    headlineAccent: string
    summary: string
    ctaWork: string
    ctaCv: string
  }
  // `value` is always the amber word, `accent` the plain qualifier beside
  // it -- but which one reads first in the sentence is language-dependent
  // (an adjective like "European" precedes its noun in English but follows
  // it in French: "clients européens", never "européens clients"). Rather
  // than force every locale into English word order to keep `value` first,
  // `accentFirst` lets a fact render `accent` before the amber `value`
  // while both fields keep their fixed meaning (value = amber, accent =
  // plain). Optional and false by default, so existing entries are unaffected.
  credibility: Array<{ value: string; accent: string; accentFirst?: boolean; label: string }>
  work: {
    title: string
    note: string
    projects: Record<ProjectSlug, { name: string; description: string }>
  }
  skills: { title: string; note: string; groups: Array<{ level: string; items: string[] }> }
  parcours: {
    title: string
    note: string
    entries: Array<{ period: string; role: string; org: string; detail: string }>
  }
  about: { title: string; note: string; body: string[] }
  services: {
    title: string
    note: string
    items: Array<{ title: string; description: string }>
  }
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
