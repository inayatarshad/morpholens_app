export function IllustrativeTag({ label = "ILLUSTRATIVE" }: { label?: string }) {
  return (
    <span className="inline-flex items-center rounded-sm border border-sienna/40 bg-sienna/10 px-1.5 py-0.5 font-mono text-[0.62rem] font-semibold tracking-[0.14em] text-sienna">
      {label}
    </span>
  );
}
