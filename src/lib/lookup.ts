import type { LanguageId } from "@/data/types";

/**
 * Two levels of string matching used everywhere a user can search.
 *
 * canonical: the same spelling. Only encoding and keyboard variants that never
 *   distinguish words are unified: Unicode NFC, letter case, zero-width characters,
 *   apostrophe variants, Romanian s/t-cedilla vs. comma-below, and Arabic-keyboard
 *   yeh/kaf vs. the Urdu letters. A canonical match is reported as an exact match.
 *
 * loose: additionally ignores diacritics and transcription details (e.g. ı/i, ă/a,
 *   ə/e, ː, Chukchi ԓ/л). Loose matches can join genuinely different words
 *   (Romanian casă ≠ casa), so they are shown only when nothing matches exactly,
 *   and always labelled as such.
 */
const LOCALE: Partial<Record<LanguageId, string>> = { tur: "tr", ron: "ro" };

export function canonical(s: string, lang?: LanguageId): string {
  return s
    .normalize("NFC")
    .replace(/[​-‏ـ﻿]/g, "")
    .replace(/[’‘ʼ`´]/g, "'")
    .replace(/ş/g, "ș").replace(/Ş/g, "Ș").replace(/ţ/g, "ț").replace(/Ţ/g, "Ț")
    .replace(/[يى]/g, "ی").replace(/ك/g, "ک")
    .toLocaleLowerCase((lang && LOCALE[lang]) || "en")
    .trim()
    .replace(/\s+/g, " ");
}

export function loose(s: string, lang?: LanguageId): string {
  return canonical(s, lang)
    .replace(/t͡ʃ|tʃ/g, "ch").replace(/d͡ʒ|dʒ/g, "j").replace(/ʃ/g, "sh").replace(/ʒ/g, "zh")
    .replace(/ŋ/g, "ng").replace(/ə/g, "e").replace(/ː/g, "")
    .replace(/ı/g, "i")
    .replace(/ԓ/g, "л").replace(/ӄ/g, "к").replace(/ӈ/g, "н")
    .replace(/[هۃە]/g, "ہ")
    .replace(/['\-+·]/g, "")
    .normalize("NFD")
    .replace(/[̀-ًͯ-ٰٟۖ-ۭ]/g, "")
    .normalize("NFC");
}

/** Loose key without language-specific casing (for UI-only comparisons). */
export const normalise = (s: string) => loose(s);
