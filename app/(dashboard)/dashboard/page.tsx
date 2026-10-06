import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  Bell,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  FolderKanban,
  GraduationCap,
  MessageCircle,
  ShieldAlert,
  Sparkles,
  UserRound,
} from "lucide-react";

import { ActionForm } from "@/components/action-form";
import {
  Field,
  Panel,
  SelectField,
  StatCard,
  StatusBadge,
} from "@/components/admin";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { Badge, ButtonLink, Container, TextLink } from "@/components/ui";
import {
  OPEN_REQUEST_STATUSES,
  getResidentDashboard,
  requireUser,
} from "@/lib/admin";
import { formatDate, formatTime, humanize, initials } from "@/lib/format";
import { getLinkedLeaders } from "@/lib/leaders";
import { createClient } from "@/lib/supabase/server";

import { updateProfile } from "./actions";

export const metadata: Metadata = {
  title: "My dashboard",
  description:
    "Your requests, applications, notifications and profile in one place.",
  robots: {
    index: false,
    follow: false,
  },
  alternates: {
    canonical: "/dashboard",
  },
};

type OpenRequestStatus =
  (typeof OPEN_REQUEST_STATUSES)[number];

function isOpenRequestStatus(
  status: string | null | undefined,
): status is OpenRequestStatus {
  return (
    typeof status === "string" &&
    (OPEN_REQUEST_STATUSES as readonly string[]).includes(status)
  );
}

