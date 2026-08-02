import importPlugin from 'eslint-plugin-import-x';

import { ModuleGroups } from '../constants.mjs';
import { generateAbsoluteImports } from '../support.mjs';

const withCommonConfigFileExtensions = pattern => {
  const extensions = ['.js', '.cjs', '.mjs', '.jsx', '.ts', '.mts', '.cts'];
  return extensions.map(ext => {
    const base = pattern.endsWith('.') ? `${pattern.slice(0, -1)}${ext}` : `${pattern}${ext}`;
    return `**/${base}`;
  });
};

const CommonConfigFilePatterns = [
  '*.config',
  'jest.*',
  'codegen',
  '*.setup',
  'eslint.config.format',
];

/**
 * Rules that are turned off due to their performance cost.
 *
 * @see https://typescript-eslint.io/troubleshooting/typed-linting/performance
 */
const TurnOffPerformanceIntensiveRules = {
  'import/default': 'off',
  'import/no-deprecated': 'off',
  'import/no-named-as-default-member': 'off',
  'import/no-unresolved': 'off',
};

/**
 * A RegExp that defines the absolute import paths that should be considered "internal" by the
 * 'import/internal-regex' setting.  Every first-party module in the project is addressed through
 * the '~/' alias, which maps to the 'src' directory.
 */
const InternalImportRegex = '^~/';

/**
 * Defines the settings for the "eslint-plugin-import-x" plugin.
 *
 * The "eslint-plugin-import-x" plugin is registered under the 'import' namespace for backwards
 * compatibility with existing inline eslint-disable comments that reference 'import/'-prefixed
 * rules (e.g. `// eslint-disable-next-line import/no-default-export`).  As such, the keys that are
 * used to identify the 'rules' in the configuration use 'import/*'.  However, the settings keys
 * must be prefixed with 'import-x/' to be read by the plugin - 'import/'-prefixed settings keys are
 * silently ignored by "eslint-plugin-import-x".
 */
const ImportSettings = {
  'import-x/internal-regex': InternalImportRegex,
  'import-x/parsers': {
    '@typescript-eslint/parser': ['.ts', '.tsx'],
  },
  'import-x/resolver': {
    typescript: {
      alwaysTryTypes: true,
    },
  },
};

/**
 * The 'pathGroups' entries that position each group of first-party modules, {@link ModuleGroups},
 * inside of the 'internal' import group.  The groups are emitted in the order they are defined,
 * which is what causes imports of lower application layers to be ordered above imports of higher
 * application layers.
 */
const ModulePathGroups = ModuleGroups.map(group => ({
  group: 'internal',
  pattern: `{${group.flatMap(module => generateAbsoluteImports(module)).join(',')}}`,
  position: 'before',
}));

/**
 * Import rules using eslint-plugin-import-x registered under the 'import' namespace for backwards
 * compatibility with existing inline eslint-disable comments.
 *
 * @type {import('eslint').Linter.Config[]}
 */
export default [
  {
    plugins: {
      import: importPlugin,
    },
    rules: {
      'import/consistent-type-specifier-style': ['error', 'prefer-inline'],
      'import/export': 'error',
      'import/first': 'error',
      'import/named': 'off',
      'import/namespace': 'off',
      'import/newline-after-import': [
        'error',
        { considerComments: true, count: 1, exactCount: true },
      ],
      'import/no-cycle': process.env.CI === 'true' ? ['warn', { ignoreExternal: true }] : 'off',
      'import/no-default-export': 'error',
      'import/no-duplicates': ['error', { 'prefer-inline': true }],
      'import/no-empty-named-blocks': 'error',
      'import/no-mutable-exports': 'error',
      'import/no-relative-packages': 'error',
      'import/no-relative-parent-imports': 'off',
      'import/no-self-import': 'error',
      'import/no-useless-path-segments': ['error', { commonjs: true, noUselessIndex: true }],
      'import/order': [
        'error',
        {
          alphabetize: {
            caseInsensitive: true,
            order: 'asc',
            orderImportKind: 'asc',
          },
          distinctGroup: true,
          groups: [
            'builtin',
            'external',
            'type',
            'internal',
            'parent',
            'sibling',
            'index',
            'object',
          ],
          'newlines-between': 'always',
          pathGroups: [
            {
              group: 'builtin',
              pattern: 'server-only',
              position: 'before',
            },
            {
              group: 'builtin',
              pattern: '{react,react/**,next,next/**}',
              position: 'after',
            },
            {
              group: 'external',
              pattern: '{@prisma,@prisma/**,prisma,prisma/**}',
              position: 'after',
            },
            ...ModulePathGroups,
            {
              group: 'sibling',
              pattern: '{../*}',
              position: 'before',
            },
            {
              group: 'sibling',
              pattern: '{./*}',
              position: 'after',
            },
          ],
          pathGroupsExcludedImportTypes: ['react', 'next'],
          warnOnUnassignedImports: true,
        },
      ],
      'import/prefer-default-export': 'off',
      ...TurnOffPerformanceIntensiveRules,
    },
    settings: ImportSettings,
  },
  {
    files: CommonConfigFilePatterns.flatMap(pattern => withCommonConfigFileExtensions(pattern)),
    rules: {
      'import/no-default-export': 'off',
    },
  },
];
