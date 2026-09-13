import raw from "./generated/experiment-results.json";
import type { ExperimentSplit, LanguageId, SystemId } from "./types";

/**
 * MEASURED RESULTS
 * ----------------
 * Produced by scripts/run-experiment.mjs on pinned UniMorph data (5 seeds).
 * Regenerate with: npm run data:fetch && npm run experiment
 */

type Summary = { mean: number; std: number; runs: number[] };
export type Cell = { overlap: number; unseenBundle: number; systems: Record<SystemId, Summary> };
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
  config: { seeds: number[]; sizes: number[]; cellsPerLemma: number; universeTarget: number; testMax: number; testFraction: number };
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
