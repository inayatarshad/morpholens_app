import Link from "next/link";
import { ArrowDown, ArrowRight, FlaskConical, Microscope } from "lucide-react";
import { Container } from "@/components/AppShell";
import { HeroSpecimen } from "@/components/HeroSpecimen";
import { LanguageCard } from "@/components/LanguageCard";
import { languages } from "@/data/languages";
import { entriesByLanguage } from "@/data/morphology";

const questions = [
  { n: "01", q: "What morphological information is encoded in a word?", href: "/explore", cta: "Explore" },
  { n: "02", q: "How does the same grammatical feature appear across languages?", href: "/compare", cta: "Compare" },
  { n: "03", q: "Does explicit morphology improve generalisation to unseen lemmas?", href: "/experiment", cta: "Experiment" },
];

export default function Home() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-line">
        <div className="hairline-grid pointer-events-none absolute inset-0 opacity-50 [mask-image:linear-gradient(to_bottom,black,transparent_85%)]" />
        <span className="pointer-events-none absolute -right-10 top-10 select-none font-serif text-[22rem] leading-none text-oak/25">”</span>
        <Container className="relative grid items-center gap-14 py-16 lg:grid-cols-[1.55fr_1fr] lg:py-24">
          <div>
            <p className="eyebrow">Open research prototype · low-resource morphology</p>
            <p className="mt-6 text-[0.8rem] font-semibold tracking-[0.34em] text-bush">MORPHOLENS</p>
            <h1 className="display mt-4 text-bush text-[clamp(2.4rem,1.1rem+3.3vw,4.6rem)] text-balance">
              Can multilingual models understand morphology
              <span className="block italic text-sienna">— or do they mostly memorise word forms?</span>
            </h1>
            <p className="lede mt-8 max-w-2xl text-ink/80">
              MorphoLens is an interactive research prototype for exploring morphological structure across high- and
              low-resource languages, with particular attention to <em>unseen-word generalisation</em>.
            </p>
            <p className="mt-3 max-w-2xl text-sm text-muted">
              Explore how words change across languages — an interactive workspace for low-resource morphology, lexical
              variation, and unseen-word generalisation.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Link href="/explore" className="inline-flex items-center gap-2 rounded-lg bg-bush px-5 py-3 text-sm font-semibold text-ivory transition hover:bg-bush-soft">
                <Microscope size={16} /> Explore morphology
              </Link>
              <Link href="/experiment" className="inline-flex items-center gap-2 rounded-lg border border-bush bg-ivory px-5 py-3 text-sm font-semibold text-bush transition hover:bg-cashmere">
                <FlaskConical size={16} /> Run experiment
              </Link>
              <Link href="/about" className="inline-flex items-center gap-2 rounded-lg px-3 py-3 text-sm text-ink/70 underline-offset-4 hover:text-sienna hover:underline">
                Methodology &amp; limitations <ArrowRight size={14} />
              </Link>
            </div>
          </div>
          <HeroSpecimen />
        </Container>
      </section>

      {/* Languages */}
      <Container className="py-16">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="eyebrow">Languages in the workspace</p>
            <h2 className="display display-md mt-2 text-bush">Four systems, uneven coverage.</h2>
          </div>
          <p className="max-w-md text-sm text-muted">
            Coverage deliberately differs. Evenki and Chukchi slots stay empty or unverified until forms can be checked —
            the interface shows the gap instead of hiding it.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {languages.map((l) => (
            <LanguageCard key={l.id} language={l} count={entriesByLanguage(l.id).length} />
          ))}
        </div>
      </Container>

      {/* The problem */}
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
              Random train/test splits often allow models to encounter closely related forms of the same lemma during
              training.
            </p>
            <p className="mt-4 text-ink/75">
              MorphoLens instead highlights <strong className="font-semibold text-bush">lemma-disjoint evaluation</strong>: can a model generalise when the
              underlying lexical item itself was never observed?
            </p>
            <Link href="/experiment" className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-sienna hover:underline">
              See the illustrative experiment <ArrowRight size={14} />
            </Link>
          </div>
        </Container>
      </section>

      {/* Three questions */}
      <Container className="py-20">
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
