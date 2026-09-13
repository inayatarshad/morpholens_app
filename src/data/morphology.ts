import type { CuratedComparison, DifficultyTag, MorphologicalEntry, ParadigmEntry } from "./types";

/**
 * HAND-ANNOTATED ENTRIES
 * ----------------------
 * A small set of forms with gold morpheme segmentation and glosses, which UniMorph does
 * not provide. Each entry was checked against the pinned UniMorph file:
 *   attestation "unimorph"  → the triple occurs in UniMorph (bundle recorded in `unimorph`)
 *   attestation "reference" → textbook pattern (cited), absent from UniMorph
 *     (e.g. the Turkish lemmas ev, kitap and gitmek are not in UniMorph tur).
 */

const TUR_SOURCE = "Göksel & Kerslake (2005), Turkish: A Comprehensive Grammar. Routledge.";
const URD_SOURCE = "Schmidt (1999), Urdu: An Essential Grammar. Routledge.";
const NOT_IN_UNIMORPH = "Lemma not present in the pinned UniMorph file; segmentation hand-annotated from the cited grammar.";

const evParadigm: ParadigmEntry[] = [
  { surface: "ev", features: { Number: "Singular", Case: "Nominative" }, segmentation: ["ev"] },
  { surface: "evler", features: { Number: "Plural", Case: "Nominative" }, segmentation: ["ev", "ler"] },
  { surface: "evim", features: { Number: "Singular", Possessor: "1SG" }, segmentation: ["ev", "im"] },
  { surface: "evimiz", features: { Number: "Singular", Possessor: "1PL" }, segmentation: ["ev", "imiz"] },
  { surface: "evde", features: { Number: "Singular", Case: "Locative" }, segmentation: ["ev", "de"] },
  { surface: "evden", features: { Number: "Singular", Case: "Ablative" }, segmentation: ["ev", "den"] },
  { surface: "evlerden", features: { Number: "Plural", Case: "Ablative" }, segmentation: ["ev", "ler", "den"] },
  { surface: "evlerimizden", features: { Number: "Plural", Possessor: "1PL", Case: "Ablative" }, segmentation: ["ev", "ler", "imiz", "den"] },
];

const kitapParadigm: ParadigmEntry[] = [
  { surface: "kitap", features: { Number: "Singular", Case: "Nominative" }, segmentation: ["kitap"] },
  { surface: "kitaplar", features: { Number: "Plural", Case: "Nominative" }, segmentation: ["kitap", "lar"] },
  { surface: "kitabım", features: { Number: "Singular", Possessor: "1SG" }, segmentation: ["kitab", "ım"] },
  { surface: "kitaptan", features: { Number: "Singular", Case: "Ablative" }, segmentation: ["kitap", "tan"] },
  { surface: "kitaplardan", features: { Number: "Plural", Case: "Ablative" }, segmentation: ["kitap", "lar", "dan"] },
  { surface: "kitaplarımızdan", features: { Number: "Plural", Possessor: "1PL", Case: "Ablative" }, segmentation: ["kitap", "lar", "ımız", "dan"] },
];

const larkaParadigm: ParadigmEntry[] = [
  { surface: "لڑکا", romanization: "laṛkā", features: { Number: "Singular", Case: "Direct" }, tag: "N;NOM;SG", segmentation: ["laṛk", "ā"] },
  { surface: "لڑکے", romanization: "laṛke", features: { Number: "Singular", Case: "Oblique" }, tag: "N;ACC;SG", segmentation: ["laṛk", "e"] },
  { surface: "لڑکے", romanization: "laṛke", features: { Number: "Plural", Case: "Direct" }, tag: "N;NOM;PL", segmentation: ["laṛk", "e"] },
  { surface: "لڑکوں", romanization: "laṛkoṉ", features: { Number: "Plural", Case: "Oblique" }, tag: "N;ACC;PL", segmentation: ["laṛk", "oṉ"] },
];

const kitabParadigm: ParadigmEntry[] = [
  { surface: "کتاب", romanization: "kitāb", features: { Number: "Singular", Case: "Direct" }, tag: "N;NOM;SG", segmentation: ["kitāb"] },
  { surface: "کتابیں", romanization: "kitābeṉ", features: { Number: "Plural", Case: "Direct" }, tag: "N;NOM;PL", segmentation: ["kitāb", "eṉ"] },
  { surface: "کتابوں", romanization: "kitāboṉ", features: { Number: "Plural", Case: "Oblique" }, tag: "N;ACC;PL", segmentation: ["kitāb", "oṉ"] },
];

