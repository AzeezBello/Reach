"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { type FormEvent, useEffect, useState } from "react";

import { buttonClasses } from "@/components/ui";
import { createClient } from "@/lib/supabase/client";

const inputClasses =
  "w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-base text-ink placeholder:text-slate-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200";

export function SetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextParam = searchParams.get("next");
  const next =
    nextParam && nextParam.startsWith("/") && !nextParam.startsWith("//")
      ? nextParam
      : "/dashboard";
  const [sessionState, setSessionState] = useState<"checking" | "ready" | "invalid">("checking");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let active = true;

    createClient().auth.getSession().then(({ data, error: sessionError }) => {
      if (active) {
        setSessionState(!sessionError && data.session ? "ready" : "invalid");
      }
    });

    return () => {
      active = false;
    };
  }, []);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setSaving(true);
    const { error: updateError } = await createClient().auth.updateUser({ password });
    setSaving(false);

    if (updateError) {
      setError(updateError.message);
      return;
    }

    router.replace(next);
    router.refresh();
  }

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-lg items-center px-4 py-12 sm:px-6">
      <section className="w-full rounded-xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-brand-700">
          REACH account
        </p>
        <h1 className="mt-3 text-2xl font-extrabold text-ink">Set your password</h1>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          Choose a private password for your account. REACH staff will not see it.
        </p>

        {sessionState === "checking" ? (
          <p className="mt-6 text-sm text-slate-600" role="status">Verifying your invitation…</p>
        ) : sessionState === "invalid" ? (
          <div className="mt-6 space-y-4">
            <p className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900" role="alert">
              This invitation link is invalid, expired, or already used. Ask your REACH administrator to send a new invitation.
            </p>
            <Link href="/login" className="text-sm font-bold text-brand-700 underline underline-offset-4">
              Go to sign in
            </Link>
          </div>
        ) : (
          <form onSubmit={submit} className="mt-6 grid gap-5">
            <div>
              <label htmlFor="new-password" className="mb-2 block text-sm font-bold text-ink">
                New password
              </label>
              <input
                id="new-password"
                type="password"
                autoComplete="new-password"
                minLength={8}
                required
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className={inputClasses}
              />
              <p className="mt-1 text-xs text-slate-500">Use at least 8 characters.</p>
            </div>
            <div>
              <label htmlFor="confirm-password" className="mb-2 block text-sm font-bold text-ink">
                Confirm password
              </label>
              <input
                id="confirm-password"
                type="password"
                autoComplete="new-password"
                minLength={8}
                required
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                className={inputClasses}
              />
            </div>
            {error && (
              <p role="alert" className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                {error}
              </p>
            )}
            <button type="submit" disabled={saving} className={buttonClasses("primary", "lg", "w-full disabled:opacity-50")}>
              {saving ? "Saving…" : "Set password"}
            </button>
          </form>
        )}
      </section>
    </main>
  );
}