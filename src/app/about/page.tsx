import type { Metadata } from "next";
import { Download, ExternalLink } from "lucide-react";
import { Container } from "@/components/AppShell";
import { experiment, findingSentences } from "@/data/experiments";
import { languages } from "@/data/languages";
import { auditFor, qualityNotes, schemaFor, sourceFor, statsFor } from "@/data/unimorph";
import { VERSION } from "@/data/version";

export const metadata: Metadata = { title: "Methodology" };

function Section({ n, title, children }: { n: string; title: string; children: React.ReactNode }) {
  return (
    <section className="grid gap-4 border-t border-line py-10 md:grid-cols-[14rem_1fr]">
      <div>
        <span className="font-mono text-xs text-sienna">{n}</span>
        <h2 className="display display-sm mt-1 text-bush">{title}</h2>
      </div>
      <div className="min-w-0 max-w-3xl space-y-4 leading-relaxed text-ink/80">{children}</div>
    </section>
  );
}

const references = [
  "Batsuren, K. et al. (2022). UniMorph 4.0: Universal Morphology. Proceedings of LREC 2022.",
  "Cotterell, R. et al. (2017). CoNLL-SIGMORPHON 2017 Shared Task: Universal Morphological Reinflection in 52 Languages.",
  "Goldman, O., Guriel, D. & Tsarfaty, R. (2022). (Un)solving Morphological Inflection: Lemma Overlap Artificially Inflates Models’ Performance. Proceedings of ACL 2022.",
  "Pimentel, T., Ryskina, M. et al. (2021). SIGMORPHON 2021 Shared Task on Morphological Reinflection: Generalization Across Languages.",
  "McCarthy, A. D. et al. (2018). Marrying Universal Dependencies and Universal Morphology. UDW 2018.",
  "Kazakevich, O. A. & Klyachko, E. L. (2013). Создание мультимедийного аннотированного корпуса текстов как исследовательская процедура [Creating a multimedia annotated text corpus as a research procedure].",
  "Dunn, M. (1999). A Grammar of Chukchi. PhD thesis, Australian National University.",
  "Vylomova, E. et al. (2020). SIGMORPHON 2020 Shared Task 0: Typologically Diverse Morphological Inflection.",
  "Tyers, F. & Mishchenkova, K. (2020). Dependency annotation of noun incorporation in polysynthetic languages. UDW 2020.",
  "Kann, K. & Schütze, H. (2016). Single-Model Encoder-Decoder with Explicit Morphological Representation for Reinflection. Proceedings of ACL 2016.",
  "Wu, S., Cotterell, R. & Hulden, M. (2021). Applying the Transformer to Character-level Transduction. Proceedings of EACL 2021.",
  "See, A., Liu, P. J. & Manning, C. D. (2017). Get To The Point: Summarization with Pointer-Generator Networks. Proceedings of ACL 2017.",
  "Sharma, A., Katrapati, G. & Sharma, D. M. (2018). IIT(BHU)-IIITH at CoNLL-SIGMORPHON 2018 Shared Task on Universal Morphological Reinflection.",
  "Göksel, A. & Kerslake, C. (2005). Turkish: A Comprehensive Grammar. Routledge.",
  "Schmidt, R. L. (1999). Urdu: An Essential Grammar. Routledge.",
];

const bibtex = `@misc{morpholens,
  title        = {MorphoLens: Exploring Morphological Generalisation to Unseen Lemmas},
  howpublished = {\\url{https://morpholens-app.vercel.app}},
  note         = {Version ${VERSION}. Data: UniMorph tur, urd, evn, ckt, ron at pinned commits},
  year         = {2026}
}`;

const downloads = [
  { href: "/data/morpholens-results.json", label: "Experiment results (JSON)", note: "All cells, per-seed runs, bootstrap tests, breakdowns, examples" },
  { href: "/data/morpholens-results.csv", label: "Experiment results (CSV)", note: "One row per language × split × n × system" },
  { href: "/data/unimorph-sample.json", label: "Explorer sample (JSON)", note: "Featured lemmas and comparison examples, verbatim UniMorph triples" },
];

