import Link from "next/link";
import { ArrowDown, ArrowRight, FlaskConical, Microscope } from "lucide-react";
import { Container } from "@/components/AppShell";
import { HeroSpecimen } from "@/components/HeroSpecimen";
import { LanguageCard } from "@/components/LanguageCard";
import { fmtCI, fmtP, getCell, sizesFor } from "@/data/experiments";
import { languages } from "@/data/languages";
import { statsFor } from "@/data/unimorph";

const questions = [
  { n: "01", q: "What morphological information is encoded in a word?", href: "/explore", cta: "Explore" },
  { n: "02", q: "How does the same grammatical feature appear across languages?", href: "/compare", cta: "Compare" },
  { n: "03", q: "Does explicit morphology improve generalisation to unseen lemmas?", href: "/experiment", cta: "Experiment" },
];

const signed = (n: number) => `${n >= 0 ? "+" : "−"}${Math.abs(n).toFixed(1)}`;

export default function Home() {
  const nT = Math.max(...sizesFor("tur"));
  const tR = getCell("tur", "random", nT)!;
  const tL = getCell("tur", "lemma-disjoint", nT)!;
  const nU = sizesFor("urd").filter((s) => s <= 500).pop()!;
  const uL = getCell("urd", "lemma-disjoint", nU)!;
  const totalTriples = languages.reduce((s, l) => s + statsFor(l.id).triples, 0);

  return (
    <>
      <section className="relative overflow-hidden border-b border-line">
        <span className="pointer-events-none absolute -right-10 top-10 select-none font-serif text-[22rem] leading-none text-oak/25">”</span>
        <Container className="relative grid items-center gap-14 py-16 lg:grid-cols-[1.55fr_1fr] lg:py-24">
          <div>
            <p className="eyebrow">Open research prototype · low-resource morphology</p>
            <p className="mt-6 text-[0.8rem] font-semibold tracking-[0.34em] text-bush">MORPHOLENS</p>
            <h1 className="display mt-4 text-balance text-[clamp(2.4rem,1.1rem+3.3vw,4.6rem)] text-bush">
              Can multilingual models understand morphology,
              <span className="block italic text-sienna">or do they mostly memorise word forms?</span>
            </h1>
            <p className="lede mt-8 max-w-2xl text-ink/80">
              MorphoLens is an interactive research workspace for exploring morphological structure across high- and
              low-resource languages, built on UniMorph data and a reproducible <em>lemma-overlap</em> experiment.
            </p>
            <p className="mt-3 max-w-2xl text-sm text-muted">
              Explore how words change across Turkish, Urdu, Evenki, Chukchi and Romanian. Every form is traceable to its
              source record.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Link href="/explore" className="inline-flex items-center gap-2 rounded-lg bg-bush px-5 py-3 text-sm font-semibold text-ivory transition hover:bg-bush-soft">
                <Microscope size={16} /> Explore morphology
              </Link>
              <Link href="/experiment" className="inline-flex items-center gap-2 rounded-lg border border-bush bg-ivory px-5 py-3 text-sm font-semibold text-bush transition hover:bg-cashmere">
                <FlaskConical size={16} /> See the experiment
              </Link>
              <Link href="/about" className="inline-flex items-center gap-2 rounded-lg px-3 py-3 text-sm text-ink/70 underline-offset-4 hover:text-sienna hover:underline">
                Methodology <ArrowRight size={14} />
              </Link>
            </div>
          </div>
          <HeroSpecimen />
        </Container>
      </section>

      <Container className="py-16">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="eyebrow">Languages in the workspace</p>
            <h2 className="display display-md mt-2 text-bush">Five languages, very uneven resources.</h2>
          </div>
          <p className="max-w-md text-sm text-muted">
            From 570k UniMorph triples for Turkish to 241 for Chukchi. The gap is part of the research question, so the
            interface shows it rather than hiding it.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {languages.map((l) => (
            <LanguageCard key={l.id} language={l} />
          ))}
        </div>
      </Container>

      <section className="border-y border-line bg-oak-soft/50">
        <Container className="grid gap-12 py-20 lg:grid-cols-[1fr_1.1fr] lg:items-center">
          <div className="grain rounded-2xl border border-line bg-ivory p-8">
            <p className="eyebrow mb-5">The problem</p>
            <div className="flex flex-col items-center text-center">
              <span className="font-mono text-[0.68rem] tracking-[0.2em] text-muted">TRAINING DATA</span>
              <div className="mt-3 flex flex-wrap justify-center gap-2">
                {["walk", "walked", "walking"].map((w) => (
                  <span key={w} className="rounded-md border border-bush/20 bg-bush px-3 py-1.5 font-serif text-lg text-ivory">{w}</span>
                ))}
              </div>
              <ArrowDown className="my-4 text-muted" size={18} />
              <span className="rounded-full border border-line-strong bg-cashmere px-6 py-2 font-mono text-xs tracking-[0.2em] text-bush">MODEL</span>
              <ArrowDown className="my-4 text-muted" size={18} />
              <span className="font-mono text-[0.68rem] tracking-[0.2em] text-muted">UNSEEN FORM</span>
              <span className="display mt-2 text-4xl text-bush">
                walk<span className="text-sienna">ability</span>
              </span>
              <span className="display mt-2 text-5xl text-sienna">?</span>
            </div>
          </div>
          <div>
            <h2 className="display display-lg text-bush">
              Familiar lemmas can make a model look <span className="italic text-sienna">smarter than it is.</span>
            </h2>
            <p className="lede mt-6 text-ink/80">
              Random train/test splits often let a model see closely related forms of the same lemma during training.
            </p>
            <p className="mt-4 text-ink/75">
              MorphoLens contrasts this with <strong className="font-semibold text-bush">lemma-disjoint evaluation</strong>: can a model generalise when the
              lexical item itself was never observed?
            </p>
          </div>
        </Container>
      </section>

      <Container className="py-20">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="eyebrow">Measured, not simulated</p>
            <h2 className="display display-md mt-2 text-bush">What the first experiment shows.</h2>
          </div>
          <Link href="/experiment" className="inline-flex items-center gap-2 text-sm font-semibold text-sienna hover:underline">
            Full results <ArrowRight size={14} />
          </Link>
        </div>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-line bg-ivory/80 p-6">
            <p className="text-xs text-muted">Turkish · n = {nT} · paradigm memory vs. baseline</p>
            <p className="display mt-3 text-5xl text-burgundy">{signed(tR.tests["memory-baseline"].diff)}</p>
            <p className="mt-1 text-sm text-ink/80">
              points on the random split, where {tR.overlap.toFixed(0)}% of test lemmas were seen ({fmtCI(tR.tests["memory-baseline"])}). Once
              lemmas are disjoint the gain is <strong className="font-semibold">{signed(tL.tests["memory-baseline"].diff)}</strong>.
            </p>
          </div>
          <div className="rounded-2xl border border-line bg-ivory/80 p-6">
            <p className="text-xs text-muted">Urdu · n = {nU} · feature-aware vs. baseline, lemma-disjoint</p>
            <p className="display mt-3 text-5xl text-bush">{signed(uL.tests["morph-baseline"].diff)}</p>
            <p className="mt-1 text-sm text-ink/80">
              points on unseen lemmas from decomposing feature bundles ({fmtCI(uL.tests["morph-baseline"])}, {fmtP(uL.tests["morph-baseline"].p)}).
            </p>
          </div>
          <div className="rounded-2xl border border-line bg-bush p-6 text-ivory">
            <p className="text-xs text-oak">Setup</p>
            <p className="display mt-3 text-4xl">{totalTriples.toLocaleString("en")}</p>
            <p className="mt-1 text-sm text-ivory/80">
              UniMorph triples, pinned commits, 5 seeds, three transparent rule-based systems. Neural comparisons are the next step.
            </p>
          </div>
        </div>
      </Container>

      <Container className="pb-8">
        <p className="eyebrow">Three questions</p>
        <div className="mt-8 grid gap-px overflow-hidden rounded-2xl border border-line bg-line md:grid-cols-3">
          {questions.map((q) => (
            <Link key={q.n} href={q.href} className="group flex flex-col bg-ivory/90 p-8 transition hover:bg-ivory">
              <span className="display text-5xl text-sienna">{q.n}</span>
              <p className="display display-sm mt-6 text-bush">{q.q}</p>
              <span className="mt-auto inline-flex items-center gap-2 pt-8 text-sm text-muted transition group-hover:text-sienna">
                {q.cta} <ArrowRight size={14} className="transition group-hover:translate-x-1" />
              </span>
            </Link>
          ))}
        </div>
      </Container>
    </>
  );
}
