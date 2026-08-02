import perfectionistPlugin from 'eslint-plugin-perfectionist';

/** @type {import('eslint').Linter.Config[]} */
export default [
  perfectionistPlugin.configs['recommended-natural'],
  {
    rules: {
      'perfectionist/sort-exports': [
        'error',
        {
          groupKind: 'mixed',
          ignoreCase: true,
          matcher: 'minimatch',
          order: 'asc',
          partitionByComment: false,
          partitionByNewLine: false,
          specialCharacters: 'keep',
          type: 'alphabetical',
        },
      ],
      /* We favor the `import-x/order` rule over `perfectionist/sort-imports` because the
         `import-x/order` rule supports grouping imports by path. */
      'perfectionist/sort-imports': 'off',
    },
  },
];
