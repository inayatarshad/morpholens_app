"use client";

import { getCell, systemOrder, systems } from "@/data/experiments";
import type { ExperimentSplit, LanguageId } from "@/data/types";
import { StatusTag } from "./ResearchBadge";

const cell = (v: number | null) => (v === null ? "—" : `${v.toFixed(1)}%`);

/** Where accuracy is won or lost: seen vs. unseen bundles and lemmas, error types, edit distance. */
export function BreakdownPanel({ lang, split, size }: { lang: LanguageId; split: ExperimentSplit; size: number }) {
  const c = getCell(lang, split, size);
  if (!c) return null;
  const random = split === "random";
  return (
    <div className="rounded-2xl border border-line bg-ivory/80 p-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="eyebrow">Where the differences come from · {split} · n = {size}</p>
        <StatusTag label="MEASURED" />
      </div>
      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[44rem] text-sm">
          <thead className="text-left text-xs text-muted">
            <tr>
              <th className="py-2 pr-3 font-medium">System</th>
              <th className="py-2 pr-3 font-medium">Seen bundle</th>
              <th className="py-2 pr-3 font-medium">Unseen bundle ({c.unseenBundle.toFixed(0)}% of items)</th>
              {random && <th className="py-2 pr-3 font-medium">Seen lemma ({c.overlap.toFixed(0)}%)</th>}
              {random && <th className="py-2 pr-3 font-medium">Unseen lemma</th>}
              <th className="py-2 pr-3 font-medium">Errors that copy the lemma</th>
              <th className="py-2 pr-3 font-medium">Mean edit distance</th>
            </tr>
          </thead>
          <tbody>
            {systemOrder.map((s) => {
              const x = c.systems[s];
              return (
                <tr key={s} className="border-t border-line">
                  <td className="py-2.5 pr-3">
                    <span className="inline-flex items-center gap-2 font-medium text-bush">
                      <span className="h-2.5 w-2.5 rounded-sm" style={{ background: systems[s].color }} />
                      {systems[s].name}
                    </span>
                  </td>
                  <td className="py-2.5 pr-3 font-mono">{cell(x.seenBundle)}</td>
                  <td className="py-2.5 pr-3 font-mono">{cell(x.unseenBundle)}</td>
                  {random && <td className="py-2.5 pr-3 font-mono">{cell(x.seenLemma)}</td>}
                  {random && <td className="py-2.5 pr-3 font-mono">{cell(x.unseenLemma)}</td>}
                  <td className="py-2.5 pr-3 font-mono">{x.copyShare.toFixed(1)}%</td>
                  <td className="py-2.5 pr-3 font-mono">{x.lev.toFixed(2)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p className="mt-3 text-xs leading-relaxed text-muted">
        Accuracy on test items whose feature bundle (or lemma) does / does not occur in the training sample, pooled over seeds ({c.items.toLocaleString("en")} items).
        A lemma copy means the system found no applicable rule and returned the lemma unchanged.
      </p>
    </div>
  );
}
