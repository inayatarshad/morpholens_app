"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ExternalLink, FileQuestion, Info, LoaderCircle, TriangleAlert } from "lucide-react";
import { languageById, languages } from "@/data/languages";
import { qualityNotes, sourceFor, statsFor, type Triple } from "@/data/unimorph";
import { bundleShort } from "@/data/unimorph-features";
import type { LanguageId } from "@/data/types";
import { conflictsOf, curatedMatches, findAnalyses, fromTriple, markCrossLemma, suggestions, type Analysis } from "@/lib/analysis";
import type { NearMatch, SearchResponse } from "@/lib/search-types";
import { LanguageSelector } from "./LanguageSelector";
import { LemmaPanel } from "./LemmaPanel";
import { MorphologyInput } from "./MorphologyInput";
import { MorphologyAnalysis } from "./MorphologyAnalysis";

const isLang = (v: string | null): v is LanguageId => !!v && languages.some((l) => l.id === v);
const fmt = (n: number) => n.toLocaleString("en");

type Fetched = { key: string; data?: SearchResponse; failed?: boolean };

type View =
  | { mode: "empty" }
  | { mode: "loading"; hand: Analysis[] }
  | { mode: "offline"; analyses: Analysis[] }
  | { mode: "exact" | "loose"; analyses: Analysis[]; otherLemmas: string[]; alternatives: string[]; paradigms: Record<string, Triple[]>; truncated: boolean }
  | { mode: "lemma"; lemmas: string[]; paradigms: Record<string, Triple[]>; looseLemma: boolean }
  | { mode: "none"; near: NearMatch[]; total: number };

