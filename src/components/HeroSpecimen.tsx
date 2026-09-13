"use client";

import { useEffect, useState } from "react";
import { entryById } from "@/data/morphology";
import { languageById } from "@/data/languages";
import { MorphemeBreakdown } from "./MorphemeBreakdown";
import { VerificationBadge } from "./VerificationBadge";

const ids = ["tur-evlerimizden", "urd-larkon", "tur-kitaplarimizdan", "tur-gelmedi", "urd-nahin-likha"];

export function HeroSpecimen() {
  const [i, setI] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setI((n) => (n + 1) % ids.length), 3400);
    return () => clearInterval(t);
  }, []);
  const entry = entryById(ids[i])!;
  const lang = languageById[entry.languageId];

  return (
    <div className="relative rounded-2xl border border-line-strong bg-ivory/90 p-6 shadow-[0_30px_60px_-40px_rgba(16,46,40,0.6)] sm:p-8">
      <div className="flex items-center justify-between">
        <span className="eyebrow">Specimen {String(i + 1).padStart(2, "0")} / {String(ids.length).padStart(2, "0")}</span>
        <VerificationBadge verified={entry.verified} compact />
      </div>
      <div key={entry.id} className="rise mt-6">
        <p className="text-xs font-semibold tracking-[0.2em] text-sienna">{lang.name.toUpperCase()}</p>
        <p className={`mt-1 text-bush ${lang.direction === "rtl" ? "urdu text-4xl" : "display text-4xl sm:text-5xl"}`}>{entry.surface}</p>
        {entry.romanization && <p className="font-mono text-sm text-muted">{entry.romanization}</p>}
        <div className="mt-6">
          <MorphemeBreakdown morphemes={entry.morphemes} size="sm" />
        </div>
        <p className="mt-5 border-t border-line pt-4 font-serif text-lg italic text-ink/70">‘{entry.translation}’</p>
      </div>
      <div className="mt-5 flex gap-1.5">
        {ids.map((id, n) => (
          <button
            key={id}
            aria-label={`Show specimen ${n + 1}`}
            onClick={() => setI(n)}
            className={`h-1 rounded-full transition-all ${n === i ? "w-8 bg-sienna" : "w-3 bg-line-strong hover:bg-oak"}`}
          />
        ))}
      </div>
    </div>
  );
}
