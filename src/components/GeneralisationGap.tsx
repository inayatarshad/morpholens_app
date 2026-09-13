"use client";

import { fmtP, getCell, signed, significant, type Test } from "@/data/experiments";
import type { ExperimentSplit, LanguageId } from "@/data/types";
import { StatusTag } from "./ResearchBadge";

function Row({ label, ta, tb, color, split }: { label: string; ta: Test; tb: Test; color: string; split: ExperimentSplit }) {
  return (
    <div className="border-t border-line py-3 first:border-0">
      <p className="text-sm text-bush">{label}</p>
      <div className="mt-1 grid grid-cols-2 gap-3">
        {[
          { k: "random", t: ta },
          { k: "lemma-disjoint", t: tb },
        ].map((x) => (
          <div key={x.k} className={`transition-opacity ${split === x.k ? "opacity-100" : "opacity-55"}`}>
            <p className="text-[0.65rem] uppercase tracking-wider text-muted">{x.k}</p>
            <p className={`display text-3xl ${significant(x.t) ? color : "text-muted"}`}>
              {signed(x.t.diff)}
              <span className="ml-1 text-xs text-muted">pts</span>
            </p>
            <p className="font-mono text-[0.62rem] text-muted">
              [{signed(x.t.lo)}, {signed(x.t.hi)}] · {significant(x.t) ? fmtP(x.t.p) : "n.s."}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

/** Paired-bootstrap differences for the current language and n. */
export function GeneralisationGap({ lang, size, split }: { lang: LanguageId; size: number; split: ExperimentSplit }) {
  const r = getCell(lang, "random", size);
  const l = getCell(lang, "lemma-disjoint", size);
  if (!r || !l) return null;

  return (
    <div className="rounded-2xl border border-line bg-ivory/80 p-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="eyebrow">What the numbers say · n = {size}</p>
        <StatusTag label="MEASURED" />
      </div>
      <div className="mt-3">
        <Row label="Paradigm memory vs. atomic baseline" ta={r.tests["memory-baseline"]} tb={l.tests["memory-baseline"]} color="text-burgundy" split={split} />
        <Row label="Feature-aware vs. atomic baseline" ta={r.tests["morph-baseline"]} tb={l.tests["morph-baseline"]} color="text-bush" split={split} />
      </div>
      <dl className="mt-2 grid grid-cols-2 gap-3 border-t border-line pt-4 text-sm">
        <div>
          <dt className="text-xs text-muted">Test lemmas also in training (random split)</dt>
          <dd className="display text-2xl text-sienna">{r.overlap.toFixed(0)}%</dd>
        </div>
        <div>
          <dt className="text-xs text-muted">Test bundles unseen in training (lemma-disjoint)</dt>
          <dd className="display text-2xl text-sienna">{l.unseenBundle.toFixed(0)}%</dd>
        </div>
      </dl>
      <p className="mt-4 text-xs leading-relaxed text-muted">
        Brackets: 95% paired-bootstrap interval over {l.items.toLocaleString("en")} pooled test items; grey = not significant. Paradigm memory can only help
        when a test lemma was seen, so its advantage is confined to the random split.
      </p>
    </div>
  );
}
