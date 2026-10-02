"use client";

import Link from "next/link";
import {
  Menu,
  X,
  LayoutDashboard,
  ClipboardList,
  Building2,
  ShieldCheck,
  UserRound,
} from "lucide-react";

import {
  useState,
} from "react";

const LINKS = [
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
  },
  {
    href: "/dashboard/requests",
    label: "My Requests",
    icon: ClipboardList,
  },
  {
    href: "/office",
    label: "Office",
    icon: Building2,
  },
  {
    href: "/superadmin",
    label: "Administration",
    icon: ShieldCheck,
  },
  {
    href: "/superadmin/leaders",
    label: "Leadership",
    icon: UserRound,
  },
];

export function DashboardMobileNav() {
  const [
    open,
    setOpen,
  ] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() =>
          setOpen(true)
        }
        aria-label="Open dashboard navigation"
        className="flex size-10 items-center justify-center rounded-xl text-slate-600 hover:bg-slate-100 lg:hidden"
      >
        <Menu size={21} />
      </button>

      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">

          <button
            type="button"
            aria-label="Close navigation"
            onClick={() =>
              setOpen(false)
            }
            className="absolute inset-0 bg-slate-950/40"
          />

          <aside className="relative flex h-full w-[290px] flex-col bg-white shadow-2xl">

            <div className="flex h-16 items-center justify-between border-b border-slate-100 px-5">

              <Link
                href="/dashboard"
                onClick={() =>
                  setOpen(false)
                }
                className="text-lg font-black text-ink"
              >
                REACH
              </Link>

              <button
                type="button"
                onClick={() =>
                  setOpen(false)
                }
                aria-label="Close navigation"
                className="flex size-9 items-center justify-center rounded-lg hover:bg-slate-100"
              >
                <X size={19} />
              </button>
            </div>

            <nav className="flex-1 overflow-y-auto p-4">
              <ul className="space-y-1">
                {LINKS.map(
                  (link) => {
                    const Icon =
                      link.icon;

                    return (
                      <li
                        key={
                          link.href
                        }
                      >
                        <Link
                          href={
                            link.href
                          }
                          onClick={() =>
                            setOpen(
                              false,
                            )
                          }
                          className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-bold text-slate-600 hover:bg-slate-100 hover:text-ink"
                        >
                          <Icon
                            size={18}
                          />

                          {
                            link.label
                          }
                        </Link>
                      </li>
                    );
                  },
                )}
              </ul>
            </nav>
          </aside>
        </div>
      )}
    </>
  );
}