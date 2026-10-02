import type { Metadata } from "next";
import Link from "next/link";
import {
  CalendarDays,
  ClipboardList,
  FolderKanban,
  GraduationCap,
  Sparkles,
} from "lucide-react";

import { AdminHeader, Panel, StatCard } from "@/components/admin";
import { Badge, ButtonLink } from "@/components/ui";
import { humanize } from "@/lib/format";
import { getLeaderContent, requireLeader, type LeaderContent } from "@/lib/leaders";

export const metadata: Metadata = { title: "Overview" };

type Initiative = {
  id: string;
  href: string;
  title: string;
  type: string;
  details: string;
  collaboration: "lead" | "partner";
};

function initiativesFor(content: LeaderContent): Initiative[] {
  return [
    ...content.programmes.map((item) => ({
      id: `programme-${item.id}`,
      href: `/programmes/${item.slug}`,
      title: item.title,
      type: "Programme",
      details: item.category || humanize(item.status, "Programme"),
      collaboration: item.collaboration,
    })),
    ...content.opportunities.map((item) => ({
      id: `opportunity-${item.id}`,
      href: `/opportunities/${item.slug}`,
      title: item.title,
      type: "Opportunity",
      details: item.type ? humanize(item.type) : "Opportunity",
      collaboration: item.collaboration,
    })),
    ...content.projects.map((item) => ({
      id: `project-${item.id}`,
      href: `/projects/${item.slug}`,
      title: item.title,
      type: "Project",
      details: humanize(item.status, "Project"),
      collaboration: item.collaboration,
    })),
    ...content.events.map((item) => ({
      id: `event-${item.id}`,
      href: `/events/${item.slug}`,
      title: item.title,
      type: "Event",
      details: item.category || "Event",
      collaboration: item.collaboration,
    })),
  ];
}

export default async function LeaderDashboardPage() {
  const { user, leaders } = await requireLeader();
  const workspaces = await Promise.all(
    leaders.map(async (leader) => ({
      leader,
      initiatives: initiativesFor(await getLeaderContent(leader.id)),
    })),
  );
  const allInitiatives = workspaces.flatMap((workspace) => workspace.initiatives);
  const countOf = (type: Initiative["type"]) =>
    allInitiatives.filter((initiative) => initiative.type === type).length;

  return (
    <div className="space-y-8">
      <AdminHeader
        eyebrow="Leader workspace"
        title={`Welcome, ${leaders.length === 1 ? leaders[0].name : user.email ?? "Leader"}`}
        text="View the public initiatives associated with your leadership profile."
        action={leaders.length === 1 ? (
          <ButtonLink href={`/leadership/${leaders[0].slug}`} variant="outline" arrow>
            Public profile
          </ButtonLink>
        ) : undefined}
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={<GraduationCap size={20} />} label="Programmes" value={countOf("Programme")} />
        <StatCard icon={<Sparkles size={20} />} label="Opportunities" value={countOf("Opportunity")} />
        <StatCard icon={<FolderKanban size={20} />} label="Projects" value={countOf("Project")} />
        <StatCard icon={<CalendarDays size={20} />} label="Events" value={countOf("Event")} />
      </div>

      {workspaces.map(({ leader, initiatives }) => (
        <section key={leader.id ?? leader.slug} className="space-y-4">
          {leaders.length > 1 && (
            <AdminHeader
              eyebrow={leader.level_label || "Leadership profile"}
              title={leader.name}
              text={[leader.role, leader.office].filter(Boolean).join(" · ")}
              action={<ButtonLink href={`/leadership/${leader.slug}`} variant="outline" arrow>Public profile</ButtonLink>}
            />
          )}

          <Panel
            title={leaders.length === 1 ? "Associated initiatives" : `Initiatives · ${leader.name}`}
            text={leader.summary ?? "Published content linked to this leadership profile."}
          >
            {initiatives.length === 0 ? (
              <p className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-sm text-slate-600">
                No published initiatives are currently linked to this profile.
              </p>
            ) : (
              <ul className="divide-y divide-slate-100">
                {initiatives.map((initiative) => (
                  <li key={initiative.id} className="flex flex-col gap-3 py-4 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0">
                      <Link href={initiative.href} className="font-bold text-ink hover:text-brand-700">
                        {initiative.title}
                      </Link>
                      <p className="mt-1 text-xs text-slate-500">
                        {initiative.type} · {initiative.details}
                      </p>
                    </div>
                    <Badge tone={initiative.collaboration === "lead" ? "brand" : "slate"}>
                      {initiative.collaboration === "lead" ? "Lead" : "Partner"}
                    </Badge>
                  </li>
                ))}
              </ul>
            )}
          </Panel>
        </section>
      ))}

      {allInitiatives.length === 0 && (
        <p className="flex items-center gap-2 text-xs text-slate-500">
          <ClipboardList size={15} aria-hidden="true" />
          Ask an administrator to connect published initiatives to your profile.
        </p>
      )}
    </div>
  );
}