export default function AboutPage() {
  const c = experiment.config;
  const findings = findingSentences();
  const ronAudit = auditFor("ron");
  const schemaRows = languages.flatMap((l) =>
    Object.entries(schemaFor(l.id)?.unlisted ?? {}).map(([atom, v]) => ({ lang: l.name, atom, ...v })),
  );
  return (
    <Container className="pt-12">
      <header className="mb-8 max-w-3xl">
        <p className="eyebrow">Methodology · data · limitations</p>
        <h1 className="display display-lg mt-3 text-bush">
          How to read <span className="italic text-sienna">this prototype.</span>
        </h1>
        <p className="lede mt-5 text-ink/75">
          MorphoLens does not claim state-of-the-art morphological analysis. It is an inspectable pipeline: pinned public
          data, simple systems, measured results with uncertainty, and provenance for every form it shows.
        </p>
      </header>

      <Section n="01" title="Research question">
        <p className="font-serif text-xl text-bush">
          Can explicit morphological structure help models generalise to unseen word forms and unseen lemmas in
          low-resource languages?
        </p>
        <p>
          In morphologically rich languages a single lemma yields many surface forms, most of them rare. If test lemmas
          also occur in training, a system can succeed by recalling the lemma’s paradigm instead of composing morphology.
          MorphoLens separates the two by comparing random and lemma-disjoint evaluation.
        </p>
      </Section>

      <Section n="02" title="Data">
        <p>
          All forms and all experiment inputs come from UniMorph repositories, downloaded at fixed commits. Facts below
          are taken from each repository’s README.
        </p>
        <div className="overflow-x-auto rounded-lg border border-line">
          <table className="w-full min-w-[44rem] text-sm">
            <thead className="bg-oak/70 text-left text-bush">
              <tr>
                <th className="px-3 py-2">Language</th>
                <th className="px-3 py-2">Source</th>
                <th className="px-3 py-2 text-right">Triples</th>
                <th className="px-3 py-2 text-right">Lemmas</th>
                <th className="px-3 py-2 text-right">Bundles</th>
                <th className="px-3 py-2">Notes</th>
              </tr>
            </thead>
            <tbody className="bg-ivory/70">
              {languages.map((l) => {
                const s = sourceFor(l.id);
                const st = statsFor(l.id);
                return (
                  <tr key={l.id} className="border-t border-line align-top">
                    <td className="px-3 py-2.5 font-medium text-bush">{l.name}</td>
                    <td className="px-3 py-2.5">
                      <a href={s.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 font-mono text-xs text-sienna underline">
                        {s.label} <ExternalLink size={11} />
                      </a>
                      {s.licence && <span className="block text-[0.7rem] text-muted">{s.licence}</span>}
                    </td>
                    <td className="px-3 py-2.5 text-right font-mono text-xs">{st.triples.toLocaleString("en")}</td>
                    <td className="px-3 py-2.5 text-right font-mono text-xs">{st.lemmas.toLocaleString("en")}</td>
                    <td className="px-3 py-2.5 text-right font-mono text-xs">{st.bundles.toLocaleString("en")}</td>
                    <td className="px-3 py-2.5 text-xs text-muted">{s.summary}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <p className="text-sm">
          Counts are after removing duplicate lines. A small set of hand-annotated entries (Turkish, Urdu and one Chukchi perfect) adds
          morpheme segmentation, which UniMorph does not provide. These were annotated by the MorphoLens author following the cited sources and
          have not been expert-reviewed; each is labelled by whether UniMorph stores the form.
        </p>
      </Section>

      <Section n="03" title="How search works">
        <p>
          The explorer searches the full UniMorph file for the selected language on the server. Source records are retrieved, never generated.
          Everything MorphoLens adds to a record (surface alignment, ambiguity, record audit, difficulty tags) is derived from the stored records and
          shown separately, labelled as interpretation.
        </p>
        <ol className="list-decimal space-y-2 pl-5">
          <li><strong className="text-bush">Exact match</strong>: the same spelling, ignoring only letter case, Unicode normalisation and keyboard variants that never distinguish words (Romanian ş/ș and ţ/ț, Arabic-keyboard ي/ك vs. Urdu ی/ک, apostrophe variants, zero-width characters).</li>
          <li><strong className="text-bush">Lemma match</strong>: if the query is a citation form, its full paradigm is shown.</li>
          <li><strong className="text-sienna">Loose match</strong>: only if nothing matches exactly: diacritics and transcription details are ignored (ı/i, ă/a, ə/e, ː, Chukchi ԓ/л …). These results are labelled, because they can be different words (Romanian <em>casă</em> ≠ <em>casa</em>).</li>
          <li><strong className="text-bush">Not attested</strong>: the page says so, reports how many triples were searched, and lists the closest attested forms (edit distance ≤ 2). Absence from UniMorph is not evidence that a word does not exist.</li>
        </ol>
        <p className="text-sm">
          A form realising several bundles (syncretism) is shown once per bundle. Segmentations of UniMorph forms are automatic lemma-form alignments and are labelled as such.
        </p>
      </Section>

      <Section n="04" title="Reading an analysis">
        <p>
          Every UniMorph result is split into two cards so it is always clear what came from the resource and what
          MorphoLens inferred.
        </p>
        <ul className="list-disc space-y-2 pl-5">
          <li><strong className="text-bush">Source record</strong>: the verbatim line (lemma, form, bundle), dataset and commit, the upstream source named in the repository README, the licence, and the status <em>UniMorph record</em>: stored in UniMorph, not independently verified by MorphoLens.</li>
          <li><strong className="text-bush">MorphoLens interpretation</strong>: the automatic surface alignment and its confidence, any stem alternation, ambiguity with other records of the lemma, and the record audit.</li>
        </ul>
        <p>
          <strong className="text-bush">Surface alignment is not morphological segmentation.</strong> UniMorph stores feature bundles, never
          morpheme boundaries. The alignment removes known citation endings (Turkish -mek/-mak, Urdu -nā and masculine -ā,
          Romanian infinitive vowels) and then reports one of four confidence levels:
        </p>
        <ul className="list-disc space-y-2 pl-5">
          <li><strong>High</strong>: the citation stem occurs unchanged (Turkish <em>kedi + ler</em>, Romanian <em>copil + ului</em>).</li>
          <li><strong>Medium</strong>: one stem segment alternates and the stem variant recurs in other forms of the paradigm (Romanian <em>case + lor</em>, casă ~ case-, also in casei and casele), or a final ending is replaced (<em>cas + a</em>).</li>
          <li><strong>Low</strong>: the alternation is not supported by other forms, or only a longest shared stretch could be aligned (Chukchi <em>гэ + тэйкы + ԓин</em>).</li>
          <li><strong>No split</strong>: suppletive forms that share nothing with the lemma (Romanian <em>fă</em> of <em>face</em>).</li>
        </ul>
        <p>
          Hand segmentations exist only for the hand-annotated entries and carry the label <em>Hand segmentation</em>. They were made by the
          MorphoLens author following the cited sources and have not been expert-reviewed.
        </p>
        <p>
          <strong className="text-bush">Multiple analyses</strong> is the generic case of one string stored more than once. MorphoLens separates it
          into <em>syncretism</em> (the same lemma and part of speech has the same form in different paradigm cells) and <em>cross-category
          ambiguity</em> (the same string under a different part of speech of the lemma, or under a different lemma). The distinction matters for
          corpus-derived data such as Evenki, where participles, converbs and finite forms of one lemma can coincide.
        </p>
        <p>
          <strong className="text-bush">Difficulty tags</strong> say where they come from. <em>Data</em> is read from stored records (syncretism,
          cross-category ambiguity, variant forms, multi-word forms). <em>Heuristic</em> is inferred by MorphoLens: <em>allomorphy</em> means a stem
          variant with one alternating segment (casă ~ case-), <em>stem change</em> means lemma material is replaced or removed without a single
          consistent alternation. <em>Hand</em> comes from hand annotation, and <em>experiment</em> tags (unseen lemma, rare feature) only make sense
          relative to a train/test split.
        </p>
        <p>
          <strong className="text-bush">Tag validation.</strong> Every tag atom is checked against the union of the two published UniMorph feature
          lists (unimorph-schema-json and um-canonicalize). Atoms missing from both are reported per dataset: frequent ones are dataset conventions and
          kept; rare ones that fit no template are anomalies, stored verbatim, flagged and excluded from the experiment.
        </p>
        {schemaRows.length > 0 && (
          <div className="overflow-x-auto rounded-lg border border-line">
            <table className="w-full min-w-[34rem] text-sm">
              <thead className="bg-oak/70 text-left text-bush">
                <tr>
                  <th className="px-3 py-2">Language</th>
                  <th className="px-3 py-2">Tag</th>
                  <th className="px-3 py-2 text-right">Records</th>
                  <th className="px-3 py-2">Treatment</th>
                </tr>
              </thead>
              <tbody className="bg-ivory/70">
                {schemaRows.map((r) => (
                  <tr key={r.lang + r.atom} className="border-t border-line">
                    <td className="px-3 py-2">{r.lang}</td>
                    <td className="px-3 py-2 font-mono text-xs">{r.atom}</td>
                    <td className="px-3 py-2 text-right font-mono text-xs">{r.count.toLocaleString("en")}</td>
                    <td className={`px-3 py-2 text-xs ${r.status === "anomaly" ? "text-sienna" : "text-muted"}`}>
                      {r.status === "anomaly" ? "Anomaly: fits no template; flagged, excluded from the experiment" : "Convention: used systematically; kept"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <p>
          <strong className="text-bush">Several analyses for one form</strong> are all shown. None is marked primary, because MorphoLens has no
          corpus frequencies; they are listed by how many records in the full file carry each bundle, so Romanian <em>caselor</em> lists
          GEN/DAT · PL · DEF before VOC · PL.
        </p>
        <p>
          <strong className="text-bush">Record audit.</strong> For Romanian nouns and adjectives, the Number tag is compared with unambiguous
          cues: indefinite articles (o, un, unei, unui are singular; niște, unor are plural) and definite endings (-lui, -ul, genitive/dative
          -ei and feminine -a are singular; -lor and nominative -ii are plural). For adjectives, the Gender tag is compared with endings that are
          unambiguous for gender (-ă, definite -a and genitive/dative -ei are feminine singular; definite -ul(ui) is masculine or neuter singular;
          definite -ii is masculine plural; neuter adjectives agree like masculines in the singular, so -ă is never neuter). A cue only counts when
          the ending is not already part of the lemma.
          {ronAudit?.byField.Number && (
            <>
              {" "}Number: {ronAudit.byField.Number.conflicts.toLocaleString("en")} of {ronAudit.byField.Number.checked.toLocaleString("en")} cue-bearing records conflict (
              {((100 * ronAudit.byField.Number.conflicts) / ronAudit.byField.Number.checked).toFixed(0)}%).
            </>
          )}
          {ronAudit?.byField.Gender && (
            <>
              {" "}Adjective Gender: {ronAudit.byField.Gender.conflicts.toLocaleString("en")} of {ronAudit.byField.Gender.checked.toLocaleString("en")} (
              {((100 * ronAudit.byField.Gender.conflicts) / ronAudit.byField.Gender.checked).toFixed(0)}%).
            </>
          )}{" "}
          Conflicting records are flagged in the explorer and paradigm tables, shown exactly as stored, and kept out of comparisons. Records without a
          cue are not checked, so an unflagged record is not thereby confirmed, and other dimensions are not audited.
        </p>
      </Section>

      <Section n="05" title="Experiment design">
        <p>
          The task is morphological inflection: predict the form for a (lemma, feature bundle) pair. Metrics: exact-match
          accuracy and mean Levenshtein distance to the stored form. For each of {c.seeds.length} seeds a universe of up to
          ~{c.universeTarget.toLocaleString("en")} triples is sampled ({c.cellsPerLemma} cells per lemma at most). The random split holds out items; the lemma-disjoint
          split holds out whole lemmas. Test sets hold up to {c.testMax} items; training sizes are {c.sizes.join(", ")}. Both splits use the same universe.
        </p>
        <p>
          Differences between systems are tested with a paired bootstrap ({c.bootstrap.toLocaleString("en")} resamples) over the test items pooled across
          seeds; we report the difference in accuracy points, its 95% interval and a two-sided p-value.
        </p>
        <p>
          Every result is reported with two exact-match scores. <em>Strict</em> requires the stored form of the test record. <em>Variant-aware</em>
          accepts any form stored for the same lemma and bundle, because oral Evenki in particular has many dialectal and transcription variants per
          cell: Pimentel et al. (2021) note Evenki outputs that are practically correct but belong to a different dialect.
        </p>
        <p>
          Data preparation: records with anomalous non-schema tags are excluded (7 Chukchi records). Romanian is evaluated on verbs only, because its
          noun and adjective Number and Gender tags are unreliable; the same design on all Romanian records is reported separately as a raw run and
          is not used for claims.
        </p>
      </Section>

      <Section n="06" title="Systems">
        <ul className="list-disc space-y-2 pl-5">
          <li><strong className="text-bush">Atomic-tag rules</strong>: edit rules keyed by the whole bundle; nearest-ending analogy; unseen bundle ⇒ copy the lemma. In the spirit of the CoNLL-SIGMORPHON 2017 non-neural baseline.</li>
          <li><strong className="text-burgundy">Paradigm memory</strong>: reinflects from seen forms of the same lemma (cell-to-cell rules); otherwise the baseline.</li>
          <li><strong className="text-bush">Feature-aware rules</strong>: bundles decomposed into features; composes lemma→A with a feature-difference rule A→T learned across paradigms; otherwise nearest bundle.</li>
          <li><strong className="text-sienna">Neural, atomic tag</strong>: a small character-level Transformer encoder-decoder in PyTorch, the design of the SIGMORPHON 2020 baseline (Wu, Cotterell &amp; Hulden, 2021) scaled down for CPU, with a copy head over the lemma characters in the style of the pointer-generator (See et al., 2017) used for low-resource inflection by Sharma et al. (2018). Tag tokens precede the lemma characters, as in Kann &amp; Schütze (2016). Here the whole bundle is one input token; a bundle never seen in training becomes an unknown token.</li>
          <li><strong className="text-sienna">Neural, features</strong>: the same network, schedule and seeds, but each feature of the bundle is its own input token, so an unseen combination of seen features can still be represented.</li>
        </ul>
        <p className="text-sm">
          All systems are trained from scratch in every run on exactly the same training items and scored on the same test items. The rule systems
          are transparent. The two neural systems differ only in how the bundle is presented, so their difference is the neural counterpart of the
          atomic vs. feature-aware rule comparison. They are small, trained on CPU with a schedule fixed in advance (no development set, no tuning,
          because the rule systems get no tuning data either): baselines for the evaluation design, not state of the art.
        </p>
      </Section>

      <Section n="07" title="Results">
        <p className="text-sm text-muted">Generated from the results file at the largest training size ≤ 500 per language; the Experiment page has every configuration.</p>
        <ul className="list-disc space-y-2 pl-5">
          {findings.map((f) => <li key={f}>{f}</li>)}
        </ul>
        <p className="text-sm">
          The feature-aware gains come almost entirely from test items whose feature bundle never occurred in training
          (see “Where the differences come from” on the Experiment page); on seen bundles the systems are nearly identical.
        </p>
      </Section>

      <Section n="08" title="Provenance & data quality">
        <p>Every form in the interface carries one of two source labels and opens a verbatim evidence record:</p>
        <ul className="list-disc space-y-2 pl-5">
          <li><strong className="text-bush">UniMorph record</strong>: the exact triple is stored in the pinned UniMorph file. MorphoLens has not independently verified it.</li>
          <li><strong className="text-sienna">Reference pattern</strong>: a hand-annotated textbook form that UniMorph does not contain (e.g. Turkish <em>ev</em>, <em>kitap</em>).</li>
        </ul>
        <p>Being stored in UniMorph is not expert validation. Problems observed in the data are reported, not silently corrected:</p>
        <div className="space-y-3">
          {Object.entries(qualityNotes).flatMap(([lang, notes]) =>
            (notes ?? []).map((n) => (
              <div key={lang + n.title} className="rounded-lg border border-sienna/30 bg-sienna/[0.05] p-4 text-sm">
                <p className="font-semibold text-sienna">{languages.find((l) => l.id === lang)?.name} · {n.title}</p>
                <p className="mt-1 text-ink/80">{n.body}</p>
                {n.example && <p className="mt-2 font-mono text-xs text-muted">{n.example}</p>}
              </div>
            )),
          )}
        </div>
      </Section>

      <Section n="09" title="Limitations">
        <ul className="list-disc space-y-2 pl-5">
          <li>The neural models are small, untuned CPU baselines with a fixed training schedule and no development set; transformers, data hallucination or pretrained models could change the picture.</li>
          <li>Strict exact match treats stored variants (several forms for one cell) as errors; variant-aware accuracy and edit distance are reported alongside it.</li>
          <li>Bootstrap intervals treat pooled test items as independent; items from different seeds can overlap.</li>
          <li>Surface alignments for UniMorph forms are automatic and handle one alternating stem segment at most; they are not morpheme boundaries, and exponents are never attributed to individual features.</li>
          <li>The record audit covers Romanian Number and adjective Gender only, and only records with an unambiguous cue; other dimensions are not audited.</li>
          <li>Turkish nouns and adjectives in UniMorph are Wiktionary-derived and unverified (per its README); Romanian noun labels show systematic issues.</li>
          <li>Evenki data is in IPA transcription from an oral corpus, sparse per lemma and rich in variants; Chukchi has 241 corpus-derived records in UniMorph, mostly citation forms; 234 are usable in the experiment after excluding 7 with non-schema tags, its test sets hold 58 items per seed, and training stops at n = 100.</li>
          <li>Urdu romanisation in hand-annotated entries is simplified; Nastaliq rendering depends on the font.</li>
        </ul>
      </Section>

      <Section n="10" title="Downloads & citation">
        <div className="grid gap-3 sm:grid-cols-3">
          {downloads.map((d) => (
            <a key={d.href} href={d.href} className="group rounded-lg border border-line bg-ivory/80 p-4 transition hover:border-bush">
              <p className="flex items-center gap-2 text-sm font-semibold text-bush"><Download size={14} /> {d.label}</p>
              <p className="mt-1 text-xs text-muted">{d.note}</p>
            </a>
          ))}
        </div>
        <pre className="overflow-x-auto rounded-lg bg-bush p-5 font-mono text-xs leading-relaxed text-oak">{bibtex}</pre>
        <p className="text-sm">Please also cite UniMorph (Batsuren et al., 2022) and the per-language sources listed above.</p>
      </Section>

      <Section n="11" title="References">
        <ol className="list-decimal space-y-2 pl-5 text-sm">
          {references.map((r) => <li key={r}>{r}</li>)}
        </ol>
      </Section>

      <Section n="12" title="Reproduce">
        <pre className="overflow-x-auto rounded-lg bg-bush p-5 font-mono text-xs leading-relaxed text-oak">{`npm install
npm run data:fetch     # UniMorph files at pinned commits → unimorph-data/
npm run data:build     # explorer + comparison sample + record audit
npm run experiment:splits   # exact train/test splits → unimorph-data/splits/
npm run experiment:neural   # PyTorch (CPU), 2 neural systems → experiments/neural/
npm run experiment     # 5 languages × 2 splits × 5 sizes × 5 seeds (+ bootstrap)
npm test               # regression checks: alignment, audit, matching
npm run dev`}</pre>
        <p className="text-sm text-muted">
          Last run: {new Date(experiment.generatedAt).toISOString().slice(0, 10)} · Node {experiment.node} · {experiment.runtimeSeconds}s
          {experiment.neural && (
            <>
              {" "}· neural models: PyTorch {experiment.neural.torch} on CPU, {(experiment.neural.trainSeconds / 3600).toFixed(1)} CPU-hours of training
            </>
          )}
          . Re-running <code>npm run experiment</code> reproduces the shipped results exactly from the committed neural predictions.
        </p>
      </Section>
    </Container>
  );
}
