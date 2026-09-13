import type { Metadata } from "next";
import { ExternalLink } from "lucide-react";
import { Container } from "@/components/AppShell";
import { experiment } from "@/data/experiments";
import { languages } from "@/data/languages";
import { qualityNotes, sourceFor, statsFor } from "@/data/unimorph";

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
  "Cotterell, R. et al. (2017). CoNLL–SIGMORPHON 2017 Shared Task: Universal Morphological Reinflection in 52 Languages.",
  "Goldman, O., Guriel, D. & Tsarfaty, R. (2022). (Un)solving Morphological Inflection: Lemma Overlap Artificially Inflates Models’ Performance. Proceedings of ACL 2022.",
  "Pimentel, T., Ryskina, M. et al. (2021). SIGMORPHON 2021 Shared Task on Morphological Reinflection: Generalization Across Languages.",
  "Vylomova, E. et al. (2020). SIGMORPHON 2020 Shared Task 0: Typologically Diverse Morphological Inflection.",
  "Tyers, F. & Mishchenkova, K. (2020). Dependency annotation of noun incorporation in polysynthetic languages. UDW 2020.",
  "Göksel, A. & Kerslake, C. (2005). Turkish: A Comprehensive Grammar. Routledge.",
  "Schmidt, R. L. (1999). Urdu: An Essential Grammar. Routledge.",
];

export default function AboutPage() {
  const c = experiment.config;
  return (
    <Container className="pt-12">
      <header className="mb-8 max-w-3xl">
        <p className="eyebrow">Methodology · data · limitations</p>
        <h1 className="display display-lg mt-3 text-bush">
          How to read <span className="italic text-sienna">this prototype.</span>
        </h1>
        <p className="lede mt-5 text-ink/75">
          MorphoLens does not claim state-of-the-art morphological analysis. It is an inspectable pipeline: pinned public
          data, simple systems, measured results, and provenance for every form it shows.
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
          A small sample (featured lemmas with capped paradigms) is shipped to the browser for the explorer; the experiment
          script reads the full files. Ten hand-annotated Turkish and Urdu entries add gold morpheme segmentation, which
          UniMorph does not provide.
        </p>
      </Section>

      <Section n="03" title="Experiment design">
        <p>
          Task: morphological inflection — predict the form for a (lemma, feature bundle) pair; metric: exact match. For
          each of {c.seeds.length} seeds a universe of up to ~{c.universeTarget.toLocaleString("en")} triples is sampled ({c.cellsPerLemma} cells per lemma at most). The
          random split holds out items; the lemma-disjoint split holds out whole lemmas. Test sets hold up to {c.testMax} items;
          training sizes are {c.sizes.join(", ")}. Both splits use the same universe, so differences reflect lemma overlap, not data.
        </p>
      </Section>

      <Section n="04" title="Systems">
        <ul className="list-disc space-y-2 pl-5">
          <li><strong className="text-bush">Atomic-tag rules</strong> — edit rules keyed by the whole bundle; nearest-ending analogy; unseen bundle ⇒ copy the lemma.</li>
          <li><strong className="text-burgundy">Paradigm memory</strong> — reinflects from seen forms of the same lemma (cell-to-cell rules); otherwise the baseline.</li>
          <li><strong className="text-bush">Feature-aware rules</strong> — bundles decomposed into features; composes lemma→A with a feature-difference rule A→T learned across paradigms; otherwise nearest bundle.</li>
        </ul>
        <p className="text-sm">
          All three are transparent, non-neural and trained from scratch per run. They are baselines for the evaluation
          design, not claims about neural models.
        </p>
      </Section>

      <Section n="05" title="What the results show">
        <ul className="list-disc space-y-2 pl-5">
          <li>Paradigm memory beats the baseline only on random splits and only as lemma overlap grows (clearest for Turkish and Urdu); on lemma-disjoint splits it equals the baseline by construction.</li>
          <li>Feature-difference transfer gives consistent gains for Urdu on both splits, small gains for Turkish, and mixed results for Evenki and Romanian at these data sizes.</li>
          <li>Seed-to-seed standard deviations are often as large as the differences between systems; Chukchi estimates are not interpretable.</li>
        </ul>
        <p className="text-sm">The live numbers are on the Experiment page and in <code className="font-mono">src/data/generated/experiment-results.json</code>.</p>
      </Section>

      <Section n="06" title="Provenance & data quality">
        <p>Every form in the interface carries one of two attestation levels, and opens a verbatim evidence record:</p>
        <ul className="list-disc space-y-2 pl-5">
          <li><strong className="text-bush">UniMorph-attested</strong> — the exact triple occurs in the pinned UniMorph file.</li>
          <li><strong className="text-sienna">Reference pattern</strong> — a hand-annotated textbook form that UniMorph does not contain (e.g. Turkish <em>ev</em>, <em>kitap</em>).</li>
        </ul>
        <p>UniMorph attestation is not expert validation. Problems observed in the data are reported, not silently corrected:</p>
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

      <Section n="07" title="Limitations">
        <ul className="list-disc space-y-2 pl-5">
          <li>No neural models yet; conclusions apply to these rule-based systems only.</li>
          <li>Exact match ignores near misses and treats UniMorph variants (several forms per cell) as errors.</li>
          <li>Segmentations for UniMorph forms are automatic lemma–form alignments, not gold morpheme boundaries.</li>
          <li>Turkish nouns and adjectives in UniMorph are Wiktionary-derived and unverified (per its README); Romanian noun labels show systematic issues.</li>
          <li>Evenki data is in Latin transcription and sparse per lemma; Chukchi has 241 triples.</li>
          <li>Urdu romanisation in hand-annotated entries is simplified; Nastaliq rendering depends on the font.</li>
        </ul>
      </Section>

      <Section n="08" title="References">
        <ol className="list-decimal space-y-2 pl-5 text-sm">
          {references.map((r) => <li key={r}>{r}</li>)}
        </ol>
      </Section>

      <Section n="09" title="Reproduce">
        <pre className="overflow-x-auto rounded-lg bg-bush p-5 font-mono text-xs leading-relaxed text-oak">{`npm install
npm run data:fetch     # UniMorph files at pinned commits → .unimorph/
npm run data:build     # explorer + comparison sample
npm run experiment     # 5 languages × 2 splits × 5 sizes × 5 seeds
npm run dev`}</pre>
      </Section>
    </Container>
  );
}
