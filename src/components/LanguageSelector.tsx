"use client";

import { languages } from "@/data/languages";
import { statsFor } from "@/data/unimorph";
import type { LanguageId } from "@/data/types";

const compact = (n: number) => (n >= 1000 ? `${(n / 1000).toFixed(n >= 10000 ? 0 : 1)}k` : String(n));

export function LanguageSelector({ value, onChange }: { value: LanguageId; onChange: (id: LanguageId) => void }) {
  return (
    <div role="radiogroup" aria-label="Language" className="flex gap-2 overflow-x-auto lg:flex-col lg:overflow-visible">
      {languages.map((l) => {
        const active = l.id === value;
        return (
          <button
            key={l.id}
            role="radio"
            aria-checked={active}
            onClick={() => onChange(l.id)}
            className={`group min-w-[11rem] rounded-lg border px-4 py-3 text-left transition-all duration-200 lg:min-w-0 ${
              active
                ? "border-bush bg-bush text-ivory shadow-[0_10px_24px_-16px_rgba(16,46,40,0.8)]"
                : "border-line bg-ivory/70 text-ink hover:border-bush/40 hover:bg-ivory"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold tracking-wide">{l.name}</span>
              <span className={`font-mono text-[0.65rem] ${active ? "text-oak" : "text-muted"}`}>{compact(statsFor(l.id).triples)} triples</span>
            </div>
            <p className={`mt-0.5 text-xs ${active ? "text-ivory/70" : "text-muted"}`}>{l.family}</p>
          </button>
        );
      })}
    </div>
  );
}
