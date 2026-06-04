import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV !== "production";

// In development React needs eval() for fast refresh / debugging. Production
// never uses eval, so we only loosen script-src when running locally.
const scriptSrc = isDev
  ? "script-src 'self' 'unsafe-inline' 'unsafe-eval'"
  : "script-src 'self' 'unsafe-inline'";

// Security headers applied to every response. These harden the app against
// common browser-based attacks (clickjacking, MIME sniffing, content injection).
const securityHeaders = [
  // Block the page from being embedded in an <iframe> on other sites (clickjacking).
  { key: "X-Frame-Options", value: "DENY" },
  // Stop the browser from guessing/overriding declared content types.
  { key: "X-Content-Type-Options", value: "nosniff" },
  // Don't leak full URLs to other sites in the Referer header.
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // Lock down powerful browser features we don't use.
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  // Content Security Policy: only load resources from our own origin. This is the
  // main defense-in-depth against XSS — even if bad markup slipped through, the
  // browser won't execute injected external scripts.
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      // Next.js needs inline styles; 'unsafe-inline' for styles only, not scripts.
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data:",
      "font-src 'self' data:",
      scriptSrc,
      "connect-src 'self'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'none'",
    ].join("; "),
  },
];

const nextConfig: NextConfig = {
  // Pin the workspace root to this folder (a stray lockfile in the home dir was
  // confusing Next's auto-detection).
  turbopack: { root: __dirname },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
