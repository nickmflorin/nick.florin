import nextPlugin from '@next/eslint-plugin-next';

import config from '@nickflorin/eslint-config-web';
import { GrandfatherInRuleSeverity } from '@nickflorin/eslint-config-web/constants';

/**
 * The files that Next's conventions require to expose a default export, and that must therefore be
 * exempted from the 'import/no-default-export' rule.
 *
 * Everything under the 'app' directory is exempted wholesale rather than enumerating each of Next's
 * special file names (page, layout, template, loading, error, not-found, route, sitemap,
 * opengraph-image, etc.), because a route segment is only ever reachable through one of them.
 */
const NextDefaultExportFiles = [
  'src/app/**/*.ts',
  'src/app/**/*.tsx',
  'src/proxy.ts',
  'src/instrumentation.ts',
];

/** @type {import('eslint').Linter.Config[]} */
export default [
  ...config,
  nextPlugin.configs['core-web-vitals'],
  {
    /* These rules are part of the 'recommended-latest' preset of 'eslint-plugin-react-hooks' v6,
       which this project pulls in alongside Next 16 and React 19, but not of the 'recommended'
       preset that the shared configuration composes.  They are enabled explicitly here. */
    rules: {
      'react-hooks/immutability': 'error',
      'react-hooks/refs': 'error',
      'react-hooks/set-state-in-effect': 'error',
      'react-hooks/use-memo': 'error',
    },
  },
  {
    /* The Select maintains its value in state and adopts the controlled value provided by its
       consumer once the 'isReady' flag is set, which it does from an effect.  Deriving the value
       instead would change which of the two the Select treats as authoritative after it becomes
       ready, and with it the behavior of every Select in the application, so these two remain
       warnings until that value handling is reworked. */
    files: [
      'src/components/input/select/hooks/use-data-select.ts',
      'src/components/input/select/hooks/use-select.ts',
    ],
    rules: {
      'react-hooks/set-state-in-effect': GrandfatherInRuleSeverity,
    },
  },
  {
    files: NextDefaultExportFiles,
    rules: {
      'import/no-default-export': 'off',
    },
  },
  {
    /* Every module in the ESLint config package is consumed by composing its default export into
       the flat config array, which is the shape ESLint itself expects. */
    files: ['tooling/eslint-config-web/**/*.mjs'],
    rules: {
      'import/no-default-export': 'off',
    },
  },
];
