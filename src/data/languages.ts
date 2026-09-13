import type { Language, LanguageId } from "./types";

/**
 * Language metadata. `profile` records only broad, widely documented typological
 * characteristics. Dataset sizes come from the generated UniMorph statistics.
 */
export const languages: Language[] = [
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
    description: "A morphologically rich language with comparatively strong NLP resources, used as the agglutinative reference point.",
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
    profile: "Fusional nominal/verbal inflection · postpositions · gender and number agreement",
    description: "Widely spoken, yet under-served by annotated morphological resources; much grammatical meaning is carried by separate words.",
  },
  {
    id: "evn",
    name: "Evenki",
    iso: "evn",
    family: "Tungusic",
    script: "Cyrillic · data in Latin transcription",
    direction: "ltr",
    resourceLevel: "Low-resource",
    profile: "Agglutinative · predominantly suffixing · vowel harmony",
    description: "A Tungusic language of Siberia and northern China; the UniMorph data is corpus-derived and sparse per lemma.",
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
    description: "A polysynthetic language of the Russian Far East. UniMorph holds only a few hundred triples: the extreme low-resource case.",
  },
  {
    id: "ron",
    name: "Romanian",
    nativeName: "Română",
    iso: "ron",
    family: "Romance (Indo-European)",
    script: "Latin",
    direction: "ltr",
    resourceLevel: "Higher-resource comparison",
    profile: "Fusional · suffixing · enclitic definite article · case syncretism (NOM/ACC, GEN/DAT)",
    description: "A fusional Romance counterpoint to agglutinative Turkish and Evenki; UniMorph forms include articles and particles.",
  },
];

export const languageById = Object.fromEntries(languages.map((l) => [l.id, l])) as Record<LanguageId, Language>;
