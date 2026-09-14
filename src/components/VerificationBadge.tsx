import { BookOpen, Database } from "lucide-react";
import type { Attestation } from "@/data/types";

export function VerificationBadge({ status, compact = false }: { status: Attestation; compact?: boolean }) {
  return status === "unimorph" ? (
    <span
      title="Stored in the pinned UniMorph file. MorphoLens has not independently verified it."
      className="inline-flex items-center gap-1 rounded-sm border border-bush/25 bg-bush/[0.07] px-1.5 py-0.5 font-mono text-[0.62rem] font-semibold tracking-[0.12em] text-bush"
    >
      <Database size={12} /> {compact ? "UNIMORPH" : "UNIMORPH RECORD"}
    </span>
  ) : (
    <span
      title="Hand-annotated textbook pattern (see source). This form is not in the pinned UniMorph file."
      className="inline-flex items-center gap-1 rounded-sm border border-sienna/50 bg-sienna/[0.08] px-1.5 py-0.5 font-mono text-[0.62rem] font-semibold tracking-[0.12em] text-sienna"
    >
      <BookOpen size={12} /> {compact ? "REFERENCE" : "REFERENCE PATTERN"}
    </span>
  );
}

export function HandBadge() {
  return (
    <span
      title="Morpheme boundaries annotated by the MorphoLens author following the cited source; not expert-reviewed."
      className="inline-flex items-center rounded-sm border border-oak bg-oak/40 px-1.5 py-0.5 font-mono text-[0.62rem] font-semibold tracking-[0.12em] text-bush"
    >
      HAND SEGMENTATION
    </span>
  );
}
