import path from "path";
import { fileURLToPath } from "url";

import withBundleAnalyzer from "@next/bundle-analyzer";
// import StylelintPlugin from "stylelint-webpack-plugin";

/* Avoids the error: "ReferenceError: __dirname is not defined in ES module scope", which occurs if
   you refer to the __dirname global variable in an ES (ECMAScript) module.

  See: https://www.decodingweb.dev/dirname-is-not-defined-in-es-module-scope-fix */
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** @type {import("next").NextConfig} */
const config = {
  swcMinify: true,
  output: "standalone",
  i18n: {
    locales: ["en"],
    defaultLocale: "en",
  },
  reactStrictMode: false,
  experimental: {
    optimizePackageImports: ["@mantine/core", "zod"],
  },
  // webpack: config => {
  //   /* The StylelintPlugin requires the addition to the package.json: "postcss": "^8.4.18". */
  //   config.plugins.push(new StylelintPlugin());
  //   return config;
  // },
  sassOptions: {
    includePaths: [path.join(__dirname, "src/styles")],
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.clerk.dev",
        port: "",
      },
    ],
  },
  redirects: async () => [
    {
      source: "/",
      destination: "/dashboard",
      permanent: false,
    },
    {
      source: "/resume",
      destination: "/resume/experience",
      permanent: false,
    },
    {
      source: "/admin",
      destination: "/admin/skills",
      permanent: false,
    },
    {
      source: "/projects",
      destination: "/projects/asset-visualizations",
      permanent: false,
    },
  ],
};

const bundled = (phase, { defaultConfig }) =>
  withBundleAnalyzer({
    enabled: process.env.ANALYZE_BUNDLE === "true" && phase === "phase-production-build",
  })({
    ...defaultConfig,
    ...config,
  });

export default bundled;
