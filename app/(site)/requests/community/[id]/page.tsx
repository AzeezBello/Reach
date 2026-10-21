import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { Breadcrumbs } from "@/components/breadcrumbs";
import { CommunityFeedCard } from "@/components/community-feed-card";
import { ButtonLink, Container } from "@/components/ui";
import { getMySupportedRequestIds, getPublicRequest } from "@/lib/community";
import { getCurrentUser } from "@/lib/reach";

type Params = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { id } = await params;
  const request = await getPublicRequest(id);

  if (!request) return { title: "Request not found" };

  return {
    title: request.subject,
    description:
      request.description?.slice(0, 160) ??
      "A request shared by a resident on REACH.",
    alternates: { canonical: `/requests/community/${id}` },
  };
}

export default async function CommunityRequestPage({ params }: Params) {
  const { id } = await params;
  const user = await getCurrentUser();
  const [request, supported] = await Promise.all([
    getPublicRequest(id, user?.id ?? null),
    user ? getMySupportedRequestIds() : Promise.resolve(new Set<string>()),
  ]);

  if (!request) {
    notFound();
  }

  return (
    <div className="bg-[#FAF9F5]">
      <Container className="max-w-4xl py-8 md:py-12">
        <Breadcrumbs
          items={[
            { label: "Requests", href: "/requests" },
            { label: "Community Feed", href: "/requests/community" },
            {
              label: request.reference_no ?? "Request",
              href: `/requests/community/${request.id}`,
            },
          ]}
        />

        <div className="mt-6">
          <CommunityFeedCard
            request={request}
            supported={supported.has(request.id)}
            isSignedIn={Boolean(user)}
            returnTo={`/requests/community/${request.id}`}
            defaultExpandedComments
            isDetailView
          />
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <ButtonLink href="/requests/community" variant="outline">
            ← Back to Community Priority Feed
          </ButtonLink>
          <ButtonLink href="/requests/new">Raise a similar issue</ButtonLink>
        </div>
      </Container>
    </div>
  );
}
