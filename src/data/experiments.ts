import raw from "./generated/experiment-results.json";
import { languages } from "./languages";
import type { ExperimentSplit, SystemId } from "./types";

/**
 * MEASURED RESULTS
 * ----------------
 * Produced by scripts/run-experiment.mjs on pinned UniMorph data (5 seeds).
 * Regenerate with: npm run data:fetch && npm run experiment
 *
 * Dataset ids are the language ids, except that "ron" is Romanian verbs only and
 * "ron-all" is Romanian on all records (raw), reported separately.
 */

export type Metric = "strict" | "variant";
export type Summary = { mean: number; std: number; runs: number[] };
export type SystemSummary = Summary & {
  /** variant-aware exact match: any form stored for the same (lemma, bundle) counts */
  variant: Summary;
  /** mean Levenshtein distance to the stored form */
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
  /** % of test items whose cell holds more than one stored form */
  multiRef: number;
  items: number;
  posCounts: Record<string, number>;
  systems: Record<SystemId, SystemSummary>;
  tests: Record<TestKey, Test>;
  testsVariant: Record<TestKey, Test>;
};
export type PredictionExample = {
  lemma: string;
  tag: string;
  gold: string;
  /** other forms stored for the same lemma and bundle */
  alt: string[];
  baseline: string;
  memory: string;
  morph: string;
  kind: "morph-only" | "baseline-only" | "memory-only" | "all-wrong" | "all-right";
  lemmaSeen: boolean;
  bundleSeen: boolean;
};
type DatasetStats = { source: string; note?: string; triples: number; rawTriples: number; excludedAnomalies: number; lemmas: number; bundles: number; testSize: number };
type ResultsJson = {
  generatedAt: string;
  runtimeSeconds: number;
  node: string;
  config: { seeds: number[]; sizes: number[]; cellsPerLemma: number; universeTarget: number; testMax: number; testFraction: number; bootstrap: number };
  datasets: { id: string; source: string; note: string | null }[];
  sources: Record<string, { repo: string; branch?: string; sha?: string }>;
  stats: Record<string, DatasetStats>;
  results: Record<string, Record<ExperimentSplit, Record<string, Cell>>>;
  examples: Record<string, Partial<Record<ExperimentSplit, { n: number; items: PredictionExample[] }>>>;
};

export const experiment = raw as unknown as ResultsJson;

export const systems: Record<SystemId, { name: string; detail: string; color: string }> = {
  baseline: { name: "Atomic-tag rules", detail: "Baseline · feature bundle treated as one opaque label", color: "#d2b792" },
  memory: { name: "Paradigm memory", detail: "Surface · reuses seen forms of the same lemma", color: "#5b1a20" },
  morph: { name: "Feature-aware rules", detail: "Morphology-aware · decomposes bundles into features", color: "#102e28" },
};
export const systemOrder: SystemId[] = ["baseline", "memory", "morph"];

export const metricLabel: Record<Metric, string> = {
  strict: "Strict exact match",
  variant: "Variant-aware exact match",
};

export const task = {
  name: "Morphological inflection",
  description: "Given a lemma and a UniMorph feature bundle, predict the inflected form.",
};

/** Main datasets (one per language) and the separately reported raw Romanian run. */
export const mainDatasets = languages.map((l) => l.id as string);
export const RAW_RON = "ron-all";

export function datasetLabel(id: string): string {
  if (id === RAW_RON) return "Romanian, all records (raw)";
  if (id === "ron") return "Romanian (verbs)";
  return languages.find((l) => l.id === id)?.name ?? id;
}

export function sizesFor(id: string): number[] {
  const r = experiment.results[id];
  if (!r) return [];
  return Object.keys(r.random)
    .filter((n) => n in r["lemma-disjoint"])
    .map(Number)
    .sort((a, b) => a - b);
}

export function getCell(id: string, split: ExperimentSplit, n: number): Cell | undefined {
  return experiment.results[id]?.[split][String(n)];
}

export const summaryOf = (cell: Cell, s: SystemId, metric: Metric): Summary => (metric === "variant" ? cell.systems[s].variant : cell.systems[s]);
export const testOf = (cell: Cell, key: TestKey, metric: Metric): Test => (metric === "variant" ? cell.testsVariant[key] : cell.tests[key]);

