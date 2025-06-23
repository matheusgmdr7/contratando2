/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    webpackBuildWorker: true,
  },
  images: {
    domains: ['images.unsplash.com', 'plus.unsplash.com'],
  },
}

export default nextConfig
