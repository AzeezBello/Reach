import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Building2, ClipboardList, LayoutDashboard } from "lucide-react";

export const metadata: Metadata = {
  title: {
    default: "Office workspace",
    template: "%s · Office workspace",
  },
  robots: { index: false, follow: false },
};

export default function OfficeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-dvh bg-slate-100">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex min-h-16 max-w-[1680px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <Link href="/office" className="flex min-w-0 items-center gap-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-ink text-brand-300">
              <Building2 size={19} aria-hidden="true" />
            </span>
            <span className="min-w-0">
              <span className="block text-sm font-extrabold text-ink">REACH</span>
              <span className="block text-[11px] font-semibold text-slate-500">Office workspace</span>
            </span>
          </Link>
          <Link
            href="/dashboard"
            className="inline-flex min-h-10 shrink-0 items-center gap-2 rounded-lg px-3 text-sm font-bold text-slate-600 transition hover:bg-slate-100 hover:text-ink"
          >
            <ArrowLeft size={16} aria-hidden="true" />
            <span className="hidden sm:inline">Resident portal</span>
          </Link>
        </div>
      </header>

      <nav aria-label="Office workspace" className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-[1680px] gap-2 overflow-x-auto px-4 py-2 sm:px-6 lg:px-8">
          <Link
            href="/office"
            className="inline-flex min-h-10 shrink-0 items-center gap-2 rounded-lg bg-brand-50 px-3 text-sm font-bold text-brand-800"
            aria-current="page"
          >
            <LayoutDashboard size={17} aria-hidden="true" />
            Overview
          </Link>
          <Link
            href="/office#assigned-requests"
            className="inline-flex min-h-10 shrink-0 items-center gap-2 rounded-lg px-3 text-sm font-bold text-slate-600 transition hover:bg-slate-100 hover:text-ink"
          >
            <ClipboardList size={17} aria-hidden="true" />
            Assigned requests
          </Link>
        </div>
      </nav>

      <main className="mx-auto w-full max-w-[1680px] p-4 sm:p-6 lg:p-8">
        {children}
      </main>
    </div>
  );
}