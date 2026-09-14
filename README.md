# MorphoLens

**Explore how words change across languages.** MorphoLens is an interactive research workspace for low-resource morphology, unseen-lemma generalisation and morphological resource quality. It is built on UniMorph data for Turkish, Urdu, Evenki, Chukchi and Romanian.

Live: https://morpholens-app.vercel.app · Version 0.6

## Research motivation

Inflection systems often look strong when the test data contains **familiar lemmas**: other forms of the same word were seen during training, so a system can recall instead of compose. Lemma overlap has been shown to inflate reported inflection accuracy (Goldman, Guriel & Tsarfaty, 2022).

MorphoLens asks one question:

> *Can explicit morphological structure help models generalise to unseen word forms and unseen lemmas in low-resource languages?*

It answers it by comparing **random** and **lemma-disjoint** evaluation on the same data.

The framing is deliberately modest. MorphoLens makes multilingual morphological resources inspectable, separates source records from automatic interpretations, evaluates lemma-disjoint generalisation, and surfaces resource uncertainty, variant forms and annotation inconsistencies.

## Features

- **Morphology explorer** (`/explore`): searches the **full** pinned UniMorph file for a language on the server.
  - Each result is split into a **source record** and a **MorphoLens interpretation**.
    - Source record: the verbatim line, dataset and commit, upstream source, licence, status and tag validation.
    - Interpretation: surface alignment with a confidence level, stem alternation, ambiguity and the record audit.
  - Syncretism (same lemma and part of speech, different cells) is kept apart from cross-category ambiguity (another part of speech or lemma).
  - Lemma queries open the full, filterable paradigm, with flagged rows marked.
- **Cross-language comparison** (`/compare`): Plural, Case, Possession, Past tense and Negation.
  - Examples come from UniMorph, and audit-flagged or non-schema records are never used.
  - Hand-curated reference patterns appear only where UniMorph has no example.
  - The Chukchi examples carry hand annotations: a transparent absolutive plural, and the gə-…-lin perfect.
- **Unseen-lemma experiment** (`/experiment`): three transparent rule systems and two PyTorch neural models, two splits, five training sizes and five seeds.
  - Scoring comes in two forms: **strict** and **variant-aware** exact match.
  - Each difference has a paired-bootstrap 95% interval and p-value, plus mean edit distance.
  - Breakdowns show seen vs unseen bundles and lemmas.
- **Methodology** (`/about`): data provenance, how search works, how to read an analysis, tag validation, record audits, experiment design, generated results text, limitations, downloads, citation and references.

## Data and provenance

| Language | UniMorph repo @ commit | Triples | Upstream |
|---|---|---:|---|
| Turkish | `unimorph/tur` @ `6c179ac` | 570,420 | Verbs semi-automatic, partly native-speaker verified; nouns/adjectives from Wiktionary, unverified (README) |
| Urdu | `unimorph/urd` @ `17b2fb3` | 12,572 | Not documented (no README) |
| Evenki | `unimorph/evn` @ `cdbe7b4` | 11,371 | README source: TBA. Pimentel et al. (2021): converted from a corpus of oral Evenki texts in IPA (Kazakevich & Klyachko, 2013); annotator Elena Klyachko |
| Chukchi | `unimorph/ckt` @ `facbd48` | 241 | Transcriptions of spoken Chukchi, Amguema variant (Amguema corpus, Chuklang); CoNLL-U annotation by Tyers & Mishchenkova (2020), converted to UniMorph for SIGMORPHON 2021 |
| Romanian | `unimorph/ron` @ `0910e78` | 80,262 | Wikipedia (README), CC BY-SA 3.0 |

Counts are after removing duplicate lines. The files are not committed: `npm run data:fetch` downloads them at the pinned commits (this also runs before every build).

Chukchi is corpus-derived, not a paradigm lexicon: 168 of 196 lemmas have a single record, and 128 records are citation forms. Of its 241 records, 234 are usable in the experiment (7 with non-schema tags are excluded); its test sets hold 58 items per seed, and training sizes stop at 100. Evenki cells often hold several dialectal or transcription variants; the 3SG past cell of *bi* has 17 stored forms.

