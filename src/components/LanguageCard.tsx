import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { statsFor } from "@/data/unimorph";
import type { Language } from "@/data/types";

const accents: Record<string, string> = {
  tur: "bg-sienna",
  urd: "bg-oak",
  evn: "bg-bush",
  ckt: "bg-burgundy",
  ron: "bg-sienna-soft",
};

export function LanguageCard({ language }: { language: Language }) {
  const s = statsFor(language.id);
  return (
    <Link
      href={`/explore?lang=${language.id}`}
      className="group relative flex flex-col overflow-hidden rounded-xl border border-line bg-ivory/80 p-5 transition hover:-translate-y-0.5 hover:border-bush/40 hover:shadow-[0_12px_30px_-18px_rgba(16,46,40,0.45)]"
    >
      <span className={`absolute inset-x-0 top-0 h-1 ${accents[language.id]}`} />
      <div className="flex items-start justify-between">
        <span className="font-mono text-[0.68rem] tracking-[0.18em] text-muted">{language.iso.toUpperCase()}</span>
        <ArrowUpRight size={16} className="text-muted transition group-hover:text-sienna" />
      </div>
      <p className="mt-6 text-[0.8rem] font-semibold tracking-[0.22em] text-bush">{language.name.toUpperCase()}</p>
      <p className={`min-h-[2.5rem] text-2xl text-bush/80 ${language.direction === "rtl" ? "urdu" : "font-serif italic"}`}>{language.nativeName ?? ""}</p>
      <dl className="mt-auto space-y-1 pt-5 text-sm">
        <div className="flex justify-between gap-2"><dt className="text-muted">Family</dt><dd className="text-right">{language.family}</dd></div>
        <div className="flex justify-between gap-2"><dt className="text-muted">Resources</dt><dd className="text-right">{language.resourceLevel}</dd></div>
        <div className="flex justify-between gap-2 border-t border-line pt-2"><dt className="text-muted">UniMorph triples</dt><dd className="font-mono">{s.triples.toLocaleString("en")}</dd></div>
        <div className="flex justify-between gap-2"><dt className="text-muted">Lemmas</dt><dd className="font-mono">{s.lemmas.toLocaleString("en")}</dd></div>
      </dl>
    </Link>
  );
}
