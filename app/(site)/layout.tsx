import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { JsonLd } from "@/components/json-ld";

import {
  DEFAULT_TENANT_SLUG,
  PLATFORM_NAME,
  getCurrentUser,
  getTenant,
} from "@/lib/reach";

import {
  organizationSchema,
  siteDescription,
  websiteSchema,
} from "@/lib/seo";

import type {
  Jurisdiction,
  Tenant,
} from "@/lib/types";

const FALLBACK_TENANT: Tenant = {
  id: "",
  name: PLATFORM_NAME,
  slug: DEFAULT_TENANT_SLUG,
  description: null,
  logo_url: null,
  primary_color: null,
  secondary_color: null,
  whatsapp_number: null,
  email: null,
  phone: null,
  website: null,
};

async function safeTenant(): Promise<{
  tenant: Tenant;
  jurisdiction: Jurisdiction | null;
}> {
  try {
    return await getTenant();
  } catch {
    return {
      tenant: FALLBACK_TENANT,
      jurisdiction: null,
    };
  }
}

export default async function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [
    { tenant, jurisdiction },
    user,
  ] = await Promise.all([
    safeTenant(),
    getCurrentUser().catch(
      () => null,
    ),
  ]);

  return (
    <div className="flex min-h-dvh flex-col">
      {tenant.id && (
        <>
          <JsonLd
            data={organizationSchema(
              tenant,
              jurisdiction,
            )}
          />

          <JsonLd
            data={websiteSchema(tenant)}
          />
        </>
      )}

      <Header
        signedIn={Boolean(user)}
      />

      <main className="flex-1">
        {children}
      </main>

      <Footer
        tenant={tenant}
        jurisdiction={jurisdiction}
      />
    </div>
  );
}