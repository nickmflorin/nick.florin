import unicornPlugin from 'eslint-plugin-unicorn';

/** @type {import('eslint').Linter.Config[]} */
export default [
  {
    plugins: {
      unicorn: unicornPlugin,
    },
    rules: {
      'unicorn/error-message': 'error',
      'unicorn/no-abusive-eslint-disable': 'error',
      'unicorn/no-immediate-mutation': 'error',
      'unicorn/no-manually-wrapped-comments': 'error',
    },
  },
];
