"use client";

import { useState } from "react";
import { Loader2, Save } from "lucide-react";

const statuses = [
  {
    value: "submitted",
    label: "Submitted",
  },
  {
    value: "under_review",
    label: "Under review",
  },
  {
    value: "in_progress",
    label: "In progress",
  },
  {
    value: "resolved",
    label: "Resolved",
  },
  {
    value: "closed",
    label: "Closed",
  },
];

type Props = {
  requestId: string;
  currentStatus: string;
};

export default function RequestStatusForm({
  requestId,
  currentStatus,
}: Props) {
  const [status, setStatus] = useState(currentStatus);
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function updateStatus() {
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(
        `/api/requests/${requestId}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            status,
            message,
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Unable to update request.",
        );
      }

      setSuccess("Request updated successfully.");
      setMessage("");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to update request.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="mb-2 block text-sm font-semibold">
          Status
        </label>

        <select
          value={status}
          onChange={(event) =>
            setStatus(event.target.value)
          }
          className="w-full rounded-xl border border-slate-300 px-4 py-3"
        >
          {statuses.map((item) => (
            <option
              key={item.value}
              value={item.value}
            >
              {item.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="mb-2 block text-sm font-semibold">
          Update message
        </label>

        <textarea
          value={message}
          onChange={(event) =>
            setMessage(event.target.value)
          }
          rows={4}
          placeholder="Add an optional update for the resident..."
          className="w-full resize-none rounded-xl border border-slate-300 px-4 py-3"
        />
      </div>

      {error && (
        <div className="rounded-xl bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {success && (
        <div className="rounded-xl bg-emerald-50 p-3 text-sm text-emerald-700">
          {success}
        </div>
      )}

      <button
        type="button"
        onClick={updateStatus}
        disabled={saving}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-3 font-semibold text-white disabled:opacity-50"
      >
        {saving ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Saving...
          </>
        ) : (
          <>
            <Save className="h-4 w-4" />
            Save Update
          </>
        )}
      </button>
    </div>
  );
}