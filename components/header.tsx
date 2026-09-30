import Link from "next/link";

import { DesktopNav, MobileNav } from "@/components/nav";
import { buttonClasses } from "@/components/ui";
import { brand } from "@/lib/media";

export function Header({
  tenantName,
  logoUrl,
  signedIn,
}: {
  tenantName: string;
  logoUrl?: string | null;
  signedIn: boolean;
}) {
  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex shrink-0 items-center" aria-label={`${tenantName} home`}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={logoUrl || brand.logo}
            alt={`${tenantName} logo`}
            width={340}
            height={64}
            className="h-9 w-auto sm:h-10"
          />
        </Link>

        <DesktopNav />

        <div className="flex items-center gap-2">
          {signedIn ? (
            <>
              <Link
                href="/dashboard"
                className={buttonClasses("ghost", "sm", "hidden sm:inline-flex")}
              >
                Dashboard
              </Link>
              <form action="/auth/signout" method="post" className="hidden lg:block">
                <button
                  type="submit"
                  className={buttonClasses("ghost", "sm")}
                >
                  Sign out
                </button>
              </form>
            </>
          ) : (
            <Link
              href="/login"
              className={buttonClasses("ghost", "sm", "hidden sm:inline-flex")}
            >
              Sign in
            </Link>
          )}

          <Link
            href="/requests/new"
            className={buttonClasses("primary", "sm")}
          >
            Get help
          </Link>

          <MobileNav signedIn={signedIn} />
        </div>
      </div>
    </header>
  );
}
