# MorphoLens

**Explore how words change across languages.** MorphoLens is an interactive research workspace for low-resource morphology and unseen-lemma generalisation. It is built on UniMorph data for Turkish, Urdu, Evenki, Chukchi and Romanian.

Live: https://morpholens-app.vercel.app

## Research motivation

Inflection systems often look strong when the test data contains **familiar lemmas**: other forms of the same word were seen during training, so a system can recall rather than compose. Lemma overlap has been shown to inflate reported inflection accuracy (Goldman, Guriel & Tsarfaty, 2022).

MorphoLens asks one question:

> *Can explicit morphological structure help models generalise to unseen word forms and unseen lemmas in low-resource languages?*

It answers it by comparing **random** and **lemma-disjoint** evaluation on the same data.

## Features

- **Morphology explorer** (`/explore`): search forms from the shipped UniMorph sample or the hand-annotated entries.
  - Every UniMorph bundle a form realises is shown, which makes syncretism visible.
  - Each analysis includes a readable feature table, a segmentation (gold for hand-annotated entries, automatic lemma–form alignment otherwise), the paradigm, and difficulty tags computed from the data.
  - Every form has a verbatim evidence record.
- **Cross-language comparison** (`/compare`): Plural, Case, Possession, Past tense and Negation across five languages.
  - Examples are drawn from UniMorph, with an automatic classification of the surface strategy.
  - Hand-curated reference patterns fill a slot only when UniMorph has no example.
  - Slots with unreliable data are withheld, with the reason shown.
- **Unseen-lemma experiment** (`/experiment`): measured results for three transparent systems, two splits, five training sizes and five seeds.
  - Includes learning curves and a cross-language findings table.
  - Shows real system outputs on test items.
- **Methodology** (`/about`): data sources with commit hashes, the experiment design, results, data-quality notes, limitations and references.

## Data

| Language | UniMorph repo @ commit | Triples | Lemmas | Bundles |
|---|---|---:|---:|---:|
| Turkish | `unimorph/tur` @ `6c179ac` | 570,420 | 3,579 | 883 |
| Urdu | `unimorph/urd` @ `17b2fb3` | 12,572 | 182 | 217 |
| Evenki | `unimorph/evn` @ `cdbe7b4` | 11,371 | 4,495 | 1,021 |
| Chukchi | `unimorph/ckt` @ `facbd48` | 241 | 196 | 99 |
| Romanian | `unimorph/ron` @ `0910e78` | 80,262 | 4,405 | 59 |

Counts are after removing duplicate lines. Source facts shown in the UI are taken from each repository's README:
- **Turkish:** verbs are semi-automatically generated; nouns and adjectives come from Wiktionary and are unverified. Licence CC BY-SA 3.0.
- **Evenki:** annotated by E. Klyachko from a text corpus, in Latin transcription.
- **Chukchi:** from chuklang.ru; used in SIGMORPHON 2021.

**Data-quality notes** are shown in the UI, not silently fixed. For example, in UniMorph `ron` the plural forms *unor case* and *niște case* are tagged `SG`, and no noun bundle combines `PL` with `INDF`. Romanian plural comparisons are therefore withheld.

The hand-annotated entries (Turkish, Urdu) carry gold segmentation. Each one is labelled either **UniMorph-attested** (the exact triple is in the pinned file) or **Reference pattern** (a textbook form that UniMorph does not contain, e.g. Turkish *ev*, *kitap*).

## Experiment

- **Task:** inflection, i.e. (lemma, UniMorph bundle) → form. **Metric:** exact match, reported as mean ± s.d. over 5 seeds.
- **Sampling:** for each seed, sample up to 10 cells per lemma until the universe holds about 3,000 triples.
- **Splits:** the random split holds out items; the lemma-disjoint split holds out whole lemmas. Test sets hold up to 500 items, and both splits use the same universe.
- **Training sizes:** 50, 100, 250, 500 and 1000, skipped where the pool is too small.

| System | Idea |
|---|---|
| Atomic-tag rules (baseline) | Edit rules keyed by the whole bundle as an opaque label; picks the rule of the training lemma with the longest shared ending, in the spirit of the CoNLL–SIGMORPHON 2017 non-neural baseline. |
| Paradigm memory | Reinflects from seen forms of the *same* lemma; otherwise uses the baseline. It can only benefit from lemma overlap. |
| Feature-aware rules | Decomposes bundles into features. For an unseen bundle it composes lemma→A with a feature-difference rule A→T learned from any training paradigm (e.g. NOM→ABL). |

**Current findings.** These are measured, and hold for these simple systems only.
- Paradigm memory gains only on random splits with high lemma overlap (e.g. Turkish at n = 1000). On lemma-disjoint splits it equals the baseline.
- Feature-difference transfer helps Urdu consistently, helps Turkish slightly, and gives mixed results for Evenki and Romanian.
- Seed variance is often as large as the differences between systems. Chukchi is too small to interpret.

## Architecture

```
scripts/
  fetch-unimorph.mjs     download UniMorph files at pinned commits → .unimorph/
  build-data.mjs         featured lemmas, capped paradigms, comparison examples → src/data/generated/unimorph-sample.json
  run-experiment.mjs     splits, systems, seeds → src/data/generated/experiment-results.json
src/data/
  types.ts               shared types
  languages.ts           language metadata (typological profile only)
  unimorph.ts            typed sample loader, source notes, data-quality notes
  unimorph-features.ts   readable labels for UniMorph features
  morphology.ts          hand-annotated entries with gold segmentation + attestation
  experiments.ts         typed results loader, system descriptions
src/lib/
  analysis.ts            one Analysis shape for UniMorph and hand-annotated forms
  compare.ts             comparison slots (UniMorph → reference pattern → withheld)
  align.ts               lemma–form alignment (mirrors the experiment's rule extractor)
src/app/                 /, /explore, /compare, /experiment, /about
src/components/          UI components
```

To add a language, add a `Language` entry, extend `LanguageId`, add the language code to the three scripts, then re-run them.

## Future research

1. **Neural baselines:** XLM-R or ByT5 with surface forms only, versus the same model with feature-bundle and segmentation supervision, run through the same splits.
2. **Better composition:** affix ordering and harmony-aware composition for agglutinative languages.
3. **Near-miss metrics:** edit distance and per-feature accuracy, not only exact match.
4. **Allomorphy analysis:** break down errors by harmony class, consonant alternation and gender class.
5. **Lexicon ingestion:** structured entries from digitised dictionaries as an additional data source.
6. **Human validation:** expert review of forms, recording the reviewer and date.

## Running locally

```bash
npm install
npm run dev
```

Reproduce the data and results. This downloads about 35 MB from GitHub:

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

## References

- Batsuren et al. (2022). *UniMorph 4.0: Universal Morphology.* LREC.
- Cotterell et al. (2017). *CoNLL–SIGMORPHON 2017 Shared Task: Universal Morphological Reinflection in 52 Languages.*
- Goldman, Guriel & Tsarfaty (2022). *(Un)solving Morphological Inflection: Lemma Overlap Artificially Inflates Models' Performance.* ACL.
- Pimentel, Ryskina et al. (2021). *SIGMORPHON 2021 Shared Task on Morphological Reinflection.*
- Vylomova et al. (2020). *SIGMORPHON 2020 Shared Task 0: Typologically Diverse Morphological Inflection.*
- Göksel & Kerslake (2005). *Turkish: A Comprehensive Grammar.* Schmidt (1999). *Urdu: An Essential Grammar.*

---

MorphoLens is built for exploring morphological generalisation, not for replacing linguistic expertise.
