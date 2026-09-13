#!/usr/bin/env node
/**
 * MorphoLens — lemma-overlap experiment on UniMorph data.
 *
 * Task: morphological inflection. Given (lemma, UniMorph feature bundle) predict the
 * inflected form. Metric: exact-match accuracy.
 *
 * Splits (built from the same sampled universe per seed):
 *   random          — items shuffled; test lemmas may also occur in training.
 *   lemma-disjoint  — lemmas shuffled; no test lemma occurs in training.
 *
 * Systems (transparent, non-neural edit-rule learners):
 *   baseline  Atomic-tag rules. Learns lemma→form edit rules keyed by the full feature
 *             bundle as an opaque label; applies the rule of the most similar lemma
 *             (longest shared ending). Unseen bundle ⇒ copies the lemma.
 *   memory    Paradigm memory. If other forms of the test lemma were seen in training,
 *             reinflects from one of them using cell-to-cell rules; otherwise falls back
 *             to the atomic-tag baseline. Benefits directly from lemma overlap.
 *   morph     Feature-aware rules. Same rule learner, but bundles are decomposed into
 *             individual UniMorph features. When the exact bundle is unseen it
 *             (1) inflects the lemma into a seen bundle A and then applies a
 *             feature-difference rule A→T learned from ANY training paradigm that
 *             contains two cells differing by exactly that feature change (e.g. NOM→ABL),
 *             or (2) backs off to the most similar bundle (Jaccard) instead of copying.
 *
 * Usage:  node scripts/run-experiment.mjs <dir-with-unimorph-tsvs>
 * Output: src/data/generated/experiment-results.json
 */
import fs from "node:fs";
import path from "node:path";

const DIR = process.argv[2];
if (!DIR) throw new Error("Usage: node scripts/run-experiment.mjs <unimorph-dir>");

const LANGS = ["tur", "urd", "evn", "ckt", "ron"];
const SEEDS = [1, 2, 3, 4, 5];
const SIZES = [50, 100, 250, 500, 1000];
const CELLS_PER_LEMMA = 10;
const UNIVERSE_TARGET = 3000;
const TEST_MAX = 500;
const TEST_FRACTION = 0.25;

