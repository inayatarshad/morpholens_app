import type { Metadata } from "next";
import { Container } from "@/components/AppShell";
import { ComparisonMatrix } from "@/components/ComparisonMatrix";

export const metadata: Metadata = { title: "Compare" };

export default function ComparePage() {
  return (
    <Container className="pt-12">
      <header className="mb-10 grid gap-6 lg:grid-cols-[1.4fr_1fr] lg:items-end">
        <div>
          <p className="eyebrow">Workspace · 02 · Cross-lingual comparison</p>
          <h1 className="display display-lg mt-3 text-bush">
            One grammatical idea.
            <span className="block italic text-sienna">Different linguistic systems.</span>
          </h1>
        </div>
        <p className="text-ink/75">
          Select a grammatical feature to see how each language encodes it — as a suffix, an inflectional ending, a
          postposition or a free particle. Slots without a verified example stay visibly empty.
        </p>
      </header>
      <ComparisonMatrix />
    </Container>
  );
}
