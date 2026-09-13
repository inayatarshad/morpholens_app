import { entries as curated } from "@/data/morphology";
import { sourceFor, unimorph, type Triple } from "@/data/unimorph";
import { bundleGloss, posLabel, readableFeatures } from "@/data/unimorph-features";
import type { Attestation, DifficultyTag, LanguageId, Morpheme, MorphologicalEntry, ParadigmEntry } from "@/data/types";
import { align } from "./align";
import { normalise } from "./lookup";

export type Provenance = {
  attestation: Attestation;
  source: string;
  sourceUrl?: string;
  dataset: string;
  note?: string;
  licence?: string;
  /** Verbatim UniMorph line, when the analysis comes from UniMorph. */
  record?: string;
};

/** One analysis of one surface form — the single shape every view renders. */
export type Analysis = {
  id: string;
  languageId: LanguageId;
  surface: string;
  romanization?: string;
  lemma: string;
  lemmaRomanization?: string;
  pos: string;
  tag?: string;
  features: Record<string, string>;
  morphemes: Morpheme[];
  segmentation: "hand" | "auto";
  gloss?: string;
  translation?: string;
  paradigm: ParadigmEntry[];
  difficulty: DifficultyTag[];
  difficultyNotes: Partial<Record<DifficultyTag, string>>;
  provenance: Provenance;
};

export function fromCurated(e: MorphologicalEntry): Analysis {
  return {
    id: e.id,
    languageId: e.languageId,
    surface: e.surface,
    romanization: e.romanization,
    lemma: e.lemma,
    lemmaRomanization: e.lemmaRomanization,
    pos: e.pos,
    tag: e.unimorph,
    features: e.features,
    morphemes: e.morphemes,
    segmentation: "hand",
    gloss: e.gloss,
    translation: e.translation,
    paradigm: e.paradigm ?? [],
    difficulty: e.difficulty ?? [],
    difficultyNotes: e.difficultyNotes ?? {},
    provenance: {
      attestation: e.attestation,
      source: e.source,
      sourceUrl: e.sourceUrl,
      dataset: e.attestation === "unimorph" ? `Hand-annotated segmentation · triple attested in ${sourceFor(e.languageId).label}` : "Hand-annotated segmentation (MorphoLens)",
      note: e.note,
    },
  };
}

const sample = (lang: LanguageId) => unimorph.languages[lang].entries;

function segmentsOf(t: Triple): string[] {
  const a = align(t.lemma, t.form);
  if (a.suppletive) return [t.form];
  return [a.prefix.trim(), a.stem, a.suffix.trim()].filter(Boolean);
}

function morphemesFor(t: Triple): Morpheme[] {
  const a = align(t.lemma, t.form);
  const g = bundleGloss(t.tag) || "—";
  if (a.suppletive) return [{ form: t.form, gloss: g, meaning: "whole-form replacement (no material shared with the lemma)", role: "word" }];
  const out: Morpheme[] = [];
  const pre = a.prefix, suf = a.suffix;
  if (pre) {
    const word = /\s/.test(pre);
    out.push({
      form: word ? pre.trim() : `${pre}-`,
      gloss: suf ? "EXP" : g,
      meaning: word ? "separate word preceding the stem" : suf ? "prefixal part of the exponent" : "prefixal exponent of the bundle",
      role: word ? "particle" : "prefix",
    });
  }
  out.push({
    form: a.stem,
    gloss: "STEM",
    meaning: a.removedPrefix || a.removedSuffix ? `shared with lemma “${t.lemma}” (lemma material replaced)` : `shared with lemma “${t.lemma}”`,
    role: "stem",
  });
  if (suf) {
    const word = /\s/.test(suf);
    out.push({
      form: word ? suf.trim() : `-${suf}`,
      gloss: g,
      meaning: word ? "separate word following the stem" : pre ? "suffixal part of the exponent" : "suffixal exponent of the bundle",
      role: word ? "particle" : "suffix",
    });
  }
  return out;
}

