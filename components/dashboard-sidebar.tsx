"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  Bell,
  ClipboardList,
  LayoutDashboard,
  LogOut,
} from "lucide-react";

const LINKS = [
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    exact: true,
  },

  {
    href: "/dashboard/requests",
    label: "My Requests",
    icon: ClipboardList,
  },
  {
    href: "/dashboard/notifications",
    label: "Notifications",
    icon: Bell,
  },
];

function isActive(
  pathname: string,
  href: string,
  exact?: boolean,
) {
  if (exact) {
    return pathname === href;
  }

  return (
    pathname === href ||
    pathname.startsWith(`${href}/`)
  );
}

export function DashboardSidebar() {
  const pathname = usePathname();

  return (
    <div className="flex h-dvh flex-col">

      {/* Brand */}
      <div className="flex h-20 items-center border-b border-slate-100 px-6">
        <Link
          href="/dashboard"
          className="flex items-center gap-3"
        >
          <div className="flex size-10 items-center justify-center rounded-xl bg-brand-600 text-sm font-black text-white">
            R
          </div>

          <div>
            <p className="text-lg font-black tracking-tight text-ink">
              REACH
            </p>

            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
              Resident Portal
            </p>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav
        aria-label="Dashboard navigation"
        className="flex-1 overflow-y-auto px-4 py-5"
      >
        <p className="mb-3 px-3 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
          Workspace
        </p>

        <ul className="space-y-1">
          {LINKS.map((link) => {
            const Icon = link.icon;

            const active = isActive(
              pathname,
              link.href,
              link.exact,
            );

            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  aria-current={
                    active
                      ? "page"
                      : undefined
                  }
                  className={[
                    "flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-bold transition",
                    active
                      ? "bg-ink text-white shadow-sm"
                      : "text-slate-600 hover:bg-slate-100 hover:text-ink",
                  ].join(" ")}
                >
                  <Icon
                    size={18}
                    className={
                      active
                        ? "text-brand-400"
                        : "text-slate-400"
                    }
                  />

                  <span>
                    {link.label}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Bottom */}
      <div className="border-t border-slate-100 p-4">
        <Link
          href="/"
          className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-bold text-slate-500 transition hover:bg-slate-100 hover:text-ink"
        >
          <LogOut size={18} />
          Back to REACH
        </Link>
      </div>
    </div>
  );
}