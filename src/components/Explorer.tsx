"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ExternalLink, FileQuestion, TriangleAlert } from "lucide-react";
import { languageById, languages } from "@/data/languages";
import { qualityNotes, sourceFor, statsFor, unimorph } from "@/data/unimorph";
import type { LanguageId } from "@/data/types";
import { findAnalyses, suggestions } from "@/lib/analysis";
import { LanguageSelector } from "./LanguageSelector";
import { MorphologyInput } from "./MorphologyInput";
import { MorphologyAnalysis } from "./MorphologyAnalysis";

const isLang = (v: string | null): v is LanguageId => !!v && languages.some((l) => l.id === v);
const fmt = (n: number) => n.toLocaleString("en");

export function Explorer() {
  const params = useSearchParams();
  const router = useRouter();
  const paramLang = params.get("lang");
  const initialLang: LanguageId = isLang(paramLang) ? paramLang : "tur";
  const initialQ = params.get("q") ?? suggestions(initialLang)[0]?.query ?? "";

  const [lang, setLang] = useState<LanguageId>(initialLang);
  const [draft, setDraft] = useState(initialQ);
  const [query, setQuery] = useState(initialQ);
  const [pick, setPick] = useState(0);

  const language = languageById[lang];
  const analyses = useMemo(() => findAnalyses(lang, query), [lang, query]);
  const active = analyses[Math.min(pick, analyses.length - 1)];
  const chips = useMemo(() => suggestions(lang), [lang]);
  const stats = statsFor(lang);
  const src = sourceFor(lang);
  const notes = qualityNotes[lang] ?? [];
  const sample = unimorph.languages[lang];

  useEffect(() => {
    const qs = new URLSearchParams({ lang, ...(query ? { q: query } : {}) });
    router.replace(`/explore?${qs.toString()}`, { scroll: false });
  }, [lang, query, router]);

  const analyse = (w: string) => {
    setDraft(w);
    setQuery(w);
    setPick(0);
  };

  return (
    <div className="grid gap-8 lg:grid-cols-[16rem_1fr]">
      <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
        <div>
          <p className="eyebrow mb-3">Language</p>
          <LanguageSelector
            value={lang}
            onChange={(id) => {
              setLang(id);
              analyse(suggestions(id)[0]?.query ?? "");
            }}
          />
        </div>
        <div className="hidden space-y-3 rounded-lg border border-line bg-oak-soft/50 p-4 text-xs leading-relaxed text-ink/75 lg:block">
          <p className="eyebrow !text-bush">Data</p>
          <dl className="grid grid-cols-2 gap-y-1">
            <dt className="text-muted">Triples</dt><dd className="text-right font-mono">{fmt(stats.triples)}</dd>
            <dt className="text-muted">Lemmas</dt><dd className="text-right font-mono">{fmt(stats.lemmas)}</dd>
            <dt className="text-muted">Bundles</dt><dd className="text-right font-mono">{fmt(stats.bundles)}</dd>
          </dl>
          <a href={src.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-sienna underline">
            {src.label} <ExternalLink size={11} />
          </a>
          <p className="border-t border-line pt-3 text-muted">{language.profile}</p>
        </div>
      </aside>

      <div className="min-w-0 space-y-6">
        <div>
          <p className="eyebrow mb-3">Analyse a word · {language.name}</p>
          <MorphologyInput value={draft} onChange={setDraft} onSubmit={() => analyse(draft)} placeholder={chips[0]?.label ?? "Type a form…"} />
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className="text-xs text-muted">Examples:</span>
            {chips.map((s) => {
              const on = active && (active.surface === s.label || active.romanization === s.query);
              return (
                <button
                  key={s.label}
                  onClick={() => analyse(s.query)}
                  title={s.kind === "hand" ? "Hand-annotated segmentation" : "UniMorph form"}
                  className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm transition ${
                    on ? "border-sienna bg-sienna text-ivory" : "border-line-strong bg-ivory/70 text-bush hover:border-bush"
                  }`}
                >
                  <span className={language.direction === "rtl" ? "urdu text-base leading-none" : "font-serif"}>{s.label}</span>
                  {s.kind === "hand" && <span className="font-mono text-[0.55rem] tracking-wider opacity-70">SEG</span>}
                </button>
              );
            })}
          </div>
          <p className="mt-2 text-xs text-muted">
            Searchable offline: {fmt(sample.entries.length)} UniMorph forms of {sample.featured.length} featured lemmas
            {" "}(of {fmt(stats.triples)} in the full file) plus hand-annotated entries. <span className="font-mono">SEG</span> = gold segmentation.
          </p>
        </div>

        {notes.length > 0 && (
          <div className="space-y-2">
            {notes.map((n) => (
              <div key={n.title} className="flex gap-3 rounded-lg border border-sienna/40 bg-sienna/[0.06] px-4 py-3 text-sm">
                <TriangleAlert size={16} className="mt-0.5 shrink-0 text-sienna" />
                <p>
                  <span className="font-semibold text-sienna">Data-quality note · {n.title}.</span> <span className="text-ink/80">{n.body}</span>
                </p>
              </div>
            ))}
          </div>
        )}

        {analyses.length > 1 && (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-muted">{analyses.length} analyses for this form:</span>
            {analyses.map((a, i) => (
              <button
                key={a.id}
                onClick={() => setPick(i)}
                className={`rounded-md border px-2.5 py-1 font-mono text-[0.7rem] transition ${
                  i === pick ? "border-bush bg-bush text-ivory" : "border-line-strong bg-ivory text-bush hover:border-bush"
                }`}
              >
                {a.segmentation === "hand" ? "hand-annotated" : a.tag}
              </button>
            ))}
          </div>
        )}

        {active ? (
          <MorphologyAnalysis analysis={active} language={language} onSelect={analyse} />
        ) : (
          <div className="rise rounded-xl border border-dashed border-line-strong bg-ivory/60 p-10 text-center">
            <FileQuestion className="mx-auto text-sienna" size={28} />
            <p className="display display-sm mt-3 text-bush">Not in the local UniMorph sample.</p>
            <p className="mx-auto mt-2 max-w-lg text-sm text-muted">
              MorphoLens runs no open-ended analyser: it returns only analyses that exist in the shipped data, each with its
              verbatim source record. Try one of the examples above.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
