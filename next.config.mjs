import path from "path";
import { fileURLToPath } from "url";

import withBundleAnalyzer from "@next/bundle-analyzer";

/* Avoids the error: "ReferenceError: __dirname is not defined in ES module scope", which occurs if
   you refer to the __dirname global variable in an ES (ECMAScript) module.

  See: https://www.decodingweb.dev/dirname-is-not-defined-in-es-module-scope-fix */
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** @type {import("next").NextConfig} */
const config = {
  output: "standalone",
  reactStrictMode: false,
  logging: {
    /* Next 16 forwards browser console output to the dev server's terminal, defaulting to "warn".
       That surfaces third-party warnings which previously only appeared in the browser console -
       Clerk's structural CSS notice alone prints ~15 lines on every page load.

       Errors are still forwarded, since those are worth seeing without switching to the browser.
       Set this to false to disable the forwarding entirely. */
    browserToTerminal: "error",
  },
  experimental: {
    optimizePackageImports: ["@mantine/core", "zod", "@mantine/dropzone", "@mantine/dates"],
  },
  transpilePackages: ["@mantine/core"],
  sassOptions: {
    /* The modern Sass API - which sass-loader v16 uses as of Next 16 - replaces the legacy
       "includePaths" option with "loadPaths". */
    loadPaths: [path.join(__dirname, "src/styles")],
    /* Sass is changing the ordering of declarations that follow nested rules to match CSS.  The
       tractable occurrences of this in our stylesheets have been fixed, but the button color
       system generates declarations inside '@at-root' blocks via 'mapped-properties()', which
       still emits a few hundred warnings on every compile and needs restructuring to resolve.

       This must be removed - and that restructuring done - before upgrading to Dart Sass 2. */
    silenceDeprecations: ["mixed-decls"],
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.clerk.dev",
        port: "",
      },
      {
        protocol: "https",
        hostname: "img.clerk.com",
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
      destination: "/projects/greenbudget",
      permanent: false,
    },
  ],
};

/* The bundle analyzer injects a "webpack" option into the configuration.  Because Next 16 builds
   with Turbopack by default - and fails the build outright when it encounters a webpack
   configuration it did not expect - the analyzer is only applied when it is actually in use, via
   the "analyze-build" script, which opts back into webpack with the "--webpack" flag. */
export default process.env.ANALYZE_BUNDLE === "true"
  ? withBundleAnalyzer({ enabled: true })(config)
  : config;