## Tag validation

Every tag atom is checked against the union of the two published UniMorph feature lists: `unimorph-schema-json/dimensions-to-features.json` and `um-canonicalize/tags.yaml`. Atoms missing from both are handled per dataset:

| Language | Tag | Records | Treatment |
|---|---|---:|---|
| Turkish | `INFR` (the lists have `INFER`) | 183,456 | Convention, kept |
| Turkish | `LOC` | 21,802 | Convention, kept |
| Evenki | `PSSRS`, `PSSRP` (reflexive possessor) | 451, 248 | Convention, kept |
| Chukchi | `ARBAB3S`, `ARBAB1S`, `ARBEB1S`, `ARBEB1P` | 7 | Anomaly: fits no `ARG` + case + person/number template; stored verbatim, flagged, excluded from the experiment |

## Record audit (Romanian)

UniMorph `ron` contains systematic tag errors. MorphoLens checks noun and adjective records against unambiguous cues, counting a cue only when the ending is not already part of the lemma:

- **Number:** indefinite articles *o, un, unei, unui* (singular) and *niște, unor* (plural); definite endings *-lui*, *-ul*, genitive/dative *-ei* and feminine *-a* (singular), and *-lor* and nominative *-ii* (plural). **10,171 of 22,943** cue-bearing records conflict (44%).
- **Adjective Gender:** *-ă*, definite *-a* and genitive/dative *-ei* are feminine singular; definite *-ul(ui)* is masculine or neuter singular; definite *-ii* is masculine plural. Neuter adjectives agree like masculines in the singular, so *-ă* is never neuter. **2,822 of 4,398** cue-bearing adjective records conflict (64%); for example, *abandonabilă* is tagged NEUT.

Samples from every rule were checked by hand, and all were genuine errors. Flagged records are shown as stored, marked in the explorer, and kept out of comparisons. Other dimensions are not audited.

## Reading an analysis

- **UniMorph record:** stored in the pinned UniMorph file; not independently verified by MorphoLens.
- **Reference pattern:** a hand-annotated textbook form absent from UniMorph (e.g. Turkish *ev*, *kitap*).
- **Hand segmentation:** morpheme boundaries annotated by the MorphoLens author following the cited sources; not expert-reviewed.
- **Surface alignment is not morphological segmentation.** UniMorph stores feature bundles, not morpheme boundaries. The alignment strips citation endings and reports a confidence level:
  - **High:** pure affixation (*kedi + ler*).
  - **Medium:** one alternating stem segment supported by the paradigm (*case + lor*, casă ~ case-).
  - **Low:** unsupported or substring-only.
  - **None:** suppletion (*fă*).
- **Difficulty tags** carry their provenance: *data*, *heuristic*, *hand* or *experiment*.

## Experiment

- **Task:** inflection, (lemma, UniMorph bundle) → form.
- **Metrics:** strict exact match, variant-aware exact match (any stored form of the same lemma and bundle counts), and mean Levenshtein distance.
- **Sampling:** up to 10 cells per lemma until the universe reaches about 3,000 triples, and the same universe is used for both splits.
- **Size:** test sets have up to 500 items per seed (25% of the sampled records when that is smaller: 58 for Chukchi), and there are five training sizes from 50 to 1000 where the data allow.
- **Significance:** paired bootstrap, 2,000 resamples.
- **Data preparation:** non-schema anomalies are excluded. Romanian uses verbs only, because its noun and adjective tags are unreliable; a raw run on all Romanian records is reported separately and not used for claims.

