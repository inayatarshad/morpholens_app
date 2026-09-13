/**
 * Rule-based consistency audit of source records.
 *
 * Currently implemented for Romanian nouns and adjectives: the Number tag is compared
 * with high-precision surface cues (indefinite articles, and definite endings that are
 * unambiguous for number). A rule fires only when its cue is present and the cue ending
 * is not already part of the lemma. Most records have no such cue, so the absence of a
 * flag is not a claim that the record is correct.
 *
 * Self-contained (no imports) so scripts can load it with Node's type stripping.
 */

export type AuditResult = {
  conflict: boolean;
  field: "Number";
  source: "SG" | "PL";
  expected: "SG" | "PL";
  cue: string;
};

const SG_ARTICLES = ["o", "un", "unei", "unui"];
const PL_ARTICLES = ["niște", "nişte", "unor"];

export function auditRecord(lang: string, lemma: string, form: string, tag: string): AuditResult | null {
  if (lang !== "ron") return null;
  const f = tag.split(";");
  if (!f.includes("N") && !f.includes("ADJ")) return null;
  const source = f.includes("SG") ? "SG" : f.includes("PL") ? "PL" : null;
  if (!source) return null;

  const words = form.trim().split(/\s+/);
  const head = words[words.length - 1];
  const def = f.includes("DEF");
  const genDat = f.includes("GEN/DAT") || f.includes("DAT/GEN");
  const nomAcc = f.includes("NOM/ACC");
  const ends = (x: string) => head.length > x.length && head.endsWith(x) && !lemma.endsWith(x);

  let expected: "SG" | "PL" | null = null;
  let cue = "";
  if (words.length > 1) {
    const art = words[0];
    if (SG_ARTICLES.includes(art)) [expected, cue] = ["SG", `indefinite article “${art}” is singular`];
    else if (PL_ARTICLES.includes(art)) [expected, cue] = ["PL", `indefinite article “${art}” is plural`];
  } else if (ends("lor") && (def || genDat || f.includes("VOC"))) [expected, cue] = ["PL", "ending “-lor” is plural"];
  else if (def && ends("lui")) [expected, cue] = ["SG", "definite ending “-lui” is singular"];
  else if (def && genDat && ends("ei")) [expected, cue] = ["SG", "definite genitive/dative ending “-ei” is singular"];
  else if (def && nomAcc && ends("ul")) [expected, cue] = ["SG", "definite article “-ul” is singular"];
  else if (def && nomAcc && ends("ii")) [expected, cue] = ["PL", "definite plural ending “-ii”"];
  else if (def && nomAcc && ends("a")) [expected, cue] = ["SG", "feminine definite article “-a” is singular"];

  if (!expected) return null;
  return { conflict: expected !== source, field: "Number", source, expected, cue };
}
