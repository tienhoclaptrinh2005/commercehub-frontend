import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "vietqr.app",
        pathname: "/img",
      },
    ],
  },
};

export default nextConfig;
