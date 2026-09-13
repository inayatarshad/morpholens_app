import fs from "node:fs";
import path from "node:path";
import type { LanguageId } from "@/data/types";
import type { Triple } from "@/data/unimorph";
import { canonical, loose } from "./lookup";
import type { NearMatch, SearchResponse } from "./search-types";

/**
 * Server-side index over the FULL UniMorph files (fetched at build time from pinned
 * commits by scripts/fetch-unimorph.mjs). Loaded lazily per language and kept in
 * memory for the lifetime of the function instance.
 */
const DATA_DIR = path.join(process.cwd(), "unimorph-data");
const RESULT_LIMIT = 60;
const PARADIGM_LIMIT = 1000;

type Store = {
  rows: Triple[];
  formC: string[];
  formL: string[];
  lemmaC: string[];
  lemmaL: string[];
  byLemma: Map<string, number[]>;
  tagCount: Map<string, number>;
  sha?: string;
};

const stores = new Map<LanguageId, Store | null>();

function readSha(lang: LanguageId): string | undefined {
  try {
    const line = fs.readFileSync(path.join(DATA_DIR, "shas.txt"), "utf8").split(/\r?\n/).find((l) => l.startsWith(`${lang} `));
    return line?.split(" ")[2];
  } catch {
    return undefined;
  }
}

function load(lang: LanguageId): Store | null {
  const file = path.join(DATA_DIR, `${lang}.tsv`);
  if (!fs.existsSync(file)) return null;
  const intern = new Map<string, string>();
  const I = (s: string) => {
    const v = intern.get(s);
    if (v !== undefined) return v;
    intern.set(s, s);
    return s;
  };
  const seen = new Set<string>();
  const rows: Triple[] = [];
  for (const line of fs.readFileSync(file, "utf8").split("\n")) {
    const p = line.replace(/\r$/, "").split("\t");
    if (p.length < 3) continue;
    // identical cleaning to scripts/run-experiment.mjs so counts agree
    const lemma = p[0].trim().normalize("NFC");
    const form = p[1].trim().normalize("NFC");
    const tag = p[2].trim().normalize("NFC");
    if (!lemma || !form || !tag) continue;
    const key = `${lemma}\t${form}\t${tag}`;
    if (seen.has(key)) continue;
    seen.add(key);
    rows.push({ lemma: I(lemma), form, tag: I(tag) });
  }
  const lemmaKeys = new Map<string, [string, string]>();
  const lk = (l: string) => {
    let v = lemmaKeys.get(l);
    if (!v) {
      v = [canonical(l, lang), loose(l, lang)];
      lemmaKeys.set(l, v);
    }
    return v;
  };
  const byLemma = new Map<string, number[]>();
  const tagCount = new Map<string, number>();
  rows.forEach((r, i) => {
    const list = byLemma.get(r.lemma);
    if (list) list.push(i);
    else byLemma.set(r.lemma, [i]);
    tagCount.set(r.tag, (tagCount.get(r.tag) ?? 0) + 1);
  });
  return {
    rows,
    formC: rows.map((r) => canonical(r.form, lang)),
    formL: rows.map((r) => loose(r.form, lang)),
    lemmaC: rows.map((r) => lk(r.lemma)[0]),
    lemmaL: rows.map((r) => lk(r.lemma)[1]),
    byLemma,
    tagCount,
    sha: readSha(lang),
  };
}

export function getStore(lang: LanguageId): Store | null {
  if (!stores.has(lang)) stores.set(lang, load(lang));
  return stores.get(lang) ?? null;
}

export function paradigm(lang: LanguageId, lemma: string): Triple[] {
  const s = getStore(lang);
  if (!s) return [];
  return (s.byLemma.get(lemma) ?? []).slice(0, PARADIGM_LIMIT).map((i) => s.rows[i]);
}

/** Levenshtein distance, abandoning early once it must exceed k. */
function within(a: string, b: string, k: number): number {
  if (Math.abs(a.length - b.length) > k) return k + 1;
  let prev = Array.from({ length: b.length + 1 }, (_, j) => j);
  for (let i = 1; i <= a.length; i++) {
    const cur = [i];
    let rowMin = i;
    for (let j = 1; j <= b.length; j++) {
      const v = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
      cur.push(v);
      if (v < rowMin) rowMin = v;
    }
    if (rowMin > k) return k + 1;
    prev = cur;
  }
  return prev[b.length];
}

function nearest(s: Store, ql: string): NearMatch[] {
  const k = ql.length <= 4 ? 1 : 2;
  const best = new Map<string, NearMatch>();
  for (let i = 0; i < s.rows.length; i++) {
    const f = s.formL[i];
    if (Math.abs(f.length - ql.length) > k) continue;
    const d = within(ql, f, k);
    if (d > k) continue;
    const r = s.rows[i];
    const prev = best.get(r.form);
    if (!prev || d < prev.distance) best.set(r.form, { ...r, distance: d });
  }
  return [...best.values()].sort((a, b) => a.distance - b.distance || a.form.localeCompare(b.form)).slice(0, 8);
}

export function search(lang: LanguageId, query: string): SearchResponse | null {
  const s = getStore(lang);
  if (!s) return null;
  const qc = canonical(query, lang);
  const ql = loose(query, lang);
  const exact: number[] = [];
  const looseIdx: number[] = [];
  const lemExact = new Set<string>();
  const lemLoose = new Set<string>();
  if (qc) {
    for (let i = 0; i < s.rows.length; i++) {
      if (s.formC[i] === qc) exact.push(i);
      else if (ql && s.formL[i] === ql) looseIdx.push(i);
      if (s.lemmaC[i] === qc) lemExact.add(s.rows[i].lemma);
      else if (ql && s.lemmaL[i] === ql) lemLoose.add(s.rows[i].lemma);
    }
  }
  const ex = exact.slice(0, RESULT_LIMIT).map((i) => s.rows[i]);
  const lo = exact.length ? [] : looseIdx.slice(0, RESULT_LIMIT).map((i) => s.rows[i]);
  const lemmasExact = [...lemExact].slice(0, 10);
  const lemmasLoose = exact.length || lemExact.size ? [] : [...lemLoose].slice(0, 10);
  const near = !exact.length && !looseIdx.length && !lemExact.size && !lemLoose.size && ql ? nearest(s, ql) : [];
  const lemmas = [...new Set([...ex.map((r) => r.lemma), ...lo.map((r) => r.lemma), ...lemmasExact, ...lemmasLoose])].slice(0, 6);
  return {
    lang,
    query,
    total: s.rows.length,
    exact: ex,
    loose: lo,
    lemmas: { exact: lemmasExact, loose: lemmasLoose },
    alternatives: exact.length ? [...new Set(looseIdx.map((i) => s.rows[i].form))].slice(0, 6) : [],
    near,
    paradigms: Object.fromEntries(lemmas.map((l) => [l, paradigm(lang, l)])),
    bundleCounts: Object.fromEntries([...new Set([...ex, ...lo].map((r) => r.tag))].map((t) => [t, s.tagCount.get(t) ?? 0])),
    truncated: exact.length > RESULT_LIMIT || looseIdx.length > RESULT_LIMIT,
    source: { sha: s.sha },
  };
}
