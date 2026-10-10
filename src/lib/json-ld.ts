import { SITE_CONFIG } from "@/../content/site";
import { RESUME } from "@/data/resume";

const PERSON_ID = `${SITE_CONFIG.url}/#person`;
const WEBSITE_ID = `${SITE_CONFIG.url}/#website`;

/** Emitted on every route: who the site is about, and the site itself. */
export const SITE_GRAPH = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": WEBSITE_ID,
      url: SITE_CONFIG.url,
      name: SITE_CONFIG.name,
      publisher: { "@id": PERSON_ID },
    },
    {
      "@type": "Person",
      "@id": PERSON_ID,
      name: SITE_CONFIG.name,
      url: SITE_CONFIG.url,
      jobTitle: RESUME.tagline,
      description: SITE_CONFIG.description,
      sameAs: [
        SITE_CONFIG.social.github,
        SITE_CONFIG.social.linkedin,
        SITE_CONFIG.social.twitter,
        SITE_CONFIG.social.youtube,
      ],
      knowsAbout: [
        "Forward Deployed Engineering",
        "AI agents",
        "Model Context Protocol",
        "Retrieval-Augmented Generation",
        "Computer Vision",
        "Distributed systems",
        "Full-stack engineering",
        "Data pipelines",
      ],
    },
  ],
};

/** The home page is the profile; the Person itself lives in SITE_GRAPH. */
export const PROFILE_PAGE = {
  "@context": "https://schema.org",
  "@type": "ProfilePage",
  url: SITE_CONFIG.url,
  mainEntity: { "@id": PERSON_ID },
  isPartOf: { "@id": WEBSITE_ID },
};

export function blogPosting(post: { slug: string; title: string; summary: string; date: string; tags?: string[] }) {
  const url = `${SITE_CONFIG.url}/blog/${post.slug}`;
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "@id": `${url}#article`,
    url,
    mainEntityOfPage: url,
    headline: post.title,
    description: post.summary,
    datePublished: post.date,
    keywords: post.tags,
    image: `${SITE_CONFIG.url}/opengraph-image`,
    author: { "@id": PERSON_ID },
    isPartOf: { "@id": WEBSITE_ID },
  };
}

/** JSON for a <script type="application/ld+json">, with "<" escaped so no
 * string in the data can close the script tag early. */
export function jsonLd(data: object): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
