import Link from "next/link";
import { ArrowDown, ArrowRight, FlaskConical, Microscope } from "lucide-react";
import { Container } from "@/components/AppShell";
import { HeroSpecimen } from "@/components/HeroSpecimen";
import { LanguageCard } from "@/components/LanguageCard";
import { CountUp, KineticText, MorphemeMarquee, Reveal, Scene, type MarqueeWord } from "@/components/motion";
import { experiment, fmtCI, fmtP, getCell, sizesFor } from "@/data/experiments";
import { languages } from "@/data/languages";
import { entryById } from "@/data/morphology";
import { unimorph } from "@/data/unimorph";
import type { ComparisonFeature, LanguageId } from "@/data/types";
import { segmentsOf } from "@/lib/analysis";

const questions = [
  { n: "01", q: "What morphological information is encoded in a word?", href: "/explore", cta: "Explore" },
  { n: "02", q: "How does the same grammatical feature appear across languages?", href: "/compare", cta: "Compare" },
  { n: "03", q: "Does explicit morphology improve generalisation to unseen lemmas?", href: "/experiment", cta: "Experiment" },
];

/** Hand-annotated specimen, segmented (Urdu shown in romanisation). */
const hand = (id: string): MarqueeWord | null => {
  const e = entryById(id);
  return e ? { segs: e.segmentation } : null;
};

/** UniMorph comparison example, split by lemma-form alignment. */
const attested = (lang: LanguageId, feature: ComparisonFeature, rtl = false): MarqueeWord | null => {
  const c = unimorph.comparisons[lang]?.[feature];
  return c ? { segs: segmentsOf(c.target), rtl } : null;
};

const clean = (xs: (MarqueeWord | null)[]) => xs.filter((x): x is MarqueeWord => x !== null);

