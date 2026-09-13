export function ResearchBadge() {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-burgundy/30 bg-burgundy px-3 py-1 text-[0.62rem] font-semibold tracking-[0.2em] text-ivory">
      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-sienna-soft" />
      RESEARCH PROTOTYPE
    </span>
  );
}

export function IllustrativeTag({ label = "ILLUSTRATIVE" }: { label?: string }) {
  return (
    <span className="inline-flex items-center rounded-sm border border-sienna/40 bg-sienna/10 px-1.5 py-0.5 font-mono text-[0.62rem] font-semibold tracking-[0.14em] text-sienna">
      {label}
    </span>
  );
}
