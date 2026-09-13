import type { Metadata } from "next";
import { Container } from "@/components/AppShell";
import { ExperimentWorkspace } from "@/components/ExperimentWorkspace";

export const metadata: Metadata = { title: "Experiment" };

const lemmas = [
  { id: "A", forms: 4 },
  { id: "B", forms: 3 },
  { id: "C", forms: 4 },
  { id: "D", forms: 3 },
];

function SplitDiagram({ disjoint }: { disjoint: boolean }) {
  // Random: every lemma contributes forms to both sides. Disjoint: lemma D goes entirely to test.
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
                  <span
                    key={`${l.id}${i}`}
                    className={`rounded px-1.5 py-0.5 font-mono ${l.id === "D" ? "bg-sienna text-ivory" : "bg-bush/85 text-ivory"}`}
                  >
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
  return (
    <Container className="pt-12">
      <header className="mb-10 max-w-4xl">
        <p className="eyebrow">Workspace · 03 · Unseen-word generalisation</p>
        <h1 className="display display-lg mt-3 text-bush">
          Does morphology help <span className="italic text-sienna">when the lemma is unseen?</span>
        </h1>
        <p className="lede mt-4 text-ink/75">
          A visual experiment for comparing surface-based multilingual modelling with morphology-aware modelling.
        </p>
      </header>

      <ExperimentWorkspace />

      <section className="mt-16 grid gap-10 rounded-2xl border border-line bg-oak-soft/50 p-8 lg:grid-cols-[1.1fr_1fr]">
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
            test of morphological generalisation.
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
