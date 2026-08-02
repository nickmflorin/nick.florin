import prettierPlugin from 'eslint-plugin-prettier/recommended';

/**
 * This should always be the LAST config in the array, as it turns off rules that conflict with
 * Prettier.
 *
 * @type {import('eslint').Linter.Config[]}
 */
export default [
  prettierPlugin,
  {
    rules: {
      /* Re-enable these rules that eslint-plugin-prettier turns off.
         See https://github.com/prettier/eslint-plugin-prettier?tab=readme-ov-file#arrow-body-style-and-prefer-arrow-callback-issue */
      'arrow-body-style': ['error', 'as-needed'],
      curly: ['error', 'all'],
    },
  },
];
