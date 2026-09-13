/**
 * Regression checks for MorphoLens' linguistic behaviour.
 *
 *   npm test                                 unit checks (alignment, audit, matching)
 *   npm run test:live [baseUrl]              + search API checks against a running site
 *
 * Runs with Node's built-in TypeScript type stripping (Node ≥ 22.18 / 23.6).
 */
import { alignSurface, alignmentSegments, headWord } from "../src/lib/stem.ts";
import { auditRecord } from "../src/lib/audit.ts";
import { canonical, loose } from "../src/lib/lookup.ts";

let failed = 0;
let passed = 0;
function check(name: string, ok: boolean, detail = "") {
  if (ok) passed++;
  else {
    failed++;
    console.log(`  ✗ ${name}${detail ? `  (${detail})` : ""}`);
  }
}

// ── surface alignment ──────────────────────────────────────────────────────────
// [lang, lemma, form, pos, expected segments, expected confidence, paradigm forms]
const alignCases: [string, string, string, string, string[], string, string[]?][] = [
  ["ron", "casă", "caselor", "N", ["case", "lor"], "medium", ["casei", "casele", "unor case", "casa"]],
  ["ron", "casă", "casei", "N", ["case", "i"], "medium", ["caselor", "casele"]],
  ["ron", "casă", "casele", "N", ["case", "le"], "medium", ["caselor", "casei"]],
  ["ron", "casă", "casa", "N", ["cas", "a"], "medium"],
  ["ron", "casă", "unei case", "N", ["unei", "cas", "e"], "medium"],
  ["ron", "casă", "o casă", "N", ["o", "casă"], "high"],
  ["ron", "copil", "copilului", "N", ["copil", "ului"], "high"],
  ["ron", "câine", "câinelui", "N", ["câine", "lui"], "high"],
  ["ron", "face", "făcuserăți", "V", ["făc", "userăți"], "medium", ["făcu", "făcusem"]],
  ["ron", "merge", "merseserăți", "V", ["mers", "eserăți"], "medium", ["merse", "mersesem"]],
  ["ron", "face", "nu face", "V", ["nu", "fac", "e"], "high"],
  ["ron", "face", "fă", "V", ["fă"], "none"],
  ["tur", "ağaç", "ağacı", "N", ["ağac", "ı"], "medium", ["ağaca", "ağacın", "ağaçlar"]],
  ["tur", "kitap", "kitabı", "N", ["kitab", "ı"], "low"],
  ["tur", "gelmek", "geldi", "V", ["gel", "di"], "high"],
  ["tur", "gelmek", "gelmek", "V", ["gel", "mek"], "high"],
  ["tur", "gitmek", "gidiyor", "V", ["gid", "iyor"], "medium", ["gider", "gidecek"]],
  ["tur", "kedi", "kediler", "N", ["kedi", "ler"], "high"],
  ["tur", "el sıkışmak", "el sıkışıyorlar mı", "V", ["el", "sıkış", "ıyorlar", "mı"], "high"],
  ["urd", "لڑکا", "لڑکے", "N", ["لڑک", "ے"], "high"],
  ["urd", "لڑکا", "لڑکوں", "N", ["لڑک", "وں"], "high"],
  ["urd", "لڑکی", "لڑکیاں", "N", ["لڑکی", "اں"], "high"],
  ["urd", "لکھنا", "لکھا", "V", ["لکھ", "ا"], "high"],
  ["urd", "لکھنا", "تم لکھو", "V", ["تم", "لکھ", "و"], "high"],
  ["evn", "ďu", "ďulwatin", "N", ["ďu", "lwatin"], "high"],
  ["ckt", "тэйкык", "гэтэйкыԓин", "V", ["гэ", "тэйкы", "ԓин"], "low"],
  ["ckt", "тумгытум", "тумгыт", "N", ["тумгыт"], "low"],
];
console.log("Surface alignment");
for (const [lang, lemma, form, pos, segs, conf, paradigm = []] of alignCases) {
  const al = alignSurface(lemma, form, lang, pos, paradigm.map((f) => headWord(f, lemma)));
  const got = alignmentSegments(al);
  check(`${lang} ${lemma} → ${form}: ${segs.join(" + ")}`, JSON.stringify(got) === JSON.stringify(segs), `got ${got.join(" + ")}`);
  check(`${lang} ${form}: confidence ${conf}`, al.confidence === conf, `got ${al.confidence} (${al.method})`);
}

// ── Romanian record audit ──────────────────────────────────────────────────────
// [lemma, form, tag, expected: "conflict→SG" | "conflict→PL" | "ok" | "none"]
const auditCases: [string, string, string, string][] = [
  ["casă", "casei", "N;GEN/DAT;PL;DEF", "conflict→SG"],
  ["casă", "casa", "N;NOM/ACC;PL;DEF", "conflict→SG"],
  ["casă", "unor case", "N;GEN/DAT;SG;INDF", "conflict→PL"],
  ["casă", "niște case", "N;NOM/ACC;SG;INDF", "conflict→PL"],
  ["casă", "caselor", "N;GEN/DAT;PL;DEF", "ok"],
  ["casă", "caselor", "N;VOC;PL", "ok"],
  ["casă", "unei case", "N;GEN/DAT;SG;INDF", "ok"],
  ["casă", "casele", "N;NOM/ACC;PL;DEF", "none"],
  ["copil", "copilului", "N;GEN/DAT;PL;DEF", "conflict→SG"],
  ["copil", "copilul", "N;NOM/ACC;PL;DEF", "conflict→SG"],
  ["copil", "copiii", "N;NOM/ACC;PL;DEF", "ok"],
  ["câine", "câinele", "N;NOM/ACC;PL;DEF", "none"],
  ["abandonabil", "abandonabililor", "ADJ;DAT/GEN;FEM;SG;DEF", "conflict→PL"],
  ["incolor", "incolor", "ADJ;DAT/GEN;MASC;SG;INDF", "none"],
];
console.log("Record audit (Romanian)");
for (const [lemma, form, tag, want] of auditCases) {
  const r = auditRecord("ron", lemma, form, tag);
  const got = !r ? "none" : r.conflict ? `conflict→${r.expected}` : "ok";
  check(`${form} ${tag}: ${want}`, got === want, `got ${got}`);
}
check("audit is off for other languages", auditRecord("tur", "kedi", "kediler", "N;NOM;PL") === null);