| System | Idea |
|---|---|
| Atomic-tag rules (baseline) | Edit rules keyed by the whole bundle as an opaque label, using nearest-ending analogy. It follows the spirit of the CoNLL-SIGMORPHON 2017 non-neural baseline. |
| Paradigm memory | Reinflects from forms of the *same* lemma seen in training; otherwise it falls back to the baseline. It can only benefit from lemma overlap. |
| Feature-aware rules | Decomposes bundles into features and composes lemma→A with a feature-difference rule A→T learned across paradigms. |
| Neural, atomic tag | Small character-level Transformer encoder-decoder (the SIGMORPHON 2020 baseline design of Wu, Cotterell & Hulden 2021, scaled down for CPU) with a copy head over the lemma characters. The whole bundle is one input token; an unseen bundle is an unknown token. |
| Neural, features | The same network, schedule and seeds, but each feature is its own input token. |

The neural models (`scripts/neural.py`) are trained from scratch in every run on exactly the same items as the rule systems, with a schedule fixed in advance and no development set, because the rule systems get no tuning data either. The two differ only in how the bundle is presented, so their difference is the neural counterpart of the atomic vs feature-aware rule comparison. They are CPU baselines, not state of the art. Predictions are committed in `experiments/neural/`, so `npm run experiment` reproduces every number without Python.

**Findings.** These are at n = 500 on the lemma-disjoint split (Chukchi n = 100), strict unless noted, and apply only to these systems.
- **Urdu:** feature-aware rules are **+4.8 points** above the baseline (95% CI +3.8 to +5.9, p < 0.001).
- **No significant difference:** Turkish (+0.2), Evenki (−0.2; −0.1 variant-aware), Chukchi (+1.7) and Romanian verbs (±0.0).
- **Romanian raw run:** on all Romanian records the difference is +0.4. It disappears on verbs, so it is not read as a morphological effect.
- **Evenki scoring:** variant-aware scoring raises Evenki accuracy for every system, because 16% of test items have more than one stored form.
- **Paradigm memory:** it beats the baseline only on random splits with high lemma overlap (Turkish, Urdu). On lemma-disjoint splits it equals the baseline by construction.
- **Neural, feature vs atomic tag tokens:** the same network is far more accurate with one token per feature: Turkish +25.6, Urdu +22.8, Evenki +12.8, Romanian verbs +33.2 points (all p < 0.001); Chukchi +2.4 (n.s.). With one token per bundle the network almost never learns Turkish (1.7%), where bundles are numerous and each one is rare.
- **Neural vs rules:** at n ≤ 500 the neural feature model is below the feature-aware rules in every language (Turkish −10.1, Urdu −10.9, Evenki −13.6, Romanian verbs −24.8, Chukchi −33.1). At n = 1000 it overtakes them on Turkish (+7.4, 95% CI +5.1 to +9.7).
- **Lemma overlap and the neural model:** from the random to the lemma-disjoint split, the neural feature model drops from 43.6 to 27.4 on Turkish and from 73.9 to 59.1 on Urdu, while the atomic-tag rules do not drop (34.2 → 37.3, 65.7 → 65.2). The splits have different test items, so this comparison is descriptive.

## Architecture

```
scripts/
  fetch-unimorph.mjs       UniMorph files at pinned commits → unimorph-data/ (runs before every build)
  build-data.mjs           featured lemmas, comparisons, audits, tag validation, variant stats → src/data/generated/unimorph-sample.json
  run-experiment.mjs       splits, systems, seeds, both metrics, bootstrap → src/data/generated/experiment-results.json + public/data/*
                           (--splits-only writes the exact train/test splits for neural.py)
  neural.py                PyTorch Transformer with copy, atomic vs feature tag tokens → experiments/neural/*.json.gz
  check-morphology.mts     regression checks: alignment, audits, tag validation, matching, live search
src/app/api/search/        full-data search (exact → lemma → loose → nearest), bundle counts
src/lib/unimorph-server.ts in-memory index over the full files (server only)
src/lib/schema.ts          UniMorph schema validation (generated from the published lists)
src/lib/audit.ts           Romanian Number and adjective Gender audit
src/lib/stem.ts            surface alignment with confidence levels
src/lib/lookup.ts          canonical and loose matching rules
src/lib/analysis.ts        one Analysis shape: source record + MorphoLens interpretation
src/lib/compare.ts         comparison slots (UniMorph → hand annotation → reference pattern → withheld)
src/data/                  types, languages, UniMorph loader + feature glossary, hand-annotated entries, results loader, version
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

To retrain the neural models (Python 3 with CPU PyTorch, `pip install torch --index-url https://download.pytorch.org/whl/cpu`; about 1.5 hours on a 6-core laptop, resumable):

