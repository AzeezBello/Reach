import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  Bell,
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
  AdminHeader,
  Field,
  Panel,
  StatCard,
  StatusBadge,
} from "@/components/admin";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { Badge, ButtonLink, Container, TextLink } from "@/components/ui";
import {
  OPEN_REQUEST_STATUSES,
  SUPERADMIN_ROLES,
  getResidentDashboard,
  requireUser,
} from "@/lib/admin";
import { formatDate, initials } from "@/lib/format";

import { updateProfile } from "./actions";

export const metadata: Metadata = {
  title: "My dashboard",
  description: "Your requests, applications, notifications and profile in one place.",
  robots: { index: false, follow: false },
  alternates: { canonical: "/dashboard" },
};

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ denied?: string }>;
}) {
  const [user, { denied }] = await Promise.all([
    requireUser("/dashboard"),
    searchParams,
  ]);

  const { profile, requests, applications, notifications } =
    await getResidentDashboard(user.id);

  const displayName =
    profile?.full_name ||
    (user.user_metadata?.full_name as string | undefined) ||
    user.email?.split("@")[0] ||
    "Resident";

  const openRequests = requests.filter((request) =>
    OPEN_REQUEST_STATUSES.includes(request.status ?? "submitted")
  );
  const resolvedRequests = requests.filter(
    (request) => request.status === "resolved" || request.status === "closed"
  );

  const isSuperadmin = SUPERADMIN_ROLES.includes(profile?.role ?? "");

  return (
    <div className="bg-slate-50">
      <Container className="py-8 md:py-12">
        <Breadcrumbs items={[{ label: "Dashboard", href: "/dashboard" }]} />

        {denied === "superadmin" && (
          <p
            role="alert"
            className="mt-6 flex items-start gap-3 rounded-2xl border border-gold-200 bg-gold-100/60 p-4 text-sm leading-6 text-gold-700"
          >
            <ShieldAlert size={18} className="mt-0.5 shrink-0" />
            Your account does not have access to the platform console. Ask a
            platform administrator to grant your profile the admin role.
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
              <p className="mt-1 text-sm text-slate-500">{user.email}</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            {isSuperadmin && (
              <ButtonLink href="/superadmin" variant="dark">
                Platform console
              </ButtonLink>
            )}
            <ButtonLink href="/requests/new" arrow>
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
              action={<TextLink href="/requests">All requests</TextLink>}
            >
              {requests.length > 0 ? (
                <ul className="divide-y divide-slate-100">
                  {requests.slice(0, 5).map((request) => (
                    <li key={request.id}>
                      <Link
                        href={`/requests/${request.id}`}
                        className="group flex items-center gap-4 py-4 first:pt-0 last:pb-0"
                      >
                        <span className="min-w-0 flex-1">
                          <span className="flex flex-wrap items-center gap-2">
                            {request.reference_no && (
                              <span className="rounded-md bg-ink px-2 py-0.5 font-mono text-[11px] font-bold text-white">
                                {request.reference_no}
                              </span>
                            )}
                            <StatusBadge status={request.status} fallback="Submitted" />
                          </span>
                          <span className="mt-2 block truncate font-bold text-ink group-hover:text-brand-800">
                            {request.subject}
                          </span>
                          <span className="mt-0.5 block text-xs text-slate-500">
                            {request.category ? `${request.category} · ` : ""}
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
                  action={<ButtonLink href="/requests/new" size="sm">Submit a request</ButtonLink>}
                />
              )}
            </Panel>

            {/* Applications */}
            <Panel
              title="Programme applications"
              text="Programmes you have applied to through this office."
              action={<TextLink href="/programmes">Browse programmes</TextLink>}
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
                          <span className="block font-bold text-ink">Programme</span>
                        )}
                        <span className="mt-0.5 block text-xs text-slate-500">
                          Applied {formatDate(application.created_at)}
                        </span>
                      </div>
                      <StatusBadge status={application.status} fallback="Pending" />
                    </li>
                  ))}
                </ul>
              ) : (
                <EmptyRow
                  icon={<GraduationCap size={20} />}
                  text="No programme applications yet. Open programmes are listed on the programmes page."
                  action={<ButtonLink href="/programmes" size="sm" variant="outline">View programmes</ButtonLink>}
                />
              )}
            </Panel>
          </div>

          <div className="space-y-6">
            {/* Profile */}
            <Panel title="My profile" text="The office uses these details to follow up with you.">
              <ActionForm action={updateProfile} submitLabel="Save profile">
                <Field
                  label="Full name"
                  name="full_name"
                  required
                  autoComplete="name"
                  defaultValue={profile?.full_name ?? (user.user_metadata?.full_name as string | undefined) ?? ""}
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
                <div>
                  <p className="mb-1.5 text-sm font-bold text-ink">Email</p>
                  <p className="rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-600">
                    {user.email}
                  </p>
                </div>
              </ActionForm>

              <div className="mt-5 flex items-center gap-2 border-t border-slate-100 pt-4 text-xs text-slate-500">
                <UserRound size={14} />
                Role: <Badge tone="slate">{profile?.role ?? "resident"}</Badge>
              </div>
            </Panel>

            {/* Notifications */}
            <Panel title="Notifications" text="Updates from the office about your requests and programmes.">
              {notifications.length > 0 ? (
                <ul className="space-y-4">
                  {notifications.map((notification) => (
                    <li key={notification.id} className="flex gap-3">
                      <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-700">
                        <Bell size={15} />
                      </span>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-ink">
                          {notification.title || "Update"}
                        </p>
                        {notification.message && (
                          <p className="mt-0.5 text-sm leading-6 text-slate-600">
                            {notification.message}
                          </p>
                        )}
                        <p className="mt-1 text-xs text-slate-400">
                          {formatDate(notification.sent_at ?? notification.created_at)}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <EmptyRow icon={<Bell size={20} />} text="No notifications yet. You will see updates here when the office responds." />
              )}
            </Panel>

            {/* Quick links */}
            <Panel title="Explore">
              <ul className="grid gap-2">
                {[
                  { href: "/programmes", icon: <ClipboardList size={18} />, label: "Programmes" },
                  { href: "/opportunities", icon: <Sparkles size={18} />, label: "Opportunities" },
                  { href: "/projects", icon: <FolderKanban size={18} />, label: "Community projects" },
                ].map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="group flex items-center gap-3 rounded-xl border border-slate-200 px-4 py-3 text-sm font-bold text-ink transition hover:border-brand-300 hover:bg-brand-50/60"
                    >
                      <span className="text-brand-700">{item.icon}</span>
                      {item.label}
                      <ArrowRight size={16} className="ml-auto text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-brand-700" />
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
      <p className="flex-1 text-sm leading-6 text-slate-600">{text}</p>
      {action}
    </div>
  );
}
