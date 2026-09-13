/**
 * MorphoLens data model.
 *
 * Every linguistic example lives in /src/data as plain TypeScript objects so it can be
 * swapped for UniMorph exports, digitised lexicons, custom Urdu datasets or model
 * predictions without touching UI code. See README → "Architecture".
 */

export type LanguageId = "evn" | "ckt" | "tur" | "urd";

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
  /** Honest statement of what the local dataset currently covers. */
  coverageNote: string;
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
  segmentation?: string[];
};

export type DifficultyTag =
  | "UNSEEN_LEMMA"
  | "ALLOMORPHY"
  | "RARE_FEATURE"
  | "ORTHOGRAPHIC_VARIATION"
  | "LONG_MORPHEME_CHAIN"
  | "CODE_SWITCHING";

/**
 * verified: true  → the form follows a textbook-attested pattern cited in `source`.
 *                   It has NOT yet been cross-checked against a UniMorph release or by
 *                   a field linguist; `verificationNote` says so explicitly.
 * verified: false → illustrative demo example. The UI labels it "UNVERIFIED / DEMO".
 */
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
  /** UniMorph-style feature bundle (schema mapping, not copied from a release). */
  unimorph?: string;
  gloss?: string;
  translation?: string;
  paradigm?: ParadigmEntry[];
  difficulty?: DifficultyTag[];
  difficultyNotes?: Partial<Record<DifficultyTag, string>>;
  source?: string;
  sourceUrl?: string;
  /** Resource the entry should be cross-checked against. */
  crossCheck?: { label: string; url: string };
  dataset: string;
  verified: boolean;
  verificationNote?: string;
};

export type ComparisonFeature = "plural" | "case" | "possession" | "past" | "negation";

export type ComparisonExample = {
  languageId: LanguageId;
  feature: ComparisonFeature;
  /** Entry the example is drawn from — provenance is inherited from it. */
  entryId: string;
  base: string;
  baseRomanization?: string;
  strategy: string;
  position: string;
  note?: string;
};

export type ExperimentSplit = "random" | "lemma-disjoint";
export type TrainingSize = 50 | 100 | 250 | 500;
export type ModelId = "baseline" | "morph";
