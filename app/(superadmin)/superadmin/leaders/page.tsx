import type { Metadata } from "next";

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
  unlinkContentFromLeader,
} from "../actions";

export const metadata: Metadata = {
  title: "Leadership",
};

export default async function LeadersPage() {
  await requireSuperadmin();

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
                <ActionForm
                  action={setLeaderActive}
                  inline
                  variant="outline"
                  submitLabel={
                    leader.is_active !== false
                      ? "Hide"
                      : "Publish"
                  }
                  pendingLabel="…"
                >
                  <input
                    type="hidden"
                    name="id"
                    value={leader.id ?? ""}
                  />

                  <input
                    type="hidden"
                    name="is_active"
                    value={
                      leader.is_active === false
                        ? "true"
                        : "false"
                    }
                  />
                </ActionForm>
              </td>
            </tr>
          ))}
        </Table>
      </Panel>

      <Panel
        title="Create leadership profile"
        text="Use neutral, source-backed descriptions and official public references."
      >
        <ActionForm
          action={createLeader}
          submitLabel="Create profile"
          resetOnSuccess
        >
          <div className="grid gap-5 sm:grid-cols-2">
            <SelectField
              label="Organization"
              name="organization_id"
              required
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
            />

            <Field
              label="Slug"
              name="slug"
              placeholder="Generated from name if blank"
            />

            <Field
              label="Role"
              name="role"
              required
            />

            <SelectField
              label="Level"
              name="level"
              required
              options={labelOptions([
                "federal",
                "state",
                "local",
              ])}
            />

            <Field
              label="Level label"
              name="level_label"
              placeholder="Federal Government"
            />

            <Field
              label="Office"
              name="office"
            />

            <Field
              label="Jurisdiction"
              name="jurisdiction"
            />

            <Field
              label="Constituency"
              name="constituency"
            />

            <Field
              label="Image URL"
              name="image_url"
              placeholder="/leaders/person.jpg"
            />

            <Field
              label="Sort order"
              name="sort_order"
              type="number"
              defaultValue="0"
            />
          </div>

          <div className="mt-5 space-y-5">
            <TextareaField
              label="Summary"
              name="summary"
              rows={3}
            />

            <TextareaField
              label="Biography"
              name="biography"
              rows={5}
              hint="One paragraph per line."
            />

            <TextareaField
              label="Public service"
              name="service"
              rows={5}
              hint="One service item per line."
            />

            <TextareaField
              label="Sources"
              name="sources"
              rows={5}
              hint='One per line: Label | https://official-source.example'
            />

            <label className="flex items-center gap-3 text-sm font-bold text-ink">
              <input
                type="checkbox"
                name="is_active"
                value="on"
                defaultChecked
                className="size-4 rounded border-slate-300 accent-brand-600"
              />

              Publish profile
            </label>
          </div>
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