import { NextResponse, type NextRequest } from "next/server";
import { languages } from "@/data/languages";
import type { LanguageId } from "@/data/types";
import { search } from "@/lib/unimorph-server";

const isLang = (v: string | null): v is LanguageId => !!v && languages.some((l) => l.id === v);

/** Exact / loose / lemma search over the full pinned UniMorph file for one language. */
export function GET(req: NextRequest) {
  const params = req.nextUrl.searchParams;
  const lang = params.get("lang");
  if (!isLang(lang)) return NextResponse.json({ error: "Unknown language" }, { status: 400 });
  const q = (params.get("q") ?? "").slice(0, 100);
  const result = search(lang, q);
  if (!result) return NextResponse.json({ error: "UniMorph data is not available on this server." }, { status: 503 });
  return NextResponse.json(result, {
    headers: { "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=604800" },
  });
}
