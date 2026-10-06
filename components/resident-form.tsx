import { Field, Panel, SelectField, TextareaField } from "@/components/admin";
import { humanize } from "@/lib/format";
import { LIMITED_ROLES, RESIDENT_ROLES, type ResidentAccount } from "@/lib/residents";
import type { JurisdictionRecord } from "@/lib/types";

/**
 * Profile fields shared by the create and edit pages. The role list is
 * narrowed for admins who are not superadmins.
 */
export function ResidentFields({
  resident,
  jurisdictions,
  actorRole,
  isSelf = false,
}: {
  resident: ResidentAccount | null;
  jurisdictions: JurisdictionRecord[];
  actorRole: string;
  isSelf?: boolean;
}) {
  const roles = actorRole === "superadmin" ? RESIDENT_ROLES : LIMITED_ROLES;
  const currentRole = resident?.role ?? "resident";
  const roleOptions = [...new Set([...roles, currentRole])].map((value) => ({
    value,
    label: humanize(value),
  }));

  return (
    <>
      <Panel title="Resident" text="Contact details the office uses to follow up.">
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Full name" name="full_name" required autoComplete="off" defaultValue={resident?.full_name ?? ""} />
          <Field
            label="Email"
            name="email"
            type="email"
            required
            autoComplete="off"
            defaultValue={resident?.email ?? ""}
            hint={resident ? "Changing the email updates the sign-in email as well." : undefined}
          />
          <Field label="Phone" name="phone" type="tel" autoComplete="off" defaultValue={resident?.phone ?? ""} placeholder="e.g. 0801 234 5678" />
          <SelectField
            label="Role"
            name="role"
            required
            defaultValue={currentRole}
            options={roleOptions}
            hint={
              isSelf
                ? "You cannot change your own role."
                : actorRole === "superadmin"
                  ? "Admin and superadmin roles open the platform console."
                  : "Only a superadmin can grant admin or superadmin access."
            }
          />
        </div>
      </Panel>

      <Panel title="Home" text="Requests are routed to the office that serves the resident's area.">
        <div className="grid gap-5">
          <SelectField
            label="Home area"
            name="jurisdiction_id"
            defaultValue={resident?.jurisdiction_id ?? ""}
            placeholder="Not set"
            options={jurisdictions.map((j) => ({
              value: j.id,
              label: `${j.name}${j.type ? ` · ${humanize(j.type)}` : ""}`,
            }))}
          />
          <TextareaField label="Residential address" name="address" rows={2} defaultValue={resident?.address ?? ""} />
        </div>
      </Panel>
    </>
  );
}
