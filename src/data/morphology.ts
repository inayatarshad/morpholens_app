import type { ComparisonExample, DifficultyTag, MorphologicalEntry, ParadigmEntry } from "./types";

/**
 * LOCAL DEMONSTRATION DATASET
 * ---------------------------
 * Small by design. Replace or extend with UniMorph / lexicon imports (see README).
 *
 * Turkish and Urdu entries follow textbook-attested inflection patterns and cite the
 * reference grammar they follow. They have not been cross-checked against a UniMorph
 * release; `verificationNote` states this on every entry.
 * Evenki / Chukchi: no forms are asserted as verified.
 */

const DATASET = "MorphoLens local demo set v0.1";

const TUR_SOURCE = "Göksel & Kerslake (2005), Turkish: A Comprehensive Grammar. Routledge.";
const URD_SOURCE = "Schmidt (1999), Urdu: An Essential Grammar. Routledge.";
const TUR_CHECK = { label: "UniMorph · tur", url: "https://github.com/unimorph/tur" };
const URD_CHECK = { label: "UniMorph · urd", url: "https://github.com/unimorph/urd" };
const REF_NOTE = "Textbook-attested pattern. Awaiting cross-check against UniMorph and expert review.";

// ── Shared paradigms ───────────────────────────────────────────────────────────

const evParadigm: ParadigmEntry[] = [
  { surface: "ev", features: { Number: "Singular", Case: "Nominative" }, segmentation: ["ev"] },
  { surface: "evler", features: { Number: "Plural", Case: "Nominative" }, segmentation: ["ev", "ler"] },
  { surface: "evim", features: { Number: "Singular", Possessor: "1SG" }, segmentation: ["ev", "im"] },
  { surface: "evimiz", features: { Number: "Singular", Possessor: "1PL" }, segmentation: ["ev", "imiz"] },
  { surface: "evde", features: { Number: "Singular", Case: "Locative" }, segmentation: ["ev", "de"] },
  { surface: "evden", features: { Number: "Singular", Case: "Ablative" }, segmentation: ["ev", "den"] },
  { surface: "evlerden", features: { Number: "Plural", Case: "Ablative" }, segmentation: ["ev", "ler", "den"] },
  {
    surface: "evlerimizden",
    features: { Number: "Plural", Possessor: "1PL", Case: "Ablative" },
    segmentation: ["ev", "ler", "imiz", "den"],
  },
];

const kitapParadigm: ParadigmEntry[] = [
  { surface: "kitap", features: { Number: "Singular", Case: "Nominative" }, segmentation: ["kitap"] },
  { surface: "kitaplar", features: { Number: "Plural", Case: "Nominative" }, segmentation: ["kitap", "lar"] },
  { surface: "kitabım", features: { Number: "Singular", Possessor: "1SG" }, segmentation: ["kitab", "ım"] },
  { surface: "kitaptan", features: { Number: "Singular", Case: "Ablative" }, segmentation: ["kitap", "tan"] },
  { surface: "kitaplardan", features: { Number: "Plural", Case: "Ablative" }, segmentation: ["kitap", "lar", "dan"] },
  {
    surface: "kitaplarımızdan",
    features: { Number: "Plural", Possessor: "1PL", Case: "Ablative" },
    segmentation: ["kitap", "lar", "ımız", "dan"],
  },
];

const gelParadigm: ParadigmEntry[] = [
  { surface: "geldi", features: { Tense: "Past", Person: "3SG", Polarity: "Positive" }, segmentation: ["gel", "di"] },
  { surface: "geldim", features: { Tense: "Past", Person: "1SG", Polarity: "Positive" }, segmentation: ["gel", "di", "m"] },
  { surface: "geldik", features: { Tense: "Past", Person: "1PL", Polarity: "Positive" }, segmentation: ["gel", "di", "k"] },
  { surface: "gelmedi", features: { Tense: "Past", Person: "3SG", Polarity: "Negative" }, segmentation: ["gel", "me", "di"] },
  { surface: "geliyor", features: { Aspect: "Progressive", Person: "3SG" }, segmentation: ["gel", "iyor"] },
  { surface: "gelecek", features: { Tense: "Future", Person: "3SG" }, segmentation: ["gel", "ecek"] },
];

