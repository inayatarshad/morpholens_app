"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { FileQuestion, Info } from "lucide-react";
import { languageById, languages } from "@/data/languages";
import { entriesByLanguage } from "@/data/morphology";
import type { LanguageId } from "@/data/types";
import { findEntry } from "@/lib/lookup";
import { LanguageSelector } from "./LanguageSelector";
import { MorphologyInput } from "./MorphologyInput";
import { MorphologyAnalysis } from "./MorphologyAnalysis";
import { VerificationBadge } from "./VerificationBadge";

const defaults: Record<LanguageId, string> = {
  tur: "evlerimizden",
  urd: "larke",
  evn: "дюл",
  ckt: "",
};

const isLang = (v: string | null): v is LanguageId => !!v && languages.some((l) => l.id === v);

export function Explorer() {
  const params = useSearchParams();
  const router = useRouter();
  const initialLang: LanguageId = isLang(params.get("lang")) ? (params.get("lang") as LanguageId) : "tur";
  const initialQ = params.get("q") ?? defaults[initialLang];

  const [lang, setLang] = useState<LanguageId>(initialLang);
  const [draft, setDraft] = useState(initialQ);
  const [query, setQuery] = useState(initialQ);

  const language = languageById[lang];
  const entry = useMemo(() => findEntry(lang, query), [lang, query]);
  const suggestions = entriesByLanguage(lang);

  useEffect(() => {
    const qs = new URLSearchParams({ lang, ...(query ? { q: query } : {}) });
    router.replace(`/explore?${qs.toString()}`, { scroll: false });
  }, [lang, query, router]);

  const analyse = (w: string) => {
    setDraft(w);
    setQuery(w);
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
              analyse(defaults[id]);
            }}
          />
        </div>
        <div className="hidden rounded-lg border border-line bg-oak-soft/50 p-4 text-xs leading-relaxed text-ink/75 lg:block">
          <p className="eyebrow mb-2 !text-bush">Profile</p>
          <p>{language.profile}</p>
          <p className="mt-3 border-t border-line pt-3 text-muted">{language.coverageNote}</p>
        </div>
      </aside>

      <div className="min-w-0 space-y-6">
        <div>
          <p className="eyebrow mb-3">Analyse a word · {language.name}</p>
          <MorphologyInput value={draft} onChange={setDraft} onSubmit={() => setQuery(draft)} placeholder={defaults[lang] || "Type a form…"} />
          {suggestions.length > 0 && (
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <span className="text-xs text-muted">Demo examples:</span>
              {suggestions.map((s) => (
                <button
                  key={s.id}
                  onClick={() => analyse(s.romanization ?? s.surface)}
                  className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm transition ${
                    entry?.id === s.id ? "border-sienna bg-sienna text-ivory" : "border-line-strong bg-ivory/70 text-bush hover:border-bush"
                  }`}
                >
                  <span className={language.direction === "rtl" ? "urdu text-base leading-none" : "font-serif"}>{s.surface}</span>
                  {!s.verified && <span className="font-mono text-[0.58rem] tracking-wider opacity-80">DEMO</span>}
                </button>
              ))}
            </div>
          )}
        </div>

        {entry ? (
          <MorphologyAnalysis entry={entry} language={language} onSelect={analyse} />
        ) : suggestions.length === 0 ? (
          <EmptyLanguage name={language.name} />
        ) : (
          <div className="rise rounded-xl border border-dashed border-line-strong bg-ivory/60 p-10 text-center">
            <FileQuestion className="mx-auto text-sienna" size={28} />
            <p className="display display-sm mt-3 text-bush">No verified analysis is available in the local research dataset.</p>
            <p className="mx-auto mt-2 max-w-lg text-sm text-muted">
              MorphoLens does not run open-ended inference. It only returns analyses stored with provenance. Try one of the
              demo examples above.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function EmptyLanguage({ name }: { name: string }) {
  const template = `{
  id: "ckt-…",
  languageId: "ckt",
  surface: "…",
  lemma: "…",
  pos: "NOUN",
  segmentation: ["…", "…"],
  morphemes: [{ form: "…", gloss: "…", meaning: "…", role: "stem" }],
  features: { Number: "…" },
  source: "…",
  sourceUrl: "…",
  verified: false
}`;
  return (
    <div className="rise grid gap-6 lg:grid-cols-2">
      <div className="rounded-xl border border-dashed border-line-strong bg-ivory/60 p-8">
        <VerificationBadge verified={false} />
        <p className="display display-sm mt-4 text-bush">Example pending linguistic verification</p>
        <p className="mt-3 text-sm leading-relaxed text-ink/75">
          The local dataset contains no {name} forms yet. Rather than inventing morphology, MorphoLens leaves this slot
          empty until an entry can be checked against a dictionary, a UniMorph release, or a speaker/linguist.
        </p>
        <p className="mt-4 flex items-start gap-2 text-xs text-muted">
          <Info size={14} className="mt-0.5 shrink-0" /> Add an entry to <code className="font-mono">src/data/morphology.ts</code> and it appears here, in Compare and in the evidence drawer automatically.
        </p>
      </div>
      <pre className="overflow-x-auto rounded-xl bg-bush p-6 font-mono text-xs leading-relaxed text-oak">{template}</pre>
    </div>
  );
}
