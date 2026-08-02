import globals from 'globals';

import { constructRestrictedImportsRule, constructRestrictedSyntaxRule } from '../support.mjs';

/**
 * A regex pattern that allows variables, functions, components, classes, etc. to be suffixed with
 * '_deprecated' or '_Deprecated' without causing a camelcase violation.
 *
 * @see https://eslint.org/docs/latest/rules/camelcase
 */
// cspell:disable-next-line
const AllowedCamelCaseDeprecatedRegex = '^[A-Za-z]+_[D|d]eprecated';

/**
 * A regex pattern that allows variables, functions, components, classes, etc. to be prefixed
 * with 'unsafe_' or 'Unsafe_' without causing a camelcase violation.
 *
 * @see https://eslint.org/docs/latest/rules/camelcase
 */
// cspell:disable-next-line
const AllowedCamelCaseUnsafeRegex = '^[U|u]nsafe_[A-Za-z]+';

/** @type {import('eslint').Linter.Config[]} */
export default [
  {
    languageOptions: {
      ecmaVersion: 'latest',
      globals: {
        ...globals.browser,
        ...globals.es2021,
        ...globals.jest,
        ...globals.node,
      },
      sourceType: 'module',
    },
    linterOptions: {
      reportUnusedDisableDirectives: 'error',
    },
    rules: {
      'arrow-body-style': ['error', 'as-needed'],
      camelcase: [
        'error',
        {
          allow: [AllowedCamelCaseDeprecatedRegex, AllowedCamelCaseUnsafeRegex],
          ignoreDestructuring: true,
        },
      ],
      curly: 'error',
      'dot-notation': ['error', { allowKeywords: true }],
      eqeqeq: 'error',
      'max-lines': ['error', { max: 500, skipBlankLines: true, skipComments: true }],
      'no-alert': 'error',
      'no-await-in-loop': 'error',
      'no-case-declarations': 'error',
      'no-console': 'error',
      'no-delete-var': 'error',
      'no-else-return': 'error',
      'no-empty-function': 'error',
      'no-eval': 'error',
      'no-extra-boolean-cast': 'error',
      'no-inline-comments': 'error',
      'no-lonely-if': 'error',
      'no-multi-assign': 'error',
      'no-multi-str': 'error',
      'no-multiple-empty-lines': 'error',
      'no-negated-condition': 'error',
      'no-param-reassign': 'error',
      'no-restricted-imports': constructRestrictedImportsRule(),
      'no-restricted-properties': [
        'error',
        {
          message:
            'While safe for local development, usages of screen.debug() cannot be committed ' +
            'to production.',
          object: 'screen',
          property: 'debug',
        },
      ],
      'no-restricted-syntax': constructRestrictedSyntaxRule(),
      'no-shadow': 'error',
      'no-sparse-arrays': 'error',
      'no-template-curly-in-string': 'error',
      'no-throw-literal': 'error',
      'no-unexpected-multiline': 'error',
      'no-unneeded-ternary': 'error',
      'no-unreachable': 'error',
      'no-unsafe-optional-chaining': 'error',
      'no-unused-vars': 'error',
      'no-useless-escape': 'error',
      'no-useless-rename': [
        'error',
        {
          ignoreDestructuring: false,
          ignoreExport: false,
          ignoreImport: true,
        },
      ],
      'no-useless-return': 'error',
      'no-var': 'error',
      'no-warning-comments': 'error',
      'object-curly-newline': [
        'error',
        {
          consistent: true,
          minProperties: 2,
          multiline: true,
        },
      ],
      'object-shorthand': ['error', 'properties'],
      'prefer-arrow-callback': 'error',
      'prefer-const': 'error',
      'require-atomic-updates': 'error',
      'use-isnan': 'error',
    },
  },
];
