export type LeadershipLevel = "federal" | "state" | "local";

export type LeadershipOfficeType =
  | "senate"
  | "house_of_representatives"
  | "house_of_assembly"
  | "chief_of_staff"
  | "lga_chairman"
  | "lga_vice_chairman"
  | "legislative_assembly"
  | "lcda_chairman";

export type LeadershipPerson = {
  slug: string;
  name: string;
  initial: string;
  image?: string;
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

export type Leader = LeadershipPerson;

export const leadership: LeadershipPerson[] = [
  /*
   * ============================================================
   * FEDERAL GOVERNMENT
   * ============================================================
   */

  {
    image: "/leaders/Senator Wasiu Sanni Eshilokun.jpeg",
    slug: "wasiu-sanni-eshilokun",
    name: "Senator Wasiu Sanni Eshilokun",
    initial: "WE",
    role: "Senator",
    level: "federal",
    levelLabel: "Federal Government",
    officeType: "senate",
    office: "Senator, Lagos Central Senatorial District",
    jurisdiction: "Lagos Central Senatorial District",
    constituency: "Lagos Central Senatorial District",
    summary:
      "Senator Wasiu Sanni Eshilokun represents Lagos Central Senatorial District in the National Assembly.",
    biography: [
      "Wasiu Sanni Eshilokun is a Nigerian politician serving in the Senate representing Lagos Central Senatorial District.",
      "His legislative role places him within the federal representation structure serving communities across Lagos Central.",
    ],
    service: [
      "Federal legislative representation for Lagos Central Senatorial District.",
      "Participation in Senate legislative and committee processes.",
    ],
    sources: [
      {
        label: "National Assembly / NALTF — Senate Directory",
        url: "https://naltf.gov.ng/senate-page/",
      },
      {
        label: "National Assembly — Senate Committees",
        url: "https://naltf.gov.ng/senate-committees/",
      },
    ],
  },

  {
    image: "/leaders/Fuad_Kayode_Laguda.jpg",
    slug: "fuad-kayode-laguda",
    name: "Hon. Fuad Kayode Laguda",
    initial: "FL",
    role: "Member, House of Representatives",
    level: "federal",
    levelLabel: "Federal Government",
    officeType: "house_of_representatives",
    office: "House of Representatives, Surulere I Federal Constituency",
    jurisdiction: "Surulere I Federal Constituency",
    constituency: "Surulere I Federal Constituency",
    summary:
      "Hon. Fuad Kayode Laguda represents the Surulere I Federal Constituency in the Federal House of Representatives.",
    biography: [
      "Fuad Kayode Laguda is a Nigerian public representative serving at the federal legislative level.",
      "His constituency role connects residents of Surulere I with the National Assembly.",
    ],
    service: [
      "Federal legislative representation for Surulere I.",
      "Representation of constituency interests within the House of Representatives.",
      "Participation in federal legislative proceedings and oversight.",
    ],
    sources: [
      {
        label: "National Assembly of Nigeria",
        url: "https://nass.gov.ng/",
      },
      {
        label: "National Assembly — Members Directory",
        url: "https://nass.gov.ng/mps/",
      },
    ],
  },

  {
    image: "/leaders/Lanre_Okunlola.jpg",
    slug: "lanre-okunlola",
    name: "Hon. Lanre Okunlola",
    initial: "LO",
    role: "Member, House of Representatives",
    level: "federal",
    levelLabel: "Federal Government",
    officeType: "house_of_representatives",
    office: "House of Representatives, Surulere II Federal Constituency",
    jurisdiction: "Surulere II Federal Constituency",
    constituency: "Surulere II Federal Constituency",
    summary:
      "Hon. Lanre Okunlola represents the Surulere II Federal Constituency in the Federal House of Representatives.",
    biography: [
      "Lanre Okunlola is a Nigerian legislator representing Surulere II Federal Constituency in the House of Representatives.",
      "His National Assembly profile identifies him as a member of the House of Representatives for Surulere II.",
    ],
    service: [
      "Federal legislative representation for Surulere II.",
      "Participation in House of Representatives legislative proceedings.",
      "Representation of constituency interests at the federal level.",
    ],
    sources: [
      {
        label: "National Assembly — Legislator Profile",
        url: "https://nass.gov.ng/mps/single/588",
      },
      {
        label: "National Assembly of Nigeria",
        url: "https://nass.gov.ng/",
      },
    ],
  },

  {
    image: "/leaders/Femi Gbajabiamila.webp",
    slug: "femi-gbajabiamila",
    name: "Rt. Hon. Femi Gbajabiamila",
    initial: "FG",
    role: "Chief of Staff to the President",
    level: "federal",
    levelLabel: "Federal Government",
    officeType: "chief_of_staff",
    office: "Office of the Chief of Staff to the President",
    jurisdiction: "Federal Republic of Nigeria",
    summary:
      "Rt. Hon. Femi Gbajabiamila is the Chief of Staff to President Bola Ahmed Tinubu. He previously represented Surulere I Federal Constituency in the House of Representatives and served as Speaker of the 9th House of Representatives.",
    biography: [
      "Femi Gbajabiamila is a Nigerian lawyer and politician who currently serves as Chief of Staff to the President of Nigeria.",
      "He previously represented Surulere I Federal Constituency in Lagos State in the House of Representatives.",
      "The State House records that he assumed the role of Chief of Staff on June 14, 2023, after resigning his membership of the 10th House of Representatives.",
      "He served as Speaker of Nigeria's 9th House of Representatives from June 11, 2019, to June 13, 2023.",
    ],
    service: [
      "Chief of Staff to the President of the Federal Republic of Nigeria.",
      "Former federal representative for Surulere I Federal Constituency.",
      "Former Speaker of the 9th House of Representatives.",
      "Participation in federal executive coordination and presidential engagements.",
    ],
    sources: [
      {
        label: "The State House — Office of the President",
        url: "https://statehouse.gov.ng/presidency/office-of-the-president/",
      },
      {
        label: "The State House — Presidency",
        url: "https://statehouse.gov.ng/presidency/",
      },
    ],
  },

  /*
   * ============================================================
   * LAGOS STATE GOVERNMENT
   * ============================================================
   */

  {
    image: "/leaders/Hon. Desmond Olushola Elliot.jpg",
    slug: "desmond-olushola-elliot",
    name: "Hon. Desmond Olushola Elliot",
    initial: "DE",
    role: "Member, Lagos State House of Assembly",
    level: "state",
    levelLabel: "Lagos State Government",
    officeType: "house_of_assembly",
    office: "Lagos State House of Assembly, Surulere I",
    jurisdiction: "Surulere I State Constituency",
    constituency: "Surulere I State Constituency",
    summary:
      "Hon. Desmond Olushola Elliot represents Surulere I State Constituency in the Lagos State House of Assembly.",
    biography: [
      "Desmond Olushola Elliot is a Lagos State legislator representing Surulere I State Constituency.",
      "He serves within the Lagos State House of Assembly and participates in state-level legislative responsibilities.",
    ],
    service: [
      "State legislative representation for Surulere I.",
      "Participation in Lagos State House of Assembly proceedings.",
      "Representation of constituency interests at the state level.",
    ],
    sources: [
      {
        label: "Lagos State House of Assembly — 10th Assembly",
        url: "https://lagoshouseofassembly.gov.ng/",
      },
      {
        label: "Lagos State House of Assembly — Members",
        url: "https://lagoshouseofassembly.gov.ng/",
      },
    ],
  },

  {
    image: "/leaders/Hon. Mosunmola Rotimi Sangodara.jpeg",
    slug: "mosunmola-rotimi-sangodara",
    name: "Hon. Mosunmola Rotimi Sangodara",
    initial: "MS",
    role: "Member, Lagos State House of Assembly",
    level: "state",
    levelLabel: "Lagos State Government",
    officeType: "house_of_assembly",
    office: "Lagos State House of Assembly, Surulere II",
    jurisdiction: "Surulere II State Constituency",
    constituency: "Surulere II State Constituency",
    summary:
      "Hon. Mosunmola Rotimi Sangodara represents Surulere II State Constituency in the Lagos State House of Assembly.",
    biography: [
      "Mosunmola Rotimi Sangodara is a Lagos State legislator representing Surulere II State Constituency.",
      "Her role is part of the legislative representation structure of Lagos State.",
    ],
    service: [
      "State legislative representation for Surulere II.",
      "Participation in Lagos State House of Assembly proceedings.",
      "Representation of constituency interests at the state level.",
    ],
    sources: [
      {
        label: "Lagos State House of Assembly — 10th Assembly",
        url: "https://lagoshouseofassembly.gov.ng/",
      },
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
    image: "/leaders/Hon. Sulaiman Bamidele Yusuf.jpeg",
    slug: "sulaiman-bamidele-yusuf",
    name: "Hon. Sulaiman Bamidele Yusuf",
    initial: "SY",
    role: "Executive Chairman",
    level: "local",
    levelLabel: "Surulere Local Government",
    officeType: "lga_chairman",
    office: "Executive Chairman, Surulere Local Government",
    jurisdiction: "Surulere Local Government Area",
    summary:
      "Hon. Sulaiman Bamidele Yusuf serves as the Executive Chairman of Surulere Local Government Area.",
    biography: [
      "Sulaiman Bamidele Yusuf serves in the executive leadership of Surulere Local Government Area.",
      "His office is responsible for local government administration and service delivery within Surulere LGA.",
    ],
    service: [
      "Local government executive administration.",
      "Coordination of local government services and programmes.",
      "Community-level administration and service delivery.",
    ],
    sources: [
      {
        label: "Surulere Local Government",
        url: "https://surulerelga.lg.gov.ng/",
      },
      {
        label: "Local Governance Accountability Portal — Surulere LGA",
        url: "https://lgaportal.org/lgaDetails?lgaId=519",
      },
    ],
  },

  {
    slug: "prince-muiz-dosunmu",
    name: "Hon. Prince Muiz Dosunmu",
    initial: "MD",
    role: "Vice Chairman",
    level: "local",
    levelLabel: "Surulere Local Government",
    officeType: "lga_vice_chairman",
    office: "Vice Chairman, Surulere Local Government",
    jurisdiction: "Surulere Local Government Area",
    summary:
      "Hon. Prince Muiz Dosunmu serves as Vice Chairman of Surulere Local Government.",
    biography: [
      "Prince Muiz Dosunmu serves in the executive leadership structure of Surulere Local Government.",
      "The Vice Chairman's office supports the administration and delivery of local government responsibilities.",
    ],
    service: [
      "Support for Surulere Local Government administration.",
      "Participation in local government programmes and community initiatives.",
      "Support for grassroots service delivery.",
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
    initial: "AA",
    role: "Legislative Assembly — Surulere LGA",
    level: "local",
    levelLabel: "Surulere Local Government",
    officeType: "legislative_assembly",
    office: "Surulere Local Government Legislative Assembly",
    jurisdiction: "Surulere Local Government Area",
    summary:
      "Hon. Akeem Olayiwola AbdulRahman is listed among the candidates recorded for the Surulere Local Government legislative election.",
    biography: [
      "Akeem Olayiwola AbdulRahman is associated with the legislative representation structure of Surulere Local Government.",
      "His profile is included in the REACH directory as a local legislative representative, with the title kept deliberately neutral to reflect the available official election record.",
    ],
    service: [
      "Local legislative representation.",
      "Participation in grassroots legislative responsibilities.",
      "Representation of community interests through the local government legislative structure.",
    ],
    sources: [
      {
        label: "Lagos State Independent Electoral Commission — 2025 Election Results",
        url: "https://lasiec.gov.ng/2025_election_results/",
      },
    ],
  },

  /*
   * ============================================================
   * ITIRE-IKATE LCDA
   * ============================================================
   */

  {
    image: "/leaders/Hon. Odunayo Oluwafemi Daniel.jpg",
    slug: "odunayo-oluwafemi-daniel",
    name: "Hon. Odunayo Oluwafemi Daniel",
    initial: "OD",
    role: "Executive Chairman",
    level: "local",
    levelLabel: "Local Government",
    officeType: "lcda_chairman",
    office: "Executive Chairman, Itire-Ikate LCDA",
    jurisdiction: "Itire-Ikate Local Council Development Area",
    constituency: "Itire-Ikate LCDA",
    summary:
      "Hon. Odunayo Oluwafemi Daniel serves as Executive Chairman of Itire-Ikate Local Council Development Area (LCDA), with a focus on local administration, community development and service delivery.",
    biography: [
      "Hon. Oluwafemi Daniel Odunayo, popularly known as FOD, serves as the Executive Chairman of Itire-Ikate Local Council Development Area.",
      "According to the official LCDA profile, he attended Saint Thomas Aquinas Primary School in Surulere and Birch Freeman High School, also in Surulere.",
      "He later studied at the University of Lagos, Akoka, where he earned an Advanced Diploma in Security Operations and Management between 2012 and 2014.",
      "The official LCDA profile describes his professional background as including specialised security support and training.",
    ],
    service: [
      "Executive leadership of Itire-Ikate LCDA.",
      "Local administration and grassroots service delivery.",
      "Community development and infrastructure initiatives.",
      "Environmental, education, health and social-service initiatives within the LCDA.",
      "Coordination of programmes intended to improve services and community conditions.",
    ],
    sources: [
      {
        label: "Itire-Ikate LCDA — Official Profile",
        url: "https://www.itireikatelcda.lg.gov.ng/team/hon-odunayo-oluwafemi-daniel/",
      },
      {
        label: "Itire-Ikate LCDA — Meet the Chairman",
        url: "https://www.itireikatelcda.lg.gov.ng/meet-the-chairman/",
      },
      {
        label: "Itire-Ikate LCDA — Official Website",
        url: "https://www.itireikatelcda.lg.gov.ng/",
      },
    ],
  },
];

/*
 * ============================================================
 * GROUPED LEADERSHIP DIRECTORY
 * ============================================================
 */

export const leadershipGroups = [
  {
    id: "federal",
    title: "Federal Government",
    description:
      "Federal representatives and national public-service leadership connected to Surulere and Nigeria's federal government.",
    members: leadership.filter((person) => person.level === "federal"),
  },
  {
    id: "state",
    title: "Lagos State Government",
    description:
      "Lagos State representatives serving Surulere through the Lagos State House of Assembly.",
    members: leadership.filter((person) => person.level === "state"),
  },
  {
    id: "local",
    title: "Local Government & LCDA",
    description:
      "Local government and LCDA leadership responsible for grassroots administration and community service delivery.",
    members: leadership.filter((person) => person.level === "local"),
  },
];

/*
 * ============================================================
 * HELPERS
 * ============================================================
 */

export function getLeadershipBySlug(slug: string) {
  return leadership.find((person) => person.slug === slug);
}

/**
 * Backward-compatible export.
 *
 * Existing REACH pages such as:
 * - homepage
 * - sitemap
 * - llms.txt
 * - SEO helpers
 *
 * already import `leaders`.
 */
export const leaders = leadership;