export function fromTriple(lang: LanguageId, t: Triple): Analysis {
  const src = sourceFor(lang);
  const cells = sample(lang).filter((c) => c.lemma === t.lemma);
  const a = align(t.lemma, t.form);
  const difficulty: DifficultyTag[] = [];
  const notes: Partial<Record<DifficultyTag, string>> = {};

  const others = cells.filter((c) => c.form === t.form && c.tag !== t.tag).map((c) => c.tag);
  if (others.length) {
    difficulty.push("SYNCRETISM");
    notes.SYNCRETISM = `UniMorph also lists this form as ${others.join(", ")}.`;
  }
  if (/\s/.test(t.form) && !/\s/.test(t.lemma)) {
    difficulty.push("PERIPHRASIS");
    notes.PERIPHRASIS = "UniMorph records this cell as a multi-word form.";
  }
  if (!a.suppletive && (a.removedPrefix || a.removedSuffix)) {
    difficulty.push("STEM_CHANGE");
    notes.STEM_CHANGE = `Lemma material “${[a.removedPrefix, a.removedSuffix].filter(Boolean).join("…")}” is replaced, not just added to.`;
  }
  const nFeats = t.tag.split(";").length - 1;
  if (nFeats >= 4 && a.suffix.length >= 4) {
    difficulty.push("LONG_MORPHEME_CHAIN");
    notes.LONG_MORPHEME_CHAIN = `${nFeats} features realised in the exponent “${a.suffix.trim()}”.`;
  }

  return {
    id: `${lang}:${t.lemma}:${t.form}:${t.tag}`,
    languageId: lang,
    surface: t.form,
    lemma: t.lemma,
    pos: posLabel(t.tag),
    tag: t.tag,
    features: readableFeatures(t.tag),
    morphemes: morphemesFor(t),
    segmentation: "auto",
    gloss: bundleGloss(t.tag),
    paradigm: cells.map((c) => ({ surface: c.form, features: readableFeatures(c.tag), tag: c.tag, segmentation: segmentsOf(c) })),
    difficulty,
    difficultyNotes: notes,
    provenance: {
      attestation: "unimorph",
      source: src.label,
      sourceUrl: src.url,
      dataset: `UniMorph · ${src.repo.replace("https://github.com/", "")}`,
      note: src.summary,
      licence: src.licence,
      record: `${t.lemma}\t${t.form}\t${t.tag}`,
    },
  };
}

/** Hand-annotated analyses first, then every UniMorph bundle the form realises. */
export function findAnalyses(lang: LanguageId, query: string): Analysis[] {
  const q = normalise(query);
  if (!q) return [];
  const hand = curated
    .filter((e) => e.languageId === lang && [e.surface, e.romanization, ...(e.aliases ?? [])].some((c) => c && normalise(c) === q))
    .map(fromCurated);
  const um = sample(lang)
    .filter((t) => normalise(t.form) === q)
    .map((t) => fromTriple(lang, t));
  return [...hand, ...um];
}

export function suggestions(lang: LanguageId): { label: string; query: string; kind: "hand" | "unimorph" }[] {
  const out: { label: string; query: string; kind: "hand" | "unimorph" }[] = curated
    .filter((e) => e.languageId === lang)
    .map((e) => ({ label: e.surface, query: e.romanization ?? e.surface, kind: "hand" as const }));
  for (const lemma of unimorph.languages[lang].featured) {
    const cells = sample(lang).filter((t) => t.lemma === lemma && t.form !== lemma && t.form.length <= 20 && !/\s/.test(t.form));
    const best = cells.sort((a, b) => b.tag.split(";").length - a.tag.split(";").length || b.form.length - a.form.length)[0];
    if (best && !out.some((o) => o.label === best.form)) out.push({ label: best.form, query: best.form, kind: "unimorph" });
  }
  return out.slice(0, 11);
}

export const toEvidence = (a: Analysis) => ({
  form: a.surface,
  romanization: a.romanization,
  languageId: a.languageId,
  features: a.features,
  tag: a.tag,
  provenance: a.provenance,
});
