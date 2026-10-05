/**
 * Site-wide Configuration
 * 
 * Central place for all site metadata, social links, and configuration.
 */

export const SITE_CONFIG = {
  name: "Jay Hemnani",
  title: "Jay Hemnani | Software, Data and ML Engineer",
  description: "Available for full-time roles and freelance projects. Engineer who builds end-to-end: data pipelines, ML and computer vision systems, and full-stack apps.",
  url: "https://jayhemnani.in",
  
  // Social
  twitterHandle: "@jeyhemnani9",

  // Social links
  social: {
    email: "jayhemnani992000@gmail.com",
    github: "https://github.com/jayhemnani9910",
    linkedin: "https://linkedin.com/in/jayhemnani",
    twitter: "https://x.com/jeyhemnani9",
    youtube: "https://youtube.com/@jhanalytics2.0",
  },

  // How each profile is written on the page. Kept next to the URLs so no
  // component rebuilds a handle by stripping a URL prefix.
  handles: {
    github: "jayhemnani9910",
    linkedin: "in/jayhemnani",
    twitter: "@jeyhemnani9",
    youtube: "@jhanalytics2.0",
  },

  // Evaluated at build time: both footers show the build year until the next deploy.
  copyright: `© ${new Date().getFullYear()} Jay Hemnani`,
} as const;

