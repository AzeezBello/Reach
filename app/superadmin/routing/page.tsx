import type { Metadata } from "next";

import {
  ActiveBadge,
  AdminHeader,
  Field,
  Panel,
  SelectField,
  Table,
  cell,
  labelOptions,
} from "@/components/admin";

import { ActionForm } from "@/components/action-form";

import {
  getJurisdictions,
  getOffices,
  getOrganizations,
  getServiceRoutes,
  requireSuperadmin,
} from "@/lib/admin";

import {
  createServiceRoute,
  setServiceRouteActive,
} from "../actions";

export const metadata: Metadata = {
  title: "Request Routing",
};

const CATEGORIES = [
  "general",
  "education",
  "employment",
  "health",
  "housing",
  "infrastructure",
  "business",
  "social_support",
  "documentation",
  "community",
];

export default async function RoutingPage() {
  await requireSuperadmin();

  const [
    routes,
    organizations,
    offices,
    jurisdictions,
  ] = await Promise.all([
    getServiceRoutes(),
    getOrganizations(),
    getOffices(),
    getJurisdictions(),
  ]);

  const organizationMap =
    new Map(
      organizations.map(
        (item) => [item.id, item.name]
      )
    );

  const officeMap =
    new Map(
      offices.map(
        (item) => [item.id, item.name]
      )
    );

  const jurisdictionMap =
    new Map(
      jurisdictions.map(
        (item) => [item.id, item.name]
      )
    );

  return (
    <div className="space-y-8">
      <AdminHeader
        eyebrow="Service delivery"
        title="Request routing"
        text="Configure which office should handle resident requests."
      />

      <Panel
        title="Create routing rule"
        text="More specific jurisdiction/category rules take precedence over general rules."
      >
        <ActionForm
          action={createServiceRoute}
          submitLabel="Create routing rule"
        >
          <div className="grid gap-5 sm:grid-cols-2">
            <SelectField
              label="Organization"
              name="organization_id"
              required
              placeholder="Select organization"
              options={organizations.map(
                (item) => ({
                  value: item.id,
                  label: item.name,
                })
              )}
            />

            <SelectField
              label="Office"
              name="office_id"
              required
              placeholder="Select office"
              options={offices.map(
                (item) => ({
                  value: item.id,
                  label: item.name,
                })
              )}
            />

            <SelectField
              label="Jurisdiction"
              name="jurisdiction_id"
              placeholder="Any jurisdiction"
              options={jurisdictions.map(
                (item) => ({
                  value: item.id,
                  label: item.name,
                })
              )}
            />

            <SelectField
              label="Service category"
              name="category"
              placeholder="Any category"
              options={CATEGORIES.map(
                (category) => ({
                  value: category,
                  label: category
                    .replaceAll("_", " ")
                    .replace(/\b\w/g, (char) =>
                      char.toUpperCase()
                    ),
                })
              )}
            />

            <Field
              label="Priority"
              name="priority"
              type="number"
              defaultValue="100"
              hint="Lower numbers are processed first."
            />
          </div>

          <div className="mt-5">
            <label className="flex items-center gap-3 text-sm font-bold text-ink">
              <input
                type="checkbox"
                name="is_active"
                value="on"
                defaultChecked
                className="size-4 rounded border-slate-300 accent-brand-600"
              />
              Active routing rule
            </label>
          </div>
        </ActionForm>
      </Panel>

      <Panel
        title="Routing rules"
        text={`${routes.length} configured rules`}
      >
        <Table
          head={[
            "Organization",
            "Jurisdiction",
            "Category",
            "Office",
            "Priority",
            "Status",
            "",
          ]}
          rows={routes.length}
          empty="No routing rules configured."
        >
          {routes.map((route) => (
            <tr key={route.id}>
              <td className={cell}>
                {
                  organizationMap.get(
                    route.organization_id
                  )
                }
              </td>

              <td className={cell}>
                {route.jurisdiction_id
                  ? jurisdictionMap.get(
                      route.jurisdiction_id
                    )
                  : "Any"}
              </td>

              <td className={cell}>
                {route.category ||
                  "Any service"}
              </td>

              <td className={cell}>
                {officeMap.get(
                  route.office_id
                ) || "—"}
              </td>

              <td className={cell}>
                {route.priority}
              </td>

              <td className={cell}>
                <ActiveBadge
                  active={route.is_active}
                />
              </td>

              <td
                className={`${cell} text-right`}
              >
                <ActionForm
                  action={
                    setServiceRouteActive
                  }
                  inline
                  variant="outline"
                  submitLabel={
                    route.is_active
                      ? "Disable"
                      : "Enable"
                  }
                  pendingLabel="…"
                >
                  <input
                    type="hidden"
                    name="id"
                    value={route.id}
                  />

                  <input
                    type="hidden"
                    name="is_active"
                    value={
                      route.is_active
                        ? "false"
                        : "true"
                    }
                  />
                </ActionForm>
              </td>
            </tr>
          ))}
        </Table>
      </Panel>
    </div>
  );
}