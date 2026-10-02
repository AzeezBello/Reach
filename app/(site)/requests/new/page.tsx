import type { Metadata } from "next";

import { Breadcrumbs } from "@/components/breadcrumbs";
import RequestForm from "@/components/request-form";
import { Container } from "@/components/ui";
import { getTenant } from "@/lib/reach";

export const metadata: Metadata = {
  title: "Submit a request",
  description:
    "Submit a service request and connect with the appropriate public office.",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function NewRequestPage() {
  const { tenant, jurisdiction } = await getTenant();

  return (
    <div className="bg-slate-50">
      <Container className="py-8 md:py-12">
        <Breadcrumbs
          items={[
            {
              label: "Requests",
              href: "/requests",
            },
            {
              label: "New request",
              href: "/requests/new",
            },
          ]}
        />

        <div className="mx-auto mt-8 max-w-3xl">
          <div className="mb-8">
            <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-brand-700">
              Civic service request
            </p>

            <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-ink md:text-4xl">
              How can we help?
            </h1>

            <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600">
              Tell us what you need help with. REACH will help identify the
              appropriate office and route your request.
            </p>

            {tenant?.name && tenant.name !== "REACH" && (
              <p className="mt-3 text-sm text-slate-500">
                Submitting through{" "}
                <span className="font-bold text-ink">
                  {tenant.name}
                </span>
                {jurisdiction?.name
                  ? ` · ${jurisdiction.name}`
                  : ""}
              </p>
            )}
          </div>

          <RequestForm />
        </div>
      </Container>
    </div>
  );
}