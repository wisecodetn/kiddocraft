import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  // Driver packages load from node_modules instead of being bundled.
  serverExternalPackages: ["pg", "@prisma/adapter-pg", "sharp"],
  images: {
    formats: ["image/avif", "image/webp"],
  },
  experimental: {
    // Product photos are uploaded through server actions.
    serverActions: { bodySizeLimit: "25mb" },
  },
};

export default withNextIntl(nextConfig);
