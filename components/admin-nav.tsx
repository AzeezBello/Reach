"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Building2,
  ClipboardList,
  LayoutDashboard,
  Landmark,
  MapPinned,
  MessageCircle,
  UserRound,
  Users,
  ShieldCheck,
  Workflow,
} from "lucide-react";

const LINKS = [
  { href: "/superadmin", label: "Overview", icon: LayoutDashboard, exact: true },
  { href: "/superadmin/organizations", label: "Organizations", icon: Landmark },
  { href: "/superadmin/jurisdictions", label: "Jurisdictions", icon: MapPinned },
  { href: "/superadmin/offices", label: "Offices", icon: Building2 },
  { href: "/superadmin/staff", label: "Staff", icon: Users },
  { href: "/superadmin/leaders", label: "Leaders", icon: UserRound },
  { href: "/superadmin/requests", label: "Requests", icon: ClipboardList },
  { href: "/superadmin/members", label: "Staff & Roles", icon: Users },
  { href: "/superadmin/routing", label: "Request Routing", icon: Workflow },
  { href: "/superadmin/whatsapp", label: "WhatsApp", icon: MessageCircle },
  { href: "/superadmin/leader-accounts", label: "Leader Accounts", icon: ShieldCheck },
];

/** Sidebar on large screens, horizontal scrolling tabs on small ones. */
export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav aria-label="Platform administration" className="min-w-0 lg:sticky lg:top-24 lg:self-start">
      <ul className="-mx-4 flex gap-1 overflow-x-auto px-4 pb-2 lg:mx-0 lg:flex-col lg:overflow-visible lg:rounded-xl lg:border lg:border-slate-200 lg:bg-white lg:p-2">
        {LINKS.map((link) => {
          const active = pathname === link.href || (!link.exact && pathname.startsWith(`${link.href}/`));
          const Icon = link.icon;

          return (
            <li key={link.href} className="shrink-0">
              <Link
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={`flex min-h-11 items-center gap-2.5 rounded-lg px-3.5 py-2.5 text-sm font-bold whitespace-nowrap transition ${
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
