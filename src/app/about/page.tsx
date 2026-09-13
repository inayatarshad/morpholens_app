import type { Metadata } from "next";
import { TriangleAlert } from "lucide-react";
import { Container } from "@/components/AppShell";
import { languages } from "@/data/languages";

export const metadata: Metadata = { title: "Methodology" };

function Section({ n, title, children }: { n: string; title: string; children: React.ReactNode }) {
  return (
    <section className="grid gap-4 border-t border-line py-10 md:grid-cols-[14rem_1fr]">
      <div>
        <span className="font-mono text-xs text-sienna">{n}</span>
        <h2 className="display display-sm mt-1 text-bush">{title}</h2>
      </div>
      <div className="max-w-3xl space-y-4 leading-relaxed text-ink/80">{children}</div>
    </section>
  );
}

export default function AboutPage() {
  return (
    <Container className="pt-12">
      <header className="mb-8 max-w-3xl">
        <p className="eyebrow">Methodology · limitations</p>
        <h1 className="display display-lg mt-3 text-bush">
          How to read <span className="italic text-sienna">this prototype.</span>
        </h1>
      </header>

      <div className="mb-10 flex items-start gap-3 rounded-xl border border-sienna/40 bg-sienna/[0.08] px-5 py-4">
        <TriangleAlert size={18} className="mt-1 shrink-0 text-sienna" />
        <p className="font-serif text-lg leading-relaxed text-ink">
          This prototype does not claim state-of-the-art morphological analysis. The current interface uses a small local
          demonstration dataset. Quantitative experiment results shown in the UI are illustrative until replaced with
          outputs from controlled model experiments.
        </p>
      </div>

      <Section n="01" title="Research question">
        <p className="font-serif text-xl text-bush">
          Can explicit morphological structure help multilingual models generalise to unseen word forms and unseen lemmas
          in low-resource languages?
        </p>
        <p>
          Multilingual encoders are typically trained on subword units whose boundaries rarely coincide with morpheme
          boundaries. In morphologically rich languages, a single lemma yields many surface forms, and many of those forms
          are rare. MorphoLens is a workspace for inspecting this structure and for framing evaluations that separate
          genuine generalisation from lexical familiarity.
        </p>
      </Section>

      <Section n="02" title="Lemma-disjoint evaluation">
        <p>
          In a random split, different inflected forms of the same lemma can fall into both training and test sets. A model
          may then succeed by exploiting stem familiarity rather than by composing morphological features. A
          lemma-disjoint split assigns every form of a lemma to exactly one partition, so test lemmas are entirely unseen.
        </p>
        <p>
          The quantity of interest is the <em>difference</em> between random-split and lemma-disjoint performance, and
          whether explicit morphology narrows it.
        </p>
      </Section>

      <Section n="03" title="Explicit morphology">
        <p>
          “Morphology-aware” refers to any model that receives structured morphological information in addition to raw
          text: UniMorph-style feature bundles, gold or predicted segmentations, or paradigm-level supervision. The
          comparison of interest is a multilingual encoder baseline versus the same encoder with such signals added,
          under identical data budgets.
        </p>
      </Section>

      <Section n="04" title="Low-resource languages">
        <p>
          The four languages differ deliberately in resource availability and morphological type. Coverage in the local
          dataset reflects what could be responsibly included — not the languages’ complexity or importance.
        </p>
        <div className="overflow-x-auto rounded-lg border border-line">
          <table className="w-full min-w-[36rem] text-sm">
            <thead className="bg-oak/70 text-left text-bush">
              <tr><th className="px-4 py-2">Language</th><th className="px-4 py-2">Profile</th><th className="px-4 py-2">Local coverage</th></tr>
            </thead>
            <tbody className="bg-ivory/70">
              {languages.map((l) => (
                <tr key={l.id} className="border-t border-line align-top">
                  <td className="px-4 py-2.5 font-medium text-bush">{l.name}</td>
                  <td className="px-4 py-2.5 text-xs">{l.profile}</td>
                  <td className="px-4 py-2.5 text-xs text-muted">{l.coverageNote}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      <Section n="05" title="Data provenance">
        <p>
          Every form carries a source, a dataset label, a record ID and a verification flag. Two statuses are used:
        </p>
        <ul className="list-disc space-y-2 pl-5">
          <li><strong className="text-bush">Reference pattern</strong> — follows a textbook-attested inflection pattern cited in the source; not yet cross-checked against a UniMorph release or reviewed by a linguist.</li>
          <li><strong className="text-sienna">Unverified / demo</strong> — illustrative only; should not be cited or used as evaluation data.</li>
        </ul>
        <p>Selecting a form opens its evidence record, making provenance inspectable at the point of use.</p>
      </Section>

      <Section n="06" title="Limitations">
        <ul className="list-disc space-y-2 pl-5">
          <li>No morphological analyser is running: the explorer returns stored analyses only.</li>
          <li>The dataset is tiny and hand-curated; paradigms are partial.</li>
          <li>Experiment values, learning curves and example predictions are illustrative, produced by a deterministic formula.</li>
          <li>Evenki and Chukchi are represented by empty or unverified slots pending expert input.</li>
          <li>Urdu romanisation is simplified; Nastaliq rendering depends on font availability.</li>
          <li>Segmentation conventions (e.g. treating Urdu postpositions as clitics) are one analysis among several.</li>
        </ul>
      </Section>

    </Container>
  );
}
