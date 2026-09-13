"use client";

import { Database, ExternalLink, FileSearch } from "lucide-react";
import { toEvidence, type Analysis } from "@/lib/analysis";
import { VerificationBadge } from "./VerificationBadge";
import { useEvidence } from "./EvidenceDrawer";

export function DataProvenance({ analysis }: { analysis: Analysis }) {
  const { open } = useEvidence();
  const p = analysis.provenance;
  return (
    <section className="rounded-xl border border-line bg-oak-soft/60 p-6">
      <div className="flex items-center justify-between gap-3">
        <p className="eyebrow flex items-center gap-2 !text-bush">
          <Database size={13} /> Data provenance
        </p>
        <button onClick={() => open(toEvidence(analysis))} className="inline-flex items-center gap-1 text-xs text-sienna hover:underline">
          <FileSearch size={13} /> Open evidence
        </button>
      </div>
      <dl className="mt-4 grid gap-x-6 gap-y-3 text-sm sm:grid-cols-[9rem_1fr]">
        <dt className="text-muted">Source</dt>
        <dd>
          {p.sourceUrl ? (
            <a href={p.sourceUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-sienna underline">
              {p.source} <ExternalLink size={11} />
            </a>
          ) : (
            p.source
          )}
        </dd>
        <dt className="text-muted">Attestation</dt>
        <dd className="flex flex-wrap items-center gap-2">
          <VerificationBadge status={p.attestation} />
        </dd>
        <dt className="text-muted">Dataset</dt>
        <dd>{p.dataset}</dd>
        {p.licence && (
          <>
            <dt className="text-muted">Licence</dt>
            <dd>{p.licence}</dd>
          </>
        )}
        {p.record && (
          <>
            <dt className="text-muted">Verbatim record</dt>
            <dd className="break-all font-mono text-xs">{p.record.replace(/\t/g, " ⇥ ")}</dd>
          </>
        )}
        {p.note && (
          <>
            <dt className="text-muted">Note</dt>
            <dd className="text-xs leading-relaxed text-ink/75">{p.note}</dd>
          </>
        )}
      </dl>
    </section>
  );
}
