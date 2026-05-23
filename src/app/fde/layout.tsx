import type { Metadata } from "next";
import { SITE_CONFIG } from "@/../content/site";

const FDE_TITLE = "Forward Deployed Engineer";
const FDE_DESCRIPTION =
  "Jay Hemnani, an engineer targeting Forward Deployed Engineer (FDE) roles. Proof in agentic systems (LangGraph multi-agent), Model Context Protocol work, RAG, distributed systems, and fast 0-to-1 delivery, plus an honest plan for the customer-facing skill being built.";

export const metadata: Metadata = {
  title: FDE_TITLE,
  description: FDE_DESCRIPTION,
  keywords: [
    "Forward Deployed Engineer",
    "FDE",
    "Forward Deployed Software Engineer",
    "Applied AI Engineer",
    "AI agents",
    "agentic AI",
    "Model Context Protocol",
    "MCP",
    "RAG",
    "LangGraph",
    "distributed systems",
    "full-stack engineer",
    "Jay Hemnani",
    "FDE India",
    "remote FDE",
  ],
  alternates: {
    canonical: "/fde",
  },
  openGraph: {
    title: `${FDE_TITLE} | ${SITE_CONFIG.name}`,
    description: FDE_DESCRIPTION,
    url: `${SITE_CONFIG.url}/fde`,
    siteName: SITE_CONFIG.name,
    type: "profile",
    images: [
      {
        url: SITE_CONFIG.ogImage,
        width: 1200,
        height: 630,
        alt: `${SITE_CONFIG.name}, Forward Deployed Engineer`,
      },
    ],
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: `${FDE_TITLE} | ${SITE_CONFIG.name}`,
    description: FDE_DESCRIPTION,
    creator: SITE_CONFIG.twitterHandle,
    images: [SITE_CONFIG.ogImage],
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "ProfilePage",
  mainEntity: {
    "@type": "Person",
    name: SITE_CONFIG.name,
    url: `${SITE_CONFIG.url}/fde`,
    jobTitle: "Forward Deployed Engineer",
    description: FDE_DESCRIPTION,
    sameAs: [
      SITE_CONFIG.social.github,
      SITE_CONFIG.social.linkedin,
      SITE_CONFIG.social.twitter,
    ],
    knowsAbout: [
      "Forward Deployed Engineering",
      "AI agents",
      "Model Context Protocol",
      "Retrieval-Augmented Generation",
      "LangGraph",
      "Distributed systems",
      "Full-stack engineering",
      "Data pipelines",
    ],
  },
};

export default function FDELayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {children}
    </>
  );
}