function buildView(lang: LanguageId, query: string, cur: Fetched | null): View {
  if (!query.trim()) return { mode: "empty" };
  const hand = curatedMatches(lang, query);
  if (!cur) return { mode: "loading", hand };
  if (cur.failed || !cur.data) return { mode: "offline", analyses: findAnalyses(lang, query) };
  const d = cur.data;
  const cells = (l: string) => d.paradigms[l] ?? [];
  // No analysis is ranked as primary; UniMorph analyses are listed by how many records in the
  // full file carry their bundle (stable sort, so ties keep file order).
  const byBundleCount = (x: Analysis, y: Analysis) => (y.bundleCount ?? 0) - (x.bundleCount ?? 0);
  const exact = markCrossLemma(d.exact.map((t) => fromTriple(lang, t, cells(t.lemma), d.bundleCounts?.[t.tag])).sort(byBundleCount));
  const otherLemmas = d.lemmas.exact.filter((l) => !exact.some((a) => a.lemma === l));
  if (hand.length || exact.length) {
    return { mode: "exact", analyses: [...hand, ...exact], otherLemmas, alternatives: d.alternatives ?? [], paradigms: d.paradigms, truncated: d.truncated };
  }
  if (d.lemmas.exact.length) return { mode: "lemma", lemmas: d.lemmas.exact, paradigms: d.paradigms, looseLemma: false };
  const loose = markCrossLemma(d.loose.map((t) => fromTriple(lang, t, cells(t.lemma), d.bundleCounts?.[t.tag])).sort(byBundleCount));
  if (loose.length) return { mode: "loose", analyses: loose, otherLemmas: [], alternatives: [], paradigms: d.paradigms, truncated: d.truncated };
  if (d.lemmas.loose.length) return { mode: "lemma", lemmas: d.lemmas.loose, paradigms: d.paradigms, looseLemma: true };
  return { mode: "none", near: d.near, total: d.total };
}

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
  const [lemmaFocus, setLemmaFocus] = useState<string | null>(null);
  const [fetched, setFetched] = useState<Fetched | null>(null);

  const q = query.trim();
  const key = `${lang}\u0000${q}`;

  useEffect(() => {
    if (!q) return;
    const ctrl = new AbortController();
    fetch(`/api/search?lang=${lang}&q=${encodeURIComponent(q)}`, { signal: ctrl.signal })
      .then((r) => {
        if (!r.ok) throw new Error(String(r.status));
        return r.json() as Promise<SearchResponse>;
      })
      .then((data) => setFetched({ key, data }))
      .catch(() => {
        if (!ctrl.signal.aborted) setFetched({ key, failed: true });
      });
    return () => ctrl.abort();
  }, [key, lang, q]);

  useEffect(() => {
    const qs = new URLSearchParams({ lang, ...(q ? { q } : {}) });
    router.replace(`/explore?${qs.toString()}`, { scroll: false });
  }, [lang, q, router]);

  const current = fetched?.key === key ? fetched : null;
  const view = useMemo(() => buildView(lang, q, current), [lang, q, current]);

  const language = languageById[lang];
  const chips = useMemo(() => suggestions(lang), [lang]);
  const stats = statsFor(lang);
  const src = sourceFor(lang);
  const notes = qualityNotes[lang] ?? [];

  const analyse = (w: string) => {
    setDraft(w);
    setQuery(w);
    setPick(0);
    setLemmaFocus(null);
  };

  const analyses = view.mode === "exact" || view.mode === "loose" || view.mode === "offline" ? view.analyses : view.mode === "loading" ? view.hand : [];
  const active = analyses.length ? analyses[Math.min(pick, analyses.length - 1)] : undefined;
  const focusCells = lemmaFocus && (view.mode === "exact" || view.mode === "lemma") ? view.paradigms[lemmaFocus] : undefined;

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
          <p className="eyebrow !text-bush">Searching</p>
          <dl className="grid grid-cols-2 gap-y-1">
            <dt className="text-muted">Triples</dt><dd className="text-right font-mono">{fmt(stats.triples)}</dd>
            <dt className="text-muted">Lemmas</dt><dd className="text-right font-mono">{fmt(stats.lemmas)}</dd>
            <dt className="text-muted">Bundles</dt><dd className="text-right font-mono">{fmt(stats.bundles)}</dd>
          </dl>
          <a href={src.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-sienna underline">
            {src.label} <ExternalLink size={11} />
          </a>
          <p className="border-t border-line pt-3 text-muted">
            Exact spelling first (case, Unicode form and keyboard variants unified). Diacritic-insensitive matches are
            shown only when nothing matches exactly, and are labelled.
          </p>
        </div>
      </aside>

      <div className="min-w-0 space-y-6">
        <div>
          <p className="eyebrow mb-3">Search a form or lemma · {language.name}</p>
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
            Searches all {fmt(stats.triples)} UniMorph triples for {language.name} plus hand-annotated entries (<span className="font-mono">SEG</span> = hand segmentation, not expert-reviewed). Source records are retrieved, not generated; alignments and flags are derived from them and labelled as interpretation.
          </p>
        </div>

        {notes.map((n) => (
          <div key={n.title} className="flex gap-3 rounded-lg border border-sienna/40 bg-sienna/[0.06] px-4 py-3 text-sm">
            <TriangleAlert size={16} className="mt-0.5 shrink-0 text-sienna" />
            <p>
              <span className="font-semibold text-sienna">Data-quality note · {n.title}.</span> <span className="text-ink/80">{n.body}</span>
            </p>
          </div>
        ))}

        {view.mode === "loading" && (
          <p className="flex items-center gap-2 text-sm text-muted">
            <LoaderCircle size={15} className="animate-spin" /> Searching {fmt(stats.triples)} triples…
          </p>
        )}

        {view.mode === "offline" && (
          <Notice tone="warn">Full-data search is unavailable right now, so only the bundled sample was searched. A missing result here does not mean the form is absent from UniMorph.</Notice>
        )}

        {view.mode === "loose" && (
          <Notice tone="warn">
            No exact match for “{q}”. Showing {view.analyses.length === 1 ? "1 UniMorph form that matches" : `${view.analyses.length} UniMorph forms that match`} only when diacritics, case and
            transcription details are ignored, so {view.analyses.length === 1 ? "it may be a different word" : "these may be different words"}. Check the spelling before relying on {view.analyses.length === 1 ? "it" : "them"}.
          </Notice>
        )}

        {(view.mode === "exact" || view.mode === "loose") && view.truncated && (
          <Notice tone="info">More than 60 matches; showing the first 60.</Notice>
        )}

        {view.mode === "exact" && view.alternatives.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <span className="text-xs text-muted">Different spelling, same letters ignoring diacritics. Did you mean:</span>
            {view.alternatives.map((f) => (
              <button key={f} onClick={() => analyse(f)} className="rounded-full border border-sienna/40 bg-ivory px-3 py-0.5 text-bush hover:border-sienna">
                <span className={language.direction === "rtl" ? "urdu" : "font-serif"}>{f}</span>
              </button>
            ))}
          </div>
        )}

        {view.mode === "exact" && view.otherLemmas.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <span className="text-xs text-muted">“{q}” is also a lemma:</span>
            {view.otherLemmas.map((l) => (
              <button key={l} onClick={() => setLemmaFocus(lemmaFocus === l ? null : l)} className="rounded-md border border-line-strong bg-ivory px-2.5 py-1 text-bush hover:border-bush">
                {lemmaFocus === l ? "Back to form analysis" : `Open paradigm of ${l}`}
              </button>
            ))}
          </div>
        )}

        {view.mode === "lemma" && (
          <>
            <Notice tone={view.looseLemma ? "warn" : "info"}>
              {view.looseLemma
                ? `No exact match for “${q}”. It matches the lemma below only when diacritics are ignored.`
                : `“${q}” is a lemma (citation form) in UniMorph ${lang}, not one of its listed inflected forms. Showing its full paradigm.`}
            </Notice>
            {view.lemmas.length > 1 && (
              <div className="flex flex-wrap gap-2">
                {view.lemmas.map((l) => (
                  <button key={l} onClick={() => setLemmaFocus(l)} className={`rounded-md border px-2.5 py-1 text-sm ${(lemmaFocus ?? view.lemmas[0]) === l ? "border-bush bg-bush text-ivory" : "border-line-strong bg-ivory text-bush"}`}>
                    {l}
                  </button>
                ))}
              </div>
            )}
            <LemmaPanel key={lemmaFocus ?? view.lemmas[0]} lang={lang} lemma={lemmaFocus ?? view.lemmas[0]} cells={view.paradigms[lemmaFocus ?? view.lemmas[0]] ?? []} onSelect={analyse} />
          </>
        )}

        {view.mode === "none" && (
          <div className="rise rounded-xl border border-dashed border-line-strong bg-ivory/60 p-8">
            <FileQuestion className="text-sienna" size={26} />
            <p className="display display-sm mt-3 text-bush">No stored record for “{q}” in UniMorph {lang}.</p>
            <p className="mt-2 max-w-2xl text-sm text-muted">
              Searched all {fmt(view.total)} triples, as a form and as a lemma, including diacritic-insensitive matching. Absence from UniMorph
              does not mean the word does not exist; coverage is partial.
            </p>
            {view.near.length > 0 && (
              <div className="mt-5">
                <p className="eyebrow mb-2">Closest attested forms</p>
                <div className="flex flex-wrap gap-2">
                  {view.near.map((n) => (
                    <button key={`${n.form}-${n.tag}`} onClick={() => analyse(n.form)} className="inline-flex items-baseline gap-2 rounded-full border border-line-strong bg-ivory px-3 py-1 text-sm text-bush hover:border-bush">
                      <span className={language.direction === "rtl" ? "urdu" : "font-serif"}>{n.form}</span>
                      <span className="font-mono text-[0.6rem] text-muted">edit {n.distance}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {view.mode === "offline" && analyses.length === 0 && (
          <p className="text-sm text-muted">No match in the bundled sample.</p>
        )}

        {analyses.length > 1 && !focusCells && (
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs text-muted">{analyses.length} analyses for this form:</span>
              {analyses.map((a, i) => (
                <button
                  key={a.id}
                  onClick={() => setPick(i)}
                  className={`inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 font-mono text-[0.7rem] transition ${
                    i === pick ? "border-bush bg-bush text-ivory" : "border-line-strong bg-ivory text-bush hover:border-bush"
                  }`}
                  title={a.tag}
                >
                  {a.segmentation === "hand" ? (
                    "hand-annotated"
                  ) : (
                    <>
                      {new Set(analyses.map((x) => x.lemma)).size > 1 && <bdi className="font-sans">{a.lemma}</bdi>}
                      <span>{a.tag ? bundleShort(a.tag) : ""}</span>
                      {(conflictsOf(a).length > 0 || a.schemaIssues.some((s) => s.status === "anomaly")) && <TriangleAlert size={11} aria-label="Flagged record" />}
                    </>
                  )}
                </button>
              ))}
            </div>
            <p className="text-[0.7rem] text-muted">
              None is marked primary. UniMorph analyses are listed by how many records in the full {language.name} file carry each bundle; context decides which applies.
            </p>
          </div>
        )}

        {focusCells && lemmaFocus && view.mode === "exact" ? (
          <LemmaPanel key={lemmaFocus} lang={lang} lemma={lemmaFocus} cells={focusCells} onSelect={analyse} />
        ) : (
          active && <MorphologyAnalysis analysis={active} language={language} onSelect={analyse} />
        )}
      </div>
    </div>
  );
}

function Notice({ tone, children }: { tone: "warn" | "info"; children: React.ReactNode }) {
  return (
    <div className={`flex gap-3 rounded-lg border px-4 py-3 text-sm ${tone === "warn" ? "border-sienna/50 bg-sienna/[0.07] text-ink" : "border-bush/20 bg-bush/[0.05] text-ink"}`}>
      {tone === "warn" ? <TriangleAlert size={16} className="mt-0.5 shrink-0 text-sienna" /> : <Info size={16} className="mt-0.5 shrink-0 text-bush" />}
      <p>{children}</p>
    </div>
  );
}
