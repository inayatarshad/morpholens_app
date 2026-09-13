import raw from "./generated/experiment-results.json";
import { languages } from "./languages";
import type { ExperimentSplit, LanguageId, SystemId } from "./types";

/**
 * MEASURED RESULTS
 * ----------------
 * Produced by scripts/run-experiment.mjs on pinned UniMorph data (5 seeds).
 * Regenerate with: npm run data:fetch && npm run experiment
 */

export type SystemSummary = {
  mean: number;
  std: number;
  runs: number[];
  /** mean Levenshtein distance to the gold form */
  lev: number;
  seenBundle: number | null;
  unseenBundle: number | null;
  seenLemma: number | null;
  unseenLemma: number | null;
  /** % of errors where the system output the lemma unchanged (no applicable rule) */
  copyShare: number;
  pos: Record<string, number | null>;
};
export type Test = { diff: number; lo: number; hi: number; p: number };
export type TestKey = "morph-baseline" | "memory-baseline" | "morph-memory";
export type Cell = {
  overlap: number;
  unseenBundle: number;
  items: number;
  posCounts: Record<string, number>;
  systems: Record<SystemId, SystemSummary>;
  tests: Record<TestKey, Test>;
};
export type PredictionExample = {
  lemma: string;
  tag: string;
  gold: string;
  baseline: string;
  memory: string;
  morph: string;
  kind: "morph-only" | "baseline-only" | "memory-only" | "all-wrong" | "all-right";
  lemmaSeen: boolean;
  bundleSeen: boolean;
};
type ResultsJson = {
  generatedAt: string;
  runtimeSeconds: number;
  node: string;
  config: { seeds: number[]; sizes: number[]; cellsPerLemma: number; universeTarget: number; testMax: number; testFraction: number; bootstrap: number };
  sources: Record<LanguageId, { repo: string; branch?: string; sha?: string }>;
  stats: Record<LanguageId, { triples: number; lemmas: number; bundles: number; testSize: number }>;
  results: Record<LanguageId, Record<ExperimentSplit, Record<string, Cell>>>;
  examples: Record<LanguageId, Partial<Record<ExperimentSplit, { n: number; items: PredictionExample[] }>>>;
};

export const experiment = raw as unknown as ResultsJson;

export const systems: Record<SystemId, { name: string; detail: string; color: string }> = {
  baseline: { name: "Atomic-tag rules", detail: "Baseline · feature bundle treated as one opaque label", color: "#d2b792" },
  memory: { name: "Paradigm memory", detail: "Surface · reuses seen forms of the same lemma", color: "#5b1a20" },
  morph: { name: "Feature-aware rules", detail: "Morphology-aware · decomposes bundles into features", color: "#102e28" },
};
export const systemOrder: SystemId[] = ["baseline", "memory", "morph"];

export const task = {
  name: "Morphological inflection",
  description: "Given a lemma and a UniMorph feature bundle, predict the inflected form.",
  metric: "Exact-match accuracy (%) · mean ± s.d. over 5 seeds",
};

export function sizesFor(lang: LanguageId): number[] {
  const r = experiment.results[lang];
  return Object.keys(r.random)
    .filter((n) => n in r["lemma-disjoint"])
    .map(Number)
    .sort((a, b) => a - b);
}

export function getCell(lang: LanguageId, split: ExperimentSplit, n: number): Cell | undefined {
  return experiment.results[lang][split][String(n)];
}

/** Largest training size ≤ 500 available for a language (the size used for headline claims). */
export function headlineSize(lang: LanguageId): number {
  const s = sizesFor(lang);
  return s.filter((x) => x <= 500).pop() ?? s[0];
}

export const signed = (n: number) => `${n > 0.05 ? "+" : n < -0.05 ? "−" : "±"}${Math.abs(n).toFixed(1)}`;
export const fmtP = (p: number) => (p < 0.001 ? "p < 0.001" : `p = ${p.toFixed(3)}`);
export const fmtCI = (t: Test) => `95% CI ${signed(t.lo)} to ${signed(t.hi)}`;
/** Significant at α = 0.05 with a bootstrap CI that excludes zero. */
export const significant = (t: Test) => t.p < 0.05 && (t.lo > 0 || t.hi < 0);

/** Plain-language findings generated from the results file, so the text cannot drift from the data. */
export function findingSentences(): string[] {
  const out: string[] = [];
  const rows = languages.map((l) => {
    const n = headlineSize(l.id);
    return { l, n, ld: getCell(l.id, "lemma-disjoint", n)!, r: getCell(l.id, "random", n)! };
  });

  const gain = rows.filter((x) => significant(x.ld.tests["morph-baseline"]) && x.ld.tests["morph-baseline"].diff > 0);
  const loss = rows.filter((x) => significant(x.ld.tests["morph-baseline"]) && x.ld.tests["morph-baseline"].diff < 0);
  const ns = rows.filter((x) => !significant(x.ld.tests["morph-baseline"]));
  for (const x of gain) {
    const t = x.ld.tests["morph-baseline"];
    out.push(`${x.l.name} (n = ${x.n}, lemma-disjoint): feature-aware rules are ${signed(t.diff)} points above the atomic-tag baseline (${fmtCI(t)}, ${fmtP(t.p)}).`);
  }
  for (const x of loss) {
    const t = x.ld.tests["morph-baseline"];
    out.push(`${x.l.name} (n = ${x.n}, lemma-disjoint): feature-aware rules are ${signed(t.diff)} points below the baseline (${fmtCI(t)}, ${fmtP(t.p)}).`);
  }
  if (ns.length) {
    out.push(`No significant feature-aware difference on the lemma-disjoint split for ${ns.map((x) => `${x.l.name} (${signed(x.ld.tests["morph-baseline"].diff)}, ${fmtCI(x.ld.tests["morph-baseline"])})`).join("; ")}.`);
  }

  const mem = rows.filter((x) => significant(x.r.tests["memory-baseline"]) && x.r.tests["memory-baseline"].diff > 0);
  if (mem.length) {
    out.push(
      `Paradigm memory beats the baseline on the random split for ${mem
        .map((x) => `${x.l.name} (${signed(x.r.tests["memory-baseline"].diff)}, ${x.r.overlap.toFixed(0)}% of test lemmas seen in training)`)
        .join(" and ")}; on the lemma-disjoint split it equals the baseline by construction.`,
    );
  }
  const memNs = rows.filter((x) => !significant(x.r.tests["memory-baseline"]));
  if (memNs.length) out.push(`It shows no significant random-split gain for ${memNs.map((x) => `${x.l.name} (${x.r.overlap.toFixed(0)}% overlap)`).join(", ")}.`);
  return out;
}