const likhParadigm: ParadigmEntry[] = [
  { surface: "لکھا", romanization: "likhā", features: { Gender: "Masc", Number: "Singular" }, tag: "V;V.PTCP;MASC;SG;PFV", segmentation: ["likh", "ā"] },
  { surface: "لکھے", romanization: "likhe", features: { Gender: "Masc", Number: "Plural" }, tag: "V;V.PTCP;MASC;PL;PFV", segmentation: ["likh", "e"] },
  { surface: "لکھی", romanization: "likhī", features: { Gender: "Fem", Number: "Singular" }, tag: "V;V.PTCP;FEM;SG;PFV", segmentation: ["likh", "ī"] },
];

type Draft = Omit<MorphologicalEntry, "languageId" | "source">;
const tur = (e: Draft): MorphologicalEntry => ({ ...e, languageId: "tur", source: TUR_SOURCE });
const urd = (e: Draft): MorphologicalEntry => ({ ...e, languageId: "urd", source: URD_SOURCE });

export const entries: MorphologicalEntry[] = [
  tur({
    id: "tur-evlerimizden", surface: "evlerimizden", lemma: "ev", pos: "NOUN",
    segmentation: ["ev", "ler", "imiz", "den"],
    morphemes: [
      { form: "ev", gloss: "HOUSE", meaning: "house", role: "stem" },
      { form: "-ler", gloss: "PL", meaning: "plural", role: "suffix" },
      { form: "-imiz", gloss: "1PL.POSS", meaning: "our", role: "suffix" },
      { form: "-den", gloss: "ABL", meaning: "from", role: "suffix" },
    ],
    features: { Number: "Plural", Possessor: "1PL", Case: "Ablative" },
    gloss: "house-PL-1PL.POSS-ABL", translation: "from our houses", paradigm: evParadigm,
    difficulty: ["LONG_MORPHEME_CHAIN"],
    difficultyNotes: { LONG_MORPHEME_CHAIN: "Three inflectional suffixes stacked on one stem." },
    attestation: "reference", note: NOT_IN_UNIMORPH,
  }),
  tur({
    id: "tur-kitaplarimizdan", surface: "kitaplarımızdan", aliases: ["kitaplarimizdan"], lemma: "kitap", pos: "NOUN",
    segmentation: ["kitap", "lar", "ımız", "dan"],
    morphemes: [
      { form: "kitap", gloss: "BOOK", meaning: "book", role: "stem" },
      { form: "-lar", gloss: "PL", meaning: "plural", role: "suffix" },
      { form: "-ımız", gloss: "1PL.POSS", meaning: "our", role: "suffix" },
      { form: "-dan", gloss: "ABL", meaning: "from", role: "suffix" },
    ],
    features: { Number: "Plural", Possessor: "1PL", Case: "Ablative" },
    gloss: "book-PL-1PL.POSS-ABL", translation: "from our books", paradigm: kitapParadigm,
    difficulty: ["ALLOMORPHY", "LONG_MORPHEME_CHAIN"],
    difficultyNotes: {
      ALLOMORPHY: "Back-vowel harmony (-lar, -dan vs. -ler, -den); stem-final p→b before a vowel (kitabım).",
      LONG_MORPHEME_CHAIN: "Same three-suffix chain as evlerimizden, different allomorphs.",
    },
    attestation: "reference", note: NOT_IN_UNIMORPH,
  }),
  tur({
    id: "tur-geldi", surface: "geldi", lemma: "gelmek", pos: "VERB", segmentation: ["gel", "di"],
    morphemes: [
      { form: "gel", gloss: "COME", meaning: "come", role: "stem" },
      { form: "-di", gloss: "PST", meaning: "past (3SG: zero person marker)", role: "suffix" },
    ],
    features: { Tense: "Past", Person: "3SG", Polarity: "Positive" },
    unimorph: "V;IND;PST;3;SG;POS;DECL", gloss: "come-PST", translation: "(s)he came",
    attestation: "unimorph", note: "Triple attested in UniMorph tur; segmentation hand-annotated.",
  }),
  tur({
    id: "tur-gelmedi", surface: "gelmedi", lemma: "gelmek", pos: "VERB", segmentation: ["gel", "me", "di"],
    morphemes: [
      { form: "gel", gloss: "COME", meaning: "come", role: "stem" },
      { form: "-me", gloss: "NEG", meaning: "negation", role: "suffix" },
      { form: "-di", gloss: "PST", meaning: "past", role: "suffix" },
    ],
    features: { Tense: "Past", Person: "3SG", Polarity: "Negative" },
    unimorph: "V;IND;PST;3;SG;NEG;DECL", gloss: "come-NEG-PST", translation: "(s)he did not come",
    attestation: "unimorph", note: "Triple attested in UniMorph tur; segmentation hand-annotated.",
  }),

  urd({
    id: "urd-larke", surface: "لڑکے", romanization: "laṛke", aliases: ["larke", "larkay", "larkey"],
    lemma: "لڑکا", lemmaRomanization: "laṛkā", pos: "NOUN", segmentation: ["laṛk", "e"],
    morphemes: [
      { form: "laṛk-", gloss: "BOY", meaning: "boy", role: "stem" },
      { form: "-e", gloss: "M.PL.DIR", meaning: "masculine plural (direct)", role: "suffix" },
    ],
    features: { Number: "Plural", Case: "Direct", Gender: "Masculine" },
    unimorph: "N;NOM;PL · also N;ACC;SG, N;VOC;SG", gloss: "boy-M.PL.DIR", translation: "boys", paradigm: larkaParadigm,
    difficulty: ["ORTHOGRAPHIC_VARIATION", "SYNCRETISM"],
    difficultyNotes: {
      ORTHOGRAPHIC_VARIATION: "Roman-Urdu spellings vary (larke / larkay / larkey).",
      SYNCRETISM: "UniMorph lists this form under three bundles: NOM;PL, ACC;SG and VOC;SG.",
    },
    attestation: "unimorph", note: "Attested in UniMorph urd, which encodes the traditional oblique case as ACC.",
  }),
  urd({
    id: "urd-larkon", surface: "لڑکوں", romanization: "laṛkoṉ", aliases: ["larkon", "larkoon"],
    lemma: "لڑکا", lemmaRomanization: "laṛkā", pos: "NOUN", segmentation: ["laṛk", "oṉ"],
    morphemes: [
      { form: "laṛk-", gloss: "BOY", meaning: "boy", role: "stem" },
      { form: "-oṉ", gloss: "M.PL.OBL", meaning: "plural (oblique, before a postposition)", role: "suffix" },
    ],
    features: { Number: "Plural", Case: "Oblique", Gender: "Masculine" },
    unimorph: "N;ACC;PL", gloss: "boy-M.PL.OBL", translation: "boys (oblique), e.g. laṛkoṉ se ‘from the boys’", paradigm: larkaParadigm,
    difficulty: ["ORTHOGRAPHIC_VARIATION"],
    attestation: "unimorph", note: "Attested in UniMorph urd as N;ACC;PL (oblique encoded as ACC).",
  }),
  urd({
    id: "urd-kitaben", surface: "کتابیں", romanization: "kitābeṉ", aliases: ["kitaben", "kitabain", "kitabein"],
    lemma: "کتاب", lemmaRomanization: "kitāb", pos: "NOUN", segmentation: ["kitāb", "eṉ"],
    morphemes: [
      { form: "kitāb", gloss: "BOOK", meaning: "book", role: "stem" },
      { form: "-eṉ", gloss: "F.PL.DIR", meaning: "feminine plural (direct)", role: "suffix" },
    ],
    features: { Number: "Plural", Case: "Direct", Gender: "Feminine" },
    unimorph: "N;NOM;PL", gloss: "book-F.PL.DIR", translation: "books", paradigm: kitabParadigm,
    difficulty: ["ALLOMORPHY", "ORTHOGRAPHIC_VARIATION"],
    difficultyNotes: { ALLOMORPHY: "Plural exponent depends on gender class: -e (laṛke) vs. -eṉ (kitābeṉ)." },
    attestation: "unimorph", note: "Attested in UniMorph urd as N;NOM;PL.",
  }),
  urd({
    id: "urd-likha", surface: "لکھا", romanization: "likhā", aliases: ["likha"],
    lemma: "لکھنا", lemmaRomanization: "likhnā", pos: "VERB", segmentation: ["likh", "ā"],
    morphemes: [
      { form: "likh", gloss: "WRITE", meaning: "write", role: "stem" },
      { form: "-ā", gloss: "PFV.M.SG", meaning: "perfective, masculine singular", role: "suffix" },
    ],
    features: { Aspect: "Perfective", Gender: "Masculine", Number: "Singular" },
    unimorph: "V;V.PTCP;MASC;SG;PFV", gloss: "write-PFV.M.SG", translation: "wrote", paradigm: likhParadigm,
    attestation: "unimorph", note: "Attested in UniMorph urd as V;V.PTCP;MASC;SG;PFV.",
  }),
  urd({
    id: "urd-mera-ghar", surface: "میرا گھر", romanization: "merā ghar", aliases: ["mera ghar"],
    lemma: "گھر", lemmaRomanization: "ghar", pos: "PRON.POSS + NOUN", segmentation: ["mer", "ā", "ghar"],
    morphemes: [
      { form: "mer-", gloss: "1SG.POSS", meaning: "my", role: "stem" },
      { form: "-ā", gloss: "M.SG", meaning: "agrees with the possessed noun", role: "suffix" },
      { form: "ghar", gloss: "HOUSE", meaning: "house", role: "word" },
    ],
    features: { Possessor: "1SG", Agreement: "Masc.Sg (possessum)" },
    gloss: "1SG.POSS-M.SG house", translation: "my house",
    attestation: "reference", note: "Phrase-level construction; UniMorph urd has no possession features and no entry for گھر.",
  }),
  urd({
    id: "urd-nahin-likha", surface: "نہیں لکھا", romanization: "nahīṉ likhā", aliases: ["nahin likha", "nahi likha"],
    lemma: "لکھنا", lemmaRomanization: "likhnā", pos: "PART + VERB", segmentation: ["nahīṉ", "likh", "ā"],
    morphemes: [
      { form: "nahīṉ", gloss: "NEG", meaning: "not (preverbal particle)", role: "particle" },
      { form: "likh", gloss: "WRITE", meaning: "write", role: "stem" },
      { form: "-ā", gloss: "PFV.M.SG", meaning: "perfective, masculine singular", role: "suffix" },
    ],
    features: { Aspect: "Perfective", Polarity: "Negative", Gender: "Masculine", Number: "Singular" },
    gloss: "NEG write-PFV.M.SG", translation: "did not write", paradigm: likhParadigm,
    attestation: "reference", note: "Analytic negation; UniMorph urd has no NEG feature.",
  }),
];

