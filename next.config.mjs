/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Desabilita redirecionamento de trailing slash para API routes
  skipTrailingSlashRedirect: true,
  // Configurações para Telegram Mini App
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Frame-Options",
            value: "SAMEORIGIN",
          },
          {
            key: "Content-Security-Policy",
            value:
              "frame-ancestors 'self' https://web.telegram.org https://webk.telegram.org https://webz.telegram.org;",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
