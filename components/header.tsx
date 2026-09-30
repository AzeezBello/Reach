// components/header.tsx
import Link from "next/link";

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-700 text-sm font-bold text-white">
            R
          </div>

          <div>
            <div className="text-lg font-bold tracking-tight text-slate-950">
              REACH
            </div>
            <div className="hidden text-[10px] font-medium uppercase tracking-widest text-slate-500 sm:block">
              Digital Civic Office
            </div>
          </div>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          <Link
            href="/programmes"
            className="text-sm font-medium text-slate-600 transition hover:text-emerald-700"
          >
            Programmes
          </Link>

          <Link
            href="/opportunities"
            className="text-sm font-medium text-slate-600 transition hover:text-emerald-700"
          >
            Opportunities
          </Link>

          <Link
            href="/projects"
            className="text-sm font-medium text-slate-600 transition hover:text-emerald-700"
          >
            Projects
          </Link>

          <Link
            href="/requests"
            className="text-sm font-medium text-slate-600 transition hover:text-emerald-700"
          >
            My Requests
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href="/login"
            className="hidden rounded-lg px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 sm:block"
          >
            Sign in
          </Link>

          <Link
            href="/requests/new"
            className="rounded-lg bg-emerald-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-800"
          >
            Get Help
          </Link>
        </div>
      </div>
    </header>
  );
}