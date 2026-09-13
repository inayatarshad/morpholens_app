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

type SampleJson = {
  generatedAt: string;
  sources: Record<LanguageId, { repo: string; file: string; branch?: string; sha?: string }>;
  languages: Record<LanguageId, { stats: { triples: number; lemmas: number; bundles: number }; featured: string[]; entries: Triple[] }>;
  comparisons: Record<LanguageId, Partial<Record<ComparisonFeature, GeneratedComparison | null>>>;
};

export const unimorph = sample as unknown as SampleJson;

/** Facts taken from each repository's README at the pinned commit. */
export const sourceNotes: Record<LanguageId, { summary: string; licence?: string; citation?: string }> = {
  tur: {
    summary: "Annotators: Omer Goldman & Duygu Ataman. Verbs semi-automatically generated and partially verified by a native speaker; nouns and adjectives from Wiktionary, unverified (per repository README).",
    licence: "CC BY-SA 3.0",
    citation: "Pimentel et al. (2021), SIGMORPHON 2021 Shared Task",
  },
  urd: { summary: "No README in the repository; provenance beyond the UniMorph project is not documented there." },
  evn: {
    summary: "Evenki paradigms annotated by Elena Klyachko from a multimedia annotated text corpus (Kazakevich & Klyachko); used in SIGMORPHON 2020 and 2021. Latin transcription.",
    citation: "Vylomova et al. (2020); Pimentel et al. (2021)",
  },
  ckt: {
    summary: "Chukchi paradigms from the Chukchi corpus (chuklang.ru); annotators Karina Sheifer and Maria Ryskina; used in SIGMORPHON 2021.",
    citation: "Tyers & Mishchenkova (2020); Pimentel et al. (2021)",
  },
  ron: { summary: "Romanian paradigms (nouns, verbs, adjectives). The repository README gives no further provenance." },
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

/** MorphoLens observations about the data itself (shown in the UI, never silently fixed). */
export const qualityNotes: Partial<Record<LanguageId, { title: string; body: string; example?: string }[]>> = {
  ron: [
    {
      title: "Noun number appears conflated with definiteness",
      body: "For casă ‘house’, the plural forms ‘unor case’ and ‘niște case’ are tagged SG;INDF, while the singular ‘casa’ is tagged PL;DEF. No noun bundle combines PL with INDF. Plural comparisons are therefore withheld for Romanian.",
      example: "casă → unor case  (N;GEN/DAT;SG;INDF)",
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
