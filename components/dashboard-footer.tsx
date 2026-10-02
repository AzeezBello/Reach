import Link from "next/link";

export function DashboardFooter() {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-3 px-4 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">

        <div>
          <p className="text-xs font-black text-ink">
            REACH Service Console
          </p>

          <p className="mt-0.5 text-[11px] text-slate-400">
            Residents Engagement, Access,
            Communication & Help
          </p>
        </div>

        <div className="flex flex-wrap gap-4 text-[11px] font-bold text-slate-400">
          <Link
            href="/"
            className="hover:text-brand-700"
          >
            Public Site
          </Link>

          <Link
            href="/privacy"
            className="hover:text-brand-700"
          >
            Privacy
          </Link>

          <Link
            href="/terms"
            className="hover:text-brand-700"
          >
            Terms
          </Link>

          <span>
            © {new Date().getFullYear()} REACH
          </span>
        </div>

      </div>
    </footer>
  );
}