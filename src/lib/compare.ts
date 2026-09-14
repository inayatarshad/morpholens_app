import { comparisonAnnotations, curatedComparisons, entryById } from "@/data/morphology";
import { qualityNotes, unimorph } from "@/data/unimorph";
import type { ComparisonFeature, LanguageId } from "@/data/types";
import { fromCurated, fromTriple, type Analysis } from "./analysis";

export type ComparisonSlot =
  | {
      kind: "unimorph";
      base: string;
      baseTag: string;
      strategy: string;
      position: string;
      variants: string[];
      analysis: Analysis;
      /** hand annotation that replaces the automatic strategy label */
      annotation?: { note: string; source: string };
    }
  | { kind: "reference"; base: string; baseRomanization?: string; strategy: string; position: string; analysis: Analysis }
  | { kind: "none"; reason: string };

/** UniMorph example first; hand-curated reference pattern only where UniMorph has none. */
export function comparisonSlot(lang: LanguageId, feature: ComparisonFeature): ComparisonSlot {
  const g = unimorph.comparisons[lang]?.[feature];
  if (g) {
    const ann = comparisonAnnotations.find((a) => a.languageId === lang && a.feature === feature && a.form === g.target.form);
    return {
      kind: "unimorph",
      base: g.base.form,
      baseTag: g.base.tag,
      strategy: ann?.strategy ?? g.strategy,
      position: ann?.position ?? g.position,
      variants: g.variants ?? [],
      analysis: fromTriple(lang, g.target),
      annotation: ann ? { note: ann.note, source: ann.source } : undefined,
    };
  }
  const c = curatedComparisons.find((x) => x.languageId === lang && x.feature === feature);
  const e = c ? entryById(c.entryId) : undefined;
  if (c && e) {
    return { kind: "reference", base: c.base, baseRomanization: c.baseRomanization, strategy: c.strategy, position: c.position, analysis: fromCurated(e) };
  }
  if (lang === "ron" && feature === "plural") {
    return { kind: "none", reason: `Withheld: ${qualityNotes.ron?.[0]?.title.toLowerCase() ?? "unreliable labels"} in UniMorph ron.` };
  }
  return { kind: "none", reason: `No overtly marked example for this feature in UniMorph ${lang}.` };
}
