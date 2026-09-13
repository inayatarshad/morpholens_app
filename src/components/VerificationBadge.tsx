import { BadgeCheck, CircleDashed } from "lucide-react";

export function VerificationBadge({ verified, compact = false }: { verified: boolean; compact?: boolean }) {
  return verified ? (
    <span
      title="Follows a textbook-attested pattern cited in the source. Not yet cross-checked against UniMorph."
      className="inline-flex items-center gap-1 rounded-sm border border-bush/25 bg-bush/[0.07] px-1.5 py-0.5 font-mono text-[0.62rem] font-semibold tracking-[0.12em] text-bush"
    >
      <BadgeCheck size={12} /> {compact ? "REF" : "REFERENCE PATTERN"}
    </span>
  ) : (
    <span
      title="Illustrative demo example — pending linguistic verification."
      className="inline-flex items-center gap-1 rounded-sm border border-dashed border-sienna/60 bg-sienna/[0.08] px-1.5 py-0.5 font-mono text-[0.62rem] font-semibold tracking-[0.12em] text-sienna"
    >
      <CircleDashed size={12} /> {compact ? "DEMO" : "UNVERIFIED / DEMO"}
    </span>
  );
}
