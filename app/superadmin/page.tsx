import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  Building2,
  ClipboardList,
  FolderKanban,
  GraduationCap,
  Landmark,
  MapPinned,
  Sparkles,
  Users,
} from "lucide-react";

import {
  ActiveBadge,
  AdminHeader,
  Panel,
  StatCard,
  StatusBadge,
  Table,
  cell,
} from "@/components/admin";
import { ButtonLink, TextLink } from "@/components/ui";
import {
  getAllRequests,
  getOrganizations,
  getPlatformStats,
  requireSuperadmin,
} from "@/lib/admin";
import { formatDate } from "@/lib/format";

export const metadata: Metadata = { title: "Overview" };

export default async function SuperadminOverviewPage() {
  const { profile, user } = await requireSuperadmin();

  const [stats, organizations, requests] = await Promise.all([
    getPlatformStats(),
    getOrganizations(),
    getAllRequests(8),
  ]);

  const organizationNames = new Map(organizations.map((org) => [org.id, org.name]));

  return (
    <div className="space-y-8">
      <AdminHeader
        eyebrow="Overview"
        title={`Welcome, ${profile?.full_name || user.email}`}
        text="Platform-wide view of every organization, jurisdiction, office and resident request."
        action={<ButtonLink href="/superadmin/organizations" arrow>Manage organizations</ButtonLink>}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={<Landmark size={20} />} label="Organizations" value={stats.organizations} />
        <StatCard icon={<MapPinned size={20} />} label="Jurisdictions" value={stats.jurisdictions} />
        <StatCard icon={<Building2 size={20} />} label="Offices" value={stats.offices} />
        <StatCard icon={<Users size={20} />} label="Resident profiles" value={stats.profiles} />
        <StatCard icon={<GraduationCap size={20} />} label="Programmes" value={stats.programmes} />
        <StatCard icon={<Sparkles size={20} />} label="Opportunities" value={stats.opportunities} />
        <StatCard icon={<FolderKanban size={20} />} label="Projects" value={stats.projects} />
        <StatCard icon={<ClipboardList size={20} />} label="Requests" value={stats.requests} />
      </div>

      <Panel
        title="Organizations"
        text="Every tenant running on the platform."
        action={<TextLink href="/superadmin/organizations">Manage</TextLink>}
      >
        <Table
          head={["Organization", "Slug", "Status", "Created", ""]}
          rows={organizations.length}
          empty="No organizations yet."
        >
          {organizations.map((org) => (
            <tr key={org.id}>
              <td className={`${cell} font-bold text-ink`}>{org.name}</td>
              <td className={`${cell} font-mono text-xs`}>{org.slug}</td>
              <td className={cell}><ActiveBadge active={org.is_active} /></td>
              <td className={cell}>{formatDate(org.created_at)}</td>
              <td className={`${cell} text-right`}>
                <Link
                  href={`/superadmin/organizations/${org.id}`}
                  className="inline-flex items-center gap-1 text-xs font-bold text-brand-700 hover:text-brand-900"
                >
                  Edit <ArrowRight size={14} />
                </Link>
              </td>
            </tr>
          ))}
        </Table>
      </Panel>

      <Panel
        title="Latest requests"
        text="Most recent resident requests across all organizations."
        action={<TextLink href="/superadmin/requests">All requests</TextLink>}
      >
        <Table
          head={["Reference", "Subject", "Organization", "Status", "Submitted"]}
          rows={requests.length}
          empty="No requests have been submitted yet, or your role cannot read them."
        >
          {requests.map((request) => (
            <tr key={request.id}>
              <td className={`${cell} font-mono text-xs`}>{request.reference_no ?? "—"}</td>
              <td className={cell}>
                <span className="block font-bold text-ink">{request.subject}</span>
                <span className="text-xs text-slate-500">{request.category}</span>
              </td>
              <td className={cell}>{organizationNames.get(request.organization_id) ?? "—"}</td>
              <td className={cell}><StatusBadge status={request.status} fallback="Submitted" /></td>
              <td className={cell}>{formatDate(request.created_at)}</td>
            </tr>
          ))}
        </Table>
      </Panel>
    </div>
  );
}
