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
