"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Building2,
  CalendarDays,
  ClipboardList,
  FileText,
  LayoutDashboard,
  Landmark,
  MapPinned,
  MessageCircle,
  ShieldCheck,
  UserRound,
  Users,
  Workflow,
} from "lucide-react";

const GROUPS = [
  {
    title: "Platform",
    links: [{ href: "/superadmin", label: "Overview", icon: LayoutDashboard, exact: true }],
  },
  {
    title: "Content",
    links: [
      { href: "/superadmin/content", label: "Content", icon: FileText },
      { href: "/superadmin/events", label: "Events", icon: CalendarDays },
      { href: "/superadmin/leaders", label: "Leaders", icon: UserRound },
      { href: "/superadmin/leader-accounts", label: "Leader accounts", icon: ShieldCheck },
    ],
  },
  {
    title: "People",
    links: [
      { href: "/superadmin/residents", label: "Residents", icon: UserRound },
      { href: "/superadmin/members", label: "Organization members", icon: Users },
      { href: "/superadmin/staff", label: "Office staff", icon: Users },
    ],
  },
  {
    title: "Organization",
    links: [
      { href: "/superadmin/organizations", label: "Organizations", icon: Landmark },
      { href: "/superadmin/jurisdictions", label: "Jurisdictions", icon: MapPinned },
      { href: "/superadmin/offices", label: "Offices", icon: Building2 },
    ],
  },
  {
    title: "Service desk",
    links: [
      { href: "/superadmin/requests", label: "Requests", icon: ClipboardList },
      { href: "/superadmin/routing", label: "Request routing", icon: Workflow },
      { href: "/superadmin/whatsapp", label: "WhatsApp", icon: MessageCircle },
    ],
  },
];

/** Grouped sidebar on large screens, one scrolling row on small ones. */
export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav aria-label="Platform administration" className="min-w-0 lg:sticky lg:top-24 lg:self-start">
      <div className="-mx-4 flex gap-1 overflow-x-auto px-4 pb-2 lg:mx-0 lg:flex-col lg:gap-4 lg:overflow-visible lg:rounded-2xl lg:border lg:border-slate-200 lg:bg-white lg:p-3">
        {GROUPS.map((group) => (
          <div key={group.title} className="flex shrink-0 gap-1 lg:block">
            <p className="hidden px-3 pb-1 text-[10px] font-extrabold uppercase tracking-[0.2em] text-slate-400 lg:block">
              {group.title}
            </p>
            <ul className="flex gap-1 lg:flex-col">
              {group.links.map((link) => {
                const active =
                  "exact" in link && link.exact
                    ? pathname === link.href
                    : pathname === link.href || pathname.startsWith(`${link.href}/`);
                const Icon = link.icon;

                return (
                  <li key={link.href} className="shrink-0">
                    <Link
                      href={link.href}
                      aria-current={active ? "page" : undefined}
                      className={`flex min-h-10 items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-bold whitespace-nowrap transition ${
                        active
                          ? "bg-ink text-white"
                          : "text-slate-600 hover:bg-slate-100 hover:text-ink lg:hover:bg-slate-50"
                      }`}
                    >
                      <Icon size={17} className={active ? "text-brand-400" : "text-brand-700"} />
                      {link.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
    </nav>
  );
}
