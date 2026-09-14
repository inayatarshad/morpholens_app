/**
 * Rule-based consistency audit of source records (Romanian nouns and adjectives).
 *
 *   Number  indefinite articles and definite endings that are unambiguous for number;
 *   Gender  adjective endings that are unambiguous for gender (-ă and definite -a, -ei are
 *           feminine singular; definite -ul(ui) is masculine/neuter singular; definite -ii is
 *           masculine plural). Neuter adjectives agree like masculines in the singular and
 *           like feminines in the plural, so -ă is never neuter.
 *
 * A rule fires only when its cue is present and the cue ending is not already part of the
 * lemma. Most records have no such cue, so the absence of a flag is not a claim that the
 * record is correct, and dimensions other than Number and adjective Gender are not audited.
 *
 * Self-contained (no imports) so scripts can load it with Node's type stripping.
 */

export type AuditField = "Number" | "Gender";

export type AuditResult = {
  conflict: boolean;
  field: AuditField;
  source: string;
  expected: string;
  cue: string;
};

const SG_ARTICLES = ["o", "un", "unei", "unui"];
const PL_ARTICLES = ["niște", "nişte", "unor"];

function parse(lemma: string, form: string, tag: string) {
  const f = tag.split(";");
  const words = form.trim().split(/\s+/);
  const head = words[words.length - 1];
  return {
    f,
    words,
    head,
    def: f.includes("DEF"),
    genDat: f.includes("GEN/DAT") || f.includes("DAT/GEN"),
    nomAcc: f.includes("NOM/ACC"),
    ends: (x: string) => head.length > x.length && head.endsWith(x) && !lemma.endsWith(x),
  };
}

/** Number tag vs. article / definite-ending cues. */
export function auditRecord(lang: string, lemma: string, form: string, tag: string): AuditResult | null {
  if (lang !== "ron") return null;
  const { f, words, def, genDat, nomAcc, ends } = parse(lemma, form, tag);
  if (!f.includes("N") && !f.includes("ADJ")) return null;
  const source = f.includes("SG") ? "SG" : f.includes("PL") ? "PL" : null;
  if (!source) return null;

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

/** Adjective Gender tag vs. unambiguous gender endings. */
export function auditGender(lang: string, lemma: string, form: string, tag: string): AuditResult | null {
  if (lang !== "ron") return null;
  const { f, words, def, genDat, nomAcc, ends } = parse(lemma, form, tag);
  if (!f.includes("ADJ") || words.length > 1) return null;
  const source = ["MASC", "FEM", "NEUT"].find((g) => f.includes(g));
  if (!source) return null;

  let expected: string[] | null = null;
  let cue = "";
  if (!def && ends("ă")) [expected, cue] = [["FEM"], "adjective ending “-ă” is feminine singular"];
  else if (def && nomAcc && ends("a")) [expected, cue] = [["FEM"], "definite adjective ending “-a” is feminine singular"];
  else if (def && genDat && ends("ei")) [expected, cue] = [["FEM"], "definite genitive/dative ending “-ei” is feminine singular"];
  else if (def && (ends("ului") || ends("ul"))) [expected, cue] = [["MASC", "NEUT"], "definite ending “-ul(ui)” is masculine/neuter singular"];
  else if (def && nomAcc && ends("ii")) [expected, cue] = [["MASC"], "definite plural ending “-ii” is masculine"];

  if (!expected) return null;
  return { conflict: !expected.includes(source), field: "Gender", source, expected: expected.join(" or "), cue };
}

/** Every audit finding (consistent or conflicting) that applies to a record. */
export function auditAll(lang: string, lemma: string, form: string, tag: string): AuditResult[] {
  return [auditRecord(lang, lemma, form, tag), auditGender(lang, lemma, form, tag)].filter((x): x is AuditResult => x !== null);
}
