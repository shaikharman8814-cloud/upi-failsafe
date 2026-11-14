/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['postgres', 'sharp', 'nodemailer', 'imapflow', 'mailparser'],
    instrumentationHook: true,
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
  // Do not add trailing slashes to routes (e.g. /how-it-works, not /how-it-works/).
  trailingSlash: false,
  // Baseline hardening applied to every response.
  poweredByHeader: false,
  // Canonicalise the www host onto the apex domain (301/308 permanent).
  async redirects() {
    return [
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'www.resolves.help' }],
        destination: 'https://resolves.help/:path*',
        permanent: true,
      },
    ]
  },
  async headers() {
    const isDev = process.env.NODE_ENV !== 'production'

    // Content-Security-Policy. Development needs 'unsafe-eval' (webpack HMR +
    // React refresh) and ws: (dev websockets), and must NOT force HTTPS upgrades
    // or http://localhost breaks in Safari/Brave. Production stays strict.
    const scriptSrc = isDev
      ? "script-src 'self' 'unsafe-inline' 'unsafe-eval'"
      : "script-src 'self' 'unsafe-inline'"
    const connectSrc = isDev
      ? "connect-src 'self' ws: wss: https://*.supabase.co"
      : "connect-src 'self' https://*.supabase.co"

    const csp = [
      "default-src 'self'",
      scriptSrc,
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob: https://*.supabase.co",
      "font-src 'self' data:",
      connectSrc,
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "object-src 'none'",
      ...(isDev ? [] : ['upgrade-insecure-requests']),
    ].join('; ')

    return [
      {
        source: '/:path*',
        headers: [
          { key: 'Content-Security-Policy', value: csp },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), payment=(), usb=()',
          },
          { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
          { key: 'Cross-Origin-Resource-Policy', value: 'same-origin' },
          { key: 'X-Permitted-Cross-Domain-Policies', value: 'none' },
          // HSTS only makes sense over HTTPS (ignored on http://localhost).
          ...(isDev
            ? []
            : [
                {
                  key: 'Strict-Transport-Security',
                  value: 'max-age=63072000; includeSubDomains; preload',
                },
              ]),
        ],
      },
      {
        // Never cache API responses (they carry per-request data / auth).
        source: '/api/:path*',
        headers: [{ key: 'Cache-Control', value: 'no-store, max-age=0' }],
      },
    ]
  },
}

export default nextConfig
