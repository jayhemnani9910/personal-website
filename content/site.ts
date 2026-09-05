/**
 * Site-wide Configuration
 * 
 * Central place for all site metadata, social links, and configuration.
 * Edit this file to update site-wide content.
 */

export const SITE_CONFIG = {
  name: "Jay Hemnani",
  title: "Jay Hemnani | Forward Deployed Engineer",
  description: "Forward Deployed Engineer who builds end-to-end: data pipelines, ML and computer vision systems, and the full-stack apps that put them in users' hands. Available for full-time roles and freelance projects.",
  url: "https://jayhemnani.in",
  
  // Social/OG
  // NOTE: /og-image.png does not exist as a static file; the dynamic opengraph-image.tsx
  // route covers the root OG image. This field is only consumed by fde/layout.tsx for
  // the /fde route's OG metadata. Replace with a real static asset or a dynamic route
  // at /fde/opengraph-image.tsx to eliminate the 404.
  ogImage: "/og-image.png",
  twitterHandle: "@jeyhemnani9",

  // Social links
  social: {
    email: "jayhemnani992000@gmail.com",
    github: "https://github.com/jayhemnani9910",
    linkedin: "https://linkedin.com/in/jayhemnani",
    twitter: "https://x.com/jeyhemnani9",
    youtube: "https://youtube.com/@jayhemnani",
  },

  // Hero content (not currently rendered by any component; kept for reference only)
  hero: {
    title: "Jay Hemnani",
    role: "Forward Deployed Engineer",
    tagline: "Builds and ships production systems end-to-end, from data pipelines and ML inference to the full-stack interfaces that put them in users' hands.",
    subTagline: "Fast iteration. Production-ready code. Direct customer feedback loop.",
    highlight: "production",
    cta: {
      primary: "Work With Me",
      secondary: "See My Work",
    },
  },
  
  // UI Copy
  ui: {
    nav: {
      scroll: "Scroll",
    },
    resume: {
      experience: "Experience",
      education: "Education",
      publications: "Publications",
      gpa: "GPA:",
      coursework: "Coursework",
    },
    project: {
      back: "Back to projects",
      challenge: "Challenge",
      solution: "Solution",
      impact: "Impact",
      architecture: "Architecture",
      techStack: "Tech Stack",
      metrics: "Metrics",
      links: "Links",
      code: "Code",
      demo: "Demo",
      paper: "Paper",
    },
  },
} as const;

export type SiteConfig = typeof SITE_CONFIG;

