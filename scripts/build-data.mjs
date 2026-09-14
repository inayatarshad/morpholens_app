#!/usr/bin/env node
/**
 * Builds the explorer + comparison dataset from UniMorph TSVs.
 *
 * Usage:  node scripts/build-data.mjs <dir-with-unimorph-tsvs>
 * Output: src/data/generated/unimorph-sample.json
 *
 * Only a small sample is shipped to the browser: a few featured lemmas per language with
 * (capped) paradigms. Every record keeps its UniMorph triple verbatim.
 */
import fs from "node:fs";
import path from "node:path";
import { auditAll } from "../src/lib/audit.ts";
import { atomStatus, unlistedAtoms } from "../src/lib/schema.ts";

const DIR = process.argv[2];
if (!DIR) throw new Error("Usage: node scripts/build-data.mjs <unimorph-dir>");

const LANGS = ["tur", "urd", "evn", "ckt", "ron"];
const MAX_CELLS_PER_LEMMA = 120;

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

function extractRule(src, tgt) {
  let best = 0, bi = 0, bj = 0;
  const prev = new Array(tgt.length + 1).fill(0);
  for (let i = 1; i <= src.length; i++) {
    let diag = 0;
    for (let j = 1; j <= tgt.length; j++) {
      const tmp = prev[j];
      prev[j] = src[i - 1] === tgt[j - 1] ? diag + 1 : 0;
      if (prev[j] > best) { best = prev[j]; bi = i - best; bj = j - best; }
      diag = tmp;
    }
  }
  if (best === 0) return { pDel: src, pAdd: tgt, sDel: "", sAdd: "", whole: true };
  return { pDel: src.slice(0, bi), pAdd: tgt.slice(0, bj), sDel: src.slice(bi + best), sAdd: tgt.slice(bj + best), whole: false };
}

/** Automatic, alignment-based description of how target differs from base. */
function classify(base, target) {
  if (base === target) return { strategy: "No overt change (syncretic with base)", position: "none" };
  const bw = base.split(/\s+/), tw = target.split(/\s+/);
  if (tw.length > bw.length) {
    // find the target word that best aligns with the base word, then describe both changes
    const head = bw[bw.length - 1];
    let bestIdx = 0, bestShared = -1;
    tw.forEach((w, i) => {
      const r = extractRule(head, w);
      const shared = r.whole ? 0 : w.length - r.pAdd.length - r.sAdd.length;
      if (shared > bestShared) { bestShared = shared; bestIdx = i; }
    });
    const inner = classify(head, tw[bestIdx]);
    const strategy = inner.strategy.startsWith("No overt") ? "Separate word" : `Separate word + ${inner.strategy.charAt(0).toLowerCase()}${inner.strategy.slice(1)}`;
    return { strategy, position: bestIdx > 0 ? "Separate word before the stem" : "Separate word after the stem" };
  }
  const r = extractRule(base, target);
  if (r.whole) return { strategy: "Stem replacement (suppletive)", position: "Whole word" };
  const pre = r.pDel || r.pAdd, suf = r.sDel || r.sAdd;
  if (pre && suf) return { strategy: "Prefix + suffix (circumfixal)", position: "Both edges" };
  if (pre) return { strategy: r.pDel ? "Prefix replacement" : "Prefixation", position: "Prefix" };
  if (r.sDel) return { strategy: "Ending replacement", position: "Suffix" };
  return { strategy: "Suffixation", position: "Suffix" };
}

const featured = {
  tur: { N: ["kitap", "ev", "göz", "el", "kedi", "köpek", "kalem", "deniz", "ağaç", "çocuk", "gün", "yol", "kapı", "masa", "okul", "şehir"], V: ["gelmek", "gitmek", "yazmak", "okumak", "görmek", "yapmak"], limits: { N: 3, V: 2 } },
  urd: { N: ["لڑکا", "کتاب", "لڑکی", "گھر", "کمرہ"], V: ["لکھنا", "کرنا", "جانا", "دیکھنا"], limits: { N: 3, V: 1 } },
  ron: { N: ["carte", "casă", "om", "copil", "masă", "câine", "frate", "floare"], V: ["face", "merge", "lucra", "cânta", "vedea", "avea"], ADJ: ["bun", "frumos", "mare"], limits: { N: 3, V: 2, ADJ: 1 } },
  evn: { N: ["ďu"], V: [], limits: { N: 4, V: 3 } },
  ckt: { N: [], V: [], limits: { N: 5, V: 4 } },
};

