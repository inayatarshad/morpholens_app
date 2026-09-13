"use client";

import { languages } from "@/data/languages";
import { models, trainingSizes } from "@/data/experiments";
import type { ExperimentSplit, LanguageId, TrainingSize } from "@/data/types";

type Props = {
  lang: LanguageId;
  split: ExperimentSplit;
  size: TrainingSize;
  onLang: (l: LanguageId) => void;
  onSplit: (s: ExperimentSplit) => void;
  onSize: (n: TrainingSize) => void;
};

function Segmented<T extends string | number>({
  options,
  value,
  onChange,
  label,
  render,
}: {
  options: T[];
  value: T;
  onChange: (v: T) => void;
  label: string;
  render?: (v: T) => React.ReactNode;
}) {
  return (
    <div role="radiogroup" aria-label={label} className="inline-flex flex-wrap rounded-lg border border-line-strong bg-cashmere p-1">
      {options.map((o) => (
        <button
          key={String(o)}
          role="radio"
          aria-checked={o === value}
          onClick={() => onChange(o)}
          className={`rounded-md px-3.5 py-1.5 text-sm transition-all ${o === value ? "bg-bush text-ivory shadow" : "text-bush hover:bg-ivory"}`}
        >
          {render ? render(o) : String(o)}
        </button>
      ))}
    </div>
  );
}

export function ExperimentControls({ lang, split, size, onLang, onSplit, onSize }: Props) {
  return (
    <div className="grid gap-6 rounded-2xl border border-line bg-ivory/80 p-6 lg:grid-cols-2 xl:grid-cols-[auto_auto_auto_1fr]">
      <div>
        <p className="eyebrow mb-2">Language</p>
        <Segmented
          label="Language"
          options={languages.map((l) => l.id)}
          value={lang}
          onChange={onLang}
          render={(id) => languages.find((l) => l.id === id)!.name}
        />
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
        <Segmented label="Training examples" options={trainingSizes} value={size} onChange={onSize} />
      </div>
      <div className="grid grid-cols-2 gap-3 text-sm lg:col-span-2 xl:col-span-1">
        {(Object.keys(models) as (keyof typeof models)[]).map((m) => (
          <div key={m} className="rounded-lg border border-line bg-cashmere/60 px-3 py-2">
            <p className="flex items-center gap-2 font-semibold text-bush">
              <span className={`h-2.5 w-2.5 rounded-sm ${m === "baseline" ? "bg-oak ring-1 ring-bush/30" : "bg-bush"}`} />
              {models[m].name}
            </p>
            <p className="text-xs text-muted">{models[m].detail}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
