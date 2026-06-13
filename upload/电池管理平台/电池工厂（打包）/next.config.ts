import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // output: "standalone",
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  allowedDevOrigins: [
    'preview-chat-2fe1bee9-a90f-4e7b-a7b4-7296c290a58f.space-z.ai',
    '.space-z.ai',
    '.space.chatglm.site',
    '.chatglm.site',
  ],
};

export default nextConfig;
