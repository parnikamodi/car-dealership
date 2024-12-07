/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'firebasestorage.googleapis.com'
      }
    ]
  },
  reactStrictMode: true,
  poweredByHeader: false,
  // Add this configuration
  output: 'standalone'
}

module.exports = nextConfig