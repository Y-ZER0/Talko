/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@repo/shared"],
  devIndicators: false,
};

module.exports = nextConfig;
