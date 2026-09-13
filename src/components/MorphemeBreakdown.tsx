import type { Morpheme } from "@/data/types";

/** Bush → Sienna → Oak → Cashmere → Burgundy, stem always Bush. */
const swatches = [
  { bar: "bg-bush", chip: "bg-bush text-ivory border-bush" },
  { bar: "bg-sienna", chip: "bg-sienna text-ivory border-sienna" },
  { bar: "bg-oak", chip: "bg-oak text-bush border-oak" },
  { bar: "bg-cashmere ring-1 ring-inset ring-line-strong", chip: "bg-cashmere text-bush border-line-strong" },
  { bar: "bg-burgundy", chip: "bg-burgundy text-ivory border-burgundy" },
];

export const swatchFor = (i: number) => swatches[i % swatches.length];

export function MorphemeBreakdown({ morphemes, size = "lg" }: { morphemes: Morpheme[]; size?: "lg" | "sm" }) {
  const big = size === "lg";
  return (
    <div className="overflow-x-auto pb-2">
      {big && (
        <p className="mb-5 font-mono text-sm text-muted">
          {morphemes.map((m, i) => (
            <span key={i}>
              {i > 0 && <span className="px-2 text-sienna">+</span>}
              <span className="text-ink">{m.form.replace(/^-|-$/g, "")}</span>
            </span>
          ))}
        </p>
      )}
      <div className="flex min-w-max items-stretch gap-1.5">
        {morphemes.map((m, i) => {
          const s = swatchFor(i);
          return (
            <div
              key={`${m.form}-${i}`}
              className="rise group flex flex-col"
              style={{ animationDelay: `${i * 90}ms`, minWidth: big ? "6.5rem" : "4rem" }}
            >
              <span className={`${big ? "display text-3xl sm:text-4xl" : "font-serif text-xl"} px-1 text-bush`}>
                {m.form.replace(/^-|-$/g, "")}
              </span>
              <span className={`grow mt-2 block ${big ? "h-3" : "h-2"} rounded-sm ${s.bar}`} style={{ animationDelay: `${i * 90 + 120}ms` }} />
              <span className={`mt-2 px-1 font-mono ${big ? "text-[0.72rem]" : "text-[0.62rem]"} font-semibold tracking-[0.12em] text-ink`}>
                {m.gloss}
              </span>
              {big && <span className="px-1 text-xs text-muted">{m.role}</span>}
            </div>
          );
        })}
      </div>
    </div>
  );
}
