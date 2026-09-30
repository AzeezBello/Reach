import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, CalendarDays, MapPin } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getPublicData } from "@/lib/reach";

export default async function ProgrammeDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { tenant } = await getPublicData();

  const supabase = await createClient();

  const { data: programme, error } = await supabase
    .from("programmes")
    .select(`
      id,
      title,
      slug,
      summary,
      description,
      category,
      location,
      start_date,
      end_date,
      registration_deadline,
      status,
      capacity,
      image_url
    `)
    .eq("organization_id", tenant.id)
    .eq("slug", slug)
    .in("status", ["open", "ongoing"])
    .maybeSingle();

  if (error || !programme) {
    notFound();
  }

  return (
    <main className="bg-white">
      <section className="mx-auto max-w-5xl px-5 py-14">
        <Link
          href="/programmes"
          className="inline-flex items-center gap-2 text-sm font-bold text-teal-700"
        >
          <ArrowLeft size={16} />
          Back to programmes
        </Link>

        {programme.image_url && (
          <img
            src={programme.image_url}
            alt={programme.title}
            className="mt-8 h-[360px] w-full rounded-3xl object-cover"
          />
        )}

        <div className="mt-8">
          <p className="text-sm font-black uppercase tracking-widest text-teal-700">
            {programme.category}
          </p>

          <h1 className="mt-3 text-4xl font-black tracking-tight text-slate-950 md:text-5xl">
            {programme.title}
          </h1>

          {programme.summary && (
            <p className="mt-5 text-lg leading-8 text-slate-600">
              {programme.summary}
            </p>
          )}

          <div className="mt-6 flex flex-wrap gap-5 text-sm text-slate-500">
            {programme.location && (
              <span className="inline-flex items-center gap-2">
                <MapPin size={16} />
                {programme.location}
              </span>
            )}

            {programme.registration_deadline && (
              <span className="inline-flex items-center gap-2">
                <CalendarDays size={16} />
                Registration closes {programme.registration_deadline}
              </span>
            )}
          </div>

          {programme.description && (
            <div className="mt-10 whitespace-pre-line text-base leading-8 text-slate-700">
              {programme.description}
            </div>
          )}

          <Link
            href="/requests/new"
            className="mt-10 inline-flex rounded-xl bg-teal-700 px-6 py-3.5 font-black text-white hover:bg-teal-800"
          >
            Register / Request Assistance
          </Link>
        </div>
      </section>
    </main>
  );
}