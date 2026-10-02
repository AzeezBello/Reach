"use client";

import { useEffect, useState } from "react";

type Jurisdiction = {
  id: string;
  name: string;
  type: string;
  parent_id: string | null;
};

type Props = {
  id?: string;
  name?: string;
  label?: string;
  required?: boolean;
  value?: string;
  onChange: (id: string) => void;
};

export default function JurisdictionSelector({
  id = "jurisdiction",
  name,
  label = "Where is this issue?",
  required = false,
  value,
  onChange,
}: Props) {
  const [jurisdictions, setJurisdictions] =
    useState<Jurisdiction[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  useEffect(() => {
    async function loadJurisdictions() {
      try {
        const response = await fetch(
          "/api/jurisdictions",
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.error ||
              "Unable to load jurisdictions.",
          );
        }

        setJurisdictions(
          data.jurisdictions ?? [],
        );
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Unable to load jurisdictions.",
        );
      } finally {
        setLoading(false);
      }
    }

    loadJurisdictions();
  }, []);

  if (loading) {
    return (
      <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-500">
        Loading locations...
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
        {error}
      </div>
    );
  }

  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-slate-900">
        {label}
      </label>

      <select
        id={id}
        name={name}
        required={required}
        value={value ?? ""}
        onChange={(event) =>
          onChange(event.target.value)
        }
        className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none focus:border-slate-900"
      >
        <option value="">
          Select your area
        </option>

        {jurisdictions.map((jurisdiction) => (
          <option
            key={jurisdiction.id}
            value={jurisdiction.id}
          >
            {jurisdiction.name}
          </option>
        ))}
      </select>
    </div>
  );
}