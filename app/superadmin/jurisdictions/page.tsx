import type { Metadata } from "next";

import { ActionForm } from "@/components/action-form";
import {
  AdminHeader,
  Field,
  Panel,
  SelectField,
  Table,
  cell,
  labelOptions,
} from "@/components/admin";
import { Badge } from "@/components/ui";
import {
  JURISDICTION_TYPES,
  getJurisdictions,
  requireSuperadmin,
} from "@/lib/admin";
import { humanize } from "@/lib/format";

import { createJurisdiction } from "../actions";

export const metadata: Metadata = { title: "Jurisdictions" };

export default async function JurisdictionsPage() {
  await requireSuperadmin();
  const jurisdictions = await getJurisdictions();

  const names = new Map(jurisdictions.map((j) => [j.id, j.name]));

  return (
    <div className="space-y-8">
      <AdminHeader
        eyebrow="Geography"
        title="Jurisdictions"
        text="States, constituencies, local government areas, wards and communities that offices serve. Jurisdictions can nest under a parent."
      />

      <Panel title="All jurisdictions" text={`${jurisdictions.length} defined`}>
        <Table
          head={["Name", "Type", "State", "LGA / LCDA", "Ward", "Parent"]}
          rows={jurisdictions.length}
          empty="No jurisdictions yet. Create one below."
        >
          {jurisdictions.map((j) => (
            <tr key={j.id}>
              <td className={cell}>
                <span className="block font-bold text-ink">{j.name}</span>
                <span className="font-mono text-xs text-slate-500">{j.slug}</span>
              </td>
              <td className={cell}><Badge tone="slate">{humanize(j.type, "—")}</Badge></td>
              <td className={cell}>{j.state ?? "—"}</td>
              <td className={cell}>{[j.lga, j.lcda].filter(Boolean).join(" / ") || "—"}</td>
              <td className={cell}>{j.ward ?? "—"}</td>
              <td className={cell}>{j.parent_id ? names.get(j.parent_id) ?? "—" : "—"}</td>
            </tr>
          ))}
        </Table>
      </Panel>

      <Panel title="Create a jurisdiction">
        <ActionForm action={createJurisdiction} submitLabel="Create jurisdiction" resetOnSuccess>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Name" name="name" required placeholder="e.g. Surulere II Federal Constituency" />
            <Field label="Slug" name="slug" placeholder="Generated from the name if left empty" />
            <SelectField
              label="Type"
              name="type"
              required
              options={labelOptions(JURISDICTION_TYPES)}
              placeholder="Select a type"
            />
            <SelectField
              label="Parent jurisdiction"
              name="parent_id"
              options={jurisdictions.map((j) => ({ value: j.id, label: j.name }))}
              placeholder="None"
              hint="For example a ward's parent is its LGA or LCDA."
            />
            <Field label="State" name="state" placeholder="Lagos" />
            <Field label="LGA" name="lga" placeholder="Surulere" />
            <Field label="LCDA" name="lcda" placeholder="Itire-Ikate" />
            <Field label="Ward" name="ward" />
          </div>
        </ActionForm>
      </Panel>
    </div>
  );
}
