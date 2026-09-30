import Link from "next/link";

import { DesktopNav, MobileNav } from "@/components/nav";
import { buttonClasses } from "@/components/ui";
import { brand } from "@/lib/media";

export function Header({ signedIn }: { signedIn: boolean }) {
  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex shrink-0 items-center" aria-label="REACH home">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={brand.logo}
            alt="REACH, digital civic office"
            width={250}
            height={64}
            className="h-9 w-auto sm:h-10"
          />
        </Link>

        <DesktopNav />

        <div className="flex items-center gap-2">
          {signedIn ? (
            <>
              <div className="hidden sm:block">
                <Link href="/dashboard" className={buttonClasses("ghost", "sm")}>
                  Dashboard
                </Link>
              </div>
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
            <div className="hidden sm:block">
              <Link href="/login" className={buttonClasses("ghost", "sm")}>
                Sign in
              </Link>
            </div>
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
