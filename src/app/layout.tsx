import type { Metadata, Viewport } from "next";
import "./globals.css";
import { FONT_VARIABLES } from "./fonts";
import { ClientLayout } from "@/components/ClientLayout";
import { WebMCPProvider } from "@/components/WebMCPProvider";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { SITE_CONFIG } from "@/../content/site";
import { getAllProjects } from "@/lib/content";
import { SITE_GRAPH, jsonLd } from "@/lib/json-ld";

export const viewport: Viewport = {
  // Paper, the only theme (ADR 0018).
  themeColor: "#f3ede2",
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_CONFIG.url),
  title: {
    default: SITE_CONFIG.title,
    template: `%s | ${SITE_CONFIG.name}`,
  },
  description: SITE_CONFIG.description,
  keywords: ["Forward Deployed Engineer", "FDE", "Applied AI Engineer", "AI agents", "Model Context Protocol", "MCP", "Data Engineer", "Computer Vision", "Python", "Machine Learning", "MLOps", "PyTorch", "FastAPI", "Data Pipelines", "Backend Engineer"],
  authors: [{ name: SITE_CONFIG.name, url: SITE_CONFIG.url }],
  creator: SITE_CONFIG.name,
  openGraph: {
    title: SITE_CONFIG.title,
    description: SITE_CONFIG.description,
    url: SITE_CONFIG.url,
    siteName: SITE_CONFIG.name,
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_CONFIG.title,
    description: SITE_CONFIG.description,
    creator: SITE_CONFIG.twitterHandle,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // The shell overlay's `ls` command derives its "N more" line from the real
  // project count rather than a hardcoded number (see TerminalOverlay.tsx). It
  // is a client component mounted on every route, so it cannot call the
  // fs-backed getAllProjects() itself; the count comes down as a prop.
  const projectCount = (await getAllProjects()).length;

  return (
    <html lang="en" className={FONT_VARIABLES}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: jsonLd(SITE_GRAPH) }}
        />
      </head>
      <body
        className="antialiased"
      >
        <ClientLayout projectCount={projectCount}>{children}</ClientLayout>
        <WebMCPProvider />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
