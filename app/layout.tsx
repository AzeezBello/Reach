import type { Metadata, Viewport } from "next";

import "./globals.css";

import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { JsonLd } from "@/components/json-ld";
import {
  DEFAULT_TENANT_SLUG,
  PLATFORM_NAME,
  SITE_URL,
  getCurrentUser,
  getTenant,
} from "@/lib/reach";
import {
  organizationSchema,
  siteDescription,
  siteTitle,
  websiteSchema,
} from "@/lib/seo";
import type { Jurisdiction, Tenant } from "@/lib/types";

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

/** The shell must render even when the database is unreachable. */
async function safeTenant(): Promise<{
  tenant: Tenant;
  jurisdiction: Jurisdiction | null;
}> {
  try {
    return await getTenant();
  } catch {
    return { tenant: FALLBACK_TENANT, jurisdiction: null };
  }
}

export async function generateMetadata(): Promise<Metadata> {
  const { tenant, jurisdiction } = await safeTenant();

  const title = siteTitle(tenant);
  const description = siteDescription(tenant, jurisdiction);

  return {
    metadataBase: new URL(SITE_URL),
    title: {
      default: title,
      template: `%s · ${tenant.name}`,
    },
    description,
    applicationName: tenant.name,
    generator: PLATFORM_NAME,
    robots: { index: true, follow: true },
    openGraph: {
      type: "website",
      locale: "en_NG",
      siteName: tenant.name,
      title,
      description,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#15803d",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [{ tenant, jurisdiction }, user] = await Promise.all([
    safeTenant(),
    getCurrentUser().catch(() => null),
  ]);

  return (
    <html lang="en" className="h-full">
      <body className="flex min-h-dvh flex-col font-sans">
        {tenant.id && (
          <>
            <JsonLd data={organizationSchema(tenant, jurisdiction)} />
            <JsonLd data={websiteSchema(tenant)} />
          </>
        )}

        <Header
          tenantName={tenant.name}
          logoUrl={tenant.logo_url}
          signedIn={Boolean(user)}
        />

        <main className="flex-1">{children}</main>

        <Footer tenant={tenant} jurisdiction={jurisdiction} />
      </body>
    </html>
  );
}