```bash
npm run experiment:splits
npm run experiment:neural
npm run experiment
```

## Tests

```bash
npm test
```

To also check the search API of the live site:

```bash
npm run test:live
```

## Build

```bash
npm run build
```

Other scripts: `npm run lint` and `npm run typecheck`.

## Downloads & citation

The results are available as [JSON](https://morpholens-app.vercel.app/data/morpholens-results.json) and [CSV](https://morpholens-app.vercel.app/data/morpholens-results.csv), together with the [explorer sample, audits and tag validation](https://morpholens-app.vercel.app/data/unimorph-sample.json).

```bibtex
@misc{morpholens,
  title        = {MorphoLens: Exploring Morphological Generalisation to Unseen Lemmas},
  howpublished = {\url{https://morpholens-app.vercel.app}},
  note         = {Version 0.6. Data: UniMorph tur, urd, evn, ckt, ron at pinned commits},
  year         = {2026}
}
```

Please also cite UniMorph and the per-language sources.

## Future research

1. **Stronger neural systems:** data hallucination (Anastasopoulos & Neubig, 2019), a full-size Transformer on GPU, and pretrained models such as ByT5, run through the same splits and both metrics.
2. **Cross-resource checks:** compare against Apertium dictionaries and Wiktionary.
3. **Audit coverage:** extend audits beyond Romanian Number and adjective Gender.
4. **Expert review:** have speakers or linguists review the hand annotations and flagged records.

## References

- Batsuren et al. (2022). *UniMorph 4.0: Universal Morphology.* LREC.
- Cotterell et al. (2017). *CoNLL-SIGMORPHON 2017 Shared Task: Universal Morphological Reinflection in 52 Languages.*
- Dunn, M. (1999). *A Grammar of Chukchi.* PhD thesis, Australian National University.
- Goldman, Guriel & Tsarfaty (2022). *(Un)solving Morphological Inflection: Lemma Overlap Artificially Inflates Models' Performance.* ACL.
- Kann, K. & Schütze, H. (2016). *Single-Model Encoder-Decoder with Explicit Morphological Representation for Reinflection.* ACL.
- Kazakevich, O. A. & Klyachko, E. L. (2013). *Создание мультимедийного аннотированного корпуса текстов как исследовательская процедура.*
- McCarthy et al. (2018). *Marrying Universal Dependencies and Universal Morphology.* UDW.
- Pimentel, Ryskina et al. (2021). *SIGMORPHON 2021 Shared Task on Morphological Reinflection: Generalization Across Languages.*
- See, Liu & Manning (2017). *Get To The Point: Summarization with Pointer-Generator Networks.* ACL.
- Sharma, Katrapati & Sharma (2018). *IIT(BHU)-IIITH at CoNLL-SIGMORPHON 2018 Shared Task on Universal Morphological Reinflection.*
- Tyers, F. & Mishchenkova, K. (2020). *Dependency annotation of noun incorporation in polysynthetic languages.* UDW.
- Vylomova et al. (2020). *SIGMORPHON 2020 Shared Task 0: Typologically Diverse Morphological Inflection.*
- Wu, Cotterell & Hulden (2021). *Applying the Transformer to Character-level Transduction.* EACL.
- Göksel & Kerslake (2005). *Turkish: A Comprehensive Grammar.* Schmidt (1999). *Urdu: An Essential Grammar.*

---

MorphoLens is built for exploring morphological generalisation, not for replacing linguistic expertise.
