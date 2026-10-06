import type { Metadata } from "next";

import { AdminHeader } from "@/components/admin";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { ResidentForm } from "./resident-form";
import { getJurisdictions, getSuperadminAccess, requireSuperadmin } from "@/lib/admin";

export const metadata: Metadata = { title: "Create resident" };

export default async function NewResidentPage() {
  await requireSuperadmin();

  const [jurisdictions, access] = await Promise.all([getJurisdictions(), getSuperadminAccess()]);

  return (
    <div className="space-y-8">
      <Breadcrumbs
        items={[
          { label: "Console", href: "/superadmin" },
          { label: "Residents", href: "/superadmin/residents" },
          { label: "Create resident", href: "/superadmin/residents/new" },
        ]}
      />

      <AdminHeader
        eyebrow="Residents"
        title="Create a resident account"
        text="Send an invitation so the resident sets their own password, or create the account now with a temporary password you pass on."
      />

      <ResidentForm jurisdictions={jurisdictions} actorRole={access.profile?.role ?? "admin"} />
    </div>
  );
}
