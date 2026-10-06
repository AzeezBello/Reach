import type { Metadata } from "next";

import { PageHero } from "@/components/page-hero";
import { Container } from "@/components/ui";
import { pageArt } from "@/lib/media";
import { PLATFORM_NAME } from "@/lib/config";

export const metadata: Metadata = {
  title: "Privacy policy",
  description:
    "How REACH collects, uses and protects the personal information residents share when they create an account, submit a request or RSVP to an event.",
  alternates: { canonical: "/privacy" },
};

const SECTIONS = [
  {
    title: "What we collect",
    body: [
      "Account details: your name, email address, phone number and the home area you select when you sign up.",
      "Request details: the subject, description and category of every service request you submit, plus the updates the office adds while handling it.",
      "Participation records: programme applications and event RSVPs made from your account.",
      "Messages: when you contact the office on WhatsApp, the conversation is stored so staff can follow up.",
    ],
  },
  {
    title: "How we use it",
    body: [
      "To route each request to the office that serves your area and keep you informed as it progresses.",
      "To confirm your place in programmes and events and to contact you about them.",
      "To send notifications you have asked for by email, SMS or WhatsApp.",
      "To produce anonymous statistics about the services residents use most.",
    ],
  },
  {
    title: "Who can see it",
    body: [
      "Staff of the office handling your request can see the request and your contact details.",
      "Platform administrators can see account and participation records to manage the service.",
      "We do not sell personal information and we do not share it with advertisers.",
    ],
  },
  {
    title: "Your choices",
    body: [
      "You can update your name, phone number and home area from your dashboard at any time.",
      "You can ask the office to delete your account and the records linked to it by contacting us through the details in the footer.",
      "You can stop WhatsApp or SMS updates by replying STOP or by removing your phone number from your profile.",
    ],
  },
  {
    title: "Security and retention",
    body: [
      "Data is stored with Supabase in encrypted databases and only reachable through authenticated, role-based access.",
      "Request records are kept for as long as the office needs them to provide and report on the service, after which they are deleted or anonymised.",
    ],
  },
];

export default function PrivacyPage() {
  return (
    <>
      <PageHero
        eyebrow="Legal"
        title="Privacy policy"
        text={`How ${PLATFORM_NAME} handles the personal information residents share with the office.`}
        image={pageArt.requests}
        breadcrumbs={[{ label: "Privacy policy", href: "/privacy" }]}
      />

      <Container className="py-12 md:py-16">
        <div className="mx-auto max-w-3xl space-y-10">
          <p className="text-sm text-slate-500">Last updated 6 October 2026</p>

          {SECTIONS.map((section) => (
            <section key={section.title} aria-labelledby={section.title}>
              <h2 id={section.title} className="text-2xl font-extrabold tracking-tight text-ink">
                {section.title}
              </h2>
              <ul className="mt-4 list-disc space-y-3 pl-5 text-base leading-7 text-slate-600">
                {section.body.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </Container>
    </>
  );
}
