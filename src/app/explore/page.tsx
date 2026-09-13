import type { Metadata } from "next";
import { Suspense } from "react";
import { Container } from "@/components/AppShell";
import { Explorer } from "@/components/Explorer";

export const metadata: Metadata = { title: "Explore" };

export default function ExplorePage() {
  return (
    <Container className="pt-12">
      <header className="mb-10 max-w-3xl">
        <p className="eyebrow">Workspace · 01</p>
        <h1 className="display display-lg mt-3 text-bush">
          Word morphology <span className="italic text-sienna">explorer</span>
        </h1>
        <p className="lede mt-4 text-ink/75">
          Inspect the morphological information packed into a single word form: segmentation, features, paradigm,
          difficulty and — always — where the analysis came from.
        </p>
      </header>
      <Suspense fallback={<p className="text-muted">Loading workspace…</p>}>
        <Explorer />
      </Suspense>
    </Container>
  );
}
