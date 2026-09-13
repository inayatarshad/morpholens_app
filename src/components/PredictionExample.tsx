"use client";

import { Check, X } from "lucide-react";
import { predictionScenarios } from "@/data/experiments";
import type { LanguageId } from "@/data/types";
import { DifficultyTags } from "./DifficultyTags";
import { IllustrativeTag } from "./ResearchBadge";

export function PredictionExample({ lang }: { lang: LanguageId }) {
  const s = predictionScenarios[lang];

  const train = s?.train ?? [
    { lemma: "lemma A", forms: ["A1", "A2", "A3"] },
    { lemma: "lemma B", forms: ["B1", "B2"] },
  ];
  const test = s?.test ?? { lemma: "lemma C", features: "PLURAL + ABLATIVE", gold: "C·PL·ABL" };

  return (
    <div className="rounded-2xl border border-line bg-ivory/80 p-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="eyebrow">Example prediction</p>
        <IllustrativeTag label={s ? "ILLUSTRATIVE · HYPOTHETICAL OUTPUT" : "CONCEPTUAL SCHEMA"} />
      </div>

      {!s && (
        <p className="mt-3 rounded-md border border-dashed border-line-strong px-3 py-2 text-xs text-muted">
          No verified forms for this language yet — shown as an abstract schema. Scenario forms will appear once entries are verified.
        </p>
      )}

      <div className="mt-5 grid gap-4 md:grid-cols-[1fr_auto_1fr] md:items-stretch">
        <div className="rounded-xl border border-line bg-cashmere/60 p-4">
          <p className="font-mono text-[0.65rem] tracking-[0.2em] text-muted">TRAINING CONTAINS</p>
          <div className="mt-3 space-y-3">
            {train.map((t) => (
              <div key={t.lemma}>
                <p className="text-xs text-muted">lemma <span className="font-serif text-base italic text-bush">{t.lemma}</span></p>
                <div className="mt-1 flex flex-wrap gap-1.5">
                  {t.forms.map((f) => (
                    <span key={f} className="rounded bg-bush px-2 py-0.5 font-serif text-sm text-ivory">{f}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="hidden items-center font-mono text-xs text-muted md:flex">→</div>
        <div className="rounded-xl border border-sienna/40 bg-sienna/[0.06] p-4">
          <p className="font-mono text-[0.65rem] tracking-[0.2em] text-sienna">TEST · UNSEEN LEMMA</p>
          <p className="display mt-2 text-3xl text-bush">{test.lemma}</p>
          <p className="mt-2 text-xs text-muted">requested feature</p>
          <p className="font-mono text-sm font-semibold tracking-wider text-sienna">{test.features}</p>
          {s && (
            <p className="mt-2 text-xs text-muted">
              reference form <span className="font-serif text-base text-bush">{test.gold}</span>
            </p>
          )}
        </div>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <div className="rounded-xl border border-line p-4">
          <p className="text-xs font-semibold tracking-wider text-muted">BASELINE</p>
          <p className="mt-2 flex items-center gap-2">
            <X size={16} className="text-burgundy" />
            <span className="display text-2xl text-burgundy line-through decoration-1">{s?.baseline.prediction ?? "C1 (memorised pattern)"}</span>
          </p>
          <p className="mt-1 text-xs text-muted">{s?.baseline.verdict ?? "Incorrect prediction"}</p>
        </div>
        <div className="rounded-xl border border-bush/30 bg-bush p-4 text-ivory">
          <p className="text-xs font-semibold tracking-wider text-oak">MORPHOLOGY-AWARE</p>
          <p className="mt-2 flex items-center gap-2">
            <Check size={16} className="text-sienna-soft" />
            <span className="display text-2xl">{s?.morph.prediction ?? "C + PL + ABL"}</span>
          </p>
          <p className="mt-1 text-xs text-ivory/70">{s?.morph.verdict ?? "Correct / structurally closer prediction"}</p>
        </div>
      </div>
      {s && <p className="mt-4 text-sm text-ink/75">{s.explanation}</p>}

      <div className="mt-6 border-t border-line pt-5">
        <p className="eyebrow mb-3">Morphological difficulty of the test item</p>
        <DifficultyTags tags={s?.difficulty ?? ["UNSEEN_LEMMA"]} />
      </div>
    </div>
  );
}