// ── matching rules ─────────────────────────────────────────────────────────────
console.log("Matching");
check("case folding (ron)", canonical("CASELOR", "ron") === "caselor");
check("Turkish İ → i", canonical("KEDİLER", "tur") === "kediler");
check("Turkish I → ı", canonical("KIZ", "tur") === "kız");
check("Romanian cedilla ≡ comma below", canonical("şcoală", "ron") === canonical("școală", "ron"));
check("Arabic kaf ≡ Urdu kaf", canonical("لڑكے", "urd") === canonical("لڑکے", "urd"));
check("Arabic yeh ≡ Urdu yeh", canonical("لڑکي", "urd") === canonical("لڑکی", "urd"));
check("diacritics are not exact", canonical("cainelui", "ron") !== canonical("câinelui", "ron"));
check("diacritics match loosely", loose("cainelui", "ron") === loose("câinelui", "ron"));
check("casă ≠ casa exactly", canonical("casa", "ron") !== canonical("casă", "ron"));
check("Evenki transcription loosely", loose("dulwatin", "evn") === loose("ďulwatin", "evn"));
check("Chukchi ԓ ≈ л loosely", loose("вэлыткоран", "ckt") === loose("вэԓыткоран", "ckt"));
check("bari ye ے is not merged with ی", canonical("لڑکے", "urd") !== canonical("لڑکی", "urd"));

// ── live search API ────────────────────────────────────────────────────────────
const base = process.argv[2];
if (base) {
  console.log(`Search API at ${base}`);
  type R = { exact: { form: string; lemma: string; tag: string }[]; loose: { form: string }[]; lemmas: { exact: string[]; loose: string[] }; near: { form: string }[]; alternatives: string[]; bundleCounts: Record<string, number> };
  const get = async (lang: string, q: string): Promise<R> => {
    const res = await fetch(`${base}/api/search?lang=${lang}&q=${encodeURIComponent(q)}`);
    if (!res.ok) throw new Error(`${lang} ${q}: HTTP ${res.status}`);
    return (await res.json()) as R;
  };
  const tags = (r: R) => r.exact.map((x) => x.tag);
  let r = await get("ron", "caselor");
  check("caselor: two stored analyses", r.exact.length === 2, `got ${r.exact.length}`);
  check("caselor: GEN/DAT;PL;DEF bundle is more common than VOC;PL", (r.bundleCounts["N;GEN/DAT;PL;DEF"] ?? 0) > (r.bundleCounts["N;VOC;PL"] ?? 0));
  r = await get("ron", "CASELOR");
  check("CASELOR: case-insensitive exact", r.exact.length === 2);
  r = await get("ron", "cainelui");
  check("cainelui: no exact match", r.exact.length === 0);
  check("cainelui: loose match câinelui", r.loose.some((x) => x.form === "câinelui"));
  r = await get("ron", "casa");
  check("casa: exact, with casă offered as alternative", r.exact.length === 1 && r.alternatives.includes("casă"));
  r = await get("ron", "asdfghmorph");
  check("nonsense: no record of any kind", !r.exact.length && !r.loose.length && !r.lemmas.exact.length && !r.lemmas.loose.length);
  r = await get("ron", "  merseserăți ");
  check("merseserăți (with spaces): exact", r.exact.length === 1);
  r = await get("tur", "KEDİLER");
  check("KEDİLER: three stored analyses", r.exact.length === 3, `got ${r.exact.length}`);
  r = await get("tur", "ağacı");
  check("ağacı: N;ACC;SG", tags(r).includes("N;ACC;SG"));
  r = await get("tur", "kitabı");
  check("kitabı: not in UniMorph (lemma kitap absent)", r.exact.length === 0 && r.loose.length === 0);
  r = await get("tur", "gelmek");
  check("gelmek: lemma match", r.lemmas.exact.includes("gelmek"));
  for (const [q, n] of [["لڑکا", 1], ["لڑکے", 3], ["لڑکوں", 1], ["لڑکی", 3], ["لڑکیاں", 1], ["لڑکیوں", 1]] as const) {
    r = await get("urd", q);
    check(`urd ${q}: ${n} stored analyses`, r.exact.length === n, `got ${r.exact.length}`);
  }
  r = await get("urd", "لڑكے");
  check("urd Arabic-keyboard لڑكے: exact", r.exact.length === 3);
  r = await get("evn", "dulwatin");
  check("evn dulwatin: loose ďulwatin", r.exact.length === 0 && r.loose.some((x) => x.form === "ďulwatin"));
  r = await get("ckt", "вэлыткоран");
  check("ckt вэлыткоран: loose вэԓыткоран", r.loose.some((x) => x.form === "вэԓыткоран") || r.lemmas.loose.includes("вэԓыткоран"));
}

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed ? 1 : 0);
