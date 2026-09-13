"use client";

import type { Language, ParadigmEntry } from "@/data/types";
import { normalise } from "@/lib/lookup";

export function ParadigmTable({
  paradigm,
  current,
  language,
  onSelect,
}: {
  paradigm: ParadigmEntry[];
  current: string;
  language: Language;
  onSelect?: (surface: string) => void;
}) {
  const rtl = language.direction === "rtl";
  return (
    <div className="overflow-x-auto rounded-lg border border-line">
      <table className="w-full min-w-[34rem] text-sm">
        <thead className="bg-oak/70 text-left text-bush">
          <tr>
            <th className="px-4 py-2.5 font-semibold">Form</th>
            <th className="px-4 py-2.5 font-semibold">Features</th>
            <th className="px-4 py-2.5 font-semibold">Segmentation</th>
          </tr>
        </thead>
        <tbody className="bg-ivory/70">
          {paradigm.map((p, i) => {
            const active = normalise(p.surface) === normalise(current);
            return (
              <tr
                key={i}
                onClick={() => onSelect?.(p.romanization ?? p.surface)}
                className={`cursor-pointer border-t border-line transition-colors ${active ? "bg-sienna/10" : "hover:bg-cashmere"}`}
              >
                <td className="px-4 py-2.5">
                  <span className={`${rtl ? "urdu text-lg" : "font-serif text-lg"} ${active ? "text-sienna" : "text-bush"}`}>{p.surface}</span>
                  {p.romanization && <span className="ml-2 font-mono text-xs text-muted">{p.romanization}</span>}
                </td>
                <td className="px-4 py-2.5">
                  <div className="flex flex-wrap gap-1">
                    {Object.entries(p.features).map(([k, v]) => (
                      <span key={k} title={k} className="rounded border border-line bg-cashmere/70 px-1.5 py-0.5 font-mono text-[0.68rem] text-ink/80">
                        {v}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="px-4 py-2.5 font-mono text-xs text-ink/80">
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
