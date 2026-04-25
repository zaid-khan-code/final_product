import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  async rewrites() {
    return [
      {
        source: "/api/:path((?!auth/).*)",
        destination: "/api/proxy/:path*",
      },
    ];
  },
};

export default nextConfig;
