"use client";

import { useEffect } from "react";

import { buttonClasses, Container, Eyebrow } from "@/components/ui";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <Container className="flex min-h-[60vh] flex-col items-center justify-center py-20 text-center">
      <Eyebrow>Something went wrong</Eyebrow>

      <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
        We could not load this page.
      </h1>

      <p className="mt-3 max-w-md text-slate-600">
        The office data service did not respond. Please try again in a moment.
      </p>

      <button
        type="button"
        onClick={reset}
        className={buttonClasses("primary", "lg", "mt-8")}
      >
        Try again
      </button>
    </Container>
  );
}
