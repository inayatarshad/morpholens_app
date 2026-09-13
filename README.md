# MorphoLens

**Explore how words change across languages.** MorphoLens is an interactive research workspace for low-resource morphology, unseen-lemma generalisation and morphological resource quality. It is built on UniMorph data for Turkish, Urdu, Evenki, Chukchi and Romanian.

Live: https://morpholens-app.vercel.app

## Research motivation

Inflection systems often look strong when the test data contains **familiar lemmas**: other forms of the same word were seen during training, so a system can recall instead of compose. Lemma overlap has been shown to inflate reported inflection accuracy (Goldman, Guriel & Tsarfaty, 2022).

MorphoLens asks one question:

> *Can explicit morphological structure help models generalise to unseen word forms and unseen lemmas in low-resource languages?*

It answers it by comparing **random** and **lemma-disjoint** evaluation on the same data. Along the way it also shows what the underlying resources actually contain, including their inconsistencies.

## Features

- **Morphology explorer** (`/explore`): searches the **full** pinned UniMorph file for a language on the server.
  - Every result is split into a **source record** (verbatim line, dataset and commit, upstream source, licence, status) and a **MorphoLens interpretation** (surface alignment with a confidence level, stem alternation, ambiguity and record audit).
  - A form stored under several bundles shows every analysis. None is marked primary; they are listed by how common each bundle is in the file.
  - A lemma query opens the full, filterable paradigm. Rows that fail the record audit are flagged.
- **Cross-language comparison** (`/compare`): Plural, Case, Possession, Past tense and Negation across the five languages.
  - Examples come from UniMorph, with an automatic label for the surface strategy.
  - Hand-curated reference patterns fill a slot only when UniMorph has none.
  - Slots with unreliable data are withheld, and the reason is shown.
- **Unseen-lemma experiment** (`/experiment`): measured results for three transparent systems × two splits × five training sizes × five seeds.
  - Each difference comes with a paired-bootstrap 95% interval and p-value, alongside mean edit distance.
  - A breakdown shows where differences arise: seen vs unseen bundles and lemmas, and errors that just copy the lemma.
- **Methodology** (`/about`): data sources with commit hashes, how search works, how to read an analysis, experiment design, generated results text, data-quality notes, limitations, downloads, citation and references.

## Reading an analysis

**Labels.**
- **UniMorph record:** the exact triple is stored in the pinned UniMorph file. MorphoLens has not independently verified it.
- **Reference pattern:** a hand-annotated textbook form that UniMorph does not contain (for example Turkish *ev* and *kitap*).
- **Gold segmentation:** hand-annotated morpheme boundaries. These exist only for the ten curated Turkish and Urdu entries.

**Surface alignment is not morphological segmentation.** UniMorph stores feature bundles, not morpheme boundaries. MorphoLens removes known citation endings (Turkish -mek/-mak, Urdu -nā and masculine -ā, Romanian infinitive vowels), then aligns the form to the stem and reports a confidence level:

| Confidence | Meaning | Example |
|---|---|---|
| High | The citation stem occurs unchanged (pure affixation) | Turkish *kedi + ler*, Romanian *copil + ului* |
| Medium | One stem segment alternates, and the variant recurs in other forms of the paradigm; or a final ending is replaced | Romanian *case + lor* (casă ~ case-, also in casei, casele), *cas + a* |
| Low | The alternation is unsupported, or only a longest shared stretch aligns | Chukchi *гэ + тэйкы + ԓин* |
| No split | Suppletion: nothing shared with the lemma | Romanian *fă* of *face* |

**Difficulty tags carry their provenance.**
- **Data:** read from stored records (syncretism, variant forms, multi-word forms).
- **Heuristic:** inferred by MorphoLens. *Allomorphy* means a stem variant with one alternating segment; *stem change* means lemma material is replaced without a consistent alternation.
- **Gold:** from hand annotation.
- **Experiment:** unseen lemma and rare feature, which only make sense relative to a split.

## Record audit (Romanian)

UniMorph `ron` (source: Wikipedia, per its README) contains systematic Number errors: definite forms tend to be tagged PL and indefinite forms SG. For *casă*, *casa* and *casei* (singular) are tagged PL, while *unor case* and *niște case* (plural) are tagged SG.

