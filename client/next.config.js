/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    NEXT_PUBLIC_MAP_API_KEY: process.env.MAP_API_KEY,
  },
  // ... other config options
}

module.exports = nextConfig