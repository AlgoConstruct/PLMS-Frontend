import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: [
    "@pathwayiq/ui",
    "@pathwayiq/auth",
    "@pathwayiq/api",
    "@pathwayiq/access",
    "@pathwayiq/feature-iam-admin",
    "@pathwayiq/feature-learning",
    "@pathwayiq/feature-projects",
    "@pathwayiq/collaboration",
  ],
};

export default nextConfig;
