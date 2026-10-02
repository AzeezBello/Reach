import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ShieldCheck } from "lucide-react";

export const metadata: Metadata = {
  title: {
    default: "Leader workspace",
    template: "%s · Leader workspace",
  },
  robots: { index: false, follow: false },
};

export default function LeaderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-dvh bg-slate-100">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex min-h-16 max-w-[1440px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <Link href="/leader" className="flex min-w-0 items-center gap-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-ink text-brand-300">
              <ShieldCheck size={19} aria-hidden="true" />
            </span>
            <span className="min-w-0">
              <span className="block text-sm font-extrabold text-ink">REACH</span>
              <span className="block text-[11px] font-semibold text-slate-500">Leader workspace</span>
            </span>
          </Link>
          <nav aria-label="Leader workspace navigation" className="flex items-center gap-2">
            <Link
              href="/leadership"
              className="hidden min-h-10 items-center rounded-lg px-3 text-sm font-bold text-slate-600 hover:bg-slate-100 hover:text-ink sm:inline-flex"
            >
              Public directory
            </Link>
            <Link
              href="/dashboard"
              className="inline-flex min-h-10 shrink-0 items-center gap-2 rounded-lg px-3 text-sm font-bold text-slate-600 transition hover:bg-slate-100 hover:text-ink"
            >
              <ArrowLeft size={16} aria-hidden="true" />
              <span className="hidden sm:inline">Resident portal</span>
            </Link>
          </nav>
        </div>
      </header>
      <main className="mx-auto w-full max-w-[1440px] space-y-7 px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        {children}
      </main>
    </div>
  );
}