MorphoLens checks every noun and adjective record against unambiguous cues:
- **Indefinite articles:** *o, un, unei, unui* are singular; *niște, unor* are plural.
- **Definite endings:** *-lui*, *-ul*, genitive/dative *-ei* and feminine *-a* are singular; *-lor* and nominative *-ii* are plural.

A cue only counts when the ending is not already part of the lemma.

**Result on the full file: 10,171 of the 22,943 records that carry such a cue (44%) conflict with their Number tag.** Every rule was checked against sampled flagged records, and all samples were genuine errors. Flagged records are shown exactly as stored, marked in the explorer and paradigm tables, and Romanian plural comparisons are withheld. Records without a cue are not checked, so an unflagged record is not thereby confirmed.

## Search accuracy

1. **Exact:** the spelling must match. Only letter case, Unicode normalisation and keyboard variants that never distinguish words are ignored: Romanian ş/ș and ţ/ț, Arabic-keyboard ي/ك vs Urdu ی/ک, apostrophe variants, and zero-width characters.
2. **Lemma:** if the query is a citation form, its full paradigm is shown.
3. **Loose:** only used when nothing matches exactly. Diacritics and transcription details are ignored (ı/i, ă/a, ə/e, ː, Chukchi ԓ/л …), and the results are labelled, because they can be different words (Romanian *casă* ≠ *casa*). An exact match also offers such spellings as "did you mean" alternatives.
4. **No stored record:** the page says so, reports how many triples were searched, and lists the closest stored forms (edit distance ≤ 2).

## Data

| Language | UniMorph repo @ commit | Triples | Lemmas | Bundles | Upstream (per README) |
|---|---|---:|---:|---:|---|
| Turkish | `unimorph/tur` @ `6c179ac` | 570,420 | 3,579 | 883 | Verbs semi-automatic, partly verified; nouns/adjectives Wiktionary, unverified |
| Urdu | `unimorph/urd` @ `17b2fb3` | 12,572 | 182 | 217 | Not documented (no README) |
| Evenki | `unimorph/evn` @ `cdbe7b4` | 11,371 | 4,495 | 1,021 | Annotated text corpus (E. Klyachko) |
| Chukchi | `unimorph/ckt` @ `facbd48` | 241 | 196 | 99 | chuklang.ru corpus |
| Romanian | `unimorph/ron` @ `0910e78` | 80,262 | 4,405 | 59 | Wikipedia |

Counts are after removing duplicate lines. The files are not committed. `npm run data:fetch`, which also runs automatically before every build, downloads them at the pinned commits into `unimorph-data/`.

## Experiment

- **Task:** inflection, (lemma, UniMorph bundle) → form.
- **Metrics:** exact-match accuracy (mean ± s.d. over 5 seeds) and mean Levenshtein distance.
- **Sampling:** each seed samples up to 10 cells per lemma until the universe reaches about 3,000 triples.
- **Splits:** the random split holds out items; the lemma-disjoint split holds out whole lemmas. Both splits use the same universe.
- **Size:** test sets have up to 500 items, and there are five training sizes from 50 to 1000.
- **Significance:** a paired bootstrap over the pooled test items, with 2,000 resamples.

| System | Idea |
|---|---|
| Atomic-tag rules (baseline) | Edit rules keyed by the whole bundle as an opaque label, using nearest-ending analogy. It follows the spirit of the CoNLL-SIGMORPHON 2017 non-neural baseline. |
| Paradigm memory | Reinflects from forms of the *same* lemma already seen in training; otherwise it falls back to the baseline. It can only benefit from lemma overlap. |
| Feature-aware rules | Decomposes bundles into features. For an unseen bundle it combines lemma→A with a feature-difference rule A→T learned from any training paradigm (e.g. NOM→ABL). |

**Findings.** These are measured at n = 500 on the lemma-disjoint split unless noted, and apply only to these simple systems.
- Feature-aware rules beat the baseline for **Urdu by +4.8 points** (95% CI +3.8 to +5.8, p < 0.001) and for **Romanian by +0.4** (+0.2 to +0.7, p < 0.001).
- There is no significant difference for Turkish (+0.2), Evenki (−0.2) or Chukchi (n = 100, +1.3).
- The gains come from test items whose bundle never appeared in training.
- Paradigm memory beats the baseline on the random split for Turkish (+2.4) and Urdu (+3.7), where 80% and 94% of test lemmas were seen in training. On the lemma-disjoint split it equals the baseline by construction.

