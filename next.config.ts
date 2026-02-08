import type { NextConfig } from "next";

/**
 * GitHub Pages Deployment Configuration
 *
 * For custom domain (jayhemnani.me): Leave basePath/assetPrefix empty
 * For repo path (username.github.io/repo): Set basePath to "/repo-name"
 *
 * Toggle via environment variable: NEXT_PUBLIC_BASE_PATH
 */
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

const nextConfig: NextConfig = {
  output: "export",
  
  // GitHub Pages path configuration
  basePath: basePath,
  assetPrefix: basePath ? `${basePath}/` : undefined,
  
  // Static export settings
  trailingSlash: true,  // Required for GitHub Pages static hosting
  
  images: {
    unoptimized: true,  // Required for static export
  },
  
  // Ensure clean URLs work
  skipTrailingSlashRedirect: true,
};

export default nextConfig;
