import nPlugin from 'eslint-plugin-n';

/** @type {import('eslint').Linter.Config[]} */
export default [
  {
    plugins: {
      n: nPlugin,
    },
  },
];
