"use client";

import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";
import { AlertCircle, CheckCircle2 } from "lucide-react";

import { buttonClasses } from "@/components/ui";
import { createClient } from "@/lib/supabase/client";

const inputClasses =
  "w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-base text-ink placeholder:text-slate-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200";

type Mode = "signin" | "signup";

export function AuthForm({ next }: { next: string }) {
  const router = useRouter();

  const [mode, setMode] = useState<Mode>("signin");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  function switchMode(value: Mode) {
    setMode(value);
    setError(null);
    setNotice(null);
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setLoading(true);
    setError(null);
    setNotice(null);

    const supabase = createClient();

    const result =
      mode === "signin"
        ? await supabase.auth.signInWithPassword({ email, password })
        : await supabase.auth.signUp({
            email,
            password,
            options: { data: { full_name: name.trim() } },
          });

    setLoading(false);

    if (result.error) {
      setError(result.error.message);
      return;
    }

    // A session is returned immediately when email confirmation is disabled.
    if (result.data.session) {
      router.push(next);
      router.refresh();
      return;
    }

    setNotice(
      "Account created. Check your email to confirm your address, then sign in."
    );
    switchMode("signin");
  }

  return (
    <div>
      <div className="flex rounded-xl bg-slate-200/70 p-1" role="tablist">
        {(["signin", "signup"] as Mode[]).map((value) => (
          <button
            key={value}
            type="button"
            role="tab"
            aria-selected={mode === value}
            onClick={() => switchMode(value)}
            className={`flex-1 rounded-lg px-4 py-2 text-sm font-bold transition ${
              mode === value
                ? "bg-white text-ink shadow-sm"
                : "text-slate-600 hover:text-ink"
            }`}
          >
            {value === "signin" ? "Sign in" : "Create account"}
          </button>
        ))}
      </div>

      <h1 className="mt-8 text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
        {mode === "signin" ? "Welcome back" : "Create your account"}
      </h1>

      <p className="mt-3 text-sm leading-6 text-slate-600 sm:text-base">
        Use your resident account to submit and track service requests.
      </p>

      <form
        onSubmit={submit}
        className="mt-8 grid gap-5 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8"
      >
        {mode === "signup" && (
          <div>
            <label htmlFor="name" className="mb-2 block text-sm font-bold text-ink">
              Full name
            </label>
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

        <div>
          <label htmlFor="email" className="mb-2 block text-sm font-bold text-ink">
            Email address
          </label>
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

        <div>
          <label htmlFor="password" className="mb-2 block text-sm font-bold text-ink">
            Password
          </label>
          <input
            id="password"
            required
            minLength={8}
            type="password"
            autoComplete={mode === "signin" ? "current-password" : "new-password"}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="At least 8 characters"
            className={inputClasses}
          />
        </div>

        {error && (
          <p
            role="alert"
            className="flex items-start gap-2 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm leading-6 text-red-700"
          >
            <AlertCircle size={18} className="mt-0.5 shrink-0" />
            {error}
          </p>
        )}

        {notice && (
          <p
            role="status"
            className="flex items-start gap-2 rounded-2xl border border-brand-200 bg-brand-50 p-4 text-sm leading-6 text-brand-800"
          >
            <CheckCircle2 size={18} className="mt-0.5 shrink-0" />
            {notice}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className={buttonClasses("primary", "lg", "w-full disabled:opacity-50")}
        >
          {loading
            ? "Please wait…"
            : mode === "signin"
              ? "Sign in"
              : "Create account"}
        </button>
      </form>
    </div>
  );
}
