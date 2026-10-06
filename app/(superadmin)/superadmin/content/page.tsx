import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Plus } from "lucide-react";

import { ActionForm } from "@/components/action-form";
import { AdminHeader, Panel, StatusBadge, Table, cell } from "@/components/admin";
import { ButtonLink } from "@/components/ui";
import { getOrganizations, requireSuperadmin } from "@/lib/admin";
import {
  CONTENT_KINDS,
  CONTENT_KIND_KEYS,
  isContentKind,
  listContent,
  type ContentKind,
} from "@/lib/content-admin";
import { formatDate, formatDateTime, humanize } from "@/lib/format";

import { setContentStatus } from "./actions";

export const metadata: Metadata = { title: "Content" };

export default async function ContentPage({
  searchParams,
}: {
  searchParams: Promise<{ kind?: string; deleted?: string }>;
}) {
  await requireSuperadmin();

  const { kind: kindParam, deleted } = await searchParams;
  const kind: ContentKind = kindParam && isContentKind(kindParam) ? kindParam : "programme";
  const config = CONTENT_KINDS[kind];

  const [items, organizations] = await Promise.all([listContent(kind), getOrganizations()]);
  const organizationNames = new Map(organizations.map((org) => [org.id, org.name]));

  const published = items.filter((item) => config.publishedStatuses.includes(item.status ?? "")).length;

  return (
    <div className="space-y-8">
      <AdminHeader
        eyebrow="Content"
        title="Content management"
        text="Create, edit, publish and archive everything residents see: programmes, opportunities, projects and events."
        action={
          <ButtonLink href={`/superadmin/content/${kind}/new`}>
            <Plus size={16} /> New {config.label.toLowerCase()}
          </ButtonLink>
        }
      />

      {deleted && (
        <p role="status" className="rounded-2xl border border-brand-200 bg-brand-50 p-4 text-sm font-semibold text-brand-800">
          The item was deleted.
        </p>
      )}

      <nav aria-label="Content types" className="-mx-4 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:px-0">
        {CONTENT_KIND_KEYS.map((key) => {
          const active = key === kind;

          return (
            <Link
              key={key}
              href={`/superadmin/content?kind=${key}`}
              aria-current={active ? "page" : undefined}
              className={`inline-flex min-h-10 shrink-0 items-center rounded-full px-4 text-sm font-bold transition ${
                active ? "bg-ink text-white" : "bg-white text-slate-600 ring-1 ring-slate-200 hover:text-ink"
              }`}
            >
              {CONTENT_KINDS[key].plural}
            </Link>
          );
        })}
      </nav>

      <Panel
        title={config.plural}
        text={`${items.length} total · ${published} visible to residents`}
      >
        <Table
          head={["Title", "Status", "Organization", kind === "event" ? "Starts" : "Updated", ""]}
          rows={items.length}
          empty={`No ${config.plural.toLowerCase()} yet. Create the first one.`}
        >
          {items.map((item) => {
            const isPublished = config.publishedStatuses.includes(item.status ?? "");
            const nextStatus = isPublished ? config.unpublishStatus : config.publishStatus;

            return (
              <tr key={item.id}>
                <td className={cell}>
                  <Link
                    href={`/superadmin/content/${kind}/${item.id}`}
                    className="block font-bold text-ink hover:text-brand-800"
                  >
                    {item.title}
                  </Link>
                  <span className="font-mono text-xs text-slate-500">{item.slug}</span>
                </td>
                <td className={cell}>
                  <StatusBadge status={item.status} fallback="Draft" />
                </td>
                <td className={cell}>{organizationNames.get(item.organization_id) ?? "—"}</td>
                <td className={cell}>
                  {kind === "event"
                    ? formatDateTime(item.starts_at as string)
                    : formatDate(item.updated_at ?? item.created_at)}
                </td>
                <td className={`${cell} text-right`}>
                  <div className="flex flex-wrap items-center justify-end gap-2">
                    {nextStatus && (
                      <ActionForm
                        action={setContentStatus}
                        inline
                        variant={isPublished ? "outline" : "primary"}
                        submitLabel={isPublished ? "Unpublish" : "Publish"}
                        pendingLabel="…"
                      >
                        <input type="hidden" name="kind" value={kind} />
                        <input type="hidden" name="id" value={item.id} />
                        <input type="hidden" name="status" value={nextStatus} />
                      </ActionForm>
                    )}

                    {config.archiveStatus && item.status !== config.archiveStatus && (
                      <ActionForm
                        action={setContentStatus}
                        inline
                        variant="ghost"
                        submitLabel={humanize(config.archiveStatus === "cancelled" ? "cancel" : "archive")}
                        pendingLabel="…"
                      >
                        <input type="hidden" name="kind" value={kind} />
                        <input type="hidden" name="id" value={item.id} />
                        <input type="hidden" name="status" value={config.archiveStatus} />
                      </ActionForm>
                    )}

                    <Link
                      href={`/superadmin/content/${kind}/${item.id}`}
                      className="inline-flex items-center gap-1 text-xs font-bold text-brand-700 hover:text-brand-900"
                    >
                      Edit <ArrowRight size={14} />
                    </Link>
                  </div>
                </td>
              </tr>
            );
          })}
        </Table>
      </Panel>
    </div>
  );
}