function getRequestStatus(
  status: string | null | undefined,
) {
  if (
    status === "submitted" ||
    status === "under_review" ||
    status === "in_progress" ||
    status === "resolved" ||
    status === "closed"
  ) {
    return status;
  }

  return "submitted";
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ denied?: string }>;
}) {
  const [user, { denied }] = await Promise.all([
    requireUser("/dashboard"),
    searchParams,
  ]);

  const supabase = await createClient();

  const [residentDashboard, linkedLeaders, jurisdictionsResult] = await Promise.all([
    getResidentDashboard(user.id),
    getLinkedLeaders(user.id),
    supabase.from("jurisdictions").select("id, name, type").order("type").order("name"),
  ]);
  const jurisdictions = (jurisdictionsResult.data ?? []) as {
    id: string;
    name: string;
    type: string | null;
  }[];
  const { profile, requests, applications, notifications, events } = residentDashboard;

  const upcomingEvents = events.filter(
    (event) =>
      new Date(
        event.ends_at ?? event.starts_at,
      ) >= new Date(),
  );

  const displayName =
    profile?.full_name ||
    (user.user_metadata?.full_name as string | undefined) ||
    user.email?.split("@")[0] ||
    "Resident";

  const openRequests = requests.filter((request) =>
    isOpenRequestStatus(request.status),
  );

  const resolvedRequests = requests.filter(
    (request) =>
      request.status === "resolved" ||
      request.status === "closed",
  );

  return (
    <div className="bg-slate-50">
      <Container className="py-8 md:py-12">
        <Breadcrumbs
          items={[
            {
              label: "Dashboard",
              href: "/dashboard",
            },
          ]}
        />

        {(denied === "superadmin" || denied === "leader") && (
          <p
            role="alert"
            className="mt-6 flex items-start gap-3 rounded-2xl border border-gold-200 bg-gold-100/60 p-4 text-sm leading-6 text-gold-700"
          >
            <ShieldAlert
              size={18}
              className="mt-0.5 shrink-0"
            />

            <span>
              {denied === "leader"
                ? "Your account is not linked to an active leadership profile. Ask a platform administrator to link your account."
                : "Your account does not have access to the platform console. Ask a platform administrator to grant your profile the admin role."}
            </span>
          </p>
        )}

        <div className="mt-6 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <span className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-linear-to-br from-brand-500 to-brand-800 text-lg font-extrabold text-white">
              {initials(displayName)}
            </span>

            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-brand-700">
                Resident dashboard
              </p>

              <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">
                Welcome, {displayName}
              </h1>

              <p className="mt-1 text-sm text-slate-500">
                {user.email}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            {linkedLeaders.length > 0 && (
              <ButtonLink href="/leader" variant="dark">
                Leader workspace
              </ButtonLink>
            )}
            <ButtonLink
              href="/requests/new"
              arrow
            >
              New request
            </ButtonLink>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            icon={<MessageCircle size={20} />}
            label="Requests submitted"
            value={requests.length}
          />

          <StatCard
            icon={<ClipboardList size={20} />}
            label="Open requests"
            value={openRequests.length}
            hint="Submitted, under review or in progress"
          />

          <StatCard
            icon={<CheckCircle2 size={20} />}
            label="Resolved"
            value={resolvedRequests.length}
          />

          <StatCard
            icon={<GraduationCap size={20} />}
            label="Programme applications"
            value={applications.length}
          />
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
          <div className="space-y-6">
            {/* Requests */}
            <Panel
              title="Recent requests"
              text="Your latest submissions and their current status."
              action={
                <TextLink href="/requests">
                  All requests
                </TextLink>
              }
            >
              {requests.length > 0 ? (
                <ul className="divide-y divide-slate-100">
                  {requests.slice(0, 5).map((request) => (
                    <li key={request.id}>
                      <Link
                        href={`/dashboard/requests/${request.id}`}
                        className="group flex items-center gap-4 py-4 first:pt-0 last:pb-0"
                      >
                        <span className="min-w-0 flex-1">
                          <span className="flex flex-wrap items-center gap-2">
                            {request.reference_no && (
                              <span className="rounded-md bg-ink px-2 py-0.5 font-mono text-[11px] font-bold text-white">
                                {request.reference_no}
                              </span>
                            )}

                            <StatusBadge
                              status={getRequestStatus(
                                request.status,
                              )}
                              fallback="Submitted"
                            />
                          </span>

                          <span className="mt-2 block truncate font-bold text-ink group-hover:text-brand-800">
                            {request.subject}
                          </span>

                          <span className="mt-0.5 block text-xs text-slate-500">
                            {request.category
                              ? `${request.category} · `
                              : ""}
                            {formatDate(request.created_at)}
                          </span>
                        </span>

                        <ArrowRight
                          size={18}
                          className="shrink-0 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-brand-700"
                        />
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <EmptyRow
                  icon={<MessageCircle size={20} />}
                  text="You have not submitted a request yet."
                  action={
                    <ButtonLink
                      href="/requests/new"
                      size="sm"
                    >
                      Submit a request
                    </ButtonLink>
                  }
                />
              )}
            </Panel>

            {/* Events */}
            <Panel
              title="My events"
              text="Events you have RSVPed to."
              action={
                <TextLink href="/events">
                  Browse events
                </TextLink>
              }
            >
              {upcomingEvents.length > 0 ? (
                <ul className="divide-y divide-slate-100">
                  {upcomingEvents.map((event) => (
                    <li key={event.id}>
                      <Link
                        href={`/events/${event.slug}`}
                        className="group flex items-center gap-4 py-4 first:pt-0 last:pb-0"
                      >
                        <span className="flex size-12 shrink-0 flex-col items-center justify-center rounded-xl bg-brand-50 text-brand-800">
                          <span className="text-[10px] font-extrabold uppercase">
                            {new Date(
                              event.starts_at,
                            ).toLocaleDateString(
                              "en-NG",
                              {
                                month: "short",
                                timeZone:
                                  "Africa/Lagos",
                              },
                            )}
                          </span>

                          <span className="text-lg font-extrabold leading-none">
                            {new Date(
                              event.starts_at,
                            ).toLocaleDateString(
                              "en-NG",
                              {
                                day: "numeric",
                                timeZone:
                                  "Africa/Lagos",
                              },
                            )}
                          </span>
                        </span>

                        <span className="min-w-0 flex-1">
                          <span className="block truncate font-bold text-ink group-hover:text-brand-800">
                            {event.title}
                          </span>

                          <span className="mt-0.5 block truncate text-xs text-slate-500">
                            {formatTime(event.starts_at)}
                            {event.venue
                              ? ` · ${event.venue}`
                              : ""}
                          </span>
                        </span>

                        <ArrowRight
                          size={18}
                          className="shrink-0 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-brand-700"
                        />
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <EmptyRow
                  icon={<CalendarDays size={20} />}
                  text="You have not RSVPed to any upcoming events."
                  action={
                    <ButtonLink
                      href="/events"
                      size="sm"
                      variant="outline"
                    >
                      See events
                    </ButtonLink>
                  }
                />
              )}
            </Panel>

            {/* Applications */}
            <Panel
              title="Programme applications"
              text="Programmes you have applied to through this office."
              action={
                <TextLink href="/programmes">
                  Browse programmes
                </TextLink>
              }
            >
              {applications.length > 0 ? (
                <ul className="divide-y divide-slate-100">
                  {applications.map((application) => (
                    <li
                      key={application.id}
                      className="flex flex-wrap items-center justify-between gap-3 py-4 first:pt-0 last:pb-0"
                    >
                      <div className="min-w-0">
                        {application.programme ? (
                          <Link
                            href={`/programmes/${application.programme.slug}`}
                            className="block truncate font-bold text-ink hover:text-brand-800"
                          >
                            {application.programme.title}
                          </Link>
                        ) : (
                          <span className="block font-bold text-ink">
                            Programme
                          </span>
                        )}

                        <span className="mt-0.5 block text-xs text-slate-500">
                          Applied{" "}
                          {formatDate(
                            application.created_at,
                          )}
                        </span>
                      </div>

                      <StatusBadge
                        status={application.status}
                        fallback="Pending"
                      />
                    </li>
                  ))}
                </ul>
              ) : (
                <EmptyRow
                  icon={<GraduationCap size={20} />}
                  text="No programme applications yet. Open programmes are listed on the programmes page."
                  action={
                    <ButtonLink
                      href="/programmes"
                      size="sm"
                      variant="outline"
                    >
                      View programmes
                    </ButtonLink>
                  }
                />
              )}
            </Panel>
          </div>

          <div className="space-y-6">
            {/* Profile */}
            <Panel
              title="My profile"
              text="The office uses these details to follow up with you."
            >
              <ActionForm
                action={updateProfile}
                submitLabel="Save profile"
              >
                <Field
                  label="Full name"
                  name="full_name"
                  required
                  autoComplete="name"
                  defaultValue={
                    profile?.full_name ??
                    (user.user_metadata?.full_name as
                      | string
                      | undefined) ??
                    ""
                  }
                />

                <Field
                  label="Phone number"
                  name="phone"
                  type="tel"
                  autoComplete="tel"
                  defaultValue={profile?.phone ?? ""}
                  placeholder="e.g. 0801 234 5678"
                  hint="Used for WhatsApp and SMS updates when available."
                />

                {jurisdictions.length > 0 && (
                  <SelectField
                    label="Home area"
                    name="jurisdiction_id"
                    defaultValue={profile?.jurisdiction_id ?? ""}
                    placeholder="Select your area"
                    options={jurisdictions.map((j) => ({
                      value: j.id,
                      label: `${j.name}${j.type ? ` · ${humanize(j.type)}` : ""}`,
                    }))}
                    hint="Requests are routed to the office that serves your area."
                  />
                )}

                <div>
                  <p className="mb-1.5 text-sm font-bold text-ink">
                    Email
                  </p>

                  <p className="rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-600">
                    {user.email}
                  </p>
                </div>
              </ActionForm>

              <div className="mt-5 flex items-center gap-2 border-t border-slate-100 pt-4 text-xs text-slate-500">
                <UserRound size={14} />
                Role:
                <Badge tone="slate">
                  {profile?.role ?? "resident"}
                </Badge>
              </div>
            </Panel>

            {/* Notifications */}
            <Panel
              title="Notifications"
              text="Updates from the office about your requests and programmes."
              action={
                <TextLink href="/dashboard/notifications">
                  All notifications
                </TextLink>
              }
            >
              {notifications.length > 0 ? (
                <ul className="space-y-4">
                  {notifications.map((notification) => (
                    <li
                      key={notification.id}
                      className="flex gap-3"
                    >
                      <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-700">
                        <Bell size={15} />
                      </span>

                      <div className="min-w-0">
                        <p className="text-sm font-bold text-ink">
                          {notification.title ||
                            "Update"}
                        </p>

                        {notification.message && (
                          <p className="mt-0.5 text-sm leading-6 text-slate-600">
                            {notification.message}
                          </p>
                        )}

                        <p className="mt-1 text-xs text-slate-400">
                          {formatDate(
                            notification.sent_at ??
                              notification.created_at,
                          )}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <EmptyRow
                  icon={<Bell size={20} />}
                  text="No notifications yet. You will see updates here when the office responds."
                />
              )}
            </Panel>

            {/* Quick links */}
            <Panel title="Explore">
              <ul className="grid gap-2">
                {[
                  {
                    href: "/programmes",
                    icon: <ClipboardList size={18} />,
                    label: "Programmes",
                  },
                  {
                    href: "/opportunities",
                    icon: <Sparkles size={18} />,
                    label: "Opportunities",
                  },
                  {
                    href: "/projects",
                    icon: <FolderKanban size={18} />,
                    label: "Community projects",
                  },
                ].map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="group flex items-center gap-3 rounded-xl border border-slate-200 px-4 py-3 text-sm font-bold text-ink transition hover:border-brand-300 hover:bg-brand-50/60"
                    >
                      <span className="text-brand-700">
                        {item.icon}
                      </span>

                      {item.label}

                      <ArrowRight
                        size={16}
                        className="ml-auto text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-brand-700"
                      />
                    </Link>
                  </li>
                ))}
              </ul>
            </Panel>
          </div>
        </div>
      </Container>
    </div>
  );
}

function EmptyRow({
  icon,
  text,
  action,
}: {
  icon: React.ReactNode;
  text: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-start gap-4 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-5 sm:flex-row sm:items-center">
      <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-white text-brand-700 ring-1 ring-slate-200">
        {icon}
      </span>

      <p className="flex-1 text-sm leading-6 text-slate-600">
        {text}
      </p>

      {action}
    </div>
  );
}