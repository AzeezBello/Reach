import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import { ActionForm } from "@/components/action-form";
import {
  ActiveBadge,
  AdminHeader,
  CheckboxField,
  Field,
  Panel,
  SelectField,
  Table,
  TextareaField,
  cell,
} from "@/components/admin";
import { Badge } from "@/components/ui";
import {
  getAdminContent,
  getAdminLeaders,
  getContentLinks,
  requireSuperadmin,
} from "@/lib/admin";
import { humanize } from "@/lib/format";

import {
  createLeader,
  linkContentToLeader,
  setLeaderActive,
  unlinkContentFromLeader,
} from "../actions";

export const metadata: Metadata = { title: "Leaders" };

export default async function LeadersAdminPage() {
  await requireSuperadmin();

  const [leaders, links, content] = await Promise.all([
    getAdminLeaders(),
    getContentLinks(),
    getAdminContent(),
  ]);

  const leaderNames = new Map(leaders.map((leader) => [leader.id, leader.name]));
  const contentTitles = new Map(
    content.map((item) => [`${item.type}:${item.id}`, item.title])
  );
  const linkCounts = new Map<string, number>();
  for (const link of links) {
    linkCounts.set(link.leader_id, (linkCounts.get(link.leader_id) ?? 0) + 1);
  }

  const contentOptions = content.map((item) => ({
    value: `${item.type}:${item.id}`,
    label: `${humanize(item.type)} · ${item.title}`,
  }));

  return (
    <div className="space-y-8">
      <AdminHeader
        eyebrow="Public leadership"
        title="Leaders"
        text="Leadership profiles shown on the site, and the programmes, opportunities, projects and events each one leads individually or delivers as a joint collaboration."
      />

      {leaders.length === 0 && (
        <p className="rounded-2xl border border-gold-200 bg-gold-100/60 p-4 text-sm leading-6 text-gold-700">
          The leaders table is empty, so the site is showing its built-in
          profiles. Run <code className="font-mono">supabase/seed.sql</code> to load
          the FKL Connect leadership profiles and their collaborations, or create
          profiles below.
        </p>
      )}

      <Panel title="Leadership profiles" text={`${leaders.length} in the database`}>
        <Table
          head={["Leader", "Office", "Initiatives", "Status", ""]}
          rows={leaders.length}
          empty="No leadership profiles in the database yet."
        >
          {leaders.map((leader) => (
            <tr key={leader.id ?? leader.slug}>
              <td className={cell}>
                <span className="block font-bold text-ink">{leader.name}</span>
                <span className="text-xs text-slate-500">{leader.role}</span>
              </td>
              <td className={cell}>
                {leader.office ?? "—"}
                {leader.jurisdiction && (
                  <span className="block text-xs text-slate-500">{leader.jurisdiction}</span>
                )}
              </td>
              <td className={cell}>{linkCounts.get(leader.id ?? "") ?? 0}</td>
              <td className={cell}><ActiveBadge active={leader.is_active ?? true} /></td>
              <td className={`${cell} text-right`}>
                <div className="flex items-center justify-end gap-3">
                  <ActionForm
                    action={setLeaderActive}
                    inline
                    variant="outline"
                    submitLabel={leader.is_active ? "Hide" : "Show"}
                    pendingLabel="…"
                  >
                    <input type="hidden" name="id" value={leader.id ?? ""} />
                    <input type="hidden" name="is_active" value={leader.is_active ? "false" : "true"} />
                  </ActionForm>

                  <Link
                    href={`/leadership/${leader.slug}`}
                    className="inline-flex items-center gap-1 text-xs font-bold text-brand-700 hover:text-brand-900"
                  >
                    View <ArrowUpRight size={14} />
                  </Link>
                </div>
              </td>
            </tr>
          ))}
        </Table>
      </Panel>

      <Panel
        title="Collaborations"
        text="Who leads what. An item with one leader is an individual initiative; an item with several is a joint collaboration."
      >
        <Table
          head={["Content", "Leader", "Role", ""]}
          rows={links.length}
          empty="No collaborations yet. Link a leader to content below."
        >
          {links.map((link) => (
            <tr key={`${link.content_type}-${link.content_id}-${link.leader_id}`}>
              <td className={cell}>
                <span className="block font-bold text-ink">
                  {contentTitles.get(`${link.content_type}:${link.content_id}`) ?? "Unpublished item"}
                </span>
                <span className="text-xs text-slate-500">{humanize(link.content_type)}</span>
              </td>
              <td className={cell}>{leaderNames.get(link.leader_id) ?? "—"}</td>
              <td className={cell}>
                <Badge tone={link.role === "lead" ? "brand" : "gold"}>
                  {link.role === "lead" ? "Lead" : "Partner"}
                </Badge>
              </td>
              <td className={`${cell} text-right`}>
                <ActionForm
                  action={unlinkContentFromLeader}
                  inline
                  variant="outline"
                  submitLabel="Unlink"
                  pendingLabel="…"
                  className="justify-end"
                >
                  <input type="hidden" name="content_type" value={link.content_type} />
                  <input type="hidden" name="content_id" value={link.content_id} />
                  <input type="hidden" name="leader_id" value={link.leader_id} />
                </ActionForm>
              </td>
            </tr>
          ))}
        </Table>

        <div className="mt-6 border-t border-slate-100 pt-6">
          <h3 className="text-sm font-extrabold text-ink">Link content to a leader</h3>

          <ActionForm action={linkContentToLeader} submitLabel="Add collaboration" resetOnSuccess className="mt-4">
            <div className="grid gap-5 sm:grid-cols-3">
              <SelectField
                label="Leader"
                name="leader_id"
                required
                options={leaders.map((leader) => ({ value: leader.id ?? "", label: leader.name }))}
                placeholder="Select a leader"
              />
              <SelectField
                label="Content"
                name="content"
                required
                options={contentOptions}
                placeholder="Select a programme, opportunity, project or event"
              />
              <SelectField
                label="Role"
                name="role"
                required
                defaultValue="lead"
                options={[
                  { value: "lead", label: "Lead (individual initiative)" },
                  { value: "partner", label: "Partner (joint collaboration)" },
                ]}
              />
            </div>
          </ActionForm>
        </div>
      </Panel>

      <Panel title="Create a leadership profile">
        <ActionForm action={createLeader} submitLabel="Create profile" resetOnSuccess>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Full name" name="name" required placeholder="e.g. Hon. Adebola Adeyemi" />
            <Field label="Slug" name="slug" placeholder="Generated from the name if left empty" />
            <Field label="Role" name="role" required placeholder="e.g. Member, House of Representatives" />
            <Field label="Office" name="office" placeholder="e.g. Surulere I Federal Constituency" />
            <Field label="Jurisdiction" name="jurisdiction" placeholder="e.g. Lagos State" />
            <Field label="Photo URL" name="image_url" type="url" placeholder="/images/… or https://…" />
            <Field label="Sort order" name="sort_order" type="number" defaultValue="0" hint="Lower numbers appear first." />
          </div>
          <TextareaField label="Summary" name="summary" rows={2} placeholder="One or two sentences shown on cards." />
          <TextareaField label="Biography" name="biography" rows={4} hint="One paragraph per line." />
          <TextareaField label="Public service" name="service" rows={3} hint="One item per line." />
          <TextareaField
            label="Official sources"
            name="sources"
            rows={3}
            placeholder={"National Assembly — Legislator Profile | https://nass.gov.ng/mps/single/588"}
            hint="One per line as: Label | URL"
          />
          <CheckboxField label="Show on the site" name="is_active" defaultChecked />
        </ActionForm>
      </Panel>
    </div>
  );
}
