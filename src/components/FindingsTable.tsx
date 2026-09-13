import { fmtP, getCell, headlineSize, signed, significant } from "@/data/experiments";
import { languages } from "@/data/languages";
import { StatusTag } from "./ResearchBadge";

/** Cross-language summary at the largest training size ≤ 500 available for each language. */
export function FindingsTable() {
  const rows = languages.map((l) => {
    const n = headlineSize(l.id);
    const r = getCell(l.id, "random", n)!;
    const d = getCell(l.id, "lemma-disjoint", n)!;
    return { l, n, r, d, tm: d.tests["morph-baseline"], tmem: r.tests["memory-baseline"] };
  });
  return (
    <div className="rounded-2xl border border-line bg-ivory/80 p-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="eyebrow">Findings across languages</p>
        <StatusTag label="MEASURED · PAIRED BOOTSTRAP" />
      </div>
      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[58rem] text-sm">
          <thead className="text-left text-xs text-muted">
            <tr>
              <th className="py-2 pr-3 font-medium">Language</th>
              <th className="py-2 pr-3 font-medium">n</th>
              <th className="py-2 pr-3 font-medium">Baseline · LD</th>
              <th className="py-2 pr-3 font-medium">Feature-aware · LD</th>
              <th className="py-2 pr-3 font-medium">Δ feature-aware [95% CI]</th>
              <th className="py-2 pr-3 font-medium">Edit distance · LD</th>
              <th className="py-2 pr-3 font-medium">Δ memory · random [95% CI]</th>
              <th className="py-2 pr-3 font-medium">Lemma overlap</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(({ l, n, r, d, tm, tmem }) => (
              <tr key={l.id} className="border-t border-line align-top">
                <td className="py-2.5 pr-3 font-medium text-bush">{l.name}</td>
                <td className="py-2.5 pr-3 font-mono text-xs">{n}</td>
                <td className="py-2.5 pr-3 font-mono">{d.systems.baseline.mean.toFixed(1)} <span className="text-muted">± {d.systems.baseline.std.toFixed(1)}</span></td>
                <td className="py-2.5 pr-3 font-mono">{d.systems.morph.mean.toFixed(1)} <span className="text-muted">± {d.systems.morph.std.toFixed(1)}</span></td>
                <td className="py-2.5 pr-3 font-mono">
                  <span className={`font-semibold ${significant(tm) ? "text-bush" : "text-muted"}`}>{signed(tm.diff)}</span>{" "}
                  <span className="text-xs text-muted">[{signed(tm.lo)}, {signed(tm.hi)}]</span>
                  <span className="block text-[0.65rem] text-muted">{significant(tm) ? fmtP(tm.p) : "n.s."}</span>
                </td>
                <td className="py-2.5 pr-3 font-mono text-xs">{d.systems.baseline.lev.toFixed(2)} → {d.systems.morph.lev.toFixed(2)}</td>
                <td className="py-2.5 pr-3 font-mono">
                  <span className={`font-semibold ${significant(tmem) ? "text-burgundy" : "text-muted"}`}>{signed(tmem.diff)}</span>{" "}
                  <span className="text-xs text-muted">[{signed(tmem.lo)}, {signed(tmem.hi)}]</span>
                  <span className="block text-[0.65rem] text-muted">{significant(tmem) ? fmtP(tmem.p) : "n.s."}</span>
                </td>
                <td className="py-2.5 pr-3 font-mono text-xs">{r.overlap.toFixed(0)}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-3 text-xs leading-relaxed text-muted">
        LD = lemma-disjoint. Accuracy in % (mean ± s.d. over seeds). Δ = difference in accuracy points from a paired bootstrap over all
        test items pooled across seeds (2,000 resamples); “n.s.” = the 95% interval includes zero. Edit distance = mean Levenshtein
        distance to the gold form (baseline → feature-aware; lower is better). Chukchi (241 triples) is shown for completeness only.
      </p>
    </div>
  );
}
