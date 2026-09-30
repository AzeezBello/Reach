/*
 * Curated media from /public.
 *
 * The photo and video files keep their original export names, so this module
 * gives each one a meaningful role and alt text in one place.
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
    src: image("731417453_18606717733056110_2647227045067538133_n.webp"),
    alt: "Residents in FKL Sports shirts warming up on an outdoor court under a dramatic sky",
  },
  crowdStretching: {
    src: image("764389101_18616171024056110_4426544888644110476_n.webp"),
    alt: "A large group of residents stretching together at a community fitness session",
  },
  crowdEnergy: {
    src: image("763193152_18616171075056110_2261348050912676223_n.webp"),
    alt: "Residents of all ages taking part in an outdoor community exercise class",
  },
  summerGroup: {
    src: image("764806809_18616848676056110_5652537284398789248_n.webp"),
    alt: "Participants and organisers gathered for the Summer with FKL programme",
  },
  classroom: {
    src: image("765176279_18616848703056110_7215976529452645267_n.webp"),
    alt: "Students in a classroom with visiting officials during an education outreach",
  },
  skillsWorkshop: {
    src: image("772854417_18619324672056110_604157651536873616_n.webp"),
    alt: "Young people learning practical craft and tailoring skills at a workshop",
  },
  basketball: {
    src: image("774362714_18619324738056110_4818283269890857604_n.webp"),
    alt: "Young players in green and yellow kits shooting hoops on a community basketball court",
  },
  volleyball: {
    src: image("774508929_18619339627056110_5505896012715458287_n.webp"),
    alt: "A volleyball match on a community court with players in FKL kits",
  },
  houseOfReps: {
    src: image("734872109_18606327304056110_293967060693877602_n.webp"),
    alt: "Officials and community representatives at the House of Representatives",
  },
  officeMeeting: {
    src: image("786492805_18624344809056110_2886554270919108580_n.webp"),
    alt: "Residents meeting with the representative at the constituency office",
  },
  officeVisit: {
    src: image("784351021_18624345022056110_2168373051325284284_n.webp"),
    alt: "Community members visiting the constituency office",
  },
  brandBanner: {
    src: image("786914244_18624344941056110_8337671485434867584_n.webp"),
    alt: "Community leaders in front of the FKL banner at the constituency office",
  },
} satisfies Record<string, Photo>;

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
    poster: photos.basketball.src,
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
  photos.skillsWorkshop,
  photos.basketball,
  photos.classroom,
  photos.officeMeeting,
];

/** Page hero backgrounds. */
export const pageArt = {
  programmes: photos.summerGroup,
  opportunities: photos.skillsWorkshop,
  projects: photos.volleyball,
  leadership: photos.houseOfReps,
  requests: photos.officeMeeting,
  login: photos.brandBanner,
};
