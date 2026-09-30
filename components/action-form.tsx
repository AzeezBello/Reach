"use client";

import { type ReactNode, useActionState, useEffect, useRef } from "react";
import { AlertCircle, CheckCircle2 } from "lucide-react";

import { buttonClasses, type ButtonVariant } from "@/components/ui";

export type ActionState = { ok: boolean; message: string } | null;

export type ServerAction = (
  state: ActionState,
  formData: FormData
) => Promise<ActionState>;

/**
 * A form bound to a server action with pending, success and error states.
 * `inline` renders a compact row for use inside tables.
 */
export function ActionForm({
  action,
  children,
  submitLabel,
  pendingLabel = "Saving…",
  variant = "primary",
  inline = false,
  resetOnSuccess = false,
  className = "",
}: {
  action: ServerAction;
  children?: ReactNode;
  submitLabel: string;
  pendingLabel?: string;
  variant?: ButtonVariant;
  inline?: boolean;
  resetOnSuccess?: boolean;
  className?: string;
}) {
  const [state, formAction, pending] = useActionState(action, null);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (resetOnSuccess && state?.ok) {
      formRef.current?.reset();
    }
  }, [resetOnSuccess, state]);

  const message = state && (
    <p
      role={state.ok ? "status" : "alert"}
      className={`flex items-start gap-2 rounded-xl px-3 py-2 text-xs font-semibold leading-5 ${
        state.ok
          ? "bg-brand-50 text-brand-800"
          : "bg-red-50 text-red-700"
      } ${inline ? "" : "sm:text-sm"}`}
    >
      {state.ok ? (
        <CheckCircle2 size={16} className="mt-0.5 shrink-0" />
      ) : (
        <AlertCircle size={16} className="mt-0.5 shrink-0" />
      )}
      {state.message}
    </p>
  );

  if (inline) {
    return (
      <form ref={formRef} action={formAction} className={`flex flex-wrap items-center gap-2 ${className}`}>
        {children}
        <button
          type="submit"
          disabled={pending}
          className={buttonClasses(variant, "sm", "disabled:opacity-50")}
        >
          {pending ? pendingLabel : submitLabel}
        </button>
        {message}
      </form>
    );
  }

  return (
    <form ref={formRef} action={formAction} className={`grid gap-5 ${className}`}>
      {children}
      {message}
      <div>
        <button
          type="submit"
          disabled={pending}
          className={buttonClasses(variant, "md", "disabled:opacity-50")}
        >
          {pending ? pendingLabel : submitLabel}
        </button>
      </div>
    </form>
  );
}
