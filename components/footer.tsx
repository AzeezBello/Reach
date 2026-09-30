import Link from "next/link";
import { Mail, MapPin, MessageCircle, Phone } from "lucide-react";

import { Container } from "@/components/ui";
import { PLATFORM_NAME } from "@/lib/config";
import { brand } from "@/lib/media";
import { NAV_LINKS } from "@/lib/navigation";
import type { Jurisdiction, Tenant } from "@/lib/types";

export function Footer({
  tenant,
  jurisdiction,
}: {
  tenant: Pick<Tenant, "name" | "description" | "whatsapp_number" | "email" | "phone" | "website">;
  jurisdiction: Jurisdiction | null;
}) {
  const year = new Date().getFullYear();

  const contacts = [
    tenant.whatsapp_number && {
      icon: <MessageCircle size={16} />,
      label: "WhatsApp",
      value: tenant.whatsapp_number,
      href: `https://wa.me/${tenant.whatsapp_number.replace(/\D/g, "")}`,
    },
    tenant.email && {
      icon: <Mail size={16} />,
      label: "Email",
      value: tenant.email,
      href: `mailto:${tenant.email}`,
    },
    tenant.phone && {
      icon: <Phone size={16} />,
      label: "Phone",
      value: tenant.phone,
      href: `tel:${tenant.phone}`,
    },
  ].filter(Boolean) as {
    icon: React.ReactNode;
    label: string;
    value: string;
    href: string;
  }[];

  return (
    <footer className="bg-ink text-slate-300">
      <Container className="py-14 md:py-16">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr] lg:gap-16">
          <div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={brand.logoWhite}
              alt={`${tenant.name} logo`}
              width={340}
              height={64}
              className="h-10 w-auto"
            />

            <p className="mt-5 max-w-md text-sm leading-7">
              {tenant.description ||
                "A digital constituency office connecting residents with programmes, opportunities, projects and service requests."}
            </p>

            {jurisdiction && (
              <p className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-white">
                <MapPin size={16} className="text-brand-400" />
                {jurisdiction.name}
                {jurisdiction.state ? `, ${jurisdiction.state}` : ""}
              </p>
            )}
          </div>

          <div>
            <h2 className="text-xs font-extrabold uppercase tracking-[0.2em] text-brand-400">
              Explore
            </h2>

            <ul className="mt-4 space-y-3 text-sm">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="transition hover:text-white"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link href="/requests/new" className="transition hover:text-white">
                  Request assistance
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h2 className="text-xs font-extrabold uppercase tracking-[0.2em] text-brand-400">
              Contact the office
            </h2>

            {contacts.length > 0 ? (
              <ul className="mt-4 space-y-3 text-sm">
                {contacts.map((contact) => (
                  <li key={contact.label}>
                    <a
                      href={contact.href}
                      className="inline-flex items-center gap-2 transition hover:text-white"
                    >
                      <span className="text-brand-400">{contact.icon}</span>
                      {contact.value}
                    </a>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-4 text-sm leading-6">
                Submit a request through {PLATFORM_NAME} and the office will
                follow up using your account details.
              </p>
            )}

            <Link
              href="/login"
              className="mt-5 inline-flex text-sm font-bold text-white underline-offset-4 hover:underline"
            >
              Resident sign in
            </Link>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-white/10 pt-6 text-xs sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {year} {tenant.name}. All rights reserved.
          </p>
          <p>
            Powered by{" "}
            <span className="font-extrabold text-white">{PLATFORM_NAME}</span>{" "}
            · Residents Engagement, Access, Communication &amp; Help
          </p>
        </div>
      </Container>
    </footer>
  );
}
