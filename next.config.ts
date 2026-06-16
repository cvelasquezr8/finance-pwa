import path from 'node:path'
import type { NextConfig } from 'next'
import withPWAInit from '@ducanh2912/next-pwa'

// ─── Build-time mock resolution (mirrors src/services/api-config.ts) ───────────
const rawHost = (process.env.NEXT_PUBLIC_API_HOST ?? '').trim()
const forceMock = String(process.env.NEXT_PUBLIC_FORCE_MOCK ?? '').toLowerCase() === 'true'
const USE_MOCK = forceMock || rawHost.length === 0
const isProd = process.env.NODE_ENV === 'production'

// Guard against shipping a production build that serves in-memory mocks and
// hardcoded demo credentials. In a deploy pipeline (CI / PROD_BUILD) this is a hard
// error; for a local `next build` (used to test the PWA against mocks) it only warns.
// The real guarantee is the webpack replacement below: when the build targets a real
// API (USE_MOCK=false) the mock module is physically swapped for a throwing stub.
const isDeployPipeline = Boolean(process.env.CI || process.env.PROD_BUILD)
if (isProd && USE_MOCK) {
  const msg =
    '[next.config] Building for production with mocks enabled. ' +
    'Production must set NEXT_PUBLIC_API_HOST and leave NEXT_PUBLIC_FORCE_MOCK unset.'
  if (isDeployPipeline) throw new Error(`Refusing to deploy. ${msg}`)
  console.warn(`⚠️  ${msg}`)
}

// Origin allowed for XHR/fetch in the CSP connect-src directive.
function apiConnectSrc(): string {
  if (!rawHost) return ''
  try {
    const withScheme = /^https?:\/\//i.test(rawHost) ? rawHost : `https://${rawHost}`
    return new URL(withScheme).origin
  } catch {
    return ''
  }
}

const csp = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "frame-ancestors 'none'",
  "form-action 'self'",
  // Next.js + the inline anti-FOUC theme script need inline scripts. A nonce-based
  // strict CSP is a follow-up (requires middleware); 'unsafe-inline' is the interim.
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self' data:",
  `connect-src 'self' ${apiConnectSrc()}`.trim(),
  "manifest-src 'self'",
  'upgrade-insecure-requests',
].join('; ')

const securityHeaders = [
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
  // CSP only in production to avoid blocking dev HMR websockets / eval.
  ...(isProd ? [{ key: 'Content-Security-Policy', value: csp }] : []),
]

const withPWA = withPWAInit({
  dest: 'public',
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: true,
  reloadOnOnline: true,
  disable: process.env.NODE_ENV === 'development',
  workboxOptions: {
    disableDevLogs: true,
    // SECURITY: never cache authenticated API responses (financial data) in the
    // service worker. Only same-origin static assets are cached; API calls always
    // hit the network and leave no copy in Cache Storage.
    runtimeCaching: [
      {
        urlPattern: ({ request, sameOrigin }) =>
          sameOrigin && ['style', 'script', 'worker'].includes(request.destination),
        handler: 'StaleWhileRevalidate',
        options: { cacheName: 'static-resources' },
      },
      {
        urlPattern: ({ request, sameOrigin }) =>
          sameOrigin && ['image', 'font'].includes(request.destination),
        handler: 'CacheFirst',
        options: {
          cacheName: 'static-assets',
          expiration: { maxEntries: 64, maxAgeSeconds: 30 * 24 * 60 * 60 },
        },
      },
    ],
  },
})

const nextConfig: NextConfig = {
  reactStrictMode: true,
  async headers() {
    return [{ source: '/:path*', headers: securityHeaders }]
  },
  webpack(config, { webpack }) {
    // SECURITY: in production real-API builds, physically replace the mock module
    // (seed users + demo credentials) with a throwing stub so it never ships.
    if (!USE_MOCK) {
      config.plugins.push(
        new webpack.NormalModuleReplacementPlugin(
          /[\\/]mock[\\/]MockAdapter$/,
          path.resolve(process.cwd(), 'src/services/mock/MockAdapter.stub.ts')
        )
      )
    }
    return config
  },
}

export default withPWA(nextConfig)
