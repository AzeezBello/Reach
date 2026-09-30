export type LeadershipLevel = "federal" | "state" | "local";

export type LeadershipOfficeType =
  | "senate"
  | "house_of_representatives"
  | "house_of_assembly"
  | "lga_chairman"
  | "lga_vice_chairman"
  | "legislative_assembly";

export type LeadershipPerson = {
  slug: string;
  name: string;
  initial: string;
  role: string;
  level: LeadershipLevel;
  levelLabel: string;
  officeType: LeadershipOfficeType;
  office: string;
  jurisdiction: string;
  constituency?: string;
  summary: string;
  biography: string[];
  service: string[];
  sources: {
    label: string;
    url: string;
  }[];
};

/**
 * Backward-compatible type used by existing REACH code.
 */
export type Leader = LeadershipPerson;

export const leadership: LeadershipPerson[] = [
  /*
   * ============================================================
   * FEDERAL GOVERNMENT
   * ============================================================
   */

  {
    slug: "wasiu-sanni-eshilokun",
    name: "Senator Wasiu Sanni Eshilokun",
    initial: "W",
    role: "Senator",
    level: "federal",
    levelLabel: "Federal Government",
    officeType: "senate",
    office: "Senator",
    jurisdiction: "Lagos Central Senatorial District",
    constituency: "Lagos Central Senatorial District",
    summary:
      "Member of the Senate representing the Lagos Central Senatorial District.",
    biography: [
      "Senator Wasiu Sanni Eshilokun is a Nigerian politician serving in the National Assembly.",
      "He represents the Lagos Central Senatorial District in the Senate of the Federal Republic of Nigeria.",
    ],
    service: [
      "Senate of the Federal Republic of Nigeria",
      "Lagos Central Senatorial District",
    ],
    sources: [
      {
        label: "National Assembly Legislative Tracking Forum",
        url: "https://naltf.gov.ng/",
      },
    ],
  },

  {
    slug: "fuad-kayode-laguda",
    name: "Hon. Fuad Kayode Laguda",
    initial: "F",
    role: "Member, House of Representatives",
    level: "federal",
    levelLabel: "Federal Government",
    officeType: "house_of_representatives",
    office: "Member, House of Representatives",
    jurisdiction: "Surulere I Federal Constituency",
    constituency: "Surulere I",
    summary:
      "Member of the House of Representatives representing Surulere I Federal Constituency.",
    biography: [
      "Hon. Fuad Kayode Laguda is a member of the House of Representatives of the Federal Republic of Nigeria.",
      "He represents the Surulere I Federal Constituency of Lagos State.",
    ],
    service: [
      "House of Representatives",
      "Surulere I Federal Constituency",
    ],
    sources: [
      {
        label: "National Assembly Legislative Tracking Forum",
        url: "https://naltf.gov.ng/honorable-members/",
      },
    ],
  },

  {
    slug: "lanre-okunlola",
    name: "Hon. Lanre Okunlola",
    initial: "L",
    role: "Member, House of Representatives",
    level: "federal",
    levelLabel: "Federal Government",
    officeType: "house_of_representatives",
    office: "Member, House of Representatives",
    jurisdiction: "Surulere II Federal Constituency",
    constituency: "Surulere II",
    summary:
      "Member of the House of Representatives representing Surulere II Federal Constituency.",
    biography: [
      "Hon. Lanre Okunlola is a member of the House of Representatives of the Federal Republic of Nigeria.",
      "He represents the Surulere II Federal Constituency of Lagos State.",
    ],
    service: [
      "House of Representatives",
      "Surulere II Federal Constituency",
    ],
    sources: [
      {
        label: "National Assembly Legislative Tracking Forum",
        url: "https://naltf.gov.ng/honorable-members/",
      },
      {
        label: "National Assembly of Nigeria",
        url: "https://nass.gov.ng/mps/single/588",
      },
    ],
  },

  /*
   * ============================================================
   * LAGOS STATE GOVERNMENT
   * ============================================================
   */

  {
    slug: "desmond-olushola-elliot",
    name: "Hon. Desmond Olushola Elliot",
    initial: "D",
    role: "Member, Lagos State House of Assembly",
    level: "state",
    levelLabel: "Lagos State Government",
    officeType: "house_of_assembly",
    office: "Member, Lagos State House of Assembly",
    jurisdiction: "Surulere I State Constituency",
    constituency: "Surulere I",
    summary:
      "Member of the Lagos State House of Assembly representing Surulere I State Constituency.",
    biography: [
      "Hon. Desmond Olushola Elliot is a member of the Lagos State House of Assembly.",
      "He represents the Surulere I State Constituency.",
    ],
    service: [
      "Lagos State House of Assembly",
      "Surulere I State Constituency",
    ],
    sources: [
      {
        label: "Lagos State House of Assembly",
        url: "https://lagoshouseofassembly.gov.ng/",
      },
    ],
  },

  {
    slug: "mosunmola-rotimi-sangodara",
    name: "Hon. Mosunmola Rotimi Sangodara",
    initial: "M",
    role: "Member, Lagos State House of Assembly",
    level: "state",
    levelLabel: "Lagos State Government",
    officeType: "house_of_assembly",
    office: "Member, Lagos State House of Assembly",
    jurisdiction: "Surulere II State Constituency",
    constituency: "Surulere II",
    summary:
      "Member of the Lagos State House of Assembly representing Surulere II State Constituency.",
    biography: [
      "Hon. Mosunmola Rotimi Sangodara is a member of the Lagos State House of Assembly.",
      "She represents the Surulere II State Constituency.",
    ],
    service: [
      "Lagos State House of Assembly",
      "Surulere II State Constituency",
    ],
    sources: [
      {
        label: "Lagos State House of Assembly",
        url: "https://lagoshouseofassembly.gov.ng/",
      },
    ],
  },

  /*
   * ============================================================
   * SURULERE LOCAL GOVERNMENT
   * ============================================================
   */

  {
    slug: "sulaiman-bamidele-yusuf",
    name: "Hon. Sulaiman Bamidele Yusuf",
    initial: "S",
    role: "Executive Chairman",
    level: "local",
    levelLabel: "Surulere Local Government",
    officeType: "lga_chairman",
    office: "Executive Chairman",
    jurisdiction: "Surulere Local Government",
    summary: "Executive Chairman of Surulere Local Government.",
    biography: [
      "Hon. Sulaiman Bamidele Yusuf serves as Executive Chairman of Surulere Local Government in Lagos State.",
      "The office oversees the administration and local government functions of Surulere.",
    ],
    service: [
      "Surulere Local Government",
      "Local government administration",
      "Community development and public services",
    ],
    sources: [
      {
        label: "Surulere Local Government",
        url: "https://surulerelga.lg.gov.ng/",
      },
    ],
  },

  {
    slug: "muiz-dosunmu",
    name: "Hon. Prince Muiz Dosunmu",
    initial: "M",
    role: "Vice Chairman",
    level: "local",
    levelLabel: "Surulere Local Government",
    officeType: "lga_vice_chairman",
    office: "Vice Chairman",
    jurisdiction: "Surulere Local Government",
    summary: "Vice Chairman of Surulere Local Government.",
    biography: [
      "Hon. Prince Muiz Dosunmu serves as Vice Chairman of Surulere Local Government in Lagos State.",
      "The office supports the administration of the local government and its community-facing responsibilities.",
    ],
    service: [
      "Surulere Local Government",
      "Local government administration",
      "Community engagement",
    ],
    sources: [
      {
        label: "Surulere Local Government",
        url: "https://surulerelga.lg.gov.ng/",
      },
    ],
  },

  {
    slug: "akeem-olayiwola-abdulrahman",
    name: "Hon. Akeem Olayiwola AbdulRahman",
    initial: "A",
    role: "Legislative Assembly",
    level: "local",
    levelLabel: "Surulere Local Government",
    officeType: "legislative_assembly",
    office: "Legislative Assembly",
    jurisdiction: "Surulere Local Government",
    summary:
      "Member of the Surulere Local Government legislative structure.",
    biography: [
      "Hon. Akeem Olayiwola AbdulRahman is associated with the legislative structure of Surulere Local Government.",
      "REACH uses the neutral office designation 'Legislative Assembly' until the specific current leadership title is independently confirmed.",
    ],
    service: [
      "Surulere Local Government Legislative Assembly",
      "Local legislative representation",
    ],
    sources: [
      {
        label: "Lagos State Independent Electoral Commission",
        url: "https://lasiec.gov.ng/2025_election_results/",
      },
    ],
  },
];

export const leadershipGroups = [
  {
    id: "federal",
    title: "Federal Government",
    description:
      "Federal representatives serving the Surulere community through the National Assembly.",
    members: leadership.filter((person) => person.level === "federal"),
  },
  {
    id: "state",
    title: "Lagos State Government",
    description:
      "State legislators representing Surulere constituencies in the Lagos State House of Assembly.",
    members: leadership.filter((person) => person.level === "state"),
  },
  {
    id: "local",
    title: "Surulere Local Government",
    description:
      "Local government officials and legislative representation serving residents of Surulere.",
    members: leadership.filter((person) => person.level === "local"),
  },
];

export function getLeadershipBySlug(slug: string) {
  return leadership.find((person) => person.slug === slug);
}

/**
 * Backward-compatible export.
 *
 * Existing REACH pages such as the homepage,
 * sitemap and llms.txt route use `leaders`.
 */
export const leaders = leadership;