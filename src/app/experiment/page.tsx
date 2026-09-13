import type { Metadata } from "next";
import { Container } from "@/components/AppShell";
import { ExperimentWorkspace } from "@/components/ExperimentWorkspace";
import { FindingsTable } from "@/components/FindingsTable";
import { experiment } from "@/data/experiments";

export const metadata: Metadata = { title: "Experiment" };

const lemmas = [
  { id: "A", forms: 4 },
  { id: "B", forms: 3 },
  { id: "C", forms: 4 },
  { id: "D", forms: 3 },
];

function SplitDiagram({ disjoint }: { disjoint: boolean }) {
  return (
    <div className="grid grid-cols-2 gap-3 text-xs">
      {["TRAIN", "TEST"].map((side) => (
        <div key={side} className="rounded-lg border border-line bg-cashmere/60 p-3">
          <p className="mb-2 font-mono tracking-[0.2em] text-muted">{side}</p>
          <div className="flex flex-wrap gap-1">
            {lemmas.flatMap((l) =>
              Array.from({ length: l.forms }, (_, i) => {
                const inTest = disjoint ? l.id === "D" : i === l.forms - 1;
                if ((side === "TEST") !== inTest) return null;
                return (
                  <span key={`${l.id}${i}`} className={`rounded px-1.5 py-0.5 font-mono ${l.id === "D" ? "bg-sienna text-ivory" : "bg-bush/85 text-ivory"}`}>
                    {l.id}
                    {i + 1}
                  </span>
                );
              }),
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

export default function ExperimentPage() {
  const c = experiment.config;
  return (
    <Container className="pt-12">
      <header className="mb-10 max-w-4xl">
        <p className="eyebrow">Workspace · 03 · Unseen-word generalisation</p>
        <h1 className="display display-lg mt-3 text-bush">
          Does morphology help <span className="italic text-sienna">when the lemma is unseen?</span>
        </h1>
        <p className="lede mt-4 text-ink/75">
          Three transparent inflection systems, five languages, random versus lemma-disjoint splits — measured on pinned
          UniMorph data.
        </p>
      </header>

      <ExperimentWorkspace />

      <div className="mt-6">
        <FindingsTable />
      </div>

      <section className="mt-16 grid gap-10 rounded-2xl border border-line bg-ivory/80 p-8 lg:grid-cols-2">
        <div>
          <p className="eyebrow">How these numbers were produced</p>
          <h2 className="display display-md mt-3 text-bush">One universe, two splits.</h2>
          <ol className="mt-5 list-decimal space-y-2 pl-5 text-sm leading-relaxed text-ink/80">
            <li>Per seed, sample lemmas at random and keep up to {c.cellsPerLemma} cells each until ~{c.universeTarget.toLocaleString("en")} triples.</li>
            <li>Hold out a test set of up to {c.testMax} triples ({Math.round(c.testFraction * 100)}% for small languages) — by item for the random split, by lemma for the lemma-disjoint split.</li>
            <li>Train each system on the first n ∈ {"{"}{c.sizes.join(", ")}{"}"} triples of the remaining pool (sizes the pool cannot support are skipped).</li>
            <li>Score exact-match accuracy; repeat for seeds {c.seeds.join(", ")} and report mean ± s.d.</li>
          </ol>
          <p className="mt-4 text-xs text-muted">
            Reproduce: <code className="font-mono">npm run data:fetch && npm run experiment</code> · script: scripts/run-experiment.mjs
          </p>
        </div>
        <div className="space-y-4 text-sm leading-relaxed text-ink/80">
          <p>
            <strong className="text-bush">Atomic-tag rules</strong> learn lemma→form edit rules (prefix and suffix rewrites around the longest
            shared substring) keyed by the whole feature bundle, and apply the rule of the training lemma with the longest
            shared ending — in the spirit of the CoNLL–SIGMORPHON 2017 non-neural baseline.
          </p>
          <p>
            <strong className="text-burgundy">Paradigm memory</strong> first looks for other forms of the <em>same</em> lemma in training and
            reinflects from them; otherwise it falls back to the baseline. It can only profit from lemma overlap.
          </p>
          <p>
            <strong className="text-bush">Feature-aware rules</strong> decompose bundles into UniMorph features. For an unseen bundle they inflect
            into a seen bundle A and apply a rule for the feature difference A→T learned from any training paradigm (e.g.
            NOM→ABL), falling back to the most similar bundle.
          </p>
          <p className="text-xs text-muted">
            These are deliberately simple, inspectable systems — not multilingual neural encoders. They establish the
            evaluation pipeline that XLM-R-style models would be run through next.
          </p>
        </div>
      </section>

      <section className="mt-6 grid gap-10 rounded-2xl border border-line bg-oak-soft/50 p-8 lg:grid-cols-[1.1fr_1fr]">
        <div>
          <p className="eyebrow">Why lemma-disjoint?</p>
          <h2 className="display display-md mt-3 text-bush">A surface form can be new while the word is not.</h2>
          <p className="mt-5 leading-relaxed text-ink/80">
            Suppose a model sees <em className="font-serif text-lg">walk</em>, <em className="font-serif text-lg">walking</em> and{" "}
            <em className="font-serif text-lg">walked</em> during training and <em className="font-serif text-lg">walks</em> during testing. The surface form is
            technically unseen, but the lexical item is familiar.
          </p>
          <p className="mt-4 leading-relaxed text-ink/80">
            A <strong className="font-semibold text-bush">lemma-disjoint split</strong> removes every form of the test lemma from training, creating a stronger
            test of morphological generalisation. Lemma overlap has been shown to inflate reported inflection accuracy
            (Goldman, Guriel & Tsarfaty, 2022).
          </p>
        </div>
        <div className="space-y-5">
          <div>
            <p className="mb-2 text-sm font-medium text-bush">Random split <span className="text-muted">— lemma D leaks into training</span></p>
            <SplitDiagram disjoint={false} />
          </div>
          <div>
            <p className="mb-2 text-sm font-medium text-sienna">Lemma-disjoint split <span className="text-muted">— lemma D is never seen</span></p>
            <SplitDiagram disjoint />
          </div>
        </div>
      </section>
    </Container>
  );
}
