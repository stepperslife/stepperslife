// Conditional bundle analyzer import
let withBundleAnalyzer = (config) => config
try {
  withBundleAnalyzer = require('@next/bundle-analyzer')({
    enabled: process.env.ANALYZE === 'true',
    openAnalyzer: true,
  })
} catch (e) {
  console.warn('Bundle analyzer not available')
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // swcMinify removed - it's default in Next.js 13+
  eslint: {
    ignoreDuringBuilds: true, // Temporarily ignore lint errors for architecture migration
  },
  typescript: {
    ignoreBuildErrors: true, // Temporarily ignore for architecture migration
  },

  // Image optimization configuration
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 days
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.amazonaws.com',
      },
      {
        protocol: 'https',
        hostname: '**.cloudinary.com',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },

  // Compression
  compress: true,

  // Output file tracing for smaller Docker images
  output: 'standalone',

  // Optimize font loading
  optimizeFonts: true,

  // Enable experimental features for better performance
  experimental: {
    optimizeCss: true,
    optimizePackageImports: ['@radix-ui/react-icons', 'lucide-react', '@tremor/react'],
  },

  // Webpack configuration to handle node: protocol imports
  webpack: (config, { webpack, isServer }) => {
    // Handle node: protocol imports (fix for Prisma Client and other packages)
    const nodeModules = [
      'async_hooks',
      'child_process',
      'crypto',
      'events',
      'fs',
      'fs/promises',
      'module',
      'os',
      'path',
      'process',
      'stream',
      'url',
      'util',
      'buffer',
    ]

    nodeModules.forEach((mod) => {
      config.plugins.push(
        new webpack.NormalModuleReplacementPlugin(
          new RegExp(`^node:${mod}$`),
          mod
        )
      )
    })

    return config
  },

  async headers() {
    return [
      // Cache static assets aggressively
      {
        source: '/favicon.ico',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/images/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      // Security headers for all routes
      {
        source: '/:path*',
        headers: [
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains; preload'
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          },
          {
            key: 'Permissions-Policy',
            value: 'geolocation=(), microphone=(), camera=(), payment=(self), usb=()'
          },
          {
            key: 'Content-Security-Policy',
            // TODO: Remove 'unsafe-inline' and 'unsafe-eval' after implementing nonce-based CSP
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com https://accounts.google.com https://web.squarecdn.com",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "img-src 'self' data: https:",
              "font-src 'self' data: https://fonts.gstatic.com",
              "connect-src 'self' https://api.stripe.com https://*.resend.com https://accounts.google.com https://*.googleapis.com https://web.squarecdn.com",
              "frame-src https://js.stripe.com https://accounts.google.com",
              "media-src 'self' https:",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self'",
              "frame-ancestors 'none'",
              "upgrade-insecure-requests"
            ].join('; ')
          }
        ]
      }
    ]
  }
}

module.exports = withBundleAnalyzer(nextConfig)
