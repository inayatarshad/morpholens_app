"use client";

import type { Language } from "@/data/types";
import type { Analysis } from "@/lib/analysis";
import { MorphemeBreakdown } from "./MorphemeBreakdown";
import { FeatureTable } from "./FeatureTable";
import { ParadigmTable } from "./ParadigmTable";
import { DataProvenance } from "./DataProvenance";
import { ResearchNote } from "./ResearchNote";
import { DifficultyTags } from "./DifficultyTags";
import { VerificationBadge } from "./VerificationBadge";
import { CopyButton, Panel, SectionLabel } from "./ui";

export function MorphologyAnalysis({
  analysis: a,
  language,
  onSelect,
}: {
  analysis: Analysis;
  language: Language;
  onSelect: (form: string) => void;
}) {
  const rtl = language.direction === "rtl";
  const interlinear = [a.romanization ?? a.surface, a.morphemes.map((m) => m.form.replace(/^-|-$/g, "")).join("-"), a.gloss, a.tag, a.translation && `‘${a.translation}’`]
    .filter(Boolean)
    .join("\n");

  return (
    <div key={a.id} className="rise space-y-6">
      <Panel className="grain">
        <div className="grid gap-6 md:grid-cols-[1fr_auto]">
          <div className="flex flex-wrap gap-x-12 gap-y-5">
            <div className="min-w-0">
              <p className="eyebrow">Surface form</p>
              <p className={`mt-1 text-bush ${rtl ? "urdu text-4xl" : "display display-md"}`}>{a.surface}</p>
              {a.romanization && <p className="font-mono text-sm text-muted">{a.romanization}</p>}
            </div>
            <div>
              <p className="eyebrow">Lemma</p>
              <p className={`mt-1 text-bush ${rtl ? "urdu text-3xl" : "display display-sm"}`}>{a.lemma}</p>
              {a.lemmaRomanization && <p className="font-mono text-sm text-muted">{a.lemmaRomanization}</p>}
            </div>
            <div>
              <p className="eyebrow">Part of speech</p>
              <p className="mt-2 font-mono text-sm font-semibold tracking-[0.14em] text-sienna">{a.pos}</p>
              {a.translation && <p className="mt-2 font-serif italic text-ink/70">‘{a.translation}’</p>}
            </div>
          </div>
          <div className="flex flex-row flex-wrap items-start gap-2 md:flex-col md:items-end">
            <VerificationBadge status={a.provenance.attestation} />
            <CopyButton text={a.surface} label="Copy word" />
            <CopyButton text={interlinear} label="Copy analysis" />
          </div>
        </div>
      </Panel>

      <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        <Panel>
          <SectionLabel index="01">{a.segmentation === "hand" ? "Segmentation · hand-annotated" : "Segmentation · automatic alignment"}</SectionLabel>
          <div dir="ltr">
            <MorphemeBreakdown morphemes={a.morphemes} />
          </div>
          <p className="mt-4 border-t border-line pt-3 text-xs text-muted">
            {a.segmentation === "hand"
              ? <>Gloss&nbsp;&nbsp;<span className="font-mono text-ink">{a.gloss}</span></>
              : "Split by aligning the form with its lemma (longest shared substring). UniMorph gives feature bundles, not morpheme boundaries, so exponents are not attributed to individual features."}
          </p>
        </Panel>
        <Panel>
          <SectionLabel index="02">Morphological features</SectionLabel>
          {Object.keys(a.features).length ? (
            <FeatureTable features={a.features} unimorph={a.tag} />
          ) : (
            <p className="text-sm text-muted">Bundle carries part of speech only.</p>
          )}
        </Panel>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Panel>
          <SectionLabel index="03">Morpheme interpretation</SectionLabel>
          <table className="w-full text-sm">
            <tbody>
              {a.morphemes.map((m, i) => (
                <tr key={i} className="border-b border-line last:border-0">
                  <td className="w-1/3 py-2.5 pr-3 font-serif text-lg text-bush" dir="auto">{m.form}</td>
                  <td className="py-2.5 text-ink/85">{m.meaning}</td>
                  <td className="py-2.5 pl-2 text-right font-mono text-[0.66rem] tracking-wider text-muted">{m.gloss}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Panel>
        <Panel>
          <SectionLabel index="04">Morphological difficulty</SectionLabel>
          <DifficultyTags tags={a.difficulty} notes={a.difficultyNotes} computed={a.segmentation === "auto"} />
        </Panel>
      </div>

      <Panel>
        <SectionLabel index="05">Paradigm</SectionLabel>
        {a.paradigm.length ? (
          <>
            <ParadigmTable paradigm={a.paradigm} current={a.surface} currentTag={a.tag} language={language} onSelect={onSelect} />
            <p className="mt-3 text-xs text-muted">
              {a.paradigm.length} cells of <em>{a.lemmaRomanization ?? a.lemma}</em>
              {a.segmentation === "auto" ? " from the shipped UniMorph sample (large paradigms are capped)." : " (hand-annotated)."} Select a row to analyse it.
            </p>
          </>
        ) : (
          <p className="text-sm text-muted">No paradigm recorded for this lemma in the local sample.</p>
        )}
      </Panel>

      <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
        <ResearchNote>
          Morphologically rich languages can produce many surface forms from a single lemma. Models evaluated only on
          familiar lemmas may appear stronger than they are.
        </ResearchNote>
        <DataProvenance analysis={a} />
      </div>
    </div>
  );
}
