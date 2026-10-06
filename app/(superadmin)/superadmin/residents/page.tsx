import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Plus, Search, UserRound, UserRoundX, Users } from "lucide-react";

import { AdminHeader, Panel, StatCard, Table, cell, inputClasses, selectClasses } from "@/components/admin";
import { Badge, ButtonLink } from "@/components/ui";
import { getJurisdictions, requireSuperadmin } from "@/lib/admin";
import { formatDate, formatDateTime, humanize } from "@/lib/format";
import { RESIDENT_ROLES } from "@/lib/residents";
import { listResidents, type ResidentFilters } from "@/lib/residents-admin";

export const metadata: Metadata = { title: "Residents" };

const STATUSES = ["active", "suspended", "unconfirmed"] as const;

export default async function ResidentsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; role?: string; status?: string; deleted?: string }>;
}) {
  await requireSuperadmin();

  const params = await searchParams;
  const status = (STATUSES as readonly string[]).includes(params.status ?? "")
    ? (params.status as ResidentFilters["status"])
    : null;

  const [residents, jurisdictions] = await Promise.all([
    listResidents({ q: params.q, role: params.role, status }),
    getJurisdictions(),
  ]);

  const areaNames = new Map(jurisdictions.map((j) => [j.id, j.name]));
  const suspended = residents.filter((r) => r.suspended).length;
  const unconfirmed = residents.filter((r) => r.has_auth && !r.email_confirmed_at).length;
  const filtered = Boolean(params.q || params.role || status);

  return (
    <div className="space-y-8">
      <AdminHeader
        eyebrow="People"
        title="Residents"
        text="Every account on the platform. Create accounts for residents, update their details, suspend access or remove them."
        action={
          <ButtonLink href="/superadmin/residents/new">
            <Plus size={16} /> Create resident
          </ButtonLink>
        }
      />

      {params.deleted && (
        <p role="status" className="rounded-2xl border border-brand-200 bg-brand-50 p-4 text-sm font-semibold text-brand-800">
          The resident account was deleted.
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard icon={<Users size={20} />} label={filtered ? "Matching accounts" : "Accounts"} value={residents.length} />
        <StatCard icon={<UserRoundX size={20} />} label="Suspended" value={suspended} />
        <StatCard icon={<UserRound size={20} />} label="Awaiting email confirmation" value={unconfirmed} />
      </div>

      <Panel title="Find a resident" text="Search by name, email or phone, or filter by role and status.">
        <form method="get" className="grid gap-3 sm:grid-cols-[1fr_180px_180px_auto]">
          <label className="relative">
            <span className="sr-only">Search</span>
            <Search size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              name="q"
              defaultValue={params.q ?? ""}
              placeholder="Name, email or phone"
              className={`${inputClasses} pl-10`}
            />
          </label>
          <select name="role" defaultValue={params.role ?? ""} className={selectClasses} aria-label="Role">
            <option value="">All roles</option>
            {RESIDENT_ROLES.map((role) => (
              <option key={role} value={role}>
                {humanize(role)}
              </option>
            ))}
          </select>
          <select name="status" defaultValue={status ?? ""} className={selectClasses} aria-label="Status">
            <option value="">Any status</option>
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
            <option value="unconfirmed">Unconfirmed email</option>
          </select>
          <div className="flex gap-2">
            <button
              type="submit"
              className="inline-flex min-h-11 items-center justify-center rounded-xl bg-brand-600 px-4 text-sm font-bold text-white transition hover:bg-brand-700"
            >
              Filter
            </button>
            {filtered && (
              <Link
                href="/superadmin/residents"
                className="inline-flex min-h-11 items-center justify-center rounded-xl border border-slate-300 px-4 text-sm font-bold text-slate-700 hover:border-brand-400"
              >
                Clear
              </Link>
            )}
          </div>
        </form>
      </Panel>

      <Panel title="Accounts" text={`${residents.length} shown · newest first`}>
        <Table
          head={["Resident", "Role", "Home area", "Status", "Last sign-in", ""]}
          rows={residents.length}
          empty={filtered ? "No accounts match these filters." : "No resident accounts yet."}
        >
          {residents.map((resident) => (
            <tr key={resident.id} className={resident.suspended ? "bg-red-50/40" : undefined}>
              <td className={cell}>
                <Link href={`/superadmin/residents/${resident.id}`} className="block font-bold text-ink hover:text-brand-800">
                  {resident.full_name || "Unnamed account"}
                </Link>
                <span className="block text-xs text-slate-500">{resident.email ?? "No email"}</span>
                {resident.phone && <span className="block text-xs text-slate-500">{resident.phone}</span>}
              </td>
              <td className={cell}>
                <Badge tone={resident.role === "resident" ? "slate" : "brand"}>{humanize(resident.role, "Resident")}</Badge>
              </td>
              <td className={cell}>{(resident.jurisdiction_id && areaNames.get(resident.jurisdiction_id)) || resident.area || "—"}</td>
              <td className={cell}>
                {resident.suspended ? (
                  <Badge tone="ink">Suspended</Badge>
                ) : !resident.has_auth ? (
                  <Badge tone="slate">No login</Badge>
                ) : resident.email_confirmed_at ? (
                  <Badge tone="brand">Active</Badge>
                ) : (
                  <Badge tone="gold">Unconfirmed</Badge>
                )}
              </td>
              <td className={cell}>
                {formatDateTime(resident.last_sign_in_at) ?? "Never"}
                <span className="block text-xs text-slate-400">Joined {formatDate(resident.created_at)}</span>
              </td>
              <td className={`${cell} text-right`}>
                <Link
                  href={`/superadmin/residents/${resident.id}`}
                  className="inline-flex items-center gap-1 text-xs font-bold text-brand-700 hover:text-brand-900"
                >
                  Manage <ArrowRight size={14} />
                </Link>
              </td>
            </tr>
          ))}
        </Table>
      </Panel>
    </div>
  );
}
