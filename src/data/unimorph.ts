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
  byCue: Record<string, number>;
  examples: { lemma: string; form: string; tag: string; expected: string; cue: string }[];
};

type SampleJson = {
  generatedAt: string;
  sources: Record<LanguageId, { repo: string; file: string; branch?: string; sha?: string }>;
  languages: Record<LanguageId, { stats: { triples: number; lemmas: number; bundles: number }; featured: string[]; entries: Triple[] }>;
  comparisons: Record<LanguageId, Partial<Record<ComparisonFeature, GeneratedComparison | null>>>;
  audits?: Partial<Record<LanguageId, AuditSummary>>;
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
    summary: "Evenki paradigms annotated by Elena Klyachko from a multimedia annotated text corpus (Kazakevich & Klyachko); used in SIGMORPHON 2020 and 2021. Latin transcription.",
    upstream: "Annotated text corpus (Kazakevich & Klyachko); annotator Elena Klyachko (repository README).",
    citation: "Vylomova et al. (2020); Pimentel et al. (2021)",
  },
  ckt: {
    summary: "Chukchi paradigms from the Chukchi corpus (chuklang.ru); annotators Karina Sheifer and Maria Ryskina; used in SIGMORPHON 2021.",
    upstream: "Chukchi corpus, chuklang.ru; annotators Karina Sheifer and Maria Ryskina (repository README).",
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

const ronAudit = unimorph.audits?.ron;
const fmtN = (n: number) => n.toLocaleString("en");

/** MorphoLens observations about the data itself (shown in the UI, never silently fixed). */
export const qualityNotes: Partial<Record<LanguageId, { title: string; body: string; example?: string }[]>> = {
  ron: [
    {
      title: "Potential source-data inconsistency (Number)",
      body:
        "Several records assign Singular to forms that are plural and Plural to forms that are singular: for casă, casa and casei are tagged PL, while unor case and niște case are tagged SG. " +
        (ronAudit
          ? `A rule-based audit of the full file finds ${fmtN(ronAudit.conflicts)} of ${fmtN(ronAudit.checked)} noun and adjective records with an unambiguous article or ending cue in conflict with their Number tag. `
          : "") +
        "Records are shown as stored, conflicting rows are flagged, and plural comparisons are withheld.",
      example: "casei → source N;GEN/DAT;PL;DEF · expected GEN/DAT · SG · DEF",
    },
  ],
  ckt: [
    {
      title: "Very small sample",
      body: "241 triples over 196 lemmas; most lemmas occur only in their citation form. Experiment estimates for Chukchi have high variance.",
    },
  ],
  evn: [
    {
      title: "Sparse paradigms",
      body: "About 2.5 forms per lemma on average (corpus-derived), so random splits rarely share lemmas between train and test.",
    },
  ],
};
