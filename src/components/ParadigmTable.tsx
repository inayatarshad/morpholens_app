"use client";

import type { Language, ParadigmEntry } from "@/data/types";
import { normalise } from "@/lib/lookup";

export function ParadigmTable({
  paradigm,
  current,
  currentTag,
  language,
  onSelect,
}: {
  paradigm: ParadigmEntry[];
  current: string;
  currentTag?: string;
  language: Language;
  onSelect?: (surface: string) => void;
}) {
  const rtl = language.direction === "rtl";
  return (
    <div className="max-h-[30rem] overflow-auto rounded-lg border border-line">
      <table className="w-full min-w-[36rem] text-sm">
        <thead className="sticky top-0 z-10 bg-oak text-left text-bush">
          <tr>
            <th className="px-4 py-2.5 font-semibold">Form</th>
            <th className="px-4 py-2.5 font-semibold">Features</th>
            <th className="px-4 py-2.5 font-semibold">Segmentation</th>
          </tr>
        </thead>
        <tbody className="bg-ivory/70">
          {paradigm.map((p, i) => {
            const same = normalise(p.surface) === normalise(current);
            const exact = same && (!currentTag || !p.tag || currentTag.startsWith(p.tag));
            return (
              <tr
                key={i}
                onClick={() => onSelect?.(p.romanization ?? p.surface)}
                className={`cursor-pointer border-t border-line transition-colors ${exact ? "bg-sienna/15" : same ? "bg-sienna/[0.06]" : "hover:bg-cashmere"}`}
              >
                <td className="px-4 py-2">
                  <span className={`${rtl ? "urdu text-lg" : "font-serif text-lg"} ${same ? "text-sienna" : "text-bush"}`}>{p.surface}</span>
                  {p.romanization && <span className="ml-2 font-mono text-xs text-muted">{p.romanization}</span>}
                </td>
                <td className="px-4 py-2">
                  <div className="flex flex-wrap gap-1" title={p.tag}>
                    {Object.entries(p.features).map(([k, v]) => (
                      <span key={k} title={k} className="rounded border border-line bg-cashmere/70 px-1.5 py-0.5 text-[0.68rem] text-ink/80">
                        {v}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="px-4 py-2 font-mono text-xs text-ink/80" dir={rtl ? "rtl" : undefined}>
                  {p.segmentation?.map((s, j) => (
                    <span key={j}>
                      {j > 0 && <span className="px-1 text-sienna">+</span>}
                      {s}
                    </span>
                  ))}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