const larkaParadigm: ParadigmEntry[] = [
  { surface: "لڑکا", romanization: "laṛkā", features: { Number: "Singular", Case: "Direct" }, segmentation: ["laṛk", "ā"] },
  { surface: "لڑکے", romanization: "laṛke", features: { Number: "Singular", Case: "Oblique" }, segmentation: ["laṛk", "e"] },
  { surface: "لڑکے", romanization: "laṛke", features: { Number: "Plural", Case: "Direct" }, segmentation: ["laṛk", "e"] },
  { surface: "لڑکوں", romanization: "laṛkoṉ", features: { Number: "Plural", Case: "Oblique" }, segmentation: ["laṛk", "oṉ"] },
];

const kitabParadigm: ParadigmEntry[] = [
  { surface: "کتاب", romanization: "kitāb", features: { Number: "Singular", Case: "Direct" }, segmentation: ["kitāb"] },
  { surface: "کتاب", romanization: "kitāb", features: { Number: "Singular", Case: "Oblique" }, segmentation: ["kitāb"] },
  { surface: "کتابیں", romanization: "kitābeṉ", features: { Number: "Plural", Case: "Direct" }, segmentation: ["kitāb", "eṉ"] },
  { surface: "کتابوں", romanization: "kitāboṉ", features: { Number: "Plural", Case: "Oblique" }, segmentation: ["kitāb", "oṉ"] },
];

const likhParadigm: ParadigmEntry[] = [
  { surface: "لکھا", romanization: "likhā", features: { Aspect: "Perfective", Gender: "Masc", Number: "Singular" }, segmentation: ["likh", "ā"] },
  { surface: "لکھے", romanization: "likhe", features: { Aspect: "Perfective", Gender: "Masc", Number: "Plural" }, segmentation: ["likh", "e"] },
  { surface: "لکھی", romanization: "likhī", features: { Aspect: "Perfective", Gender: "Fem", Number: "Singular" }, segmentation: ["likh", "ī"] },
  { surface: "لکھیں", romanization: "likhīṉ", features: { Aspect: "Perfective", Gender: "Fem", Number: "Plural" }, segmentation: ["likh", "īṉ"] },
];

// ── Entries ────────────────────────────────────────────────────────────────────

const tur = (e: Omit<MorphologicalEntry, "languageId" | "source" | "crossCheck" | "dataset" | "verified" | "verificationNote">): MorphologicalEntry => ({
  ...e,
  languageId: "tur",
  source: TUR_SOURCE,
  crossCheck: TUR_CHECK,
  dataset: DATASET,
  verified: true,
  verificationNote: REF_NOTE,
});

const urd = (e: Omit<MorphologicalEntry, "languageId" | "source" | "crossCheck" | "dataset" | "verified" | "verificationNote">): MorphologicalEntry => ({
  ...e,
  languageId: "urd",
  source: URD_SOURCE,
  crossCheck: URD_CHECK,
  dataset: DATASET,
  verified: true,
  verificationNote: REF_NOTE,
});

