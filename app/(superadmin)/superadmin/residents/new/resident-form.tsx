"use client";

import { useState } from "react";

import { ActionForm } from "@/components/action-form";
import { Field, Panel } from "@/components/admin";
import { ResidentFields } from "@/components/resident-form";
import type { JurisdictionRecord } from "@/lib/types";

import { createResident } from "../actions";

/** Create form with a choice between an invitation email and a temporary password. */
export function ResidentForm({
  jurisdictions,
  actorRole,
}: {
  jurisdictions: JurisdictionRecord[];
  actorRole: string;
}) {
  const [mode, setMode] = useState<"invite" | "password">("invite");

  return (
    <ActionForm action={createResident} submitLabel={mode === "invite" ? "Send invitation" : "Create account"} pendingLabel="Creating…">
      <ResidentFields resident={null} jurisdictions={jurisdictions} actorRole={actorRole} />

      <Panel title="Sign-in" text="How the resident gets access to their account.">
        <div className="grid gap-3">
          {(
            [
              ["invite", "Send an invitation email", "The resident receives a link to set their own password. Best for real residents."],
              ["password", "Set a temporary password", "The account is confirmed immediately. Share the password with the resident and ask them to change it."],
            ] as const
          ).map(([value, label, hint]) => (
            <label
              key={value}
              className={`flex cursor-pointer items-start gap-3 rounded-2xl border p-4 text-sm transition ${
                mode === value ? "border-brand-400 bg-brand-50/60" : "border-slate-200 hover:border-slate-300"
              }`}
            >
              <input
                type="radio"
                name="mode"
                value={value}
                checked={mode === value}
                onChange={() => setMode(value)}
                className="mt-0.5 size-4 accent-brand-600"
              />
              <span>
                <span className="block font-bold text-ink">{label}</span>
                <span className="block text-xs leading-5 text-slate-500">{hint}</span>
              </span>
            </label>
          ))}

          {mode === "password" && (
            <Field
              label="Temporary password"
              name="password"
              type="text"
              required
              autoComplete="off"
              placeholder="At least 8 characters"
              hint="Shown here once. Ask the resident to change it after signing in."
            />
          )}
        </div>
      </Panel>
    </ActionForm>
  );
}
