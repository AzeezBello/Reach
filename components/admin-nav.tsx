"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Building2,
  ClipboardList,
  LayoutDashboard,
  Landmark,
  MapPinned,
  UserRound,
  Users,
} from "lucide-react";

const LINKS = [
  { href: "/superadmin", label: "Overview", icon: LayoutDashboard, exact: true },
  { href: "/superadmin/organizations", label: "Organizations", icon: Landmark },
  { href: "/superadmin/jurisdictions", label: "Jurisdictions", icon: MapPinned },
  { href: "/superadmin/offices", label: "Offices", icon: Building2 },
  { href: "/superadmin/staff", label: "Staff", icon: Users },
  { href: "/superadmin/leaders", label: "Leaders", icon: UserRound },
  { href: "/superadmin/requests", label: "Requests", icon: ClipboardList },
  { href: "/superadmin/leaders", label: "Leadership", icon: UserRound },
  { href: "/superadmin/members", label: "Staff & Roles", icon: Users },
  { href: "/superadmin/routing", label: "Request Routing", icon: ClipboardList },
  { href: "/superadmin/whatsapp", label: "WhatsApp", icon: ClipboardList },
];

/** Sidebar on large screens, horizontal scrolling tabs on small ones. */
export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav aria-label="Console" className="lg:sticky lg:top-24">
      <ul className="-mx-4 flex gap-1 overflow-x-auto px-4 pb-1 lg:mx-0 lg:flex-col lg:overflow-visible lg:px-0">
        {LINKS.map((link) => {
          const active = link.exact
            ? pathname === link.href
            : pathname.startsWith(link.href);
          const Icon = link.icon;

          return (
            <li key={link.href} className="shrink-0">
              <Link
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={`flex items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-sm font-bold whitespace-nowrap transition ${
                  active
                    ? "bg-ink text-white"
                    : "text-slate-600 hover:bg-white hover:text-ink"
                }`}
              >
                <Icon size={17} className={active ? "text-brand-400" : "text-brand-700"} />
                {link.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