export const entries: MorphologicalEntry[] = [
  // ── Turkish ──
  tur({
    id: "tur-evlerimizden",
    surface: "evlerimizden",
    lemma: "ev",
    pos: "NOUN",
    segmentation: ["ev", "ler", "imiz", "den"],
    morphemes: [
      { form: "ev", gloss: "HOUSE", meaning: "house", role: "stem" },
      { form: "-ler", gloss: "PL", meaning: "plural", role: "suffix" },
      { form: "-imiz", gloss: "1PL.POSS", meaning: "our", role: "suffix" },
      { form: "-den", gloss: "ABL", meaning: "from", role: "suffix" },
    ],
    features: { Number: "Plural", Possessor: "1PL", Case: "Ablative" },
    unimorph: "N;ABL;PL;PSS1P",
    gloss: "house-PL-1PL.POSS-ABL",
    translation: "from our houses",
    paradigm: evParadigm,
    difficulty: ["LONG_MORPHEME_CHAIN"],
    difficultyNotes: { LONG_MORPHEME_CHAIN: "Three inflectional suffixes stacked on one stem." },
  }),
  tur({
    id: "tur-kitaplarimizdan",
    surface: "kitaplarımızdan",
    aliases: ["kitaplarimizdan"],
    lemma: "kitap",
    pos: "NOUN",
    segmentation: ["kitap", "lar", "ımız", "dan"],
    morphemes: [
      { form: "kitap", gloss: "BOOK", meaning: "book", role: "stem" },
      { form: "-lar", gloss: "PL", meaning: "plural", role: "suffix" },
      { form: "-ımız", gloss: "1PL.POSS", meaning: "our", role: "suffix" },
      { form: "-dan", gloss: "ABL", meaning: "from", role: "suffix" },
    ],
    features: { Number: "Plural", Possessor: "1PL", Case: "Ablative" },
    unimorph: "N;ABL;PL;PSS1P",
    gloss: "book-PL-1PL.POSS-ABL",
    translation: "from our books",
    paradigm: kitapParadigm,
    difficulty: ["ALLOMORPHY", "LONG_MORPHEME_CHAIN"],
    difficultyNotes: {
      ALLOMORPHY: "Back-vowel harmony (-lar, -dan vs. -ler, -den); stem-final p→b before a vowel (kitabım).",
      LONG_MORPHEME_CHAIN: "Same three-suffix chain as evlerimizden, different allomorphs.",
    },
  }),
  tur({
    id: "tur-evler",
    surface: "evler",
    lemma: "ev",
    pos: "NOUN",
    segmentation: ["ev", "ler"],
    morphemes: [
      { form: "ev", gloss: "HOUSE", meaning: "house", role: "stem" },
      { form: "-ler", gloss: "PL", meaning: "plural", role: "suffix" },
    ],
    features: { Number: "Plural", Case: "Nominative" },
    unimorph: "N;NOM;PL",
    gloss: "house-PL",
    translation: "houses",
    paradigm: evParadigm,
  }),
  tur({
    id: "tur-evden",
    surface: "evden",
    lemma: "ev",
    pos: "NOUN",
    segmentation: ["ev", "den"],
    morphemes: [
      { form: "ev", gloss: "HOUSE", meaning: "house", role: "stem" },
      { form: "-den", gloss: "ABL", meaning: "from", role: "suffix" },
    ],
    features: { Number: "Singular", Case: "Ablative" },
    unimorph: "N;ABL;SG",
    gloss: "house-ABL",
    translation: "from the house",
    paradigm: evParadigm,
  }),
  tur({
    id: "tur-evimiz",
    surface: "evimiz",
    lemma: "ev",
    pos: "NOUN",
    segmentation: ["ev", "imiz"],
    morphemes: [
      { form: "ev", gloss: "HOUSE", meaning: "house", role: "stem" },
      { form: "-imiz", gloss: "1PL.POSS", meaning: "our", role: "suffix" },
    ],
    features: { Number: "Singular", Possessor: "1PL" },
    unimorph: "N;NOM;SG;PSS1P",
    gloss: "house-1PL.POSS",
    translation: "our house",
    paradigm: evParadigm,
  }),
  tur({
    id: "tur-geldi",
    surface: "geldi",
    lemma: "gelmek",
    pos: "VERB",
    segmentation: ["gel", "di"],
    morphemes: [
      { form: "gel", gloss: "COME", meaning: "come", role: "stem" },
      { form: "-di", gloss: "PST", meaning: "past (3SG, zero person marker)", role: "suffix" },
    ],
    features: { Tense: "Past", Person: "3SG", Polarity: "Positive" },
    unimorph: "V;IND;PST;3;SG;POS",
    gloss: "come-PST",
    translation: "(s)he came",
    paradigm: gelParadigm,
  }),
  tur({
    id: "tur-gelmedi",
    surface: "gelmedi",
    lemma: "gelmek",
    pos: "VERB",
    segmentation: ["gel", "me", "di"],
    morphemes: [
      { form: "gel", gloss: "COME", meaning: "come", role: "stem" },
      { form: "-me", gloss: "NEG", meaning: "negation", role: "suffix" },
      { form: "-di", gloss: "PST", meaning: "past", role: "suffix" },
    ],
    features: { Tense: "Past", Person: "3SG", Polarity: "Negative" },
    unimorph: "V;IND;PST;3;SG;NEG",
    gloss: "come-NEG-PST",
    translation: "(s)he did not come",
    paradigm: gelParadigm,
  }),
  tur({
    id: "tur-gitti",
    surface: "gitti",
    lemma: "gitmek",
    pos: "VERB",
    segmentation: ["git", "ti"],
    morphemes: [
      { form: "git", gloss: "GO", meaning: "go", role: "stem" },
      { form: "-ti", gloss: "PST", meaning: "past (devoiced allomorph of -di)", role: "suffix" },
    ],
    features: { Tense: "Past", Person: "3SG", Polarity: "Positive" },
    unimorph: "V;IND;PST;3;SG;POS",
    gloss: "go-PST",
    translation: "(s)he went",
    difficulty: ["ALLOMORPHY"],
    difficultyNotes: { ALLOMORPHY: "Past suffix surfaces as -ti after a voiceless consonant." },
  }),

  // ── Urdu ──
  urd({
    id: "urd-larke",
    surface: "لڑکے",
    romanization: "laṛke",
    aliases: ["larke", "larkay", "larkey", "laṛke"],
    lemma: "لڑکا",
    lemmaRomanization: "laṛkā",
    pos: "NOUN",
    segmentation: ["laṛk", "e"],
    morphemes: [
      { form: "laṛk-", gloss: "BOY", meaning: "boy", role: "stem" },
      { form: "-e", gloss: "M.PL.DIR", meaning: "masculine plural (direct)", role: "suffix" },
    ],
    features: { Number: "Plural", Case: "Direct", Gender: "Masculine" },
    gloss: "boy-M.PL.DIR",
    translation: "boys",
    paradigm: larkaParadigm,
    difficulty: ["ORTHOGRAPHIC_VARIATION"],
    difficultyNotes: {
      ORTHOGRAPHIC_VARIATION:
        "Roman-Urdu spellings vary (larke / larkay / larkey). The same form is also syncretic with SG.OBL.",
    },
  }),
  urd({
    id: "urd-larkon",
    surface: "لڑکوں",
    romanization: "laṛkoṉ",
    aliases: ["larkon", "larkoon", "larkoṉ"],
    lemma: "لڑکا",
    lemmaRomanization: "laṛkā",
    pos: "NOUN",
    segmentation: ["laṛk", "oṉ"],
    morphemes: [
      { form: "laṛk-", gloss: "BOY", meaning: "boy", role: "stem" },
      { form: "-oṉ", gloss: "M.PL.OBL", meaning: "plural (oblique, before a postposition)", role: "suffix" },
    ],
    features: { Number: "Plural", Case: "Oblique", Gender: "Masculine" },
    gloss: "boy-M.PL.OBL",
    translation: "boys (oblique), e.g. laṛkoṉ se ‘from the boys’",
    paradigm: larkaParadigm,
    difficulty: ["ORTHOGRAPHIC_VARIATION"],
  }),
  urd({
    id: "urd-kitaben",
    surface: "کتابیں",
    romanization: "kitābeṉ",
    aliases: ["kitaben", "kitabain", "kitabein"],
    lemma: "کتاب",
    lemmaRomanization: "kitāb",
    pos: "NOUN",
    segmentation: ["kitāb", "eṉ"],
    morphemes: [
      { form: "kitāb", gloss: "BOOK", meaning: "book", role: "stem" },
      { form: "-eṉ", gloss: "F.PL.DIR", meaning: "feminine plural (direct)", role: "suffix" },
    ],
    features: { Number: "Plural", Case: "Direct", Gender: "Feminine" },
    gloss: "book-F.PL.DIR",
    translation: "books",
    paradigm: kitabParadigm,
    difficulty: ["ALLOMORPHY", "ORTHOGRAPHIC_VARIATION"],
    difficultyNotes: { ALLOMORPHY: "Plural exponent depends on gender class: -e (laṛke) vs. -eṉ (kitābeṉ)." },
  }),
  urd({
    id: "urd-ghar-se",
    surface: "گھر سے",
    romanization: "ghar se",
    aliases: ["ghar se", "gharse"],
    lemma: "گھر",
    lemmaRomanization: "ghar",
    pos: "NOUN + ADP",
    segmentation: ["ghar", "se"],
    morphemes: [
      { form: "ghar", gloss: "HOUSE.OBL", meaning: "house (oblique; zero-marked)", role: "stem" },
      { form: "se", gloss: "ABL", meaning: "from (postposition)", role: "clitic" },
    ],
    features: { Number: "Singular", Case: "Oblique", Relation: "Ablative (postposition)" },
    gloss: "house.OBL from",
    translation: "from (the) house",
  }),
  urd({
    id: "urd-mera-ghar",
    surface: "میرا گھر",
    romanization: "merā ghar",
    aliases: ["mera ghar", "meraghar"],
    lemma: "گھر",
    lemmaRomanization: "ghar",
    pos: "PRON.POSS + NOUN",
    segmentation: ["mer", "ā", "ghar"],
    morphemes: [
      { form: "mer-", gloss: "1SG.POSS", meaning: "my", role: "stem" },
      { form: "-ā", gloss: "M.SG", meaning: "agrees with the possessed noun", role: "suffix" },
      { form: "ghar", gloss: "HOUSE", meaning: "house", role: "word" },
    ],
    features: { Possessor: "1SG", Agreement: "Masc.Sg (possessum)" },
    gloss: "1SG.POSS-M.SG house",
    translation: "my house",
  }),
  urd({
    id: "urd-likha",
    surface: "لکھا",
    romanization: "likhā",
    aliases: ["likha"],
    lemma: "لکھنا",
    lemmaRomanization: "likhnā",
    pos: "VERB",
    segmentation: ["likh", "ā"],
    morphemes: [
      { form: "likh", gloss: "WRITE", meaning: "write", role: "stem" },
      { form: "-ā", gloss: "PFV.M.SG", meaning: "perfective, masculine singular", role: "suffix" },
    ],
    features: { Aspect: "Perfective", Gender: "Masculine", Number: "Singular" },
    gloss: "write-PFV.M.SG",
    translation: "wrote",
    paradigm: likhParadigm,
  }),
  urd({
    id: "urd-nahin-likha",
    surface: "نہیں لکھا",
    romanization: "nahīṉ likhā",
    aliases: ["nahin likha", "nahi likha"],
    lemma: "لکھنا",
    lemmaRomanization: "likhnā",
    pos: "PART + VERB",
    segmentation: ["nahīṉ", "likh", "ā"],
    morphemes: [
      { form: "nahīṉ", gloss: "NEG", meaning: "not (preverbal particle)", role: "particle" },
      { form: "likh", gloss: "WRITE", meaning: "write", role: "stem" },
      { form: "-ā", gloss: "PFV.M.SG", meaning: "perfective, masculine singular", role: "suffix" },
    ],
    features: { Aspect: "Perfective", Polarity: "Negative", Gender: "Masculine", Number: "Singular" },
    gloss: "NEG write-PFV.M.SG",
    translation: "did not write",
    paradigm: likhParadigm,
  }),
  {
    id: "urd-laptopon",
    languageId: "urd",
    surface: "لیپ ٹاپوں",
    romanization: "laipṭāpoṉ",
    aliases: ["laptopon", "laptopoon", "laptopo"],
    lemma: "لیپ ٹاپ",
    lemmaRomanization: "laipṭāp",
    pos: "NOUN",
    segmentation: ["laipṭāp", "oṉ"],
    morphemes: [
      { form: "laipṭāp", gloss: "LAPTOP", meaning: "laptop (English loan)", role: "stem" },
      { form: "-oṉ", gloss: "PL.OBL", meaning: "plural oblique", role: "suffix" },
    ],
    features: { Number: "Plural", Case: "Oblique" },
    gloss: "laptop-PL.OBL",
    translation: "laptops (oblique)",
    difficulty: ["CODE_SWITCHING", "UNSEEN_LEMMA", "ORTHOGRAPHIC_VARIATION"],
    difficultyNotes: {
      CODE_SWITCHING: "English stem carrying native Urdu inflection.",
      UNSEEN_LEMMA: "Loanwords are rarely present in curated paradigm tables.",
    },
    source: "Illustrative construction by the prototype author.",
    crossCheck: URD_CHECK,
    dataset: DATASET,
    verified: false,
    verificationNote: "Illustrative demo example. Not drawn from a corpus or reference grammar.",
  },

  // ── Evenki ──
  {
    id: "evn-dyul",
    languageId: "evn",
    surface: "дюл",
    romanization: "d'ul",
    aliases: ["dyul", "d'ul", "djul"],
    lemma: "дю",
    lemmaRomanization: "d'u",
    pos: "NOUN",
    segmentation: ["дю", "л"],
    morphemes: [
      { form: "дю", gloss: "HOUSE", meaning: "house, dwelling (candidate)", role: "stem" },
      { form: "-л", gloss: "PL", meaning: "plural (candidate allomorph)", role: "suffix" },
    ],
    features: { Number: "Plural" },
    gloss: "house-PL",
    translation: "houses (candidate)",
    difficulty: ["ALLOMORPHY", "UNSEEN_LEMMA"],
    difficultyNotes: {
      ALLOMORPHY: "Plural exponents are reported to vary with stem shape — requires verification.",
    },
    source: "Unverified candidate recalled for demonstration; not checked against a dictionary.",
    crossCheck: { label: "UniMorph project", url: "https://unimorph.github.io/" },
    dataset: DATASET,
    verified: false,
    verificationNote: "Illustrative demo example — pending linguistic verification.",
  },
];

