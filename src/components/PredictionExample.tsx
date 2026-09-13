"use client";

import { Check, X } from "lucide-react";
import { experiment, systemOrder, systems } from "@/data/experiments";
import { languageById } from "@/data/languages";
import type { ExperimentSplit, LanguageId } from "@/data/types";
import { StatusTag } from "./ResearchBadge";

const kindLabel: Record<string, string> = {
  "morph-only": "only feature-aware correct",
  "memory-only": "only memory correct",
  "baseline-only": "only baseline correct",
  "all-wrong": "all systems wrong",
  "all-right": "all correct",
};

/** Real test items and system outputs from seed 1 of the run. */
export function PredictionExample({ lang, split }: { lang: LanguageId; split: ExperimentSplit }) {
  const ex = experiment.examples[lang]?.[split];
  const rtl = languageById[lang].direction === "rtl";
  const cls = rtl ? "urdu text-base leading-[1.9]" : "font-serif text-base";

  return (
    <div className="rounded-2xl border border-line bg-ivory/80 p-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="eyebrow">Real predictions · {split}{ex ? ` · n = ${ex.n}` : ""}</p>
        <StatusTag label="MODEL OUTPUT · SEED 1" />
      </div>
      {!ex || ex.items.length === 0 ? (
        <p className="mt-4 text-sm text-muted">No disagreement cases recorded for this configuration.</p>
      ) : (
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[40rem] text-sm">
            <thead className="text-left text-xs text-muted">
              <tr>
                <th className="py-2 pr-3 font-medium">Lemma · bundle</th>
                <th className="py-2 pr-3 font-medium">Gold</th>
                {systemOrder.map((m) => (
                  <th key={m} className="py-2 pr-3 font-medium">{systems[m].name}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ex.items.map((it, i) => (
                <tr key={i} className="border-t border-line align-top">
                  <td className="py-2.5 pr-3">
                    <span className={`${cls} text-bush`}>{it.lemma}</span>
                    <span className="block font-mono text-[0.62rem] text-muted">{it.tag}</span>
                    <span className="mt-1 flex flex-wrap gap-1">
                      <span className="rounded-sm bg-cashmere px-1 text-[0.6rem] text-muted">{kindLabel[it.kind]}</span>
                      {!it.lemmaSeen && <span className="rounded-sm bg-sienna/10 px-1 text-[0.6rem] text-sienna">unseen lemma</span>}
                      {!it.bundleSeen && <span className="rounded-sm bg-burgundy/10 px-1 text-[0.6rem] text-burgundy">unseen bundle</span>}
                    </span>
                  </td>
                  <td className={`py-2.5 pr-3 ${cls} text-bush`}>{it.gold}</td>
                  {systemOrder.map((m) => {
                    const ok = it[m] === it.gold;
                    return (
                      <td key={m} className={`py-2.5 pr-3 ${cls} ${ok ? "text-bush" : "text-burgundy"}`}>
                        <span className="inline-flex items-start gap-1">
                          {ok ? <Check size={14} className="mt-1 shrink-0 text-bush" /> : <X size={14} className="mt-1 shrink-0 text-burgundy" />}
                          <span className={ok ? "" : "line-through decoration-1"}>{it[m]}</span>
                        </span>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <p className="mt-3 text-xs text-muted">
        Selected automatically from the test set to show disagreements; not a random sample, so it says nothing about
        overall accuracy.
      </p>
    </div>
  );
}
