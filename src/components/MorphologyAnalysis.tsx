"use client";

import type { Language, MorphologicalEntry } from "@/data/types";
import { MorphemeBreakdown } from "./MorphemeBreakdown";
import { FeatureTable } from "./FeatureTable";
import { ParadigmTable } from "./ParadigmTable";
import { DataProvenance } from "./DataProvenance";
import { ResearchNote } from "./ResearchNote";
import { DifficultyTags } from "./DifficultyTags";
import { VerificationBadge } from "./VerificationBadge";
import { CopyButton, Panel, SectionLabel } from "./ui";

export function MorphologyAnalysis({
  entry,
  language,
  onSelect,
}: {
  entry: MorphologicalEntry;
  language: Language;
  onSelect: (form: string) => void;
}) {
  const rtl = language.direction === "rtl";
  const interlinear = [entry.romanization ?? entry.surface, entry.segmentation.join("-"), entry.gloss, entry.translation && `‘${entry.translation}’`]
    .filter(Boolean)
    .join("\n");

  return (
    <div key={entry.id} className="rise space-y-6">
      {!entry.verified && (
        <div className="flex items-start gap-3 rounded-lg border border-dashed border-sienna/60 bg-sienna/[0.07] px-4 py-3 text-sm text-sienna">
          <VerificationBadge verified={false} />
          <span><strong>Illustrative demo example.</strong> {entry.verificationNote} Do not cite this form.</span>
        </div>
      )}

      {/* Header */}
      <Panel className="grain">
        <div className="grid gap-6 md:grid-cols-[1fr_auto]">
          <div className="flex flex-wrap gap-x-12 gap-y-5">
            <div className="min-w-0">
              <p className="eyebrow">Surface form</p>
              <p className={`mt-1 text-bush ${rtl ? "urdu text-4xl" : "display display-md"}`}>{entry.surface}</p>
              {entry.romanization && <p className="font-mono text-sm text-muted">{entry.romanization}</p>}
            </div>
            <div>
              <p className="eyebrow">Lemma</p>
              <p className={`mt-1 text-bush ${rtl ? "urdu text-3xl" : "display display-sm"}`}>{entry.lemma}</p>
              {entry.lemmaRomanization && <p className="font-mono text-sm text-muted">{entry.lemmaRomanization}</p>}
            </div>
            <div>
              <p className="eyebrow">Part of speech</p>
              <p className="mt-2 font-mono text-sm font-semibold tracking-[0.14em] text-sienna">{entry.pos}</p>
              {entry.translation && <p className="mt-2 font-serif italic text-ink/70">‘{entry.translation}’</p>}
            </div>
          </div>
          <div className="flex flex-row flex-wrap items-start gap-2 md:flex-col md:items-end">
            <VerificationBadge verified={entry.verified} />
            <CopyButton text={entry.surface} label="Copy word" />
            <CopyButton text={interlinear} label="Copy analysis" />
          </div>
        </div>
      </Panel>

      <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        <Panel>
          <SectionLabel index="01">Segmentation</SectionLabel>
          <MorphemeBreakdown morphemes={entry.morphemes} />
          {entry.gloss && (
            <p className="mt-4 border-t border-line pt-3 font-mono text-xs text-muted">
              Gloss&nbsp;&nbsp;<span className="text-ink">{entry.gloss}</span>
            </p>
          )}
        </Panel>
        <Panel>
          <SectionLabel index="02">Morphological features</SectionLabel>
          <FeatureTable features={entry.features} unimorph={entry.unimorph} />
        </Panel>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
        <Panel>
          <SectionLabel index="03">Morpheme interpretation</SectionLabel>
          <table className="w-full text-sm">
            <tbody>
              {entry.morphemes.map((m, i) => (
                <tr key={i} className="border-b border-line last:border-0">
                  <td className="w-1/3 py-2.5 font-serif text-lg text-bush">{m.form}</td>
                  <td className="py-2.5 text-ink/85">{m.meaning}</td>
                  <td className="py-2.5 text-right font-mono text-[0.68rem] tracking-wider text-muted">{m.gloss}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Panel>
        <Panel>
          <SectionLabel index="04">Morphological difficulty</SectionLabel>
          <DifficultyTags tags={entry.difficulty} notes={entry.difficultyNotes} />
        </Panel>
      </div>

      <Panel>
        <SectionLabel index="05">Paradigm</SectionLabel>
        {entry.paradigm ? (
          <>
            <ParadigmTable paradigm={entry.paradigm} current={entry.surface} language={language} onSelect={onSelect} />
            <p className="mt-3 text-xs text-muted">
              {entry.paradigm.length} related forms of <em>{entry.lemmaRomanization ?? entry.lemma}</em> from the local dataset. Select a row to analyse it where a full entry exists.
            </p>
          </>
        ) : (
          <p className="text-sm text-muted">No paradigm recorded for this lemma in the local dataset.</p>
        )}
      </Panel>

      <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
        <ResearchNote>
          Morphologically rich languages can produce many surface forms from a single lemma. Models evaluated only on
          familiar lemmas may appear stronger than they are.
        </ResearchNote>
        <DataProvenance entry={entry} />
      </div>
    </div>
  );
}
