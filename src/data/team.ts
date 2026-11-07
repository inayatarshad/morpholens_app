/**
 * Project context and people.
 *
 * Single source for the research credit shown on the landing page, the methodology
 * page and the citation block, so the three can never drift apart.
 */

export const project = {
  decraTitle: "Harnessing AI to Protect Endangered Languages",
  scheme: "ARC Discovery Early Career Researcher Award (DECRA)",
  institution: "University of Melbourne",
};

export type Person = {
  name: string;
  /** Surname-first form used in the citation block. */
  citationName: string;
  role: string;
  affiliation: string;
  email?: string;
};

/** Display order on the site. */
export const team: Person[] = [
  {
    name: "Ekaterina Vylomova",
    citationName: "Vylomova, Ekaterina",
    role: "Supervision",
    affiliation: "University of Melbourne",
    email: "ekaterina.vylomova@unimelb.edu.au",
  },
  {
    name: "Inayat Arshad",
    citationName: "Arshad, Inayat",
    role: "Design, implementation and experiments",
    affiliation: "PIEAS",
    email: "bscs2248@pieas.edu.pk",
  },
  {
    name: "David Samuel Setiawan",
    citationName: "Setiawan, David Samuel",
    role: "Collaboration",
    affiliation: "University of Melbourne",
    email: "ds.setiawan@unimelb.edu.au",
  },
];

/**
 * Citation order, which is not the display order: the citation keeps the first author first.
 */
const citationOrder = ["Inayat Arshad", "Ekaterina Vylomova", "David Samuel Setiawan"];
export const citationAuthors = citationOrder
  .map((n) => team.find((p) => p.name === n)?.citationName ?? n)
  .join(" and ");
