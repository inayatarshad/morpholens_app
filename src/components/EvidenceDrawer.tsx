"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { ExternalLink, FileSearch, X } from "lucide-react";
import { languageById } from "@/data/languages";
import type { LanguageId } from "@/data/types";
import type { Provenance } from "@/lib/analysis";
import { VerificationBadge } from "./VerificationBadge";

export type Evidence = {
  form: string;
  romanization?: string;
  languageId: LanguageId;
  features?: Record<string, string>;
  tag?: string;
  provenance: Provenance;
};

const EvidenceContext = createContext<{ open: (e: Evidence) => void }>({ open: () => {} });

export const useEvidence = () => useContext(EvidenceContext);

export function EvidenceProvider({ children }: { children: React.ReactNode }) {
  const [evidence, setEvidence] = useState<Evidence | null>(null);
  const open = useCallback((e: Evidence) => setEvidence(e), []);

  useEffect(() => {
    const onKey = (ev: KeyboardEvent) => ev.key === "Escape" && setEvidence(null);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const lang = evidence ? languageById[evidence.languageId] : null;
  const p = evidence?.provenance;

  return (
    <EvidenceContext.Provider value={{ open }}>
      {children}
      <div
        className={`fixed inset-0 z-50 bg-bush/30 backdrop-blur-[2px] transition-opacity ${evidence ? "opacity-100" : "pointer-events-none opacity-0"}`}
        onClick={() => setEvidence(null)}
        aria-hidden
      />
      <aside
        role="dialog"
        aria-label="Data evidence"
        aria-hidden={!evidence}
        className={`fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col border-l border-line-strong bg-ivory shadow-2xl transition-transform duration-300 ${
          evidence ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {evidence && lang && p && (
          <>
            <div className="flex items-center justify-between border-b border-line px-6 py-4">
              <span className="eyebrow flex items-center gap-2 !text-bush">
                <FileSearch size={14} /> Data evidence
              </span>
              <button onClick={() => setEvidence(null)} className="rounded p-1 text-muted hover:bg-oak-soft" aria-label="Close">
                <X size={18} />
              </button>
            </div>
            <div className="flex-1 space-y-6 overflow-y-auto px-6 py-6">
              <div>
                <p className="eyebrow">Form</p>
                <p className={`mt-1 text-4xl text-bush ${lang.direction === "rtl" ? "urdu text-right" : "display"}`}>{evidence.form}</p>
                {evidence.romanization && <p className="mt-1 font-mono text-sm text-muted">{evidence.romanization}</p>}
              </div>
              <dl className="grid grid-cols-[7rem_1fr] gap-y-3 text-sm">
                <dt className="text-muted">Language</dt>
                <dd>{lang.name} <span className="text-muted">· {lang.family}</span></dd>
                {evidence.tag && (
                  <>
                    <dt className="text-muted">Bundle</dt>
                    <dd className="break-all font-mono text-xs text-bush">{evidence.tag}</dd>
                  </>
                )}
                {evidence.features && Object.keys(evidence.features).length > 0 && (
                  <>
                    <dt className="text-muted">Features</dt>
                    <dd className="flex flex-wrap gap-1">
                      {Object.entries(evidence.features).map(([k, v]) => (
                        <span key={k} className="rounded border border-line bg-cashmere px-1.5 py-0.5 text-[0.7rem]">
                          {k}: {v}
                        </span>
                      ))}
                    </dd>
                  </>
                )}
                <dt className="text-muted">Attestation</dt>
                <dd><VerificationBadge status={p.attestation} /></dd>
                <dt className="text-muted">Source</dt>
                <dd>
                  {p.sourceUrl ? (
                    <a href={p.sourceUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-sienna underline">
                      {p.source} <ExternalLink size={12} />
                    </a>
                  ) : (
                    p.source
                  )}
                </dd>
                <dt className="text-muted">Dataset</dt>
                <dd>{p.dataset}</dd>
                {p.licence && (
                  <>
                    <dt className="text-muted">Licence</dt>
                    <dd>{p.licence}</dd>
                  </>
                )}
              </dl>
              {p.record && (
                <div>
                  <p className="eyebrow mb-2">Verbatim record</p>
                  <pre className="overflow-x-auto rounded-md bg-bush px-3 py-2 font-mono text-xs text-oak">{p.record.replace(/\t/g, "  ⇥  ")}</pre>
                </div>
              )}
              {p.note && <p className="rounded-md border-l-2 border-sienna bg-cashmere px-4 py-3 text-sm text-ink/80">{p.note}</p>}
            </div>
            <p className="border-t border-line px-6 py-4 text-xs text-muted">
              Human-in-the-loop: UniMorph attestation is not the same as expert validation. Check with a speaker or linguist before relying on a form.
            </p>
          </>
        )}
      </aside>
    </EvidenceContext.Provider>
  );
}
