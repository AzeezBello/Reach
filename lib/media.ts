/*
 * Curated media from /public.
 *
 * Photos live under /public/images grouped by purpose:
 *   programmes/   one image per programme, named by slug
 *   projects/     one image per project, named by slug
 *   events/       one image per event, named by slug
 *   community/    photo albums named by activity, numbered in posting order
 *   leaders/      leader portraits named by slug
 * This module gives each photo used in the UI a role and alt text in one place.
 */

const image = (file: string) => `/images/${file}`;
const video = (file: string) => `/videos/${file}`;

export type Photo = {
  src: string;
  alt: string;
};

export type Story = {
  src: string;
  poster: string;
  title: string;
  caption: string;
};

export const brand = {
  logo: "/brand/logo.svg",
  logoWhite: "/brand/logo-white.svg",
  mark: "/brand/logo-mark.svg",
};

export const photos = {
  fitnessWarmUp: {
    src: image("community/fkl-sports-fitness-01.webp"),
    alt: "Residents in FKL Sports shirts warming up on an outdoor court under a dramatic sky",
  },
  crowdStretching: {
    src: image("community/community-fitness-day-02.webp"),
    alt: "A large group of residents stretching together at a community fitness session",
  },
  crowdEnergy: {
    src: image("community/community-fitness-day-06.webp"),
    alt: "Residents of all ages taking part in an outdoor community exercise class",
  },
  summerGroup: {
    src: image("community/summer-with-fkl-02.webp"),
    alt: "Participants and organisers gathered for the Summer with FKL programme",
  },
  classroom: {
    src: image("community/summer-with-fkl-04.webp"),
    alt: "Students in a classroom with visiting officials during an education outreach",
  },
  skillsWorkshop: {
    src: image("community/summer-skills-workshop-03.webp"),
    alt: "Young people learning practical craft and tailoring skills at a workshop",
  },
  basketball: {
    src: image("community/youth-sports-court-02.webp"),
    alt: "Young players in green and yellow kits shooting hoops on a community basketball court",
  },
  volleyball: {
    src: image("community/youth-sports-court-04.webp"),
    alt: "A volleyball match on a community court with players in FKL kits",
  },
  houseOfReps: {
    src: image("community/house-of-representatives-02.webp"),
    alt: "Officials and community representatives at the House of Representatives",
  },
  officeMeeting: {
    src: image("community/constituency-office-01.webp"),
    alt: "Residents meeting with the representative at the constituency office",
  },
  officeVisit: {
    src: image("community/constituency-office-08.webp"),
    alt: "Community members visiting the constituency office",
  },
  brandBanner: {
    src: image("community/constituency-office-04.webp"),
    alt: "Community leaders in front of the FKL banner at the constituency office",
  },
  fitnessRun: {
    src: image("community/fkl-fitness-run.webp"),
    alt: "Residents on a community fitness run in FKL Sports shirts",
  },
  summerCourt: {
    src: image("community/fkl-summer-court.webp"),
    alt: "Children in yellow and green kits on the court during Summer with FKL",
  },
  summerSkills: {
    src: image("community/fkl-summer-skills.webp"),
    alt: "Young people practising craft skills at the summer skills workshop",
  },
  officeDesk: {
    src: image("community/fkl-office-desk.webp"),
    alt: "The representative at his desk receiving residents at the constituency office",
  },
  radioStudio: {
    src: image("community/yanga-fm-radio-visit-01.jpg"),
    alt: "The representative speaking on air during a visit to Yanga FM",
  },
  radioTeam: {
    src: image("community/yanga-fm-radio-visit-02.jpg"),
    alt: "The representative with the Yanga FM presenting team in the studio",
  },
  roadsDrainage: {
    src: image("programmes/lagos-community-roads-drainage-services.jpeg"),
    alt: "Road resurfacing work under way on a community street in Lagos",
  },
} satisfies Record<string, Photo>;

/** Programme images keyed by programme slug, used when a row has no image. */
export const programmeArt: Record<string, Photo> = {
  "ekoexcel-digital-learning-resources": {
    src: image("programmes/ekoexcel-digital-learning-resources.jpg"),
    alt: "Pupils gathered outside a school building for the EKOEXCEL programme",
  },
  "eko-learners-support-programme": {
    src: image("programmes/eko-learners-support-programme.jpeg"),
    alt: "Students and teachers at an Eko Learners' Support Programme session",
  },
  "lagos-cares-community-support-information": {
    src: image("programmes/lagos-cares-community-support-information.jpeg"),
    alt: "Lagos CARES programme information poster",
  },
  "lagos-community-roads-drainage-services": photos.roadsDrainage,
};

/** Hero: an ambient portrait video with a poster from the same activity. */
export const hero = {
  video: video(
    "AQNNDstOpwaP-cKvufFLnLhMAUO2G7PmGasn2UsXAfd7wagAquu5v1omCGTOp3u_Fapty28rHs9FUk6wQ0hJ4wY6FjrfBbddUtAAtDQ.mp4"
  ),
  poster: photos.fitnessWarmUp,
  background: photos.crowdStretching,
};

/** Short videos shown as tap-to-play stories. */
export const stories: Story[] = [
  {
    src: video(
      "AQOllxCfWQGfcileKSZ8WoVgKE-_-K9lC15BVbQJmOV9ch2iiiYFcw_HeR7iAuIyTeiDWeNY092RX2maK3jmsWi_dyXbgKfc5q2R9JU.mp4"
    ),
    poster: photos.summerCourt.src,
    title: "On the court",
    caption: "Sports and youth activities across the constituency.",
  },
  {
    src: video(
      "AQN30oEo_JZAVbtwClKwo7_4Wj2ad4CY_I-xYErlIU7ffR4gpJTdtS7Fg6hGLUpmrGUGCMAjFOn17IHf-4UJBp-CssQiaSmYMU2-a4w.mp4"
    ),
    poster: photos.summerGroup.src,
    title: "Programmes in action",
    caption: "Highlights from community programmes and outreach.",
  },
  {
    src: video(
      "AQM6UxoeaA0My75m__smGrHhxXdQ9cMAQ-_QP_Lnf_Kl_GeHWV2D4cQLYJjB93rkXDPLBOdyakeM_nGBRU9kH2kv2HQ2v3S_V2pmjtY.mp4"
    ),
    poster: photos.crowdEnergy.src,
    title: "Community together",
    caption: "Residents taking part in constituency activities.",
  },
];

/** Homepage mosaic. The first photo spans the full width. */
export const gallery: Photo[] = [
  photos.crowdStretching,
  photos.summerSkills,
  photos.summerCourt,
  photos.radioStudio,
  photos.fitnessRun,
  photos.officeDesk,
];

/** Page hero backgrounds. */
export const pageArt = {
  programmes: photos.summerGroup,
  opportunities: photos.summerSkills,
  projects: photos.roadsDrainage,
  events: photos.summerCourt,
  leadership: photos.houseOfReps,
  requests: photos.officeDesk,
  login: photos.brandBanner,
};
