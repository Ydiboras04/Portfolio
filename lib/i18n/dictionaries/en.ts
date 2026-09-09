import type { Dictionary } from '../types'

export const en: Dictionary = {
  meta: {
    title: 'Nomeny Mitia Andriamaheva — Full-Stack Developer',
    description:
      'Full-stack developer. Custom web applications in Python, TypeScript and Rust, plus Salesforce document automation. Available remote from Antananarivo.',
  },
  nav: { work: 'Work', skills: 'Skills', path: 'Background', services: 'Services', contact: 'Contact', toggleLabel: 'Switch language', skipToContent: 'Skip to content' },
  hero: {
    availability: 'Available — full-time & contract · Remote Europe',
    headlineBefore: 'Full-stack, and ',
    headlineAccent: 'document automation',
    summary:
      'I build web applications that hold up in production — Python, TypeScript and Rust — and automate the document processes that quietly cost teams hours every week. MSc in Applied Business Computing, one year in post at a Salesforce integrator, delivering for European clients.',
    ctaWork: 'See the work',
    ctaCv: 'Download CV',
  },
  credibility: [
    { value: 'Top', accent: ' of class', label: 'BSc Computer Science — "ROHY" cohort' },
    { value: '1 year', accent: ' in post', label: 'Plus three industry internships' },
    // accentFirst: false here (explicit, matching fr.ts's use of the same key on its
    // "Clients européens" entry) -- English's "European clients" already puts the
    // amber word first, so no reordering is needed.
    { value: 'European', accent: ' clients', accentFirst: false, label: 'Document automation delivered from Antananarivo' },
    { value: '4', accent: ' languages', label: 'French · English · Japanese (N4) · Malagasy' },
  ],
  work: {
    title: 'Selected work',
    note: 'Full case study',
    projects: {
      soluchat: { name: 'Soluchat', description: 'Real-time messaging built to hold up under load.' },
      automatisation: { name: 'Document automation', description: 'Document generation without mapping errors, for European clients.' },
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
      { period: '01/26 — present', role: 'MSc year 2, Applied Business Computing', org: 'ESMIA Innovation', detail: 'Big data architectures, cybersecurity, project management, constraint programming.' },
      { period: '01/25 — 09/25', role: 'MSc year 1, Applied Business Computing', org: 'ESMIA Innovation', detail: 'Advanced web technologies, machine learning, advanced HCI, ERP.' },
      { period: '02/24 — 05/24', role: 'Web Developer — final-year placement', org: 'CIDST Tsimbazaza', detail: 'Collaboration platform for doctoral researchers in Angular and Django.' },
      { period: '07/23 — 09/23', role: 'Java Developer — internship', org: 'Groupe Tahina Ivandry', detail: 'Equipment tracking software in Java Swing.' },
      { period: '07/22 — 09/22', role: 'IT Intern', org: 'National Tourism Development', detail: 'Hardware inventory, bookkeeping entries and data processing in SAGE.' },
      { period: '03/22 — 10/24', role: 'BSc Computer Science, Risk and Decision', org: 'ESMIA Innovation', detail: 'Top of class — "ROHY" cohort.' },
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
  services: {
    title: 'Services',
    note: 'Available for freelance work',
    items: [
      {
        title: 'Custom web applications',
        description:
          'End-to-end business applications in Django or Next.js — from data modelling through to production.',
      },
      {
        title: 'Real-time applications',
        description:
          'Messaging, dashboards, notifications: interfaces that stay responsive as load grows. React and TypeScript on the client, Rust or Python on the server.',
      },
      {
        title: 'API and service integration',
        description:
          'Connecting an application to the services it depends on: REST APIs, authentication, business tools.',
      },
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
    error: 'Sending failed. Please email me directly at the address shown.',
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
  root: { continueToSite: 'Continue to the site' },
}
