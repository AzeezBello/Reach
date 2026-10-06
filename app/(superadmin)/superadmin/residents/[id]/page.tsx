import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Bell, CalendarCheck, ClipboardList, ShieldAlert, ThumbsUp, Trash2 } from "lucide-react";

import { ActionForm } from "@/components/action-form";
import { AdminHeader, CheckboxField, Panel, StatCard, StatusBadge, Table, cell } from "@/components/admin";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { ResidentFields } from "@/components/resident-form";
import { Badge, ButtonLink } from "@/components/ui";
import { getJurisdictions, getOffices, getOrganizations, getSuperadminAccess, requireSuperadmin } from "@/lib/admin";
import { formatDate, formatDateTime, humanize } from "@/lib/format";
import { getResident } from "@/lib/residents-admin";

import { deleteResident, setResidentSuspended, updateResident } from "../actions";

export const metadata: Metadata = { title: "Resident" };

export default async function ResidentPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ created?: string }>;
}) {
  await requireSuperadmin();

  const [{ id }, { created }] = await Promise.all([params, searchParams]);
  const result = await getResident(id);

  if (!result) notFound();

  const { account, activity } = result;

  const [jurisdictions, offices, organizations, access] = await Promise.all([
    getJurisdictions(),
    getOffices(),
    getOrganizations(),
    getSuperadminAccess(),
  ]);

  const actorRole = access.profile?.role ?? "admin";
  const isSelf = access.user?.id === account.id;
  const isAdmin = account.role === "admin" || account.role === "superadmin";
  const canModerate = !isSelf && (actorRole === "superadmin" || !isAdmin);

  const officeNames = new Map(offices.map((o) => [o.id, o.name]));
  const organizationNames = new Map(organizations.map((o) => [o.id, o.name]));

  return (
    <div className="space-y-8">
      <Breadcrumbs
        items={[
          { label: "Console", href: "/superadmin" },
          { label: "Residents", href: "/superadmin/residents" },
          { label: account.full_name || account.email || "Resident", href: `/superadmin/residents/${account.id}` },
        ]}
      />

      <AdminHeader
        eyebrow="Residents"
        title={account.full_name || "Unnamed account"}
        text={`${account.email ?? "No email"} · joined ${formatDate(account.created_at)}${
          account.last_sign_in_at ? ` · last signed in ${formatDateTime(account.last_sign_in_at)}` : " · never signed in"
        }`}
        action={
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone={account.role === "resident" ? "slate" : "brand"}>{humanize(account.role, "Resident")}</Badge>
            {account.suspended ? (
              <Badge tone="ink">Suspended</Badge>
            ) : !account.has_auth ? (
              <Badge tone="slate">No login</Badge>
            ) : account.email_confirmed_at ? (
              <Badge tone="brand">Active</Badge>
            ) : (
              <Badge tone="gold">Unconfirmed email</Badge>
            )}
          </div>
        }
      />

      {created && (
        <p role="status" className="rounded-2xl border border-brand-200 bg-brand-50 p-4 text-sm font-semibold text-brand-800">
          Account created. {account.email_confirmed_at ? "The resident can sign in now." : "An invitation email has been sent."}
        </p>
      )}

      {account.suspended && (
        <p role="alert" className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm leading-6 text-red-800">
          <ShieldAlert size={18} className="mt-0.5 shrink-0" />
          This account is suspended. The resident cannot sign in until it is reinstated below.
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={<ClipboardList size={20} />} label="Requests" value={activity.requests.length} />
        <StatCard icon={<CalendarCheck size={20} />} label="Event RSVPs" value={activity.rsvps} />
        <StatCard icon={<ThumbsUp size={20} />} label="Requests supported" value={activity.supports} />
        <StatCard icon={<Bell size={20} />} label="Notifications" value={activity.notifications} />
      </div>

      <ActionForm action={updateResident} submitLabel="Save resident" pendingLabel="Saving…">
        <input type="hidden" name="id" value={account.id} />
        <ResidentFields resident={account} jurisdictions={jurisdictions} actorRole={actorRole} isSelf={isSelf} />
      </ActionForm>

      {(activity.offices.length > 0 || activity.organizations.length > 0) && (
        <Panel title="Staff access" text="Managed under Office staff and Organization members.">
          <ul className="grid gap-2 text-sm text-slate-700">
            {activity.organizations.map((m) => (
              <li key={m.organization_id}>
                <strong className="text-ink">{organizationNames.get(m.organization_id) ?? "Organization"}</strong> · {humanize(m.role, "member")}
              </li>
            ))}
            {activity.offices.map((m) => (
              <li key={m.office_id}>
                <strong className="text-ink">{officeNames.get(m.office_id) ?? "Office"}</strong> · {humanize(m.role, "staff")}
              </li>
            ))}
          </ul>
          <div className="mt-4 flex flex-wrap gap-2">
            <ButtonLink href="/superadmin/staff" variant="outline" size="sm">Office staff</ButtonLink>
            <ButtonLink href="/superadmin/members" variant="outline" size="sm">Organization members</ButtonLink>
          </div>
        </Panel>
      )}

      <Panel title="Requests" text="Service requests submitted from this account.">
        <Table head={["Reference", "Subject", "Status", "Submitted"]} rows={activity.requests.length} empty="No requests yet.">
          {activity.requests.map((request) => (
            <tr key={request.id}>
              <td className={`${cell} font-mono text-xs font-bold text-ink`}>{request.reference_no ?? "—"}</td>
              <td className={cell}>
                <Link href="/superadmin/requests" className="font-bold text-ink hover:text-brand-800">
                  {request.subject}
                </Link>
              </td>
              <td className={cell}>
                <StatusBadge status={request.status} fallback="Submitted" />
              </td>
              <td className={cell}>{formatDate(request.created_at)}</td>
            </tr>
          ))}
        </Table>
      </Panel>

      <Panel
        title="Account access"
        text={
          isSelf
            ? "You are viewing your own account. Suspension and deletion are disabled here."
            : canModerate
              ? "Suspending blocks sign-in and ends open sessions; the resident's requests and history are kept."
              : "Only a superadmin can suspend or delete an admin account."
        }
      >
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 p-5">
            <h3 className="font-extrabold text-ink">{account.suspended ? "Reinstate access" : "Suspend access"}</h3>
            <p className="mt-1 text-sm leading-6 text-slate-600">
              {account.suspended
                ? `Suspended until reinstated${account.banned_until ? ` (recorded until ${formatDate(account.banned_until)})` : ""}. Reinstating lets the resident sign in again straight away.`
                : "Use this for abusive or compromised accounts. Everything the resident submitted stays in place and can be reviewed."}
            </p>
            <div className="mt-4">
              <ActionForm
                action={setResidentSuspended}
                inline
                variant={account.suspended ? "primary" : "outline"}
                submitLabel={account.suspended ? "Reinstate resident" : "Suspend resident"}
                pendingLabel="Working…"
              >
                <input type="hidden" name="id" value={account.id} />
                <input type="hidden" name="suspend" value={account.suspended ? "false" : "true"} />
                {!canModerate && <input type="hidden" name="blocked" value="1" />}
              </ActionForm>
            </div>
          </div>

          <div className="rounded-2xl border border-red-200 bg-red-50/40 p-5">
            <h3 className="flex items-center gap-2 font-extrabold text-red-800">
              <Trash2 size={16} /> Delete this account
            </h3>
            <p className="mt-1 text-sm leading-6 text-red-800/80">
              Permanently removes the sign-in, profile, requests, RSVPs and supports. This cannot be undone. Prefer suspension unless the account must be erased.
            </p>
            <div className="mt-4">
              <ActionForm action={deleteResident} variant="outline" submitLabel="Delete permanently" pendingLabel="Deleting…" className="gap-3">
                <input type="hidden" name="id" value={account.id} />
                <CheckboxField
                  name="confirm"
                  label={`Yes, delete ${account.full_name || "this account"} and everything they submitted`}
                />
              </ActionForm>
            </div>
          </div>
        </div>
      </Panel>
    </div>
  );
}
