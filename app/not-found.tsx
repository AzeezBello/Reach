import { LogoMark } from "@/components/logo-mark";
import { ButtonLink, Container, Eyebrow } from "@/components/ui";

export default function NotFound() {
  return (
    <Container className="flex min-h-[60vh] flex-col items-center justify-center py-20 text-center">
      <LogoMark className="size-16" />

      <Eyebrow className="mt-8">Page not found</Eyebrow>

      <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
        We could not find that page.
      </h1>

      <p className="mt-3 max-w-md text-slate-600">
        The page may have been moved, or the programme, opportunity or project
        is no longer published.
      </p>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <ButtonLink href="/">Back to home</ButtonLink>
        <ButtonLink href="/requests/new" variant="outline">
          Request assistance
        </ButtonLink>
      </div>
    </Container>
  );
}
