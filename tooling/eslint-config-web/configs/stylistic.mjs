import stylisticPlugin from '@stylistic/eslint-plugin';

/**
 * A glob pattern that is used to adjust the '@stylistic/jsx-pascal-case' ESLint rule in order to
 * allow components to be suffixed with '_Deprecated' in order to mark them as deprecated while
 * avoiding name collisions with the non-deprecated versions of the components.
 *
 * @see https://eslint.style/rules/jsx-pascal-case
 */
const JsxPascalCaseIgnore = ['*_Deprecated'];

/**
 * Defines a regex pattern that should be used to determine whether or not a violation of ESLint's
 * "@stylistic/max-len" rule should be ignored.
 *
 * This pattern is defined to ignore certain cases where long lines are common and often
 * unavoidable, such as import statements.  It is also used to try to catch situations where
 * "prettier" will automatically put the content on a single line, even though it exceeds both the
 * 'printWidth' defined in the Prettier configuration and the 'max-len' defined in this ESLint
 * rule - which would otherwise cause a collision between "prettier"'s formatting and ESLint's
 * stylistic rules.
 *
 * The pattern ignores six kinds of lines. The first is a single-line import or export statement
 * whose file or module path is long enough to push the line past the limit, including the closing
 * '} from 'some-really-long-path';' line of a multi-line import or export whose named exports each
 * sit on their own line; the regex still flags any other line that includes the word 'from' (such
 * as a long string) but is not actually an import or export statement. The next four are
 * dynamic imports using the 'import()' syntax; classes with 'implements' clauses, which commonly
 * appear on class definitions implementing interfaces with generic types; classes or interfaces
 * with 'extends' clauses, which commonly appear on class definitions extending base classes with
 * generic types or interfaces extending other interfaces with generic types; and anything that
 * looks like a path to a package, file or module.
 *
 * The sixth is a line of JSX text that ends in the '{' '}' separator, and only when everything
 * before that separator is itself within the limit. "prettier" emits the separator when it breaks
 * a line before an inline element, to preserve a space that JSX would otherwise trim - and it does
 * not count those five characters against its own 'printWidth'. The result is a line "prettier"
 * considers correctly wrapped, will re-wrap identically if it is hand-split, and which 'max-len'
 * reads as five characters too long. The length bound is what keeps this narrow: a line that would
 * still be over the limit without the separator is genuinely too long and is still reported.
 *
 * @see https://eslint.style/rules/max-len
 */
const IgnoreMaxLengthRegexPattern =
  '^\\s*(import|export|\\}).*\\sfrom\\s.+;\\s*$|import\\(.+' +
  '|class\\s.+implements\\s.+|class\\s.+extends\\s.+' +
  "|interface\\s.+extends\\s.+|\\s*[a-zA-Z0-9\\/\\-'@,]+\\/[a-zA-Z0-9\\/\\-'@,]+$" +
  "|^.{0,100}\\{' '\\}$";

/** @type {import('eslint').Linter.Config[]} */
export default [
  {
    plugins: {
      '@stylistic': stylisticPlugin,
    },
    rules: {
      '@stylistic/function-call-argument-newline': ['error', 'consistent'],
      '@stylistic/jsx-curly-brace-presence': [1, { children: 'never', props: 'never' }],
      '@stylistic/jsx-max-props-per-line': 'off',
      '@stylistic/jsx-newline': [1, { prevent: true }],
      '@stylistic/jsx-pascal-case': ['error', { ignore: JsxPascalCaseIgnore }],
      '@stylistic/jsx-wrap-multilines': 'off',
      '@stylistic/line-comment-position': ['error', { position: 'above' }],
      '@stylistic/lines-between-class-members': [
        'error',
        {
          enforce: [
            { blankLine: 'always', next: 'method', prev: '*' },
            { blankLine: 'never', next: 'field', prev: 'field' },
          ],
        },
      ],
      '@stylistic/max-len': [
        'error',
        {
          code: 100,
          comments: 100,
          ignorePattern: IgnoreMaxLengthRegexPattern,
          ignoreRegExpLiterals: true,
          ignoreTemplateLiterals: false,
          ignoreUrls: true,
          tabWidth: 2,
        },
      ],
      '@stylistic/multiline-comment-style': ['error', 'bare-block'],
      '@stylistic/no-extra-semi': 'error',
      '@stylistic/no-mixed-spaces-and-tabs': 'error',
      '@stylistic/no-multi-spaces': 'error',
      '@stylistic/no-tabs': 'error',
      '@stylistic/object-curly-spacing': [1, 'always'],
      '@stylistic/object-property-newline': ['error', { allowAllPropertiesOnSameLine: true }],
      '@stylistic/quotes': [1, 'single', { avoidEscape: true }],
      '@stylistic/semi': [1, 'always'],
      '@stylistic/semi-spacing': ['error', { after: true, before: false }],
      '@stylistic/spaced-comment': [
        'error',
        'always',
        {
          block: {
            balanced: true,
            exceptions: ['*', '-', '~'],
            markers: ['!'],
          },
          line: {
            exceptions: ['*', '-', '~'],
            markers: ['/'],
          },
        },
      ],
    },
  },
  {
    files: ['**/*.yml', '**/*.yaml'],
    rules: {
      '@stylistic/max-len': 'off',
      '@stylistic/spaced-comment': 'off',
    },
  },
];
