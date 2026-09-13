import { difficultyMeta } from "@/data/morphology";
import type { DifficultyTag } from "@/data/types";

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

/** Shows the full challenge vocabulary; tags that apply are highlighted. */
export function DifficultyTags({
  tags = [],
  notes = {},
  computed = false,
}: {
  tags?: DifficultyTag[];
  notes?: Partial<Record<DifficultyTag, string>>;
  computed?: boolean;
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
              className={`rounded-sm border px-2 py-1 font-mono text-[0.62rem] font-semibold tracking-[0.12em] transition ${
                on ? "border-bush bg-bush text-ivory" : "border-line text-muted/60"
              }`}
            >
              {t.replace(/_/g, " ")}
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
      {computed && <p className="mt-3 text-xs text-muted">Tags computed automatically from the UniMorph sample and the lemma–form alignment.</p>}
    </div>
  );
}
