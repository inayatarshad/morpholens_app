import type { Metadata } from "next";
import { Download, ExternalLink } from "lucide-react";
import { Container } from "@/components/AppShell";
import { experiment, findingSentences } from "@/data/experiments";
import { languages } from "@/data/languages";
import { auditFor, qualityNotes, sourceFor, statsFor } from "@/data/unimorph";

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
  "Vylomova, E. et al. (2020). SIGMORPHON 2020 Shared Task 0: Typologically Diverse Morphological Inflection.",
  "Tyers, F. & Mishchenkova, K. (2020). Dependency annotation of noun incorporation in polysynthetic languages. UDW 2020.",
  "Göksel, A. & Kerslake, C. (2005). Turkish: A Comprehensive Grammar. Routledge.",
  "Schmidt, R. L. (1999). Urdu: An Essential Grammar. Routledge.",
];

const bibtex = `@misc{morpholens,
  title        = {MorphoLens: Exploring Morphological Generalisation to Unseen Lemmas},
  howpublished = {\\url{https://morpholens-app.vercel.app}},
  note         = {Version 0.3. Data: UniMorph tur, urd, evn, ckt, ron at pinned commits},
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
          Counts are after removing duplicate lines. Ten hand-annotated Turkish and Urdu entries add gold morpheme
          segmentation, which UniMorph does not provide; each is labelled by whether UniMorph attests it.
        </p>
      </Section>

      <Section n="03" title="How search works">
        <p>The explorer searches the full UniMorph file for the selected language on the server. Nothing is generated or guessed.</p>
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
          Gold segmentations exist only for the hand-annotated Turkish and Urdu entries and carry the label <em>Gold segmentation</em>.
        </p>
        <p>
          <strong className="text-bush">Difficulty tags</strong> say where they come from. <em>Data</em> is read from stored records (syncretism: one form
          stored under several bundles; variant forms; multi-word forms). <em>Heuristic</em> is inferred by MorphoLens: <em>allomorphy</em> means a stem
          variant with one alternating segment (casă ~ case-), <em>stem change</em> means lemma material is replaced or removed without a single
          consistent alternation. <em>Gold</em> comes from hand annotation, and <em>experiment</em> tags (unseen lemma, rare feature) only make sense
          relative to a train/test split.
        </p>
        <p>
          <strong className="text-bush">Several analyses for one form</strong> are all shown. None is marked primary, because MorphoLens has no
          corpus frequencies; they are listed by how many records in the full file carry each bundle, so Romanian <em>caselor</em> lists
          GEN/DAT · PL · DEF before VOC · PL.
        </p>
        <p>
          <strong className="text-bush">Record audit.</strong> For Romanian nouns and adjectives, the Number tag is compared with unambiguous
          cues: indefinite articles (o, un, unei, unui are singular; niște, unor are plural) and definite endings (-lui, -ul, genitive/dative
          -ei and feminine -a are singular; -lor and nominative -ii are plural), only when the ending is not already part of the lemma.
          {ronAudit && (
            <> Of {ronAudit.checked.toLocaleString("en")} records with such a cue, {ronAudit.conflicts.toLocaleString("en")} ({((100 * ronAudit.conflicts) / ronAudit.checked).toFixed(0)}%) conflict with their tag.</>
          )}{" "}
          Conflicting records are flagged in the explorer and paradigm tables and shown exactly as stored. Records without a cue are not
          checked, so an unflagged record is not thereby confirmed.
        </p>
      </Section>

      <Section n="05" title="Experiment design">
        <p>
          The task is morphological inflection: predict the form for a (lemma, feature bundle) pair. Metrics: exact-match
          accuracy and mean Levenshtein distance to the gold form. For each of {c.seeds.length} seeds a universe of up to
          ~{c.universeTarget.toLocaleString("en")} triples is sampled ({c.cellsPerLemma} cells per lemma at most). The random split holds out items; the lemma-disjoint
          split holds out whole lemmas. Test sets hold up to {c.testMax} items; training sizes are {c.sizes.join(", ")}. Both splits use the same universe.
        </p>
        <p>
          Differences between systems are tested with a paired bootstrap ({c.bootstrap.toLocaleString("en")} resamples) over the test items pooled across
          seeds; we report the difference in accuracy points, its 95% interval and a two-sided p-value.
        </p>
      </Section>

      <Section n="06" title="Systems">
        <ul className="list-disc space-y-2 pl-5">
          <li><strong className="text-bush">Atomic-tag rules</strong>: edit rules keyed by the whole bundle; nearest-ending analogy; unseen bundle ⇒ copy the lemma. In the spirit of the CoNLL-SIGMORPHON 2017 non-neural baseline.</li>
          <li><strong className="text-burgundy">Paradigm memory</strong>: reinflects from seen forms of the same lemma (cell-to-cell rules); otherwise the baseline.</li>
          <li><strong className="text-bush">Feature-aware rules</strong>: bundles decomposed into features; composes lemma→A with a feature-difference rule A→T learned across paradigms; otherwise nearest bundle.</li>
        </ul>
        <p className="text-sm">All three are transparent, non-neural and trained from scratch per run. They are baselines for the evaluation design, not claims about neural models.</p>
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
          <li>No neural models yet; conclusions apply to these rule-based systems only.</li>
          <li>Exact match treats UniMorph variants (several forms for one cell) as errors; edit distance is reported as a complement.</li>
          <li>Bootstrap intervals treat pooled test items as independent; items from different seeds can overlap.</li>
          <li>Surface alignments for UniMorph forms are automatic and handle one alternating stem segment at most; they are not gold morpheme boundaries, and exponents are never attributed to individual features.</li>
          <li>The record audit covers Romanian Number only, and only records with an unambiguous cue.</li>
          <li>Turkish nouns and adjectives in UniMorph are Wiktionary-derived and unverified (per its README); Romanian noun labels show systematic issues.</li>
          <li>Evenki data is in Latin transcription and sparse per lemma; Chukchi has 241 triples.</li>
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
npm run experiment     # 5 languages × 2 splits × 5 sizes × 5 seeds (+ bootstrap)
npm test               # regression checks: alignment, audit, matching
npm run dev`}</pre>
        <p className="text-sm text-muted">Last run: {new Date(experiment.generatedAt).toISOString().slice(0, 10)} · Node {experiment.node} · {experiment.runtimeSeconds}s. Re-running reproduces the shipped results exactly.</p>
      </Section>
    </Container>
  );
}
