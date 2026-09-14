import sample from "./generated/unimorph-sample.json";
import type { ComparisonFeature, LanguageId } from "./types";

/**
 * UniMorph sample shipped to the browser. Regenerate with:
 *   npm run data:fetch && npm run data:build
 */
export type Triple = { lemma: string; form: string; tag: string };

export type GeneratedComparison = {
  lemma: string;
  base: { form: string; tag: string };
  target: Triple;
  variants: string[];
  strategy: string;
  position: string;
};

export type AuditSummary = {
  checked: number;
  conflicts: number;
  byField: Record<string, { checked: number; conflicts: number }>;
  byCue: Record<string, number>;
  examples: { lemma: string; form: string; tag: string; field: string; expected: string; cue: string }[];
};

export type SchemaSummary = {
  unlisted: Record<string, { count: number; status: "convention" | "anomaly" }>;
  anomalyRecords: Triple[];
};

export type VariantSummary = {
  records: number;
  share: number;
  example?: { lemma: string; tag: string; forms: string[] };
};

type SampleJson = {
  generatedAt: string;
  sources: Record<LanguageId, { repo: string; file: string; branch?: string; sha?: string }>;
  languages: Record<LanguageId, { stats: { triples: number; lemmas: number; bundles: number }; featured: string[]; entries: Triple[] }>;
  comparisons: Record<LanguageId, Partial<Record<ComparisonFeature, GeneratedComparison | null>>>;
  audits?: Partial<Record<LanguageId, AuditSummary>>;
  schema?: Partial<Record<LanguageId, SchemaSummary>>;
  variants?: Partial<Record<LanguageId, VariantSummary>>;
};

export const unimorph = sample as unknown as SampleJson;

/** Facts taken from each repository's README at the pinned commit. */
export const sourceNotes: Record<LanguageId, { summary: string; upstream: string; licence?: string; citation?: string }> = {
  tur: {
    summary: "Annotators: Omer Goldman & Duygu Ataman. Verbs semi-automatically generated and partially verified by a native speaker; nouns and adjectives from Wiktionary, unverified (per repository README).",
    upstream: "Verbs: semi-automatically generated, partly native-speaker verified. Nouns and adjectives: Wiktionary, unverified (repository README).",
    licence: "CC BY-SA 3.0",
    citation: "Pimentel et al. (2021), SIGMORPHON 2021 Shared Task",
  },
  urd: {
    summary: "No README in the repository; provenance beyond the UniMorph project is not documented there.",
    upstream: "Not documented in the repository (no README).",
  },
  evn: {
    summary:
      "The repository README lists the source as TBA, names Elena Klyachko as annotator and cites Kazakevich & Klyachko (2013) under references. Pimentel et al. (2021) state that the data were converted from a corpus of oral Evenki texts (Kazakevich & Klyachko, 2013), which uses IPA. Used in SIGMORPHON 2020 and 2021 (README).",
    upstream: "Corpus of oral Evenki texts in IPA (Kazakevich & Klyachko, 2013), per Pimentel et al. (2021). README source field: TBA.",
    citation: "Vylomova et al. (2020); Pimentel et al. (2021)",
  },
  ckt: {
    summary:
      "Corpus-derived records from transcriptions of spoken Chukchi, Amguema variant (Amguema corpus, Chuklang), annotated in CoNLL-U by Tyers & Mishchenkova (2020) and converted to UniMorph for SIGMORPHON 2021 (Pimentel et al. 2021). Annotators: Karina Sheifer, Maria Ryskina (README).",
    upstream: "Amguema corpus of spoken Chukchi (Chuklang); CoNLL-U annotation by Tyers & Mishchenkova (2020), converted to UniMorph (Pimentel et al. 2021).",
    citation: "Tyers & Mishchenkova (2020); Pimentel et al. (2021)",
  },
  ron: {
    summary: "Romanian paradigms (nouns, verbs, adjectives). Source: Wikipedia; licence CC BY-SA 3.0 (repository README).",
    upstream: "Wikipedia (repository README).",
    licence: "CC BY-SA 3.0",
  },
};

