#!/usr/bin/env node
/**
 * Downloads the UniMorph files used by MorphoLens, pinned to the commits the shipped
 * results were computed from, and writes shas.txt next to them. Files that are already
 * present at the pinned commit are not downloaded again (this script runs before every
 * build so the search API can read the full data).
 *
 * Usage: node scripts/fetch-unimorph.mjs [outDir=unimorph-data]
 */
import fs from "node:fs";
import path from "node:path";

const OUT = process.argv[2] ?? "unimorph-data";
const PINNED = {
  tur: { branch: "master", sha: "6c179ace7d2f3d7f3484020e5304c1544d07bb6b" },
  urd: { branch: "master", sha: "17b2fb34fac79ba7bc4b90f8e10e6a25bac3d396" },
  evn: { branch: "main", sha: "cdbe7b44ba754403d60fd38818ac173bec13ba34" },
  ckt: { branch: "main", sha: "facbd482ef2558916b7283b398c9810a8649e7f2" },
  ron: { branch: "master", sha: "0910e7850baef37f67817060fa8aae7c42cbe269" },
};

async function download(url) {
  let last;
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`${url} → HTTP ${res.status}`);
      return await res.text();
    } catch (e) {
      last = e;
      await new Promise((r) => setTimeout(r, 1000 * attempt));
    }
  }
  throw last;
}

fs.mkdirSync(OUT, { recursive: true });
const shaPath = path.join(OUT, "shas.txt");
const existing = fs.existsSync(shaPath) ? fs.readFileSync(shaPath, "utf8").split(/\r?\n/) : [];
const lines = [];
for (const [lang, { branch, sha }] of Object.entries(PINNED)) {
  const line = `${lang} ${branch} ${sha}`;
  const file = path.join(OUT, `${lang}.tsv`);
  if (existing.includes(line) && fs.existsSync(file) && fs.statSync(file).size > 0) {
    console.log(`${lang}: present at ${sha.slice(0, 7)}`);
  } else {
    const text = await download(`https://raw.githubusercontent.com/unimorph/${lang}/${sha}/${lang}`);
    fs.writeFileSync(file, text);
    console.log(`${lang}: downloaded ${(Buffer.byteLength(text) / 1024).toFixed(0)} KB at ${sha.slice(0, 7)}`);
  }
  lines.push(line);
}
fs.writeFileSync(shaPath, lines.join("\n") + "\n");
