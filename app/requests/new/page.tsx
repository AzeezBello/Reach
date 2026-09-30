import type { Metadata } from "next";

import { Breadcrumbs } from "@/components/breadcrumbs";
import { RequestForm } from "@/components/request-form";
import { Container, Eyebrow } from "@/components/ui";
import { getCurrentUser, getTenant } from "@/lib/reach";

export const metadata: Metadata = {
  title: "Request assistance",
  description:
    "Tell the civic office about an issue or service request in your community.",
  alternates: { canonical: "/requests/new" },
};

export default async function NewRequestPage() {
  const [{ tenant, jurisdiction }, user] = await Promise.all([
    getTenant(),
    getCurrentUser(),
  ]);

  return (
    <section className="bg-slate-50">
      <Container className="max-w-3xl py-10 md:py-16">
        <div className="mb-8">
          <Breadcrumbs
            items={[
              { label: "My requests", href: "/requests" },
              { label: "New request", href: "/requests/new" },
            ]}
          />
        </div>

        <Eyebrow>{tenant.name}</Eyebrow>

        <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-ink text-balance sm:text-4xl md:text-5xl">
          Request assistance
        </h1>

        <p className="mt-4 text-base leading-7 text-slate-600 sm:text-lg">
          Tell the office about an issue or service request in your community.
          You will receive a reference number to follow up with.
        </p>

        <div className="mt-8">
          <RequestForm
            tenantId={tenant.id}
            jurisdictionId={jurisdiction?.id ?? null}
            userId={user?.id ?? null}
          />
        </div>
      </Container>
    </section>
  );
}
