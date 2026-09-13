import { getCell, sizesFor } from "@/data/experiments";
import { languages } from "@/data/languages";
import { StatusTag } from "./ResearchBadge";

const signed = (n: number) => `${n > 0.05 ? "+" : n < -0.05 ? "−" : "±"}${Math.abs(n).toFixed(1)}`;

/** Cross-language summary at the largest training size ≤ 500 available for each language. */
export function FindingsTable() {
  const rows = languages.map((l) => {
    const sizes = sizesFor(l.id);
    const n = sizes.filter((s) => s <= 500).pop() ?? sizes[0];
    const r = getCell(l.id, "random", n)!;
    const d = getCell(l.id, "lemma-disjoint", n)!;
    return {
      l,
      n,
      baseLD: d.systems.baseline,
      morphLD: d.systems.morph,
      morphGain: d.systems.morph.mean - d.systems.baseline.mean,
      memGainR: r.systems.memory.mean - r.systems.baseline.mean,
      overlap: r.overlap,
    };
  });
  return (
    <div className="rounded-2xl border border-line bg-ivory/80 p-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="eyebrow">Findings across languages</p>
        <StatusTag label="MEASURED" />
      </div>
      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[44rem] text-sm">
          <thead className="text-left text-xs text-muted">
            <tr>
              <th className="py-2 pr-3 font-medium">Language</th>
              <th className="py-2 pr-3 font-medium">n</th>
              <th className="py-2 pr-3 font-medium">Baseline · lemma-disjoint</th>
              <th className="py-2 pr-3 font-medium">Feature-aware · lemma-disjoint</th>
              <th className="py-2 pr-3 font-medium">Feature-aware gain</th>
              <th className="py-2 pr-3 font-medium">Memory gain · random</th>
              <th className="py-2 pr-3 font-medium">Lemma overlap · random</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((x) => (
              <tr key={x.l.id} className="border-t border-line">
                <td className="py-2.5 pr-3 font-medium text-bush">{x.l.name}</td>
                <td className="py-2.5 pr-3 font-mono text-xs">{x.n}</td>
                <td className="py-2.5 pr-3 font-mono">{x.baseLD.mean.toFixed(1)} <span className="text-muted">± {x.baseLD.std.toFixed(1)}</span></td>
                <td className="py-2.5 pr-3 font-mono">{x.morphLD.mean.toFixed(1)} <span className="text-muted">± {x.morphLD.std.toFixed(1)}</span></td>
                <td className={`py-2.5 pr-3 font-mono font-semibold ${x.morphGain > 1 ? "text-bush" : "text-muted"}`}>{signed(x.morphGain)}</td>
                <td className={`py-2.5 pr-3 font-mono font-semibold ${x.memGainR > 1 ? "text-burgundy" : "text-muted"}`}>{signed(x.memGainR)}</td>
                <td className="py-2.5 pr-3 font-mono text-xs">{x.overlap.toFixed(0)}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-3 text-xs leading-relaxed text-muted">
        Gains are differences of means in accuracy points. Standard deviations across seeds are often as large as the
        gains, so small differences should not be read as effects. Chukchi (241 triples) is shown for completeness only.
      </p>
    </div>
  );
}
