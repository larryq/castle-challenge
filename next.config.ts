import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack: (config, { isServer }) => {
    // Add a rule to handle .glsl files as raw strings
    config.module.rules.push({
      test: /\.(glsl|vs|fs|vert|frag)$/, // Match common GLSL extensions
      exclude: /node_modules/, // Don't process node_modules
      use: ["webpack-glsl-loader"],
      enforce: "pre",
    });

    return config;
  },
};

export default nextConfig;
