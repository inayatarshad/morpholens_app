"use client";

import { Database, ExternalLink, FileSearch } from "lucide-react";
import type { MorphologicalEntry } from "@/data/types";
import { VerificationBadge } from "./VerificationBadge";
import { useEvidence } from "./EvidenceDrawer";

export function DataProvenance({ entry }: { entry: MorphologicalEntry }) {
  const { open } = useEvidence();
  return (
    <section className="rounded-xl border border-line bg-oak-soft/60 p-6">
      <div className="flex items-center justify-between gap-3">
        <p className="eyebrow flex items-center gap-2 !text-bush">
          <Database size={13} /> Data provenance
        </p>
        <button
          onClick={() =>
            open({
              form: entry.surface,
              romanization: entry.romanization,
              languageId: entry.languageId,
              features: entry.features,
              source: entry.source,
              sourceUrl: entry.sourceUrl,
              dataset: entry.dataset,
              verified: entry.verified,
              note: entry.verificationNote,
              crossCheck: entry.crossCheck,
            })
          }
          className="inline-flex items-center gap-1 text-xs text-sienna hover:underline"
        >
          <FileSearch size={13} /> Open evidence
        </button>
      </div>
      <dl className="mt-4 grid gap-x-6 gap-y-3 text-sm sm:grid-cols-[9rem_1fr]">
        <dt className="text-muted">Source</dt>
        <dd className="text-ink">{entry.source ?? "—"}</dd>
        <dt className="text-muted">Verification status</dt>
        <dd className="flex flex-wrap items-center gap-2">
          <VerificationBadge verified={entry.verified} />
          <span className="text-xs text-muted">{entry.verificationNote}</span>
        </dd>
        <dt className="text-muted">Dataset / reference</dt>
        <dd>
          {entry.dataset}
          {entry.crossCheck && (
            <>
              {" · cross-check target: "}
              <a href={entry.crossCheck.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-sienna underline">
                {entry.crossCheck.label} <ExternalLink size={11} />
              </a>
            </>
          )}
        </dd>
        <dt className="text-muted">Record ID</dt>
        <dd className="font-mono text-xs">{entry.id}</dd>
      </dl>
    </section>
  );
}
