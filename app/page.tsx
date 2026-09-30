import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  ClipboardList,
  MapPinned,
  MessageCircle,
  Search,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

import { getPublicData } from "@/lib/reach";

/*
 * Media assets from /public
 *
 * If one of these filenames differs in your repository,
 * replace it with the matching filename from /public.
 */

const HERO_VIDEO =
  "/videos/AQNNDstOpwaP-cKvufFLnLhMAUO2G7PmGasn2UsXAfd7wagAquu5v1omCGTOp3u_Fapty28rHs9FUk6wQ0hJ4wY6FjrfBbddUtAAtDQ.mp4";

const HERO_IMAGE =
  "/images/731417453_18606717733056110_2647227045067538133_n.webp";

const COMMUNITY_IMAGES = [
  "/images/731442451_18606717919056110_3586473721461605243_n.webp",
  "/images/731495724_18606717898056110_913623395751596990_n.webp",
  "/images/731710329_18606717742056110_2518768386523954433_n.webp",
  "/images/731834798_18606717799056110_909372548720658224_n.webp",
  "/images/733882556_18606717838056110_5937837886466548213_n.webp",
  "/images/734570199_18606717880056110_8467978152391883490_n.webp",
];

export default async function Home() {
  const {
    tenant,
    jurisdiction,
    programmes,
    opportunities,
    projects,
  } = await getPublicData();

  return (
    <main className="bg-white">
      {/* =========================================================
          HERO
      ========================================================== */}
      <section className="relative isolate min-h-[720px] overflow-hidden bg-slate-950 text-white">
        {/* Background video */}
        <video
          autoPlay
          muted
          loop
          playsInline
          poster={HERO_IMAGE}
          preload="metadata"
          aria-hidden="true"
          className="absolute inset-0 -z-20 h-full w-full object-cover opacity-45"
        >
          <source src={HERO_VIDEO} type="video/mp4" />
        </video>

        {/* Dark overlays */}
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-slate-950 via-slate-950/90 to-slate-950/35" />

        <div className="absolute inset-0 -z-10 bg-gradient-to-t from-slate-950 via-transparent to-slate-950/30" />

        {/* Hero content */}
        <div className="mx-auto grid max-w-7xl items-end gap-12 px-5 py-28 md:grid-cols-[1.15fr_.85fr] md:py-36">
          <div>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-teal-300/30 bg-teal-300/10 px-4 py-2 text-sm font-bold text-teal-200 backdrop-blur">
              <Sparkles size={15} />
              {tenant.name}
            </div>

            <h1 className="max-w-4xl text-5xl font-black leading-[0.98] tracking-tight sm:text-6xl md:text-8xl">
              Your community.
              <br />
              <span className="text-teal-300">
                One digital office.
              </span>
            </h1>

            <p className="mt-7 max-w-2xl text-lg leading-8 text-slate-200 md:text-xl">
              {tenant.description ||
                "Connect with public programmes, opportunities, service requests and community projects through one simple digital experience."}
            </p>

            {jurisdiction && (
              <div className="mt-5 flex items-center gap-2 text-sm font-semibold text-slate-300">
                <MapPinned
                  size={16}
                  className="text-teal-300"
                />

                {jurisdiction.name}

                {jurisdiction.state
                  ? ` · ${jurisdiction.state}`
                  : ""}
              </div>
            )}

            <div className="mt-9 flex flex-wrap gap-3">
              <Link
                href="/requests/new"
                className="inline-flex items-center gap-2 rounded-xl bg-teal-500 px-6 py-3.5 font-black text-slate-950 transition hover:bg-teal-300"
              >
                Request assistance
                <ArrowRight size={18} />
              </Link>

              <Link
                href="/programmes"
                className="rounded-xl border border-white/20 bg-white/10 px-6 py-3.5 font-bold backdrop-blur transition hover:bg-white/15"
              >
                Explore services
              </Link>
            </div>

            <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-sm text-slate-300">
              <span className="inline-flex items-center gap-2">
                <CheckCircle2
                  size={16}
                  className="text-teal-300"
                />
                Public service access
              </span>

              <span className="inline-flex items-center gap-2">
                <ShieldCheck
                  size={16}
                  className="text-teal-300"
                />
                Secure resident accounts
              </span>
            </div>
          </div>

          {/* Hero service panel */}
          <div className="rounded-3xl border border-white/15 bg-slate-950/60 p-5 shadow-2xl backdrop-blur-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.2em] text-teal-300">
                  Civic office
                </p>

                <p className="mt-1 text-lg font-black">
                  What can we help with?
                </p>
              </div>

              <MessageCircle className="text-teal-300" />
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <Card
                icon={<ClipboardList />}
                title="Programmes"
                text={`${programmes.length} active programmes`}
              />

              <Card
                icon={<Search />}
                title="Opportunities"
                text={`${opportunities.length} open opportunities`}
              />

              <Card
                icon={<MapPinned />}
                title="Projects"
                text={`${projects.length} tracked projects`}
              />

              <Card
                icon={<MessageCircle />}
                title="Requests"
                text="Report an issue or request assistance."
              />
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          LIVE STATS
      ========================================================== */}
      <section className="border-b border-slate-100 bg-slate-50">
        <div className="mx-auto grid max-w-7xl gap-4 px-5 py-7 sm:grid-cols-3">
          <QuickStat
            value={String(programmes.length)}
            label="Active programmes"
          />

          <QuickStat
            value={String(opportunities.length)}
            label="Open opportunities"
          />

          <QuickStat
            value={String(projects.length)}
            label="Community projects"
          />
        </div>
      </section>

      {/* =========================================================
          INTRO + COMMUNITY GALLERY
      ========================================================== */}
      <section className="mx-auto max-w-7xl px-5 py-20">
        <div className="grid gap-12 md:grid-cols-[.8fr_1.2fr] md:items-center">
          {/* Copy */}
          <div>
            <p className="text-sm font-black uppercase tracking-[0.2em] text-teal-700">
              Built around residents
            </p>

            <h2 className="mt-3 text-4xl font-black tracking-tight text-slate-950 md:text-5xl">
              Find help. Take part. Stay informed.
            </h2>

            <p className="mt-5 max-w-xl text-lg leading-8 text-slate-600">
              REACH brings useful civic information and service
              pathways together so residents can spend less time
              figuring out where to go and more time getting things
              done.
            </p>

            <div className="mt-8 space-y-5">
              <JourneyItem
                number="01"
                title="Discover"
                text="Find programmes, opportunities and community initiatives."
              />

              <JourneyItem
                number="02"
                title="Engage"
                text="Submit requests and participate in available services."
              />

              <JourneyItem
                number="03"
                title="Track"
                text="Follow requests and public projects as they progress."
              />
            </div>
          </div>

          {/* Image gallery */}
          <div className="grid grid-cols-2 gap-3">
            {COMMUNITY_IMAGES.map((src, index) => (
              <div
                key={src}
                className={`relative overflow-hidden rounded-3xl bg-slate-100 ${
                  index === 0
                    ? "col-span-2 aspect-[2/1]"
                    : "aspect-square"
                }`}
              >
                <img
                  src={src}
                  alt="Community activity"
                  loading={
                    index === 0 ? "eager" : "lazy"
                  }
                  className="h-full w-full object-cover transition duration-500 hover:scale-105"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =========================================================
          SERVICES
      ========================================================== */}
      <section className="bg-slate-950 text-white">
        <div className="mx-auto max-w-7xl px-5 py-20">
          <div className="max-w-2xl">
            <p className="text-sm font-black uppercase tracking-[0.2em] text-teal-300">
              The REACH experience
            </p>

            <h2 className="mt-3 text-4xl font-black tracking-tight md:text-5xl">
              One place for civic services.
            </h2>

            <p className="mt-5 text-lg leading-8 text-slate-300">
              From discovering an opportunity to reporting a
              community issue, REACH gives residents a clear digital
              path to engage with their civic office.
            </p>
          </div>

          <div className="mt-10 grid gap-5 md:grid-cols-3">
            <FeatureCard
              number="01"
              title="Discover"
              text="Browse programmes, opportunities and initiatives available to your community."
            />

            <FeatureCard
              number="02"
              title="Engage"
              text="Create an account, submit a request and connect with the relevant office."
            />

            <FeatureCard
              number="03"
              title="Track"
              text="Keep up with your requests and follow the progress of community projects."
            />
          </div>
        </div>
      </section>

      {/* =========================================================
    PROGRAMMES / OPPORTUNITIES PREVIEW
========================================================== */}
<section className="mx-auto max-w-7xl px-5 py-20">
  <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
    <div>
      <p className="text-sm font-black uppercase tracking-[0.2em] text-teal-700">
        Explore
      </p>

      <h2 className="mt-2 text-4xl font-black tracking-tight text-slate-950">
        What is available?
      </h2>

      <p className="mt-3 max-w-2xl leading-7 text-slate-600">
        Explore programmes, opportunities and projects currently
        published through this civic office.
      </p>
    </div>

    <Link
      href="/programmes"
      className="inline-flex items-center gap-2 font-black text-teal-700 transition hover:text-teal-800"
    >
      View programmes
      <ArrowRight size={18} />
    </Link>
  </div>

  {programmes.length > 0 ? (
    <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {programmes.slice(0, 3).map((programme) => (
        <article
          key={programme.id}
          className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg"
        >
          {programme.image_url ? (
            <img
              src={programme.image_url}
              alt={programme.title}
              className="h-52 w-full object-cover"
              loading="lazy"
            />
          ) : (
            <div className="flex h-52 items-center justify-center bg-gradient-to-br from-teal-100 to-slate-100">
              <ClipboardList
                size={48}
                className="text-teal-700"
              />
            </div>
          )}

          <div className="p-6">
            <span className="text-xs font-black uppercase tracking-wider text-teal-700">
              {programme.category || "Programme"}
            </span>

            <h3 className="mt-2 text-xl font-black text-slate-950">
              {programme.title}
            </h3>

            {programme.summary && (
              <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-600">
                {programme.summary}
              </p>
            )}

            <Link
              href={`/programmes/${programme.slug}`}
              className="mt-5 inline-flex items-center gap-2 text-sm font-black text-teal-700 transition hover:text-teal-800"
            >
              Learn more
              <ArrowRight size={15} />
            </Link>
          </div>
        </article>
      ))}
    </div>
  ) : (
    <div className="mt-10 overflow-hidden rounded-3xl border border-slate-200 bg-slate-50">
      <div className="grid min-h-[280px] items-center gap-8 px-6 py-10 sm:px-10 md:grid-cols-[auto_1fr_auto] md:px-12">
        <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-teal-100 text-teal-700">
          <ClipboardList size={36} />
        </div>

        <div>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-teal-700">
            Programmes
          </p>

          <h3 className="mt-2 text-2xl font-black tracking-tight text-slate-950">
            New programmes will appear here.
          </h3>

          <p className="mt-2 max-w-xl text-sm leading-7 text-slate-600">
            There are no active programmes published for this civic
            office yet. Check back here as new programmes and
            initiatives become available.
          </p>
        </div>

        <Link
          href="/programmes"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 py-3 text-sm font-black text-white transition hover:bg-slate-800"
        >
          Browse programmes
          <ArrowRight size={16} />
        </Link>
      </div>
    </div>
  )}
</section>

      {/* =========================================================
          REQUEST CTA
      ========================================================== */}
      <section className="mx-auto max-w-7xl px-5 pb-20">
        <div className="relative overflow-hidden rounded-[2rem] bg-teal-50 p-8 md:p-12">
          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-teal-200/50 blur-3xl" />

          <div className="relative grid gap-8 md:grid-cols-[1fr_auto] md:items-center">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.2em] text-teal-800">
                Need assistance?
              </p>

              <h2 className="mt-3 text-3xl font-black text-slate-950 md:text-4xl">
                Tell the office what you need.
              </h2>

              <p className="mt-3 max-w-2xl leading-7 text-slate-600">
                Submit a service request through REACH and keep your
                reference details for future follow-up.
              </p>
            </div>

            <Link
              href="/requests/new"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-950 px-6 py-3.5 font-black text-white transition hover:bg-slate-800"
            >
              Start a request
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

/* ===============================================================
   COMPONENTS
=============================================================== */

function Card({
  icon,
  title,
  text,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/10 p-5 transition hover:bg-white/15">
      <div className="mb-4 text-teal-300">
        {icon}
      </div>

      <div className="font-black">
        {title}
      </div>

      <div className="mt-1 text-sm leading-6 text-slate-300">
        {text}
      </div>
    </div>
  );
}

function QuickStat({
  value,
  label,
}: {
  value: string;
  label: string;
}) {
  return (
    <div className="rounded-2xl bg-white px-5 py-4 shadow-sm ring-1 ring-slate-200">
      <div className="text-2xl font-black text-slate-950">
        {value}
      </div>

      <div className="mt-1 text-sm font-medium text-slate-500">
        {label}
      </div>
    </div>
  );
}

function JourneyItem({
  number,
  title,
  text,
}: {
  number: string;
  title: string;
  text: string;
}) {
  return (
    <div className="flex gap-4">
      <div className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-teal-100 text-xs font-black text-teal-800">
        {number}
      </div>

      <div>
        <h3 className="font-black text-slate-950">
          {title}
        </h3>

        <p className="mt-1 text-sm leading-6 text-slate-600">
          {text}
        </p>
      </div>
    </div>
  );
}

function FeatureCard({
  number,
  title,
  text,
}: {
  number: string;
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-7 transition hover:bg-white/10">
      <div className="text-sm font-black text-teal-300">
        {number}
      </div>

      <h3 className="mt-5 text-2xl font-black">
        {title}
      </h3>

      <p className="mt-3 leading-7 text-slate-300">
        {text}
      </p>
    </div>
  );
}

function EmptyCard({
  title,
  text,
}: {
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-8 md:col-span-3">
      <h3 className="font-black text-slate-950">
        {title}
      </h3>

      <p className="mt-2 text-sm leading-6 text-slate-600">
        {text}
      </p>
    </div>
  );
}