/** Largest training size ≤ 500 available for a dataset (the size used for headline claims). */
export function headlineSize(id: string): number {
  const s = sizesFor(id);
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
  const rows = mainDatasets.map((id) => {
    const n = headlineSize(id);
    return { id, name: datasetLabel(id), n, ld: getCell(id, "lemma-disjoint", n)!, r: getCell(id, "random", n)! };
  });

  const gain = rows.filter((x) => significant(x.ld.tests["morph-baseline"]) && x.ld.tests["morph-baseline"].diff > 0);
  const loss = rows.filter((x) => significant(x.ld.tests["morph-baseline"]) && x.ld.tests["morph-baseline"].diff < 0);
  const ns = rows.filter((x) => !significant(x.ld.tests["morph-baseline"]));
  for (const x of gain) {
    const t = x.ld.tests["morph-baseline"];
    out.push(`${x.name} (n = ${x.n}, lemma-disjoint): feature-aware rules are ${signed(t.diff)} points above the atomic-tag baseline (${fmtCI(t)}, ${fmtP(t.p)}).`);
  }
  for (const x of loss) {
    const t = x.ld.tests["morph-baseline"];
    out.push(`${x.name} (n = ${x.n}, lemma-disjoint): feature-aware rules are ${signed(t.diff)} points below the baseline (${fmtCI(t)}, ${fmtP(t.p)}).`);
  }
  if (ns.length) {
    out.push(`No significant feature-aware difference on the lemma-disjoint split for ${ns.map((x) => `${x.name} (${signed(x.ld.tests["morph-baseline"].diff)}, ${fmtCI(x.ld.tests["morph-baseline"])})`).join("; ")}.`);
  }

  const rawN = headlineSize(RAW_RON);
  const rawCell = getCell(RAW_RON, "lemma-disjoint", rawN);
  if (rawCell) {
    const t = rawCell.tests["morph-baseline"];
    out.push(
      `On all Romanian records, including nouns and adjectives with unreliable Number and Gender tags, the difference is ${signed(t.diff)} (${fmtCI(t)}); on verbs alone it is ${signed(
        getCell("ron", "lemma-disjoint", headlineSize("ron"))!.tests["morph-baseline"].diff,
      )}, so the raw figure should not be read as a morphological effect.`,
    );
  }

  const evn = rows.find((x) => x.id === "evn");
  if (evn) {
    const b = evn.ld.systems.baseline;
    out.push(
      `Evenki: ${evn.ld.multiRef.toFixed(0)}% of lemma-disjoint test items have more than one stored form. Variant-aware scoring raises baseline accuracy from ${b.mean.toFixed(1)} to ${b.variant.mean.toFixed(1)}; the feature-aware difference is ${signed(
        evn.ld.testsVariant["morph-baseline"].diff,
      )} (${fmtCI(evn.ld.testsVariant["morph-baseline"])}).`,
    );
  }

  const mem = rows.filter((x) => significant(x.r.tests["memory-baseline"]) && x.r.tests["memory-baseline"].diff > 0);
  if (mem.length) {
    out.push(
      `Paradigm memory beats the baseline on the random split for ${mem
        .map((x) => `${x.name} (${signed(x.r.tests["memory-baseline"].diff)}, ${x.r.overlap.toFixed(0)}% of test lemmas seen in training)`)
        .join(" and ")}; on the lemma-disjoint split it equals the baseline by construction.`,
    );
  }
  const memLoss = rows.filter((x) => significant(x.r.tests["memory-baseline"]) && x.r.tests["memory-baseline"].diff < 0);
  if (memLoss.length) {
    out.push(
      `Paradigm memory is significantly below the baseline on the random split for ${memLoss
        .map((x) => `${x.name} (${signed(x.r.tests["memory-baseline"].diff)}, ${fmtCI(x.r.tests["memory-baseline"])})`)
        .join(" and ")}: there, reinflecting from another stored form of the same lemma is less accurate than inflecting from the lemma.`,
    );
  }
  const memNs = rows.filter((x) => !significant(x.r.tests["memory-baseline"]));
  if (memNs.length) out.push(`It shows no significant random-split gain for ${memNs.map((x) => `${x.name} (${x.r.overlap.toFixed(0)}% overlap)`).join(", ")}.`);
  return out;
}
