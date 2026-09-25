import type { NextConfig } from "next";

// Third-party origins were found by loading the site in a fresh browser and
// recording what it contacted: only CARTO (basemap style, tiles, sprites).
// Building tiles come from this site's own /api/tiles route, and the tile
// parsing worker is self-hosted rather than fetched from unpkg.
// script-src keeps 'unsafe-inline' because the App Router streams its own
// inline scripts; nonces would force every page to render dynamically.
const csp = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline'",
  "worker-src 'self' blob:",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://basemaps.cartocdn.com https://*.basemaps.cartocdn.com",
  "font-src 'self' data:",
  "connect-src 'self' https://basemaps.cartocdn.com https://*.basemaps.cartocdn.com",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "upgrade-insecure-requests",
].join("; ");

const securityHeaders = [
  // Only in production: the dev server relies on eval for hot reload.
  ...(process.env.NODE_ENV === "production" ? [{ key: "Content-Security-Policy", value: csp }] : []),
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=(), usb=()" },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  async headers() {
    return [{ source: "/(.*)", headers: securityHeaders }];
  },
};

export default nextConfig;
