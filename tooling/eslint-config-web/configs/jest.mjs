import jestPlugin from 'eslint-plugin-jest';

import { GrandfatherInRuleSeverity } from '../constants.mjs';

const Ts = ['.ts', '.mts', '.tsx'];
const Js = ['.mjs', '.cjs', '.js', '.jsx'];

const SetupFilePatterns = [
  '**/jest.*.setup*',
  '**/jest.*.setup*',
  '**/jest.*.config',
  '**/jest.*.presetup*',
  '**/jest.*.presetup*',
];

const withExt = (pattern, ext) => (ext.startsWith('.') ? `${pattern}${ext}` : `${pattern}.${ext}`);

const filePatterns = (patterns, scope) => {
  switch (scope) {
    case 'both':
      return [...Ts, ...Js].flatMap(ext => patterns.map(pattern => withExt(pattern, ext)));
    case 'js':
      return Js.flatMap(ext => patterns.map(pattern => withExt(pattern, ext)));
    case 'ts':
      return Ts.flatMap(ext => patterns.map(pattern => withExt(pattern, ext)));
    default:
      throw new Error(`Invalid scope ${scope}!`);
  }
};

const TestFilePatterns = ['**/*.test', '**/*.spec'];

/** @type {import('eslint').Linter.Config[]} */
export default [
  {
    ...jestPlugin.configs['flat/all'],
    files: [...filePatterns(SetupFilePatterns, 'both'), ...filePatterns(TestFilePatterns, 'both')],
    rules: {
      ...jestPlugin.configs['flat/all'].rules,
      'import/no-self-import': GrandfatherInRuleSeverity,
      'jest/consistent-test-it': 'error',
      'jest/max-nested-describe': ['error', { max: 6 }],
      'jest/no-disabled-tests': 'warn',
      'jest/no-duplicate-hooks': 'error',
      'jest/no-hooks': 'off',
      'jest/padding-around-after-all-blocks': 'off',
      'jest/padding-around-after-each-blocks': 'off',
      'jest/padding-around-all': 'off',
      'jest/padding-around-before-all-blocks': 'off',
      'jest/padding-around-describe-blocks': 'error',
      'jest/padding-around-expect-groups': 'off',
      'jest/padding-around-test-blocks': 'error',
      'jest/prefer-ending-with-an-expect': 'off',
      'jest/prefer-expect-assertions': [
        'error',
        {
          onlyFunctionsWithAsyncKeyword: true,
        },
      ],
      'jest/prefer-importing-jest-globals': 'off',
      'jest/prefer-todo': 'error',
      'jest/require-hook': 'off',
      'jest/unbound-method': 'off',
      'jest/valid-expect': ['error', { maxArgs: 2 }],
      'max-lines': ['error', { max: 800, skipBlankLines: true, skipComments: true }],
    },
  },
  {
    files: filePatterns(SetupFilePatterns, 'both'),
    rules: {
      'no-console': 'off',
    },
  },
  {
    files: [...filePatterns(SetupFilePatterns, 'ts'), ...filePatterns(TestFilePatterns, 'ts')],
    rules: {
      '@typescript-eslint/consistent-type-imports': [
        'error',
        {
          disallowTypeAnnotations: false,
          fixStyle: 'inline-type-imports',
          prefer: 'type-imports',
        },
      ],
      '@typescript-eslint/require-await': 'off',
      '@typescript-eslint/unbound-method': 'off',
    },
  },
];
