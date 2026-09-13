"use client";

import { languages } from "@/data/languages";
import { systemOrder, systems } from "@/data/experiments";
import type { ExperimentSplit, LanguageId } from "@/data/types";

type Props = {
  lang: LanguageId;
  split: ExperimentSplit;
  size: number;
  sizes: number[];
  onLang: (l: LanguageId) => void;
  onSplit: (s: ExperimentSplit) => void;
  onSize: (n: number) => void;
};

export function ExperimentControls({ lang, split, size, sizes, onLang, onSplit, onSize }: Props) {
  const seg = (on: boolean) => `rounded-md px-3.5 py-1.5 text-sm transition-all ${on ? "bg-bush text-ivory shadow" : "text-bush hover:bg-ivory"}`;
  return (
    <div className="space-y-5 rounded-2xl border border-line bg-ivory/80 p-6">
      <div className="flex flex-wrap gap-x-8 gap-y-5">
        <div>
          <p className="eyebrow mb-2">Language</p>
          <div role="radiogroup" aria-label="Language" className="inline-flex flex-wrap rounded-lg border border-line-strong bg-cashmere p-1">
            {languages.map((l) => (
              <button key={l.id} role="radio" aria-checked={l.id === lang} onClick={() => onLang(l.id)} className={seg(l.id === lang)}>
                {l.name}
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
      </div>
      <div className="grid gap-3 text-sm sm:grid-cols-3">
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
