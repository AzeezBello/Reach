import type { Metadata } from "next";
import Link from "next/link";
import {
  CalendarDays,
  ClipboardList,
  KeyRound,
  MessageCircle,
  Tag,
} from "lucide-react";

import {
  Badge,
  ButtonLink,
  Container,
  EmptyState,
} from "@/components/ui";
import { PageHero } from "@/components/page-hero";
import { formatDate, humanize, statusTone } from "@/lib/format";
import { pageArt } from "@/lib/media";
import { getCurrentUser, getMyRequests } from "@/lib/reach";

export const metadata: Metadata = {
  title: "My requests",
  description:
    "Submit a service request to the civic office and follow its progress.",
  alternates: { canonical: "/requests" },
};

export default async function RequestsPage() {
  const user = await getCurrentUser();
  const requests = user ? await getMyRequests(user.id) : [];

  return (
    <>
      <PageHero
        eyebrow="Community requests"
        title={user ? "My requests" : "Request assistance"}
        text={
          user
            ? "Every request you submit is listed here with its reference number and current status."
            : "Report an issue or request assistance from the appropriate public office. Sign in to keep track of everything you submit."
        }
        image={pageArt.requests}
        breadcrumbs={[{ label: "My requests", href: "/requests" }]}
      >
        <div className="flex flex-col gap-3 sm:flex-row">
          <ButtonLink href="/requests/new" size="lg" arrow>
            Submit a request
          </ButtonLink>

          {user ? (
            <ButtonLink href="/dashboard" variant="outlineLight" size="lg">
              Go to my dashboard
            </ButtonLink>
          ) : (
            <ButtonLink href="/login?next=/requests" variant="outlineLight" size="lg">
              Sign in to track requests
            </ButtonLink>
          )}
        </div>
      </PageHero>

      <Container className="py-12 md:py-16">
        {user ? (
          requests.length > 0 ? (
            <ul className="space-y-4">
              {requests.map((request) => (
                <li
                  key={request.id}
                  className="relative rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-brand-300 hover:shadow-md sm:p-6"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    {request.reference_no && (
                      <span className="rounded-lg bg-ink px-2.5 py-1 font-mono text-xs font-bold text-white">
                        {request.reference_no}
                      </span>
                    )}

                    <Badge tone={statusTone(request.status)}>
                      {humanize(request.status, "Submitted")}
                    </Badge>
                  </div>

                  <h2 className="mt-3 text-lg font-extrabold text-ink">
                    <Link
                      href={`/requests/${request.id}`}
                      className="after:absolute after:inset-0 after:content-[''] hover:text-brand-800"
                    >
                      {request.subject}
                    </Link>
                  </h2>

                  {request.description && (
                    <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-600">
                      {request.description}
                    </p>
                  )}

                  <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-xs font-semibold text-slate-500">
                    {request.category && (
                      <span className="inline-flex items-center gap-1.5">
                        <Tag size={14} className="text-brand-700" />
                        {request.category}
                      </span>
                    )}

                    <span className="inline-flex items-center gap-1.5">
                      <CalendarDays size={14} className="text-brand-700" />
                      Submitted {formatDate(request.created_at)}
                    </span>

                    {request.updated_at &&
                      request.updated_at !== request.created_at && (
                        <span className="inline-flex items-center gap-1.5">
                          <CalendarDays size={14} className="text-brand-700" />
                          Updated {formatDate(request.updated_at)}
                        </span>
                      )}
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState
              icon={<ClipboardList size={28} />}
              title="You have not submitted any requests yet"
              text="When you submit a request it will appear here with a reference number and its current status."
              action={<ButtonLink href="/requests/new">Submit a request</ButtonLink>}
            />
          )
        ) : (
          <div className="grid gap-5 md:grid-cols-2">
            <InfoCard
              icon={<MessageCircle size={24} />}
              title="Submit a request"
              text="Roads, drainage, lighting, water, education, welfare and other community issues. Describe the problem and the office will review it."
              action={<ButtonLink href="/requests/new">Start a request</ButtonLink>}
            />

            <InfoCard
              icon={<KeyRound size={24} />}
              title="Track a request"
              text="Each request receives a reference number. Sign in with the account you used to submit it and every request will be listed here with its status."
              action={
                <ButtonLink href="/login?next=/requests" variant="outline">
                  Sign in
                </ButtonLink>
              }
            />
          </div>
        )}
      </Container>
    </>
  );
}

function InfoCard({
  icon,
  title,
  text,
  action,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
  action: React.ReactNode;
}) {
  return (
    <div className="flex flex-col rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      <span className="flex size-12 items-center justify-center rounded-2xl bg-brand-50 text-brand-700">
        {icon}
      </span>

      <h2 className="mt-5 text-2xl font-extrabold text-ink">{title}</h2>

      <p className="mt-3 flex-1 text-sm leading-7 text-slate-600">{text}</p>

      <div className="mt-6">{action}</div>
    </div>
  );
}
