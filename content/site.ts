/**
 * Site-wide Configuration
 * 
 * Central place for all site metadata, social links, and configuration.
 * Edit this file to update site-wide content.
 */

export const SITE_CONFIG = {
  name: "Jay Hemnani",
  title: "Jay Hemnani | Data Engineer",
  description: "Data Engineer specializing in production ML systems, computer vision pipelines, and scalable data infrastructure. Available for full-time roles and freelance projects.",
  url: "https://jayhemnani.me",
  
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
    email: "jayhemnani992000@gmail.com",
    github: "https://github.com/jayhemnani9910",
    linkedin: "https://linkedin.com/in/jayhemnani",
    twitter: "https://twitter.com/jayhemnani",
    youtube: "https://youtube.com/@jayhemnani",
  },
  
  // Hero content
  hero: {
    title: "Jay Hemnani",
    role: "Data Engineer",
    tagline: "Shipping production CV systems and end-to-end data platforms.",
    subTagline: "Full-stack builder with sports domain expertise. Fast iteration, production-ready code.",
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

