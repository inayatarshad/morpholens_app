"use client";

import { Cpu, TriangleAlert } from "lucide-react";
import type { Language } from "@/data/types";
import { conflictsOf, type Analysis } from "@/lib/analysis";
import type { AlignConfidence } from "@/lib/stem";
import { MorphemeBreakdown } from "./MorphemeBreakdown";
import { ParadigmTable } from "./ParadigmTable";
import { DataProvenance } from "./DataProvenance";
import { DifficultyTags } from "./DifficultyTags";
import { HandBadge, VerificationBadge } from "./VerificationBadge";
import { CopyButton, Panel, SectionLabel } from "./ui";

const CONFIDENCE: Record<AlignConfidence, { label: string; cls: string; text: string }> = {
  high: { label: "HIGH", cls: "border-bush/30 bg-bush/[0.08] text-bush", text: "The form contains the citation stem unchanged, so the split is pure affixation." },
  medium: { label: "MEDIUM", cls: "border-oak bg-oak/40 text-bush", text: "One stem segment alternates; the stem variant is supported by other forms of the paradigm or is a final-ending replacement." },
  low: { label: "LOW", cls: "border-sienna/50 bg-sienna/10 text-sienna", text: "The alternation is not supported by other forms, or only a longest shared stretch could be aligned." },
  none: { label: "NO SPLIT", cls: "border-line-strong bg-cashmere text-muted", text: "The form shares no material with the lemma (suppletion), so no automatic split is shown." },
};

