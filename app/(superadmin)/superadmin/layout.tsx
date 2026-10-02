import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, ShieldCheck } from "lucide-react";

import { AdminNav } from "@/components/admin-nav";
import { PLATFORM_NAME } from "@/lib/config";

export const metadata: Metadata = {
  title: {
    default: "Platform console",
    template: "%s · Platform console",
  },
  robots: { index: false, follow: false },
};

export default function SuperadminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-dvh bg-slate-100">
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-[1680px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <Link href="/superadmin" className="flex min-w-0 items-center gap-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-ink text-brand-300">
              <ShieldCheck size={20} aria-hidden="true" />
            </span>
            <span className="min-w-0">
              <span className="block truncate text-sm font-extrabold text-ink">{PLATFORM_NAME}</span>
              <span className="block text-[11px] font-semibold text-slate-500">Platform administration</span>
            </span>
          </Link>
          <Link
            href="/"
            aria-label="Back to REACH"
            className="inline-flex min-h-10 shrink-0 items-center gap-2 rounded-lg px-3 text-sm font-bold text-slate-600 transition hover:bg-slate-100 hover:text-ink"
          >
            <span className="hidden sm:inline">Back to REACH</span>
            <ArrowUpRight size={17} aria-hidden="true" />
          </Link>
        </div>
      </header>

      <div className="mx-auto grid max-w-[1680px] gap-6 px-4 py-5 sm:px-6 sm:py-7 lg:grid-cols-[236px_minmax(0,1fr)] lg:gap-8 lg:px-8 lg:py-8">
        <AdminNav />
        <main className="min-w-0">{children}</main>
      </div>
    </div>
  );
}
