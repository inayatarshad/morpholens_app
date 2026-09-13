/**
 * MorphoLens data model.
 *
 * Two kinds of linguistic records feed the UI:
 *  1. UniMorph triples (lemma, form, feature bundle) — generated into
 *     src/data/generated/unimorph-sample.json by scripts/build-data.mjs, pinned to a
 *     repository commit.
 *  2. A handful of hand-annotated entries with gold morpheme segmentation
 *     (src/data/morphology.ts), each labelled by whether UniMorph attests it.
 */

export type LanguageId = "tur" | "urd" | "evn" | "ckt" | "ron";

export type Language = {
  id: LanguageId;
  name: string;
  nativeName?: string;
  /** ISO 639-3 code */
  iso: string;
  family: string;
  script: string;
  direction: "ltr" | "rtl";
  resourceLevel: string;
  /** Broad, widely documented typological profile — not a claim about any specific form. */
  profile: string;
  description: string;
};

export type MorphemeRole = "stem" | "suffix" | "prefix" | "clitic" | "particle" | "word";

export type Morpheme = {
  form: string;
  /** Leipzig-style gloss label, e.g. PL, ABL, 1PL.POSS */
  gloss: string;
  /** Plain-language meaning shown in the interpretation table */
  meaning: string;
  role: MorphemeRole;
};

export type ParadigmEntry = {
  surface: string;
  romanization?: string;
  features: Record<string, string>;
  /** Raw UniMorph bundle, when the row comes from UniMorph. */
  tag?: string;
  segmentation?: string[];
};

export type DifficultyTag =
  | "UNSEEN_LEMMA"
  | "ALLOMORPHY"
  | "RARE_FEATURE"
  | "ORTHOGRAPHIC_VARIATION"
  | "LONG_MORPHEME_CHAIN"
  | "CODE_SWITCHING"
  | "SYNCRETISM"
  | "PERIPHRASIS"
  | "STEM_CHANGE";

/**
 * unimorph   → the exact (lemma, form, bundle) triple occurs in the pinned UniMorph file.
 * reference  → follows a textbook-attested pattern cited in `source`; NOT in UniMorph.
 */
export type Attestation = "unimorph" | "reference";

export type MorphologicalEntry = {
  id: string;
  languageId: LanguageId;
  surface: string;
  romanization?: string;
  /** Alternative spellings accepted by the explorer (e.g. Roman Urdu variants). */
  aliases?: string[];
  lemma: string;
  lemmaRomanization?: string;
  pos: string;
  segmentation: string[];
  morphemes: Morpheme[];
  features: Record<string, string>;
  /** UniMorph bundle(s) under which UniMorph attests this form, if any. */
  unimorph?: string;
  gloss?: string;
  translation?: string;
  paradigm?: ParadigmEntry[];
  difficulty?: DifficultyTag[];
  difficultyNotes?: Partial<Record<DifficultyTag, string>>;
  source: string;
  sourceUrl?: string;
  attestation: Attestation;
  note?: string;
};

export type ComparisonFeature = "plural" | "case" | "possession" | "past" | "negation";

/** Hand-curated comparison slot, used only where UniMorph has no example. */
export type CuratedComparison = {
  languageId: LanguageId;
  feature: ComparisonFeature;
  entryId: string;
  base: string;
  baseRomanization?: string;
  strategy: string;
  position: string;
  note?: string;
};

export type ExperimentSplit = "random" | "lemma-disjoint";
export type SystemId = "baseline" | "memory" | "morph";
