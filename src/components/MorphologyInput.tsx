"use client";

import { ScanSearch } from "lucide-react";

export function MorphologyInput({
  value,
  onChange,
  onSubmit,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  onSubmit: () => void;
  placeholder?: string;
}) {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
      className="flex flex-col gap-3 sm:flex-row"
    >
      <label className="sr-only" htmlFor="word">Analyse a word</label>
      <input
        id="word"
        dir="auto"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete="off"
        spellCheck={false}
        className="display min-w-0 flex-1 rounded-lg border border-line-strong bg-ivory px-5 py-3.5 text-2xl text-bush placeholder:text-muted/50 focus:border-bush focus:outline-none focus:ring-4 focus:ring-bush/10 sm:text-3xl"
      />
      <button
        type="submit"
        className="inline-flex items-center justify-center gap-2 rounded-lg bg-bush px-6 py-3.5 text-sm font-semibold tracking-wide text-ivory transition hover:bg-bush-soft active:scale-[0.98]"
      >
        <ScanSearch size={17} /> Analyse
        <kbd className="ml-1 hidden rounded border border-ivory/25 px-1.5 font-mono text-[0.62rem] text-ivory/70 sm:inline">↵</kbd>
      </button>
    </form>
  );
}
