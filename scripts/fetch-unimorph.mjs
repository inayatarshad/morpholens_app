#!/usr/bin/env node
/**
 * Downloads the UniMorph files used by MorphoLens, pinned to the commits the shipped
 * results were computed from, and writes shas.txt next to them.
 *
 * Usage: node scripts/fetch-unimorph.mjs [outDir=.unimorph]
 */
import fs from "node:fs";
import path from "node:path";

const OUT = process.argv[2] ?? ".unimorph";
const PINNED = {
  tur: { branch: "master", sha: "6c179ace7d2f3d7f3484020e5304c1544d07bb6b" },
  urd: { branch: "master", sha: "17b2fb34fac79ba7bc4b90f8e10e6a25bac3d396" },
  evn: { branch: "main", sha: "cdbe7b44ba754403d60fd38818ac173bec13ba34" },
  ckt: { branch: "main", sha: "facbd482ef2558916b7283b398c9810a8649e7f2" },
  ron: { branch: "master", sha: "0910e7850baef37f67817060fa8aae7c42cbe269" },
};

fs.mkdirSync(OUT, { recursive: true });
const lines = [];
for (const [lang, { branch, sha }] of Object.entries(PINNED)) {
  const url = `https://raw.githubusercontent.com/unimorph/${lang}/${sha}/${lang}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${url} → ${res.status}`);
  const text = await res.text();
  fs.writeFileSync(path.join(OUT, `${lang}.tsv`), text);
  lines.push(`${lang} ${branch} ${sha}`);
  console.log(`${lang}: ${(text.length / 1024).toFixed(0)} KB`);
}
fs.writeFileSync(path.join(OUT, "shas.txt"), lines.join("\n") + "\n");
