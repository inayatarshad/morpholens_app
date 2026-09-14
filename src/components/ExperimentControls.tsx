"use client";

import { languages } from "@/data/languages";
import { metricLabel, systemOrder, systems, type Metric } from "@/data/experiments";
import type { ExperimentSplit, LanguageId } from "@/data/types";

type Props = {
  lang: LanguageId;
  split: ExperimentSplit;
  size: number;
  sizes: number[];
  metric: Metric;
  onLang: (l: LanguageId) => void;
  onSplit: (s: ExperimentSplit) => void;
  onSize: (n: number) => void;
  onMetric: (m: Metric) => void;
};

export function ExperimentControls({ lang, split, size, sizes, metric, onLang, onSplit, onSize, onMetric }: Props) {
  const seg = (on: boolean) => `rounded-md px-3.5 py-1.5 text-sm transition-all ${on ? "bg-bush text-ivory shadow" : "text-bush hover:bg-ivory"}`;
  return (
    <div className="space-y-5 rounded-2xl border border-line bg-ivory/80 p-6">
      <div className="flex flex-wrap gap-x-8 gap-y-5">
        <div>
          <p className="eyebrow mb-2">Language</p>
          <div role="radiogroup" aria-label="Language" className="inline-flex flex-wrap rounded-lg border border-line-strong bg-cashmere p-1">
            {languages.map((l) => (
              <button key={l.id} role="radio" aria-checked={l.id === lang} onClick={() => onLang(l.id)} className={seg(l.id === lang)}>
                {l.id === "ron" ? "Romanian (verbs)" : l.name}
              </button>
            ))}
          </div>
        </div>
        <div>
          <p className="eyebrow mb-2">Evaluation split</p>
          <div role="radiogroup" aria-label="Evaluation split" className="inline-flex rounded-lg border border-line-strong bg-cashmere p-1">
            {(["random", "lemma-disjoint"] as ExperimentSplit[]).map((s) => (
              <button
                key={s}
                role="radio"
                aria-checked={split === s}
                onClick={() => onSplit(s)}
                className={`rounded-md px-4 py-1.5 text-sm font-medium transition-all ${
                  split === s ? (s === "random" ? "bg-bush text-ivory shadow" : "bg-sienna text-ivory shadow") : "text-bush hover:bg-ivory"
                }`}
              >
                {s === "random" ? "Random split" : "Lemma-disjoint split"}
              </button>
            ))}
          </div>
        </div>
        <div>
          <p className="eyebrow mb-2">Training examples</p>
          <div role="radiogroup" aria-label="Training examples" className="inline-flex flex-wrap rounded-lg border border-line-strong bg-cashmere p-1">
            {sizes.map((n) => (
              <button key={n} role="radio" aria-checked={n === size} onClick={() => onSize(n)} className={seg(n === size)}>
                {n}
              </button>
            ))}
          </div>
        </div>
        <div>
          <p className="eyebrow mb-2">Scoring</p>
          <div role="radiogroup" aria-label="Scoring" className="inline-flex rounded-lg border border-line-strong bg-cashmere p-1">
            {(["strict", "variant"] as Metric[]).map((m) => (
              <button key={m} role="radio" aria-checked={metric === m} onClick={() => onMetric(m)} className={seg(metric === m)}>
                {m === "strict" ? "Strict" : "Variant-aware"}
              </button>
            ))}
          </div>
        </div>
      </div>
      <p className="text-xs text-muted">
        {metricLabel[metric]}:{" "}
        {metric === "strict"
          ? "the prediction must equal the stored form of the test record."
          : "the prediction may equal any form stored for the same lemma and bundle, so dialectal or transcription variants (frequent in oral Evenki) are not counted as errors."}
        {lang === "ron" && " Romanian results use verbs only; noun and adjective tags are unreliable. Results on all records are listed in the findings table."}
      </p>
      <div className="grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-5">
        {systemOrder.map((m) => (
          <div key={m} className="rounded-lg border border-line bg-cashmere/60 px-3 py-2">
            <p className="flex items-center gap-2 font-semibold text-bush">
              <span className="h-2.5 w-2.5 rounded-sm ring-1 ring-bush/20" style={{ background: systems[m].color }} />
              {systems[m].name}
            </p>
            <p className="text-xs text-muted">{systems[m].detail}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
