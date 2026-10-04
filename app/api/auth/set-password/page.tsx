import type { Metadata } from "next";

import { SetPasswordForm } from "@/components/set-password-form";

export const metadata: Metadata = {
  title: "Set your password",
  robots: { index: false, follow: false },
};

export default function SetPasswordPage() {
  return <SetPasswordForm />;
}