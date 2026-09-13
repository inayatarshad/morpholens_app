# MorphoLens

**Explore how words change across languages.** MorphoLens is an interactive research workspace for low-resource morphology and unseen-lemma generalisation, built on UniMorph data for Turkish, Urdu, Evenki, Chukchi and Romanian.

Live: https://morpholens-app.vercel.app

## Research motivation

Inflection systems often look strong when the test data contains **familiar lemmas**: other forms of the same word were seen during training, so a system can recall instead of compose. Lemma overlap has been shown to inflate reported inflection accuracy (Goldman, Guriel & Tsarfaty, 2022).

MorphoLens asks one question:

> *Can explicit morphological structure help models generalise to unseen word forms and unseen lemmas in low-resource languages?*

It answers it by comparing **random** and **lemma-disjoint** evaluation on the same data.

## Features

- **Morphology explorer** (`/explore`): searches the **full** pinned UniMorph file for the selected language on the server.
  - Every bundle a form realises is shown, which makes syncretism visible.
  - A lemma query opens its full paradigm, which you can filter by feature code or label.
  - Each analysis has readable features, a segmentation (gold for hand-annotated entries, an automatic lemma–form alignment otherwise), computed difficulty tags and a verbatim evidence record.
- **Cross-language comparison** (`/compare`): Plural, Case, Possession, Past tense and Negation across the five languages.
  - Examples come from UniMorph, with an automatic label for the surface strategy.
  - Hand-curated reference patterns fill a slot only when UniMorph has none.
  - Slots with unreliable data are withheld, and the reason is shown.
- **Unseen-lemma experiment** (`/experiment`): measured results for three transparent systems × two splits × five training sizes × five seeds.
  - Each difference comes with a paired-bootstrap 95% interval and p-value, alongside mean edit distance.
  - A breakdown panel shows where the differences arise: seen vs unseen bundles and lemmas, and errors that just copy the lemma.
  - Also included: learning curves, real system outputs, and a findings table across languages.
- **Methodology** (`/about`): data sources with commit hashes, how search works, experiment design, generated results text, data-quality notes, limitations, downloads, citation and references.

## Search accuracy

1. **Exact:** the spelling must match. The only differences ignored are letter case, Unicode normalisation and keyboard variants that never distinguish words: Romanian ş/ș and ţ/ț, Arabic-keyboard ي/ك vs Urdu ی/ک, apostrophe variants, and zero-width characters.
2. **Lemma:** if the query is a citation form, its full paradigm is shown.
3. **Loose:** only used when nothing matches exactly. Diacritics and transcription details are ignored (ı/i, ă/a, ə/e, ː, Chukchi ԓ/л …), and the results are labelled, because loose matches can be different words (Romanian *casă* ≠ *casa*).
4. **Not attested:** the page says so, reports how many triples were searched, and lists the closest attested forms (edit distance ≤ 2).

## Data

| Language | UniMorph repo @ commit | Triples | Lemmas | Bundles |
|---|---|---:|---:|---:|
| Turkish | `unimorph/tur` @ `6c179ac` | 570,420 | 3,579 | 883 |
| Urdu | `unimorph/urd` @ `17b2fb3` | 12,572 | 182 | 217 |
| Evenki | `unimorph/evn` @ `cdbe7b4` | 11,371 | 4,495 | 1,021 |
| Chukchi | `unimorph/ckt` @ `facbd48` | 241 | 196 | 99 |
| Romanian | `unimorph/ron` @ `0910e78` | 80,262 | 4,405 | 59 |

Counts are after removing duplicate lines. The files are not committed. `npm run data:fetch`, which also runs automatically before every build, downloads them at the pinned commits into `unimorph-data/`.

Data-quality notes are shown in the UI rather than silently fixed. For example, in UniMorph `ron` the plural forms *unor case* and *niște case* are tagged `SG`, so Romanian plural comparisons are withheld.

## Experiment

- **Task:** inflection, (lemma, UniMorph bundle) → form.
- **Metrics:** exact-match accuracy (mean ± s.d. over 5 seeds) and mean Levenshtein distance.
- **Sampling:** each seed samples up to 10 cells per lemma until the universe reaches about 3,000 triples.
- **Splits:** the random split holds out items; the lemma-disjoint split holds out whole lemmas. Both splits use the same universe.
- **Size:** test sets have up to 500 items, and there are five training sizes from 50 to 1000.
- **Significance:** a paired bootstrap over the pooled test items, with 2,000 resamples.

