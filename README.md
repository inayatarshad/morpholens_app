# MorphoLens

**Explore how words change across languages.** An interactive research prototype for low-resource morphology, lexical variation and unseen-word generalisation.

> **Research prototype.** MorphoLens demonstrates an *interface and research workflow*. It does not ship a morphological analyser, and every quantitative result in the UI is **illustrative**.

---

## Research motivation

Multilingual models often look strong on morphology when the test data contains **familiar lemmas**. With a random train/test split, `walked` and `walking` can land in training while `walks` lands in test. The test form is new, but the lexical item is not, so a model can succeed through stem familiarity instead of composing morphology.

To test real morphological generalisation you need **unseen lexical items**: a **lemma-disjoint** split puts every form of a test lemma outside training. MorphoLens is built around one question:

> *Can explicit morphological structure help multilingual models generalise to unseen word forms and unseen lemmas in low-resource languages?*

## Features

- **Morphology explorer** (`/explore`): look up a stored form to see its segmentation as aligned morpheme blocks, its feature table, a morpheme-by-morpheme interpretation, difficulty tags and data provenance. It accepts ASCII input for Turkish (`kitaplarimizdan`) and Roman Urdu spelling variants (`larke`, `larkay`).
- **Paradigm view**: compact tables of related forms. Clicking a row loads that form's analysis.
- **Cross-language comparison** (`/compare`): shows how Plural, Case, Possession, Past tense and Negation are encoded in each language, plus a typological table (strategy, position, resource level). Unverified candidates stay hidden until you switch them on.
- **Lemma-disjoint experiment simulator** (`/experiment`): compares random and lemma-disjoint splits at 50, 100, 250 and 500 training examples, with a bar chart, a generalisation-gap panel, a few-shot learning curve and a hypothetical prediction example. Every value is labelled **ILLUSTRATIVE**.
- **Morphological difficulty tags**: UNSEEN LEMMA, ALLOMORPHY, RARE FEATURE, ORTHOGRAPHIC VARIATION, LONG MORPHEME CHAIN and CODE-SWITCHING, all annotated in the dataset.
- **Provenance-aware data architecture**: every form records its source, dataset, record ID, cross-check target and verification flag. The **Evidence drawer** opens the full provenance record for any form.
- **Methodology page** (`/about`): research question, evaluation design, data provenance and limitations.

## Languages

| Language | Family | Script | Resource level | Current local coverage |
|---|---|---|---|---|
| Evenki | Tungusic | Cyrillic | Low-resource | 1 **unverified** candidate |
| Chukchi | Chukotko-Kamchatkan | Cyrillic | Low-resource | none, schema slots only |
| Turkish | Turkic | Latin | Higher-resource comparison | textbook paradigms (ev, kitap, gel, git) |
| Urdu | Indo-Aryan | Perso-Arabic (Nastaliq) | Low-resource NLP | textbook noun and perfective paradigms, plus 1 unverified code-switching form |

Coverage is uneven on purpose. Evenki and Chukchi slots stay empty or visibly unverified until forms can be checked by a linguist or against a published resource. The interface shows these gaps openly.

## Research integrity

- **Experiment numbers are not measurements.** `src/data/experiments.ts` computes them with a deterministic formula anchored to example values from the design brief. Each chart and panel carries an `ILLUSTRATIVE` label.
- **Example predictions are hypothetical.** No model produced them.
- **Verification has two levels:**
  - `verified: true` (**Reference pattern**) means the form follows a textbook-attested pattern cited in `source` (Göksel & Kerslake 2005 for Turkish, Schmidt 1999 for Urdu). It has **not** been checked against a UniMorph release or reviewed by a linguist, and each entry states this.
  - `verified: false` (**Unverified / demo**) means the form is illustrative only and must not be cited.
- No speaker numbers, benchmark scores, dataset sizes or community claims are included.

## Architecture

```
src/
├─ app/
│  ├─ layout.tsx            fonts (Newsreader, Inter, JetBrains Mono, Noto Nastaliq Urdu) + AppShell
│  ├─ globals.css           palette tokens + fluid typography
│  ├─ page.tsx              home
│  ├─ explore/page.tsx
│  ├─ compare/page.tsx
│  ├─ experiment/page.tsx
│  └─ about/page.tsx
├─ components/
│  ├─ AppShell, Navbar, Footer, ResearchBadge
│  ├─ LanguageSelector, LanguageCard
│  ├─ Explorer, MorphologyInput, MorphologyAnalysis, MorphemeBreakdown, FeatureTable, ParadigmTable
│  ├─ ComparisonMatrix
│  ├─ ExperimentWorkspace, ExperimentControls, ExperimentChart, GeneralisationGap, PredictionExample
│  ├─ DataProvenance, EvidenceDrawer, VerificationBadge, DifficultyTags, ResearchNote
│  └─ ui.tsx (SectionLabel, Panel, CopyButton)
├─ data/
│  ├─ types.ts              Language, MorphologicalEntry, ParadigmEntry, ComparisonExample …
│  ├─ languages.ts          language metadata
│  ├─ morphology.ts         entries, paradigms, comparison slots, difficulty vocabulary
│  └─ experiments.ts        ILLUSTRATIVE results + prediction scenarios
└─ lib/lookup.ts            normalisation + lookup (diacritic/ı folding, aliases)
```

The UI only reads from `src/data`, so you can swap in real resources without touching any components:

| Replace | With |
|---|---|
| `entries` in `morphology.ts` | A build-time script that converts **UniMorph** TSV (`lemma \t form \t features`) into `MorphologicalEntry[]`, with `unimorph` = the feature string and `source` = release + commit |
| `paradigm` fields | Rows grouped by lemma from the same UniMorph file |
| `segmentation` / `morphemes` | Output of a segmentation resource or a hand-annotated file |
| New languages | Add a `Language` to `languages.ts` and extend `LanguageId` in `types.ts` |
| `comparisons` | One `ComparisonExample` per (language, feature), pointing to an `entryId` that supplies its provenance |
| `getResult()` in `experiments.ts` | A lookup into a JSON file of measured results keyed by `lang/split/size/model` |
| `predictionScenarios` | Real model outputs on the lemma-disjoint test set |

Adding an entry makes it appear in the explorer, the comparison view (if a `ComparisonExample` references it) and the evidence drawer automatically.

## Future research

1. **Real UniMorph ingestion**: TSV → `MorphologicalEntry` converter, keeping release version and commit as provenance.
2. **XLM-R baseline**: fine-tune on surface forms only.
3. **XLM-R + morphological features**: the same encoder with feature-bundle and segmentation supervision.
4. **Lemma-disjoint evaluation**: group-aware splitting by lemma, reported alongside random splits.
5. **Few-shot learning curves**: 50 / 100 / 250 / 500 examples, with multiple seeds and confidence intervals.
6. **Allomorphy analysis**: break down errors by harmony class, consonant alternation and gender class.
7. **Human linguistic validation**: expert review of every entry, then promote `verified` flags with the reviewer and date recorded.

## Running locally

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Build

```bash
npm run build
npm start
```

Other scripts: `npm run lint` and `npm run typecheck`.

---

MorphoLens is built for exploring morphological generalisation, not for replacing linguistic expertise.
