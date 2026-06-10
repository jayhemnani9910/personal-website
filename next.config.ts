import type { NextConfig } from "next";

// Report-only to start: the browser logs violations but blocks nothing, so this
// is safe to ship. Promote to the enforcing "Content-Security-Policy" header once
// reports are clean, which will mean replacing 'unsafe-inline' with per-request
// nonces for the inline theme-flash and JSON-LD scripts (needs middleware).
const cspReportOnly = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "frame-ancestors 'none'",
  "form-action 'self'",
  "script-src 'self' 'unsafe-inline' https://va.vercel-scripts.com",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: https://avatars.githubusercontent.com",
  "font-src 'self'",
  "connect-src 'self' https://va.vercel-scripts.com https://vitals.vercel-insights.com",
  // Live project demos are embedded as iframes from these hosts.
  "frame-src 'self' https://*.github.io https://*.hf.space",
].join("; ");

const securityHeaders = [
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  { key: "Content-Security-Policy-Report-Only", value: cspReportOnly },
];

const nextConfig: NextConfig = {
  typedRoutes: true,
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      { protocol: "https", hostname: "avatars.githubusercontent.com" },
    ],
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
