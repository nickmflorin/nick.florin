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

/**
 * The files that must not be linted against Next's conventions, because framework APIs are exactly
 * what they are required to avoid.
 *
 * The print-form resume document is rendered by two consumers: the app's '(document)' routes, and
 * a standalone generation script that renders the same components with 'renderToStaticMarkup' and
 * writes static HTML that is opened over 'file://'. That second consumer is what forces the
 * constraint. The components may only use semantic HTML and class names, so images are plain 'img'
 * elements rather than 'next/image'; the script supplies the surrounding document itself, so it
 * declares 'html', 'head' and 'link' and loads its stylesheet with a plain tag.
 *
 * Next's rules argue for the framework APIs that both are deliberately not using, so the preset is
 * switched off across these trees rather than suppressed line by line.
 */
const NonNextFiles = [
  'src/documents/**/*.ts',
  'src/documents/**/*.tsx',
  'src/scripts/generate-resume/**/*.ts',
  'src/scripts/generate-resume/**/*.tsx',
];

/**
 * Every rule that Next's 'core-web-vitals' preset enables, turned off.
 *
 * The preset is composed into the configuration below without a 'files' restriction, so it applies
 * to every file in the repository and has to be switched off explicitly where it does not belong.
 * The rules are derived from the preset rather than listed by hand so that this cannot fall out of
 * date as the plugin adds or removes them.
 */
const DisabledNextRules = Object.fromEntries(
  Object.keys(nextPlugin.configs['core-web-vitals'].rules).map(rule => [rule, 'off']),
);

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
    files: NonNextFiles,
    rules: DisabledNextRules,
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
