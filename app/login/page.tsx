import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { CheckCircle2 } from "lucide-react";

import { AuthForm } from "@/components/auth-form";
import { Photo } from "@/components/media";
import { Eyebrow } from "@/components/ui";
import { pageArt } from "@/lib/media";
import { getCurrentUser, getTenant } from "@/lib/reach";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in or create a resident account to submit and track requests.",
  alternates: { canonical: "/login" },
  robots: { index: false, follow: true },
};

/** Only allow same-site redirect targets. */
function safeNext(value: string | undefined) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return "/dashboard";
  }
  return value;
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const [{ next }, user, { tenant }] = await Promise.all([
    searchParams,
    getCurrentUser(),
    getTenant(),
  ]);

  const target = safeNext(next);

  if (user) {
    redirect(target);
  }

  return (
    <div className="grid min-h-[calc(100dvh-4rem)] lg:grid-cols-2">
      <section className="relative isolate hidden overflow-hidden bg-ink text-white lg:block">
        <Photo
          src={pageArt.login.src}
          alt={pageArt.login.alt}
          priority
          sizes="50vw"
          className="-z-20 opacity-50"
        />
        <div className="absolute inset-0 -z-10 bg-linear-to-t from-ink via-ink/60 to-ink/20" />

        <div className="flex h-full flex-col justify-end p-12 xl:p-16">
          <Eyebrow tone="light">{tenant.name}</Eyebrow>

          <h2 className="mt-3 max-w-md text-4xl font-extrabold tracking-tight text-balance">
            One account for every request, programme and update.
          </h2>

          <ul className="mt-6 space-y-3 text-sm text-slate-200">
            {[
              "Submit requests to the office",
              "Track progress with a reference number",
              "Apply for programmes and opportunities",
            ].map((item) => (
              <li key={item} className="inline-flex items-center gap-2">
                <CheckCircle2 size={16} className="text-brand-400" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="flex items-center bg-slate-50 px-4 py-12 sm:px-6 md:py-16 lg:px-12">
        <div className="mx-auto w-full max-w-md">
          <AuthForm next={target} />
        </div>
      </section>
    </div>
  );
}