export function sourceFor(lang: LanguageId) {
  const s = unimorph.sources[lang];
  const short = s.sha ? s.sha.slice(0, 7) : "unpinned";
  return {
    label: `UniMorph ${lang} @ ${short}`,
    repo: s.repo,
    url: s.sha ? `${s.repo}/blob/${s.sha}/${s.file}` : s.repo,
    sha: s.sha,
    ...sourceNotes[lang],
  };
}

export const statsFor = (lang: LanguageId) => unimorph.languages[lang].stats;
export const auditFor = (lang: LanguageId) => unimorph.audits?.[lang];
export const schemaFor = (lang: LanguageId) => unimorph.schema?.[lang];
export const variantsFor = (lang: LanguageId) => unimorph.variants?.[lang];

const fmtN = (n: number) => n.toLocaleString("en");
const ronAudit = unimorph.audits?.ron;
const evnVariants = unimorph.variants?.evn;
const cktSchema = unimorph.schema?.ckt;
const cktAnomalies = cktSchema ? Object.entries(cktSchema.unlisted).filter(([, v]) => v.status === "anomaly") : [];

/** MorphoLens observations about the data itself (shown in the UI, never silently fixed). */
export const qualityNotes: Partial<Record<LanguageId, { title: string; body: string; example?: string }[]>> = {
  ron: [
    {
      title: "Potential source-data inconsistency (Number, adjective Gender)",
      body:
        "Several records assign Singular to plural forms and Plural to singular forms (casa and casei tagged PL; unor case and niște case tagged SG), and adjective Gender labels are also inconsistent (abandonabilă tagged NEUT). " +
        (ronAudit
          ? `A rule-based audit of the full file finds ${fmtN(ronAudit.byField.Number?.conflicts ?? 0)} of ${fmtN(ronAudit.byField.Number?.checked ?? 0)} cue-bearing noun and adjective records in conflict with their Number tag, and ${fmtN(ronAudit.byField.Gender?.conflicts ?? 0)} of ${fmtN(ronAudit.byField.Gender?.checked ?? 0)} cue-bearing adjective records in conflict with their Gender tag. `
          : "") +
        "Other dimensions have not been audited and may also contain errors. Records are shown as stored and flagged; flagged records are kept out of comparisons, and the Romanian experiment uses verbs only.",
      example: "casei → source N;GEN/DAT;PL;DEF · expected GEN/DAT · SG · DEF",
    },
  ],
  ckt: [
    {
      title: "Small, corpus-derived sample",
      body: "241 records over 196 lemmas from spoken Chukchi (Amguema variant); 168 lemmas have a single record and 128 records are citation forms. The experiment uses 234 of them (7 with non-schema tags are excluded), with test sets of 58 items per seed and at most 100 training items, so Chukchi estimates have high variance.",
    },
    ...(cktAnomalies.length
      ? [
          {
            title: "Non-schema source tags",
            body: `${cktSchema!.anomalyRecords.length} records use ${cktAnomalies.map(([a]) => a).join(", ")}, which fit no UniMorph argument-marking template (ARG + case + person/number, e.g. ARGAB3S). They are stored verbatim and flagged as likely annotation or typographical issues, never silently corrected, and excluded from the experiment.`,
          },
        ]
      : []),
  ],
  evn: [
    {
      title: "Dialectal and transcription variants",
      body: evnVariants
        ? `${evnVariants.share.toFixed(0)}% of records share their lemma and bundle with at least one other stored form, reflecting the oral IPA corpus the data was converted from${
            evnVariants.example ? ` (for example ${evnVariants.example.lemma}, ${evnVariants.example.tag}: ${evnVariants.example.forms.length} forms)` : ""
          }. Strict exact match counts such variants as errors, so the experiment also reports variant-aware accuracy.`
        : "Many cells hold several dialectal or transcription variants.",
    },
    {
      title: "Sparse paradigms",
      body: "About 2.5 forms per lemma on average (corpus-derived), so random splits rarely share lemmas between train and test.",
    },
  ],
};
