import type { Metadata } from "next";
import Link from "next/link";

import { ActionForm } from "@/components/action-form";
import {
  ActiveBadge,
  AdminHeader,
  Field,
  Panel,
  SelectField,
  Table,
  TextareaField,
  cell,
  labelOptions,
} from "@/components/admin";

import {
  getAdminContent,
  getAdminLeaders,
  getContentLinks,
  getOrganizations,
  requireSuperadmin,
} from "@/lib/admin";

import {
  createLeader,
  linkContentToLeader,
  setLeaderActive,
  updateLeaderProfile,
  unlinkContentFromLeader,
} from "../actions";

export const metadata: Metadata = {
  title: "Leadership",
};

export default async function LeadersPage({
  searchParams,
}: {
  searchParams: Promise<{ edit?: string }>;
}) {
  await requireSuperadmin();
  const { edit } = await searchParams;

  const [leaders, content, links, organizations] = await Promise.all([
    getAdminLeaders(),
    getAdminContent(),
    getContentLinks(),
    getOrganizations(),
  ]);

  const contentMap = new Map(
    content.map((item) => [`${item.type}:${item.id}`, item])
  );

  const leaderMap = new Map(
    leaders.map((leader) => [leader.id, leader])
  );
  const editingLeader = leaders.find((leader) => leader.id === edit) ?? null;
  const profileAction = editingLeader ? updateLeaderProfile : createLeader;

  return (
    <div className="space-y-8">
      <AdminHeader
        eyebrow="Leadership"
        title="Leadership database"
        text="Manage public leadership profiles and connect them to programmes, opportunities, projects and events."
      />

      <Panel
        title="Leadership profiles"
        text={`${leaders.length} profiles in the database`}
      >
        <Table
          head={[
            "Profile",
            "Level",
            "Office",
            "Status",
            "",
          ]}
          rows={leaders.length}
          empty="No leadership profiles yet."
        >
          {leaders.map((leader) => (
            <tr key={leader.id}>
              <td className={cell}>
                <span className="block font-bold text-ink">
                  {leader.name}
                </span>

                <span className="text-xs text-slate-500">
                  {leader.role}
                </span>
              </td>

              <td className={cell}>
                {leader.level_label || leader.level || "—"}
              </td>

              <td className={cell}>
                {leader.office || "—"}
              </td>

              <td className={cell}>
                <ActiveBadge active={leader.is_active !== false} />
              </td>

              <td className={`${cell} text-right`}>
                <div className="flex flex-wrap items-center justify-end gap-2">
                  {leader.id && (
                    <Link
                      href={`/superadmin/leaders?edit=${encodeURIComponent(leader.id)}`}
                      className="inline-flex min-h-10 items-center rounded-lg px-3 text-sm font-bold text-brand-700 hover:bg-brand-50"
                    >
                      Edit
                    </Link>
                  )}
                  <ActionForm
                    action={setLeaderActive}
                    inline
                    variant="outline"
                    submitLabel={leader.is_active !== false ? "Archive" : "Publish"}
                    pendingLabel="…"
                  >
                    <input type="hidden" name="id" value={leader.id ?? ""} />
                    <input
                      type="hidden"
                      name="is_active"
                      value={leader.is_active === false ? "true" : "false"}
                    />
                  </ActionForm>
                </div>
              </td>
            </tr>
          ))}
        </Table>
      </Panel>

      <Panel
        title={editingLeader ? `Edit ${editingLeader.name}` : "Add a leader"}
        text="Keep current office, constituency, biography and public sources up to date after elections. Archived profiles stay in the database."
      >
        <ActionForm
          action={profileAction}
          submitLabel={editingLeader ? "Save profile" : "Create profile"}
          resetOnSuccess={!editingLeader}
        >
          {editingLeader && <input type="hidden" name="id" value={editingLeader.id ?? ""} />}
          <div className="grid gap-5 sm:grid-cols-2">
            <SelectField
              label="Organization"
              name="organization_id"
              required
              defaultValue={editingLeader?.organization_id}
              placeholder="Select organization"
              options={organizations.map((org) => ({
                value: org.id,
                label: org.name,
              }))}
            />

            <Field
              label="Full name"
              name="name"
              required
              defaultValue={editingLeader?.name}
            />

            <Field
              label="Slug"
              name="slug"
              defaultValue={editingLeader?.slug}
              placeholder="Generated from name if blank"
              hint="Changing the slug changes the public profile URL."
            />

            <Field
              label="Role"
              name="role"
              required
              defaultValue={editingLeader?.role}
            />

            <SelectField
              label="Level"
              name="level"
              required
              defaultValue={editingLeader?.level}
              options={labelOptions([
                "federal",
                "state",
                "local",
              ])}
            />

            <Field
              label="Level label"
              name="level_label"
              defaultValue={editingLeader?.level_label}
              placeholder="Federal Government"
            />

            <Field
              label="Office"
              name="office"
              defaultValue={editingLeader?.office}
            />

            <Field
              label="Jurisdiction"
              name="jurisdiction"
              defaultValue={editingLeader?.jurisdiction}
            />

            <Field
              label="Constituency"
              name="constituency"
              defaultValue={editingLeader?.constituency}
            />

            <Field
              label="Image URL"
              name="image_url"
              defaultValue={editingLeader?.image_url}
              placeholder="/leaders/person.jpg"
            />

            <Field
              label="Sort order"
              name="sort_order"
              type="number"
              defaultValue={String(editingLeader?.sort_order ?? 0)}
            />
          </div>

          <div className="mt-5 space-y-5">
            <TextareaField
              label="Summary"
              name="summary"
              defaultValue={editingLeader?.summary}
              rows={3}
            />

            <TextareaField
              label="Biography"
              name="biography"
              defaultValue={editingLeader?.biography.join("\n")}
              rows={5}
              hint="One paragraph per line."
            />

            <TextareaField
              label="Public service"
              name="service"
              defaultValue={editingLeader?.service.join("\n")}
              rows={5}
              hint="One service item per line."
            />

            <TextareaField
              label="Sources"
              name="sources"
              defaultValue={editingLeader?.sources.map((source) => `${source.label} | ${source.url}`).join("\n")}
              rows={5}
              hint='One per line: Label | https://official-source.example'
            />

            <label className="flex items-center gap-3 text-sm font-bold text-ink">
              <input
                type="checkbox"
                name="is_active"
                value="on"
                defaultChecked={editingLeader ? editingLeader.is_active !== false : true}
                className="size-4 rounded border-slate-300 accent-brand-600"
              />

              Publish profile
            </label>
          </div>
          {editingLeader && (
            <Link
              href="/superadmin/leaders"
              className="inline-flex min-h-10 items-center text-sm font-bold text-slate-600 hover:text-ink"
            >
              Cancel editing
            </Link>
          )}
        </ActionForm>
      </Panel>

      <Panel
        title="Link leader to content"
        text="Attach a leader as the lead or a collaboration partner."
      >
        <ActionForm
          action={linkContentToLeader}
          submitLabel="Save collaboration"
        >
          <div className="grid gap-5 sm:grid-cols-2">
            <SelectField
              label="Leader"
              name="leader_id"
              required
              placeholder="Select leader"
              options={leaders
                .filter((leader) => leader.id)
                .map((leader) => ({
                  value: leader.id!,
                  label: leader.name,
                }))}
            />

            <SelectField
              label="Content"
              name="content"
              required
              placeholder="Select content"
              options={content.map((item) => ({
                value: `${item.type}:${item.id}`,
                label: `${item.type.toUpperCase()} — ${item.title}`,
              }))}
            />

            <SelectField
              label="Relationship"
              name="role"
              required
              options={labelOptions([
                "lead",
                "partner",
              ])}
            />
          </div>
        </ActionForm>
      </Panel>

      <Panel
        title="Current collaborations"
        text={`${links.length} leader/content links`}
      >
        <Table
          head={[
            "Leader",
            "Content",
            "Relationship",
            "",
          ]}
          rows={links.length}
          empty="No collaborations have been created yet."
        >
          {links.map((link) => {
            const leader = leaderMap.get(link.leader_id);

            const item = contentMap.get(
              `${link.content_type}:${link.content_id}`
            );

            return (
              <tr
                key={`${link.content_type}:${link.content_id}:${link.leader_id}`}
              >
                <td className={cell}>
                  {leader?.name || "Unknown leader"}
                </td>

                <td className={cell}>
                  {item?.title || "Unknown content"}
                </td>

                <td className={cell}>
                  {link.role === "lead"
                    ? "Lead"
                    : "Partner"}
                </td>

                <td className={`${cell} text-right`}>
                  <ActionForm
                    action={unlinkContentFromLeader}
                    inline
                    variant="outline"
                    submitLabel="Remove"
                    pendingLabel="…"
                  >
                    <input
                      type="hidden"
                      name="content_type"
                      value={link.content_type}
                    />

                    <input
                      type="hidden"
                      name="content_id"
                      value={link.content_id}
                    />

                    <input
                      type="hidden"
                      name="leader_id"
                      value={link.leader_id}
                    />
                  </ActionForm>
                </td>
              </tr>
            );
          })}
        </Table>
      </Panel>
    </div>
  );
}