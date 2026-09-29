import type { NextConfig } from "next";

// Report-only to start: the browser reports violations but blocks nothing, so
// this is safe to ship. Reports land in the function logs via /api/csp-report.
// Promote to the enforcing "Content-Security-Policy" header once they are clean,
// which will mean replacing 'unsafe-inline' with per-request nonces for the
// inline theme-flash and JSON-LD scripts (needs middleware).
const cspReportOnly = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "frame-ancestors 'none'",
  "form-action 'self'",
  "script-src 'self' 'unsafe-inline' https://va.vercel-scripts.com",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data:",
  "font-src 'self'",
  "connect-src 'self' https://va.vercel-scripts.com https://vitals.vercel-insights.com",
  // Both forms: report-to for current browsers, report-uri for the rest.
  "report-uri /api/csp-report",
  "report-to csp",
].join("; ");

const securityHeaders = [
  // DENY to match frame-ancestors 'none', so enforcing the CSP later changes nothing.
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  { key: "Content-Security-Policy-Report-Only", value: cspReportOnly },
  { key: "Reporting-Endpoints", value: 'csp="/api/csp-report"' },
];

const nextConfig: NextConfig = {
  typedRoutes: true,
  poweredByHeader: false,
  // /api/views checks slugs against the project files at runtime, so the
  // function has to ship with them.
  outputFileTracingIncludes: {
    "/api/views": ["./content/projects/*.mdx"],
  },
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      { protocol: "https", hostname: "i.ytimg.com" },
    ],
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
