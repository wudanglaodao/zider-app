import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/wix-app-widgets/beforeafter-slider-x",
        destination: "/forum/apps/beforeafter-slider-x",
        statusCode: 301,
      },
      {
        source: "/wix-app-widgets/store-content-suite",
        destination: "/forum/apps/store-content-suite",
        statusCode: 301,
      },
      {
        source: "/question/zider-copy-button",
        destination: "/forum/apps/zider-copy-button-clipboard",
        statusCode: 301,
      },
    ];
  },
};

export default nextConfig;
