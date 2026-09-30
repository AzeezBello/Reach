import Link from "next/link";
import {
  ArrowRight,
  ClipboardList,
  MapPinned,
  MessageCircle,
  Search,
} from "lucide-react";

import { getPublicData } from "@/lib/reach";

export default async function Home() {
  const {
    tenant,
    jurisdiction,
    programmes,
    opportunities,
    projects,
  } = await getPublicData();

  return (
    <main>
      <section className="bg-slate-950 text-white">
        <div className="mx-auto grid max-w-7xl gap-12 px-5 py-20 md:grid-cols-2 md:py-28">
          <div>
            <div className="mb-5 inline-flex rounded-full border border-teal-400/30 bg-teal-400/10 px-4 py-2 text-sm font-bold text-teal-300">
              {tenant.name}
            </div>

            <h1 className="text-5xl font-black leading-tight md:text-7xl">
              Your community.
              <br />
              <span className="text-teal-400">
                One digital office.
              </span>
            </h1>

            <p className="mt-6 max-w-xl text-lg leading-8 text-slate-300">
              {tenant.description ||
                "Connect with public programmes, opportunities, service requests and community projects through one digital experience."}
            </p>

            {jurisdiction && (
              <p className="mt-4 text-sm font-semibold text-slate-400">
                {jurisdiction.name}
                {jurisdiction.state
                  ? ` · ${jurisdiction.state}`
                  : ""}
              </p>
            )}

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/requests/new"
                className="inline-flex items-center gap-2 rounded-xl bg-teal-500 px-5 py-3 font-bold text-white"
              >
                Request assistance
                <ArrowRight size={18} />
              </Link>

              <Link
                href="/programmes"
                className="rounded-xl border border-slate-700 px-5 py-3 font-bold"
              >
                Explore services
              </Link>
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl">
            <div className="text-sm font-semibold text-slate-400">
              LIVE FROM REACH
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
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
                text="Submit and track community issues."
              />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

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
    <div className="rounded-2xl bg-white/10 p-5">
      <div className="mb-3 text-teal-300">
        {icon}
      </div>

      <div className="font-bold">{title}</div>

      <div className="mt-1 text-sm leading-6 text-slate-400">
        {text}
      </div>
    </div>
  );
}