// ── utilities ─────────────────────────────────────────────────────────────────
function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function shuffle(arr, r) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(r() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
const mean = (xs) => xs.reduce((s, x) => s + x, 0) / xs.length;
const std = (xs) => {
  const m = mean(xs);
  return Math.sqrt(xs.reduce((s, x) => s + (x - m) ** 2, 0) / Math.max(1, xs.length - 1));
};
const r1 = (x) => Math.round(x * 10) / 10;

function load(lang) {
  const seen = new Set();
  const out = [];
  for (const line of fs.readFileSync(path.join(DIR, `${lang}.tsv`), "utf8").split("\n")) {
    const p = line.replace(/\r$/, "").split("\t");
    if (p.length < 3) continue;
    const [lemma, form, tag] = p.map((s) => s.trim().normalize("NFC"));
    if (!lemma || !form || !tag) continue;
    const key = `${lemma}\t${form}\t${tag}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push({ lemma, form, tag });
  }
  return out;
}

// ── edit rules ────────────────────────────────────────────────────────────────
/** Align two strings on their longest common substring → prefix + suffix rewrite. */
function extractRule(src, tgt) {
  let best = 0, bi = 0, bj = 0;
  const n = src.length, m = tgt.length;
  const prev = new Array(m + 1).fill(0);
  for (let i = 1; i <= n; i++) {
    let diag = 0;
    for (let j = 1; j <= m; j++) {
      const tmp = prev[j];
      prev[j] = src[i - 1] === tgt[j - 1] ? diag + 1 : 0;
      // prefer the leftmost-in-source, longest match
      if (prev[j] > best) { best = prev[j]; bi = i - best; bj = j - best; }
      diag = tmp;
    }
  }
  if (best === 0) return { pDel: src, pAdd: tgt, sDel: "", sAdd: "", whole: true };
  return {
    pDel: src.slice(0, bi),
    pAdd: tgt.slice(0, bj),
    sDel: src.slice(bi + best),
    sAdd: tgt.slice(bj + best),
    whole: false,
  };
}
const ruleKey = (r) => `${r.pDel}|${r.pAdd}|${r.sDel}|${r.sAdd}|${r.whole ? 1 : 0}`;
function applyRule(r, x) {
  if (r.whole) return x === r.pDel ? r.pAdd : null;
  if (!x.startsWith(r.pDel) || !x.endsWith(r.sDel)) return null;
  if (r.pDel.length + r.sDel.length > x.length) return null;
  return r.pAdd + x.slice(r.pDel.length, x.length - r.sDel.length) + r.sAdd;
}
function sharedEnding(a, b) {
  let k = 0;
  while (k < a.length && k < b.length && a[a.length - 1 - k] === b[b.length - 1 - k]) k++;
  return k;
}

/** Choose the best applicable rule among examples: (shared ending, support). */
function bestPrediction(examples, x) {
  // examples: [{ src, rule }]
  const byRule = new Map();
  for (const e of examples) {
    const out = applyRule(e.rule, x);
    if (out === null) continue;
    const k = ruleKey(e.rule);
    const s = sharedEnding(x, e.src);
    const cur = byRule.get(k);
    if (!cur) byRule.set(k, { out, sim: s, support: 1 });
    else { cur.sim = Math.max(cur.sim, s); cur.support++; }
  }
  let best = null;
  for (const v of byRule.values()) {
    if (!best || v.sim > best.sim || (v.sim === best.sim && v.support > best.support)) best = v;
  }
  return best;
}

// ── systems ───────────────────────────────────────────────────────────────────
const POS_SET = new Set(["N", "V", "ADJ", "ADV", "PRO", "DET", "NUM", "V.PTCP", "V.CVB", "V.MSDR", "ADP", "PROPN"]);
const posOf = (tag) => tag.split(";").find((f) => POS_SET.has(f)) ?? tag.split(";")[0];

function train(items) {
  const byTag = new Map();
  const byLemma = new Map();
  for (const it of items) {
    const ex = { src: it.lemma, rule: extractRule(it.lemma, it.form) };
    if (!byTag.has(it.tag)) byTag.set(it.tag, []);
    byTag.get(it.tag).push(ex);
    if (!byLemma.has(it.lemma)) byLemma.set(it.lemma, []);
    byLemma.get(it.lemma).push(it);
  }
  // cell-to-cell rules for paradigm memory (key "T1→T2") and, for the feature-aware
  // system, the same rules keyed only by the feature difference (key "−A=>+B").
  const cellRules = new Map();
  const deltaRules = new Map();
  for (const forms of byLemma.values()) {
    for (const a of forms) for (const b of forms) {
      if (a.tag === b.tag) continue;
      const ex = { src: a.form, rule: extractRule(a.form, b.form) };
      const k = `${a.tag}→${b.tag}`;
      if (!cellRules.has(k)) cellRules.set(k, []);
      cellRules.get(k).push(ex);
      const d = deltaKey(a.tag, b.tag);
      if (!deltaRules.has(d)) deltaRules.set(d, []);
      deltaRules.get(d).push(ex);
    }
  }
  const tagFeats = new Map([...byTag.keys()].map((t) => [t, new Set(t.split(";"))]));
  return { byTag, byLemma, cellRules, deltaRules, tagFeats };
}

function deltaKey(t1, t2) {
  const a = new Set(t1.split(";")), b = new Set(t2.split(";"));
  const rem = [...a].filter((f) => !b.has(f)).sort();
  const add = [...b].filter((f) => !a.has(f)).sort();
  return `${rem.join(",")}=>${add.join(",")}`;
}

function predictBaseline(model, lemma, tag) {
  const ex = model.byTag.get(tag);
  const best = ex ? bestPrediction(ex, lemma) : null;
  return best ? best.out : lemma;
}

function predictMemory(model, lemma, tag) {
  const known = model.byLemma.get(lemma);
  if (known) {
    let best = null;
    for (const k of known) {
      if (k.tag === tag) return k.form; // exact cell memorised (variant forms)
      const rules = model.cellRules.get(`${k.tag}→${tag}`);
      if (!rules) continue;
      const cand = bestPrediction(rules, k.form);
      if (cand && (!best || cand.support > best.support || (cand.support === best.support && cand.sim > best.sim))) best = cand;
    }
    if (best) return best.out;
  }
  return predictBaseline(model, lemma, tag);
}

function predictMorph(model, lemma, tag) {
  const exact = model.byTag.get(tag);
  const bestExact = exact ? bestPrediction(exact, lemma) : null;
  if (bestExact) return bestExact.out;
  const F = new Set(tag.split(";"));
  const pos = posOf(tag);

  // (1) compose: lemma → seen bundle A, then feature-difference rule A → tag
  let composed = null;
  for (const [a, G] of model.tagFeats) {
    if (a === tag || posOf(a) !== pos) continue;
    const rules = model.deltaRules.get(deltaKey(a, tag));
    if (!rules) continue;
    const viaA = bestPrediction(model.byTag.get(a), lemma);
    if (!viaA) continue;
    const cand = bestPrediction(rules, viaA.out);
    if (!cand) continue;
    let diff = 0;
    for (const f of F) if (!G.has(f)) diff++;
    for (const f of G) if (!F.has(f)) diff++;
    const score = [diff, -cand.support, -cand.sim];
    if (!composed || score[0] < composed.score[0] || (score[0] === composed.score[0] && (score[1] < composed.score[1] || (score[1] === composed.score[1] && score[2] < composed.score[2])))) {
      composed = { out: cand.out, score };
    }
  }
  if (composed) return composed.out;

  // (2) back off to the most similar seen bundle
  const ranked = [];
  for (const [t, G] of model.tagFeats) {
    if (t === tag || posOf(t) !== pos) continue;
    let inter = 0;
    for (const f of F) if (G.has(f)) inter++;
    const jac = inter / (F.size + G.size - inter);
    if (jac > 0) ranked.push([jac, t]);
  }
  ranked.sort((a, b) => b[0] - a[0]);
  for (const [, t] of ranked.slice(0, 12)) {
    const cand = bestPrediction(model.byTag.get(t), lemma);
    if (cand) return cand.out;
  }
  return lemma;
}

const SYSTEMS = { baseline: predictBaseline, memory: predictMemory, morph: predictMorph };

// ── splits ────────────────────────────────────────────────────────────────────
function universe(data, seed) {
  const r = rng(seed * 7919);
  const byLemma = new Map();
  for (const it of data) {
    if (!byLemma.has(it.lemma)) byLemma.set(it.lemma, []);
    byLemma.get(it.lemma).push(it);
  }
  const out = [];
  for (const lemma of shuffle([...byLemma.keys()], r)) {
    out.push(...shuffle(byLemma.get(lemma), r).slice(0, CELLS_PER_LEMMA));
    if (out.length >= UNIVERSE_TARGET) break;
  }
  return out;
}

function makeSplits(items, seed) {
  const T = Math.min(TEST_MAX, Math.floor(items.length * TEST_FRACTION));
  const r = rng(seed * 104729);
  const shuffled = shuffle(items, r);
  const random = { test: shuffled.slice(0, T), pool: shuffled.slice(T) };

  const lemmas = shuffle([...new Set(items.map((i) => i.lemma))], r);
  const testLemmas = new Set();
  let count = 0;
  const byLemma = new Map();
  for (const it of items) {
    if (!byLemma.has(it.lemma)) byLemma.set(it.lemma, []);
    byLemma.get(it.lemma).push(it);
  }
  for (const l of lemmas) {
    if (count >= T) break;
    testLemmas.add(l);
    count += byLemma.get(l).length;
  }
  const ldTest = shuffle(items.filter((i) => testLemmas.has(i.lemma)), r).slice(0, T);
  const ldPool = shuffle(items.filter((i) => !testLemmas.has(i.lemma)), r);
  return { T, random, "lemma-disjoint": { test: ldTest, pool: ldPool } };
}

// ── run ───────────────────────────────────────────────────────────────────────
const shaFile = path.join(DIR, "shas.txt");
const shas = fs.existsSync(shaFile)
  ? Object.fromEntries(fs.readFileSync(shaFile, "utf8").trim().split("\n").map((l) => { const [lang, branch, sha] = l.split(" "); return [lang, { branch, sha }]; }))
  : {};

const results = {};
const examples = {};
const stats = {};

for (const lang of LANGS) {
  const data = load(lang);
  const lemmas = new Set(data.map((d) => d.lemma));
  stats[lang] = { triples: data.length, lemmas: lemmas.size, bundles: new Set(data.map((d) => d.tag)).size };
  results[lang] = { random: {}, "lemma-disjoint": {} };
  const acc = {}; // split → n → system → [runs]
  const overlap = {}; // split → n → [runs]
  const unseenBundle = {}; // split → n → [runs]
  let testSize = 0;

  for (const seed of SEEDS) {
    const uni = universe(data, seed);
    const splits = makeSplits(uni, seed);
    testSize = splits.T;
    for (const split of ["random", "lemma-disjoint"]) {
      const { test, pool } = splits[split];
      for (const n of SIZES) {
        if (pool.length < n) continue;
        const trainItems = pool.slice(0, n);
        const model = train(trainItems);
        const trainLemmas = new Set(trainItems.map((t) => t.lemma));
        ((overlap[split] ??= {})[n] ??= []).push((100 * test.filter((t) => trainLemmas.has(t.lemma)).length) / test.length);
        ((unseenBundle[split] ??= {})[n] ??= []).push((100 * test.filter((t) => !model.byTag.has(t.tag)).length) / test.length);
        const preds = {};
        for (const [name, fn] of Object.entries(SYSTEMS)) {
          preds[name] = test.map((t) => fn(model, t.lemma, t.tag));
          const correct = preds[name].filter((p, i) => p === test[i].form).length;
          (((acc[split] ??= {})[n] ??= {})[name] ??= []).push((100 * correct) / test.length);
        }
        // Real prediction examples: first seed, largest feasible size ≤ 500
        if (seed === SEEDS[0] && n === Math.min(500, ...SIZES.filter((s) => s <= pool.length).slice(-1))) {
          const pick = [];
          test.forEach((t, i) => {
            const b = preds.baseline[i], m = preds.morph[i], mem = preds.memory[i];
            const kind =
              m === t.form && b !== t.form ? "morph-only" :
              b === t.form && m !== t.form ? "baseline-only" :
              mem === t.form && b !== t.form ? "memory-only" :
              b !== t.form && m !== t.form && mem !== t.form ? "all-wrong" : "all-right";
            pick.push({ lemma: t.lemma, tag: t.tag, gold: t.form, baseline: b, memory: mem, morph: m, kind, lemmaSeen: trainLemmas.has(t.lemma), bundleSeen: model.byTag.has(t.tag) });
          });
          (examples[lang] ??= {})[split] = { n, items: pick };
        }
      }
    }
  }

  for (const split of ["random", "lemma-disjoint"]) {
    for (const [n, bySys] of Object.entries(acc[split] ?? {})) {
      results[lang][split][n] = {
        overlap: r1(mean(overlap[split][n])),
        unseenBundle: r1(mean(unseenBundle[split][n])),
        systems: Object.fromEntries(Object.entries(bySys).map(([s, runs]) => [s, { mean: r1(mean(runs)), std: r1(std(runs)), runs: runs.map(r1) }])),
      };
    }
  }
  stats[lang].testSize = testSize;
  console.log(`${lang}: ${data.length} triples, test=${testSize}`, JSON.stringify(results[lang]["lemma-disjoint"]["500"]?.systems ?? results[lang]["lemma-disjoint"]["100"]?.systems ?? {}));
}

/** Keep a small, diverse set of examples per language/split for the UI. */
function curate(items) {
  const order = ["morph-only", "memory-only", "baseline-only", "all-wrong"];
  const out = [];
  for (const kind of order) out.push(...items.filter((i) => i.kind === kind && i.gold.length <= 28).slice(0, kind === "all-wrong" ? 2 : 3));
  return out;
}
const curatedExamples = Object.fromEntries(
  Object.entries(examples).map(([lang, bySplit]) => [
    lang,
    Object.fromEntries(Object.entries(bySplit).map(([split, v]) => [split, { n: v.n, items: curate(v.items) }])),
  ]),
);

const out = {
  generatedAt: new Date().toISOString(),
  config: { seeds: SEEDS, sizes: SIZES, cellsPerLemma: CELLS_PER_LEMMA, universeTarget: UNIVERSE_TARGET, testMax: TEST_MAX, testFraction: TEST_FRACTION },
  sources: Object.fromEntries(LANGS.map((l) => [l, { repo: `https://github.com/unimorph/${l}`, ...(shas[l] ?? {}) }])),
  stats,
  results,
  examples: curatedExamples,
};
const outPath = path.join(process.cwd(), "src", "data", "generated", "experiment-results.json");
fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, JSON.stringify(out, null, 1));
console.log("wrote", outPath);
