"use client";

import { getCell } from "@/data/experiments";
import type { ExperimentSplit, LanguageId } from "@/data/types";
import { StatusTag } from "./ResearchBadge";

const signed = (n: number) => `${n > 0.05 ? "+" : n < -0.05 ? "−" : "±"}${Math.abs(n).toFixed(1)}`;

function Row({ label, a, b, color, split }: { label: string; a: number; b: number; color: string; split: ExperimentSplit }) {
  return (
    <div className="border-t border-line py-3 first:border-0">
      <p className="text-sm text-bush">{label}</p>
      <div className="mt-1 grid grid-cols-2 gap-3">
        {[
          { k: "random", v: a },
          { k: "lemma-disjoint", v: b },
        ].map((x) => (
          <div key={x.k} className={`transition-opacity ${split === x.k ? "opacity-100" : "opacity-55"}`}>
            <p className="text-[0.65rem] uppercase tracking-wider text-muted">{x.k}</p>
            <p className={`display text-3xl ${color}`}>{signed(x.v)}<span className="ml-1 text-xs text-muted">pts</span></p>
          </div>
        ))}
      </div>
    </div>
  );
}

/** Differences computed directly from the measured means for the current language and n. */
export function GeneralisationGap({ lang, size, split }: { lang: LanguageId; size: number; split: ExperimentSplit }) {
  const r = getCell(lang, "random", size);
  const l = getCell(lang, "lemma-disjoint", size);
  if (!r || !l) return null;

  const memR = r.systems.memory.mean - r.systems.baseline.mean;
  const memL = l.systems.memory.mean - l.systems.baseline.mean;
  const morR = r.systems.morph.mean - r.systems.baseline.mean;
  const morL = l.systems.morph.mean - l.systems.baseline.mean;

  return (
    <div className="rounded-2xl border border-line bg-ivory/80 p-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="eyebrow">What the numbers say · n = {size}</p>
        <StatusTag label="MEASURED" />
      </div>
      <div className="mt-3">
        <Row label="Paradigm memory vs. atomic baseline" a={memR} b={memL} color="text-burgundy" split={split} />
        <Row label="Feature-aware vs. atomic baseline" a={morR} b={morL} color="text-bush" split={split} />
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
        Paradigm memory can only help when a test lemma was seen, so its advantage is confined to the random split. A
        feature-aware gain that survives the lemma-disjoint split is evidence of generalisation rather than recall.
      </p>
    </div>
  );
}
