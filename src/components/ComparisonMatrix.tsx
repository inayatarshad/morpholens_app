"use client";

import { useState } from "react";
import { ArrowRight, FileSearch, Hourglass } from "lucide-react";
import { languages } from "@/data/languages";
import { featureLabels } from "@/data/morphology";
import type { ComparisonFeature, LanguageId } from "@/data/types";
import { toEvidence } from "@/lib/analysis";
import { comparisonSlot } from "@/lib/compare";
import { MorphemeBreakdown } from "./MorphemeBreakdown";
import { VerificationBadge } from "./VerificationBadge";
import { useEvidence } from "./EvidenceDrawer";

const featureOrder: ComparisonFeature[] = ["plural", "case", "possession", "past", "negation"];

export function ComparisonMatrix() {
  const [feature, setFeature] = useState<ComparisonFeature>("plural");
  const [selected, setSelected] = useState<LanguageId[]>(languages.map((l) => l.id));
  const { open } = useEvidence();

  const toggle = (id: LanguageId) => setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));

  return (
    <div className="space-y-10">
      <div className="grid gap-6 rounded-2xl border border-line bg-ivory/80 p-6 lg:grid-cols-[1.5fr_1fr]">
        <div>
          <p className="eyebrow mb-3">Feature</p>
          <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Feature">
            {featureOrder.map((f) => (
              <button
                key={f}
                role="radio"
                aria-checked={feature === f}
                onClick={() => setFeature(f)}
                className={`rounded-full border px-4 py-1.5 text-sm transition ${
                  feature === f ? "border-sienna bg-sienna text-ivory" : "border-line-strong text-bush hover:border-bush"
                }`}
              >
                {featureLabels[f].label}
              </button>
            ))}
          </div>
          <p className="mt-3 font-serif text-base italic text-muted">{featureLabels[feature].description}</p>
        </div>
        <div>
          <p className="eyebrow mb-3">Languages</p>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {languages.map((l) => (
              <label key={l.id} className="flex cursor-pointer items-center gap-2 text-sm">
                <input type="checkbox" checked={selected.includes(l.id)} onChange={() => toggle(l.id)} className="h-4 w-4 accent-[#102e28]" />
                {l.name}
              </label>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {selected.length === 0 && <p className="text-sm text-muted">Select at least one language.</p>}
        {languages
          .filter((l) => selected.includes(l.id))
          .map((language) => {
            const slot = comparisonSlot(language.id, feature);
            const rtl = language.direction === "rtl";
            return (
              <article
                key={`${language.id}-${feature}`}
                className="rise grid gap-6 rounded-xl border border-line bg-ivory/80 p-6 md:grid-cols-[11rem_1fr_16rem] md:items-center"
              >
                <div>
                  <p className="text-[0.8rem] font-semibold tracking-[0.22em] text-bush">{language.name.toUpperCase()}</p>
                  <p className="mt-1 text-xs text-muted">{language.family}</p>
                </div>

                {slot.kind === "none" ? (
                  <div className="flex items-center gap-3 rounded-lg border border-dashed border-line-strong px-5 py-6 md:col-span-2">
                    <Hourglass size={18} className="shrink-0 text-sienna" />
                    <div>
                      <p className="font-serif text-lg text-bush">No example shown</p>
                      <p className="text-xs text-muted">{slot.reason}</p>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="min-w-0">
                      <button onClick={() => open(toEvidence(slot.analysis))} className="group flex flex-wrap items-baseline gap-3 text-left" title="Open data evidence">
                        <span className={rtl ? "urdu text-2xl text-bush/70" : "display text-2xl text-bush/70"}>{slot.base}</span>
                        <ArrowRight size={16} className="self-center text-sienna" />
                        <span className={rtl ? "urdu text-3xl text-bush" : "display text-3xl text-bush"}>{slot.analysis.surface}</span>
                        <FileSearch size={14} className="self-center text-muted opacity-0 transition group-hover:opacity-100" />
                      </button>
                      {slot.analysis.tag && <p className="mt-1 font-mono text-[0.7rem] text-muted">{slot.analysis.tag}</p>}
                      {slot.kind === "unimorph" && slot.variants.length > 0 && (
                        <p className="mt-1 text-xs text-sienna">UniMorph also lists: {slot.variants.join(", ")}</p>
                      )}
                      <div className="mt-4" dir="ltr">
                        <MorphemeBreakdown morphemes={slot.analysis.morphemes} size="sm" />
                      </div>
                    </div>
                    <div className="space-y-2 border-t border-line pt-4 text-sm md:border-l md:border-t-0 md:pl-6 md:pt-0">
                      <p className="eyebrow">Strategy</p>
                      <p className="font-serif text-lg leading-snug text-sienna">{slot.strategy}</p>
                      <p className="text-xs text-muted">Position: {slot.position}</p>
                      <VerificationBadge status={slot.analysis.provenance.attestation} />
                      <p className="text-[0.68rem] text-muted">
                        {slot.kind === "unimorph" ? "Strategy classified automatically from the aligned base and target forms." : "Hand-curated: UniMorph has no example."}
                      </p>
                    </div>
                  </>
                )}
              </article>
            );
          })}
      </div>

      <section>
        <div className="mb-4 flex items-center gap-3">
          <span className="eyebrow">Typological view · {featureLabels[feature].label}</span>
          <span className="h-px flex-1 bg-line" />
        </div>
        <div className="overflow-x-auto rounded-xl border border-line">
          <table className="w-full min-w-[44rem] text-sm">
            <thead className="bg-oak/70 text-left text-bush">
              <tr>
                {["Language", "Family", "Strategy", "Position", "Evidence", "Resource level"].map((h) => (
                  <th key={h} className="px-4 py-3 font-semibold">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-ivory/70">
              {languages.map((l) => {
                const slot = comparisonSlot(l.id, feature);
                const none = slot.kind === "none";
                return (
                  <tr key={l.id} className="border-t border-line">
                    <td className="px-4 py-3 font-medium text-bush">{l.name}</td>
                    <td className="px-4 py-3">{l.family}</td>
                    <td className={`px-4 py-3 ${none ? "italic text-muted" : "text-sienna"}`}>{none ? "n/a" : slot.strategy}</td>
                    <td className={`px-4 py-3 ${none ? "text-muted" : ""}`}>{none ? "n/a" : slot.position}</td>
                    <td className="px-4 py-3 text-xs text-muted">{none ? "none" : slot.kind === "unimorph" ? "UniMorph" : "Reference grammar"}</td>
                    <td className="px-4 py-3">{l.resourceLevel}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-xs text-muted">
          Examples are drawn from UniMorph where available; the base is the citation form unless stated. Automatic
          strategy labels describe surface change between two cells, not a full morphological analysis.
        </p>
      </section>
    </div>
  );
}
