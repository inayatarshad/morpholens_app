/**
 * Surface alignment of an inflected form against its lemma.
 *
 * This is an automatic, character-level heuristic, not a morpheme segmentation:
 * UniMorph records lemma, form and feature bundle, never morpheme boundaries. The
 * alignment tries, in order:
 *   1. the form contains the citation stem unchanged (pure affixation): confidence high;
 *   2. one stem segment alternates (casă ~ case-, kitap ~ kitab-, merge ~ mers-):
 *      medium if the stem variant also occurs in other forms of the paradigm, else low;
 *   3. only a longest shared stretch can be found: low;
 *   4. nothing is shared (suppletion): no split at all.
 *
 * Self-contained (no imports) so scripts can load it with Node's type stripping.
 */

export type AlignConfidence = "high" | "medium" | "low" | "none";
export type AlignMethod =
  | "identity"
  | "suffixation"
  | "prefixation"
  | "circumfixation"
  | "ending-replacement"
  | "stem-variant"
  | "truncation"
  | "substring"
  | "suppletion";

export type SurfaceAlignment = {
  /** separate words before / after the head word (articles, particles, pronouns) */
  before: string[];
  after: string[];
  prefix: string;
  stem: string;
  suffix: string;
  lemmaHead: string;
  citationStem: string;
  /** the segment that alternates between citation stem and stem variant */
  alternation?: { from: string; to: string };
  /** other forms of the paradigm that begin with the same stem variant */
  support: string[];
  /** lemma material that does not appear in the form */
  removed: string;
  method: AlignMethod;
  confidence: AlignConfidence;
};

/** Citation endings removed before alignment (infinitive / masculine -ā markers). */
const CITATION_ENDINGS: Record<string, Record<string, RegExp>> = {
  tur: { V: /m[ae]k$/ },
  urd: { V: /نا$/, N: /ا$/ },
  ron: { V: /(ea|a|e|i|î)$/ },
};

export function citationStem(word: string, lang: string, pos: string): string {
  const re = CITATION_ENDINGS[lang]?.[pos];
  if (!re || !re.test(word)) return word;
  const s = word.replace(re, "");
  return s.length >= 2 ? s : word;
}

function commonPrefix(a: string, b: string): number {
  let i = 0;
  while (i < a.length && i < b.length && a[i] === b[i]) i++;
  return i;
}

function longestCommonSubstring(a: string, b: string): { i: number; j: number; len: number } {
  let best = { i: 0, j: 0, len: 0 };
  const prev = new Array<number>(b.length + 1).fill(0);
  for (let i = 1; i <= a.length; i++) {
    let diag = 0;
    for (let j = 1; j <= b.length; j++) {
      const tmp = prev[j];
      prev[j] = a[i - 1] === b[j - 1] ? diag + 1 : 0;
      if (prev[j] > best.len) best = { i: i - prev[j], j: j - prev[j], len: prev[j] };
      diag = tmp;
    }
  }
  return best;
}

function headIndex(words: string[], lemmaHead: string): number {
  let best = words.length - 1;
  let bestLen = -1;
  words.forEach((w, i) => {
    const len = longestCommonSubstring(w, lemmaHead).len;
    if (len > bestLen) {
      bestLen = len;
      best = i;
    }
  });
  return best;
}

/** The word of a (possibly multi-word) form that corresponds to the lemma. */
export function headWord(form: string, lemma: string): string {
  const words = form.split(/\s+/);
  const lw = lemma.split(/\s+/);
  return words[headIndex(words, lw[lw.length - 1])];
}

/**
 * @param paradigmHeads head words of the other forms of the same lemma (see headWord),
 *   used to check whether a stem variant recurs in the paradigm.
 */
export function alignSurface(lemma: string, form: string, lang: string, pos: string, paradigmHeads: string[] = []): SurfaceAlignment {
  const lemmaWords = lemma.split(/\s+/);
  const lh = lemmaWords[lemmaWords.length - 1];
  const words = form.split(/\s+/);
  const hi = headIndex(words, lh);
  const h = words[hi];
  const cs = citationStem(lh, lang, pos);
  const base = {
    before: words.slice(0, hi),
    after: words.slice(hi + 1),
    lemmaHead: lh,
    citationStem: cs,
    support: [] as string[],
    removed: "",
    prefix: "",
    suffix: "",
  };

  if (h === lh) {
    return cs !== lh
      ? { ...base, stem: cs, suffix: lh.slice(cs.length), method: "identity", confidence: "high" }
      : { ...base, stem: h, method: "identity", confidence: "high" };
  }
  if (cs.length >= 2 && h.startsWith(cs)) return { ...base, stem: cs, suffix: h.slice(cs.length), method: "suffixation", confidence: "high" };

  // one alternating segment in the stem (final or internal)
  const d = commonPrefix(h, cs);
  if (d >= 1 && d < cs.length && h.length > d) {
    const restCs = cs.slice(d + 1);
    if (h.slice(d + 1).startsWith(restCs) && (restCs.length > 0 || d >= 2)) {
      const alternation = { from: cs[d], to: h[d] };
      if (restCs.length === 0 && h.length === cs.length) {
        return { ...base, stem: cs.slice(0, d), suffix: h.slice(d), removed: cs.slice(d), alternation, method: "ending-replacement", confidence: "medium" };
      }
      const variant = h.slice(0, cs.length);
      const support = [...new Set(paradigmHeads.filter((o) => o !== h && o.startsWith(variant)))];
      return {
        ...base,
        stem: variant,
        suffix: h.slice(cs.length),
        alternation,
        support,
        method: "stem-variant",
        confidence: support.length ? "medium" : "low",
      };
    }
  }

  if (cs.length >= 2 && h.endsWith(cs)) return { ...base, prefix: h.slice(0, h.length - cs.length), stem: cs, method: "prefixation", confidence: "high" };
  const at = cs.length >= 2 ? h.indexOf(cs) : -1;
  if (at > 0) return { ...base, prefix: h.slice(0, at), stem: cs, suffix: h.slice(at + cs.length), method: "circumfixation", confidence: "medium" };
  if (h.length >= 2 && lh.startsWith(h)) return { ...base, stem: h, removed: lh.slice(h.length), method: "truncation", confidence: "low" };

  const m = longestCommonSubstring(h, lh);
  if (m.len >= 2) {
    const removed = [lh.slice(0, m.j), lh.slice(m.j + m.len)].filter(Boolean).join("…");
    return { ...base, prefix: h.slice(0, m.i), stem: h.slice(m.i, m.i + m.len), suffix: h.slice(m.i + m.len), removed, method: "substring", confidence: "low" };
  }
  return { ...base, stem: h, method: "suppletion", confidence: "none" };
}

export const alignmentSegments = (a: SurfaceAlignment): string[] => [...a.before, a.prefix, a.stem, a.suffix, ...a.after].filter(Boolean);
