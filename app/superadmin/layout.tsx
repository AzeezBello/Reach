import type { Metadata } from "next";
import { ShieldCheck } from "lucide-react";

import { AdminNav } from "@/components/admin-nav";
import { Container } from "@/components/ui";
import { PLATFORM_NAME } from "@/lib/config";

export const metadata: Metadata = {
  title: {
    default: "Platform console",
    template: "%s · Platform console",
  },
  robots: { index: false, follow: false },
};

export default function SuperadminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="bg-slate-50">
      <Container className="py-8 md:py-10">
        <div className="mb-6 flex items-center gap-3 text-xs font-extrabold uppercase tracking-[0.2em] text-slate-500">
          <ShieldCheck size={16} className="text-brand-700" />
          {PLATFORM_NAME} platform console
        </div>

        <div className="grid gap-8 lg:grid-cols-[220px_1fr] lg:gap-10">
          <AdminNav />
          <div className="min-w-0">{children}</div>
        </div>
      </Container>
    </div>
  );
}