| System | Idea |
|---|---|
| Atomic-tag rules (baseline) | Edit rules keyed by the whole bundle as an opaque label, using nearest-ending analogy. It follows the spirit of the CoNLL–SIGMORPHON 2017 non-neural baseline. |
| Paradigm memory | Reinflects from forms of the *same* lemma already seen in training; otherwise it falls back to the baseline. It can only benefit from lemma overlap. |
| Feature-aware rules | Decomposes bundles into features. For an unseen bundle it combines the rule lemma→A with a feature-difference rule A→T learned from any training paradigm (e.g. NOM→ABL). |

**Findings.** These are measured at n = 500 on the lemma-disjoint split unless noted, and apply only to these simple systems.
- Feature-aware rules beat the baseline for **Urdu by +4.8 points** (95% CI +3.8 to +5.8, p < 0.001) and for **Romanian by +0.4** (+0.2 to +0.7, p < 0.001).
- There is no significant difference for Turkish (+0.2), Evenki (−0.2) or Chukchi (n = 100, +1.3).
- The gains come from test items whose bundle never appeared in training.
- Paradigm memory beats the baseline on the random split for Turkish (+2.4) and Urdu (+3.7), where 80% and 94% of test lemmas were seen in training. On the lemma-disjoint split it equals the baseline by construction.

## Architecture

```
scripts/
  fetch-unimorph.mjs     UniMorph files at pinned commits → unimorph-data/ (runs before every build)
  build-data.mjs         featured lemmas + comparison examples → src/data/generated/unimorph-sample.json
  run-experiment.mjs     splits, systems, seeds, bootstrap → src/data/generated/experiment-results.json + public/data/*
src/app/api/search/      full-data search (exact → lemma → loose → nearest)
src/lib/unimorph-server.ts   in-memory index over the full files (server only)
src/lib/lookup.ts        canonical and loose matching rules
src/lib/analysis.ts      one Analysis shape for UniMorph and hand-annotated forms
src/lib/compare.ts       comparison slots (UniMorph → reference pattern → withheld)
src/data/                types, languages, UniMorph loader + feature glossary, hand-annotated entries, results loader
src/app/                 /, /explore, /compare, /experiment, /about
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

## Build

```bash
npm run build
```

Other scripts: `npm run lint` and `npm run typecheck`.

## Downloads & citation

The results are available as [JSON](https://morpholens-app.vercel.app/data/morpholens-results.json) and [CSV](https://morpholens-app.vercel.app/data/morpholens-results.csv), along with the [explorer sample](https://morpholens-app.vercel.app/data/unimorph-sample.json).

```bibtex
@misc{morpholens,
  title        = {MorphoLens: Exploring Morphological Generalisation to Unseen Lemmas},
  howpublished = {\url{https://morpholens-app.vercel.app}},
  note         = {Version 0.3. Data: UniMorph tur, urd, evn, ckt, ron at pinned commits},
  year         = {2026}
}
```

Please also cite UniMorph and the per-language sources.

## Future research

1. **Neural baselines:** XLM-R or ByT5 trained on surface forms only, versus the same model with features and segmentation, run through the same splits.
2. **Better composition:** composition that respects affix order and vowel harmony in agglutinative languages.
3. **Error analysis:** per-feature accuracy and allomorphy error analysis.
4. **Lexicon ingestion:** structured entries from digitised dictionaries.
5. **Validation:** expert review of forms, recording the reviewer and date.

## References

- Batsuren et al. (2022). *UniMorph 4.0: Universal Morphology.* LREC.
- Cotterell et al. (2017). *CoNLL–SIGMORPHON 2017 Shared Task: Universal Morphological Reinflection in 52 Languages.*
- Goldman, Guriel & Tsarfaty (2022). *(Un)solving Morphological Inflection: Lemma Overlap Artificially Inflates Models' Performance.* ACL.
- Pimentel, Ryskina et al. (2021). *SIGMORPHON 2021 Shared Task on Morphological Reinflection.*
- Vylomova et al. (2020). *SIGMORPHON 2020 Shared Task 0: Typologically Diverse Morphological Inflection.*
- Göksel & Kerslake (2005). *Turkish: A Comprehensive Grammar.* Schmidt (1999). *Urdu: An Essential Grammar.*

---

MorphoLens is built for exploring morphological generalisation, not for replacing linguistic expertise.
