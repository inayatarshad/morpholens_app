"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";

export function SectionLabel({ index, children }: { index?: string; children: React.ReactNode }) {
  return (
    <div className="mb-4 flex items-center gap-3">
      {index && <span className="font-mono text-[0.7rem] text-sienna">{index}</span>}
      <span className="eyebrow">{children}</span>
      <span className="h-px flex-1 bg-line" />
    </div>
  );
}

export function Panel({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <section className={`rounded-xl border border-line bg-ivory/80 p-6 shadow-[0_1px_0_rgba(16,46,40,0.04)] ${className}`}>{children}</section>;
}

export function CopyButton({ text, label = "Copy" }: { text: string; label?: string }) {
  const [done, setDone] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
          setDone(true);
          setTimeout(() => setDone(false), 1400);
        } catch {
          /* clipboard unavailable */
        }
      }}
      className="inline-flex items-center gap-1.5 rounded-md border border-line-strong bg-ivory px-2.5 py-1 text-xs text-bush transition hover:border-bush hover:bg-cashmere"
    >
      {done ? <Check size={13} /> : <Copy size={13} />}
      {done ? "Copied" : label}
    </button>
  );
}
