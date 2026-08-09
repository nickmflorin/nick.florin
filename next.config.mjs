import path from 'path';
import { fileURLToPath } from 'url';

import withBundleAnalyzer from '@next/bundle-analyzer';

/**
 * Avoids the error "ReferenceError: __dirname is not defined in ES module scope", which occurs
 * when the `__dirname` global variable is referenced in an ES (ECMAScript) module.
 *
 * @see https://www.decodingweb.dev/dirname-is-not-defined-in-es-module-scope-fix
 */
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * The level at which Next 16 forwards browser console output to the dev server's terminal.
 *
 * Next 16 defaults this option to "warn", which surfaces third-party warnings that previously
 * only appeared in the browser console - Clerk's structural CSS notice alone prints ~15 lines on
 * every page load. Errors are still forwarded, since those are worth seeing without switching to
 * the browser; set this constant's value to `false` to disable the forwarding entirely.
 */
const BrowserToTerminalLogLevel = 'error';

/**
 * The Sass deprecation warnings that are silenced during compilation.
 *
 * Sass is changing the ordering of declarations that follow nested rules to match CSS. The
 * tractable occurrences of this in the stylesheets have been fixed, but the button color system
 * generates declarations inside '@at-root' blocks via 'mapped-properties()', which still emits a
 * few hundred warnings on every compile and needs restructuring to resolve before this can be
 * removed, ahead of upgrading to Dart Sass 2.
 */
const SilencedSassDeprecations = ['mixed-decls'];

/**
 * Whether the bundle analyzer should be applied to the Next.js configuration.
 *
 * The bundle analyzer injects a "webpack" option into the configuration. Because Next 16 builds
 * with Turbopack by default - and fails the build outright when it encounters a webpack
 * configuration it did not expect - the analyzer is only applied when it is actually in use, via
 * the "build:analyze" script, which opts back into webpack with the "--webpack" flag.
 */
const ShouldAnalyzeBundle = process.env.ANALYZE_BUNDLE === 'true';

/**
 * The maximum request body size accepted by server actions.
 *
 * Resume uploads stream the selected file through a server action's FormData body, and Next's
 * default limit of 1mb rejects any realistically sized resume PDF. The limit is sized to cover
 * the 15mb cap the upload dropzone enforces client-side, plus multipart encoding overhead.
 */
const ServerActionBodySizeLimit = '16mb';

/** @type {import("next").NextConfig} */
const config = {
  /* Prerenders cached components into the static shell and streams only what is genuinely dynamic.
     The site's routes have no per-request input left - the User-Agent viewport seed was the last of
     it - so the shell, including the header, is served without waiting on a Suspense boundary. */
  cacheComponents: true,
  experimental: {
    optimizePackageImports: ['@mantine/core', 'zod', '@mantine/dropzone', '@mantine/dates'],
    serverActions: {
      bodySizeLimit: ServerActionBodySizeLimit,
    },
  },
  images: {
    remotePatterns: [
      {
        hostname: 'images.clerk.dev',
        port: '',
        protocol: 'https',
      },
      {
        hostname: 'img.clerk.com',
        port: '',
        protocol: 'https',
      },
    ],
  },
  logging: {
    browserToTerminal: BrowserToTerminalLogLevel,
  },
  reactStrictMode: false,
  redirects: async () => [
    {
      destination: '/dashboard',
      permanent: false,
      source: '/',
    },
    {
      destination: '/resume/experience',
      permanent: false,
      source: '/resume',
    },
    {
      destination: '/admin/skills',
      permanent: false,
      source: '/admin',
    },
    {
      destination: '/projects/greenbudget',
      permanent: false,
      source: '/projects',
    },
  ],
  sassOptions: {
    /* The modern Sass API - which sass-loader v16 uses as of Next 16 - replaces the legacy
       "includePaths" option with "loadPaths". */
    loadPaths: [path.join(__dirname, 'src/styles')],
    silenceDeprecations: SilencedSassDeprecations,
  },
  transpilePackages: ['@mantine/core'],
};

export default ShouldAnalyzeBundle ? withBundleAnalyzer({ enabled: true })(config) : config;
