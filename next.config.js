/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Static export → `next build` emits ./out for FTP deploy to cPanel (no Node
  // runtime on the server). Valid here because every admin route is static.
  output: 'export',
  // cPanel/Apache serves /login as /login/index.html via DirectoryIndex.
  trailingSlash: true,
  // No Next image optimizer without a Node server.
  images: { unoptimized: true },
};

module.exports = nextConfig;
