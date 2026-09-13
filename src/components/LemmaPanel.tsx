"use client";

import { ExternalLink } from "lucide-react";
import { languageById } from "@/data/languages";
import { sourceFor, type Triple } from "@/data/unimorph";
import { posLabel } from "@/data/unimorph-features";
import type { LanguageId } from "@/data/types";
import { paradigmRows } from "@/lib/analysis";
import { ParadigmTable } from "./ParadigmTable";
import { VerificationBadge } from "./VerificationBadge";
import { Panel, SectionLabel } from "./ui";

/** Shown when the query is a lemma (citation form) rather than an attested inflected form. */
export function LemmaPanel({ lang, lemma, cells, onSelect }: { lang: LanguageId; lemma: string; cells: Triple[]; onSelect: (form: string) => void }) {
  const language = languageById[lang];
  const src = sourceFor(lang);
  const posCounts = new Map<string, number>();
  for (const c of cells) posCounts.set(posLabel(c.tag), (posCounts.get(posLabel(c.tag)) ?? 0) + 1);
  const pos = [...posCounts].sort((a, b) => b[1] - a[1]).map(([p]) => p).join(" / ");
  const rtl = language.direction === "rtl";

  return (
    <div className="rise space-y-6">
      <Panel className="grain">
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div className="flex flex-wrap gap-x-12 gap-y-4">
            <div>
              <p className="eyebrow">Lemma</p>
              <p className={`mt-1 text-bush ${rtl ? "urdu text-4xl" : "display display-md"}`}>{lemma}</p>
            </div>
            <div>
              <p className="eyebrow">Part of speech</p>
              <p className="mt-2 font-mono text-sm font-semibold tracking-[0.14em] text-sienna">{pos || "n/a"}</p>
            </div>
            <div>
              <p className="eyebrow">Cells in UniMorph</p>
              <p className="display mt-1 text-3xl text-bush">{cells.length}</p>
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            <VerificationBadge status="unimorph" />
            <a href={src.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs text-sienna underline">
              {src.label} <ExternalLink size={11} />
            </a>
          </div>
        </div>
      </Panel>
      <Panel>
        <SectionLabel index="01">Full paradigm</SectionLabel>
        <ParadigmTable paradigm={paradigmRows(cells, lang)} current="" language={language} onSelect={onSelect} />
        <p className="mt-3 text-xs text-muted">Every cell UniMorph lists for this lemma. Select a row to analyse that form.</p>
      </Panel>
    </div>
  );
}
