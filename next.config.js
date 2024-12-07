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
  swcMinify: true,
  poweredByHeader: false
}

module.exports = nextConfig