const METHOD: Record<string, string> = {
  identity: "Citation form",
  suffixation: "Suffixation onto the citation stem",
  prefixation: "Prefixation onto the citation stem",
  circumfixation: "Prefix and suffix around the citation stem",
  "ending-replacement": "Final ending replaced",
  "stem-variant": "Stem variant plus suffix",
  truncation: "Lemma material removed",
  substring: "Longest shared stretch only",
  suppletion: "Suppletion",
};

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
  const iso = (s: string) => (rtl ? `⁧${s}⁩` : s);
  const split = a.morphemes.map((m) => iso(m.form.replace(/^-|-$/g, ""))).join(" + ");
  const interlinear = [
    iso(a.surface) + (a.romanization ? ` (${a.romanization})` : ""),
    `${a.segmentation === "hand" ? "Hand segmentation" : "Automatic surface alignment"}: ${split}`,
    a.tag && `Source bundle: ${a.tag}`,
    a.gloss && a.segmentation === "hand" && `Gloss: ${a.gloss}`,
    a.translation && `‘${a.translation}’`,
  ]
    .filter(Boolean)
    .join("\n");
  const al = a.alignment;
  const conf = al ? CONFIDENCE[al.confidence] : null;
  const conflicts = conflictsOf(a);
  const anomalies = a.schemaIssues.filter((s) => s.status === "anomaly");
  const syncretic = a.difficulty.includes("SYNCRETISM");
  const crossCategory = a.difficulty.includes("HOMONYMY");

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
            {a.segmentation === "hand" && <HandBadge />}
            <CopyButton text={a.surface} label="Copy word" />
            <CopyButton text={interlinear} label="Copy analysis" />
          </div>
        </div>
      </Panel>

      {conflicts.map((c) => (
        <div key={c.field} className="flex gap-3 rounded-lg border border-sienna/50 bg-sienna/[0.07] px-4 py-3 text-sm">
          <TriangleAlert size={16} className="mt-0.5 shrink-0 text-sienna" />
          <p>
            <span className="font-semibold text-sienna">This record conflicts with the {c.field} audit.</span>{" "}
            The source tags {c.field} as {c.source}, but the {c.cue}, which suggests {c.expected}. The record is shown exactly as stored.
          </p>
        </div>
      ))}
      {anomalies.map((s) => (
        <div key={s.atom} className="flex gap-3 rounded-lg border border-sienna/50 bg-sienna/[0.07] px-4 py-3 text-sm">
          <TriangleAlert size={16} className="mt-0.5 shrink-0 text-sienna" />
          <p>
            <span className="font-semibold text-sienna">Non-schema source tag: {s.atom}.</span> It fits no UniMorph argument-marking or feature template.
            Stored verbatim, never silently corrected; likely a source annotation or typographical issue. Excluded from the experiment.
          </p>
        </div>
      ))}

      <div className="grid gap-6 lg:grid-cols-2">
        <DataProvenance analysis={a} />
        <section className="rounded-xl border border-line bg-ivory/80 p-6">
          <p className="eyebrow flex items-center gap-2 !text-bush">
            <Cpu size={13} /> MorphoLens interpretation
          </p>
          <p className="mt-1 text-xs text-muted">
            {a.segmentation === "hand"
              ? "Hand annotation by the MorphoLens author following the cited source; not expert-reviewed and no automatic inference."
              : "Inferred by MorphoLens from the record and its paradigm. Not part of the source."}
          </p>
          {al && conf ? (
            <dl className="mt-4 grid gap-x-6 gap-y-3 text-sm sm:grid-cols-[8.5rem_1fr]">
              <dt className="text-muted">Surface alignment</dt>
              <dd>
                <span className={`inline-flex items-center rounded-sm border px-1.5 py-0.5 font-mono text-[0.62rem] font-semibold tracking-[0.12em] ${conf.cls}`}>
                  {conf.label} CONFIDENCE
                </span>
                <p className="mt-1 text-xs text-ink/75">{METHOD[al.method]}. {conf.text}</p>
              </dd>
              <dt className="text-muted">Citation stem</dt>
              <dd><bdi className={rtl ? "urdu" : "font-serif text-base"}>{al.citationStem}</bdi></dd>
              {al.alternation && (
                <>
                  <dt className="text-muted">Stem alternation</dt>
                  <dd className="text-xs">
                    <bdi className={rtl ? "urdu" : "font-serif text-base"}>{al.lemmaHead}</bdi> ~ <bdi className={rtl ? "urdu" : "font-serif text-base"}>{al.stem}-</bdi>{" "}
                    ({al.alternation.from} → {al.alternation.to})
                    {al.support.length > 0 && <span className="block text-muted">Stem variant recurs in: {al.support.slice(0, 6).join(", ")}</span>}
                  </dd>
                </>
              )}
              {al.removed && !al.alternation && (
                <>
                  <dt className="text-muted">Unaccounted material</dt>
                  <dd className="text-xs">“{al.removed}” of the lemma does not appear in the form.</dd>
                </>
              )}
              <dt className="text-muted">Ambiguity</dt>
              <dd className="text-xs">
                {syncretic || crossCategory
                  ? [syncretic && "syncretism within the paradigm (same lemma and part of speech)", crossCategory && "cross-category ambiguity (another part of speech or lemma)"]
                      .filter(Boolean)
                      .join("; ")
                  : "No other record of this lemma has this form."}
              </dd>
              <dt className="text-muted">Record audit</dt>
              <dd className="space-y-1 text-xs">
                {a.audits.length === 0 ? (
                  <p>{a.languageId === "ron" ? "No audit rule applies to this record." : "No audit rules exist for this language yet."}</p>
                ) : (
                  a.audits.map((x) => (
                    <p key={x.field} className={x.conflict ? "text-sienna" : ""}>
                      {x.field}: {x.conflict ? `conflict, ${x.cue} suggests ${x.expected}; source says ${x.source}.` : `consistent, ${x.cue}, matching the source tag ${x.source}.`}
                    </p>
                  ))
                )}
                {a.languageId === "ron" && <p className="text-muted">Only Number and adjective Gender are audited.</p>}
              </dd>
            </dl>
          ) : (
            <dl className="mt-4 grid gap-x-6 gap-y-3 text-sm sm:grid-cols-[8.5rem_1fr]">
              <dt className="text-muted">Segmentation</dt>
              <dd>Hand-annotated (not expert-reviewed)</dd>
              {a.gloss && (
                <>
                  <dt className="text-muted">Gloss</dt>
                  <dd className="font-mono text-xs">{a.gloss}</dd>
                </>
              )}
            </dl>
          )}
        </section>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <Panel>
          <SectionLabel index="01">{a.segmentation === "hand" ? "Morphological segmentation · hand-annotated" : "Surface alignment · automatic"}</SectionLabel>
          <div dir="ltr">
            <MorphemeBreakdown morphemes={a.morphemes} />
          </div>
          <p className="mt-4 border-t border-line pt-3 text-xs text-muted">
            {a.segmentation === "hand" ? (
              <>Hand-annotated morpheme boundaries, not expert-reviewed. Gloss&nbsp;&nbsp;<span className="font-mono text-ink">{a.gloss}</span></>
            ) : (
              "Automatic character alignment. Not a morphological segmentation: UniMorph stores feature bundles, not morpheme boundaries, so an exponent is never attributed to individual features."
            )}
          </p>
        </Panel>
        <Panel>
          <SectionLabel index="02">{a.segmentation === "hand" ? "Morpheme interpretation" : "Aligned parts (not morphemes)"}</SectionLabel>
          <table className="w-full text-sm">
            <tbody>
              {a.morphemes.map((m, i) => (
                <tr key={i} className="border-b border-line align-top last:border-0">
                  <td className="w-1/4 py-2.5 pr-3 font-serif text-lg text-bush"><bdi>{m.form}</bdi></td>
                  <td className="py-2.5 text-ink/85">{m.meaning}</td>
                  <td className="py-2.5 pl-2 text-right font-mono text-[0.66rem] tracking-wider text-muted">{m.gloss}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Panel>
      </div>

      <Panel>
        <SectionLabel index="03">Morphological difficulty</SectionLabel>
        <DifficultyTags tags={a.difficulty} notes={a.difficultyNotes} sources={a.difficultySources} />
      </Panel>

      <Panel>
        <SectionLabel index="04">Paradigm</SectionLabel>
        {a.paradigm.length ? (
          <>
            <ParadigmTable paradigm={a.paradigm} current={a.surface} currentTag={a.tag} language={language} onSelect={onSelect} />
            <p className="mt-3 text-xs text-muted">
              {a.paradigmScope === "full"
                ? `All ${a.paradigm.length} records UniMorph stores for “${a.lemma}”, with their tags as stored.`
                : a.paradigmScope === "sample"
                  ? `${a.paradigm.length} records of “${a.lemma}” from the bundled sample (search the lemma for the full paradigm).`
                  : `${a.paradigm.length} related forms of “${a.lemmaRomanization ?? a.lemma}” (hand-annotated).`}{" "}
              Select a row to analyse it.
            </p>
          </>
        ) : (
          <p className="text-sm text-muted">No paradigm recorded for this lemma in the local sample.</p>
        )}
      </Panel>
    </div>
  );
}
