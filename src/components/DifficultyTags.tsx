import { difficultyMeta } from "@/data/morphology";
import type { DifficultyTag, TagSource } from "@/data/types";

const ALL: DifficultyTag[] = [
  "UNSEEN_LEMMA",
  "ALLOMORPHY",
  "RARE_FEATURE",
  "ORTHOGRAPHIC_VARIATION",
  "LONG_MORPHEME_CHAIN",
  "CODE_SWITCHING",
  "SYNCRETISM",
  "PERIPHRASIS",
  "STEM_CHANGE",
];

const SOURCE_LABEL: Record<TagSource, string> = {
  data: "DATA",
  heuristic: "HEURISTIC",
  gold: "GOLD",
  experiment: "EXPERIMENT",
};

/** Shows the full challenge vocabulary; tags that apply are highlighted with where they come from. */
export function DifficultyTags({
  tags = [],
  notes = {},
  sources = {},
}: {
  tags?: DifficultyTag[];
  notes?: Partial<Record<DifficultyTag, string>>;
  sources?: Partial<Record<DifficultyTag, TagSource>>;
}) {
  return (
    <div>
      <div className="flex flex-wrap gap-1.5">
        {ALL.map((t) => {
          const on = tags.includes(t);
          return (
            <span
              key={t}
              title={difficultyMeta[t].description}
              className={`inline-flex items-center gap-1.5 rounded-sm border px-2 py-1 font-mono text-[0.62rem] font-semibold tracking-[0.12em] transition ${
                on ? "border-bush bg-bush text-ivory" : "border-line text-muted/60"
              }`}
            >
              {t.replace(/_/g, " ")}
              {on && sources[t] && <span className="rounded-[2px] bg-ivory/20 px-1 text-[0.55rem] text-oak">{SOURCE_LABEL[sources[t]!]}</span>}
            </span>
          );
        })}
      </div>
      {tags.length > 0 ? (
        <ul className="mt-4 space-y-2 text-sm">
          {tags.map((t) => (
            <li key={t} className="flex gap-2">
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-sienna" />
              <span>
                <span className="font-medium text-bush">{difficultyMeta[t].label}.</span>{" "}
                <span className="text-ink/75">{notes[t] ?? difficultyMeta[t].description}</span>
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-3 text-sm text-muted">No difficulty signals detected for this form.</p>
      )}
      <p className="mt-3 text-[0.7rem] leading-relaxed text-muted">
        DATA: read directly from stored records · HEURISTIC: inferred by MorphoLens · GOLD: hand annotation · EXPERIMENT: defined only relative to a train/test split (see the Experiment page).
      </p>
    </div>
  );
}
