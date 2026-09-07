import type { Locale } from './config'
import type { Dictionary } from './types'
import { fr } from './dictionaries/fr'
import { en } from './dictionaries/en'

const dictionaries: Record<Locale, Dictionary> = { fr, en }

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale]
}

export type { Dictionary, Locale }
