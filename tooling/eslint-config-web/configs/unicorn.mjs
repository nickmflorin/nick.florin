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
      /* Enabled in place of the core 'no-negated-condition' (kept 'off' in base.mjs), which
         reports the same violations but does not support autofix. The unicorn implementation is
         auto-fixable, so the formatting runs correct violations instead of surfacing them as
         manual errors. */
      'unicorn/no-negated-condition': 'error',
    },
  },
];
