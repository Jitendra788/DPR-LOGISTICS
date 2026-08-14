import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["@prisma/client", "prisma"],
  outputFileTracingIncludes: {
    "/*": ["./prisma/prod.db"],
  },
};

export default nextConfig;
