"use client";

import { getResult } from "@/data/experiments";
import type { ExperimentSplit, LanguageId, TrainingSize } from "@/data/types";
import { IllustrativeTag } from "./ResearchBadge";

const r1 = (n: number) => Math.round(n * 10) / 10;
const signed = (n: number) => `${n > 0 ? "+" : n < 0 ? "−" : "±"}${Math.abs(n).toFixed(1)}`;

export function GeneralisationGap({ lang, size, split }: { lang: LanguageId; size: TrainingSize; split: ExperimentSplit }) {
  const br = getResult(lang, "random", size, "baseline");
  const mr = getResult(lang, "random", size, "morph");
  const bl = getResult(lang, "lemma-disjoint", size, "baseline");
  const ml = getResult(lang, "lemma-disjoint", size, "morph");

  const advRandom = r1(mr - br);
  const advLD = r1(ml - bl);
  const dropBase = r1(bl - br);
  const dropMorph = r1(ml - mr);

  return (
    <div className="rounded-2xl border border-line bg-ivory/80 p-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="eyebrow">Generalisation gap</p>
        <IllustrativeTag />
      </div>

      <p className="mt-4 text-sm text-muted">Baseline deficit relative to morphology-aware model</p>
      <div className="mt-3 space-y-3">
        {[
          { label: "Random split", v: advRandom, active: split === "random", color: "bg-bush" },
          { label: "Lemma-disjoint", v: advLD, active: split === "lemma-disjoint", color: "bg-sienna" },
        ].map((row) => (
          <div key={row.label} className={`transition-opacity ${row.active ? "opacity-100" : "opacity-50"}`}>
            <div className="flex items-baseline justify-between">
              <span className="text-sm text-bush">{row.label}</span>
              <span className="display text-3xl text-bush">{signed(-row.v)}<span className="ml-1 text-sm text-muted">pts</span></span>
            </div>
            <div className="mt-1 h-2 rounded-full bg-cashmere">
              <div className={`h-2 rounded-full ${row.color} transition-all duration-700`} style={{ width: `${Math.min(100, (row.v / 25) * 100)}%` }} />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3 border-t border-line pt-5">
        <div>
          <p className="text-xs text-muted">Baseline degradation<br />random → lemma-disjoint</p>
          <p className="display mt-1 text-4xl text-sienna">{signed(dropBase)}</p>
        </div>
        <div>
          <p className="text-xs text-muted">Morphology-aware degradation<br />random → lemma-disjoint</p>
          <p className="display mt-1 text-4xl text-bush">{signed(dropMorph)}</p>
        </div>
      </div>
      <p className="mt-4 text-xs leading-relaxed text-muted">
        Hypothesis being illustrated: the advantage of explicit morphology is small when test lemmas are familiar and
        grows when they are not. Only a controlled experiment can confirm or refute this.
      </p>
    </div>
  );
}
