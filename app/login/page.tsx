"use client";

import {
  FormEvent,
  useState,
} from "react";

import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const supabase = createClient();

  const [mode, setMode] =
    useState<"signin" | "signup">("signin");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();

    setLoading(true);
    setMessage("");

    const result =
      mode === "signin"
        ? await supabase.auth.signInWithPassword({
            email,
            password,
          })
        : await supabase.auth.signUp({
            email,
            password,
            options: {
              data: {
                full_name: name,
              },
            },
          });

    setLoading(false);

    if (result.error) {
      setMessage(result.error.message);
      return;
    }

    if (mode === "signin") {
      window.location.href = "/requests";
      return;
    }

    setMessage(
      "Account created. Check your email if confirmation is enabled, then sign in."
    );
  }

  return (
    <main className="mx-auto max-w-md px-5 py-16">
      <h1 className="text-4xl font-black">
        {mode === "signin"
          ? "Sign in"
          : "Create your account"}
      </h1>

      <p className="mt-3 text-slate-600">
        Use your REACH account to submit and track
        service requests.
      </p>

      <form
        onSubmit={submit}
        className="mt-8 grid gap-4 rounded-3xl border border-slate-200 bg-white p-7"
      >
        {mode === "signup" && (
          <input
            required
            value={name}
            onChange={(event) =>
              setName(event.target.value)
            }
            placeholder="Full name"
            className="rounded-xl border border-slate-300 px-4 py-3"
          />
        )}

        <input
          required
          type="email"
          value={email}
          onChange={(event) =>
            setEmail(event.target.value)
          }
          placeholder="Email address"
          className="rounded-xl border border-slate-300 px-4 py-3"
        />

        <input
          required
          minLength={8}
          type="password"
          value={password}
          onChange={(event) =>
            setPassword(event.target.value)
          }
          placeholder="Password"
          className="rounded-xl border border-slate-300 px-4 py-3"
        />

        <button
          disabled={loading}
          className="rounded-xl bg-teal-700 px-4 py-3 font-black text-white disabled:opacity-50"
        >
          {loading
            ? "Please wait..."
            : mode === "signin"
              ? "Sign in"
              : "Create account"}
        </button>

        {message && (
          <p className="text-sm text-slate-600">
            {message}
          </p>
        )}
      </form>

      <button
        type="button"
        onClick={() =>
          setMode(
            mode === "signin"
              ? "signup"
              : "signin"
          )
        }
        className="mt-4 text-sm font-bold text-teal-700"
      >
        {mode === "signin"
          ? "Create an account"
          : "Already have an account? Sign in"}
      </button>
    </main>
  );
}
