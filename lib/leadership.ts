export type Leader = {
  slug: string;
  name: string;
  role: string;
  office: string;
  jurisdiction: string;
  initial: string;
  summary: string;
  biography: string[];
  service: string[];
  sources: {
    label: string;
    url: string;
  }[];
};

export const leaders: Leader[] = [
  {
    slug: "femi-gbajabiamila",
    name: "Femi Gbajabiamila",
    role: "Chief of Staff to the President",
    office: "Office of the President",
    jurisdiction: "Federal Republic of Nigeria",
    initial: "FG",
    summary:
      "Chief of Staff to the President. The State House records that he assumed the role on June 14, 2023, after serving in the House of Representatives and as Speaker of the 9th House.",
    biography: [
      "The State House identifies Femi Gbajabiamila as a lawyer and politician serving as Chief of Staff to the President.",
      "The State House records that he attended Igbobi College, Yaba, Lagos, and later pursued Advanced Level studies at King William's College, Isle of Man, United Kingdom.",
    ],
    service: [
      "Chief of Staff to the President since June 14, 2023.",
      "Former Speaker of Nigeria's 9th House of Representatives, serving from June 11, 2019 to June 13, 2023.",
      "Former representative for Surulere I Federal Constituency in Lagos State.",
    ],
    sources: [
      {
        label: "State House — Office of the President",
        url: "https://statehouse.gov.ng/presidency/office-of-the-president/",
      },
    ],
  },

  {
    slug: "fuad-kayode-laguda",
    name: "Fuad Kayode Laguda",
    role: "Member, House of Representatives",
    office: "Surulere I Federal Constituency",
    jurisdiction: "Lagos State",
    initial: "FK",
    summary:
      "Member of the House of Representatives associated with Surulere I Federal Constituency.",
    biography: [
      "Fuad Kayode Laguda is a member of Nigeria's House of Representatives representing Surulere I Federal Constituency.",
      "National Assembly records provide public documentation of his participation in legislative proceedings and parliamentary business.",
    ],
    service: [
      "Member of the 10th House of Representatives.",
      "Representative for Surulere I Federal Constituency, Lagos State.",
      "Participates in legislative proceedings and parliamentary activities recorded by the National Assembly.",
    ],
    sources: [
      {
        label: "National Assembly — Official Records",
        url: "https://nass.gov.ng/",
      },
    ],
  },

  {
    slug: "lanre-okunlola",
    name: "Lanre Okunlola",
    role: "Member, House of Representatives",
    office: "Surulere II Federal Constituency",
    jurisdiction: "Lagos State",
    initial: "LO",
    summary:
      "Member of the House of Representatives for Surulere II Federal Constituency, according to the National Assembly's official legislator profile.",
    biography: [
      "The National Assembly's official legislator profile identifies Hon. Lanre Okunlola as a member of the House of Representatives for Surulere II Federal Constituency.",
      "The official profile provides parliamentary information for his office and constituency.",
    ],
    service: [
      "Member of the House of Representatives.",
      "Representative for Surulere II Federal Constituency, Lagos State.",
    ],
    sources: [
      {
        label: "National Assembly — Legislator Profile",
        url: "https://nass.gov.ng/mps/single/588",
      },
    ],
  },

  {
    slug: "odunayo-oluwafemi-daniel",
    name: "Odunayo Oluwafemi Daniel",
    role: "Executive Chairman",
    office: "Itire-Ikate LCDA",
    jurisdiction: "Lagos State",
    initial: "OD",
    summary:
      "Executive Chairman of Itire-Ikate Local Council Development Area.",
    biography: [
      "The official Itire-Ikate LCDA profile identifies Hon. Odunayo Oluwafemi Daniel as Executive Chairman.",
      "The LCDA's official profile states that he attended Saint Thomas Aquinas Primary School and Birch Freeman High School in Surulere, Lagos, before studying at the University of Lagos.",
      "The same official profile records an Advanced Diploma in Security Operations and Management from the University of Lagos between 2012 and 2014.",
    ],
    service: [
      "Executive Chairman of Itire-Ikate LCDA.",
      "The official LCDA profile describes prior experience in specialised security support and training.",
      "The LCDA identifies community development and public service as areas of his administration.",
    ],
    sources: [
      {
        label: "Itire-Ikate LCDA — Chairman Profile",
        url: "https://www.itireikatelcda.lg.gov.ng/meet-the-chairman/",
      },
      {
        label: "Itire-Ikate LCDA — Official Team Profile",
        url: "https://www.itireikatelcda.lg.gov.ng/team/hon-odunayo-oluwafemi-daniel/",
      },
    ],
  },
];

export function getLeader(slug: string) {
  return leaders.find((leader) => leader.slug === slug);
}