/** Comparison specs: target = features the cell must contain (fewest extra features wins). */
const specs = {
  tur: {
    plural: { base: "LEMMA", must: ["N", "NOM", "PL"] },
    case: { base: "LEMMA", must: ["N", "ABL", "SG"] },
    possession: { base: "LEMMA", must: ["N", "NOM", "SG", "PSS1P"] },
    past: { base: "LEMMA", must: ["V", "IND", "PST", "3", "SG", "POS", "DECL"] },
    negation: { base: ["V", "IND", "PST", "3", "SG", "POS", "DECL"], must: ["V", "IND", "PST", "3", "SG", "NEG", "DECL"] },
  },
  urd: {
    plural: { base: "LEMMA", must: ["N", "NOM", "PL"] },
    case: { base: "LEMMA", must: ["N", "ACC", "PL"] },
    past: { base: "LEMMA", must: ["V.PTCP", "MASC", "SG", "PFV"] },
  },
  evn: {
    plural: { base: "LEMMA", must: ["N", "NOM", "PL"] },
    case: { base: "LEMMA", must: ["N", "ABL", "SG"] },
    possession: { base: "LEMMA", must: ["N", "SG", "PSS1S"] },
    past: { base: "LEMMA", must: ["V", "PST", "3", "SG"] },
  },
  ckt: {
    // prefer a transparent absolutive plural over тумгытум, whose singular is reduplicated
    plural: { base: "LEMMA", must: ["N", "PL"], prefer: ["ытԓыгын", "танӈын", "чакэттомгын"] },
    case: { base: "LEMMA", must: ["N", "ABL"] },
    past: { base: "LEMMA", must: ["V", "PST", "3"] },
    negation: { base: "LEMMA", must: ["NEG"] },
  },
  // ron plural intentionally omitted: noun number labels in UniMorph ron are unreliable
  // (e.g. "unor case", "niște case" tagged SG), surfaced as a data-quality note in the UI.
  ron: {
    case: { base: "LEMMA", must: ["N", "GEN/DAT", "SG", "INDF"] },
    past: { base: "LEMMA", must: ["V", "IND", "PST", "3", "SG", "PFV"] },
    negation: { base: ["V", "POS", "IMP", "2", "SG"], must: ["V", "NEG", "IMP", "2", "SG"] },
  },
};

const posOf = (tag) => tag.split(";")[0];
const feats = (tag) => new Set(tag.split(";"));
const contains = (tag, must) => { const f = feats(tag); return must.every((m) => f.has(m)); };

// Order cells so that simpler bundles appear first in paradigm tables.
const byComplexity = (a, b) => a.tag.split(";").length - b.tag.split(";").length || a.tag.localeCompare(b.tag);

const shas = Object.fromEntries(
  fs.readFileSync(path.join(DIR, "shas.txt"), "utf8").trim().split("\n").map((l) => { const [lang, branch, sha] = l.split(" "); return [lang, { branch, sha }]; }),
);

const out = { generatedAt: new Date().toISOString(), sources: {}, languages: {}, comparisons: {} };