export default function Home() {
  const nT = Math.max(...sizesFor("tur"));
  const tR = getCell("tur", "random", nT)!;
  const tL = getCell("tur", "lemma-disjoint", nT)!;
  const nU = sizesFor("urd").filter((s) => s <= 500).pop()!;
  const uL = getCell("urd", "lemma-disjoint", nU)!;
  const totalTriples = Object.values(experiment.stats).reduce((s, x) => s + x.triples, 0);
  const memGain = tR.tests["memory-baseline"];
  const featGain = uL.tests["morph-baseline"];

  const rows = [
    clean([hand("tur-evlerimizden"), hand("tur-kitaplarimizdan"), hand("tur-gelmedi"), attested("tur", "plural")]),
    clean([hand("urd-larkon"), hand("urd-kitaben"), attested("urd", "plural", true), hand("urd-nahin-likha"), hand("urd-likha")]),
    clean([attested("evn", "plural"), attested("evn", "case"), attested("ckt", "past"), attested("ron", "case"), attested("ron", "negation")]),
  ];

  return (
    <>
      {/* Hero: the headline drifts apart and gains weight as it scrolls away */}
      <section className="relative overflow-hidden border-b border-line">
        <Scene mode="exit">
          <div className="hairline-grid pointer-events-none absolute inset-0 opacity-50 [mask-image:linear-gradient(to_bottom,black,transparent_85%)]" />
          <span
            className="pointer-events-none absolute -right-10 top-10 select-none font-serif text-[22rem] leading-none text-oak/25 will-change-transform"
            style={{ transform: "translate3d(0, calc(var(--p) * 180px), 0) rotate(calc(var(--p) * 28deg))" }}
          >
            ”
          </span>
          <Container className="relative grid items-center gap-14 py-16 lg:grid-cols-[1.55fr_1fr] lg:py-24">
            <div>
              <p className="eyebrow rise">Open research prototype · low-resource morphology</p>
              <p className="rise mt-6 text-[0.8rem] font-semibold tracking-[0.34em] text-bush" style={{ animationDelay: "60ms" }}>MORPHOLENS</p>
              <h1 className="display mt-4 text-balance text-[clamp(2.4rem,1.1rem+3.3vw,4.6rem)] text-bush">
                <span className="rise block" style={{ animationDelay: "120ms" }}>
                  <span className="block will-change-transform" style={{ transform: "translate3d(0, calc(var(--p) * -80px), 0)", opacity: "calc(1 - var(--p) * 0.5)" }}>
                    Can multilingual models understand morphology,
                  </span>
                </span>
                <span className="rise block" style={{ animationDelay: "260ms" }}>
                  <span
                    className="block italic text-sienna will-change-transform"
                    style={{ transform: "translate3d(calc(var(--p) * 12vw), calc(var(--p) * -40px), 0)", fontWeight: "calc(400 + var(--p) * 380)" }}
                  >
                    or do they mostly memorise word forms?
                  </span>
                </span>
              </h1>
              <div className="rise" style={{ animationDelay: "380ms" }}>
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
            </div>
            <div className="will-change-transform" style={{ transform: "translate3d(0, calc(var(--p) * 120px), 0) rotate(calc(var(--p) * -3deg))" }}>
              <HeroSpecimen />
            </div>
          </Container>
          <div className="relative flex justify-center pb-8">
            <span className="scroll-cue flex flex-col items-center gap-2 font-mono text-[0.62rem] tracking-[0.3em] text-muted" style={{ opacity: "calc(1 - var(--p) * 4)" }}>
              SCROLL
              <span className="block h-8 w-px bg-line-strong" />
            </span>
          </div>
        </Scene>
      </section>

      {/* Kinetic band of real forms */}
      <section className="border-b border-line bg-ivory/40">
        <MorphemeMarquee rows={rows} />
        <p className="pb-6 text-center font-mono text-[0.65rem] tracking-[0.18em] text-muted">
          REAL FORMS FROM THE WORKSPACE · STEM · EXPONENT · HAND-ANNOTATED OR UNIMORPH-ATTESTED
        </p>
      </section>

      <Container className="py-20">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="eyebrow">Languages in the workspace</p>
            <h2 className="display display-md mt-2 text-bush">
              <KineticText segments={[{ text: "Five languages," }, { text: "very uneven resources.", className: "italic text-sienna" }]} />
            </h2>
          </div>
          <Reveal className="max-w-md text-sm text-muted">
            From 570k UniMorph triples for Turkish to 241 for Chukchi. The gap is part of the research question, so the
            interface shows it rather than hiding it.
          </Reveal>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {languages.map((l, i) => (
            <Reveal key={l.id} delay={i * 90} className="flex">
              <LanguageCard language={l} />
            </Reveal>
          ))}
        </div>
      </Container>

      {/* The problem: the unseen form splits into stem and suffix as you scroll */}
      <section className="border-y border-line bg-oak-soft/50">
        <Scene>
          <Container className="grid gap-12 py-24 lg:grid-cols-[1fr_1.1fr] lg:items-center">
            <div className="grain rounded-2xl border border-line bg-ivory p-8">
              <p className="eyebrow mb-5">The problem</p>
              <div className="flex flex-col items-center text-center">
                <span className="font-mono text-[0.68rem] tracking-[0.2em] text-muted">TRAINING DATA</span>
                <div className="mt-3 flex flex-wrap justify-center gap-2">
                  {["walk", "walked", "walking"].map((w, i) => (
                    <span
                      key={w}
                      className="rounded-md border border-bush/20 bg-bush px-3 py-1.5 font-serif text-lg text-ivory will-change-transform"
                      style={{ transform: `translate3d(0, calc((0.5 - var(--p)) * ${24 + i * 14}px), 0)` }}
                    >
                      {w}
                    </span>
                  ))}
                </div>
                <ArrowDown className="my-4 text-muted" size={18} />
                <span className="rounded-full border border-line-strong bg-cashmere px-6 py-2 font-mono text-xs tracking-[0.2em] text-bush">MODEL</span>
                <ArrowDown className="my-4 text-muted" size={18} />
                <span className="font-mono text-[0.68rem] tracking-[0.2em] text-muted">UNSEEN FORM</span>
                <span className="display mt-2 flex items-baseline text-4xl sm:text-5xl">
                  <span className="text-bush will-change-transform" style={{ transform: "translate3d(calc((0.5 - var(--p)) * 1.4em), 0, 0)" }}>walk</span>
                  <span className="mx-1 text-oak" style={{ opacity: "calc(var(--p) * 1.6 - 0.3)" }}>|</span>
                  <span className="text-sienna will-change-transform" style={{ transform: "translate3d(calc((var(--p) - 0.5) * 1.4em), 0, 0)" }}>ability</span>
                </span>
                <span className="display mt-2 inline-block text-5xl text-sienna will-change-transform" style={{ transform: "rotate(calc((var(--p) - 0.5) * 40deg)) scale(calc(0.8 + var(--p) * 0.5))" }}>
                  ?
                </span>
              </div>
            </div>
            <div>
              <h2 className="display display-lg text-bush">
                <KineticText segments={[{ text: "Familiar lemmas can make a model look" }, { text: "smarter than it is.", className: "italic text-sienna" }]} />
              </h2>
              <Reveal delay={150}>
                <p className="lede mt-6 text-ink/80">
                  Random train/test splits often let a model see closely related forms of the same lemma during training.
                </p>
                <p className="mt-4 text-ink/75">
                  MorphoLens contrasts this with <strong className="font-semibold text-bush">lemma-disjoint evaluation</strong>: can a model generalise when the
                  lexical item itself was never observed?
                </p>
              </Reveal>
            </div>
          </Container>
        </Scene>
      </section>

      <Container className="py-20">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="eyebrow">Measured, not simulated</p>
            <h2 className="display display-md mt-2 text-bush">
              <KineticText segments={[{ text: "What the first experiment" }, { text: "shows.", className: "italic text-sienna" }]} />
            </h2>
          </div>
          <Link href="/experiment" className="inline-flex items-center gap-2 text-sm font-semibold text-sienna hover:underline">
            Full results <ArrowRight size={14} />
          </Link>
        </div>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <Reveal className="rounded-2xl border border-line bg-ivory/80 p-6">
            <p className="text-xs text-muted">Turkish · n = {nT} · paradigm memory vs. baseline</p>
            <p className="display mt-3 text-5xl text-burgundy"><CountUp value={memGain.diff} signed /></p>
            <p className="mt-1 text-sm text-ink/80">
              points on the random split, where {tR.overlap.toFixed(0)}% of test lemmas were seen ({fmtCI(memGain)}). Once
              lemmas are disjoint the gain is <strong className="font-semibold">{tL.tests["memory-baseline"].diff.toFixed(1)}</strong>.
            </p>
          </Reveal>
          <Reveal delay={120} className="rounded-2xl border border-line bg-ivory/80 p-6">
            <p className="text-xs text-muted">Urdu · n = {nU} · feature-aware vs. baseline, lemma-disjoint</p>
            <p className="display mt-3 text-5xl text-bush"><CountUp value={featGain.diff} signed /></p>
            <p className="mt-1 text-sm text-ink/80">
              points on unseen lemmas from decomposing feature bundles ({fmtCI(featGain)}, {fmtP(featGain.p)}).
            </p>
          </Reveal>
          <Reveal delay={240} className="rounded-2xl border border-line bg-bush p-6 text-ivory">
            <p className="text-xs text-oak">Setup</p>
            <p className="display mt-3 text-4xl"><CountUp value={totalTriples} grouped /></p>
            <p className="mt-1 text-sm text-ivory/80">
              UniMorph triples, pinned commits, 5 seeds, three transparent rule-based systems. Neural comparisons are the next step.
            </p>
          </Reveal>
        </div>
      </Container>

      <Scene>
        <Container className="pb-8">
          <p className="eyebrow">Three questions</p>
          <div className="mt-8 grid gap-px overflow-hidden rounded-2xl border border-line bg-line md:grid-cols-3">
            {questions.map((q, i) => (
              <Link key={q.n} href={q.href} className="group flex flex-col bg-ivory/90 p-8 transition hover:bg-ivory">
                <span
                  className="display inline-block text-5xl text-sienna will-change-transform"
                  style={{ transform: `translate3d(0, calc((0.5 - var(--p)) * ${30 + i * 25}px), 0)` }}
                >
                  {q.n}
                </span>
                <p className="display display-sm mt-6 text-bush">{q.q}</p>
                <span className="mt-auto inline-flex items-center gap-2 pt-8 text-sm text-muted transition group-hover:text-sienna">
                  {q.cta} <ArrowRight size={14} className="transition group-hover:translate-x-1" />
                </span>
              </Link>
            ))}
          </div>
        </Container>
      </Scene>
    </>
  );
}