export const entryById = (id: string) => entries.find((e) => e.id === id);

/** Used only for comparison slots UniMorph cannot fill. */
export const curatedComparisons: CuratedComparison[] = [
  { languageId: "urd", feature: "possession", entryId: "urd-mera-ghar", base: "گھر", baseRomanization: "ghar", strategy: "Possessive pronoun (agreeing)", position: "Before the noun, separate word" },
  { languageId: "urd", feature: "negation", entryId: "urd-nahin-likha", base: "لکھا", baseRomanization: "likhā", strategy: "Negative particle", position: "Before the verb, separate word" },
];

export const featureLabels: Record<string, { label: string; description: string }> = {
  plural: { label: "Plural", description: "More than one referent." },
  case: { label: "Case", description: "An oblique case: ablative where available, else the language’s oblique/genitive-dative." },
  possession: { label: "Possession", description: "First-person possessor: ‘my / our X’." },
  past: { label: "Past tense", description: "Event located before speech time (3rd person singular)." },
  negation: { label: "Negation", description: "Clausal negation of a verb." },
};

export const difficultyMeta: Record<DifficultyTag, { label: string; description: string }> = {
  UNSEEN_LEMMA: { label: "Unseen lemma", description: "No form of this lexical item appears in training." },
  ALLOMORPHY: { label: "Allomorphy", description: "One morpheme, several phonologically conditioned shapes." },
  RARE_FEATURE: { label: "Rare feature", description: "Feature bundle sparsely attested in training." },
  ORTHOGRAPHIC_VARIATION: { label: "Orthographic variation", description: "Several spellings for one form (e.g. Roman Urdu)." },
  LONG_MORPHEME_CHAIN: { label: "Long morpheme chain", description: "Several features realised in a long stacked exponent." },
  CODE_SWITCHING: { label: "Code-switching", description: "Material from another language inside the word." },
  SYNCRETISM: { label: "Syncretism", description: "One surface form realises several feature bundles." },
  PERIPHRASIS: { label: "Periphrasis", description: "The bundle is realised with more than one word." },
  STEM_CHANGE: { label: "Stem change", description: "Material of the lemma is deleted or altered, not just added to." },
};
