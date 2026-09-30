"use client";

import {
  FormEvent,
  useEffect,
  useState,
} from "react";

import { createClient } from "@/lib/supabase/client";

const categories = [
  "Roads",
  "Drainage",
  "Street Lighting",
  "Water",
  "Waste Management",
  "Education",
  "Healthcare",
  "Employment",
  "Business",
  "Welfare",
  "Documentation",
  "Other",
];

export default function NewRequestPage() {
  const supabase = createClient();

  const [category, setCategory] = useState(
    categories[0]
  );
  const [subject, setSubject] = useState("");
  const [description, setDescription] =
    useState("");

  const [tenant, setTenant] =
    useState<any>(null);

  const [jurisdiction, setJurisdiction] =
    useState<any>(null);

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function loadTenant() {
      const response = await fetch("/api/tenant");

      if (!response.ok) return;

      const data = await response.json();

      setTenant(data.tenant);
      setJurisdiction(data.jurisdiction);
    }

    loadTenant();
  }, []);

  async function submit(event: FormEvent) {
    event.preventDefault();

    setLoading(true);
    setMessage("");

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setMessage(
        "Please sign in before submitting a request."
      );

      setLoading(false);
      return;
    }

    if (!tenant) {
      setMessage(
        "Unable to identify the civic office."
      );

      setLoading(false);
      return;
    }

    const { error } = await supabase
      .from("requests")
      .insert({
        resident_id: user.id,
        organization_id: tenant.id,
        jurisdiction_id:
          jurisdiction?.id ?? null,
        category,
        subject,
        description,
      });

    setLoading(false);

    if (error) {
      setMessage(error.message);
      return;
    }

    setSubject("");
    setDescription("");

    setMessage(
      "Your request has been submitted successfully."
    );
  }

  return (
    <main className="mx-auto max-w-3xl px-5 py-14">
      <p className="text-sm font-black uppercase tracking-widest text-teal-700">
        {tenant?.name || "REACH"}
      </p>

      <h1 className="mt-3 text-4xl font-black">
        Request assistance
      </h1>

      <p className="mt-3 text-slate-600">
        Tell the civic office about an issue or service
        request in your community.
      </p>

      <form
        onSubmit={submit}
        className="mt-8 grid gap-5 rounded-3xl border border-slate-200 bg-white p-7"
      >
        <div>
          <label className="mb-2 block text-sm font-bold">
            Category
          </label>

          <select
            value={category}
            onChange={(event) =>
              setCategory(event.target.value)
            }
            className="w-full rounded-xl border border-slate-300 px-4 py-3"
          >
            {categories.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-2 block text-sm font-bold">
            Subject
          </label>

          <input
            required
            value={subject}
            onChange={(event) =>
              setSubject(event.target.value)
            }
            placeholder="Briefly describe the issue"
            className="w-full rounded-xl border border-slate-300 px-4 py-3"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-bold">
            Description
          </label>

          <textarea
            required
            rows={6}
            value={description}
            onChange={(event) =>
              setDescription(event.target.value)
            }
            placeholder="Provide more details..."
            className="w-full rounded-xl border border-slate-300 px-4 py-3"
          />
        </div>

        <button
          disabled={loading}
          className="rounded-xl bg-teal-700 px-5 py-3 font-black text-white disabled:opacity-50"
        >
          {loading
            ? "Submitting..."
            : "Submit request"}
        </button>

        {message && (
          <p className="rounded-xl bg-slate-50 p-4 text-sm text-slate-700">
            {message}
          </p>
        )}
      </form>
    </main>
  );
}