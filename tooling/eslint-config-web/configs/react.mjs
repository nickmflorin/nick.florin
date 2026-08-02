import eslintReactPlugin from '@eslint-react/eslint-plugin';
import jsxA11yPlugin from 'eslint-plugin-jsx-a11y';
import reactPlugin from 'eslint-plugin-react';
import reactHooksPlugin from 'eslint-plugin-react-hooks';
import testingLibraryPlugin from 'eslint-plugin-testing-library';

/**
 * A glob pattern to allow components to be suffixed with '_Deprecated'.
 */
const JsxPascalCaseIgnore = ['*_Deprecated'];

const testFilePatterns = [
  '**/*.test.ts',
  '**/*.test.tsx',
  '**/*.spec.ts',
  '**/*.spec.tsx',
  '**/*.test.js',
  '**/*.test.jsx',
  '**/*.spec.js',
  '**/*.spec.jsx',
];

/** @type {import('eslint').Linter.Config[]} */
export default [
  {
    plugins: {
      '@eslint-react': eslintReactPlugin,
      'jsx-a11y': jsxA11yPlugin,
      /* @deprecated 'eslint-plugin-react' is outdated (syntactic-only analysis, no React 19
         migration rules, TS as an afterthought) and should be incrementally replaced with the
         modern, type-aware '@eslint-react/eslint-plugin'. New rules should be added from
         '@eslint-react' — only the existing 'react/*' rules below should remain until they are
         migrated to their '@eslint-react' equivalents. */
      react: reactPlugin,
      'react-hooks': reactHooksPlugin,
    },
    rules: {
      ...reactPlugin.configs.recommended.rules,
      ...reactPlugin.configs['jsx-runtime'].rules,
      /* The 'recommended' preset of 'eslint-plugin-react-hooks' v6 is a flat config array rather
         than a single config object, so its rules have to be merged out of its entries.  Spreading
         '.rules' off of the array itself silently contributes nothing. */
      ...Object.assign({}, ...reactHooksPlugin.configs.recommended.map(c => c.rules ?? {})),
      ...jsxA11yPlugin.configs.strict.rules,
      '@eslint-react/exhaustive-deps': 'error',
      /* React 19 deprecation rules ('@eslint-react' is only used for these for now — see the
         deprecation comment on 'eslint-plugin-react' above). */
      '@eslint-react/no-context-provider': 'error',
      '@eslint-react/no-forward-ref': 'error',
      '@eslint-react/no-use-context': 'error',
      'react/boolean-prop-naming': [
        'error',
        {
          propTypeNames: ['bool', 'mutuallyExclusiveTrueProps'],
          rule: '^(are|is|has|can|will|should)[A-Z]([A-Za-z0-9]?)+',
        },
      ],
      'react/display-name': 'off',
      'react/forbid-elements': 'error',
      'react/forward-ref-uses-ref': 'error',
      'react/function-component-definition': [2, { namedComponents: 'arrow-function' }],
      'react/hook-use-state': 'error',
      'react/jsx-boolean-value': 'error',
      'react/jsx-curly-brace-presence': [2, { children: 'never', props: 'never' }],
      'react/jsx-filename-extension': [2, { allow: 'as-needed', extensions: ['.jsx', '.tsx'] }],
      'react/jsx-newline': [1, { prevent: true }],
      'react/jsx-no-duplicate-props': 'error',
      'react/jsx-no-target-blank': 'warn',
      'react/jsx-no-useless-fragment': ['error', { allowExpressions: true }],
      'react/jsx-pascal-case': ['error', { ignore: JsxPascalCaseIgnore }],
      'react/jsx-props-no-multi-spaces': 'error',
      'react/jsx-props-no-spread-multi': 'error',
      'react/jsx-wrap-multilines': 'off',
      'react/no-multi-comp': ['error', { ignoreStateless: true }],
      'react/no-unused-prop-types': 'error',
      'react/prefer-read-only-props': 'error',
      'react/prop-types': 'off',
      'react-hooks/exhaustive-deps': 'off',
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
  },
  {
    files: testFilePatterns,
    plugins: {
      'testing-library': testingLibraryPlugin,
    },
    rules: {
      ...testingLibraryPlugin.configs['flat/react'].rules,
      'react/forbid-elements': 'off',
    },
  },
];
