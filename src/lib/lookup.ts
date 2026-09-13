import { entries } from "@/data/morphology";
import type { MorphologicalEntry } from "@/data/types";

/** Fold case, diacritics and Turkish dotless ı so ASCII input still matches. */
export function normalise(s: string): string {
  return s
    .trim()
    .toLocaleLowerCase("en")
    .replace(/ı/g, "i")
    .replace(/[’'ʼ]/g, "'")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/\s+/g, " ");
}

export function findEntry(languageId: string, query: string): MorphologicalEntry | undefined {
  const q = normalise(query);
  if (!q) return undefined;
  return entries.find(
    (e) =>
      e.languageId === languageId &&
      [e.surface, e.romanization, ...(e.aliases ?? [])].some((c) => c && normalise(c) === q),
  );
}
