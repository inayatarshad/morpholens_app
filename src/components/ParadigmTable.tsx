"use client";

import { useState } from "react";
import { Search, TriangleAlert } from "lucide-react";
import type { Language, ParadigmEntry } from "@/data/types";
import { canonical } from "@/lib/lookup";

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
  const [filter, setFilter] = useState("");
  const rtl = language.direction === "rtl";
  const cur = canonical(current, language.id);
  const f = filter.trim().toLowerCase();
  const rows = f
    ? paradigm.filter((p) => [p.surface, p.romanization, p.tag, ...Object.values(p.features)].some((x) => x && x.toLowerCase().includes(f)))
    : paradigm;
  const conflicts = paradigm.filter((p) => p.conflict).length;

  return (
    <div className="space-y-3">
      {(paradigm.length > 12 || conflicts > 0) && (
        <div className="flex flex-wrap items-center gap-3">
          {paradigm.length > 12 && (
            <label className="flex min-w-[14rem] flex-1 items-center gap-2 rounded-md border border-line-strong bg-ivory px-3 py-1.5 text-sm focus-within:border-bush">
              <Search size={14} className="text-muted" />
              <input
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                placeholder="Filter cells by form, code (PST, PL, 1SG) or label (Ablative)"
                className="w-full bg-transparent outline-none placeholder:text-muted/60"
                dir="auto"
              />
            </label>
          )}
          <span className="font-mono text-xs text-muted">{rows.length} / {paradigm.length} cells</span>
          {conflicts > 0 && (
            <span className="inline-flex items-center gap-1 rounded-sm border border-sienna/50 bg-sienna/10 px-2 py-0.5 text-xs text-sienna">
              <TriangleAlert size={12} /> {conflicts} row{conflicts > 1 ? "s" : ""} conflict with audit cues
            </span>
          )}
        </div>
      )}
      <div className="max-h-[30rem] overflow-auto rounded-lg border border-line">
        <table className="w-full min-w-[36rem] text-sm">
          <thead className="sticky top-0 z-10 bg-oak text-left text-bush">
            <tr>
              <th className="px-4 py-2.5 font-semibold">Form</th>
              <th className="px-4 py-2.5 font-semibold">Features (as stored)</th>
              <th className="px-4 py-2.5 font-semibold">Surface alignment</th>
            </tr>
          </thead>
          <tbody className="bg-ivory/70">
            {rows.map((p, i) => {
              const same = !!cur && canonical(p.surface, language.id) === cur;
              const exact = same && (!currentTag || !p.tag || currentTag.startsWith(p.tag));
              return (
                <tr
                  key={`${p.surface}-${p.tag ?? i}-${i}`}
                  onClick={() => onSelect?.(p.romanization ?? p.surface)}
                  className={`cursor-pointer border-t border-line transition-colors ${
                    p.conflict
                      ? "bg-[repeating-linear-gradient(135deg,rgba(169,79,36,0.07)_0_6px,transparent_6px_12px)]"
                      : exact
                        ? "bg-sienna/15"
                        : same
                          ? "bg-sienna/[0.06]"
                          : "hover:bg-cashmere"
                  } ${exact && p.conflict ? "outline outline-1 -outline-offset-1 outline-sienna/60" : ""}`}
                >
                  <td className="px-4 py-2">
                    <span className="inline-flex items-center gap-1.5">
                      {p.conflict && <TriangleAlert size={13} className="shrink-0 text-sienna" aria-label="Audit conflict" />}
                      <bdi className={`${rtl ? "urdu text-lg" : "font-serif text-lg"} ${same ? "text-sienna" : "text-bush"}`}>{p.surface}</bdi>
                    </span>
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
                    {p.conflict && <p className="mt-1 text-[0.68rem] text-sienna">{p.conflict}</p>}
                  </td>
                  <td className="px-4 py-2 font-mono text-xs text-ink/80" dir={rtl ? "rtl" : undefined}>
                    {p.segmentation?.map((s, j) => (
                      <span key={j}>
                        {j > 0 && <span className="px-0.5 text-sienna">·</span>}
                        {s}
                      </span>
                    ))}
                  </td>
                </tr>
              );
            })}
            {rows.length === 0 && (
              <tr>
                <td colSpan={3} className="px-4 py-6 text-center text-sm text-muted">No cell matches “{filter}”.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <p className="mt-2 text-[0.7rem] leading-relaxed text-muted">
        Surface alignment: an automatic character split of each form against the lemma. It is not a morphological segmentation; UniMorph stores
        feature bundles, not morpheme boundaries.
      </p>
    </div>
  );
}
