import jsonPlugin from 'eslint-plugin-json';

/**
 * The JSON files that are authored with comments and must therefore be linted as JSONC rather than
 * strict JSON.  'tsconfig.json' is included because TypeScript itself permits comments in it, and
 * this project's 'tsconfig.json' documents several non-obvious compiler options inline.
 */
const JsonWithCommentsPatterns = ['**/*.jsonc', '.vscode/*.json', 'tsconfig.json'];

/** @type {import('eslint').Linter.Config[]} */
export default [
  {
    files: ['**/*.json'],
    ignores: [...JsonWithCommentsPatterns, 'package.json'],
    ...jsonPlugin.configs.recommended,
  },
  {
    files: JsonWithCommentsPatterns,
    ...jsonPlugin.configs.recommended,
    rules: {
      'json/*': ['error', { allowComments: true }],
    },
  },
];
