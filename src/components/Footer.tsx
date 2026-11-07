import Link from "next/link";
import { project, team } from "@/data/team";
import { VERSION } from "@/data/version";

export function Footer() {
  return (
    <footer className="mt-24 bg-bush text-ivory">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-14 sm:px-8 md:grid-cols-2 lg:grid-cols-[1.4fr_0.8fr_1.1fr_1.1fr]">
        <div>
          <p className="display display-sm text-ivory">MorphoLens</p>
          <p className="mt-2 max-w-sm text-sm text-ivory/70">Research prototype for low-resource multilingual morphology.</p>
          <p className="mt-4 max-w-sm text-sm text-ivory/70">
            Developed with the {project.institution} as part of the {project.scheme} project{" "}
            <span className="italic text-oak">{project.decraTitle}</span>.
          </p>
          <p className="mt-6 max-w-sm font-serif text-base italic text-oak">
            Built for exploring morphological generalisation, not replacing linguistic expertise.
          </p>
        </div>
        <div className="text-sm">
          <p className="eyebrow !text-ivory/50">Workspace</p>
          <ul className="mt-3 space-y-2 text-ivory/80">
            <li><Link className="hover:text-sienna-soft" href="/explore">Morphology explorer</Link></li>
            <li><Link className="hover:text-sienna-soft" href="/compare">Cross-lingual comparison</Link></li>
            <li><Link className="hover:text-sienna-soft" href="/experiment">Unseen-lemma experiment</Link></li>
            <li><Link className="hover:text-sienna-soft" href="/about">Methodology &amp; data</Link></li>
          </ul>
        </div>
        <div className="text-sm">
          <p className="eyebrow !text-ivory/50">Contact</p>
          <ul className="mt-3 space-y-3 text-ivory/80">
            {team.map((p) => (
              <li key={p.name}>
                <span className="block">{p.name}</span>
                {p.email && (
                  <a href={`mailto:${p.email}`} className="block break-all text-xs text-ivory/60 underline-offset-2 hover:text-sienna-soft hover:underline">
                    {p.email}
                  </a>
                )}
              </li>
            ))}
          </ul>
        </div>
        <div className="text-sm text-ivory/70">
          <p className="eyebrow !text-ivory/50">Integrity</p>
          <p className="mt-3">
            Forms come from pinned UniMorph commits or cited grammars, each with a verbatim evidence record. Results are
            measured with transparent rule-based systems and PyTorch neural models trained on the same splits.
          </p>
        </div>
      </div>
      <div className="border-t border-ivory/10">
        <p className="mx-auto max-w-7xl px-5 py-4 font-mono text-[0.68rem] tracking-wider text-ivory/40 sm:px-8">
          MORPHOLENS · v{VERSION} · DATA: UNIMORPH (TUR · URD · EVN · CKT · RON)
        </p>
      </div>
    </footer>
  );
}
