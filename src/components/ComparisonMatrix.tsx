"use client";

import { useState } from "react";
import { ArrowRight, FileSearch, Hourglass } from "lucide-react";
import { languageById, languages } from "@/data/languages";
import { comparisons, entryById, featureLabels } from "@/data/morphology";
import type { ComparisonFeature, LanguageId } from "@/data/types";
import { MorphemeBreakdown } from "./MorphemeBreakdown";
import { VerificationBadge } from "./VerificationBadge";
import { useEvidence } from "./EvidenceDrawer";

const featureOrder: ComparisonFeature[] = ["plural", "case", "possession", "past", "negation"];

export function ComparisonMatrix() {
  const [feature, setFeature] = useState<ComparisonFeature>("plural");
  const [selected, setSelected] = useState<LanguageId[]>(["evn", "ckt", "tur", "urd"]);
  const [showUnverified, setShowUnverified] = useState(false);
  const { open } = useEvidence();

  const toggle = (id: LanguageId) =>
    setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));

  const rows = languages
    .filter((l) => selected.includes(l.id))
    .map((l) => {
      const ex = comparisons.find((c) => c.languageId === l.id && c.feature === feature);
      const entry = ex ? entryById(ex.entryId) : undefined;
      const usable = entry && (entry.verified || showUnverified);
      return { language: l, ex, entry, usable, hiddenCandidate: !!entry && !entry.verified && !showUnverified };
    });

  return (
    <div className="space-y-10">
      {/* Controls */}
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
          <div className="grid grid-cols-2 gap-2">
            {languages.map((l) => (
              <label key={l.id} className="flex cursor-pointer items-center gap-2 text-sm">
                <input type="checkbox" checked={selected.includes(l.id)} onChange={() => toggle(l.id)} className="h-4 w-4 accent-[#102e28]" />
                {l.name}
              </label>
            ))}
          </div>
          <label className="mt-4 flex cursor-pointer items-center gap-2 border-t border-line pt-3 text-xs text-muted">
            <input type="checkbox" checked={showUnverified} onChange={(e) => setShowUnverified(e.target.checked)} className="h-3.5 w-3.5 accent-[#a94f24]" />
            Show unverified candidate examples
          </label>
        </div>
      </div>

      {/* Panels */}
      <div className="space-y-3">
        {rows.length === 0 && <p className="text-sm text-muted">Select at least one language.</p>}
        {rows.map(({ language, ex, entry, usable, hiddenCandidate }) => {
          const rtl = language.direction === "rtl";
          return (
            <article
              key={`${language.id}-${feature}`}
              className="rise grid gap-6 rounded-xl border border-line bg-ivory/80 p-6 md:grid-cols-[11rem_1fr_15rem] md:items-center"
            >
              <div>
                <p className="text-[0.8rem] font-semibold tracking-[0.22em] text-bush">{language.name.toUpperCase()}</p>
                <p className="mt-1 text-xs text-muted">{language.family} · {language.script}</p>
              </div>

              {usable && ex && entry ? (
                <>
                  <div className="min-w-0">
                    <button
                      onClick={() =>
                        open({
                          form: entry.surface,
                          romanization: entry.romanization,
                          languageId: entry.languageId,
                          features: entry.features,
                          source: entry.source,
                          dataset: entry.dataset,
                          verified: entry.verified,
                          note: entry.verificationNote,
                          crossCheck: entry.crossCheck,
                        })
                      }
                      className="group flex flex-wrap items-baseline gap-3 text-left"
                      title="Open data evidence"
                    >
                      <span className={rtl ? "urdu text-2xl text-bush/70" : "display text-2xl text-bush/70"}>{ex.base}</span>
                      <ArrowRight size={16} className="self-center text-sienna" />
                      <span className={rtl ? "urdu text-3xl text-bush" : "display text-3xl text-bush"}>{entry.surface}</span>
                      <FileSearch size={14} className="self-center text-muted opacity-0 transition group-hover:opacity-100" />
                    </button>
                    {entry.romanization && (
                      <p className="font-mono text-xs text-muted">
                        {ex.baseRomanization} → {entry.romanization}
                      </p>
                    )}
                    <div className="mt-4">
                      <MorphemeBreakdown morphemes={entry.morphemes} size="sm" />
                    </div>
                  </div>
                  <div className="space-y-2 border-t border-line pt-4 text-sm md:border-l md:border-t-0 md:pl-6 md:pt-0">
                    <p className="eyebrow">Type</p>
                    <p className="font-serif text-lg text-sienna">{ex.strategy}</p>
                    <p className="text-xs text-muted">Position: {ex.position}</p>
                    {ex.note && <p className="text-xs text-ink/70">{ex.note}</p>}
                    <VerificationBadge verified={entry.verified} />
                  </div>
                </>
              ) : (
                <div className="flex items-center gap-3 rounded-lg border border-dashed border-line-strong px-5 py-6 md:col-span-2">
                  <Hourglass size={18} className="shrink-0 text-sienna" />
                  <div>
                    <p className="font-serif text-lg text-bush">
                      {language.id === "evn" || language.id === "ckt" ? "Example pending linguistic verification" : "No verified example in local dataset"}
                    </p>
                    <p className="text-xs text-muted">
                      {hiddenCandidate
                        ? "An unverified candidate exists — enable “Show unverified candidate examples” to inspect it."
                        : `Add a ComparisonExample for ${language.name} · ${featureLabels[feature].label} in src/data/morphology.ts.`}
                    </p>
                  </div>
                </div>
              )}
            </article>
          );
        })}
      </div>

      {/* Typological view */}
      <section>
        <div className="mb-4 flex items-center gap-3">
          <span className="eyebrow">Typological view · {featureLabels[feature].label}</span>
          <span className="h-px flex-1 bg-line" />
        </div>
        <div className="overflow-x-auto rounded-xl border border-line">
          <table className="w-full min-w-[40rem] text-sm">
            <thead className="bg-oak/70 text-left text-bush">
              <tr>
                {["Language", "Family", "Strategy", "Position", "Resource level"].map((h) => (
                  <th key={h} className="px-4 py-3 font-semibold">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-ivory/70">
              {languages.map((l) => {
                const ex = comparisons.find((c) => c.languageId === l.id && c.feature === feature);
                const entry = ex ? entryById(ex.entryId) : undefined;
                const pending = !ex || (entry && !entry.verified && !showUnverified);
                return (
                  <tr key={l.id} className="border-t border-line">
                    <td className="px-4 py-3 font-medium text-bush">{languageById[l.id].name}</td>
                    <td className="px-4 py-3">{l.family}</td>
                    <td className={`px-4 py-3 ${pending ? "italic text-muted" : "text-sienna"}`}>{pending ? "Pending verification" : ex!.strategy}</td>
                    <td className={`px-4 py-3 ${pending ? "text-muted" : ""}`}>{pending ? "—" : ex!.position}</td>
                    <td className="px-4 py-3">{l.resourceLevel}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-xs text-muted">
          The same grammatical meaning is encoded by bound suffixes in Turkish but frequently by separate words
          (postpositions, particles, possessive pronouns) in Urdu. Rows update with the selected feature.
        </p>
      </section>
    </div>
  );
}
