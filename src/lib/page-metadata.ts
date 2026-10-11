import type { Metadata } from "next";
import { SITE_CONFIG } from "@/../content/site";
import { alt as shareImageAlt } from "@/app/opengraph-image";

// Next replaces openGraph and twitter whole per segment, and only the root
// layer gets the root opengraph-image added for it. So a page that sets its
// own openGraph has to name the image, url and site name again, or its share
// card goes out without them.
const SHARE_IMAGE = {
  url: "/opengraph-image",
  width: 1200,
  height: 630,
  alt: shareImageAlt,
};

type PageMetadataInput = {
  title: string;
  description: string;
  /** Route path, e.g. "/projects/voxt". */
  path: string;
  type?: "website" | "article" | "profile";
  /** Extra article fields (publishedTime, tags). */
  article?: { publishedTime?: string; tags?: string[] };
};

/** Title, description, canonical, share card and twitter card for one route. */
export function pageMetadata({ title, description, path, type = "website", article }: PageMetadataInput): Metadata {
  const shareTitle = `${title} | ${SITE_CONFIG.name}`;
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      title: shareTitle,
      description,
      url: `${SITE_CONFIG.url}${path}`,
      siteName: SITE_CONFIG.name,
      locale: "en_US",
      type,
      images: [SHARE_IMAGE],
      ...(type === "article" ? article : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: shareTitle,
      description,
      creator: SITE_CONFIG.twitterHandle,
      images: [SHARE_IMAGE.url],
    },
  };
}