export const entriesByLanguage = (languageId: string) => entries.filter((e) => e.languageId === languageId);
export const entryById = (id: string) => entries.find((e) => e.id === id);

// ── Cross-lingual comparison slots ─────────────────────────────────────────────

export const comparisons: ComparisonExample[] = [
  { languageId: "tur", feature: "plural", entryId: "tur-evler", base: "ev", strategy: "Suffixation", position: "Suffix", note: "Suffix harmonises with the stem vowel: -ler / -lar." },
  { languageId: "tur", feature: "case", entryId: "tur-evden", base: "ev", strategy: "Case suffix", position: "Suffix", note: "Ablative -den / -dan / -ten / -tan." },
  { languageId: "tur", feature: "possession", entryId: "tur-evimiz", base: "ev", strategy: "Possessive suffix", position: "Suffix", note: "Possessor person/number is marked on the possessed noun." },
  { languageId: "tur", feature: "past", entryId: "tur-geldi", base: "gel", strategy: "Tense suffix", position: "Suffix" },
  { languageId: "tur", feature: "negation", entryId: "tur-gelmedi", base: "gel", strategy: "Negative suffix", position: "Suffix (stem-adjacent)", note: "Negation sits between stem and tense." },
  { languageId: "urd", feature: "plural", entryId: "urd-larke", base: "لڑکا", baseRomanization: "laṛkā", strategy: "Inflectional ending (fused number + case)", position: "Suffix", note: "Exponent depends on gender class and case." },
  { languageId: "urd", feature: "case", entryId: "urd-ghar-se", base: "گھر", baseRomanization: "ghar", strategy: "Postposition + oblique stem", position: "Post-nominal, separate word" },
  { languageId: "urd", feature: "possession", entryId: "urd-mera-ghar", base: "گھر", baseRomanization: "ghar", strategy: "Possessive pronoun (agreeing)", position: "Pre-nominal, separate word" },
  { languageId: "urd", feature: "past", entryId: "urd-likha", base: "لکھنا", baseRomanization: "likhnā", strategy: "Perfective participle + agreement", position: "Suffix" },
  { languageId: "urd", feature: "negation", entryId: "urd-nahin-likha", base: "لکھا", baseRomanization: "likhā", strategy: "Negative particle", position: "Pre-verbal, separate word" },
  { languageId: "evn", feature: "plural", entryId: "evn-dyul", base: "дю", baseRomanization: "d'u", strategy: "Suffixation (candidate)", position: "Suffix (candidate)" },
];

export const featureLabels: Record<string, { label: string; description: string }> = {
  plural: { label: "Plural", description: "More than one referent." },
  case: { label: "Case · ablative", description: "Source / motion away: ‘from X’." },
  possession: { label: "Possession", description: "First-person possessor: ‘my / our X’." },
  past: { label: "Past tense", description: "Event located before speech time." },
  negation: { label: "Negation", description: "Clausal negation of a verb." },
};

export const difficultyMeta: Record<DifficultyTag, { label: string; description: string }> = {
  UNSEEN_LEMMA: { label: "Unseen lemma", description: "No form of this lexical item appears in training." },
  ALLOMORPHY: { label: "Allomorphy", description: "One morpheme, several phonologically conditioned shapes." },
  RARE_FEATURE: { label: "Rare feature", description: "Feature combination sparsely attested in training." },
  ORTHOGRAPHIC_VARIATION: { label: "Orthographic variation", description: "Several spellings for one form (e.g. Roman Urdu)." },
  LONG_MORPHEME_CHAIN: { label: "Long morpheme chain", description: "Three or more stacked affixes." },
  CODE_SWITCHING: { label: "Code-switching", description: "Material from another language inside the word." },
};
