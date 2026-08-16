import type { Metadata } from "next";
import { SITE_CONFIG } from "@/../content/site";

// /lab/page.tsx is "use client" (it owns the tablist state), and a client
// component cannot export metadata. Without this layout the route shipped with
// no title, no description and no canonical, while still being listed in
// sitemap.ts. Same split /fde already uses.
const LAB_TITLE = "Lab";
const LAB_DESCRIPTION =
  "Things Jay Hemnani is building, exploring, and keeping an eye on. Half-finished on purpose, shown anyway.";

export const metadata: Metadata = {
  title: LAB_TITLE,
  description: LAB_DESCRIPTION,
  alternates: {
    canonical: "/lab",
  },
  openGraph: {
    title: `${LAB_TITLE} | ${SITE_CONFIG.name}`,
    description: LAB_DESCRIPTION,
    url: `${SITE_CONFIG.url}/lab`,
    siteName: SITE_CONFIG.name,
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: `${LAB_TITLE} | ${SITE_CONFIG.name}`,
    description: LAB_DESCRIPTION,
    creator: SITE_CONFIG.twitterHandle,
  },
};

export default function LabLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
