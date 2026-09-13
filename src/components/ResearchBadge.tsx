export function StatusTag({ label, tone = "bush" }: { label: string; tone?: "bush" | "sienna" }) {
  const cls = tone === "bush" ? "border-bush/30 bg-bush/[0.07] text-bush" : "border-sienna/40 bg-sienna/10 text-sienna";
  return (
    <span className={`inline-flex items-center rounded-sm border px-1.5 py-0.5 font-mono text-[0.62rem] font-semibold tracking-[0.14em] ${cls}`}>
      {label}
    </span>
  );
}
