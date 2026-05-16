import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Accept dev requests from the cloudflared quick tunnel so cross-origin asset
  // requests (HMR, _next/static, etc.) don't get blocked when viewing from
  // another machine. Wildcard covers tunnel restarts.
  allowedDevOrigins: ["*.trycloudflare.com"],
};

export default nextConfig;
