import type { Language, LanguageId } from "./types";

/**
 * Language metadata. `profile` records only broad, widely documented typological
 * characteristics. Speaker numbers and community claims are deliberately omitted.
 */
export const languages: Language[] = [
  {
    id: "evn",
    name: "Evenki",
    iso: "evn",
    family: "Tungusic",
    script: "Cyrillic",
    direction: "ltr",
    resourceLevel: "Low-resource",
    profile: "Agglutinative · predominantly suffixing · vowel harmony",
    description:
      "A Tungusic language of Siberia and northern China with rich suffixal morphology and very limited annotated NLP data.",
    coverageNote:
      "One illustrative candidate entry, marked unverified. Awaiting entries checked against an Evenki dictionary or UniMorph data.",
  },
  {
    id: "ckt",
    name: "Chukchi",
    iso: "ckt",
    family: "Chukotko-Kamchatkan",
    script: "Cyrillic",
    direction: "ltr",
    resourceLevel: "Low-resource",
    profile: "Polysynthetic · noun incorporation · prefixes, suffixes and circumfixes · vowel harmony",
    description:
      "A Chukotko-Kamchatkan language of the Russian Far East, frequently cited for its polysynthetic structure and incorporation.",
    coverageNote:
      "No forms in the local dataset yet. The interface shows the schema slots awaiting linguistically verified entries.",
  },
  {
    id: "tur",
    name: "Turkish",
    nativeName: "Türkçe",
    iso: "tur",
    family: "Turkic",
    script: "Latin",
    direction: "ltr",
    resourceLevel: "Higher-resource comparison",
    profile: "Agglutinative · suffixing · vowel harmony and consonant alternation",
    description:
      "A morphologically rich language with comparatively strong NLP resources, used here as a well-documented point of comparison.",
    coverageNote:
      "Textbook nominal and verbal paradigms (ev, kitap, gel, git). Not yet cross-checked against a UniMorph release.",
  },
  {
    id: "urd",
    name: "Urdu",
    nativeName: "اردو",
    iso: "urd",
    family: "Indo-Aryan",
    script: "Perso-Arabic (Nastaliq)",
    direction: "rtl",
    resourceLevel: "Low-resource NLP",
    profile: "Fusional nominal/verbal inflection · postpositions · gender–number agreement",
    description:
      "Widely spoken, yet under-served by annotated morphological and span-level resources; Roman-script spelling variation adds noise.",
    coverageNote:
      "Textbook noun and perfective paradigms plus one unverified code-switching example. Romanisation follows a simplified scheme.",
  },
];

export const languageById = Object.fromEntries(languages.map((l) => [l.id, l])) as Record<
  LanguageId,
  Language
>;
