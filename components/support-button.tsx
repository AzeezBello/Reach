"use client";

import { useActionState } from "react";
import { ThumbsUp } from "lucide-react";

import { toggleRequestSupport, type SupportState } from "@/app/(site)/requests/community/actions";

/**
 * "Support this request" control. Shows the live count, toggles the
 * signed-in resident's support, and sends signed-out residents to sign in.
 */
export function SupportButton({
  id,
  count,
  supported,
  returnTo,
  size = "md",
  disabled = false,
}: {
  id: string;
  count: number;
  supported: boolean;
  returnTo: string;
  size?: "sm" | "md";
  /** True for the owner's own request, which cannot be supported. */
  disabled?: boolean;
}) {
  const [state, action, pending] = useActionState<SupportState, FormData>(toggleRequestSupport, null);

  const isSupported = state?.ok ? Boolean(state.supported) : supported;
  const total = state?.ok && typeof state.count === "number" ? state.count : count;

  const base =
    size === "sm"
      ? "min-h-9 gap-1.5 px-3 text-xs"
      : "min-h-11 gap-2 px-4 text-sm";

  return (
    <form action={action} className="relative z-10 inline-flex flex-col items-start gap-1">
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="return_to" value={returnTo} />
      <input type="hidden" name="count" value={total} />

      <button
        type="submit"
        disabled={pending || disabled}
        aria-pressed={isSupported}
        title={disabled ? "You cannot support your own request" : isSupported ? "Withdraw support" : "Support this request"}
        className={`inline-flex items-center rounded-xl font-bold transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 ${base} ${
          isSupported
            ? "bg-brand-600 text-white shadow-sm hover:bg-brand-700"
            : "border border-slate-300 bg-white text-slate-800 hover:border-brand-400 hover:text-brand-800"
        }`}
      >
        <ThumbsUp size={size === "sm" ? 14 : 16} className={isSupported ? "fill-current" : ""} />
        {isSupported ? "Supported" : "Support"}
        <span
          className={`rounded-full px-2 py-0.5 text-xs font-extrabold ${
            isSupported ? "bg-white/20" : "bg-slate-100 text-slate-700"
          }`}
        >
          {total}
        </span>
      </button>

      {state && !state.ok && (
        <p role="alert" className="text-xs font-semibold text-red-700">
          {state.message}
        </p>
      )}
    </form>
  );
}
