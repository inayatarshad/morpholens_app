import { entries as curated } from "@/data/morphology";
import { sourceFor, unimorph, type Triple } from "@/data/unimorph";
import { bundleGloss, posLabel, readableFeatures } from "@/data/unimorph-features";
import type { Attestation, DifficultyTag, LanguageId, Morpheme, MorphologicalEntry, ParadigmEntry, TagSource } from "@/data/types";
import { auditRecord, type AuditResult } from "./audit";
import { canonical, loose } from "./lookup";
import { alignSurface, alignmentSegments, headWord, type SurfaceAlignment } from "./stem";

export type Provenance = {
  attestation: Attestation;
  source: string;
  sourceUrl?: string;
  dataset: string;
  /** Where the source itself got the record from (per its documentation). */
  upstream?: string;
  /** What verification MorphoLens can vouch for. */
  verification: string;
  note?: string;
  licence?: string;
  /** Verbatim UniMorph line, when the analysis comes from UniMorph. */
  record?: string;
};

/** One analysis of one surface form: the single shape every view renders. */
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
  /** Automatic surface alignment (UniMorph analyses only). */
  alignment?: SurfaceAlignment;
  /** Consistency audit of the source record (null = no rule applies). */
  audit?: AuditResult | null;
  gloss?: string;
  translation?: string;
  paradigm: ParadigmEntry[];
  /** full = every cell of the lemma in UniMorph; sample = bundled subset; hand = curated. */
  paradigmScope: "full" | "sample" | "hand";
  /** How many records in the full file carry this bundle (used for ordering, not ranking). */
  bundleCount?: number;
  difficulty: DifficultyTag[];
  difficultyNotes: Partial<Record<DifficultyTag, string>>;
  difficultySources: Partial<Record<DifficultyTag, TagSource>>;
  provenance: Provenance;
};

export function fromCurated(e: MorphologicalEntry): Analysis {
  const tags = e.difficulty ?? [];
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
    paradigmScope: "hand",
    difficulty: tags,
    difficultyNotes: e.difficultyNotes ?? {},
    difficultySources: Object.fromEntries(tags.map((t) => [t, "gold" as const])),
    provenance: {
      attestation: e.attestation,
      source: e.source,
      sourceUrl: e.sourceUrl,
      dataset: "MorphoLens hand-annotated entries",
      upstream: e.source,
      verification:
        e.attestation === "unimorph"
          ? "Segmentation hand-annotated from the cited grammar; the same form and bundle are also stored in UniMorph."
          : "Hand-annotated from the cited grammar; this form is not stored in UniMorph.",
      note: e.note,
    },
  };
}

const sample = (lang: LanguageId) => unimorph.languages[lang].entries;
const primaryPos = (tag: string) => {
  const p = posLabel(tag);
  return p === "V.PTCP" || p === "V.CVB" || p === "V.MSDR" ? "V" : p;
};

function conflictText(a: AuditResult): string {
  return `Source tag ${a.source}; ${a.cue}, which suggests ${a.expected}.`;
}

/** Paradigm rows with automatic alignment and audit flags. */
export function paradigmRows(cells: Triple[], lang: LanguageId): ParadigmEntry[] {
  const heads = cells.map((c) => headWord(c.form, c.lemma));
  return cells.map((c) => {
    const al = alignSurface(c.lemma, c.form, lang, primaryPos(c.tag), heads);
    const au = auditRecord(lang, c.lemma, c.form, c.tag);
    return {
      surface: c.form,
      features: readableFeatures(c.tag),
      tag: c.tag,
      segmentation: al.confidence === "none" ? [c.form] : alignmentSegments(al),
      conflict: au?.conflict ? conflictText(au) : undefined,
    };
  });
}

function stemMeaning(al: SurfaceAlignment, lemma: string): string {
  switch (al.method) {
    case "stem-variant":
      return `stem variant of “${lemma}”: ${al.alternation?.from} → ${al.alternation?.to}${
        al.support.length ? `; also begins ${al.support.length} other form${al.support.length > 1 ? "s" : ""} (${al.support.slice(0, 4).join(", ")})` : "; not found in other forms of the paradigm"
      }`;
    case "ending-replacement":
      return `stem of “${lemma}” with final “${al.removed}” replaced`;
    case "truncation":
      return `“${lemma}” without its final “${al.removed}”`;
    case "substring":
      return `longest stretch shared with “${lemma}”; lemma material “${al.removed}” is not accounted for`;
    case "identity":
      return al.suffix ? `stem of “${lemma}” (citation ending removed)` : "the citation form itself";
    default:
      return al.citationStem !== al.lemmaHead ? `stem of “${lemma}” (citation ending “-${al.lemmaHead.slice(al.citationStem.length)}” removed)` : `stem of “${lemma}”, unchanged`;
  }
}

function morphemesFor(t: Triple, al: SurfaceAlignment): Morpheme[] {
  const g = bundleGloss(t.tag) || "∅";
  const lemmaWords = t.lemma.split(/\s+/);
  const word = (w: string): Morpheme => ({
    form: w,
    gloss: lemmaWords.includes(w) ? "LEX" : "WORD",
    meaning: lemmaWords.includes(w) ? "word shared with the lemma" : "separate word recorded as part of the form (article, particle or pronoun)",
    role: lemmaWords.includes(w) ? "word" : "particle",
  });
  const out: Morpheme[] = al.before.map(word);
  if (al.confidence === "none") {
    out.push({ form: al.stem, gloss: g, meaning: "irregular form: no material shared with the lemma, so no automatic split", role: "word" });
  } else {
    if (al.prefix) {
      out.push({ form: `${al.prefix}-`, gloss: al.suffix ? "EXP" : g, meaning: al.suffix ? "prefixal part of the exponent" : `exponent of ${g}`, role: "prefix" });
    }
    out.push({ form: al.suffix ? `${al.stem}-` : al.stem, gloss: "STEM", meaning: stemMeaning(al, t.lemma), role: "stem" });
    if (al.suffix) {
      out.push(
        al.method === "identity"
          ? { form: `-${al.suffix}`, gloss: "CIT", meaning: "citation ending of the lemma", role: "suffix" }
          : { form: `-${al.suffix}`, gloss: g, meaning: `exponent of the whole bundle ${g} (not attributed to individual features)`, role: "suffix" },
      );
    }
  }
  out.push(...al.after.map(word));
  return out;
}

