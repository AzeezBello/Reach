"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";

import { buttonClasses } from "@/components/ui";
import { NAV_LINKS } from "@/lib/navigation";

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function DesktopNav() {
  const pathname = usePathname();

  return (
    <nav aria-label="Primary" className="hidden items-center gap-1 lg:flex">
      {NAV_LINKS.map((link) => {
        const active = isActive(pathname, link.href);

        return (
          <Link
            key={link.href}
            href={link.href}
            aria-current={active ? "page" : undefined}
            className={`rounded-lg px-3 py-2 text-sm font-semibold transition ${
              active
                ? "bg-brand-50 text-brand-800"
                : "text-slate-600 hover:bg-slate-50 hover:text-ink"
            }`}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}

export function MobileNav({ signedIn }: { signedIn: boolean }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // Close the panel whenever the route changes.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Keep the page from scrolling behind the open panel.
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <div className="lg:hidden">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-controls="mobile-nav"
        aria-label={open ? "Close menu" : "Open menu"}
        className="flex size-10 items-center justify-center rounded-lg text-slate-700 transition hover:bg-slate-100"
      >
        {open ? <X size={22} /> : <Menu size={22} />}
      </button>

      {open && (
        <div
          id="mobile-nav"
          className="fixed inset-x-0 top-16 bottom-0 z-40 overflow-y-auto border-t border-slate-200 bg-white"
        >
          <nav aria-label="Mobile" className="px-4 py-4 sm:px-6">
            <ul className="divide-y divide-slate-100">
              {NAV_LINKS.map((link) => {
                const active = isActive(pathname, link.href);

                return (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      aria-current={active ? "page" : undefined}
                      className={`flex items-center justify-between py-4 text-base font-bold ${
                        active ? "text-brand-800" : "text-ink"
                      }`}
                    >
                      {link.label}
                      {active && (
                        <span className="size-2 rounded-full bg-brand-500" />
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>

            <div className="mt-6 grid gap-3">
              <Link
                href="/requests/new"
                className={buttonClasses("primary", "lg", "w-full")}
              >
                Request assistance
              </Link>

              {signedIn && (
                <Link
                  href="/dashboard"
                  className={buttonClasses("dark", "lg", "w-full")}
                >
                  My dashboard
                </Link>
              )}

              {signedIn ? (
                <form action="/auth/signout" method="post">
                  <button
                    type="submit"
                    className={buttonClasses("outline", "lg", "w-full")}
                  >
                    Sign out
                  </button>
                </form>
              ) : (
                <Link
                  href="/login"
                  className={buttonClasses("outline", "lg", "w-full")}
                >
                  Sign in
                </Link>
              )}
            </div>
          </nav>
        </div>
      )}
    </div>
  );
}
