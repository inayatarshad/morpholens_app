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

export const team: Person[] = [
  {
    name: "Inayat Arshad",
    citationName: "Arshad, Inayat",
    role: "Design, implementation and experiments",
    affiliation: "PIEAS",
    email: "bscs2248@pieas.edu.pk",
  },
  {
    name: "Ekaterina Vylomova",
    citationName: "Vylomova, Ekaterina",
    role: "Supervision",
    affiliation: "University of Melbourne",
    email: "ekaterina.vylomova@unimelb.edu.au",
  },
  {
    name: "David Samuel Setiawan",
    citationName: "Setiawan, David Samuel",
    role: "Collaboration",
    affiliation: "University of Melbourne",
    email: "ds.setiawan@unimelb.edu.au",
  },
];

export const citationAuthors = team.map((p) => p.citationName).join(" and ");
