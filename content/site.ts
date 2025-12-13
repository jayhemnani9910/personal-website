/**
 * Site-wide Configuration
 * 
 * Central place for all site metadata, social links, and configuration.
 * Edit this file to update site-wide content.
 */

export const SITE_CONFIG = {
  name: "Jay Hemnani",
  title: "Jay Hemnani | Data Engineer",
  description: "Engineering resilient data pipelines and autonomous AI systems. Transforming raw data into actionable intelligence.",
  url: "https://jeyhemnani.com",
  
  // Social/OG
  ogImage: "/og-image.png",
  twitterHandle: "@jayhemnani",
  
  // Navigation
  navLinks: [
    { name: "Home", href: "/" },
    { name: "Experience", href: "/#experience" },
    { name: "Projects", href: "/#projects" },
    { name: "Timeline", href: "/#timeline" },
    { name: "Extra", href: "/#extra" },
  ],
  
  // Social links
  social: {
    email: "jay.hemnani@sjsu.edu",
    github: "https://github.com/jeyhemnani99",
    linkedin: "https://linkedin.com/in/jayhemnani",
    twitter: "https://twitter.com/jayhemnani",
  },
  
  // Hero content
  hero: {
    title: "Jay Hemnani",
    role: "Data Engineer",
    tagline: "Engineering resilient data pipelines and autonomous AI systems.",
    subTagline: "Transforming raw data into actionable intelligence.",
    highlight: "resilient",
    cta: {
      primary: "Initialize System",
      secondary: "Explore Selected Works",
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

