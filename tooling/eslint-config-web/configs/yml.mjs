import ymlPlugin from 'eslint-plugin-yml';

/** @type {import('eslint').Linter.Config[]} */
export default [
  ...ymlPlugin.configs['flat/standard'],
  ...ymlPlugin.configs['flat/prettier'],
  {
    files: ['**/*.yml', '**/*.yaml'],
    rules: {
      'yml/indent': ['error', 2],
      'yml/quotes': ['error', { avoidEscape: true, prefer: 'single' }],
      'yml/spaced-comment': ['error'],
    },
  },
];