for (const lang of LANGS) {
  const data = load(lang);
  const byLemma = new Map();
  for (const d of data) {
    if (!byLemma.has(d.lemma)) byLemma.set(d.lemma, []);
    byLemma.get(d.lemma).push(d);
  }
  const lemmaPos = (l) => {
    const counts = {};
    for (const c of byLemma.get(l)) counts[posOf(c.tag)] = (counts[posOf(c.tag)] ?? 0) + 1;
    return Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0];
  };
  // richest lemmas (most distinct, non-identical forms) as fallback
  const richness = (l) => new Set(byLemma.get(l).filter((c) => c.form !== l).map((c) => c.form)).size;
  const ranked = [...byLemma.keys()].sort((a, b) => richness(b) - richness(a) || a.localeCompare(b));

  const cfg = featured[lang];
  const chosen = [];
  for (const [pos, limit] of Object.entries(cfg.limits)) {
    const prefs = (cfg[pos] ?? []).filter((l) => byLemma.has(l));
    const fill = ranked.filter((l) => lemmaPos(l) === pos && !prefs.includes(l));
    for (const l of [...prefs, ...fill]) {
      if (chosen.filter((c) => lemmaPos(c) === pos).length >= limit) break;
      if (!chosen.includes(l) && richness(l) > 0) chosen.push(l);
    }
  }

  const entries = [];
  for (const l of chosen) entries.push(...byLemma.get(l).slice().sort(byComplexity).slice(0, MAX_CELLS_PER_LEMMA));

  // Records that must not be used as examples: audit conflicts and non-schema anomalies.
  const unlistedCount = new Map();
  for (const d of data) for (const a of unlistedAtoms(d.tag)) unlistedCount.set(a, (unlistedCount.get(a) ?? 0) + 1);
  const isAnomaly = (d) => unlistedAtoms(d.tag).some((a) => atomStatus(a, unlistedCount.get(a) ?? 0) === "anomaly");
  const isFlagged = (d) => isAnomaly(d) || auditAll(lang, d.lemma, d.form, d.tag).some((r) => r.conflict);

  // Comparison examples: preferred lemmas, then featured lemmas, then any lemma in the full file.
  const comp = {};
  for (const [feature, spec] of Object.entries(specs[lang] ?? {})) {
    let found = null;
    for (const l of [...(spec.prefer ?? []).filter((p) => byLemma.has(p)), ...chosen, ...ranked]) {
      const cells = byLemma.get(l).filter((c) => !isFlagged(c));
      const targets = cells
        .filter((c) => contains(c.tag, spec.must))
        .sort((a, b) => byComplexity(a, b) || a.form.localeCompare(b.form));
      if (!targets.length) continue;
      const target = targets[0];
      let base;
      if (spec.base === "LEMMA") base = { form: l, tag: "LEMMA (citation form)" };
      else {
        const b = cells
          .filter((c) => contains(c.tag, spec.base) && c.tag.split(";").length === target.tag.split(";").length)
          .sort((x, y) => byComplexity(x, y) || x.form.localeCompare(y.form))[0];
        if (!b) continue;
        base = { form: b.form, tag: b.tag };
      }
      // only accept examples where the feature is overtly marked
      if (target.form === base.form) continue;
      const variants = cells.filter((c) => c.tag === target.tag && c.form !== target.form).map((c) => c.form);
      found = { lemma: l, base, target, variants, ...classify(base.form, target.form) };
      break;
    }
    comp[feature] = found;
    // make sure the comparison lemma is searchable in the explorer
    if (found && !chosen.includes(found.lemma)) {
      for (const c of [found.target, ...(found.base.tag.startsWith("LEMMA") ? [] : [found.base])]) {
        if (!entries.some((e) => e.form === c.form && e.tag === c.tag)) entries.push({ lemma: found.lemma, form: c.form, tag: c.tag });
      }
    }
  }

  out.sources[lang] = { repo: `https://github.com/unimorph/${lang}`, file: lang, ...shas[lang] };
  out.languages[lang] = {
    stats: { triples: data.length, lemmas: byLemma.size, bundles: new Set(data.map((d) => d.tag)).size },
    featured: chosen,
    entries,
  };
  out.comparisons[lang] = comp;

  // Rule-based audit over the full file (only languages with rules produce results).
  let checked = 0, conflicts = 0;
  const byField = {};
  const byCue = {};
  const examples = [];
  const exampleKeys = new Set();
  for (const d of data) {
    const findings = auditAll(lang, d.lemma, d.form, d.tag);
    if (!findings.length) continue;
    checked++;
    if (findings.some((r) => r.conflict)) conflicts++;
    for (const r of findings) {
      const fld = (byField[r.field] ??= { checked: 0, conflicts: 0 });
      fld.checked++;
      if (!r.conflict) continue;
      fld.conflicts++;
      byCue[r.cue] = (byCue[r.cue] ?? 0) + 1;
      const key = `${r.field}:${d.lemma}`;
      if (examples.length < 12 && !exampleKeys.has(key)) {
        exampleKeys.add(key);
        examples.push({ lemma: d.lemma, form: d.form, tag: d.tag, field: r.field, expected: r.expected, cue: r.cue });
      }
    }
  }
  if (checked) {
    (out.audits ??= {})[lang] = { checked, conflicts, byField, byCue, examples };
    console.log(`${lang} audit: ${conflicts} / ${checked} records with a cue conflict`, JSON.stringify(byField));
  }

  // Schema validation: unlisted atoms and their classification (convention vs anomaly).
  const unlisted = Object.fromEntries([...unlistedCount].map(([a, n]) => [a, { count: n, status: atomStatus(a, n) }]));
  const anomalyRecords = data.filter(isAnomaly);
  (out.schema ??= {})[lang] = { unlisted, anomalyRecords };
  if (unlistedCount.size) console.log(`${lang} unlisted tags:`, JSON.stringify(unlisted), "| anomaly records:", anomalyRecords.length);

  // Variant forms: records whose (lemma, bundle) cell holds more than one form.
  const cellForms = new Map();
  for (const d of data) {
    const k = `${d.lemma}\t${d.tag}`;
    if (!cellForms.has(k)) cellForms.set(k, []);
    cellForms.get(k).push(d.form);
  }
  let inMulti = 0;
  let biggest = null;
  for (const [k, forms] of cellForms) {
    if (forms.length < 2) continue;
    inMulti += forms.length;
    if (!biggest || forms.length > biggest.forms.length) {
      const [lemma, tag] = k.split("\t");
      biggest = { lemma, tag, forms };
    }
  }
  (out.variants ??= {})[lang] = { records: inMulti, share: (100 * inMulti) / data.length, example: biggest ?? undefined };
  console.log(lang, "featured:", chosen.join(", "), "| entries:", entries.length, "| comparisons:", Object.entries(comp).map(([k, v]) => `${k}=${v ? `${v.base.form}→${v.target.form} (${v.strategy})` : "none"}`).join("; "));
}

const outPath = path.join(process.cwd(), "src", "data", "generated", "unimorph-sample.json");
fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, JSON.stringify(out));
const pubDir = path.join(process.cwd(), "public", "data");
fs.mkdirSync(pubDir, { recursive: true });
fs.writeFileSync(path.join(pubDir, "unimorph-sample.json"), JSON.stringify(out, null, 1));
console.log("wrote", outPath, (fs.statSync(outPath).size / 1024).toFixed(0), "KB (+ public/data copy)");
