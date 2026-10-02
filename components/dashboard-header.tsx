import Link from "next/link";
import {
  Bell,
  ExternalLink,
} from "lucide-react";

import { getCurrentUser } from "@/lib/reach";
import { DashboardMobileNav } from "@/components/dashboard-mobile-nav";

export async function DashboardHeader() {
  const user =
    await getCurrentUser().catch(
      () => null,
    );

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">

        <div className="flex items-center gap-3 lg:hidden">
        <DashboardMobileNav />

        <Link
            href="/dashboard"
            className="text-lg font-black text-ink"
        >
            REACH
        </Link>
        </div>

        <div className="hidden lg:block">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
            Resident Service Platform
          </p>

          <p className="text-sm font-extrabold text-ink">
            Dashboard
          </p>
        </div>

        <div className="flex items-center gap-3">

          <Link
            href="/"
            target="_blank"
            className="hidden items-center gap-2 rounded-xl px-3 py-2 text-xs font-bold text-slate-500 hover:bg-slate-100 hover:text-ink sm:flex"
          >
            Public Site
            <ExternalLink size={14} />
          </Link>

          <Link
            href="/dashboard/notifications"
            aria-label="Notifications"
            className="relative flex size-10 items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100 hover:text-ink"
          >
            <Bell size={18} />
          </Link>

          <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
            <div className="flex size-7 items-center justify-center rounded-full bg-brand-600 text-xs font-black text-white">
              {user?.email?.charAt(0).toUpperCase() ??
                "U"}
            </div>

            <span className="hidden max-w-[180px] truncate text-xs font-bold text-ink md:block">
              {user?.email ??
                "Account"}
            </span>
          </div>

        </div>
      </div>
    </header>
  );
}