import { NotebookPen } from "lucide-react";

export function ResearchNote({ title = "Why this matters", children }: { title?: string; children: React.ReactNode }) {
  return (
    <aside className="relative overflow-hidden rounded-xl border border-bush/15 bg-bush p-6 text-ivory">
      <span className="pointer-events-none absolute -right-4 -top-10 font-serif text-[9rem] leading-none text-ivory/[0.06]">”</span>
      <p className="eyebrow flex items-center gap-2 !text-oak">
        <NotebookPen size={13} /> {title}
      </p>
      <div className="mt-3 font-serif text-lg leading-relaxed text-ivory/90">{children}</div>
    </aside>
  );
}
