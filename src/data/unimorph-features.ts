/**
 * Readable labels for UniMorph schema features (Sylak-Glassman 2016 schema as used by
 * UniMorph). Unknown or language-specific codes fall back to the raw code.
 */
const table: Record<string, [dimension: string, label: string]> = {
  // part of speech
  N: ["POS", "Noun"], V: ["POS", "Verb"], ADJ: ["POS", "Adjective"], ADV: ["POS", "Adverb"], PRO: ["POS", "Pronoun"],
  DET: ["POS", "Determiner"], PROPN: ["POS", "Proper noun"], "V.PTCP": ["POS", "Participle"], "V.CVB": ["POS", "Converb"],
  "V.MSDR": ["POS", "Masdar"], NUM: ["POS", "Numeral"], ADP: ["POS", "Adposition"], PART: ["POS", "Particle"],
  CONJ: ["POS", "Conjunction"], INTJ: ["POS", "Interjection"],
  // number
  SG: ["Number", "Singular"], PL: ["Number", "Plural"], DU: ["Number", "Dual"],
  // case
  NOM: ["Case", "Nominative"], ACC: ["Case", "Accusative"], GEN: ["Case", "Genitive"], DAT: ["Case", "Dative"],
  ABL: ["Case", "Ablative"], LOC: ["Case", "Locative"], INS: ["Case", "Instrumental"], COM: ["Case", "Comitative"],
  ALL: ["Case", "Allative"], ABS: ["Case", "Absolutive"], ERG: ["Case", "Ergative"], VOC: ["Case", "Vocative"],
  ESS: ["Case", "Essive"], EQTV: ["Case", "Equative"], PROL: ["Case", "Prolative"], TERM: ["Case", "Terminative"],
  "NOM/ACC": ["Case", "Nominative/Accusative"], "DAT/GEN": ["Case", "Dative/Genitive"], "GEN/DAT": ["Case", "Genitive/Dative"],
  "IN+ESS": ["Case", "Inessive (in)"], "IN+ALL": ["Case", "Illative (into)"], "IN+ABL": ["Case", "Elative (out of)"],
  SPRL: ["Case", "Superlative (spatial)"],
  // person
  "1": ["Person", "1st"], "2": ["Person", "2nd"], "3": ["Person", "3rd"], "1+EXCL": ["Person", "1st exclusive"], "1+INCL": ["Person", "1st inclusive"],
  // tense
  PST: ["Tense", "Past"], PRS: ["Tense", "Present"], FUT: ["Tense", "Future"], RMT: ["Tense", "Remote"], IMMED: ["Tense", "Immediate"],
  // aspect
  PFV: ["Aspect", "Perfective"], IPFV: ["Aspect", "Imperfective"], PROG: ["Aspect", "Progressive"], HAB: ["Aspect", "Habitual"],
  PRF: ["Aspect", "Perfect"], PROSP: ["Aspect", "Prospective"], DUR: ["Aspect", "Durative"], SEMEL: ["Aspect", "Semelfactive"],
  ITER: ["Aspect", "Iterative"], STAT: ["Aspect", "Stative"],
  // mood
  IND: ["Mood", "Indicative"], IMP: ["Mood", "Imperative"], SBJV: ["Mood", "Subjunctive"], COND: ["Mood", "Conditional"],
  OPT: ["Mood", "Optative"], POT: ["Mood", "Potential"], OBLIG: ["Mood", "Obligative"], INFR: ["Evidentiality", "Inferential"],
  DECL: ["Sentence type", "Declarative"],
  // polarity
  POS: ["Polarity", "Positive"], NEG: ["Polarity", "Negative"],
  // gender / animacy
  MASC: ["Gender", "Masculine"], FEM: ["Gender", "Feminine"], NEUT: ["Gender", "Neuter"], ANIM: ["Animacy", "Animate"], INV: ["Animacy", "Inverse"],
  // definiteness
  DEF: ["Definiteness", "Definite"], INDF: ["Definiteness", "Indefinite"],
  // voice
  ACT: ["Voice", "Active"], PASS: ["Voice", "Passive"], CAUS: ["Valency", "Causative"], RECP: ["Valency", "Reciprocal"], ANTIP: ["Voice", "Antipassive"],
  INTR: ["Valency", "Intransitive"],
  // finiteness / politeness / comparison
  FIN: ["Finiteness", "Finite"], NFIN: ["Finiteness", "Non-finite"], INFM: ["Politeness", "Informal"], FORM: ["Politeness", "Formal"],
  CMPR: ["Comparison", "Comparative"], ALN: ["Possession", "Alienable"], PSSD: ["Possession", "Possessed"], PROX: ["Deixis", "Proximal"], REMT: ["Deixis", "Remote"],
};

const PERSON: Record<string, string> = { "1": "1", "2": "2", "3": "3", R: "Reflexive " };
const NUM: Record<string, string> = { S: "SG", P: "PL" };
const ROLE: Record<string, string> = { NO: "subject", ER: "ergative agent", AB: "absolutive", AC: "object", DA: "dative" };

function one(code: string): [string, string] {
  if (table[code]) return table[code];
  let m = code.match(/^PSS([123R])([SP])([EI])?$/);
  if (m) return ["Possessor", `${PERSON[m[1]]}${NUM[m[2]]}${m[3] === "E" ? " excl." : m[3] === "I" ? " incl." : ""}`.trim()];
  m = code.match(/^ARG(NO|ER|AB|AC|DA)([123])([SP])$/);
  if (m) return [`Agreement (${ROLE[m[1]]})`, `${m[2]}${NUM[m[3]]}`];
  if (/^LGSPEC\d+$/.test(code)) return ["Language-specific", code];
  return ["Other", code];
}

/** Parse a UniMorph bundle into readable {dimension: value} pairs (primary POS excluded). */
export function readableFeatures(tag: string): Record<string, string> {
  const out: Record<string, string> = {};
  const add = (dim: string, value: string) => {
    out[dim] = out[dim] ? `${out[dim]}, ${value}` : value;
  };
  let primaryPosSeen = false;
  for (const code of tag.split(";")) {
    const parts: [string, string][] = code in table || !code.includes("+") ? [one(code)] : code.split("+").map(one);
    if (parts.length === 1 && parts[0][0] === "POS") {
      // the first POS code is shown separately; a second one (e.g. V;V.PTCP) is a verb form
      if (primaryPosSeen) add("Verb form", parts[0][1]);
      primaryPosSeen = true;
      continue;
    }
    if (parts.every((p) => p[0] === parts[0][0])) add(parts[0][0], parts.map((p) => p[1]).join(" + "));
    else for (const [dim, value] of parts) add(dim, value);
  }
  return out;
}

export function posLabel(tag: string): string {
  for (const code of tag.split(";")) if (table[code]?.[0] === "POS") return code;
  return "—";
}

/** Leipzig-ish gloss of a bundle without its primary POS, e.g. "ABL.PL.PSS1P". */
export function bundleGloss(tag: string): string {
  let primarySkipped = false;
  return tag
    .split(";")
    .filter((c) => {
      if (!primarySkipped && table[c]?.[0] === "POS") {
        primarySkipped = true;
        return false;
      }
      return true;
    })
    .join(".");
}
