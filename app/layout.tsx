import type {
  Metadata,
  Viewport,
} from "next";

import "./globals.css";

import {
  PLATFORM_NAME,
  SITE_URL,
} from "@/lib/reach";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),

  title: {
    default: "REACH",
    template: "%s · REACH",
  },

  description:
    "REACH — Residents Engagement, Access, Communication & Help.",

  applicationName: "REACH",

  generator: PLATFORM_NAME,

  robots: {
    index: true,
    follow: true,
  },

  openGraph: {
    type: "website",
    locale: "en_NG",
    siteName: "REACH",
    title: "REACH",
    description:
      "Residents Engagement, Access, Communication & Help.",
  },

  twitter: {
    card: "summary_large_image",
    title: "REACH",
    description:
      "Residents Engagement, Access, Communication & Help.",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#15803d",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className="h-full"
    >
      <body className="min-h-dvh font-sans antialiased">
        {children}
      </body>
    </html>
  );
}