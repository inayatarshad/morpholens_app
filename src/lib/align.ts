/**
 * Alignment-based split of an inflected form against its lemma.
 * Mirrors `extractRule` in scripts/run-experiment.mjs: the longest common substring is
 * treated as the shared stem, material before/after it as prefix/suffix exponents.
 * This is an automatic heuristic — UniMorph provides features, not gold segmentation.
 */
export type Alignment = {
  prefix: string;
  stem: string;
  suffix: string;
  removedPrefix: string;
  removedSuffix: string;
  suppletive: boolean;
};

export function align(lemma: string, form: string): Alignment {
  let best = 0, bi = 0, bj = 0;
  const prev = new Array<number>(form.length + 1).fill(0);
  for (let i = 1; i <= lemma.length; i++) {
    let diag = 0;
    for (let j = 1; j <= form.length; j++) {
      const tmp = prev[j];
      prev[j] = lemma[i - 1] === form[j - 1] ? diag + 1 : 0;
      if (prev[j] > best) {
        best = prev[j];
        bi = i - best;
        bj = j - best;
      }
      diag = tmp;
    }
  }
  if (best === 0) return { prefix: "", stem: form, suffix: "", removedPrefix: "", removedSuffix: "", suppletive: true };
  return {
    prefix: form.slice(0, bj),
    stem: form.slice(bj, bj + best),
    suffix: form.slice(bj + best),
    removedPrefix: lemma.slice(0, bi),
    removedSuffix: lemma.slice(bi + best),
    suppletive: false,
  };
}
