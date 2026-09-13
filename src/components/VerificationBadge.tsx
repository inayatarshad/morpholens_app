import { BadgeCheck, BookOpen } from "lucide-react";
import type { Attestation } from "@/data/types";

export function VerificationBadge({ status, compact = false }: { status: Attestation; compact?: boolean }) {
  return status === "unimorph" ? (
    <span
      title="The exact (lemma, form, bundle) triple occurs in the pinned UniMorph file."
      className="inline-flex items-center gap-1 rounded-sm border border-bush/25 bg-bush/[0.07] px-1.5 py-0.5 font-mono text-[0.62rem] font-semibold tracking-[0.12em] text-bush"
    >
      <BadgeCheck size={12} /> {compact ? "UNIMORPH" : "UNIMORPH-ATTESTED"}
    </span>
  ) : (
    <span
      title="Textbook-attested pattern (see source); this form is not in the pinned UniMorph file."
      className="inline-flex items-center gap-1 rounded-sm border border-sienna/50 bg-sienna/[0.08] px-1.5 py-0.5 font-mono text-[0.62rem] font-semibold tracking-[0.12em] text-sienna"
    >
      <BookOpen size={12} /> {compact ? "REFERENCE" : "REFERENCE · NOT IN UNIMORPH"}
    </span>
  );
}
