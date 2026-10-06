"use client";

import { type FormEvent, useState } from "react";
import { AlertCircle, CheckCircle2, Eye, EyeOff } from "lucide-react";

import JurisdictionSelector from "@/components/jurisdiction-selector";
import { buttonClasses } from "@/components/ui";
import { createClient } from "@/lib/supabase/client";

const inputClasses =
  "w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-base text-ink placeholder:text-slate-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200";

type Mode = "signin" | "signup" | "recovery";

export function AuthForm({ next, initialError }: { next: string; initialError?: string | null }) {
  const [mode, setMode] = useState<Mode>("signin");
  const [signupStep, setSignupStep] = useState<1 | 2>(1);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [homeJurisdictionId, setHomeJurisdictionId] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(initialError ?? null);
  const [notice, setNotice] = useState<string | null>(null);

  function switchMode(value: Mode) {
    setMode(value);
    setSignupStep(1);
    setShowPassword(false);
    setError(null);
    setNotice(null);
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setNotice(null);

    if (mode === "signup" && signupStep === 1) {
      if (name.trim().length < 2) {
        setError("Please enter your full name.");
        return;
      }
      if (password.length < 8) {
        setError("Use a password with at least 8 characters.");
        return;
      }
      setSignupStep(2);
      return;
    }

    if (mode === "signup" && !homeJurisdictionId) {
      setError("Select your home area to continue.");
      return;
    }

    setLoading(true);
    const supabase = createClient();

    if (mode === "recovery") {
      const { error: recoveryError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/callback?next=/auth/set-password`,
      });
      setLoading(false);

      if (recoveryError) {
        setError(recoveryError.message);
      } else {
        setNotice("If an account exists for this email, a password reset link is on its way.");
      }
      return;
    }

    if (mode === "signin") {
      const response =
        await fetch(
          "/api/auth/sign-in",
          {
            method: "POST",
            headers: {
              "Content-Type":
                "application/json",
            },
            credentials: "include",
            body: JSON.stringify({
              email,
              password,
              next,
              remember: rememberMe,
            }),
          },
        );

      const result =
        await response.json();

      setLoading(false);

      if (
        !response.ok ||
        !result.success
      ) {
        setError(
          result.error ??
            "Unable to sign in.",
        );
        return;
      }

      /*
      * Force a real browser navigation after the
      * server has established the Supabase SSR cookie.
      *
      * This guarantees /superadmin receives the new
      * authentication cookie on the next request.
      */
      window.location.assign(
        result.next ?? next,
      );

      return;
    }

    /*
    * Signup continues to use the browser Supabase
    * client because it is not the protected-admin
    * authentication path.
    */
    const result =
      await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name:
              name.trim(),
            jurisdiction_id:
              homeJurisdictionId,
          },
        },
      });

    setLoading(false);

    if (result.error) {
      setError(
        result.error.message,
      );
      return;
    }

    if (result.data.session) {
      window.location.assign(
        next,
      );
      return;
    }

    setMode("signin");
    setSignupStep(1);
    setPassword("");
    setHomeJurisdictionId("");
    setNotice("Account created. Check your email to confirm your address, then sign in.");
  }

  return (
    <div>
      {mode !== "recovery" && (
        <div className="flex rounded-xl bg-slate-200/70 p-1" role="tablist" aria-label="Account access">
          {(["signin", "signup"] as const).map((value) => (
            <button
              key={value}
              type="button"
              role="tab"
              aria-selected={mode === value}
              onClick={() => switchMode(value)}
              className={`flex-1 rounded-lg px-4 py-2 text-sm font-bold transition ${
                mode === value ? "bg-white text-ink shadow-sm" : "text-slate-600 hover:text-ink"
              }`}
            >
              {value === "signin" ? "Sign in" : "Create account"}
            </button>
          ))}
        </div>
      )}

      <h1 className="mt-8 text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
        {mode === "recovery" ? "Reset your password" : mode === "signin" ? "Welcome back" : "Create your account"}
      </h1>

      <p className="mt-3 text-sm leading-6 text-slate-600 sm:text-base">
        {mode === "recovery"
          ? "Enter your account email and we’ll send a one-time password reset link."
          : mode === "signup" && signupStep === 2
            ? "Set your home area so REACH can show relevant local updates."
            : "Use your resident account to submit and track service requests."}
      </p>

      {mode === "signup" && (
        <ol aria-label="Account setup progress" className="mt-5 grid grid-cols-2 gap-2 text-xs font-bold">
          <li aria-current={signupStep === 1 ? "step" : undefined} className={`rounded-lg px-3 py-2 ${signupStep === 1 ? "bg-brand-100 text-brand-900" : "bg-slate-100 text-slate-500"}`}>
            1. Account details
          </li>
          <li aria-current={signupStep === 2 ? "step" : undefined} className={`rounded-lg px-3 py-2 ${signupStep === 2 ? "bg-brand-100 text-brand-900" : "bg-slate-100 text-slate-500"}`}>
            2. Home area
          </li>
        </ol>
      )}

      <form onSubmit={submit} className="mt-8 grid gap-5 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        {mode === "signup" && signupStep === 1 && (
          <div>
            <label htmlFor="name" className="mb-2 block text-sm font-bold text-ink">Full name</label>
            <input
              id="name"
              required
              autoComplete="name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Your full name"
              className={inputClasses}
            />
          </div>
        )}

        {(mode === "signin" || mode === "recovery" || (mode === "signup" && signupStep === 1)) && (
          <div>
            <label htmlFor="email" className="mb-2 block text-sm font-bold text-ink">Email address</label>
            <input
              id="email"
              required
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              className={inputClasses}
            />
          </div>
        )}

        {(mode === "signin" || (mode === "signup" && signupStep === 1)) && (
          <div>
            <label htmlFor="password" className="mb-2 block text-sm font-bold text-ink">Password</label>
            <div className="relative">
              <input
                id="password"
                required
                minLength={mode === "signup" ? 8 : undefined}
                type={showPassword ? "text" : "password"}
                autoComplete={mode === "signin" ? "current-password" : "new-password"}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="At least 8 characters"
                className={`${inputClasses} pr-12`}
              />
              <button
                type="button"
                title={showPassword ? "Hide password" : "Show password"}
                aria-label={showPassword ? "Hide password" : "Show password"}
                aria-pressed={showPassword}
                onClick={() => setShowPassword((visible) => !visible)}
                className="absolute inset-y-0 right-1 flex w-10 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-ink focus-visible:outline-2 focus-visible:outline-brand-700"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
        )}

        {mode === "signin" && (
          <div className="flex flex-wrap items-center justify-between gap-3">
            <label className="inline-flex min-h-10 items-center gap-2 text-sm font-semibold text-slate-700">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(event) => setRememberMe(event.target.checked)}
                className="size-4 rounded border-slate-300 accent-brand-700"
              />
              Remember me
            </label>
            <button type="button" onClick={() => switchMode("recovery")} className="min-h-10 text-sm font-bold text-brand-700 underline-offset-4 hover:underline">
              Forgot password?
            </button>
          </div>
        )}

        {mode === "recovery" && (
          <button type="button" onClick={() => switchMode("signin")} className="min-h-10 text-left text-sm font-bold text-brand-700 underline-offset-4 hover:underline">
            Back to sign in
          </button>
        )}

        {mode === "signup" && signupStep === 2 && (
          <>
            <div className="rounded-lg bg-slate-50 p-3 text-sm text-slate-600">
              Creating an account for <span className="font-bold text-ink">{name}</span> · {email}
            </div>
            <JurisdictionSelector
              id="home-jurisdiction"
              name="home_jurisdiction_id"
              label="Home area"
              required
              value={homeJurisdictionId}
              onChange={setHomeJurisdictionId}
            />
            <p className="text-xs leading-5 text-slate-500">
              Your home area helps show local updates and requests. You can change it later in your profile.
            </p>
          </>
        )}

        {error && (
          <p role="alert" className="flex items-start gap-2 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm leading-6 text-red-700">
            <AlertCircle size={18} className="mt-0.5 shrink-0" />
            {error}
          </p>
        )}

        {notice && (
          <p role="status" className="flex items-start gap-2 rounded-2xl border border-brand-200 bg-brand-50 p-4 text-sm leading-6 text-brand-800">
            <CheckCircle2 size={18} className="mt-0.5 shrink-0" />
            {notice}
          </p>
        )}

        <div className="flex flex-col gap-3 sm:flex-row-reverse">
          <button type="submit" disabled={loading} className={buttonClasses("primary", "lg", "w-full disabled:opacity-50 sm:flex-1")}>
            {loading ? "Please wait…" : mode === "recovery" ? "Send reset link" : mode === "signin" ? "Sign in" : signupStep === 1 ? "Continue" : "Create account"}
          </button>
          {mode === "signup" && signupStep === 2 && (
            <button type="button" onClick={() => { setSignupStep(1); setError(null); }} className={buttonClasses("outline", "lg", "w-full sm:w-auto")}>
              Back
            </button>
          )}
        </div>
      </form>
    </div>
  );
}