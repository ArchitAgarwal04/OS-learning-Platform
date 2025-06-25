/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  headers: async () => {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: `default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://www.google-analytics.com https://analytics.google.com; connect-src 'self' https://www.google-analytics.com https://analytics.google.com https://*.supabase.co https://*.supabase.in; style-src 'self' 'unsafe-inline'; img-src 'self' data: https://www.google-analytics.com https://*.supabase.co; font-src 'self' data:;`,
          },
        ],
      },
    ];
  },
}

export default nextConfig