/**
 * Build an analysis for a UniMorph triple. Pass `cells` (the lemma's full paradigm from
 * the search API) for complete paradigm, syncretism and stem-variant evidence; without
 * it the bundled sample is used and the view says so.
 */
export function fromTriple(lang: LanguageId, t: Triple, cells?: Triple[], bundleCount?: number): Analysis {
  const src = sourceFor(lang);
  const list = cells ?? sample(lang).filter((c) => c.lemma === t.lemma);
  const heads = list.map((c) => headWord(c.form, c.lemma));
  const al = alignSurface(t.lemma, t.form, lang, primaryPos(t.tag), heads);
  const audit = auditRecord(lang, t.lemma, t.form, t.tag);
  const difficulty: DifficultyTag[] = [];
  const notes: Partial<Record<DifficultyTag, string>> = {};
  const sources: Partial<Record<DifficultyTag, TagSource>> = {};
  const add = (tag: DifficultyTag, source: TagSource, note: string) => {
    difficulty.push(tag);
    sources[tag] = source;
    notes[tag] = note;
  };

  const others = [...new Set(list.filter((c) => c.form === t.form && c.tag !== t.tag).map((c) => c.tag))];
  if (others.length) add("SYNCRETISM", "data", `The same form of “${t.lemma}” is also stored as ${others.slice(0, 6).join(", ")}${others.length > 6 ? ` and ${others.length - 6} more` : ""}.`);
  // Other forms under the same bundle count as variants only if the audit does not flag them
  // as mislabelled (e.g. Romanian casei is stored as PL but is singular).
  const sameBundle = list.filter((c) => c.tag === t.tag && c.form !== t.form);
  const variants = sameBundle.filter((c) => !auditRecord(lang, c.lemma, c.form, c.tag)?.conflict).map((c) => c.form);
  if (variants.length) add("ORTHOGRAPHIC_VARIATION", "data", `Other forms stored for the same bundle: ${variants.slice(0, 4).join(", ")}.`);
  if (/\s/.test(t.form) && !/\s/.test(t.lemma)) add("PERIPHRASIS", "data", "Stored as a multi-word form.");
  if (al.method === "stem-variant" || al.method === "ending-replacement") {
    add("ALLOMORPHY", "heuristic", `Stem alternation ${al.alternation?.from} → ${al.alternation?.to} (${al.lemmaHead} ~ ${al.stem}-)${al.support.length ? `, recurring in ${al.support.length} other form${al.support.length > 1 ? "s" : ""}` : ""}.`);
  }
  if (al.method === "substring" || al.method === "truncation") add("STEM_CHANGE", "heuristic", `Lemma material “${al.removed}” is replaced or removed and no single consistent alternation was found.`);
  const nFeats = t.tag.split(";").length - 1;
  if (nFeats >= 4 && al.suffix.length >= 4 && al.method !== "identity") add("LONG_MORPHEME_CHAIN", "heuristic", `${nFeats} features realised in the aligned exponent “${al.suffix}”.`);

  return {
    id: `${lang}:${t.lemma}:${t.form}:${t.tag}`,
    languageId: lang,
    surface: t.form,
    lemma: t.lemma,
    pos: posLabel(t.tag),
    tag: t.tag,
    features: readableFeatures(t.tag),
    morphemes: morphemesFor(t, al),
    segmentation: "auto",
    alignment: al,
    audit,
    gloss: bundleGloss(t.tag),
    paradigm: paradigmRows(list, lang),
    paradigmScope: cells ? "full" : "sample",
    bundleCount,
    difficulty,
    difficultyNotes: notes,
    difficultySources: sources,
    provenance: {
      attestation: "unimorph",
      source: src.label,
      sourceUrl: src.url,
      dataset: `UniMorph · ${src.repo.replace("https://github.com/", "")}`,
      upstream: src.upstream,
      verification: "Stored in UniMorph; not independently verified by MorphoLens.",
      note: src.summary,
      licence: src.licence,
      record: `${t.lemma}\t${t.form}\t${t.tag}`,
    },
  };
}

/** Hand-annotated entries matching a query (surface, romanisation or listed alias). */
export function curatedMatches(lang: LanguageId, query: string): Analysis[] {
  const qc = canonical(query, lang);
  const ql = loose(query, lang);
  if (!qc) return [];
  return curated
    .filter((e) => e.languageId === lang && [e.surface, e.romanization, ...(e.aliases ?? [])].some((c) => c && (canonical(c, lang) === qc || loose(c, lang) === ql)))
    .map(fromCurated);
}

/** Offline fallback: hand-annotated entries + the bundled sample (exact, else loose). */
export function findAnalyses(lang: LanguageId, query: string): Analysis[] {
  const qc = canonical(query, lang);
  if (!qc) return [];
  const exact = sample(lang).filter((t) => canonical(t.form, lang) === qc);
  const ql = loose(query, lang);
  const hits = exact.length ? exact : sample(lang).filter((t) => loose(t.form, lang) === ql);
  return [...curatedMatches(lang, query), ...hits.map((t) => fromTriple(lang, t))];
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
