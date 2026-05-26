import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/wix-app-widgets/beforeafter-slider-x",
        destination: "/forum/apps/beforeafter-slider-x",
        statusCode: 301,
      },
    ];
  },
};

export default nextConfig;
