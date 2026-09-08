import type { Dictionary } from '../types'

export const fr: Dictionary = {
  meta: {
    title: 'Nomeny Mitia Andriamaheva — Développeur Full-Stack',
    description:
      "Développeur full-stack. Applications web sur mesure en Python, TypeScript et Rust, et automatisation documentaire Salesforce. Disponible en remote depuis Antananarivo.",
  },
  nav: { work: 'Travaux', skills: 'Compétences', path: 'Parcours', contact: 'Contact', toggleLabel: 'Changer de langue', skipToContent: 'Aller au contenu' },
  hero: {
    availability: 'Disponible — CDI & missions · Remote Europe',
    headlineBefore: 'Full-stack, et ',
    headlineAccent: 'automatisation documentaire',
    summary:
      "Je construis des applications web robustes en Python, TypeScript et Rust — et j'automatise les processus documentaires qui font perdre des heures aux équipes. Master II MIAGE, un an en poste chez un intégrateur Salesforce, pour des clients européens.",
    ctaWork: 'Voir les travaux',
    ctaCv: 'Télécharger le CV',
  },
  credibility: [
    { value: 'Major', accent: ' de promo', label: 'Licence Informatique — Promotion « ROHY »' },
    { value: '1 an', accent: ' en poste', label: 'Et trois stages en entreprise' },
    { value: 'Clients', accent: ' européens', label: 'Automatisation documentaire livrée depuis Antananarivo' },
    { value: '4', accent: ' langues', label: 'Français · Anglais · Japonais (N4) · Malgache' },
  ],
  work: {
    title: 'Travaux sélectionnés',
    note: 'Étude de cas complète',
    viewCase: "Lire l'étude de cas",
    projects: {
      soluchat: { name: 'Soluchat', description: 'Messagerie temps réel conçue pour tenir la charge.' },
      automatisation: { name: 'Automatisation documentaire', description: 'Génération de documents sans erreur de mapping, pour des clients européens.' },
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
      { period: '01/26 — présent', role: 'Master II MIAGE', org: 'ESMIA Innovation', detail: 'Architectures Big Data, cybersécurité, gestion de projet, programmation sous contraintes.' },
      { period: '01/25 — 09/25', role: 'Master I MIAGE', org: 'ESMIA Innovation', detail: 'Technologies web avancées, machine learning, IHM avancée, PGI.' },
      { period: '02/24 — 05/24', role: 'Développeur Web — Stage de fin d’études', org: 'CIDST Tsimbazaza', detail: 'Application de collaboration pour doctorants en Angular et Django.' },
      { period: '07/23 — 09/23', role: 'Développeur Java — Stage', org: 'Groupe Tahina Ivandry', detail: "Logiciel de suivi d'équipements en Java Swing." },
      { period: '03/22 — 10/24', role: 'Licence Informatique, Risque et Décision', org: 'ESMIA Innovation', detail: 'Major de promotion — Promotion « ROHY ».' },
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
    error: "L'envoi a échoué. Écrivez-moi directement à l'adresse indiquée.",
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
  root: { continueToSite: 'Continuer vers le site' },
}
