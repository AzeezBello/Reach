import { PLATFORM_NAME, SITE_URL } from "@/lib/config";
import { brand } from "@/lib/media";
import type {
  Event,
  Jurisdiction,
  Leader,
  Programme,
  Tenant,
} from "@/lib/types";

export function absoluteUrl(path: string) {
  return new URL(path, SITE_URL).toString();
}

export function siteTitle(tenant: Pick<Tenant, "name">) {
  return `${PLATFORM_NAME} · Digital Civic Office for ${tenant.name}`;
}

export function siteDescription(
  tenant: Pick<Tenant, "description">,
  jurisdiction: Jurisdiction | null
) {
  return (
    tenant.description ||
    `Programmes, opportunities, community projects and service requests for residents${
      jurisdiction ? ` of ${jurisdiction.name}` : ""
    }, in one digital constituency office.`
  );
}

export type Crumb = { label: string; href: string };

export function breadcrumbSchema(items: Crumb[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.label,
      item: absoluteUrl(item.href),
    })),
  };
}

/** The office as a local government organisation. */
export function organizationSchema(
  tenant: Tenant,
  jurisdiction: Jurisdiction | null
) {
  const contactPoints = [
    tenant.phone && {
      "@type": "ContactPoint",
      contactType: "customer service",
      telephone: tenant.phone,
    },
    tenant.whatsapp_number && {
      "@type": "ContactPoint",
      contactType: "customer service",
      telephone: tenant.whatsapp_number,
      contactOption: "WhatsApp",
    },
    tenant.email && {
      "@type": "ContactPoint",
      contactType: "customer service",
      email: tenant.email,
    },
  ].filter(Boolean);

  return {
    "@context": "https://schema.org",
    "@type": ["GovernmentOffice", "LocalBusiness", "Organization"],
    "@id": absoluteUrl("/#organization"),
    name: tenant.name,
    url: SITE_URL,
    logo: absoluteUrl(brand.logo),
    image: absoluteUrl("/opengraph-image"),
    description: siteDescription(tenant, jurisdiction),
    ...(jurisdiction && {
      areaServed: {
        "@type": "AdministrativeArea",
        name: jurisdiction.name,
      },
      address: {
        "@type": "PostalAddress",
        addressLocality: jurisdiction.lcda || jurisdiction.lga || jurisdiction.name,
        addressRegion: jurisdiction.state || undefined,
        addressCountry: "NG",
      },
    }),
    ...(contactPoints.length > 0 && { contactPoint: contactPoints }),
    ...(tenant.website && { sameAs: [tenant.website] }),
  };
}

export function websiteSchema(tenant: Tenant) {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": absoluteUrl("/#website"),
    name: PLATFORM_NAME,
    alternateName: `${PLATFORM_NAME} · ${tenant.name}`,
    url: SITE_URL,
    publisher: { "@id": absoluteUrl("/#organization") },
    inLanguage: "en-NG",
  };
}

/** Programmes with a start date are published as events. */
export function programmeSchema(
  programme: Programme,
  tenant: Tenant,
  jurisdiction: Jurisdiction | null
) {
  if (!programme.start_date) return null;

  return {
    "@context": "https://schema.org",
    "@type": "Event",
    name: programme.title,
    description: programme.summary || programme.description || undefined,
    url: absoluteUrl(`/programmes/${programme.slug}`),
    startDate: programme.start_date,
    ...(programme.end_date && { endDate: programme.end_date }),
    ...(programme.image_url && { image: absoluteUrl(programme.image_url) }),
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    eventStatus: "https://schema.org/EventScheduled",
    location: {
      "@type": "Place",
      name: programme.location || jurisdiction?.name || tenant.name,
      address: {
        "@type": "PostalAddress",
        addressLocality: programme.location || jurisdiction?.name || undefined,
        addressRegion: jurisdiction?.state || undefined,
        addressCountry: "NG",
      },
    },
    organizer: { "@id": absoluteUrl("/#organization") },
  };
}

export function eventSchema(
  event: Event,
  tenant: Tenant,
  jurisdiction: Jurisdiction | null
) {
  return {
    "@context": "https://schema.org",
    "@type": "Event",
    name: event.title,
    description: event.summary || event.description || undefined,
    url: absoluteUrl(`/events/${event.slug}`),
    startDate: event.starts_at,
    ...(event.ends_at && { endDate: event.ends_at }),
    ...(event.image_url && { image: absoluteUrl(event.image_url) }),
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    eventStatus:
      event.status === "cancelled"
        ? "https://schema.org/EventCancelled"
        : "https://schema.org/EventScheduled",
    isAccessibleForFree: !event.registration_url,
    location: {
      "@type": "Place",
      name: event.venue || event.location || jurisdiction?.name || tenant.name,
      address: {
        "@type": "PostalAddress",
        addressLocality: event.location || jurisdiction?.name || undefined,
        addressRegion: jurisdiction?.state || undefined,
        addressCountry: "NG",
      },
    },
    organizer: { "@id": absoluteUrl("/#organization") },
  };
}

export function personSchema(leader: Leader) {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: leader.name,
    jobTitle: leader.role,
    description: leader.summary,
    url: absoluteUrl(`/leadership/${leader.slug}`),
    affiliation: {
      "@type": "GovernmentOrganization",
      name: leader.office,
    },
    subjectOf: leader.sources.map((source) => ({
      "@type": "WebPage",
      name: source.label,
      url: source.url,
    })),
  };
}
