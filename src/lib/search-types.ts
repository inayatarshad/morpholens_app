import type { Triple } from "@/data/unimorph";

export type NearMatch = Triple & { distance: number };

/** Response of GET /api/search?lang=…&q=…; every triple is verbatim from UniMorph. */
export type SearchResponse = {
  lang: string;
  query: string;
  /** Triples in the full UniMorph file (after de-duplication). */
  total: number;
  /** Forms whose canonical spelling equals the query. */
  exact: Triple[];
  /** Forms matching only when diacritics/transcription are ignored (empty if any exact match). */
  loose: Triple[];
  /** Lemmas matching the query exactly / loosely. */
  lemmas: { exact: string[]; loose: string[] };
  /** Other attested forms that match only loosely, even when an exact match exists (e.g. casa → casă). */
  alternatives: string[];
  /** Closest attested forms (edit distance ≤ 2) when nothing matched at all. */
  near: NearMatch[];
  /** Full paradigms (all cells) of every lemma referenced above. */
  paradigms: Record<string, Triple[]>;
  /** Number of records in the full file carrying each returned bundle (for ordering only). */
  bundleCounts: Record<string, number>;
  truncated: boolean;
  source: { sha?: string };
};
