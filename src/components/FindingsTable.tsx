"use client";

import { useState } from "react";
import { RAW_RON, datasetLabel, fmtP, getCell, headlineSize, mainDatasets, signed, significant, summaryOf, testOf, type Metric } from "@/data/experiments";
import { StatusTag } from "./ResearchBadge";

/** Cross-language summary at the largest training size ≤ 500 available for each dataset. */
export function FindingsTable() {
  const [metric, setMetric] = useState<Metric>("strict");
  const rows = [...mainDatasets, RAW_RON].map((id) => {
    const n = headlineSize(id);
    const r = getCell(id, "random", n)!;
    const d = getCell(id, "lemma-disjoint", n)!;
    const tn = d.tests["nfeat-natom"] ? testOf(d, "nfeat-natom", metric) : undefined;
    return { id, n, r, d, tm: testOf(d, "morph-baseline", metric), tmem: testOf(r, "memory-baseline", metric), tn };
  });
  return (
    <div className="rounded-2xl border border-line bg-ivory/80 p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="eyebrow">Findings across languages</p>
        <div className="flex items-center gap-3">
          <div role="radiogroup" aria-label="Scoring" className="inline-flex rounded-md border border-line-strong bg-cashmere p-0.5 text-xs">
            {(["strict", "variant"] as Metric[]).map((m) => (
              <button
                key={m}
                role="radio"
                aria-checked={metric === m}
                onClick={() => setMetric(m)}
                className={`rounded px-2.5 py-1 ${metric === m ? "bg-bush text-ivory" : "text-bush"}`}
              >
                {m === "strict" ? "Strict" : "Variant-aware"}
              </button>
            ))}
          </div>
          <StatusTag label="MEASURED · PAIRED BOOTSTRAP" />
        </div>
      </div>
      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[80rem] text-sm">
          <thead className="text-left text-xs text-muted">
            <tr>
              <th className="py-2 pr-3 font-medium">Dataset</th>
              <th className="py-2 pr-3 font-medium">n</th>
              <th className="py-2 pr-3 font-medium">Baseline · LD</th>
              <th className="py-2 pr-3 font-medium">Feature-aware · LD</th>
              <th className="py-2 pr-3 font-medium">Δ feature-aware [95% CI]</th>
              <th className="py-2 pr-3 font-medium">Neural atomic · LD</th>
              <th className="py-2 pr-3 font-medium">Neural features · LD</th>
              <th className="py-2 pr-3 font-medium">Δ neural features vs. atomic [95% CI]</th>
              <th className="py-2 pr-3 font-medium">Edit distance · LD</th>
              <th className="py-2 pr-3 font-medium">Δ memory · random [95% CI]</th>
              <th className="py-2 pr-3 font-medium">Lemma overlap</th>
              <th className="py-2 pr-3 font-medium">Multi-form cells</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(({ id, n, r, d, tm, tmem, tn }) => {
              const raw = id === RAW_RON;
              const b = summaryOf(d, "baseline", metric);
              const f = summaryOf(d, "morph", metric);
              const na = d.systems.natom ? summaryOf(d, "natom", metric) : undefined;
              const nf = d.systems.nfeat ? summaryOf(d, "nfeat", metric) : undefined;
              return (
                <tr key={id} className={`border-t border-line align-top ${raw ? "bg-sienna/[0.05] text-ink/70" : ""}`}>
                  <td className="py-2.5 pr-3 font-medium text-bush">
                    {datasetLabel(id)}
                    {raw && <span className="block text-[0.65rem] font-normal text-sienna">unreliable noun/adjective tags; not a morphological claim</span>}
                  </td>
                  <td className="py-2.5 pr-3 font-mono text-xs">{n}</td>
                  <td className="py-2.5 pr-3 font-mono">{b.mean.toFixed(1)} <span className="text-muted">± {b.std.toFixed(1)}</span></td>
                  <td className="py-2.5 pr-3 font-mono">{f.mean.toFixed(1)} <span className="text-muted">± {f.std.toFixed(1)}</span></td>
                  <td className="py-2.5 pr-3 font-mono">
                    <span className={`font-semibold ${significant(tm) ? "text-bush" : "text-muted"}`}>{signed(tm.diff)}</span>{" "}
                    <span className="text-xs text-muted">[{signed(tm.lo)}, {signed(tm.hi)}]</span>
                    <span className="block text-[0.65rem] text-muted">{significant(tm) ? fmtP(tm.p) : "n.s."}</span>
                  </td>
                  <td className="py-2.5 pr-3 font-mono">{na ? <>{na.mean.toFixed(1)} <span className="text-muted">± {na.std.toFixed(1)}</span></> : "n/a"}</td>
                  <td className="py-2.5 pr-3 font-mono">{nf ? <>{nf.mean.toFixed(1)} <span className="text-muted">± {nf.std.toFixed(1)}</span></> : "n/a"}</td>
                  <td className="py-2.5 pr-3 font-mono">
                    {tn ? (
                      <>
                        <span className={`font-semibold ${significant(tn) ? "text-sienna" : "text-muted"}`}>{signed(tn.diff)}</span>{" "}
                        <span className="text-xs text-muted">[{signed(tn.lo)}, {signed(tn.hi)}]</span>
                        <span className="block text-[0.65rem] text-muted">{significant(tn) ? fmtP(tn.p) : "n.s."}</span>
                      </>
                    ) : (
                      "n/a"
                    )}
                  </td>
                  <td className="py-2.5 pr-3 font-mono text-xs">{d.systems.baseline.lev.toFixed(2)} → {d.systems.morph.lev.toFixed(2)}</td>
                  <td className="py-2.5 pr-3 font-mono">
                    <span className={`font-semibold ${significant(tmem) ? "text-burgundy" : "text-muted"}`}>{signed(tmem.diff)}</span>{" "}
                    <span className="text-xs text-muted">[{signed(tmem.lo)}, {signed(tmem.hi)}]</span>
                    <span className="block text-[0.65rem] text-muted">{significant(tmem) ? fmtP(tmem.p) : "n.s."}</span>
                  </td>
                  <td className="py-2.5 pr-3 font-mono text-xs">{r.overlap.toFixed(0)}%</td>
                  <td className="py-2.5 pr-3 font-mono text-xs">{d.multiRef.toFixed(0)}%</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p className="mt-3 text-xs leading-relaxed text-muted">
        LD = lemma-disjoint. Accuracy in % (mean ± s.d. over seeds). Δ = difference in accuracy points from a paired bootstrap over all test items
        pooled across seeds (2,000 resamples); “n.s.” = the 95% interval includes zero. Edit distance = mean Levenshtein distance to the stored form
        (baseline → feature-aware; lower is better). The neural columns are the same PyTorch network given the bundle as one token (atomic) or one
        token per feature, trained on the same items. Multi-form cells = share of test items whose lemma and bundle have more than one stored form.
        Romanian (verbs) excludes nouns and adjectives because their Number and Gender tags are unreliable; the raw run on all records is shown
        separately. Chukchi (n = 100): of 241 UniMorph records, 234 are usable after excluding 7 with non-schema tags, and each test set holds 58 items per seed; it is shown for completeness only.
      </p>
    </div>
  );
}
