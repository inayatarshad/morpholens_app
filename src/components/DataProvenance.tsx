"use client";

import { Database, ExternalLink, FileSearch } from "lucide-react";
import { toEvidence, type Analysis } from "@/lib/analysis";
import { FeatureTable } from "./FeatureTable";
import { VerificationBadge } from "./VerificationBadge";
import { useEvidence } from "./EvidenceDrawer";

/** Everything here is what the source says; nothing is inferred by MorphoLens. */
export function DataProvenance({ analysis }: { analysis: Analysis }) {
  const { open } = useEvidence();
  const p = analysis.provenance;
  return (
    <section className="rounded-xl border border-line bg-oak-soft/60 p-6">
      <div className="flex items-center justify-between gap-3">
        <p className="eyebrow flex items-center gap-2 !text-bush">
          <Database size={13} /> Source record
        </p>
        <button onClick={() => open(toEvidence(analysis))} className="inline-flex items-center gap-1 text-xs text-sienna hover:underline">
          <FileSearch size={13} /> Open evidence
        </button>
      </div>
      <p className="mt-1 text-xs text-muted">What the source stores. Nothing in this card is inferred by MorphoLens.</p>
      <dl className="mt-4 grid gap-x-6 gap-y-3 text-sm sm:grid-cols-[8.5rem_1fr]">
        {p.record && (
          <>
            <dt className="text-muted">Record</dt>
            <dd className="break-all font-mono text-xs" dir="ltr">
              {p.record.split("\t").map((part, i) => (
                <span key={i}>
                  {i > 0 && <span className="px-1.5 text-oak">⇥</span>}
                  <bdi>{part}</bdi>
                </span>
              ))}
            </dd>
          </>
        )}
        <dt className="text-muted">Dataset</dt>
        <dd>
          {p.sourceUrl ? (
            <a href={p.sourceUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-sienna underline">
              {p.source} <ExternalLink size={11} />
            </a>
          ) : (
            p.dataset
          )}
        </dd>
        {p.upstream && (
          <>
            <dt className="text-muted">Upstream source</dt>
            <dd className="text-xs leading-relaxed text-ink/80">{p.upstream}</dd>
          </>
        )}
        {p.licence && (
          <>
            <dt className="text-muted">Licence</dt>
            <dd>{p.licence}</dd>
          </>
        )}
        <dt className="text-muted">Status</dt>
        <dd className="space-y-1">
          <VerificationBadge status={p.attestation} />
          <p className="text-xs text-ink/75">{p.verification}</p>
        </dd>
        {analysis.schemaIssues.length > 0 && (
          <>
            <dt className="text-muted">Tag validation</dt>
            <dd className="space-y-1 text-xs">
              {analysis.schemaIssues.map((s) =>
                s.status === "anomaly" ? (
                  <p key={s.atom} className="text-sienna">
                    <span className="font-mono font-semibold">{s.atom}</span>: fits no UniMorph schema template. Stored verbatim; likely a source annotation
                    or typographical issue. Records with this tag are excluded from the experiment.
                  </p>
                ) : (
                  <p key={s.atom} className="text-ink/75">
                    <span className="font-mono font-semibold">{s.atom}</span>: not in the published UniMorph schema lists, but used in {s.count.toLocaleString("en")} records of
                    this dataset, so treated as a dataset convention.
                  </p>
                ),
              )}
            </dd>
          </>
        )}
      </dl>
      {Object.keys(analysis.features).length > 0 && (
        <div className="mt-5 border-t border-line pt-4">
          <p className="eyebrow mb-2">Features as stored</p>
          <FeatureTable features={analysis.features} unimorph={analysis.segmentation === "auto" ? analysis.tag : undefined} />
        </div>
      )}
    </section>
  );
}
