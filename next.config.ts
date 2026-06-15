import type { NextConfig } from "next";

const isMobile = process.env.BUILD_TARGET === "mobile";

const nextConfig: NextConfig = {
  output: isMobile ? "export" : "standalone",
  trailingSlash: isMobile,
  outputFileTracingExcludes: isMobile ? undefined : {
    "/*": ["data/*.private.json"],
  },
  serverExternalPackages: isMobile ? undefined : ["ali-oss"],
  images: {
    unoptimized: isMobile,
    remotePatterns: [
      { protocol: "https", hostname: "**.aliyuncs.com" },
      { protocol: "http", hostname: "**.aliyuncs.com" },
      { protocol: "https", hostname: "**.supabase.co" },
    ],
  },
};

export default nextConfig;