## Architecture

```
scripts/
  fetch-unimorph.mjs       UniMorph files at pinned commits → unimorph-data/ (runs before every build)
  build-data.mjs           featured lemmas, comparison examples, record audit → src/data/generated/unimorph-sample.json
  run-experiment.mjs       splits, systems, seeds, bootstrap → src/data/generated/experiment-results.json + public/data/*
  check-morphology.mts     regression checks: alignment, audit, matching, live search
src/app/api/search/        full-data search (exact → lemma → loose → nearest), bundle counts
src/lib/unimorph-server.ts in-memory index over the full files (server only)
src/lib/stem.ts            surface alignment with confidence levels
src/lib/audit.ts           rule-based record audit (Romanian Number)
src/lib/lookup.ts          canonical and loose matching rules
src/lib/analysis.ts        one Analysis shape: source record + MorphoLens interpretation
src/lib/compare.ts         comparison slots (UniMorph → reference pattern → withheld)
src/data/                  types, languages, UniMorph loader + feature glossary, hand-annotated entries, results loader
src/app/                   /, /explore, /compare, /experiment, /about
```

## Running locally

```bash
npm install
npm run dev
```

The first `npm run build` or `npm run data:fetch` downloads about 35 MB from GitHub. To reproduce the data and results exactly:

```bash
npm run data:fetch
npm run data:build
npm run experiment
```

## Tests

```bash
npm test
```

This checks the surface alignment (e.g. *caselor* → *case + lor*, *ağacı* → *ağac + ı*, *merseserăți* → *mers + eserăți*), the Romanian audit rules and the matching rules. To also check the search API of a running site:

```bash
npm run test:live
```

## Build

```bash
npm run build
```

Other scripts: `npm run lint` and `npm run typecheck`.

## Downloads & citation

The results are available as [JSON](https://morpholens-app.vercel.app/data/morpholens-results.json) and [CSV](https://morpholens-app.vercel.app/data/morpholens-results.csv), along with the [explorer sample and audit summary](https://morpholens-app.vercel.app/data/unimorph-sample.json).

```bibtex
@misc{morpholens,
  title        = {MorphoLens: Exploring Morphological Generalisation to Unseen Lemmas},
  howpublished = {\url{https://morpholens-app.vercel.app}},
  note         = {Version 0.4. Data: UniMorph tur, urd, evn, ckt, ron at pinned commits},
  year         = {2026}
}
```

Please also cite UniMorph and the per-language sources.

## Future research

1. **Neural baselines:** XLM-R or ByT5 trained on surface forms only, versus the same model with features and segmentation, run through the same splits.
2. **Cross-resource checks:** compare UniMorph records with independent resources (e.g. Apertium dictionaries, Wiktionary) and surface disagreements.
3. **More audit rules:** extend the record audit beyond Romanian Number.
4. **Better composition:** composition that respects affix order and vowel harmony in agglutinative languages.
5. **Validation:** expert review of forms and gold segmentations, recording the reviewer and date.

## References

- Batsuren et al. (2022). *UniMorph 4.0: Universal Morphology.* LREC.
- Cotterell et al. (2017). *CoNLL-SIGMORPHON 2017 Shared Task: Universal Morphological Reinflection in 52 Languages.*
- Goldman, Guriel & Tsarfaty (2022). *(Un)solving Morphological Inflection: Lemma Overlap Artificially Inflates Models' Performance.* ACL.
- Pimentel, Ryskina et al. (2021). *SIGMORPHON 2021 Shared Task on Morphological Reinflection.*
- Vylomova et al. (2020). *SIGMORPHON 2020 Shared Task 0: Typologically Diverse Morphological Inflection.*
- Göksel & Kerslake (2005). *Turkish: A Comprehensive Grammar.* Schmidt (1999). *Urdu: An Essential Grammar.*

---

MorphoLens is built for exploring morphological generalisation, not for replacing linguistic expertise.
